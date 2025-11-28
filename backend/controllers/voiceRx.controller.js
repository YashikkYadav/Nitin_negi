const fs = require("fs");
const VoiceRxService = require("../services/voiceRx.service");


const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.json({ status: "error", message: "Audio file is required" });
    }

    const transcription = await VoiceRxService.transcribeAudio(
      req.file.path,
      req.file.mimetype
    );

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    req.body.transcription = transcription;
    next();
  } catch (err) {
    console.error("VoiceRX Error:", err);
    return res.json({ status: "error", message: err.message });
  }
};

const formatPrescription = async (req, res) => {
  try {
    const { transcription } = req.body;
    if (!transcription) {
      return res.json({ status: "error", message: "Transcription is required" });
    }
    const formattedPrescription = await VoiceRxService.formatPrescription(transcription);
    // console.log("Formatted Prescription:", formattedPrescription);
    return res.json({ status: "success", message: "Prescription formatted", prescription: formattedPrescription });
  } catch (err) {
    console.error("Prescription Formatting Error:", err);
    return res.json({ status: "error", message: err.message });
  }
};

module.exports = { transcribeAudio, formatPrescription };