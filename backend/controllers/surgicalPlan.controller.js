const SurgicalPlan = require("../models/surgicalPlan.js");

// Create Surgical Plan
const createSurgicalPlan = async (req, res) => {
  try {
    const surgicalPlan = new SurgicalPlan(req.body);
    await surgicalPlan.save();
    res.status(201).json({
      success: true,
      message: "Surgical plan created successfully",
      data: surgicalPlan,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Surgical Plan by IPD Record ID
const getSurgicalPlanByIpdId = async (req, res) => {
  try {
    const { ipdRecordId } = req.params;
    const surgicalPlan = await SurgicalPlan.findOne({ ipdRecordId });

    if (!surgicalPlan) {
      return res.status(200).json({
        success: false,
        message: "Surgical plan not found for this IPD record",
      });
    }

    res.status(200).json({
      success: true,
      message: "Surgical plan fetched successfully",
      data: surgicalPlan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Surgical Plan by IPD Record ID
const updateSurgicalPlan = async (req, res) => {
  try {
    const { ipdRecordId } = req.params;
    const updatedPlan = await SurgicalPlan.findOneAndUpdate(
      { ipdRecordId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: "Surgical plan not found for this IPD record",
      });
    }

    res.status(200).json({
      success: true,
      message: "Surgical plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all Surgical Plans (optional)
const getAllSurgicalPlans = async (req, res) => {
  try {
    const surgicalPlans = await SurgicalPlan.find().populate("ipdRecordId");
    res.status(200).json({
      success: true,
      message: "Surgical plans fetched successfully",
      data: surgicalPlans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSurgicalPlan,
  getSurgicalPlanByIpdId,
  updateSurgicalPlan,
  getAllSurgicalPlans,
};
