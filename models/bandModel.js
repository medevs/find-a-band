const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const bandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A band must have a name'],
      unique: true,
      trim: true,
      maxlength: [30, 'A band name must have less or equal then 30 characters'],
      minlength: [3, 'A band name must have more or equal then 3 characters']
      // validate: [validator.isAlpha, 'band name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A band must have a duration']
    },
    groupSize: {
      type: Number,
      required: [true, 'A band must have a group size']
    },
    gener: {
      type: String,
      required: [true, 'A band must have a gener'],
      enum: {
        values: ['rock', 'blues', 'jazz'],
        message: 'gener is either: rock, blues...'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A band must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A band must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A band must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretBand: {
      type: Boolean,
      default: false
    },
    playLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // bandMembers: Array
    bandMembers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'BandMembers'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// bandSchema.index({price: 1});
bandSchema.index({price: 1, ratingsAverage: -1, gener: -1});
bandSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere' });

bandSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Use Virual populate reviews on a band
bandSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'band',
  localField: '_id'
})

// ---- DOCUMENT MIDDLEWARE: runs before .save() and .create() ---- //

bandSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Save Embedded band Memebebers IDs in the Band Model
// bandSchema.pre('save', async function(next) {
//  const bandMembersPromises = this.bandMembers.map(async id => await User.findById(id));
//  const bandMembers = await promises.all(bandMembersPromises);

//   next();
// });

bandSchema.pre('save', function(next) {
  // console.log('Will save document...');
  next();
});

bandSchema.post('save', function(doc, next) {
  // console.log(doc);
  next();
});

// ---------- QUERY MIDDLEWARE ---------- //

// bandSchema.pre('find', function(next) {
bandSchema.pre(/^find/, function(next) {
  this.find({ secretBand: { $ne: true } });

  this.start = Date.now();
  next();
});

// Populate Bnad Memeber in a Bnad
bandSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'bandMembers',
    select: '-__v'
  });

  next();
})

bandSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// ---------- AGGREGATION MIDDLEWARE ---------- //

// bandSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretBand: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;
