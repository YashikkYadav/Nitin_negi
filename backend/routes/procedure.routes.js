const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedure.controller');

router.post('/procedures', procedureController.createProcedure);
router.get('/procedures', procedureController.getAllProcedures);
router.get('/procedures/dashboard', procedureController.getProcedureDashboard);
router.put('/procedures/:id', procedureController.updateProcedure);
// Update stentRemoved for a procedure
router.patch('/procedures/:id/stent-removed', procedureController.markStentRemoved);

module.exports = router; 