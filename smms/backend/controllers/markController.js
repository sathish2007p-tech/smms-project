const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('crypto');

// @desc    Get marks (with filters)
// @route   GET /api/marks
// @access  Private
exports.getMarks = async (req, res) => {
  try {
    const { student, subject, academicYear, status } = req.query;
    const filter = {};

    if (student) filter.student = student;
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    // If student role, only show their marks
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id });
      if (!studentProfile) return res.status(404).json({ success: false, message: 'Student profile not found.' });
      filter.student = studentProfile._id;
    }

    const marks = await Mark.find(filter)
      .populate('student', 'studentId name batch department semester')
      .populate('subject', 'subjectCode subjectName credits')
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single mark entry
// @route   GET /api/marks/:id
// @access  Private
exports.getMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('student', 'studentId name batch department')
      .populate('subject', 'subjectCode subjectName maxMarks');

    if (!mark) return res.status(404).json({ success: false, message: 'Mark record not found.' });
    res.json({ success: true, data: mark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/Update marks manually
// @route   POST /api/marks
// @access  Faculty, Admin
exports.createMark = async (req, res) => {
  try {
    const { studentId, subjectId, academicYear, marks, isAbsent, remarks } = req.body;

    // Validate student and subject exist
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Find existing or create new — always use .save() so pre-save hook runs
    let markRecord = await Mark.findOne({ student: studentId, subject: subjectId, academicYear });

    if (markRecord) {
      // Update existing record
      markRecord.marks     = marks;
      markRecord.isAbsent  = isAbsent || false;
      markRecord.remarks   = remarks || '';
      markRecord.enteredBy = req.user._id;
    } else {
      // Create new record
      markRecord = new Mark({
        student: studentId,
        subject: subjectId,
        academicYear,
        marks,
        isAbsent: isAbsent || false,
        remarks: remarks || '',
        enteredBy: req.user._id
      });
    }

    // .save() triggers the pre-save hook which calculates total, grade, status
    await markRecord.save();

    res.status(201).json({ success: true, message: 'Marks saved successfully.', data: markRecord });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate mark record.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update marks
// @route   PUT /api/marks/:id
// @access  Faculty, Admin
exports.updateMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) return res.status(404).json({ success: false, message: 'Mark record not found.' });

    Object.assign(mark, { ...req.body, enteredBy: req.user._id });
    await mark.save();

    res.json({ success: true, message: 'Marks updated successfully.', data: mark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete mark record
// @route   DELETE /api/marks/:id
// @access  Admin
exports.deleteMark = async (req, res) => {
  try {
    const mark = await Mark.findByIdAndDelete(req.params.id);
    if (!mark) return res.status(404).json({ success: false, message: 'Mark record not found.' });
    res.json({ success: true, message: 'Mark record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch upload marks from CSV/Excel
// @route   POST /api/marks/upload
// @access  Faculty, Admin
exports.batchUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file.' });
    }

    const { subjectId, academicYear } = req.body;
    if (!subjectId || !academicYear) {
      return res.status(400).json({ success: false, message: 'Subject and academic year are required.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Parse the uploaded file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty or has no data rows.' });
    }

    // Required columns
    const requiredCols = ['studentId', 'internal1', 'internal2', 'assignment', 'semester'];
    const fileHeaders = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
    const missingCols = requiredCols.filter(c => !fileHeaders.includes(c.toLowerCase()));

    if (missingCols.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingCols.join(', ')}. Required: ${requiredCols.join(', ')}`
      });
    }

    const batchId = `BATCH_${Date.now()}`;
    const results = { success: [], failed: [], duplicates: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row (1=header, 2=first data row)

      try {
        const studentIdVal = String(row.studentId || row.StudentId || '').trim().toUpperCase();
        if (!studentIdVal) {
          results.failed.push({ row: rowNum, studentId: 'N/A', reason: 'Missing studentId' });
          continue;
        }

        // Find student
        const student = await Student.findOne({ studentId: studentIdVal });
        if (!student) {
          results.failed.push({ row: rowNum, studentId: studentIdVal, reason: 'Student ID not found in system' });
          continue;
        }

        // Check for existing record
        const existing = await Mark.findOne({ student: student._id, subject: subjectId, academicYear });
        if (existing) {
          results.duplicates.push({ row: rowNum, studentId: studentIdVal, reason: 'Duplicate record (already exists)' });
          continue;
        }

        // Validate mark values
        const internal1  = parseFloat(row.internal1  || 0);
        const internal2  = parseFloat(row.internal2  || 0);
        const assignment = parseFloat(row.assignment || 0);
        const semMark    = parseFloat(row.semester   || 0);

        if (internal1 > 25 || internal2 > 25 || assignment > 10 || semMark > 100) {
          results.failed.push({ row: rowNum, studentId: studentIdVal, reason: 'Marks exceed maximum allowed values (Internal: 25, Assignment: 10, Semester: 100)' });
          continue;
        }

        // Create mark record
        await Mark.create({
          student: student._id,
          subject: subjectId,
          academicYear,
          marks: { internal1, internal2, assignment, semester: semMark },
          enteredBy: req.user._id,
          uploadBatch: batchId
        });

        results.success.push({ row: rowNum, studentId: studentIdVal, name: student.name });
      } catch (err) {
        results.failed.push({ row: rowNum, studentId: row.studentId || 'N/A', reason: err.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      batchId,
      summary: {
        total: rows.length,
        successful: results.success.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      },
      details: results
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download batch upload template
// @route   GET /api/marks/template
// @access  Faculty, Admin
exports.downloadTemplate = async (req, res) => {
  try {
    const wb = xlsx.utils.book_new();
    const templateData = [
      { studentId: 'CS001', internal1: 20, internal2: 18, assignment: 8, semester: 75 },
      { studentId: 'CS002', internal1: 22, internal2: 21, assignment: 9, semester: 80 },
      { studentId: 'CS003', internal1: 15, internal2: 17, assignment: 7, semester: 60 },
    ];
    const ws = xlsx.utils.json_to_sheet(templateData);
    xlsx.utils.book_append_sheet(wb, ws, 'Marks Template');

    const filePath = path.join(__dirname, '../uploads/marks_template.xlsx');
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    xlsx.writeFile(wb, filePath);

    res.download(filePath, 'marks_upload_template.xlsx');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};