const Procedure = require('../models/procedure');
const moment = require('moment');

exports.createProcedure = async (req, res) => {
  try {
    const procedure = new Procedure(req.body);
    await procedure.save();
    res.status(201).json(procedure);
  } catch (err) {
    console.error('Procedure creation error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProcedures = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;
    let filter = {};
    if (search) {
      const numericSearch = !isNaN(search) ? Number(search) : null;
      filter = {
        $or: [
          { patientName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          ...(numericSearch !== null ? [{ procedureNumber: numericSearch }] : []),
        ],
      };
    }
    const total = await Procedure.countDocuments(filter);
    const procedures = await Procedure.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ procedures, pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }});
  } catch (err) {
    console.error('Get all procedures error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.markStentRemoved = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Procedure.findByIdAndUpdate(
      id,
      { stentRemoved: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Procedure not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update procedure
exports.updateProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Procedure.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Procedure not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Dashboard metrics for procedures
exports.getProcedureDashboard = async (req, res) => {
  try {
    const { period } = req.query; // 'daily' or 'monthly'
    let start, end;
    if (period === 'monthly') {
      start = moment().startOf('month');
      end = moment().endOf('month');
    } else {
      start = moment().startOf('day');
      end = moment().endOf('day');
    }
    
    // Get data for the specified period
    const filter = { 
      $or: [
        { dateOfRemoval: { $gte: start.toDate(), $lte: end.toDate() } },
        { dateOfImplantSutures: { $gte: start.toDate(), $lte: end.toDate() } }
      ]
    };
    const procedures = await Procedure.find(filter);
    
    // Get data for the last 7 days for trend analysis
    const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');
    const last7DaysProcedures = await Procedure.find({ 
      $or: [
        { dateOfRemoval: { $gte: sevenDaysAgo.toDate(), $lte: moment().endOf('day').toDate() } },
        { dateOfImplantSutures: { $gte: sevenDaysAgo.toDate(), $lte: moment().endOf('day').toDate() } }
      ]
    });
    
    // Generate trend data for last 7 days
    const trendData = [];
    const trendCategories = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dayStart = date.clone().startOf('day');
      const dayEnd = date.clone().endOf('day');
      
      const dayProcedures = last7DaysProcedures.filter(proc => {
        const removalDate = proc.dateOfRemoval ? moment(proc.dateOfRemoval) : null;
        const implantDate = proc.dateOfImplantSutures ? moment(proc.dateOfImplantSutures) : null;
        
        return (removalDate && removalDate.isBetween(dayStart, dayEnd, null, '[]')) ||
               (implantDate && implantDate.isBetween(dayStart, dayEnd, null, '[]'));
      });
      
      trendData.push(dayProcedures.length);
      trendCategories.push(date.format('MMM DD'));
    }
    
    // Metrics
    const implantsThisMonth = procedures.filter(p => p.implantOrRemoval === 'Implant');
    const implantsRemovedThisMonth = implantsThisMonth.filter(p => p.stentRemoved === true).length;
    const implantsNotRemovedThisMonth = implantsThisMonth.filter(p => p.stentRemoved !== true).length;
    const today = moment().startOf('day');
    const implantsRemovedToday = implantsThisMonth.filter(p => p.stentRemoved === true && p.dateOfRemoval && moment(p.dateOfRemoval).isSame(today, 'day')).length;
    const metrics = {
      totalProcedures: procedures.length,
      implants: procedures.filter(p => p.implantOrRemoval === 'Implant').length,
      removals: procedures.filter(p => p.implantOrRemoval === 'Removal').length,
      djStentRemoval: procedures.filter(p => p.procedureType === 'DJ Stent Removal').length,
      dressingRemoval: procedures.filter(p => p.procedureType === 'Dressing Removal').length,
      suturesRemoval: procedures.filter(p => p.procedureType === 'Sutures Removal').length,
      stentRemoved: procedures.filter(p => p.stentRemoved === true).length,
      stentPending: procedures.filter(p => p.procedureType === 'DJ Stent Removal' && p.stentRemoved !== true).length,
      // New metrics for dashboard
      implantsRemovedThisMonth,
      implantsNotRemovedThisMonth,
      implantsRemovedToday,
      // Trend data
      trendData: trendData,
      trendCategories: trendCategories,
    };
    
    res.json({ metrics, procedures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 