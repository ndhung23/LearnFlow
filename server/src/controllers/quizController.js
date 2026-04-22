const Quiz = require("../models/Quiz");
const StudySet = require("../models/StudySet");
const Submission = require("../models/Submission");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess } = require("../utils/helpers");
const { ensureStudySetAccess } = require("./shared");

function buildQuestionsFromStudySet(studySet) {
  return studySet.flashcards.slice(0, 10).map((flashcard, index, cards) => {
    const distractors = cards
      .filter((item) => item._id.toString() !== flashcard._id.toString())
      .slice(0, 3)
      .map((item) => ({ text: item.definition }));

    if (index % 2 === 0) {
      return {
        question: `Which definition matches "${flashcard.term}"?`,
        type: "mcq",
        choices: [{ text: flashcard.definition }, ...distractors].sort(() => Math.random() - 0.5),
        correctAnswer: flashcard.definition,
      };
    }

    return {
      question: `True or false: ${flashcard.term} means "${flashcard.definition}".`,
      type: "true_false",
      choices: [{ text: "True" }, { text: "False" }],
      correctAnswer: "True",
    };
  });
}

exports.createQuiz = asyncHandler(async (req, res) => {
  const studySet = await StudySet.findById(req.body.studySetId);

  if (!studySet) {
    throw new AppError("Study set not found.", 404);
  }

  if (
    req.user.role !== "admin" &&
    studySet.teacherId.toString() !== req.user._id.toString()
  ) {
    throw new AppError("You can only create quizzes from your own study sets.", 403);
  }

  const quiz = await Quiz.create({
    title: req.body.title,
    studySetId: studySet._id,
    teacherId: req.user._id,
    instructions: req.body.instructions || "",
    passScore: req.body.passScore || 70,
    timeLimitMinutes: req.body.timeLimitMinutes || 10,
    questions:
      Array.isArray(req.body.questions) && req.body.questions.length
        ? req.body.questions
        : buildQuestionsFromStudySet(studySet),
  });

  res.status(201).json(formatSuccess({ id: quiz._id.toString(), _id: quiz._id }));
});

exports.getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate("studySetId", "title visibility teacherId classId");

  if (!quiz) {
    throw new AppError("Quiz not found.", 404);
  }

  await ensureStudySetAccess(quiz.studySetId._id, req.user);

  res.json(
    formatSuccess({
      id: quiz._id.toString(),
      _id: quiz._id,
      title: quiz.title,
      instructions: quiz.instructions,
      pass_score: quiz.passScore,
      time_limit_minutes: quiz.timeLimitMinutes,
      study_set_id: quiz.studySetId._id,
      study_set_title: quiz.studySetId.title,
      questions: quiz.questions.map((question) => ({
        id: question._id.toString(),
        _id: question._id,
        prompt: question.question,
        question_type: question.type,
        choices: question.choices.map((choice) => ({
          id: choice._id.toString(),
          _id: choice._id,
          choice_text: choice.text,
        })),
      })),
    })
  );
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw new AppError("Quiz not found.", 404);
  }

  const answersByQuestionId = new Map(
    (req.body.answers || []).map((answer) => [answer.questionId, answer])
  );

  const review = quiz.questions.map((question) => {
    const answer = answersByQuestionId.get(question._id.toString()) || {};
    const userAnswer = answer.answerText || answer.selectedChoiceId || "";
    const selectedChoice = question.choices.find(
      (choice) => choice._id.toString() === answer.selectedChoiceId
    );
    const resolvedAnswer = selectedChoice?.text || userAnswer || "";
    const isCorrect =
      resolvedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    return {
      questionId: question._id.toString(),
      prompt: question.question,
      correctAnswer: question.correctAnswer,
      answerText: resolvedAnswer,
      isCorrect,
    };
  });

  const totalQuestions = review.length;
  const correctAnswers = review.filter((item) => item.isCorrect).length;
  const score = totalQuestions
    ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2))
    : 0;

  const submission = await Submission.create({
    studentId: req.user._id,
    assignmentId: req.body.assignmentId || null,
    studySetId: quiz.studySetId,
    quizId: quiz._id,
    mode: req.body.mode || "quiz",
    answers: review.map((item) => ({
      questionId: item.questionId,
      answer: item.answerText,
      isCorrect: item.isCorrect,
    })),
    score,
    completionRate: score,
    submittedAt: new Date(),
  });

  res.json(
    formatSuccess({
      submission: {
        id: submission._id.toString(),
      },
      score,
      correctAnswers,
      totalQuestions,
      passed: score >= quiz.passScore,
      review,
    })
  );
});
