const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// @desc    Get student-wise report
// @route   GET /api/reports/student/:studentId
// @access  Private
exports.getStudentReport = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const marks = await Mark.find({ student: req.params.studentId })
      .populate('subject', 'subjectCode subjectName credits semester');

    const totalCredits = marks.reduce((sum, m) => sum + (m.subject?.credits || 0), 0);
    const earnedCredits = marks
      .filter(m => m.status === 'Pass')
      .reduce((sum, m) => sum + (m.subject?.credits || 0), 0);

    const totalGradePoints = marks.reduce((sum, m) => sum + (m.gradePoint * (m.subject?.credits || 0)), 0);
    const cgpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        student,
        marks,
        summary: {
          totalSubjects: marks.length,
          passed: marks.filter(m => m.status === 'Pass').length,
          failed: marks.filter(m => m.status === 'Fail').length,
          totalCredits,
          earnedCredits,
          cgpa
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get subject-wise report
// @route   GET /api/reports/subject/:subjectId
// @access  Faculty, Admin
exports.getSubjectReport = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const subject = await Subject.findById(req.params.subjectId).populate('faculty', 'name');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const filter = { subject: req.params.subjectId };
    if (academicYear) filter.academicYear = academicYear;

    const marks = await Mark.find(filter)
      .populate('student', 'studentId name batch department');

    const passed = marks.filter(m => m.status === 'Pass').length;
    const failed = marks.filter(m => m.status === 'Fail').length;
    const avgPercentage = marks.length > 0
      ? parseFloat((marks.reduce((s, m) => s + m.percentage, 0) / marks.length).toFixed(2))
      : 0;

    const gradeDistribution = {};
    marks.forEach(m => {
      gradeDistribution[m.grade] = (gradeDistribution[m.grade] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        subject,
        marks,
        summary: {
          totalStudents: marks.length,
          passed,
          failed,
          passPercentage: marks.length > 0 ? parseFloat(((passed / marks.length) * 100).toFixed(2)) : 0,
          avgPercentage,
          gradeDistribution,
          highest: marks.length > 0 ? Math.max(...marks.map(m => m.totalMarks)) : 0,
          lowest:  marks.length > 0 ? Math.min(...marks.map(m => m.totalMarks)) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get class/batch-wise report
// @route   GET /api/reports/class
// @access  Admin, Faculty
exports.getClassReport = async (req, res) => {
  try {
    const { batch, department, academicYear } = req.query;
    const studentFilter = {};
    if (batch) studentFilter.batch = batch;
    if (department) studentFilter.department = department;

    const students = await Student.find(studentFilter);
    const studentIds = students.map(s => s._id);

    const markFilter = { student: { $in: studentIds } };
    if (academicYear) markFilter.academicYear = academicYear;

    const marks = await Mark.find(markFilter)
      .populate('student', 'studentId name batch department')
      .populate('subject', 'subjectCode subjectName');

    // Group by student
    const studentMap = {};
    marks.forEach(m => {
      const sid = m.student._id.toString();
      if (!studentMap[sid]) {
        studentMap[sid] = { student: m.student, marks: [] };
      }
      studentMap[sid].marks.push(m);
    });

    const classData = Object.values(studentMap).map(({ student, marks: sMarks }) => {
      const passed = sMarks.filter(m => m.status === 'Pass').length;
      const avgPct = sMarks.length > 0 ? parseFloat((sMarks.reduce((s, m) => s + m.percentage, 0) / sMarks.length).toFixed(2)) : 0;
      return { student, totalSubjects: sMarks.length, passed, failed: sMarks.length - passed, avgPercentage: avgPct };
    });

    res.json({ success: true, data: classData, total: classData.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export student report as Excel
// @route   GET /api/reports/export/student/:studentId
// @access  Private
exports.exportStudentExcel = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const marks = await Mark.find({ student: req.params.studentId })
      .populate('subject', 'subjectCode subjectName credits');

    const data = marks.map(m => ({
      'Student ID':   student.studentId,
      'Student Name': student.name,
      'Subject Code': m.subject?.subjectCode || '',
      'Subject Name': m.subject?.subjectName || '',
      'Internal 1':   m.marks.internal1,
      'Internal 2':   m.marks.internal2,
      'Assignment':   m.marks.assignment,
      'Semester Exam':m.marks.semester,
      'Total':        m.totalMarks,
      'Percentage':   m.percentage + '%',
      'Grade':        m.grade,
      'Status':       m.status
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Mark Sheet');

    const dir = path.join(__dirname, '../uploads/exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `marksheet_${student.studentId}.xlsx`);
    xlsx.writeFile(wb, filePath);
    res.download(filePath, `marksheet_${student.studentId}.xlsx`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard stats
// @route   GET /api/reports/dashboard
// @access  Admin, Faculty
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalSubjects, totalMarks] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Mark.countDocuments()
    ]);

    const passCount = await Mark.countDocuments({ status: 'Pass' });
    const failCount = await Mark.countDocuments({ status: 'Fail' });

    // Recent uploads (last 5 unique batches)
    const recentUploads = await Mark.aggregate([
      { $match: { uploadBatch: { $ne: null } } },
      { $group: { _id: '$uploadBatch', count: { $sum: 1 }, date: { $max: '$createdAt' } } },
      { $sort: { date: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalSubjects,
        totalMarkRecords: totalMarks,
        passCount,
        failCount,
        passPercentage: totalMarks > 0 ? parseFloat(((passCount / totalMarks) * 100).toFixed(2)) : 0,
        recentUploads
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
