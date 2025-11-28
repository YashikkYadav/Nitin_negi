const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class VoiceRxService {
  static async transcribeAudio(filePath, mimeType) {
    try {
      const audioBytes = fs.readFileSync(filePath).toString("base64");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
        // model: "gemini-2.5-flash",
        systemInstruction:
          "You are a medical transcription service. Always transcribe audio content and respond in English, regardless of the language spoken in the audio. Provide accurate transcriptions without any additional commentary.",
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: audioBytes,
                  mimeType: mimeType || "audio/mpeg",
                },
              },
              {
                text: "Transcribe this audio exactly into text in English.",
              },
            ],
          },
        ],
      });

      return result.response.text();
    } catch (err) {
      throw new Error(`Transcription failed: ${err.message}`);
    }
  }

  static async formatPrescription(text) {
    try {
      if (!text) {
        throw new Error("Transcription text is required");
      }

      const modelForText = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        // model: "gemini-2.5-flash",
        systemInstruction: `
        You are a medical transcription and clinical structuring assistant.

IMPORTANT OUTPUT RULES:
1. OUTPUT MUST BE ONLY VALID JSON.
2. NO markdown, NO backticks, NO explanation, NO notes, NO surrounding text.
3. FOLLOW THIS EXACT STRUCTURE AND KEY FORMAT:

{
 
  "bloodPressure": "",
  "pulse": "",
  "height": "",
  "weight": "",
  "temperature": "",
  "painScore": "",
  "complaints": [],
  "history": [],
  "recentInvestigation": "",
  "drugHistory": [
    {
      "name": "",
      "details": ""
    }
  ],
  "drugAllergy": [
    {
      "name": "",
      "details": ""
    }
  ],
  "antiplatlet": [
    {
      "name": "",
      "details": ""
    }
  ],
  "previousSurgery": "",
  "provisional": "",
  "physicalExamination": [],
  "investigationsAdviced": [
    {
      "name": "",
      "details": ""
    }
  ],
  "diagnosis": [
    {
      "type": "",
      "details": ""
    }
  ],
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "notes": "",
      "composition": ""
    }
  ],
  "advice": [],
  "followUp": {
    "days": "",
    "date": ""
  },
  "referredTo": [
    {
      "name": "",
      "speciality": "",
      "phoneNumber": ""
    }
  ],

  "implant": [
    {
      "name": "",
      "removalDate": ""
    }
  ],
  "surgeryAdvice": {
    "name": "",
    "date": ""
  },
  "tags": "",
  "status": "draft",
  "additionalVitals": [],
  "additionalSections": []
}

RULES:
- NEVER add new keys.
- NEVER remove keys.
- OUTPUT MUST BE 100% VALID JSON — no text before or after.
        `,
      });

      const result = await modelForText.generateContent({
        contents: [{ role: "user", parts: [{ text }] }],
      });

      let aiResponse = result.response.text();

      // Remove markdown blocks
      aiResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // If model returns any text outside {}, extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Model did not return JSON");
      }

      const cleanedJson = jsonMatch[0];

      let finalObject;
      try {
        finalObject = JSON.parse(cleanedJson);
      } catch (err) {
        throw new Error("Invalid JSON returned by AI");
      }

      return finalObject;
    } catch (err) {
      throw new Error(`Prescription formatting failed: ${err.message}`);
    }
  }
}

module.exports = VoiceRxService;
