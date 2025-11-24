const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load notes from file or initialize with seed data
function loadNotes() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const seed = [
      {
        id: randomUUID(),
        title: 'Welcome to Simple Notes',
        content: 'This is your first note. You can create, view, edit, and delete notes.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        title: 'Ocean Professional Theme',
        content: 'API follows a clean, modern, documented style with blue and amber accents.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    // Corrupt file fallback to empty
    return [];
  }
}

// Persist notes to file
function saveNotes(notes) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

// In-memory cache to reduce file IO per request; still persisted on changes
let cache = loadNotes();

function validateNotePayload(payload, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (!payload || typeof payload !== 'object') {
      errors.push('Body must be a JSON object.');
      return errors;
    }
  }
  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'title')) {
    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string.');
    } else if (payload.title.length > 200) {
      errors.push('title must be <= 200 characters.');
    }
  }
  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'content')) {
    if (typeof payload.content !== 'string') {
      errors.push('content is required and must be a string.');
    } else if (payload.content.length > 10000) {
      errors.push('content must be <= 10000 characters.');
    }
  }
  return errors;
}

// PUBLIC_INTERFACE
function listNotes() {
  /** Returns all notes from cache. */
  return cache;
}

// PUBLIC_INTERFACE
function getNote(id) {
  /** Returns a note by id or null if not found. */
  return cache.find(n => n.id === id) || null;
}

// PUBLIC_INTERFACE
function createNote(payload) {
  /** Creates a new note after validation and persists. */
  const errors = validateNotePayload(payload, false);
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }
  const now = new Date().toISOString();
  const note = {
    id: randomUUID(),
    title: payload.title.trim(),
    content: payload.content,
    createdAt: now,
    updatedAt: now,
  };
  cache.push(note);
  saveNotes(cache);
  return note;
}

// PUBLIC_INTERFACE
function updateNote(id, payload) {
  /** Updates an existing note after validation and persists. */
  const note = getNote(id);
  if (!note) {
    const err = new Error('Note not found');
    err.status = 404;
    throw err;
  }
  const errors = validateNotePayload(payload, true);
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    note.title = payload.title.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'content')) {
    note.content = payload.content;
  }
  note.updatedAt = new Date().toISOString();
  saveNotes(cache);
  return note;
}

// PUBLIC_INTERFACE
function deleteNote(id) {
  /** Deletes a note by id and persists. Returns boolean whether deleted. */
  const before = cache.length;
  cache = cache.filter(n => n.id !== id);
  if (cache.length === before) return false;
  saveNotes(cache);
  return true;
}

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  // Expose for tests
  _internal: { validateNotePayload, DATA_FILE },
};
