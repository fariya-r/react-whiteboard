// routes/cloudinaryUpload.js
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    resource_type: "auto",
  },
});

const uploadCloud = multer({ storage: cloudStorage });

router.post("/upload-file-cloud", uploadCloud.single("file"), (req, res) => {
  res.json({ url: req.file.path });
});

module.exports = router;
