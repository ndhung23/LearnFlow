const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["mcq", "true_false", "fill_blank"],
      default: "mcq",
    },
    choices: [choiceSchema],
    correctAnswer: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    studySetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudySet",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    passScore: {
      type: Number,
      default: 70,
    },
    timeLimitMinutes: {
      type: Number,
      default: 10,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
