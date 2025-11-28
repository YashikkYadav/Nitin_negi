const IPD = require('../models/ipd');
const moment = require('moment');

// Create
const createIPD = async (data) => {
  try {
    const ipd = new IPD(data);
    await ipd.save();
    return { statusCode: 201, ipd };
  } catch (error) {
    return { statusCode: 500, error: error.message || error };
  }
};

// List + dashboard metrics
const getIPDAndDashboard = async (query) => {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const total = await IPD.countDocuments();
    const ipds = await IPD.find()
      .sort({ dateOfAdmission: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId');

    // Period selection
    const { period } = query;
    let start, end;
    if (period === 'monthly') {
      start = moment().startOf('month');
      end = moment().endOf('month');
    } else {
      start = moment().startOf('day');
      end = moment().endOf('day');
    }

    const filter = { dateOfAdmission: { $gte: start.toDate(), $lte: end.toDate() } };
    const ipdsForPeriod = await IPD.find(filter).populate('patientId');

    // Last 7 days trend
    const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');
    const last7DaysIPDs = await IPD.find({
      dateOfAdmission: { $gte: sevenDaysAgo.toDate(), $lte: moment().endOf('day').toDate() }
    }).populate('patientId');

    const trendData = [];
    const trendCategories = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dayStart = date.clone().startOf('day');
      const dayEnd = date.clone().endOf('day');
      const dayIPDs = last7DaysIPDs.filter(ipd => {
        const admissionDate = moment(ipd.dateOfAdmission);
        return admissionDate.isBetween(dayStart, dayEnd, null, '[]');
      });
      trendData.push(dayIPDs.length);
      trendCategories.push(date.format('MMM DD'));
    }

    const metrics = {
      totalAdmitted: ipdsForPeriod.length,
      preop: ipdsForPeriod.filter(i => i.category === 'Preop').length,
      postop: ipdsForPeriod.filter(i => i.category === 'Postop').length,
      conservative: ipdsForPeriod.filter(i => i.category === 'Conservative').length,
      cash: ipdsForPeriod.filter(i => i.paymentMethod === 'Cash').length,
      tpa: ipdsForPeriod.filter(i => i.paymentMethod === 'TPA').length,
      rghs: ipdsForPeriod.filter(i => i.paymentMethod === 'RGHS').length,
      cghs: ipdsForPeriod.filter(i => i.paymentMethod === 'CGHS').length,
      totalOperative: ipdsForPeriod.filter(i => i.operativeStatus).length,
      totalConservative: ipdsForPeriod.filter(i => i.category === 'Conservative').length,
      totalPayment: ipdsForPeriod.reduce((sum, i) => sum + (i.paymentAmount || 0), 0),
      totalDonation: ipdsForPeriod.reduce((sum, i) => sum + (i.donationAmount || 0), 0),
      trendData,
      trendCategories,
      averagePayment: ipdsForPeriod.length > 0
        ? ipdsForPeriod.reduce((sum, i) => sum + (i.paymentAmount || 0), 0) / ipdsForPeriod.length
        : 0,
      averageDonation: ipdsForPeriod.length > 0
        ? ipdsForPeriod.reduce((sum, i) => sum + (i.donationAmount || 0), 0) / ipdsForPeriod.length
        : 0,
    };

    return {
      statusCode: 200,
      ipds,
      metrics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    return { statusCode: 500, error: error.message || error };
  }
};

// Get by id
const getIPDById = async (id) => {
  try {
    const ipd = await IPD.findById(id).populate('patientId');
    if (!ipd) return { statusCode: 404, error: 'IPD entry not found' };
    return { statusCode: 200, ipd };
  } catch (error) {
    return { statusCode: 500, error: error.message || error };
  }
};

// Update
const updateIPD = async (id, data) => {
  try {
    const ipd = await IPD.findByIdAndUpdate(id, data, { new: true }).populate('patientId');
    if (!ipd) return { statusCode: 404, error: 'IPD entry not found' };
    return { statusCode: 200, ipd };
  } catch (error) {
    return { statusCode: 500, error: error.message || error };
  }
};

// Delete
const deleteIPD = async (id) => {
  try {
    const ipd = await IPD.findByIdAndDelete(id);
    if (!ipd) return { statusCode: 404, error: 'IPD entry not found' };
    return { statusCode: 200, message: 'IPD entry deleted' };
  } catch (error) {
    return { statusCode: 500, error: error.message || error };
  }
};

module.exports = {
  createIPD,
  getIPDAndDashboard,
  getIPDById,
  updateIPD,
  deleteIPD
};