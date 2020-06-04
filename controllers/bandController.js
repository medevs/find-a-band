const fs = require('fs');

const bands = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Band id is: ${val}`);

  if (req.params.id * 1 > bands.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllBands = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: bands.length,
    data: {
      bands
    }
  });
};

exports.getBand = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = bands.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createBand = (req, res) => {
  // console.log(req.body);

  const newId = bands[bands.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  bands.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(bands),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateBand = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteBand = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
