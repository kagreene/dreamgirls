import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  reviewType: {
    type: String,
    required: true,
    enum: ['harassment', 'theft', 'assault', 'unsafe_environment', 'other'],
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a geospatial index on the location field
reviewSchema.index({ location: '2dsphere' });

const Review = mongoose.model('Review', reviewSchema);

export default Review;