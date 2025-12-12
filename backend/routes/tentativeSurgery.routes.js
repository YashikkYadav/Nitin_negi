const express = require("express");
const router = express.Router();
const {
  createTentativeSurgery,
  getTentativeSurgeryById,
  updateTentativeSurgery,
  getAllTentativeSurgeries,
  getTentativeSurgeriesByPatientId,
} = require("../controllers/tentativeSurgery.controller.js");

router.post("/", createTentativeSurgery);
router.get("/:id", getTentativeSurgeryById);
router.put("/:id", updateTentativeSurgery);
router.get("/", getAllTentativeSurgeries);
router.get("/patient/:patientId", getTentativeSurgeriesByPatientId);

module.exports = router;
