Simple Notes API (Express)

Overview
- Port: 3001
- Docs: GET /docs
- Health: GET /

Endpoints
- GET /notes — list all notes
- GET /notes/:id — get one note
- POST /notes — create a note
- PUT /notes/:id — update a note
- DELETE /notes/:id — delete a note

Request/Response examples
1) List notes
curl -s http://localhost:3001/notes

2) Get by id
curl -s http://localhost:3001/notes/<id>

3) Create
curl -s -X POST http://localhost:3001/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"New note","content":"Body"}'

4) Update
curl -s -X PUT http://localhost:3001/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","content":"Updated body"}'

5) Delete
curl -s -X DELETE http://localhost:3001/notes/<id>

Validation
- title: required, string, 1..200 chars
- content: required, string, <= 10000 chars

Storage
- File-backed storage at notes_backend/data/notes.json with seed data created on first run.
- In-memory cache is used with persistence to file on create/update/delete.

Style
- Ocean Professional: clear, modern responses with status fields and consistent error shapes.
