const mongoose = require("mongoose");

const TentativeSurgerySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    dateOfSurgery: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "not seen"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TentativeSurgery", TentativeSurgerySchema);
