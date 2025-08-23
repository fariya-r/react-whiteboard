const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../firebaseAdmin");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const router = express.Router();

// 🔹 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Multer storage -> Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    resource_type: "auto", // images, pdfs, videos sab allow
  },
});

const upload = multer({ storage });

// 🔹 Upload file (save to Cloudinary + Firestore)
router.post("/upload", upload.single("file"), async (req, res) => {
  const userId = req.body.user_id;

  if (!req.file || !userId) {
    return res.status(400).json({ message: "File or user_id missing" });
  }

  const fileRecord = {
    id: uuidv4(),
    filename: req.file.originalname,
    url: req.file.path, // Cloudinary se aayi URL
    uploadedAt: new Date().toISOString(),
    userId,
  };

  try {
    await db.collection("files").doc(fileRecord.id).set(fileRecord);
    res.status(200).json(fileRecord);
  } catch (err) {
    console.error("❌ Firestore save error:", err);
    res.status(500).json({ message: "Failed to save file info" });
  }
});

// 🔹 Get files by user ID
router.get("/files", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ message: "user_id is required" });

  try {
    const snapshot = await db
      .collection("files")
      .where("userId", "==", user_id)
      .get();

    const files = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(files);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

// 🔹 Delete file
router.delete("/files/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const fileDoc = db.collection("files").doc(id);
    const fileData = (await fileDoc.get()).data();

    if (!fileData) return res.status(404).json({ message: "File not found" });

    await fileDoc.delete();

    // Cloudinary se delete karo
    const publicId = fileData.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`uploads/${publicId}`);

    res.status(200).json({ message: "File deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;



















// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');
// const { db } = require('../firebaseAdmin');

// const router = express.Router();

// // Storage config for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // where to save
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${uuidv4()}_${file.originalname}`;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });

// // 🔹 Upload file
// router.post('/upload', upload.single('file'), async (req, res) => {
//   const userId = req.body.user_id;

//   if (!req.file || !userId) {
//     return res.status(400).json({ message: 'File or user_id missing' });
//   }

//   const fileRecord = {
//     id: uuidv4(),
//     filename: req.file.originalname,
//     path: req.file.filename,
//     uploadedAt: new Date().toISOString(),
//     userId
//   };

//   try {
//     await db.collection('files').doc(fileRecord.id).set(fileRecord);
//     res.status(200).json(fileRecord);
//   } catch (err) {
//     console.error('❌ Firestore save error:', err);
//     res.status(500).json({ message: 'Failed to save file info' });
//   }
// });

// // 🔹 Get files by user ID
// router.get('/files', async (req, res) => {
//   const { user_id } = req.query;
//   if (!user_id) return res.status(400).json({ message: 'user_id is required' });

//   try {
//     const snapshot = await db.collection('files').where('userId', '==', user_id).get();
//     const files = snapshot.docs.map(doc => doc.data());
//     res.status(200).json(files);
//   } catch (err) {
//     console.error('❌ Fetch error:', err);
//     res.status(500).json({ message: 'Failed to fetch files' });
//   }
// });

// // 🔹 Delete file
// router.delete('/files/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const fileDoc = db.collection('files').doc(id);
//     const fileData = (await fileDoc.get()).data();

//     if (!fileData) return res.status(404).json({ message: 'File not found' });

//     await fileDoc.delete();

//     // Optional: remove from disk
//     const fs = require('fs');
//     const filePath = path.join(__dirname, '../uploads', fileData.path);
//     fs.unlink(filePath, (err) => {
//       if (err) console.warn('⚠️ Could not delete file from disk:', err.message);
//     });

//     res.status(200).json({ message: 'File deleted' });
//   } catch (err) {
//     console.error('❌ Delete error:', err);
//     res.status(500).json({ message: 'Failed to delete file' });
//   }
// });

// module.exports = router;





