const express = require("express");
const multer = require("multer");
const { supabase } = require("./supabaseClient");

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.user_id;

    if (!file || !userId) {
      return res.status(400).json({ error: "No file or user ID uploaded" });
    }

    const filePath = `${userId}/${Date.now()}-${file.filename}`;

    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // ✅ Public URL generate
    const { data: publicData } = supabase.storage
      .from("user-files")
      .getPublicUrl(filePath);

      return res.json({
        message: "Uploaded successfully",
        url: publicData.publicUrl,  
        filePath,                   
        filename: file.filename, // ✅ user’s actual filename
        mimeType: file.mimetype,         // ✅ file type for preview logic
      });
      
      
  } catch (err) {
    console.error("❌ Upload API error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});


router.delete("/files/:filePath", async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath); // 👈 fix

    if (!filePath) {
      return res.status(400).json({ error: "File path not provided" });
    }

    const { error: storageError } = await supabase.storage
      .from("user-files")
      .remove([filePath]);

    if (storageError) {
      return res.status(500).json({ error: storageError.message });
    }

    return res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("❌ Delete API error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
