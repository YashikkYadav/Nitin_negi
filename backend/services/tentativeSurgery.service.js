const TentativeSurgery = require("../models/tentativeSurgery");

const createTentativeSurgery = async (surgeryData) => {
  try {
    const tentativeSurgery = new TentativeSurgery(surgeryData);
    await tentativeSurgery.save();

    return {
      statusCode: 201,
      data: tentativeSurgery,
    };
  } catch (error) {
    return {
      statusCode: 400,
      error: error.message,
    };
  }
};

const getTentativeSurgeryById = async (id) => {
  try {
    const tentativeSurgery = await TentativeSurgery.findById(id).populate(
      "patientId"
    );

    if (!tentativeSurgery) {
      return {
        statusCode: 404,
        error: "Tentative surgery not found",
      };
    }

    return {
      statusCode: 200,
      data: tentativeSurgery,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const updateTentativeSurgery = async (id, surgeryData) => {
  try {
    const tentativeSurgery = await TentativeSurgery.findByIdAndUpdate(
      id,
      surgeryData,
      { new: true, runValidators: true }
    );

    if (!tentativeSurgery) {
      return {
        statusCode: 404,
        error: "Tentative surgery not found",
      };
    }

    return {
      statusCode: 200,
      data: tentativeSurgery,
    };
  } catch (error) {
    return {
      statusCode: 400,
      error: error.message,
    };
  }
};

const getAllTentativeSurgeries = async () => {
  try {
    const tentativeSurgeries = await TentativeSurgery.find().populate(
      "patientId"
    );

    return {
      statusCode: 200,
      data: tentativeSurgeries,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

const getTentativeSurgeriesByPatientId = async (patientId) => {
  try {
    const tentativeSurgeries = await TentativeSurgery.find({
      patientId,
    }).populate("patientId");

    return {
      statusCode: 200,
      data: tentativeSurgeries,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

module.exports = {
  createTentativeSurgery,
  getTentativeSurgeryById,
  updateTentativeSurgery,
  getAllTentativeSurgeries,
  getTentativeSurgeriesByPatientId,
};
