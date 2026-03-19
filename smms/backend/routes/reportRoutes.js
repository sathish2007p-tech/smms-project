const express = require('express');
const router = express.Router();
const { getStudentReport, getSubjectReport, getClassReport, exportStudentExcel, getDashboardStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('admin', 'faculty'), getDashboardStats);
router.get('/student/:studentId', getStudentReport);
router.get('/subject/:subjectId', authorize('admin', 'faculty'), getSubjectReport);
router.get('/class', authorize('admin', 'faculty'), getClassReport);
router.get('/export/student/:studentId', exportStudentExcel);

module.exports = router;
