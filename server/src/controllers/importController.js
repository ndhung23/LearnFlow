const { parse } = require("csv-parse/sync");
const StudySet = require("../models/StudySet");
const ImportJob = require("../models/ImportJob");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess, parseList } = require("../utils/helpers");

function normalizeCards(cards = []) {
  return cards
    .map((card) => ({
      term: card.term?.trim(),
      definition: card.definition?.trim(),
      example: card.example?.trim() || "",
      hint: card.hint?.trim() || "",
      difficulty: card.difficulty || "medium",
    }))
    .filter((card) => card.term && card.definition);
}

function previewPayload(cards) {
  const normalized = normalizeCards(cards);

  if (!normalized.length) {
    throw new AppError("No valid flashcards were found in the import content.", 400);
  }

  return {
    totalRows: cards.length,
    validRows: normalized.length,
    invalidRows: cards.length - normalized.length,
    cards: normalized,
  };
}

async function saveStudySetFromImport(payload, preview, user, sourceType, filename = "") {
  const studySet = await StudySet.create({
    title: payload.title,
    description: payload.description || "",
    subject: payload.subject || "",
    tags: parseList(payload.tags),
    visibility: payload.visibility || "private",
    teacherId: user._id,
    classId: payload.classId || null,
    flashcards: preview.cards,
  });

  await ImportJob.create({
    userId: user._id,
    studySetId: studySet._id,
    sourceType,
    status: "completed",
    filename,
    totalRows: preview.totalRows,
    successRows: preview.validRows,
    errorRows: preview.invalidRows,
    sample: preview.cards.slice(0, 5),
  });

  return studySet;
}

exports.listImportJobs = asyncHandler(async (req, res) => {
  const jobs = await ImportJob.find(
    req.user.role === "admin" ? {} : { userId: req.user._id }
  ).sort({ createdAt: -1 });

  res.json(
    formatSuccess(
      jobs.map((job) => ({
        id: job._id.toString(),
        _id: job._id,
        source_type: job.sourceType,
        status: job.status,
        filename: job.filename,
        total_rows: job.totalRows,
        success_rows: job.successRows,
        error_rows: job.errorRows,
        created_at: job.createdAt,
      }))
    )
  );
});

exports.importText = asyncHandler(async (req, res) => {
  const cards = (req.body.content || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, definition, example = "", hint = "", difficulty = "medium"] = line
        .split("|")
        .map((item) => item.trim());
      return { term, definition, example, hint, difficulty };
    });

  const preview = previewPayload(cards);

  if (String(req.body.preview) === "true" || req.body.preview === true) {
    await ImportJob.create({
      userId: req.user._id,
      sourceType: "text",
      status: "previewed",
      totalRows: preview.totalRows,
      successRows: preview.validRows,
      errorRows: preview.invalidRows,
      sample: preview.cards.slice(0, 5),
    });

    res.json(formatSuccess({ preview, saved: false }));
    return;
  }

  const studySet = await saveStudySetFromImport(req.body, preview, req.user, "text");
  res.json(formatSuccess({ preview, saved: true, studySet: { id: studySet._id.toString(), title: studySet.title } }));
});

exports.importCsv = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new AppError("CSV import requires an uploaded file.", 400);
  }

  const rows = parse(req.file.buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const cards = rows.map((row) => ({
    term: row.term || row.front || row.word || "",
    definition: row.definition || row.back || row.meaning || "",
    example: row.example || "",
    hint: row.hint || "",
    difficulty: row.difficulty || "medium",
  }));

  const preview = previewPayload(cards);

  if (String(req.body.preview) === "true" || req.body.preview === true) {
    await ImportJob.create({
      userId: req.user._id,
      sourceType: "csv",
      status: "previewed",
      filename: req.file.originalname,
      totalRows: preview.totalRows,
      successRows: preview.validRows,
      errorRows: preview.invalidRows,
      sample: preview.cards.slice(0, 5),
    });

    res.json(formatSuccess({ preview, saved: false }));
    return;
  }

  const studySet = await saveStudySetFromImport(
    req.body,
    preview,
    req.user,
    "csv",
    req.file.originalname
  );

  res.json(formatSuccess({ preview, saved: true, studySet: { id: studySet._id.toString(), title: studySet.title } }));
});
