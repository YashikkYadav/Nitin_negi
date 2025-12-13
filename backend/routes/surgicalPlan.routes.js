const express = require("express");
const router = express.Router();
const {
  createSurgicalPlan,
  getSurgicalPlanByIpdId,
  updateSurgicalPlan,
  getAllSurgicalPlans,
} = require("../controllers/surgicalPlan.controller.js");

router.post("/", createSurgicalPlan);
router.get("/:ipdRecordId", getSurgicalPlanByIpdId);
router.put("/:ipdRecordId", updateSurgicalPlan);
router.get("/", getAllSurgicalPlans);

module.exports = router;
