const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, toggleStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);
router.put('/:id/toggle-status', toggleStatus);

module.exports = router;
