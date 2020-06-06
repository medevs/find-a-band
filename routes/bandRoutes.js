const express = require('express');
const bandController = require('./../controllers/bandController');

const router = express.Router();

// router.param('id', bandController.checkID);

router
  .route('/top-6-cheap')
  .get(bandController.aliasTopBands, bandController.getAllBands);

router.route('/band-stats').get(bandController.getBandStats);
router.route('/monthly-plan/:year').get(bandController.getMonthlyPlan);

router
  .route('/')
  .get(bandController.getAllBands)
  .post(bandController.createBand);

router
  .route('/:id')
  .get(bandController.getBand)
  .patch(bandController.updateBand)
  .delete(bandController.deleteBand);

module.exports = router;
