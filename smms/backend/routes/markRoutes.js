const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getMarks, getMark, createMark, updateMark, deleteMark, batchUpload, downloadTemplate } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');

// Multer config for CSV/XLSX uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.use(protect);

router.get('/template', authorize('admin', 'faculty'), downloadTemplate);
router.post('/upload', authorize('admin', 'faculty'), upload.single('file'), batchUpload);

router.route('/').get(getMarks).post(authorize('admin', 'faculty'), createMark);
router.route('/:id').get(getMark).put(authorize('admin', 'faculty'), updateMark).delete(authorize('admin'), deleteMark);

module.exports = router;
