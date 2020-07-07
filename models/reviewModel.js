// review / rating / createdAt / ref to band / ref to user
const mongoose = require('mongoose');
const Band = require('./bandModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    band: {
      type: mongoose.Schema.ObjectId,
      ref: 'Band',
      required: [true, 'Review must belong to a band.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// prevent duplicate reviews
reviewSchema.index({ band: 1, user: 1 }, { unique: true });

// populate reviews in a band 
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// Calculate average rating for a certain band (Static Method)
reviewSchema.statics.calcAverageRatings = async function(bandId) {
  const stats = await this.aggregate([
    {
      $match: { band: bandId }
    },
    {
      $group: {
        _id: '$band',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  // Save Changes to the Band Document
  if (stats.length > 0) {
    await Bnad.findByIdAndUpdate(bandId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Band.findByIdAndUpdate(bandId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Call The calcAverageRatings Function when add a new rating
reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.band); // Call Static method in the constructor
});

// 
// findByIdAndDelete & findByIdAndUpdate
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rev = await this.findOne();
  // console.log(this.rev);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // "await this.findOne();" does NOT work here, query has already executed
  await this.rev.constructor.calcAverageRatings(this.r.band); // Call Static method in the constructor
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
