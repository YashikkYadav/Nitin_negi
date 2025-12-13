const mongoose = require("mongoose");

const ipdSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    dateOfAdmission: { type: Date, required: true },
    category: {
      type: String,
      enum: ["Preop", "Postop", "Conservative"],
      required: true,
    },
    operativeStatus: { type: Boolean, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "TPA", "RGHS", "CGHS"],
      required: true,
    },
    paymentAmount: { type: Number, required: true },
    donationAmount: { type: Number, default: 0 },
    diagnosis: { type: String, required: true },
    surgeon: { type: String, required: true },
    wardRoomNo: { type: String, required: true },
    referredBy: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const IPD = mongoose.model("IPD", ipdSchema);
module.exports = IPD;
