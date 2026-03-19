const mongoose = require('mongoose');

const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'O',  gradePoint: 10 };
  if (percentage >= 80) return { grade: 'A+', gradePoint: 9 };
  if (percentage >= 70) return { grade: 'A',  gradePoint: 8 };
  if (percentage >= 60) return { grade: 'B+', gradePoint: 7 };
  if (percentage >= 50) return { grade: 'B',  gradePoint: 6 };
  if (percentage >= 40) return { grade: 'C',  gradePoint: 5 };
  return { grade: 'F', gradePoint: 0 };
};

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  marks: {
    internal1:  { type: Number, default: 0, min: 0 },
    internal2:  { type: Number, default: 0, min: 0 },
    assignment: { type: Number, default: 0, min: 0 },
    semester:   { type: Number, default: 0, min: 0 }
  },
  // Auto-calculated fields
  totalInternal:  { type: Number, default: 0 },
  totalMarks:     { type: Number, default: 0 },
  maxMarks:       { type: Number, default: 160 },
  percentage:     { type: Number, default: 0 },
  grade:          { type: String, default: 'F' },
  gradePoint:     { type: Number, default: 0 },
  status:         { type: String, enum: ['Pass', 'Fail', 'Absent'], default: 'Fail' },
  isAbsent:       { type: Boolean, default: false },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadBatch: {
    type: String,
    default: null
  },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// Compound unique index
markSchema.index({ student: 1, subject: 1, academicYear: 1 }, { unique: true });

// Pre-save: auto-calculate totals, percentage, grade, status
markSchema.pre('save', function (next) {
  if (this.isAbsent) {
    this.status = 'Absent';
    return next();
  }

  const { internal1, internal2, assignment, semester } = this.marks;
  const best2Internal = [internal1, internal2].sort((a, b) => b - a).slice(0, 2);
  this.totalInternal = best2Internal.reduce((a, b) => a + b, 0);
  this.totalMarks    = this.totalInternal + assignment + semester;

  // Max: internal (best 2 of 25+25=50 → 25 counted) = 25+25=50 max internal?
  // Simple model: max = 25+25+10+100 = 160
  this.maxMarks  = 160;
  this.percentage = parseFloat(((this.totalMarks / this.maxMarks) * 100).toFixed(2));

  const { grade, gradePoint } = calculateGrade(this.percentage);
  this.grade      = grade;
  this.gradePoint = gradePoint;

  // Pass criteria: semester >= 40% of 100 = 40, total >= 40%
  const semPass = semester >= 40;
  const totalPass = this.percentage >= 40;
  this.status = (semPass && totalPass) ? 'Pass' : 'Fail';

  next();
});

module.exports = mongoose.model('Mark', markSchema);
