const {
  createTentativeSurgery,
  getTentativeSurgeryById,
  updateTentativeSurgery,
  getAllTentativeSurgeries,
  getTentativeSurgeriesByPatientId,
} = require("../services/tentativeSurgery.service.js");

// Create Tentative Surgery
const createTentativeSurgeryController = async (req, res) => {
  try {
    const result = await createTentativeSurgery(req.body);

    if (result.statusCode >= 400) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error,
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: "Tentative surgery created successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tentative Surgery by ID
const getTentativeSurgeryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTentativeSurgeryById(id);

    if (result.statusCode >= 400) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error,
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: "Tentative surgery fetched successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Tentative Surgery by ID
const updateTentativeSurgeryController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateTentativeSurgery(id, req.body);

    if (result.statusCode >= 400) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error,
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: "Tentative surgery updated successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Tentative Surgeries
const getAllTentativeSurgeriesController = async (req, res) => {
  try {
    const result = await getAllTentativeSurgeries();

    if (result.statusCode >= 400) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error,
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: "Tentative surgeries fetched successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Tentative Surgeries by Patient ID
const getTentativeSurgeriesByPatientIdController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await getTentativeSurgeriesByPatientId(patientId);

    if (result.statusCode >= 400) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.error,
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: "Tentative surgeries fetched successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTentativeSurgery: createTentativeSurgeryController,
  getTentativeSurgeryById: getTentativeSurgeryByIdController,
  updateTentativeSurgery: updateTentativeSurgeryController,
  getAllTentativeSurgeries: getAllTentativeSurgeriesController,
  getTentativeSurgeriesByPatientId: getTentativeSurgeriesByPatientIdController,
};
