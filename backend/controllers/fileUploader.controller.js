const invoiceService = require('../services/invoice.service');
const { fileUploader, uploadPatientRecords } = require('../utils/fileUploader');
const FileUploader = require('../models/fileUploader');
const Prescription = require('../models/prescription');
const Invoice = require('../models/invoice'); // Added Invoice model
const fs = require('fs');
const path = require('path');

const uploadFile = async (req, res) => {
  fileUploader(req, res);
  // uploadPatientRecords(req, res);
}

const getFilesByPatientId = async (req, res) => {
  try {
    const { patientId, type } = req.params;

    let data = {};
    if (
      type === 'health'
      || type === 'ipd'
    ) {
      data = await FileUploader.find({
        patientId,
        type,
      }).sort({ updatedAt: -1 });
    } else if (type === 'prescription') {
      data = await Prescription.find({
        patientId,
      }).sort({ updatedAt: -1 });
    } else if (type === 'invoice') { // Added invoice type handling
      // For invoice files, we'll look for files with type 'invoice' in FileUploader collection
      data = await FileUploader.find({
        patientId,
        type: 'invoice',
      }).sort({ updatedAt: -1 });
    }

    res
      .status(200)
      .json({
        files: data,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

// Add delete file method
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Find the file in the database
    const fileRecord = await FileUploader.findById(fileId);
    
    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Get the file path
    const filePath = fileRecord.fileUrl.replace(`${process.env.SERVER_URL}/`, '');
    const fullPath = path.join(__dirname, '../', filePath);
    
    // Delete the file from the filesystem
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    // Delete the record from the database
    await FileUploader.findByIdAndDelete(fileId);
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch(error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: `Error deleting file: ${error.message}` });
  }
}

module.exports = {
  uploadFile,
  getFilesByPatientId,
  deleteFile, // Export the new delete method
};