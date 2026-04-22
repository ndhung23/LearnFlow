const AppError = require("./AppError");

function slugify(input = "") {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function parseList(input) {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.map((item) => item.toString().trim()).filter(Boolean);
  }

  return input
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  }

  return fallback;
}

function parseNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function safeJsonParse(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function requireValue(value, message) {
  if (value === undefined || value === null || value === "") {
    throw new AppError(message, 400);
  }

  return value;
}

function buildPagination(query = {}) {
  const page = Math.max(parseNumber(query.page, 1), 1);
  const pageSize = Math.min(Math.max(parseNumber(query.pageSize, 12), 1), 50);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

function formatSuccess(data, meta = undefined) {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

module.exports = {
  slugify,
  normalizeEmail,
  parseList,
  parseBoolean,
  parseNumber,
  safeJsonParse,
  requireValue,
  buildPagination,
  formatSuccess,
};
