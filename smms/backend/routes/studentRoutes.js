const express = require('express');
const router = express.Router();
const { getStudents, getStudent, updateStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'faculty'), getStudents);
router.get('/:id', getStudent);
router.put('/:id', authorize('admin'), updateStudent);

module.exports = router;
