const ClassModel = require("../models/Class");
const StudySet = require("../models/StudySet");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess, slugify } = require("../utils/helpers");
const { ensureClassAccess } = require("./shared");

function buildClassCode(name) {
  return `${slugify(name).replace(/-/g, "").slice(0, 6).toUpperCase()}${Math.floor(
    100 + Math.random() * 900
  )}`;
}

exports.listClasses = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === "teacher") {
    filter.teacherId = req.user._id;
  }

  if (req.user.role === "student") {
    filter.students = req.user._id;
  }

  const classes = await ClassModel.find(filter)
    .populate("teacherId", "name email")
    .populate("students", "name email role createdAt")
    .sort({ createdAt: -1 });

  const data = await Promise.all(
    classes.map(async (classItem) => {
      const [studySetCount, assignmentCount] = await Promise.all([
        StudySet.countDocuments({ classId: classItem._id }),
        Assignment.countDocuments({ classId: classItem._id }),
      ]);

      return {
        id: classItem._id.toString(),
        _id: classItem._id,
        name: classItem.name,
        title: classItem.name,
        code: classItem.code,
        subject: classItem.subject,
        description: classItem.description,
        teacher_name: classItem.teacherId?.name || "",
        teacher_email: classItem.teacherId?.email || "",
        student_count: classItem.students.length,
        study_set_count: studySetCount,
        assignment_count: assignmentCount,
        created_at: classItem.createdAt,
        updated_at: classItem.updatedAt,
      };
    })
  );

  res.json(formatSuccess(data));
});

exports.createClass = asyncHandler(async (req, res) => {
  const teacherId =
    req.user.role === "admin" && req.body.teacherId ? req.body.teacherId : req.user._id;

  const teacher = await User.findById(teacherId);

  if (!teacher || teacher.role !== "teacher") {
    throw new AppError("Selected teacher was not found.", 404);
  }

  const classItem = await ClassModel.create({
    name: req.body.title || req.body.name,
    subject: req.body.subject || "",
    description: req.body.description || "",
    teacherId,
    code: req.body.code || buildClassCode(req.body.title || req.body.name),
  });

  res.status(201).json(
    formatSuccess({
      id: classItem._id.toString(),
      _id: classItem._id,
      name: classItem.name,
      title: classItem.name,
      code: classItem.code,
      subject: classItem.subject,
      description: classItem.description,
      created_at: classItem.createdAt,
      updated_at: classItem.updatedAt,
    })
  );
});

exports.getClassDetail = asyncHandler(async (req, res) => {
  const classItem = await ensureClassAccess(req.params.id, req.user);
  const [studySets, assignments, submissions] = await Promise.all([
    StudySet.find({ classId: classItem._id }).sort({ createdAt: -1 }),
    Assignment.find({ classId: classItem._id })
      .populate("studySetId", "title")
      .populate("quizId", "title")
      .sort({ createdAt: -1 }),
    Submission.find({ assignmentId: { $in: (await Assignment.find({ classId: classItem._id }).select("_id")).map((item) => item._id) } }),
  ]);

  const leaderboard = classItem.students.map((student) => {
    const userSubmissions = submissions.filter(
      (submission) => submission.studentId.toString() === student._id.toString()
    );
    const averageScore = userSubmissions.length
      ? (
          userSubmissions.reduce((sum, submission) => sum + (submission.score || 0), 0) /
          userSubmissions.length
        ).toFixed(2)
      : "0.00";

    return {
      id: student._id.toString(),
      _id: student._id,
      full_name: student.name,
      email: student.email,
      average_score: Number(averageScore),
      completed_assignments: userSubmissions.length,
    };
  });

  res.json(
    formatSuccess({
      id: classItem._id.toString(),
      _id: classItem._id,
      title: classItem.name,
      name: classItem.name,
      code: classItem.code,
      subject: classItem.subject,
      description: classItem.description,
      teacher_id: classItem.teacherId._id,
      teacher_name: classItem.teacherId.name,
      teacher_email: classItem.teacherId.email,
      students: classItem.students.map((student) => ({
        id: student._id.toString(),
        _id: student._id,
        full_name: student.name,
        email: student.email,
        joined_at: student.createdAt,
        average_score: leaderboard.find((entry) => entry.id === student._id.toString())?.average_score || 0,
      })),
      studySets: studySets.map((studySet) => ({
        id: studySet._id.toString(),
        _id: studySet._id,
        title: studySet.title,
        subject: studySet.subject,
        visibility: studySet.visibility,
        flashcard_count: studySet.flashcards.length,
      })),
      assignments: assignments.map((assignment) => ({
        id: assignment._id.toString(),
        _id: assignment._id,
        title: assignment.title,
        deadline_at: assignment.deadline,
        study_set_title: assignment.studySetId?.title || "",
        quiz_title: assignment.quizId?.title || "",
        recipient_count: assignment.studentIds.length,
        completed_count: submissions.filter(
          (submission) => submission.assignmentId?.toString() === assignment._id.toString()
        ).length,
      })),
      leaderboard: leaderboard.sort((a, b) => b.average_score - a.average_score),
      created_at: classItem.createdAt,
      updated_at: classItem.updatedAt,
    })
  );
});

exports.joinClass = asyncHandler(async (req, res) => {
  const classItem = await ClassModel.findById(req.params.id);

  if (!classItem) {
    throw new AppError("Class not found.", 404);
  }

  const alreadyJoined = classItem.students.some(
    (studentId) => studentId.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    classItem.students.push(req.user._id);
    await classItem.save();
  }

  res.json(formatSuccess({ alreadyJoined: Boolean(alreadyJoined) }));
});

exports.getClassStudents = asyncHandler(async (req, res) => {
  const classItem = await ensureClassAccess(req.params.id, req.user);

  res.json(
    formatSuccess(
      classItem.students.map((student) => ({
        id: student._id.toString(),
        _id: student._id,
        full_name: student.name,
        email: student.email,
      }))
    )
  );
});
