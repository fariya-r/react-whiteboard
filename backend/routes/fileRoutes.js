// fileRoutes.js
const express = require("express");
const multer = require("multer");
const { supabase } = require("./supabaseClient");

const router = express.Router();
const upload = multer();

// 📌 Upload Route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
  .from("user-files")
  .upload(fileName, file.buffer, {
    contentType: file.mimetype || "application/octet-stream", // fallback
    upsert: false,
  });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicData } = supabase.storage
      .from("user-files")
      .getPublicUrl(fileName);

    res.json({
      message: "Uploaded successfully",
      url: publicData.publicUrl,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// fileRoutes.js
router.get("/files", async (req, res) => {
  try {
    const { data, error } = await supabase.storage.from("user-files").list("", {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error) return res.status(500).json({ error: error.message });

    const files = data.map(file => {
      const { data: urlData } = supabase.storage
        .from("user-files")
        .getPublicUrl(file.name);

      return {
        filename: file.name,
        url: urlData.publicUrl, // ✅ fix
        updatedAt: file.updated_at,
      };
    });

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
});


// 📌 Delete File Route
router.delete("/files/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;

    const { error } = await supabase.storage
      .from("user-files")
      .remove([fileName]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
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





