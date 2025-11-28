const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { transcribeAudio, formatPrescription } = require("../controllers/voiceRx.controller");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/voiceRx");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();
const upload = multer({ dest: uploadDir });


router.post("/transcribe", upload.single("audio"), transcribeAudio, formatPrescription);


module.exports = router;