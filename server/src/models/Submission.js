const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, default: "" },
    answer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    studySetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudySet",
      default: null,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    mode: {
      type: String,
      enum: ["learn", "quiz", "test", "match"],
      default: "quiz",
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    knownCount: {
      type: Number,
      default: 0,
    },
    unknownCount: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
