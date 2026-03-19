const express = require('express');
const router = express.Router();
const { getBatches, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getBatches).post(authorize('admin'), createBatch);
router.route('/:id').put(authorize('admin'), updateBatch).delete(authorize('admin'), deleteBatch);

module.exports = router;
