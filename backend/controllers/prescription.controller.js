const prescriptionService = require('../services/prescription.service');

const createPrescription = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const { doctorId, patientId } = req.params;

    const prescription = await prescriptionService.createPrescription(doctorId, patientId, prescriptionData);

    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription.prescription,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const endConsultationOfPrescription = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const { doctorId, patientId } = req.params;

    const prescription = await prescriptionService.endConsultationOfPrescription(doctorId, patientId, prescriptionData);

    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription?.prescription,
        pdfPath: prescription?.pdfPath,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const prescriptions = await prescriptionService.getPrescriptionsByPatientId(doctorId, patientId);

    res
      .status(prescriptions.statusCode)
      .json({
        prescriptions: prescriptions.prescriptions,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getDraftPrescriptionOfPatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;
    console.log("Getting draft prescription for doctorId:", doctorId, "patientId:", patientId);

    const prescription = await prescriptionService.getDraftPrescriptionOfPatient(doctorId, patientId);
    // console.log("Draft prescription service response:", prescription);

    // Handle 404 case (no draft prescription found)
    if (prescription.statusCode === 404) {
      return res
        .status(200)
        .json({
          message: prescription.message,
        });
    }

    // Handle error cases
    if (prescription.statusCode >= 400) {
      return res
        .status(prescription.statusCode)
        .json({
          error: prescription.error || prescription.message,
        });
    }

    // Success case
    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription.prescription,
      });
  } catch(error) {
    console.error("Error in getDraftPrescriptionOfPatient controller:", error);
    res
      .status(500)
      .json({
        error: error.message || 'Internal server error',
      });
  }
}

module.exports = {
  createPrescription,
  endConsultationOfPrescription,
  getPrescriptionsByPatientId,
  getDraftPrescriptionOfPatient,
};
