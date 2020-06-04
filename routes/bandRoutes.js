const express = require('express');
const bandController = require('./../controllers/bandController');

const router = express.Router();

router.param('id', bandController.checkID);

router
  .route('/')
  .get(bandController.getAllBands)
  .post(bandController.checkBody, bandController.createBand);

router
  .route('/:id')
  .get(bandController.getBand)
  .patch(bandController.updateBand)
  .delete(bandController.deleteBand);

module.exports = router;
