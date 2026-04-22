require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("./db");
const User = require("../models/User");
const ClassModel = require("../models/Class");
const StudySet = require("../models/StudySet");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const ImportJob = require("../models/ImportJob");
const ActivityLog = require("../models/ActivityLog");
const { hashPassword } = require("../controllers/shared");

async function runSeed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    ClassModel.deleteMany({}),
    StudySet.deleteMany({}),
    Quiz.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
    Notification.deleteMany({}),
    ImportJob.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const password = await hashPassword("Password123!");

  const [admin, teacherOne, teacherTwo, ...students] = await User.create([
    {
      name: "Avery Admin",
      email: "admin@learnflow.app",
      password,
      role: "admin",
      bio: "Platform administrator for LearnFlow.",
    },
    {
      name: "Talia Teacher",
      email: "talia@learnflow.app",
      password,
      role: "teacher",
      bio: "Science teacher focused on active recall.",
    },
    {
      name: "Marco Mentor",
      email: "marco@learnflow.app",
      password,
      role: "teacher",
      bio: "Humanities teacher who builds fast feedback loops.",
    },
    {
      name: "Sara Student",
      email: "sara@learnflow.app",
      password,
      role: "student",
    },
    {
      name: "Nina Student",
      email: "nina@learnflow.app",
      password,
      role: "student",
    },
    {
      name: "Leo Student",
      email: "leo@learnflow.app",
      password,
      role: "student",
    },
    {
      name: "Mia Student",
      email: "mia@learnflow.app",
      password,
      role: "student",
    },
    {
      name: "Owen Student",
      email: "owen@learnflow.app",
      password,
      role: "student",
    },
  ]);

  const [biologyClass, chemistryClass, historyClass] = await ClassModel.create([
    {
      name: "Biology Bootcamp",
      subject: "Biology",
      description: "Flashcards and quizzes for intro biology.",
      teacherId: teacherOne._id,
      students: [students[0]._id, students[1]._id, students[2]._id],
      code: "BIO101",
    },
    {
      name: "Chem Essentials",
      subject: "Chemistry",
      description: "Foundational chemistry concepts and formulas.",
      teacherId: teacherOne._id,
      students: [students[0]._id, students[3]._id],
      code: "CHEM12",
    },
    {
      name: "World History Review",
      subject: "History",
      description: "Short-form recall drills for key events.",
      teacherId: teacherTwo._id,
      students: [students[1]._id, students[4]._id],
      code: "HIST21",
    },
  ]);

  const [studySetOne, studySetTwo, studySetThree, studySetFour] = await StudySet.create([
    {
      title: "Cell Structure Fundamentals",
      description: "Core organelles, functions, and quick recall prompts.",
      subject: "Biology",
      tags: ["biology", "cells"],
      visibility: "class-only",
      teacherId: teacherOne._id,
      classId: biologyClass._id,
      flashcards: [
        {
          term: "Nucleus",
          definition: "Stores DNA and directs cell activities.",
          hint: "Think command center.",
          difficulty: "easy",
        },
        {
          term: "Mitochondria",
          definition: "Produces usable energy for the cell.",
          hint: "Powerhouse clue.",
          difficulty: "easy",
        },
        {
          term: "Ribosome",
          definition: "Builds proteins from amino acids.",
          difficulty: "medium",
        },
      ],
    },
    {
      title: "Balancing Chemical Equations",
      description: "Essential balancing patterns and reaction terms.",
      subject: "Chemistry",
      tags: ["chemistry", "exam-prep"],
      visibility: "class-only",
      teacherId: teacherOne._id,
      classId: chemistryClass._id,
      flashcards: [
        {
          term: "Coefficient",
          definition: "Number placed before a chemical formula to balance atoms.",
          difficulty: "medium",
        },
        {
          term: "Reactants",
          definition: "Substances present before a chemical reaction occurs.",
          difficulty: "easy",
        },
        {
          term: "Products",
          definition: "Substances formed by a chemical reaction.",
          difficulty: "easy",
        },
      ],
    },
    {
      title: "Industrial Revolution Milestones",
      description: "Key inventions, impacts, and people from the Industrial Revolution.",
      subject: "History",
      tags: ["history"],
      visibility: "public",
      teacherId: teacherTwo._id,
      classId: historyClass._id,
      flashcards: [
        {
          term: "Steam engine",
          definition: "A machine that converts steam power into mechanical work.",
          difficulty: "medium",
        },
        {
          term: "Factory system",
          definition: "Production method that centralized labor and machinery.",
          difficulty: "medium",
        },
        {
          term: "Urbanization",
          definition: "Population shift from rural areas to cities.",
          difficulty: "easy",
        },
      ],
    },
    {
      title: "Academic Vocabulary Sprint",
      description: "High-value academic vocabulary for reading comprehension.",
      subject: "Language Arts",
      tags: ["vocabulary"],
      visibility: "public",
      teacherId: teacherTwo._id,
      flashcards: [
        {
          term: "Analyze",
          definition: "To examine something closely in order to understand it.",
          difficulty: "easy",
        },
        {
          term: "Infer",
          definition: "To draw a conclusion based on evidence and reasoning.",
          difficulty: "medium",
        },
      ],
      bookmarks: [students[0]._id, students[1]._id],
    },
  ]);

  const [quizOne, quizTwo] = await Quiz.create([
    {
      title: "Cell Structure Checkpoint",
      studySetId: studySetOne._id,
      teacherId: teacherOne._id,
      instructions: "Answer every question, then review the explanations.",
      questions: [
        {
          question: 'Which definition matches "Nucleus"?',
          type: "mcq",
          choices: [
            { text: "Stores DNA and directs cell activities." },
            { text: "Builds proteins from amino acids." },
            { text: "Controls what enters and leaves the cell." },
          ],
          correctAnswer: "Stores DNA and directs cell activities.",
        },
        {
          question: 'True or false: Mitochondria produce usable energy for the cell.',
          type: "true_false",
          choices: [{ text: "True" }, { text: "False" }],
          correctAnswer: "True",
        },
      ],
    },
    {
      title: "Equation Balancing Drill",
      studySetId: studySetTwo._id,
      teacherId: teacherOne._id,
      instructions: "Use the flashcards first if you need a quick warm-up.",
      questions: [
        {
          question: 'Which definition matches "Coefficient"?',
          type: "mcq",
          choices: [
            { text: "Number placed before a chemical formula to balance atoms." },
            { text: "Substances formed by a chemical reaction." },
            { text: "Substances present before a reaction occurs." },
          ],
          correctAnswer: "Number placed before a chemical formula to balance atoms.",
        },
      ],
    },
  ]);

  const [assignmentOne, assignmentTwo] = await Assignment.create([
    {
      title: "Week 1 Biology Recall",
      classId: biologyClass._id,
      studySetId: studySetOne._id,
      quizId: quizOne._id,
      teacherId: teacherOne._id,
      studentIds: biologyClass.students,
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      instructions: "Study the flashcards, then complete the quiz before the deadline.",
    },
    {
      title: "Chemistry Balance Practice",
      classId: chemistryClass._id,
      studySetId: studySetTwo._id,
      quizId: quizTwo._id,
      teacherId: teacherOne._id,
      studentIds: chemistryClass.students,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      instructions: "Focus on coefficients and conservation of mass.",
    },
  ]);

  await Submission.create([
    {
      studentId: students[0]._id,
      assignmentId: assignmentOne._id,
      studySetId: studySetOne._id,
      quizId: quizOne._id,
      mode: "quiz",
      answers: [
        {
          questionId: "seed-q1",
          answer: "Stores DNA and directs cell activities.",
          isCorrect: true,
        },
      ],
      score: 90,
      completionRate: 90,
      knownCount: 3,
      unknownCount: 1,
    },
    {
      studentId: students[3]._id,
      assignmentId: assignmentTwo._id,
      studySetId: studySetTwo._id,
      quizId: quizTwo._id,
      mode: "test",
      answers: [
        {
          questionId: "seed-q2",
          answer: "Number placed before a chemical formula to balance atoms.",
          isCorrect: true,
        },
      ],
      score: 88,
      completionRate: 88,
      knownCount: 2,
      unknownCount: 1,
    },
  ]);

  await Notification.create([
    {
      userId: students[0]._id,
      message: "Week 1 Biology Recall has been assigned to your class.",
      type: "assignment",
      link: "/assignments",
    },
    {
      userId: students[1]._id,
      message: "Week 1 Biology Recall is due in 4 days.",
      type: "deadline",
      link: "/assignments",
    },
    {
      userId: admin._id,
      message: "MongoDB demo data seeded successfully.",
      type: "system",
      link: "/admin",
      read: true,
    },
  ]);

  await ImportJob.create({
    userId: teacherOne._id,
    studySetId: studySetTwo._id,
    sourceType: "csv",
    status: "completed",
    filename: "chem-equations.csv",
    totalRows: 8,
    successRows: 8,
    errorRows: 0,
    sample: studySetTwo.flashcards.slice(0, 2),
  });

  console.log("MongoDB seed completed");
  await mongoose.disconnect();
}

runSeed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.disconnect();
  process.exit(1);
});
