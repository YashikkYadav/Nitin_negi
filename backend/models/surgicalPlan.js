const mongoose = require('mongoose')

const SurgicalPlanSchema = new mongoose.Schema({
  ipdRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "IPD", required: true },
  surgeryPerformed: String,
  instrumentsUsed: [String],
  instrumentSettings: String,
  implantsUsed: [String],
  findings: String,
  specificFinding: String,
  intraoperativeIssues: String,
  postoperativeCare: String,
  postoperativeCourse: String,
  // Add new fields for results and patient complaints
  results: [String],
  patientComplaints: [String],
}, { timestamps: true });

module.exports = mongoose.model("SurgicalPlan", SurgicalPlanSchema);
