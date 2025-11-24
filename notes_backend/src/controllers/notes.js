const notesService = require('../services/notes');

class NotesController {
  // PUBLIC_INTERFACE
  list(req, res) {
    /** List all notes. */
    const notes = notesService.listNotes();
    return res.status(200).json({ status: 'success', data: notes });
  }

  // PUBLIC_INTERFACE
  get(req, res) {
    /** Get a single note by ID. */
    const note = notesService.getNote(req.params.id);
    if (!note) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found',
        accent: '#F59E0B',
      });
    }
    return res.status(200).json({ status: 'success', data: note });
  }

  // PUBLIC_INTERFACE
  create(req, res) {
    /** Create a new note with validation. */
    try {
      const created = notesService.createNote(req.body);
      return res.status(201).json({ status: 'success', data: created });
    } catch (e) {
      const code = e.status || 500;
      return res.status(code).json({
        status: 'error',
        message: e.message || 'Failed to create note',
        errors: e.details || undefined,
        accent: '#2563EB',
      });
    }
  }

  // PUBLIC_INTERFACE
  update(req, res) {
    /** Update an existing note by ID with validation. */
    try {
      const updated = notesService.updateNote(req.params.id, req.body);
      return res.status(200).json({ status: 'success', data: updated });
    } catch (e) {
      const code = e.status || 500;
      return res.status(code).json({
        status: 'error',
        message: e.message || 'Failed to update note',
        errors: e.details || undefined,
        accent: '#2563EB',
      });
    }
  }

  // PUBLIC_INTERFACE
  delete(req, res) {
    /** Delete a note by ID. */
    const ok = notesService.deleteNote(req.params.id);
    if (!ok) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found',
        accent: '#EF4444',
      });
    }
    return res.status(204).send();
  }
}

module.exports = new NotesController();
