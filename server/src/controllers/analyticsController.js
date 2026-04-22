const User = require("../models/User");
const ClassModel = require("../models/Class");
const StudySet = require("../models/StudySet");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { formatSuccess } = require("../utils/helpers");

exports.getAdminStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalStudySets, totalQuizAttempts, recentUsers] = await Promise.all([
    User.countDocuments({ isActive: true }),
    StudySet.countDocuments(),
    Submission.countDocuments({ mode: { $in: ["quiz", "test"] } }),
    User.find({ isActive: true }).sort({ lastLoginAt: -1 }).limit(6),
  ]);

  const totalAssignments = await Assignment.countDocuments();
  const completedAssignments = await Submission.distinct("assignmentId", {
    assignmentId: { $ne: null },
  });

  res.json(
    formatSuccess({
      total_users: totalUsers,
      total_study_sets: totalStudySets,
      total_quiz_attempts: totalQuizAttempts,
      completion_rate: totalAssignments
        ? Number(((completedAssignments.length / totalAssignments) * 100).toFixed(2))
        : 0,
      recentUsers: recentUsers.map((user) => ({
        id: user._id.toString(),
        full_name: user.name,
        email: user.email,
        role: user.role,
        last_login_at: user.lastLoginAt,
      })),
      recentActivity: [],
    })
  );
});

exports.getTeacherStats = asyncHandler(async (req, res) => {
  const [totalClasses, totalStudySets, totalAssignments, submissions, classPerformance] =
    await Promise.all([
      ClassModel.countDocuments({ teacherId: req.user._id }),
      StudySet.countDocuments({ teacherId: req.user._id }),
      Assignment.countDocuments({ teacherId: req.user._id }),
      Submission.find({}),
      ClassModel.find({ teacherId: req.user._id }).populate("students", "name"),
    ]);

  const assignmentIds = await Assignment.find({ teacherId: req.user._id }).distinct("_id");
  const relatedSubmissions = submissions.filter(
    (submission) =>
      submission.assignmentId && assignmentIds.some((id) => id.toString() === submission.assignmentId.toString())
  );

  res.json(
    formatSuccess({
      total_classes: totalClasses,
      total_study_sets: totalStudySets,
      total_assignments: totalAssignments,
      average_score: relatedSubmissions.length
        ? Number(
            (
              relatedSubmissions.reduce((sum, submission) => sum + submission.score, 0) /
              relatedSubmissions.length
            ).toFixed(2)
          )
        : 0,
      recentAssignments: (await Assignment.find({ teacherId: req.user._id }).populate("classId", "name").sort({ createdAt: -1 }).limit(6)).map((assignment) => ({
        id: assignment._id.toString(),
        title: assignment.title,
        class_title: assignment.classId?.name || "",
        deadline_at: assignment.deadline,
        recipient_count: assignment.studentIds.length,
        completed_count: relatedSubmissions.filter(
          (submission) => submission.assignmentId?.toString() === assignment._id.toString()
        ).length,
      })),
      classPerformance: classPerformance.map((classItem) => ({
        id: classItem._id.toString(),
        title: classItem.name,
        student_count: classItem.students.length,
        average_score: 0,
      })),
    })
  );
});

exports.getStudentStats = asyncHandler(async (req, res) => {
  const [assignments, submissions, notifications] = await Promise.all([
    Assignment.find({ studentIds: req.user._id }),
    Submission.find({ studentId: req.user._id })
      .populate("studySetId", "title subject")
      .populate("quizId", "title")
      .sort({ createdAt: -1 }),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);

  const recentProgress = submissions
    .filter((submission) => submission.studySetId)
    .slice(0, 6)
    .map((submission) => ({
      study_set_id: submission.studySetId._id.toString(),
      title: submission.studySetId.title,
      subject: submission.studySetId.subject,
      completion_rate: submission.completionRate || submission.score || 0,
      known_count: submission.knownCount || 0,
      unknown_count: submission.unknownCount || 0,
      last_studied_at: submission.submittedAt,
    }));

  const recentSubmissions = submissions
    .filter((submission) => submission.quizId)
    .slice(0, 6)
    .map((submission) => ({
      id: submission._id.toString(),
      mode: submission.mode,
      score: submission.score,
      submitted_at: submission.submittedAt,
      study_set_title: submission.studySetId?.title || "",
      quiz_title: submission.quizId?.title || "",
    }));

  res.json(
    formatSuccess({
      total_assignments: assignments.length,
      completed_assignments: submissions.filter((submission) => submission.assignmentId).length,
      average_score: submissions.length
        ? Number(
            (submissions.reduce((sum, submission) => sum + (submission.score || 0), 0) / submissions.length).toFixed(2)
          )
        : 0,
      bookmarked_sets: (await StudySet.countDocuments({ bookmarks: req.user._id })),
      completion_rate: assignments.length
        ? Number(((submissions.filter((submission) => submission.assignmentId).length / assignments.length) * 100).toFixed(2))
        : 0,
      unread_notifications: notifications,
      recentProgress,
      recentSubmissions,
      recentActivity: [],
    })
  );
});
