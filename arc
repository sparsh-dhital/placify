                         REAL-WORLD CAMPUS PLACEMENT
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      COMPANY / HR       │
                         │  Sends Job Description  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      PLACIFY AGENT      │
                         │ Understands JD + Intent │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     GEMINI / AI         │
                         │ Role • Skills • CGPA    │
                         │ Eligibility • Rounds    │
                         └────────────┬────────────┘
                                      │
                                      ▼
                   ┌────────────────────────────────────┐
                   │          FASTAPI BACKEND            │
                   │       CONTROL / ORCHESTRATION       │
                   └────────────────┬───────────────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   ▼                ▼                ▼
          ┌────────────────┐ ┌───────────────┐ ┌────────────────┐
          │  ELIGIBILITY   │ │   MATCHING    │ │  SCHEDULING    │
          │ CGPA / Backlog │ │ Skills / Score│ │ Time / Conflicts│
          └───────┬────────┘ └───────┬───────┘ └───────┬────────┘
                  │                  │                 │
                  └──────────────────┼─────────────────┘
                                     ▼
                         ┌─────────────────────────┐
                         │        Mongo db  │
                         │     SOURCE OF TRUTH     │
                         ├─────────────────────────┤
                         │ Students                │
                         │ Jobs / Applications     │
                         │ Eligibility / Matches   │
                         │ Shortlists               │
                         │ Interviews              │
                         │ Panels / Rooms          │
                         │ Notifications / Logs    │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     AI RECOMMENDATION   │
                         │ Best candidates / slots │
                         │ Explainable decisions   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     PLACEMENT OFFICER   │
                         │     HUMAN APPROVAL      │
                         └────────────┬────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                    APPROVED                    REJECTED
                         │                         │
                         ▼                         ▼
              ┌──────────────────┐          ┌──────────────┐
              │     EXECUTE      │          │ Re-evaluate  │
              │ Shortlist /      │          │ / Override   │
              │ Schedule         │          └──────────────┘
              └────────┬─────────┘
                       │
                       ▼
          ┌────────────────────────────────┐
          │       REAL-WORLD INTERVIEW     │
          │                                │
          │ Student + Panel + Room + Time  │
          └───────────────┬────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  EXCEPTION?   │
                  └───────┬───────┘
                     NO   │   YES
                      │   │
                      │   ▼
                      │ ┌──────────────────────┐
                      │ │  EXCEPTION AGENT     │
                      │ │ Detect impact        │
                      │ │ Find alternatives    │
                      │ │ Check conflicts      │
                      │ │ Recommend recovery   │
                      │ └──────────┬───────────┘
                      │            ▼
                      │ ┌──────────────────────┐
                      │ │   HUMAN APPROVAL     │
                      │ └──────────┬───────────┘
                      │            ▼
                      │ ┌──────────────────────┐
                      │ │ UPDATE SCHEDULE      │
                      │ │ + DATABASE + LOG     │
                      │ └──────────┬───────────┘
                      │            │
                      └────────────┘
                                   ▼
              ┌────────────────────────────────────┐
              │         PLACEMENT OPERATIONS        │
              ├────────────────────────────────────┤
              │ Student → Interview → Notification │
              │ Panelist → Interview → Feedback    │
              │ TPO → Dashboard → Exceptions       │
              └────────────────┬───────────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │   PLACEMENT ANALYTICS  │
                    │ Skill Gaps • Readiness │
                    │ Outcomes • Activity    │
                    └────────────┬───────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │   REAL-WORLD    │
                         │ PLACEMENT EVENT │
                         └─────────────────┘
