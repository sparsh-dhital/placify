campus-ai-placement/
├── frontend/                     # React + Vite + Tailwind CSS Application
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui primitives (Semantic HTML5 & WAI-ARIA compliant)
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── context/              # Global state (Auth, User Role)
│   │   │   └── AuthContext.tsx
│   │   ├── lib/                  # Required for shadcn/ui helpers
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── student/
│   │   │   ├── admin/
│   │   │   └── panelist/
│   │   ├── services/
│   │   │   └── api.ts            # Axios/Fetch wrappers pointing to FastAPI
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js         
│   ├── tailwind.config.js
│   ├── tsconfig.json             
│   └── vite.config.ts
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── agent/                # 👈 ADJUSTED: Single Agent Core (Pattern A)
│   │   │   ├── orchestrator.py   # Main LLM Reasoning Loop
│   │   │   └── tools/            # Deterministic code wrappers for the agent
│   │   │       ├── parser.py     
│   │   │       ├── matcher.py    
│   │   │       └── scheduler.py  
│   │   ├── api/                  # API Endpoint Routes
│   │   │   ├── admin.py
│   │   │   ├── student.py
│   │   │   └── panelist.py
│   │   ├── core/                 # DB Connection & Config
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/               # Pydantic Schemas & DB Entities
│   │   │   ├── db_models.py
│   │   │   └── schemas.py
│   │   ├── uploads/              # Temp folder for uploaded PDFs
│   │   └── utils/                # Helper scripts 
│   │       └── pdf_extractor.py
│   ├── .env
│   ├── campus_placement.db       # 👈 NOTED: SQLite Local DB
│   ├── main.py                   # FastAPI Entry Point
│   └── requirements.txt
│
└── README.md
