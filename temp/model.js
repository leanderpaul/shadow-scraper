const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  novel: {
    type: String,
    required: true,
    trim: true
  },
  index: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  data: {
    type: String,
    required: true,
    minlength: 1000,
    trim: true
  }
});

dataSchema.index({ url: 1 }, { unique: true, name: 'UNIQUE_URL' });

module.exports = mongoose.model('noveldata', dataSchema);
