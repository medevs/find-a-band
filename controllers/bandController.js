const Band = require('./../models/bandModel');
const APIFeatures = require('./../utils/apiFeatures');

// Get Top Sheap bands
exports.aliasTopBands = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,gener';
  next();
};

// Get All Bands
exports.getAllBands = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getBand = async (req, res) => {
  try {
    const band = await Band.findById(req.params.id);
    // Band.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        band
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createBand = async (req, res) => {
  try {
    // const newBand = new Band({})
    // newBand.save()

    const newBand = await Band.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        band: newBand
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateBand = async (req, res) => {
  try {
    const band = await Band.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        band
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteBand = async (req, res) => {
  try {
    await Band.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

// Get Band Statistics
exports.getBandStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

// Get monthly Booked bands
exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
