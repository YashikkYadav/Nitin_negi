const ipdService = require('../services/ipd.service');

// Create new IPD entry
exports.createIPD = async (req, res) => {
  const result = await ipdService.createIPD(req.body);
  if (result.error) return res.status(result.statusCode).json({ error: result.error });
  return res.status(result.statusCode).json({ ipd: result.ipd });
};

// Merged: Get all IPD entries and dashboard metrics
exports.getIPDAndDashboard = async (req, res) => {
  const result = await ipdService.getIPDAndDashboard(req.query);
  if (result.error) return res.status(result.statusCode).json({ error: result.error });
  // Preserve original shape
  return res.status(result.statusCode).json({
    ipds: result.ipds,
    metrics: result.metrics,
    pagination: result.pagination
  });
};

// Get single IPD entry
exports.getIPDById = async (req, res) => {
  const result = await ipdService.getIPDById(req.params.id);
  if (result.error) return res.status(result.statusCode).json({ error: result.error });
  return res.status(result.statusCode).json({ ipd: result.ipd });
};

// Update IPD entry
exports.updateIPD = async (req, res) => {
  const result = await ipdService.updateIPD(req.params.id, req.body);
  if (result.error) return res.status(result.statusCode).json({ error: result.error });
  return res.status(result.statusCode).json({ ipd: result.ipd });
};

// Delete IPD entry
exports.deleteIPD = async (req, res) => {
  const result = await ipdService.deleteIPD(req.params.id);
  if (result.error) return res.status(result.statusCode).json({ error: result.error });
  return res.status(result.statusCode).json({ message: result.message });
};