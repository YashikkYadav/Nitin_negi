const express = require('express');
const router = express.Router();
const ipdController = require('../controllers/ipd.controller');

router.post('/', ipdController.createIPD);
router.get('/', ipdController.getIPDAndDashboard);
router.get('/dashboard', ipdController.getIPDAndDashboard); // backward compatibility
router.get('/:id', ipdController.getIPDById);
router.put('/:id', ipdController.updateIPD);
router.delete('/:id', ipdController.deleteIPD);

module.exports = router; 