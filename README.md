# KnowFlow AI — full-stack skeleton

A working RAG (Retrieval-Augmented Generation) application: upload documents,
they get chunked and embedded into a vector store, and you can ask grounded,
cited questions about them in a chat UI.

This is the **skeleton** milestone: the ingestion pipeline, retrieval,
generation, chat, document management, and dashboard are all real and wired
end-to-end. Auth, Postgres/Supabase, streaming tokens, and Docker/CI polish
are intentionally deferred — see "What's not here yet" below.

## Stack

- **Backend**: FastAPI, ChromaDB (persistent, local), sentence-transformers
  embeddings (HuggingFace, runs locally — no API key needed for retrieval),
  OpenAI for generation (swappable to Ollama), SQLite for metadata/history.
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, React
  Query, Framer Motion, react-markdown.

## Project structure

```
knowflow-ai/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + router registration
│   │   ├── config.py          # env-driven settings
│   │   ├── routers/           # HTTP layer (documents, chat, dashboard)
│   │   ├── services/          # business logic (ingestion, RAG orchestration)
│   │   ├── rag/                # chunking, vector store, LLM call
│   │   ├── database/           # SQLite connection + schema
│   │   ├── models/schemas.py   # Pydantic request/response models
│   │   └── utils/file_parser.py
│   ├── data/                  # uploads + chroma db + sqlite (gitignored)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/                   # dashboard (/), /chat, /documents
    ├── components/            # Sidebar, ChatWindow, UploadModal, etc.
    ├── lib/api.ts             # typed axios client for the backend
    └── types/index.ts
```

## Running it locally

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then add your OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

The first run will download the sentence-transformers embedding model
(~80MB) — that's expected and only happens once.

Without an `OPENAI_API_KEY`, retrieval still works end-to-end (upload,
chunk, embed, search) but the answer text will say generation is stubbed,
so you can verify the pipeline before spending API credits.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

### 3. Or both via Docker Compose

```bash
cp backend/.env.example backend/.env   # add your OPENAI_API_KEY
docker compose up --build
```

## API surface (matches the spec)

| Method | Path                       | Purpose                          |
|--------|----------------------------|-----------------------------------|
| POST   | `/api/upload`              | Upload + ingest a document        |
| GET    | `/api/documents`           | List documents                    |
| DELETE | `/api/documents/{id}`      | Delete a document + its vectors   |
| POST   | `/api/chat`                | Ask a question, get grounded answer + sources |
| GET    | `/api/history`             | List conversations                |
| GET    | `/api/history/{id}`        | Get a conversation with messages  |
| PATCH  | `/api/history/{id}`        | Rename a conversation             |
| DELETE | `/api/history/{id}`        | Delete a conversation             |
| GET    | `/api/dashboard`           | Aggregate stats                   |

## What's not here yet

These are on the roadmap from the original spec but deliberately out of
scope for the skeleton, so we could get a real, working pipeline in front
of you fast:

- **Auth** (Clerk/NextAuth) — every request is currently unauthenticated
  and single-tenant.
- **Postgres/Supabase** — using SQLite locally; swapping is mostly a matter
  of changing `database/db.py`'s connection since the SQL is standard.
- **Streaming responses** — chat currently waits for the full answer.
  OpenAI's streaming API is a small change in `rag/llm.py` + an SSE
  endpoint.
- **Admin dashboard** (multi-user stats) — the current `/dashboard` is
  single-tenant stats, which is what "Admin Dashboard" reduces to without
  auth.
- **Hybrid search, OCR, image extraction, multi-collection** — bonus
  features from the spec, not yet implemented.
- **CI/CD, automated tests** — not yet added.

## Design notes

Dark ink-navy theme with a teal "flow" accent for primary actions/nav and a
warm amber accent reserved specifically for source citations, so the
grounding — the whole point of RAG — is visually distinct from the rest of
the UI rather than just another gray badge.
