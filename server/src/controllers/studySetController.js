const StudySet = require("../models/StudySet");
const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");
const ClassModel = require("../models/Class");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess, buildPagination, parseList } = require("../utils/helpers");
const { ensureStudySetAccess } = require("./shared");

function normalizeFlashcards(flashcards = []) {
  return flashcards
    .map((card) => ({
      term: card.term?.trim(),
      definition: card.definition?.trim(),
      example: card.example?.trim() || "",
      hint: card.hint?.trim() || "",
      difficulty: card.difficulty || "medium",
    }))
    .filter((card) => card.term && card.definition);
}

function canManage(studySet, user) {
  return user.role === "admin" || studySet.teacherId.toString() === user._id.toString();
}

exports.listStudySets = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = buildPagination(req.query);
  const filter = {};

  if (req.user.role === "teacher") {
    filter.$or = [{ teacherId: req.user._id }, { visibility: "public" }];
  } else if (req.user.role === "student") {
    const classIds = await ClassModel.find({ students: req.user._id }).distinct("_id");
    filter.$or = [
      { visibility: "public" },
      { classId: { $in: classIds } },
      { bookmarks: req.user._id },
    ];
  }

  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }

  if (req.query.subject) {
    filter.subject = req.query.subject;
  }

  if (req.query.visibility) {
    filter.visibility = req.query.visibility;
  }

  const [studySets, total] = await Promise.all([
    StudySet.find(filter)
      .populate("teacherId", "name email")
      .populate("classId", "name")
      .sort(req.query.sort === "title" ? { title: 1 } : { createdAt: -1 })
      .skip(offset)
      .limit(pageSize),
    StudySet.countDocuments(filter),
  ]);

  res.json(
    formatSuccess(
      studySets.map((studySet) => ({
        id: studySet._id.toString(),
        _id: studySet._id,
        title: studySet.title,
        description: studySet.description,
        subject: studySet.subject,
        tags: studySet.tags,
        visibility: studySet.visibility,
        owner_name: studySet.teacherId?.name || "",
        flashcard_count: studySet.flashcards.length,
        quiz_count: 0,
        bookmark_count: studySet.bookmarks.length,
        is_bookmarked: studySet.bookmarks.some(
          (bookmarkId) => bookmarkId.toString() === req.user._id.toString()
        ),
        class_title: studySet.classId?.name || "",
        created_at: studySet.createdAt,
        updated_at: studySet.updatedAt,
      })),
      {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      }
    )
  );
});

exports.createStudySet = asyncHandler(async (req, res) => {
  const flashcards = normalizeFlashcards(req.body.flashcards || []);

  if (!flashcards.length) {
    throw new AppError("At least one valid flashcard is required.", 400);
  }

  const studySet = await StudySet.create({
    title: req.body.title,
    description: req.body.description || "",
    subject: req.body.subject || "",
    tags: parseList(req.body.tags),
    visibility: req.body.visibility || "private",
    teacherId: req.user._id,
    classId: req.body.classId || null,
    flashcards,
  });

  res.status(201).json(formatSuccess({ id: studySet._id.toString(), _id: studySet._id }));
});

exports.getStudySetDetail = asyncHandler(async (req, res) => {
  const studySet = await ensureStudySetAccess(req.params.id, req.user);
  const [quizzes, latestSubmission] = await Promise.all([
    Quiz.find({ studySetId: studySet._id }).sort({ createdAt: -1 }),
    Submission.findOne({ studySetId: studySet._id, studentId: req.user._id }).sort({ createdAt: -1 }),
  ]);

  res.json(
    formatSuccess({
      id: studySet._id.toString(),
      _id: studySet._id,
      title: studySet.title,
      description: studySet.description,
      subject: studySet.subject,
      visibility: studySet.visibility,
      tags: studySet.tags,
      class_id: studySet.classId?._id || null,
      class_title: studySet.classId?.name || "",
      owner_id: studySet.teacherId?._id || null,
      owner_name: studySet.teacherId?.name || "",
      flashcard_count: studySet.flashcards.length,
      quiz_count: quizzes.length,
      bookmark_count: studySet.bookmarks.length,
      is_bookmarked: studySet.bookmarks.some(
        (bookmarkId) => bookmarkId.toString() === req.user._id.toString()
      ),
      flashcards: studySet.flashcards.map((flashcard) => ({
        id: flashcard._id.toString(),
        _id: flashcard._id,
        term: flashcard.term,
        definition: flashcard.definition,
        example: flashcard.example,
        hint: flashcard.hint,
        difficulty: flashcard.difficulty,
      })),
      quizzes: quizzes.map((quiz) => ({
        id: quiz._id.toString(),
        _id: quiz._id,
        title: quiz.title,
        instructions: quiz.instructions,
        pass_score: quiz.passScore,
        time_limit_minutes: quiz.timeLimitMinutes,
      })),
      progress: latestSubmission
        ? {
            completion_rate: latestSubmission.completionRate || latestSubmission.score || 0,
            known_count: latestSubmission.knownCount || 0,
            unknown_count: latestSubmission.unknownCount || 0,
          }
        : null,
      estimated_minutes: Math.max(5, studySet.flashcards.length * 2),
      created_at: studySet.createdAt,
      updated_at: studySet.updatedAt,
    })
  );
});

exports.updateStudySet = asyncHandler(async (req, res) => {
  const studySet = await StudySet.findById(req.params.id);

  if (!studySet) {
    throw new AppError("Study set not found.", 404);
  }

  if (!canManage(studySet, req.user)) {
    throw new AppError("You do not have permission to update this study set.", 403);
  }

  if (req.body.title !== undefined) studySet.title = req.body.title;
  if (req.body.description !== undefined) studySet.description = req.body.description;
  if (req.body.subject !== undefined) studySet.subject = req.body.subject;
  if (req.body.visibility !== undefined) studySet.visibility = req.body.visibility;
  if (req.body.classId !== undefined) studySet.classId = req.body.classId || null;
  if (req.body.tags !== undefined) studySet.tags = parseList(req.body.tags);
  if (Array.isArray(req.body.flashcards)) {
    studySet.flashcards = normalizeFlashcards(req.body.flashcards);
  }

  await studySet.save();

  res.json(formatSuccess({ id: studySet._id.toString(), _id: studySet._id }));
});

exports.deleteStudySet = asyncHandler(async (req, res) => {
  const studySet = await StudySet.findById(req.params.id);

  if (!studySet) {
    throw new AppError("Study set not found.", 404);
  }

  if (!canManage(studySet, req.user)) {
    throw new AppError("You do not have permission to delete this study set.", 403);
  }

  await StudySet.findByIdAndDelete(req.params.id);

  res.json(formatSuccess({ id: req.params.id }));
});

exports.bookmarkStudySet = asyncHandler(async (req, res) => {
  const studySet = await ensureStudySetAccess(req.params.id, req.user);

  if (!studySet.bookmarks.some((bookmarkId) => bookmarkId.toString() === req.user._id.toString())) {
    studySet.bookmarks.push(req.user._id);
    await studySet.save();
  }

  res.json(formatSuccess({ id: studySet._id.toString() }));
});

exports.removeBookmark = asyncHandler(async (req, res) => {
  const studySet = await ensureStudySetAccess(req.params.id, req.user);
  studySet.bookmarks = studySet.bookmarks.filter(
    (bookmarkId) => bookmarkId.toString() !== req.user._id.toString()
  );
  await studySet.save();

  res.json(formatSuccess({ id: studySet._id.toString() }));
});

exports.duplicateStudySet = asyncHandler(async (req, res) => {
  const source = await ensureStudySetAccess(req.params.id, req.user);
  const studySet = await StudySet.create({
    title: `${source.title} (Copy)`,
    description: source.description,
    subject: source.subject,
    tags: source.tags,
    visibility: "private",
    teacherId: req.user._id,
    flashcards: source.flashcards,
  });

  res.status(201).json(formatSuccess({ id: studySet._id.toString(), _id: studySet._id }));
});

exports.saveProgress = asyncHandler(async (req, res) => {
  const studySet = await ensureStudySetAccess(req.params.id, req.user);
  const submission = await Submission.create({
    studentId: req.user._id,
    studySetId: studySet._id,
    assignmentId: req.body.assignmentId || null,
    mode: req.body.mode || "learn",
    knownCount: req.body.knownCount || 0,
    unknownCount: req.body.unknownCount || 0,
    completionRate: req.body.completionRate || 0,
    score: req.body.completionRate || 0,
    submittedAt: new Date(),
  });

  res.json(
    formatSuccess({
      id: submission._id.toString(),
      completion_rate: submission.completionRate,
      known_count: submission.knownCount,
      unknown_count: submission.unknownCount,
    })
  );
});
