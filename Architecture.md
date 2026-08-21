campus-ai-placement/
├── frontend/                     # React, Vite, Tailwind CSS Application
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # v0 & shadcn/ui primitives (WAI-ARIA accessible)
│   │   │   ├── layout/           # Shared navigation (Sidebar, Navbar)
│   │   │   └── shared/           # Reusable cards, modals, and loaders
│   │   ├── context/              # Global state management
│   │   │   └── AuthContext.tsx   # Handles Admin vs. Student vs. Panelist roles
│   │   ├── pages/
│   │   │   ├── AdminDash.tsx     # JD drag-and-drop & schedule approval interface
│   │   │   ├── StudentDash.tsx   # Match score & actionable skill-gap checklist
│   │   │   └── PanelistDash.tsx  # Live interview schedule & friction-free feedback
│   │   ├── services/
│   │   │   └── api.ts            # Axios/Fetch wrappers pointing to FastAPI endpoints
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── agents/               # OpenAI API + Instructor (Strict JSON schemas)
│   │   │   ├── jd_agent.py       # Extracts unstructured PDF text to Pydantic models
│   │   │   ├── match_agent.py    # Evaluates hard/soft rules -> Outputs % fit and gaps
│   │   │   ├── schedule_agent.py # Solves the matrix (students + rooms + panelists)
│   │   │   └── comms_agent.py    # Drafts email/WhatsApp alerts (configured for demo)
│   │   ├── api/                  # FastAPI Routes (The Controller for the Agents)
│   │   │   ├── routes_admin.py   # Endpoints to trigger jd_agent & schedule_agent
│   │   │   ├── routes_student.py # Endpoints to trigger match_agent
│   │   │   └── routes_panel.py   # WebSockets/endpoints for live panelist feedback
│   │   ├── core/                 
│   │   │   ├── config.py         # Environment variables & API keys setup
│   │   │   └── db.py             # Supabase (PostgreSQL) connection pool
│   │   ├── models/               
│   │   │   ├── pydantic_schemas.py # Enforces LLM outputs (used by instructor)
│   │   │   └── db_models.py      # Supabase table mappings
│   │   ├── uploads/              # Temporary storage for uploaded JD PDFs
│   │   └── utils/                
│   │       └── pdf_extractor.py  # OCR / Text extraction before sending to LLM
│   ├── .env                      # Secrets (OpenAI Key, Supabase URL) - Do not commit!
│   ├── main.py                   # FastAPI Application Entry Point
│   └── requirements.txt          # fastapi, pydantic, instructor, openai, supabase
│
└── README.md                     # Setup instructions & Resource Disclosure
