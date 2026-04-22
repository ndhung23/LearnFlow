const mongoose = require("mongoose");

const importJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studySetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudySet",
      default: null,
    },
    sourceType: {
      type: String,
      enum: ["text", "csv"],
      required: true,
    },
    status: {
      type: String,
      enum: ["previewed", "completed", "failed"],
      default: "previewed",
    },
    filename: {
      type: String,
      default: "",
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    successRows: {
      type: Number,
      default: 0,
    },
    errorRows: {
      type: Number,
      default: 0,
    },
    sample: [
      {
        term: String,
        definition: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ImportJob", importJobSchema);
