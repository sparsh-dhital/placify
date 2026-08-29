# Placify — AI Campus Placement Operations Architecture

Placify is a multi-agent AI campus placement operations platform that coordinates the complete placement lifecycle — from Job Description (JD) intake and candidate eligibility to AI-based matching, interview scheduling, communication, exception recovery, and placement analytics.

## End-to-End Architecture

```text
                         REAL-WORLD CAMPUS PLACEMENT
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       COMPANY / HR      │
                         │    Sends Job Description│
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     JD ANALYSIS AGENT   │
                         │     jd_agent.py         │
                         │                         │
                         │ Understands JD, role,   │
                         │ skills & requirements   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       GEMINI / AI       │
                         │                         │
                         │ Semantic understanding  │
                         │ Requirement extraction  │
                         │ Natural-language        │
                         │ explanations            │
                         └────────────┬────────────┘
                                      │
                                      ▼
                   ┌────────────────────────────────────┐
                   │          FASTAPI BACKEND            │
                   │      API + CONTROL + ORCHESTRATION  │
                   │                                     │
                   │ Python + FastAPI + Pydantic         │
                   └────────────────┬───────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
     ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
     │   ELIGIBILITY  │    │ CANDIDATE MATCH  │    │    SCHEDULING   │
     │     ENGINE     │    │      AGENT       │    │      AGENT      │
     │                │    │ match_agent.py   │    │schedule_agent.py│
     │ CGPA           │    │                  │    │                 │
     │ Backlogs       │    │ Skills           │    │ Time slots      │
     │ Graduation     │    │ Semantic fit     │    │ Panels          │
     │ Year           │    │ Match score      │    │ Rooms           │
     │ Job rules      │    │ Explanation      │    │ Conflicts       │
     └───────┬────────┘    └────────┬─────────┘    └────────┬────────┘
             │                      │                       │
             └──────────────────────┼───────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────────┐
                         │        MONGODB          │
                         │     SOURCE OF TRUTH     │
                         │                         │
                         │ Users                   │
                         │ Students                │
                         │ Companies               │
                         │ Jobs                    │
                         │ Applications            │
                         │ Eligibility Results     │
                         │ Candidate Matches       │
                         │ Shortlists              │
                         │ Interviews              │
                         │ Panels / Rooms          │
                         │ Notifications           │
                         │ Agent Conversations     │
                         │ Agent Actions / Logs    │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    AI RECOMMENDATION    │
                         │                         │
                         │ Best candidates         │
                         │ Match explanations      │
                         │ Best interview slots    │
                         │ Operational recovery    │
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
              │ Schedule /       │          └──────────────┘
              │ Placement Action  │
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
                      │ │ EXCEPTION / RECOVERY │
                      │ │      WORKFLOW        │
                      │ │                      │
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
                      │ │ + MONGODB + ACTIVITY │
                      │ └──────────┬───────────┘
                      │            │
                      └────────────┘
                                   ▼
              ┌────────────────────────────────────┐
              │       COMMUNICATION AGENT          │
              │          comms_agent.py            │
              │                                    │
              │ Placement notifications            │
              │ Interview updates                   │
              │ Operational communication           │
              └────────────────┬───────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │        PLACEMENT OPERATIONS        │
              ├────────────────────────────────────┤
              │ Student → Interview → Notification │
              │ Panelist → Interview → Feedback    │
              │ TPO → Dashboard → Exceptions       │
              └────────────────┬───────────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │   PLACEMENT ANALYTICS  │
                    │                        │
                    │ Skill Gaps             │
                    │ Readiness              │
                    │ Matches                │
                    │ Outcomes               │
                    │ Agent Activity         │
                    └────────────────────────┘


                         ┌──────────────────────────────────────┐
                         │          PLACIFY TECH STACK          │
                         └──────────────────┬───────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌───────────────────┐              ┌───────────────────┐              ┌───────────────────┐
│   FRONTEND        │              │     BACKEND      │              │     AI LAYER      │
│                   │              │                   │              │                   │
│ React             │              │ Python            │              │ Google Gemini     │
│ TypeScript        │              │ FastAPI           │              │                   │
│ Vite              │              │ Pydantic          │              │ JD Understanding  │
│ Tailwind CSS      │              │ JWT               │              │ Semantic Matching │
│                   │              │ RBAC              │              │ Explanations      │
│ Role-based UI     │              │                   │              │ AI Reasoning      │
│ Dashboards        │              │ APIs +            │              │ Recommendations   │
│ Chat / Agent UI   │              │ Orchestration     │              │                   │
└─────────┬─────────┘              └─────────┬─────────┘              └─────────┬─────────┘
          │                                  │                                  │
          │                                  │                                  │
          └──────────────────┬───────────────┴──────────────────┬───────────────┘
                             │                                  │
                             ▼                                  ▼
                  ┌───────────────────────┐          ┌────────────────────────┐
                  │    AGENT / SERVICE    │          │      DATA LAYER        │
                  │        LAYER          │          │                        │
                  │                       │          │ MongoDB                │
                  │ JD Analysis Agent     │          │                        │
                  │ Matching Agent        │          │ Students               │
                  │ Scheduling Agent      │          │ Jobs                   │
                  │ Communication Agent   │          │ Applications           │
                  │ Exception/Recovery    │          │ Eligibility             │
                  │                       │          │ Matches                │
                  │ Eligibility Engine    │          │ Shortlists             │
                  │ Business Services      │          │ Interviews             │
                  │                       │          │ Panels / Rooms         │
                  └───────────┬───────────┘          │ Notifications           │
                              │                      │ Agent Activity          │
                              │                      │ Workflow State          │
                              │                      └───────────┬────────────┘
                              │                                  │
                              └──────────────────┬───────────────┘
                                                 │
                                                 ▼
                                  ┌──────────────────────────┐
                                  │   HUMAN-IN-THE-LOOP      │
                                  │                          │
                                  │ Placement Officer        │
                                  │ Reviews recommendations  │
                                  │ Approves actions         │
                                  │ Handles exceptions       │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │    PLACEMENT WORKFLOW    │
                                  │                          │
                                  │ JD → Eligibility         │
                                  │     → Matching           │
                                  │     → Shortlisting       │
                                  │     → Scheduling         │
                                  │     → Notification       │
                                  │     → Interview          │
                                  │     → Feedback           │
                                  │     → Recovery           │
                                  │     → Analytics          │
                                  └──────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         WHAT EACH TECHNOLOGY DOES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React
  → Builds the interactive web application and role-based dashboards.

TypeScript
  → Provides type safety and reliable frontend development.

Vite
  → Runs the frontend development server and handles the production build.

Tailwind CSS
  → Provides the responsive, professional UI styling.

Python
  → Implements backend logic, agents, services and placement workflows.

FastAPI
  → Exposes REST APIs and acts as the communication/orchestration layer
    between the frontend, agents, business logic and database.

Pydantic
  → Validates API requests/responses and keeps data structures consistent.

JWT + RBAC
  → Authenticates users and controls capabilities for:
      • Placement Officer
      • Student
      • Panelist

Google Gemini
  → Provides AI capabilities such as:
      • Job Description understanding
      • Requirement extraction
      • Semantic reasoning
      • Candidate-match explanations
      • AI recommendations

MongoDB
  → Acts as the persistent source of truth for the application's
    operational data and agent/workflow state.

AI / Agent Layer
  → Converts AI capabilities into operational actions instead of
    functioning only as a conversational chatbot.

Deterministic Eligibility Engine
  → Applies strict placement rules such as CGPA, backlog and
    graduation-year requirements consistently.

Human-in-the-Loop
  → Keeps consequential placement decisions under authorized
    human control and allows officers to approve or override
    AI-generated recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              CORE FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 COMPANY / HR
      │
      ▼
 Job Description
      │
      ▼
 ┌─────────────────────┐
 │  JD ANALYSIS AGENT  │ ────────► Gemini
 └──────────┬──────────┘
            │
            ▼
    Structured Job Data
            │
            ▼
 ┌─────────────────────┐
 │ ELIGIBILITY ENGINE  │
 └──────────┬──────────┘
            │
            ▼
      Eligible Pool
            │
            ▼
 ┌─────────────────────┐
 │  MATCHING AGENT     │ ────────► Gemini
 └──────────┬──────────┘
            │
            ▼
     Match Scores +
     Explanations
            │
            ▼
 ┌─────────────────────┐
 │ PLACEMENT OFFICER   │
 │ HUMAN APPROVAL      │
 └──────────┬──────────┘
            │
            ▼
 ┌─────────────────────┐
 │ SCHEDULING AGENT    │
 └──────────┬──────────┘
            │
            ▼
   Conflict-free
   Interview Schedule
            │
            ▼
 ┌─────────────────────┐
 │ COMMUNICATION AGENT │
 └──────────┬──────────┘
            │
            ▼
      Notifications
            │
            ▼
       INTERVIEW
            │
            ▼
       EXCEPTION?
        /       \
      NO         YES
      │           │
      │           ▼
      │    ┌────────────────────┐
      │    │ EXCEPTION /        │
      │    │ RECOVERY WORKFLOW  │
      │    └─────────┬──────────┘
      │              │
      │              ▼
      │       Alternative Plan
      │              │
      │              ▼
      │       Human Approval
      │              │
      │              ▼
      │       Update MongoDB
      │              │
      └──────────────┘
                     │
                     ▼
              Feedback + Analytics


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ONE-LINE PITCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Placify combines React, FastAPI, Python, Gemini, MongoDB and specialized
AI agents with deterministic placement rules and human-in-the-loop approval
to automate the complete campus placement operations lifecycle.
