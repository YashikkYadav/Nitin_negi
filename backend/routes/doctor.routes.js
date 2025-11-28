const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const doctor = express.Router({ mergeParams: true });

doctor.post(
  '/',
  doctorController.registerDoctor,
);

doctor.post(
  '/access-token',
  doctorController.loginDoctor,
);

doctor.get(
  '/:doctorId',
  authMiddleware,
  doctorController.getDoctor,
);

doctor.delete(
  '/:doctorId',
  authMiddleware,
  doctorController.deleteDoctor,
);

module.exports = doctor;
