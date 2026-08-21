campus-placement-agent/
│
├── [ CLIENT LAYER ] 
│   └── Placement Dashboard (React + Vite + Tailwind CSS)
│       ├── Job Description Upload & Requirements Viewer
│       ├── Candidate Ranking & AI Explanation Cards
│       └── Human-in-the-Loop Approval Modal
│
├── [ BACKEND API GATEWAY ] (Python / FastAPI)
│   ├── main.py                 -> FastAPI application entry point
│   ├── routers/
│   │   ├── jobs.py             -> POST /api/jobs
│   │   ├── candidates.py       -> GET /api/candidates
│   │   └── agent.py            -> POST /api/match (Invokes AI)
│   │
│   ├── models/                 -> Pydantic Schemas (Data validation)
│   │   ├── student.py          -> Validates academic records & CGPA
│   │   └── job.py              -> Validates extracted JD parameters
│   │
│   └── database.py             -> MongoDB connection (Motor/PyMongo)
│
├── [ AGENT CORE ] (Python Functions)
│   ├── orchestrator.py         -> LLM Reasoning Loop (Plan -> Select Tool)
│   │
│   └── tools.py                -> Deterministic Code Wrappers
│       ├── query_mongo_candidates()    -> Tool 1: DB search
│       ├── calculate_match()           -> Tool 2: Skill gap math
│       └── draft_notification()        -> Tool 3: Format outputs
│
└── [ PERSISTENCE LAYER ] (MongoDB)
    ├── jobs_collection         
    ├── students_collection     
    └── placements_collection
