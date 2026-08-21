# PLACIFY — AI CAMPUS PLACEMENT OPERATIONS PLATFORM

## 1. PROJECT GOAL

Goal:
Eliminate the manual, spreadsheet-heavy, and email/WhatsApp-driven
chaos of college placements by using AI Agents to automate
placement operations while keeping human administrators in control
of final decisions.

Placify connects:

Admin / TPO
Student
Panelist / Recruiter

through one intelligent placement system.


# 2. CORE USER EXPERIENCES

## A. ADMIN / TPO

Main purpose:
Placement control center.

Workflow:

Upload Job Description PDF
→ AI extracts requirements
→ Admin reviews requirements
→ Approve Job
→ Find eligible students
→ AI matches candidates
→ Admin reviews shortlist
→ Approve shortlist
→ Generate interview schedule
→ Check panel + room conflicts
→ AI repairs conflicts if required
→ Admin approves schedule
→ Send notifications
→ Monitor pending actions and exceptions
→ View reports and analytics


## B. STUDENT

Main purpose:
Personalized placement and career dashboard.

Workflow:

Upload Resume
→ Resume text extraction
→ Student profile creation
→ Resume embedding
→ Compare with available jobs
→ Match score
→ Explain why the student matches
→ Show missing skills
→ Show skill-gap checklist
→ Show placement-readiness information
→ View interview schedule
→ Receive notifications


## C. PANELIST / RECRUITER

Main purpose:
Simple interview and feedback interface.

Workflow:

Login
→ View today's interviews
→ View candidate
→ View resume/profile
→ View interview details
→ Conduct interview
→ Submit Pass / Fail / Feedback
→ Save feedback
→ TPO dashboard updates


# 3. OFFICIAL CORE FEATURES

## FEATURE 1 — JOB DESCRIPTION & ELIGIBILITY EXTRACTION

Purpose:
Convert an unstructured company Job Description into structured
placement requirements.

Input:
- PDF Job Description
- Optional pasted text

Workflow:

Company / TPO
→ Upload JD PDF
→ PDF text extraction
→ JD Agent
→ Structured Pydantic JSON
→ Validation
→ Admin Review
→ Save to Supabase

Information to extract:

- Company name
- Job role
- Job location
- Salary / package
- Eligible branches
- Minimum CGPA
- Maximum allowed backlogs
- Graduation year
- Mandatory skills
- Preferred skills
- Experience requirements
- Selection stages
- Test requirements
- Interview requirements
- Other explicit eligibility conditions

AI responsibilities:

- Understand unstructured JD
- Extract requirements
- Separate mandatory vs preferred criteria
- Handle natural language
- Convert requirements into structured data

Code responsibilities:

- PDF text extraction
- Pydantic schema validation
- Data normalization
- Database storage
- Required-field validation

Human responsibility:

- Review extracted requirements
- Edit incorrect extraction
- Approve final job requirements

Main Agent:
JD Agent

Main Output:
Structured Job Profile


Example:

Input:

"ABC Technologies is hiring Software Developers.
CSE/IT students with CGPA above 7.5,
no active backlogs, Java and SQL mandatory,
React preferred."

Output:

Company:
ABC Technologies

Role:
Software Developer

Branches:
CSE, IT

Minimum CGPA:
7.5

Backlogs:
0

Mandatory:
- Java
- SQL

Preferred:
- React


# 4. FEATURE 2 — STUDENT ELIGIBILITY VERIFICATION

Purpose:
Automatically verify whether students satisfy the company's
hard eligibility criteria.

Workflow:

Approved Job Requirements
→ Student Database
→ Eligibility Engine
→ Check hard rules
→ Eligible / Not Eligible
→ Store result

Hard eligibility checks:

- Branch
- CGPA
- Backlog count
- Graduation year
- Other explicitly stated company rules

Example:

Job:

CGPA >= 7.5
Branch = CSE / IT
Backlogs = 0

Student A:

CGPA = 8.3
Branch = CSE
Backlogs = 0

Result:
ELIGIBLE

Student B:

CGPA = 7.1
Branch = CSE
Backlogs = 0

Result:
NOT ELIGIBLE

Reason:
CGPA below required 7.5

Important rule:

AI extracts the eligibility requirements.
Deterministic backend code verifies eligibility.

Do NOT allow the LLM to decide exact:
- CGPA comparisons
- Backlog comparisons
- Branch eligibility
- Other exact numerical rules

Main Output:

Eligible Students
+
Ineligible Students
+
Reason for Ineligibility


# 5. FEATURE 3 — SKILL-BASED CANDIDATE MATCHING WITH EXPLANATIONS

Purpose:
Find the strongest candidates among students who are already
eligible for the job.

Workflow:

Eligible Students
→ Student Profiles / Resumes
→ Semantic Search
→ Skill Comparison
→ Matchmaker Agent
→ Ranking
→ Explanation
→ Admin Review

Matching signals:

HARD:
- Eligibility
- Required skills

SOFT:
- Preferred skills
- Resume skills
- Projects
- Experience
- Relevant technologies
- Semantic similarity

Architecture:

Job Requirements
        ↓
Hard Eligibility Filter
        ↓
Eligible Students
        ↓
Vector / Semantic Search
        ↓
Matchmaker Agent
        ↓
Candidate Ranking
        ↓
Explanation

Important:

Eligibility should be deterministic.

Semantic matching can use embeddings / vector similarity.

The Matchmaker Agent should explain the result.

Example:

Candidate:
Rahul

Fit:
89%

Mandatory:
Java       ✅
SQL        ✅

Preferred:
React      ✅
AWS        ❌

Other:
CGPA       ✅ 8.4
Branch     ✅ CSE

Explanation:

"Rahul satisfies all mandatory eligibility criteria,
matches the required Java and SQL skills, and also has
the preferred React skill. AWS is not present in his profile."


Main Agent:
Matchmaker Agent

Main Outputs:

- Candidate ranking
- Match score / fit
- Matched skills
- Missing skills
- Explanation
- Recommendation


# 6. FEATURE 4 — INTERVIEW & TEST SCHEDULING

Purpose:
Automatically create interview / test schedules while respecting
real placement constraints.

Inputs:

- Approved candidates
- Interview duration
- Company timing
- Candidate availability
- Panel availability
- Room availability
- Number of panels
- Number of rooms
- Interview rounds

Workflow:

Approved Candidate List
→ Scheduler Agent
→ Get availability
→ Generate possible slots
→ Check constraints
→ Detect conflicts
→ Create proposed schedule
→ Admin Review
→ Approve
→ Confirm schedule

Example:

Candidate:
Rahul
Time:
10:30 AM
Panel:
Panel A
Room:
Room 204

Scheduler must verify:

- Rahul available?
- Panel A available?
- Room 204 available?
- No overlapping interview?
- Room capacity sufficient?
- Interview duration valid?


Main Agent:
Scheduler Agent

AI responsibilities:

- Understand scheduling requirements
- Plan schedule
- Choose among valid alternatives
- Reason about changes
- Re-plan when constraints change

Code responsibilities:

- Availability checks
- Time calculations
- Conflict detection
- Constraint validation
- Database updates


# 7. SIGNATURE AGENTIC FEATURE — SELF-REPAIRING INTERVIEW SCHEDULE

This is the main Agentic-AI demonstration.

Scenario:

Initial schedule:

10:00 → Rahul → Panel A → Room 201
10:30 → Aman  → Panel B → Room 202
11:00 → Ravi  → Panel A → Room 201

New event:

Panel A becomes unavailable.

Normal system:

"Scheduling conflict."

Placify:

Panel unavailable
→ Detect affected interviews
→ Identify affected candidates
→ Check candidate availability
→ Check other panel availability
→ Check room availability
→ Generate valid alternatives
→ Evaluate alternatives
→ Create repaired schedule
→ Admin approval
→ Update schedule
→ Notify affected users

Example:

Old:
11:00 Ravi → Panel A → Room 201

New:
11:30 Ravi → Panel B → Room 202

The system must validate the new schedule before presenting it.

This is the main proof that Placify is an Agentic AI system:

Observe
→ Reason
→ Use Tools
→ Re-plan
→ Act


# 8. FEATURE 5 — PANEL & ROOM COORDINATION

Purpose:
Coordinate physical interview resources and avoid double booking.

## PANEL DATA

- Panel ID
- Panel name
- Panel members
- Expertise
- Availability
- Assigned interviews

## ROOM DATA

- Room ID
- Room name
- Capacity
- Equipment
- Availability
- Assigned interviews

Workflow:

Interview Requirement
→ Check Panels
→ Check Rooms
→ Check Candidate Availability
→ Assign Panel
→ Assign Room
→ Validate
→ Save

Checks:

- Panel available?
- Room available?
- Candidate available?
- Time conflict?
- Panel double-booking?
- Room double-booking?
- Capacity sufficient?


# 9. FEATURE 6 — STUDENT NOTIFICATIONS & REMINDERS

Purpose:
Replace repeated manual communication through WhatsApp,
email and spreadsheets.

Workflow:

Approved Schedule
→ Communication Agent
→ Generate Notification
→ Approval / Trigger
→ Send
→ Log Delivery

Notifications can include:

- Interview scheduled
- Interview reminder
- Interview time change
- Room change
- Test instructions
- Important placement updates

Student message example:

"ABC Technologies Interview Scheduled

Date: 22 August
Time: 11:30 AM
Room: 204
Panel: Panel B

Please report 15 minutes before the interview."

Panelist message example:

"Today's Interview

Candidate: Rahul
Time: 11:30 AM
Room: 204
Resume available in Placify."


AI responsibilities:

- Draft
- Personalize
- Summarize
- Explain changes

Code responsibilities:

- Trigger
- Recipient
- Exact time
- Delivery status
- Logging

Main Agent:
Communication Agent


# 10. FEATURE 7 — PLACEMENT DASHBOARD

Purpose:
Provide one command center for placement administrators.

The dashboard should NOT only show statistics.

It should answer:

"WHAT NEEDS MY ATTENTION NOW?"

## OVERVIEW

Show:

- Active placement drives
- Total students
- Eligible students
- Matched students
- Scheduled interviews
- Pending approvals
- Conflicts
- Completed actions

## PENDING ACTIONS

Examples:

- JD awaiting approval
- Candidate shortlist awaiting approval
- Schedule awaiting approval
- Student confirmation pending
- Panel feedback pending
- Company requirement incomplete

## EXCEPTIONS

Examples:

- Panel unavailable
- Room conflict
- Candidate time conflict
- Missing student data
- Schedule conflict
- Failed notification
- Unconfirmed interview
- Incomplete JD requirement

## AGENT ACTIVITY

Example:

10:32
JD requirements extracted

10:33
42 eligible students found

10:34
12 candidates recommended

10:35
Interview schedule generated

10:36
Panel B conflict detected

10:36
Alternative schedule found

10:37
Waiting for admin approval

Main Purpose:

The TPO should spend less time checking spreadsheets
and more time handling actual exceptions.


# 11. FEATURE 8 — SKILL-GAP & PLACEMENT-READINESS ANALYTICS

Purpose:
Help students and placement staff understand where
students are strong and where skill improvement is needed.

Workflow:

Student Resume / Profile
→ Extract Skills
→ Compare with Job Requirements
→ Identify Skill Gap
→ Aggregate Data
→ Generate Insights

Example:

Target Job:

Java
SQL
React
AWS

Student:

Java
SQL

Gap:

React
AWS

Student Dashboard:

Missing Skills:
- React
- AWS

Recommended focus:
- React fundamentals
- AWS fundamentals


## Placement-level analytics

Show:

Top demanded skills
→ Java
→ SQL
→ React
→ AWS
→ Python

Common student skill gaps
→ Cloud
→ React
→ System Design

Job-fit trends
→ Number of suitable jobs per student

Placement-readiness indicators
→ Skills
→ Eligibility
→ Profile completeness
→ Job fit


Important:

Readiness score is a prototype indicator,
not a guaranteed prediction of placement success.


# 12. MULTI-AGENT SYSTEM

Placify uses four main agents.

## JD AGENT

Input:
Job Description PDF

Does:
- Extract job information
- Extract eligibility
- Extract skills
- Structure requirements

Output:
Job Profile JSON


## MATCHMAKER AGENT

Input:
Job requirements
+
Eligible students
+
Resume / skill information

Does:
- Compare profiles
- Use semantic matching
- Rank candidates
- Explain matches
- Identify gaps

Output:
Candidate Ranking


## SCHEDULER AGENT

Input:
Approved candidates
+
Panels
+
Rooms
+
Availability
+
Constraints

Does:
- Generate interview schedule
- Detect conflicts
- Find alternatives
- Re-plan

Output:
Proposed / repaired schedule


## COMMUNICATION AGENT

Input:
Approved actions

Does:
- Draft personalized messages
- Prepare reminders
- Prepare interview updates

Output:
Notifications


# 13. AGENT COMMUNICATION FLOW

JD Agent
    ↓
Job Profile
    ↓
Matchmaker Agent
    ↓
Candidate Matches
    ↓
Human Approval
    ↓
Scheduler Agent
    ↓
Interview Schedule
    ↓
Human Approval
    ↓
Communication Agent
    ↓
Notifications


# 14. AGENTIC AI LOOP

Each agent should not simply behave like a chatbot.

Core pattern:

GOAL
↓
UNDERSTAND
↓
PLAN
↓
SELECT TOOL
↓
EXECUTE TOOL
↓
OBSERVE RESULT
↓
REASON
↓
NEXT ACTION
↓
COMPLETE / RE-PLAN


Example:

Scheduler Agent

Goal:
Schedule all interviews.

↓
Check availability

↓
Conflict found

↓
Identify affected interviews

↓
Search alternatives

↓
Validate alternatives

↓
Select best valid option

↓
Request human approval

↓
Update schedule


# 15. AI VS NORMAL CODE VS HUMAN

## AI AGENTS

AI should handle:

- Natural-language understanding
- JD extraction
- Mandatory vs preferred interpretation
- Semantic candidate matching
- Match explanation
- Schedule planning
- Alternative reasoning
- Re-planning
- Notification drafting


## NORMAL CODE

Code should handle:

- Database queries
- CGPA comparison
- Branch checking
- Backlog checking
- Eligibility verification
- Availability checking
- Conflict detection
- Room capacity
- Time calculation
- Schedule validation
- Database updates
- Authentication
- Audit logging


## HUMAN ADMIN

Human should control:

- Final candidate selection
- Approval of important shortlist decisions
- Approval of schedule changes
- Important communications
- Final placement decisions


# 16. RESUME + VECTOR SEARCH PIPELINE

Student Resume
↓
Resume Text Extraction
↓
Student Profile
↓
Embedding Model
↓
Vector Representation
↓
Supabase / pgvector
↓
Semantic Job Matching
↓
Matchmaker Agent


Purpose:

Find semantically relevant candidates even when
the exact same words are not used.

Example:

Student:
"Built a MERN bus tracking application."

Job:
"Requires full-stack web development experience."

Semantic search can identify the relevance.


# 17. DATABASE RESPONSIBILITIES

## SUPABASE POSTGRESQL

Source of truth for structured data.

Main entities:

- Users
- Students
- Jobs
- Applications
- Panels
- Rooms
- Interviews
- Candidate Matches
- Notifications
- Approvals
- Agent Logs
- Feedback
- Skills


## SUPABASE PGVECTOR

For semantic information such as:

- Resume embeddings
- Job-description embeddings
- Project/profile embeddings


# 18. MAIN DATA FLOW

## JOB SIDE

JD PDF
↓
PDF Extractor
↓
JD Agent
↓
Pydantic JSON
↓
Supabase
↓
Matchmaker


## STUDENT SIDE

Resume
↓
Resume Parser
↓
Student Profile
↓
Embedding
↓
pgvector
↓
Matchmaker


## PLACEMENT SIDE

Eligible Candidates
↓
Scheduler Agent
↓
Panel + Room + Time
↓
Conflict Detection
↓
Re-planning
↓
Admin Approval
↓
Final Schedule


## COMMUNICATION SIDE

Approved Action
↓
Communication Agent
↓
Email / WhatsApp / In-App
↓
Delivery Log


# 19. USER ROLES

## ADMIN / TPO

Can:
- Upload JD
- Review extracted requirements
- Approve job
- View eligible students
- Review candidate matches
- Approve shortlist
- Generate schedules
- Approve schedule
- View conflicts
- Monitor pending actions
- View analytics
- Manage panels/rooms


## STUDENT

Can:
- Upload resume
- View profile
- View eligible jobs
- View match score
- View matching explanation
- View missing skills
- View readiness insights
- View interview schedule
- Receive notifications


## PANELIST / RECRUITER

Can:
- View schedule
- View candidate
- View resume
- View interview details
- Submit feedback
- Mark pass/fail
- Add comments


# 20. MAIN PROJECT ARCHITECTURE

Frontend:
React
+
Vite
+
Tailwind CSS
+
shadcn/ui

        ↓

FastAPI Backend

        ↓

AI Agent Layer

JD Agent
Matchmaker Agent
Scheduler Agent
Communication Agent

        ↓

Tools / Services

        ↓

Supabase PostgreSQL
+
Supabase pgvector

        ↓

Admin / Student / Panelist workflows


# 21. PROJECT REPOSITORY STRUCTURE

campus-ai-placement/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   └── shared/
│       │
│       ├── context/
│       │   └── AuthContext.tsx
│       │
│       ├── pages/
│       │   ├── AdminDash.tsx
│       │   ├── StudentDash.tsx
│       │   └── PanelistDash.tsx
│       │
│       ├── services/
│       │   └── api.ts
│       │
│       ├── App.tsx
│       └── main.tsx
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── jd_agent.py
│   │   │   ├── match_agent.py
│   │   │   ├── schedule_agent.py
│   │   │   └── comms_agent.py
│   │   │
│   │   ├── api/
│   │   │   ├── routes_admin.py
│   │   │   ├── routes_student.py
│   │   │   └── routes_panel.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── db.py
│   │   │
│   │   ├── models/
│   │   │   ├── pydantic_schemas.py
│   │   │   └── db_models.py
│   │   │
│   │   ├── uploads/
│   │   │
│   │   └── utils/
│   │       └── pdf_extractor.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
└── README.md


# 22. TECH STACK

Frontend:
- React
- Vite
- Tailwind CSS
- shadcn/ui

Backend:
- Python
- FastAPI

AI:
- OpenAI API
- Instructor
- Pydantic

Database:
- Supabase
- PostgreSQL
- pgvector

File handling:
- PDF text extraction
- Temporary JD uploads
- Resume uploads

Deployment:
- Frontend deployment
- Backend deployment
- Cloud database


# 23. MAIN SIGNATURE FEATURE

## SELF-REPAIRING PLACEMENT SCHEDULING

This should be the main live Agentic-AI demonstration.

Normal state:

Candidates
→ Schedule
→ Panels
→ Rooms

Change:

Panel becomes unavailable.

Placify:

Detect
→ Understand affected interviews
→ Search alternatives
→ Recalculate
→ Validate
→ Re-plan
→ Ask Admin approval
→ Update schedule
→ Notify affected users


# 24. MAIN VALUE OF PLACIFY

Traditional process:

PDF
→ Spreadsheet
→ Manual filtering
→ WhatsApp
→ Manual scheduling
→ Google Forms
→ Manual updates
→ Conflicts
→ Rework


Placify:

PDF
→ JD Agent
→ Eligibility
→ Matchmaker
→ Human approval
→ Scheduler Agent
→ Conflict detection
→ Replanning
→ Human approval
→ Communication
→ Dashboard
→ Analytics


# 25. FINAL PROJECT PRINCIPLES

1. AI reasons.
2. Deterministic code verifies.
3. Agents use tools.
4. Agents can re-plan.
5. Humans control consequential decisions.
6. Every candidate recommendation should be explainable.
7. Every important action should be traceable.
8. The system should reduce manual placement work.
9. The dashboard should focus on exceptions and pending actions.
10. The final demo should prove real agentic behavior, not just show AI-generated text.


# 26. FINAL PLACIFY SUCCESS FLOW

COMPANY
↓
UPLOAD JD
↓
JD AGENT
↓
STRUCTURED JOB
↓
ELIGIBILITY ENGINE
↓
ELIGIBLE STUDENTS
↓
MATCHMAKER AGENT
↓
RANK + EXPLAIN
↓
ADMIN APPROVAL
↓
SCHEDULER AGENT
↓
PANELS + ROOMS + CANDIDATES
↓
CONFLICT CHECK
↓
RE-PLAN IF REQUIRED
↓
ADMIN APPROVAL
↓
COMMUNICATION AGENT
↓
EMAIL / WHATSAPP / IN-APP
↓
PANELIST INTERVIEW
↓
FEEDBACK
↓
PLACEMENT DASHBOARD
↓
SKILL-GAP + READINESS ANALYTICS
