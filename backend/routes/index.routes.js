const express = require("express");

const doctorRoutes = require("./doctor.routes");
const patientRoutes = require("./patient.routes");
const invoiceRoutes = require("./invoice.routes");
const libraryRoutes = require("./library.routes");
const dashboardRoutes = require("./dashboard.routes");
const fileUploader = require("./fileUploader.routes");
const appointmentRoutes = require("./appointment.routes");
const prescriptionRoutes = require("./prescription.routes");
const medicineLibraryRoutes = require("./medicineLibrary.routes");
const templateLibraryRoutes = require("./templateLibrary.routes");
const dropdownLibraryRoutes = require("./dropdownLibrary.routes");
const doctorProfileRoutes = require("../routes/doctorProfile.routes");
const patientAppointmentRoutes = require("../routes/patientAppointment.routes");
const prescriptionSectionRoutes = require("../routes/prescriptionSection.routes");
const surgicalPlanRoutes = require("./surgicalPlan.routes");
const authMiddleware = require("../middlewares/auth.middleware");
const ipdRoutes = require("./ipd.routes");
const tentativeSurgeryRoutes = require("./tentativeSurgery.routes");
const procedureRoutes = require("./procedure.routes");
const userRoutes = require("./user.routes");
const chatBotRoutes = require("./chatBot.routes");

// Voice Rx route
const voiceRxRoutes = require("./voiceRx.routes");

const router = express.Router();

// Centralizing all the routes in one file
router.use("/doctor", doctorRoutes);

router.use("/:doctorId/doctor-profile", authMiddleware, doctorProfileRoutes);

router.use("/:doctorId/patient", patientAppointmentRoutes);

router.use("/appointment", appointmentRoutes);

router.use("/patient", patientRoutes);

router.use("/:doctorId/report", authMiddleware, dashboardRoutes);

router.use("/:doctorId/invoice", authMiddleware, invoiceRoutes);

router.use(
  "/:doctorId/prescription/:patientId",
  authMiddleware,
  prescriptionRoutes
);

router.use("/:patientId/file", fileUploader);

router.use("/:doctorId/medicine", authMiddleware, medicineLibraryRoutes);

router.use("/:doctorId/template", authMiddleware, templateLibraryRoutes);

router.use("/library", libraryRoutes);

router.use("/:doctorId/dropdown", authMiddleware, dropdownLibraryRoutes);

router.use(
  "/:doctorId/prescription-section",
  authMiddleware,
  prescriptionSectionRoutes
);

router.use("/ipd", ipdRoutes);

router.use("/surgical-plan", surgicalPlanRoutes);

router.use("/tentative-surgeries", authMiddleware, tentativeSurgeryRoutes);

router.use(procedureRoutes);

router.use("/user", userRoutes);

router.use("/voiceRx", voiceRxRoutes);

router.use("/chatbot", authMiddleware, chatBotRoutes);

module.exports = router;
