export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

export const STUDY_VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "class-only", label: "Class Only" },
  { value: "public", label: "Public" },
];

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "fill_blank", label: "Fill in the Blank" },
];

export const ASSIGNMENT_STATUS_META = {
  not_started: { label: "Not started", bg: "secondary" },
  in_progress: { label: "In progress", bg: "warning" },
  submitted: { label: "Submitted", bg: "info" },
  completed: { label: "Completed", bg: "success" },
  overdue: { label: "Overdue", bg: "danger" },
};
