const Assignment = require("../models/Assignment");
const ClassModel = require("../models/Class");
const StudySet = require("../models/StudySet");
const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess } = require("../utils/helpers");

exports.createAssignment = asyncHandler(async (req, res) => {
  let studentIds = [];

  if (req.body.classId) {
    const classItem = await ClassModel.findById(req.body.classId);

    if (!classItem) {
      throw new AppError("Class not found.", 404);
    }

    if (
      req.user.role !== "admin" &&
      classItem.teacherId.toString() !== req.user._id.toString()
    ) {
      throw new AppError("You can only assign work to your own classes.", 403);
    }

    studentIds = classItem.students;
  }

  if (req.body.studentId) {
    studentIds = [req.body.studentId];
  }

  if (!studentIds.length) {
    throw new AppError("Assignments must target a class or a student.", 400);
  }

  const assignment = await Assignment.create({
    title: req.body.title,
    classId: req.body.classId || null,
    studySetId: req.body.studySetId || null,
    quizId: req.body.quizId || null,
    teacherId: req.user._id,
    studentIds,
    deadline: req.body.deadlineAt || req.body.deadline || null,
    instructions: req.body.instructions || "",
  });

  await Notification.insertMany(
    studentIds.map((studentId) => ({
      userId: studentId,
      message: `${assignment.title} has been assigned to you.`,
      type: "assignment",
      link: "/assignments",
    }))
  );

  res.status(201).json(formatSuccess({ id: assignment._id.toString(), _id: assignment._id }));
});

exports.listAssignments = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === "teacher") {
    filter.teacherId = req.user._id;
  }

  if (req.user.role === "student") {
    filter.studentIds = req.user._id;
  }

  const assignments = await Assignment.find(filter)
    .populate("classId", "name")
    .populate("studySetId", "title")
    .populate("quizId", "title")
    .populate("teacherId", "name")
    .sort({ createdAt: -1 });

  const assignmentIds = assignments.map((assignment) => assignment._id);
  const submissions = await Submission.find({
    assignmentId: { $in: assignmentIds },
  });

  res.json(
    formatSuccess(
      assignments.map((assignment) => {
        const relatedSubmissions = submissions.filter(
          (submission) => submission.assignmentId?.toString() === assignment._id.toString()
        );
        const userSubmission = relatedSubmissions
          .filter((submission) => submission.studentId.toString() === req.user._id.toString())
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

        return {
          id: assignment._id.toString(),
          _id: assignment._id,
          title: assignment.title,
          class_title: assignment.classId?.name || "",
          study_set_title: assignment.studySetId?.title || "",
          quiz_title: assignment.quizId?.title || "",
          teacher_name: assignment.teacherId?.name || "",
          deadline_at: assignment.deadline,
          recipient_count: assignment.studentIds.length,
          completed_count: relatedSubmissions.length,
          status: userSubmission ? "completed" : "not_started",
          score: userSubmission?.score || null,
        };
      })
    )
  );
});

exports.getAssignmentDetail = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("classId", "name")
    .populate("studySetId", "title")
    .populate("quizId", "title")
    .populate("teacherId", "name email")
    .populate("studentIds", "name email");

  if (!assignment) {
    throw new AppError("Assignment not found.", 404);
  }

  if (
    req.user.role === "teacher" &&
    assignment.teacherId._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError("You do not have access to this assignment.", 403);
  }

  if (
    req.user.role === "student" &&
    !assignment.studentIds.some((student) => student._id.toString() === req.user._id.toString())
  ) {
    throw new AppError("You do not have access to this assignment.", 403);
  }

  const submissions = await Submission.find({ assignmentId: assignment._id }).populate(
    "studentId",
    "name email"
  );

  res.json(
    formatSuccess({
      id: assignment._id.toString(),
      _id: assignment._id,
      title: assignment.title,
      class_title: assignment.classId?.name || "",
      study_set_title: assignment.studySetId?.title || "",
      quiz_title: assignment.quizId?.title || "",
      deadline_at: assignment.deadline,
      teacher_name: assignment.teacherId.name,
      recipients: assignment.studentIds.map((student) => {
        const submission = submissions.find(
          (item) => item.studentId._id.toString() === student._id.toString()
        );

        return {
          id: student._id.toString(),
          student_id: student._id.toString(),
          full_name: student.name,
          email: student.email,
          status: submission ? "completed" : "not_started",
          score: submission?.score || null,
        };
      }),
    })
  );
});
