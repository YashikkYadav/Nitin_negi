const express = require('express');
const router = express.Router();
const {
  createSurgicalPlan,
  getSurgicalPlanByIpdId,
  getAllSurgicalPlans
} = require('../controllers/surgicalPlan.controller.js');

router.post("/", createSurgicalPlan);
router.get("/:ipdRecordId", getSurgicalPlanByIpdId);
router.get("/", getAllSurgicalPlans);

module.exports = router;
