const patientService = require("../services/patient.service");

const registerPatient = async (req, res) => {
  try {
    const patientData = req.body;
    const { doctorId } = req.params;

    const patient = await patientService.registerPatient(patientData, doctorId);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(patient.statusCode).json({
      patient: patient.patient,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const generateOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const patient = await patientService.generateOTP(phoneNumber);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(patient.statusCode).json({
      patient: patient.patient,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const validateOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const patient = await patientService.validateOTP(phoneNumber, otp);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(patient.statusCode).json({
      patient: patient.patient,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    // console.log("Patient ID from request params:", patientId); // Add logging

    const patient = await patientService.getPatientById(patientId);
    // console.log("Patient service response:", patient);

    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(patient.statusCode).json({
      patient: patient.patient,
    });
  } catch (error) {
    console.error("Error in getPatientById controller:", error); // Add logging
    res.status(500).send(`Error: ${error}`);
  }
};

const getAllPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page, limit, searchQuery } = req.query;

    const patients = await patientService.getAllPatients(
      doctorId,
      page,
      limit,
      searchQuery
    );

    res.status(patients.statusCode).json({
      patient: patients.patients,
      pagination: patients.pagination,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const getAllPatientsMaster = async (req, res) => {
  try {
    const { page = 1, limit = 25, searchQuery = "" } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 25;
    const skip = (pageNumber - 1) * limitNumber;

    let searchFilter = {};
    if (searchQuery) {
      const numericSearch = !isNaN(searchQuery) ? Number(searchQuery) : null;
      searchFilter = {
        $or: [
          { fullName: { $regex: searchQuery, $options: "i" } },
          { uid: { $regex: searchQuery, $options: "i" } },
          ...(numericSearch !== null ? [{ phoneNumber: numericSearch }] : []),
        ],
      };
    }

    const totalPatients = await require("../models/patient").countDocuments(
      searchFilter
    );
    const patients = await require("../models/patient")
      .find(searchFilter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      patient: patients,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalPatients / limitNumber),
        totalPatients,
        pageSize: limitNumber,
        hasNextPage: pageNumber * limitNumber < totalPatients,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patientData = req.body;

    const patient = await patientService.updatePatient(patientId, patientData);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(patient.statusCode).json({
      patient: patient.patient,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

const deletePatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const patient = await patientService.deletePatient(doctorId, patientId);
    if (patient?.error) {
      return res.status(patient.statusCode).send(patient.error);
    }

    res.status(204).json({
      message: `Patient deleted successfully`,
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
};

module.exports = {
  registerPatient,
  generateOTP,
  validateOTP,
  getPatientById,
  getAllPatients,
  getAllPatientsMaster,
  updatePatient,
  deletePatient,
};
