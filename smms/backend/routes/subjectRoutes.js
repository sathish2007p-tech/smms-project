const express = require('express');
const router = express.Router();
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, assignFaculty } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getSubjects).post(authorize('admin'), createSubject);
router.route('/:id').get(getSubject).put(authorize('admin'), updateSubject).delete(authorize('admin'), deleteSubject);
router.put('/:id/assign-faculty', authorize('admin'), assignFaculty);

module.exports = router;
