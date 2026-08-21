# Placify Frontend — Detailed UI Plan

## 1. Project Roles

Placify has three main user roles:

```text
PLACIFY
│
├── 👨‍💼 ADMIN / TPO
│
├── 👨‍🎓 STUDENT
│
└── 👨‍🏫 PANELIST / INTERVIEWER
```

The frontend should look like a **modern AI placement operations dashboard**, not a normal college CRUD website.

---

# 2. 👨‍💼 ADMIN / TPO DASHBOARD

The Admin is the main person controlling the placement process.

## Main Dashboard

```text
┌──────────────────────────────────────────────────────────┐
│ Placify                         🔔  Search    TPO ▼       │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│ Dashboard    │  Good Morning, Admin 👋                   │
│              │                                           │
│ JD Analyzer  │  ┌────────┐ ┌────────┐ ┌────────┐        │
│              │  │ 15     │ │ 10     │ │ 5      │        │
│ Eligibility  │  │Students│ │Eligible│ │Pending │        │
│              │  └────────┘ └────────┘ └────────┘        │
│ Matching     │                                           │
│              │  🤖 AI OPERATIONS                         │
│ Shortlist    │  ● JD Analysis completed                 │
│              │  ● Eligibility completed                 │
│ Schedule     │  ● Matching in progress                  │
│              │                                           │
│ Exceptions   │  ⚠ Pending Actions                        │
│              │  • Approve TechNova requirements          │
│              │  • Review candidate shortlist             │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### Dashboard should show

- Total students
- Active companies/jobs
- Eligible candidates
- Shortlisted candidates
- Upcoming interviews
- Pending approvals
- Scheduling conflicts
- AI agent activity
- Exceptions/alerts

---

# 3. 📄 JD ANALYZER

## Purpose

Admin uploads a company's Job Description.

```text
JD PDF
   ↓
Backend
   ↓
JD Agent
   ↓
Extract Requirements
   ↓
Frontend Displays Results
```

### Upload UI

```text
┌─────────────────────────────────────┐
│       AI Job Description Analyzer   │
│                                     │
│  Drag & Drop JD PDF                 │
│                                     │
│       📄 Upload JD                  │
│                                     │
│              OR                     │
│                                     │
│  Paste Job Description              │
│                                     │
│          [ Analyze JD ]             │
└─────────────────────────────────────┘
```

### After Analysis

```text
TechNova Solutions
Software Engineer

Eligibility
────────────────────
CGPA:       ≥ 7.5
Backlogs:   0
Degree:     B.Tech
Location:   Bangalore
Salary:     ₹12 LPA

Skills
────────────────────
✓ Python       Mandatory
✓ SQL          Mandatory
✓ Git          Mandatory
⭐ React        Preferred
⭐ Docker       Preferred

AI Confidence: 92%

        [ Edit ] [ Approve Requirements ]
```

### Backend API

```http
POST /api/admin/jd/analyze
```

---

# 4. ✅ ELIGIBILITY

After JD approval, Admin runs eligibility checking.

### UI

```text
TechNova Solutions
Software Engineer

[ Run Eligibility Check ]
```

### Results

```text
15 Students Analyzed

┌──────────┬────────┬──────────┬──────────────┐
│ Student  │ CGPA   │ Backlogs │ Status       │
├──────────┼────────┼──────────┼──────────────┤
│ Aarav    │ 8.7    │ 0        │ 🟢 Eligible  │
│ Ananya   │ 9.1    │ 0        │ 🟢 Eligible  │
│ Rahul    │ 7.8    │ 1        │ 🔴 Ineligible│
│ Vikram   │ 6.9    │ 0        │ 🔴 Ineligible│
└──────────┴────────┴──────────┴──────────────┘
```

### Student Details

When Admin clicks a student:

```text
Rahul

❌ Ineligible

CGPA: 7.8
Required: 7.5 ✓

Backlogs: 1
Allowed: 0 ✗
```

### Backend API

```http
POST /api/admin/eligibility/run
```

---

# 5. 🤖 CANDIDATE MATCHING

The Matchmaker Agent compares eligible students with the job requirements.

### UI

```text
TechNova — Candidate Matching

15 students
10 eligible

[ Generate AI Matches ]
```

### Matching Results

```text
┌──────────┬────────────┬────────────────────────────┐
│ Student  │ Match      │ Skills                     │
├──────────┼────────────┼────────────────────────────┤
│ Aarav    │ 92% 🟢     │ Python ✓ SQL ✓ Git ✓       │
│ Ananya   │ 88% 🟢     │ Python ✓ SQL ✓ Git ✓       │
│ Sneha    │ 64% 🟡     │ React ✓ Git ✗ SQL ✗       │
└──────────┴────────────┴────────────────────────────┘
```

### Candidate Details

```text
Aarav Mehta

MATCH SCORE
     92%

Matched Skills
✓ Python
✓ SQL
✓ Git
✓ React

Missing Skills
✗ Docker

Why this match?

"Candidate has most mandatory skills and
strong alignment with the Software Engineer role."

Confidence: HIGH
```

The frontend must show **why** the candidate received the score.

Do not show only:

```text
92%
```

Show:

```text
92%

Matched:
Python, SQL, Git, React

Missing:
Docker

Explanation:
Strong alignment with the role.
```

---

# 6. 👤 SHORTLIST APPROVAL

This is an important Human-in-the-Loop feature.

The AI recommends candidates, but the **Admin makes the final shortlist decision**.

### AI Recommendation

```text
AI Recommended Shortlist

1. Aarav       92%
2. Ananya      88%
3. Sneha       64%
4. Nikhil      61%
```

### Admin Selection

```text
☑ Aarav
☑ Ananya
☐ Sneha
☐ Nikhil

[ Approve Shortlist ]
```

### Admin Override

If Admin changes the AI recommendation:

```text
Aarav

AI Recommendation:
Recommended

Admin Decision:
Rejected

Reason:
"Student unavailable for interview."

[ Confirm Decision ]
```

The approval/override should be stored as an audit action.

---

# 7. 📅 INTERVIEW SCHEDULE

After shortlist approval, Admin generates the interview schedule.

### Scheduler considers

```text
Students
    +
Panel Availability
    +
Room Availability
    +
Interview Duration
    +
Existing Conflicts
    ↓
Interview Schedule
```

### UI

```text
TECHNOVA — INTERVIEW SCHEDULE

09:00 ──────────────────────────────

Room 101
09:00 - 09:30
Aarav
Panel A

Room 102
09:00 - 09:30
Ananya
Panel B


10:00 ──────────────────────────────

Room 101
10:00 - 10:30
Nikhil
Panel A
```

### Filters

```text
[ All Rooms ] [ All Panels ] [ Today ]
```

### Conflict Display

```text
⚠ Conflict Detected

Panel A is assigned to two interviews
at 10:00 AM.

🤖 Suggested Solution:

Move Aarav → Room 102
Panel B is available.

[ Accept Solution ]
[ Reject ]
```

---

# 8. 🚨 EXCEPTION CENTER

The Exception Center shows unusual placement problems that need attention.

### Example 1 — Room Delay

```text
EXCEPTION CENTER

🔴 HIGH

Room 101 delayed by 20 minutes.

Impact:
3 candidates affected.

AI Recommendation:
Move interviews to Room 201.

Confidence: 94%

[ Review ]
[ Approve Solution ]
```

### Example 2 — Panel Delay

```text
🟡 MEDIUM

Panel A is running late.

2 interviews may be delayed.

AI Recommendation:
Shift interviews by 15 minutes.

[ Review ]
[ Approve ]
```

The page should feel like an **AI operations control center**.

---

# 9. 👨‍🎓 STUDENT DASHBOARD

Students should see only their own information.

### Main Dashboard

```text
Welcome, Aarav 👋

Your Placement Readiness
████████████████░░ 87%

Upcoming Interview
────────────────────────

TechNova Solutions
Software Engineer

Tomorrow
10:00 AM

📍 Room 101
👨‍🏫 Technical Panel A

[ View Details ]
```

---

# 10. 👤 STUDENT — PROFILE / RESUME

```text
My Profile

Name: Aarav Mehta
Roll No: 23CSE001
Branch: CSE
CGPA: 8.7
Backlogs: 0

Skills
────────────────
Python
React
SQL
Git

Resume
────────────────
📄 Aarav_Resume.pdf

[ Upload New Resume ]
```

The resume upload will eventually connect to the backend resume parsing system.

---

# 11. 🎯 STUDENT — JOB MATCHES

Students can see available jobs and their match scores.

### Example

```text
Available Opportunities

┌──────────────────────────────────┐
│ TechNova Solutions               │
│ Software Engineer                │
│                                  │
│ Match: 92% 🟢                    │
│                                  │
│ ✓ Python                         │
│ ✓ SQL                            │
│ ✓ Git                            │
│ ✓ React                          │
│                                  │
│ Missing: Docker                  │
│                                  │
│ [ View Match Explanation ]       │
└──────────────────────────────────┘
```

Another job:

```text
DataSphere AI
ML Engineer

Match: 74% 🟡

Missing:
Machine Learning
Pandas

[ View Details ]
```

---

# 12. 📚 STUDENT — SKILL GAPS

Show the student what they need to improve.

```text
Your Skill Gaps

For Software Engineer:

Strong Skills
────────────────
█████████ Python
████████  SQL
████████  Git

Needs Improvement
────────────────
████      Docker
███       System Design
```

### AI Recommendations

```text
AI Recommendations

1. Learn Docker basics
2. Practice SQL queries
3. Complete 1 backend project
4. Practice technical interviews
```

The purpose is to make Placify useful not only for placement management but also for **student preparation**.

---

# 13. ⏰ STUDENT — INTERVIEW DETAILS

Students should not need to ask the TPO through WhatsApp for interview details.

```text
UPCOMING INTERVIEW

TechNova Solutions
Software Engineer

📅 22 August
⏰ 10:00 AM
📍 Room 101
👨‍🏫 Technical Panel A

Status:
🟢 Confirmed

[ View Campus Route ]
[ View Preparation ]
```

---

# 14. 👨‍🏫 PANELIST DASHBOARD

Panelists see only the interviews assigned to them.

### Today's Interviews

```text
Good Morning, Panelist 👋

Today's Interviews: 6

────────────────────────────

09:00
Aarav Mehta
TechNova
Room 101

10:00
Ananya Sharma
TechNova
Room 101

11:00
Rahul Kumar
DataSphere
Room 201
```

Each interview should be clickable.

---

# 15. 📄 PANELIST — CANDIDATE RESUME

When a panelist opens a candidate:

```text
Aarav Mehta

CGPA: 8.7
Branch: CSE

Skills
────────────────
Python
React
SQL
Git

Projects
────────────────
Smart Traffic Management System

[ View Resume ]
```

The panelist should quickly understand the candidate before the interview.

---

# 16. 📝 PANELIST — FEEDBACK

After the interview:

```text
Interview Feedback

Candidate: Aarav Mehta

Technical Skills
⭐⭐⭐⭐☆  4/5

Communication
⭐⭐⭐⭐☆  4/5

Problem Solving
⭐⭐⭐⭐⭐  5/5

Overall Result

○ Pass
○ Fail
○ Hold

Comments:
┌──────────────────────────────┐
│                              │
│                              │
└──────────────────────────────┘

[ Submit Feedback ]
```

The feedback will eventually be stored in:

```text
interview_feedback
```

---

# 17. 🔗 FRONTEND ↔ BACKEND ARCHITECTURE

The frontend should NOT directly access the Supabase database.

Use this architecture:

```text
                 PLACIFY FRONTEND
                 React + Vite
                       │
                       │ HTTP / REST API
                       ▼
                FASTAPI BACKEND
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          AI AGENTS          SUPABASE
             │                   │
             └─────────┬─────────┘
                       ▼
                    DATABASE
```

### Example: Eligibility

```text
Admin clicks:
"Run Eligibility"

        ↓

React sends:

POST /api/admin/eligibility/run

        ↓

FastAPI

        ↓

Eligibility Agent

        ↓

Supabase Database

        ↓

FastAPI Response

        ↓

React displays eligibility results
```

---

# 18. 🔌 CURRENT BACKEND APIs

These are the important APIs already available or planned.

## Already Available

```http
POST /api/admin/jd/analyze
```

```http
POST /api/admin/eligibility/run
```

## Being Built Next

```http
POST /api/admin/matches/generate
```

## Coming Later

```http
POST /api/admin/shortlist/approve

POST /api/admin/schedule/generate

POST /api/admin/simulate-delay

GET /api/admin/schedule

GET /api/admin/exceptions

GET /api/admin/activity

GET /api/student/dashboard

GET /api/student/matches

GET /api/student/interview

GET /api/student/campus-route

GET /api/panel/today

POST /api/panel/feedback

POST /api/panel/evaluation/confirm

GET /api/analytics/readiness

POST /api/assistant/query
```

---

# 19. 🧪 DEVELOPMENT STRATEGY

Frontend development should NOT wait for every backend API.

For APIs that are not ready:

```text
Frontend
   ↓
Mock JSON Data
   ↓
Build UI
   ↓
Backend API becomes ready
   ↓
Replace Mock Function
   ↓
Connect Real API
```

### Example

Initially:

```javascript
const candidates = mockCandidates;
```

Later:

```javascript
const response = await fetch(
  "/api/admin/matches/generate",
  {
    method: "POST",
    body: JSON.stringify({
      job_id: jobId
    })
  }
);
```

The UI should remain the same.

---

# 20. 🎯 FRONTEND DEVELOPMENT PRIORITY

## Phase 1 — Build First

```text
1. Admin Dashboard
2. JD Analyzer
3. Eligibility Results
4. Candidate Matching
5. Shortlist Approval
6. Interview Schedule
```

## Phase 2

```text
7. Student Dashboard
8. Panelist Dashboard
9. Exception Center
10. Analytics
```

## Phase 3 — Final Polish

```text
11. Notifications
12. AI Assistant
13. Agent Activity Timeline
14. Animations
15. Responsive / Mobile Improvements
16. Final UI Polish
```

---

# 21. ⭐ MOST IMPORTANT UI PRINCIPLE

Placify should NOT look like a normal CRUD placement portal.

The frontend must make the **agentic workflow visible**.

The user should be able to see:

```text
UNDERSTAND
   ↓
ANALYZE
   ↓
RECOMMEND
   ↓
EXPLAIN
   ↓
PLAN
   ↓
DETECT EXCEPTION
   ↓
PROPOSE SOLUTION
   ↓
ASK HUMAN APPROVAL
   ↓
EXECUTE
```

For example:

```text
🤖 AI Recommendation
      ↓
"These 10 candidates are the strongest matches."
      ↓
📊 Explainable Scores
      ↓
👤 Human Approval
      ↓
📅 AI Schedule
      ↓
⚠ Conflict Detected
      ↓
🤖 AI proposes new schedule
      ↓
👤 Admin approves
      ↓
✅ Schedule executed
```

This is what makes **Placify an AI Placement Operations System**, rather than just another student-management website.
