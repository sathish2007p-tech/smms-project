const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User    = require('../models/User');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Batch   = require('../models/Batch');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany();
  await Student.deleteMany();
  await Subject.deleteMany();
  await Batch.deleteMany();

  // Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@smms.com',
    password: 'admin123',
    role: 'admin'
  });

  // Faculty
  const faculty1 = await User.create({
    name: 'Dr. Priya Sharma',
    email: 'priya@smms.com',
    password: 'faculty123',
    role: 'faculty'
  });
  const faculty2 = await User.create({
    name: 'Prof. Ravi Kumar',
    email: 'ravi@smms.com',
    password: 'faculty123',
    role: 'faculty'
  });

  // Batch
  await Batch.create({ batchName: '2022-2026', department: 'Computer Science', startYear: 2022, endYear: 2026, currentSemester: 5 });
  await Batch.create({ batchName: '2023-2027', department: 'Information Technology', startYear: 2023, endYear: 2027, currentSemester: 3 });

  // Subjects
  await Subject.create([
    { subjectCode: 'CS501', subjectName: 'Data Structures', department: 'Computer Science', semester: 5, credits: 4, faculty: faculty1._id },
    { subjectCode: 'CS502', subjectName: 'Operating Systems', department: 'Computer Science', semester: 5, credits: 4, faculty: faculty2._id },
    { subjectCode: 'CS503', subjectName: 'Database Management Systems', department: 'Computer Science', semester: 5, credits: 3, faculty: faculty1._id },
    { subjectCode: 'CS504', subjectName: 'Computer Networks', department: 'Computer Science', semester: 5, credits: 3, faculty: faculty2._id },
    { subjectCode: 'IT301', subjectName: 'Web Technologies', department: 'Information Technology', semester: 3, credits: 3, faculty: faculty1._id },
  ]);

  // Students
  const studentUsers = [
    { name: 'Arjun Mehta',   email: 'arjun@smms.com',   studentId: 'CS001', batch: '2022-2026', department: 'Computer Science', semester: 5 },
    { name: 'Sneha Patel',   email: 'sneha@smms.com',   studentId: 'CS002', batch: '2022-2026', department: 'Computer Science', semester: 5 },
    { name: 'Rohan Verma',   email: 'rohan@smms.com',   studentId: 'CS003', batch: '2022-2026', department: 'Computer Science', semester: 5 },
    { name: 'Ananya Singh',  email: 'ananya@smms.com',  studentId: 'CS004', batch: '2022-2026', department: 'Computer Science', semester: 5 },
    { name: 'Karan Joshi',   email: 'karan@smms.com',   studentId: 'IT001', batch: '2023-2027', department: 'Information Technology', semester: 3 },
  ];

  for (const s of studentUsers) {
    const user = await User.create({ name: s.name, email: s.email, password: 'student123', role: 'student' });
    await Student.create({ user: user._id, studentId: s.studentId, name: s.name, email: s.email, batch: s.batch, department: s.department, semester: s.semester });
  }

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Admin:   admin@smms.com   / admin123');
  console.log('   Faculty: priya@smms.com   / faculty123');
  console.log('   Student: arjun@smms.com   / student123');
  console.log('');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
