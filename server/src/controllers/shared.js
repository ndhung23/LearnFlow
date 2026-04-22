const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const ClassModel = require("../models/Class");
const StudySet = require("../models/StudySet");
const Assignment = require("../models/Assignment");

function createToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function sanitizeUser(user) {
  return user?.toSafeObject ? user.toSafeObject() : user;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function ensureStudySetAccess(studySetId, user) {
  const studySet = await StudySet.findById(studySetId)
    .populate("teacherId", "name email role")
    .populate("classId", "name teacherId students");

  if (!studySet) {
    throw new AppError("Study set not found.", 404);
  }

  if (user.role === "admin") {
    return studySet;
  }

  if (studySet.teacherId && studySet.teacherId._id.toString() === user._id.toString()) {
    return studySet;
  }

  if (studySet.visibility === "public") {
    return studySet;
  }

  if (studySet.visibility === "class-only" && studySet.classId) {
    const classId = studySet.classId._id.toString();

    if (
      studySet.classId.teacherId?.toString() === user._id.toString() ||
      studySet.classId.students.some((studentId) => studentId.toString() === user._id.toString())
    ) {
      return studySet;
    }

    const assigned = await Assignment.exists({
      classId,
      studentIds: user._id,
    });

    if (assigned) {
      return studySet;
    }
  }

  throw new AppError("You do not have access to this study set.", 403);
}

async function ensureClassAccess(classId, user) {
  const classItem = await ClassModel.findById(classId)
    .populate("teacherId", "name email")
    .populate("students", "name email role createdAt");

  if (!classItem) {
    throw new AppError("Class not found.", 404);
  }

  if (user.role === "admin") {
    return classItem;
  }

  if (classItem.teacherId._id.toString() === user._id.toString()) {
    return classItem;
  }

  if (classItem.students.some((student) => student._id.toString() === user._id.toString())) {
    return classItem;
  }

  throw new AppError("You do not have access to this class.", 403);
}

module.exports = {
  createToken,
  sanitizeUser,
  hashPassword,
  checkPassword,
  ensureStudySetAccess,
  ensureClassAccess,
};
