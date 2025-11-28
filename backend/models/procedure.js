const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  phoneNumber: { type: String },
  implantOrRemoval: { type: String, required: true },
  implantDetails: { type: String },
  dateOfRemoval: { type: Date },
  dateOfImplantSutures: { type: Date },
  patientUid: { type: String, required: true },
  procedureNumber: { type: Number, required: true, unique: true },
  procedureType: { type: String },
  stentRemoved: { type: Boolean },
}, { timestamps: true });

// Auto-increment procedureNumber
procedureSchema.pre('validate', async function(next) {
  if (this.isNew && !this.procedureNumber) {
    const last = await mongoose.model('Procedure').findOne({}, {}, { sort: { procedureNumber: -1 } });
    this.procedureNumber = last ? last.procedureNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Procedure', procedureSchema); 