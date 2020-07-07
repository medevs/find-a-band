const express = require('express');
const bandController = require('./../controllers/bandController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// POST /band/234fad4/reviews
// GET /band/234fad4/reviews

router.use('/:bandId/reviews', reviewRouter);

router
  .route('/top-6-cheap')
  .get(bandController.aliasTopBands, bandController.getAllBands);

router.route('/band-stats').get(bandController.getBandStats);

router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin'),
  bandController.getMonthlyPlan);

// Find a bands in certain area 
router
  .route('/bands-within/:distance/center/:latlng/unit/:unit')
  .get(bandController.getBandsWithin);
  // /bands-within?distance=233&center=-40,45&unit=mi (or Km)
  // /bands-within/233/center/-40,45/unit/mi (or Km)

router.route('/distances/:latlng/unit/:unit').get(bandController.getDistances);

router
  .route('/')
  .get(bandController.getAllBands)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'band-manager'),
    bandController.createBand);

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'band-manager', 'user'),
    bandController.getBand)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'band-manager'),
    bandController.updateBand)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'band-manager'),
    bandController.deleteBand);

module.exports = router;
