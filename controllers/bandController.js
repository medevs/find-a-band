const Band = require('./../models/bandModel');

const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

// Get Top Sheap 6 bands
exports.aliasTopBands = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,gener';
  next();
};

// Get All Bands
exports.getAllBands = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Band.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const bands = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: bands.length,
    data: {
      bands
    }
  });
});

exports.getBand = catchAsync(async (req, res, next) => {
  const band = await Band.findById(req.params.id);
  // Band.findOne({ _id: req.params.id })

  if(!band) {
    return next(new appError('No Band with that ID!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      band
    }
  });
});

exports.createBand = catchAsync(async (req, res, next) => {
  const newBand = await Band.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      band: newBand
    }
  });
});

exports.updateBand = catchAsync(async (req, res, next) => {
  const band = await Band.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if(!band) {
    return next(new appError('No Band with that ID!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      band
    }
  });
});

exports.deleteBand = catchAsync(async (req, res, next) => {
  const band = await Band.findByIdAndDelete(req.params.id);

  if(!band) {
    return next(new appError('No Band with that ID!', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get Band Statistics
exports.getBandStats = catchAsync(async (req, res, next) => {
  const stats = await Band.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$gener' },
        numBands: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Get monthly Booked bands
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Band.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numBandStarts: { $sum: 1 },
        bands: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numBandStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
