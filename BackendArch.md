# Placify — Backend Development Plan

## 1. Backend Architecture

Placify backend is responsible for:

- Receiving requests from the frontend
- Reading/writing placement data
- Running AI/agent logic
- Checking eligibility
- Matching students with jobs
- Generating interview schedules
- Detecting conflicts and exceptions
- Asking for human approval
- Sending notifications
- Generating readiness/skill-gap analytics
- Maintaining agent activity and audit logs

Architecture:

```text
                    PLACIFY FRONTEND
                    React + Vite
                          │
                          │ HTTP / REST
                          ▼
                   FASTAPI BACKEND
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
      API ROUTES       AI AGENTS        SERVICES
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                    SUPABASE
                    PostgreSQL
                          │
                          ▼
                       DATA
```

---

# 2. Current Backend Status

## Completed

```text
Supabase Database                  ✅
Database Seed Data                 ✅
FastAPI Setup                      ✅
Supabase Connection                ✅
Environment Configuration          ✅
JD Analyzer API                    ✅
JD Parsing MVP                     ✅
Eligibility Agent                  ✅
Eligibility API                    ✅
Eligibility Testing                ✅
Git Branch / GitHub                ✅
```

## Currently Building

```text
Matchmaker Agent                   🔨
Match Generation API               🔨
```

## Remaining

```text
Human Shortlist Approval           ⏳
Interview Scheduler                ⏳
Conflict Detection                ⏳
Chaos Button                       ⏳
Exception Agent                    ⏳
Panel Coordination                ⏳
Notification Agent                ⏳
Student APIs                       ⏳
Panelist APIs                      ⏳
Readiness Analytics                ⏳
Agent Activity / Audit             ⏳
AI Assistant                       ⏳
Final Integration                  ⏳
```

---

# 3. Database Layer

## Purpose

Supabase is Placify's persistent memory.

It stores:

```text
Students
Student Skills
Jobs
Job Skills
Applications
Panels
Panel Members
Panel Availability
Rooms
Room Availability
Interviews
Interview Feedback
Approvals
Notifications
Agent Logs
Skill Gaps
```

Architecture:

```text
FastAPI
   │
   ▼
Supabase Client
   │
   ▼
PostgreSQL
```

The frontend should NOT directly use the Supabase service key.

---

# 4. Database Responsibilities

## Students

Store:

```text
Student ID
Name
Roll Number
Branch
CGPA
Backlogs
Graduation Year
Resume URL
Profile Summary
```

## Student Skills

Store:

```text
Student ID
Skill Name
Proficiency
Source
```

Example:

```text
Aarav
├── Python
├── React
├── SQL
├── Git
└── PostgreSQL
```

## Jobs

Store:

```text
Company
Role
Description
Location
Salary
Minimum CGPA
Maximum Backlogs
Graduation Year
Status
```

## Job Skills

Store:

```text
Job
Skill
Skill Type
```

Example:

```text
TechNova
├── Python  → Mandatory
├── SQL     → Mandatory
├── Git     → Mandatory
├── React   → Preferred
└── Docker  → Preferred
```

---

# 5. JD Analyzer Agent

## Purpose

Convert an unstructured Job Description into structured requirements.

Flow:

```text
JD PDF / Text
      ↓
Text Extraction
      ↓
JD Analyzer
      ↓
Structured Job Requirements
      ↓
Validation
      ↓
Database
```

Current MVP:

```text
Python Regex
+
Keyword Matching
```

The current parser extracts information such as:

```text
Company
Role
CGPA
Backlogs
Salary
Skills
```

## API

```http
POST /api/admin/jd/analyze
```

Example request:

```json
{
  "text": "TechNova Solutions is hiring Software Engineers..."
}
```

Example response structure:

```json
{
  "success": true,
  "company": "TechNova Solutions",
  "role": "Software Engineer",
  "min_cgpa": 7.5,
  "max_backlogs": 0,
  "salary": "12 LPA",
  "required_skills": [
    "Python",
    "SQL",
    "Git"
  ],
  "preferred_skills": [
    "React",
    "Docker"
  ]
}
```

### Future improvement

Upgrade JD parsing to:

```text
PDF
 ↓
PDF Text Extraction
 ↓
LLM / Structured Parser
 ↓
Pydantic Validation
 ↓
JobDescription Model
 ↓
Supabase
```

---

# 6. Eligibility Agent

## Purpose

Determine whether each student satisfies the hard requirements of a job.

Current hard rules:

```text
Minimum CGPA
Maximum Backlogs
```

Flow:

```text
Job Requirements
       +
Student Data
       ↓
Eligibility Agent
       ↓
Eligible / Ineligible
       ↓
Reason
       ↓
Applications Table
```

Example:

```text
Student:
Rahul

CGPA: 7.8
Required: 7.5
        ✓

Backlogs: 1
Allowed: 0
        ✗

Final:
INELIGIBLE
```

## API

```http
POST /api/admin/eligibility/run
```

Request:

```json
{
  "job_id": "20000000-0000-0000-0000-000000000001"
}
```

Response:

```json
{
  "success": true,
  "agent": "Eligibility Agent",
  "job_id": "...",
  "job": "Software Engineer",
  "total_students": 15,
  "eligible_students": 10,
  "ineligible_students": 5,
  "results": []
}
```

Each result should contain:

```text
student_id
student_name
eligible
status
reasons
```

---

# 7. Matchmaker Agent

## Purpose

Compare eligible students against job skills.

Flow:

```text
Eligible Students
       +
Job Skills
       +
Student Skills
       ↓
Matchmaker Agent
       ↓
Match Score
       +
Matched Skills
       +
Missing Skills
       +
Explanation
       +
Confidence
```

Example:

```text
Aarav

Job:
Python       Mandatory
SQL          Mandatory
Git          Mandatory
React        Preferred
Docker       Preferred

Student:
Python
SQL
Git
React

Result:

Match Score: 90%

Matched:
Python
SQL
Git
React

Missing:
Docker

Confidence:
HIGH
```

## API

```http
POST /api/admin/matches/generate
```

Request:

```json
{
  "job_id": "..."
}
```

Response:

```json
{
  "success": true,
  "agent": "Matchmaker Agent",
  "job_id": "...",
  "job": "Software Engineer",
  "candidates_analyzed": 10,
  "matches": [
    {
      "student_id": "...",
      "match_score": 92,
      "matched_skills": [
        "python",
        "sql",
        "git",
        "react"
      ],
      "missing_skills": [
        "docker"
      ],
      "explanation": "Strong alignment with the role.",
      "confidence": "high"
    }
  ]
}
```

## Matching Rules

Mandatory skills should have greater weight than preferred skills.

Example:

```text
Mandatory skills = 70%
Preferred skills = 30%
```

The final score should be explainable.

---

# 8. Skill Gap Agent / Logic

When a student is missing a required skill:

```text
Student
   ↓
Job Requirements
   ↓
Missing Skill
   ↓
Skill Gap
   ↓
Database
```

Example:

```text
Aarav
Job: Software Engineer

Missing:
Docker
```

Store:

```text
student_id
job_id
skill_name
gap_type
```

Later this data will power the Student Dashboard and readiness analytics.

---

# 9. Human Shortlist Approval

## Purpose

AI should NOT make the final candidate selection automatically.

Flow:

```text
Matchmaker
     ↓
AI Recommended Candidates
     ↓
Admin Reviews
     ↓
Approve / Modify / Reject
     ↓
Database
     ↓
Continue Scheduling
```

Example:

```text
AI Recommendation

Aarav      92%
Ananya     88%
Sneha      64%
Nikhil     61%
```

Admin can:

```text
Approve
Reject
Modify
```

If Admin overrides the AI:

```text
Candidate:
Aarav

AI:
Recommended

Admin:
Rejected

Reason:
Student unavailable
```

Store this in:

```text
approvals
```

and preferably:

```text
agent_logs
```

---

# 10. Interview Scheduler Agent

## Purpose

Generate interview schedules while respecting hard constraints.

Inputs:

```text
Shortlisted Students
+
Student Availability
+
Panel Availability
+
Room Availability
+
Interview Duration
+
Panel Specialization
```

Flow:

```text
Approved Shortlist
       ↓
Scheduler Agent
       ↓
Check Constraints
       ↓
Generate Schedule
       ↓
Validate Conflicts
       ↓
Schedule Plan
       ↓
Human Approval
```

---

# 11. Scheduling Constraints

The scheduler must NOT rely on an LLM for hard constraints.

Hard constraints should be deterministic.

Check:

```text
Student double-booking
Panel double-booking
Room double-booking
Room capacity
Panel availability
Room availability
Interview duration
Time conflicts
```

Example:

```text
Panel A

09:00 - 09:30 → Aarav
09:30 - 10:00 → Ananya
10:00 - 10:30 → Rahul
```

No overlap should be allowed.

---

# 12. Interview Schedule API

```http
POST /api/admin/schedule/generate
```

Response should contain:

```text
Interview ID
Student
Company
Role
Panel
Room
Start Time
End Time
Status
```

Example:

```json
{
  "success": true,
  "schedule": [
    {
      "student": "Aarav",
      "panel": "Technical Panel A",
      "room": "Room 101",
      "start_time": "09:00",
      "end_time": "09:30",
      "status": "proposed"
    }
  ]
}
```

---

# 13. Conflict Detection

Before saving a schedule:

```text
Generated Schedule
       ↓
Conflict Checker
       ↓
┌──────┴──────┐
│             │
No Conflict   Conflict
│             │
▼             ▼
Approve       Exception
              ↓
          AI Recommendation
```

Example:

```text
Conflict:

Panel A
10:00 → Aarav
10:00 → Ananya

❌ Double booking
```

The backend should identify:

```text
Conflict Type
Resource
Time
Affected Candidate
Impact
Suggested Solution
```

---

# 14. 🔥 Chaos Button

This is one of Placify's signature demo features.

## Purpose

Simulate a real-world placement disruption.

Example:

```text
Room 101
     ↓
20-minute delay
```

Flow:

```text
Admin clicks "Simulate Delay"
          ↓
Room 101 becomes delayed
          ↓
Find affected interviews
          ↓
Scheduler recalculates
          ↓
Check alternative rooms
          ↓
Check panel availability
          ↓
Check student conflicts
          ↓
Generate recovery plan
          ↓
Admin approves
          ↓
New schedule
```

## API

```http
POST /api/admin/simulate-delay
```

Example response:

```json
{
  "success": true,
  "affected_interviews": 3,
  "old_schedule": [],
  "new_schedule": [],
  "reason": "Room 101 delayed by 20 minutes",
  "recommendation": "Move interviews to Room 201"
}
```

This should become a major hackathon demo moment.

---

# 15. Exception Agent

## Purpose

Detect and manage operational problems.

Examples:

```text
Room delayed
Panel delayed
Student unavailable
Panel conflict
Room conflict
Schedule conflict
Interview delay
```

Flow:

```text
System Event
     ↓
Exception Agent
     ↓
Classify Severity
     ↓
Analyze Impact
     ↓
Recommend Solution
     ↓
Human Approval
     ↓
Execute
```

Severity:

```text
🔴 HIGH
🟡 MEDIUM
🟢 LOW
```

---

# 16. Exception API

```http
GET /api/admin/exceptions
```

Example:

```json
{
  "exceptions": [
    {
      "severity": "high",
      "resource": "Room 101",
      "description": "Room delayed by 20 minutes",
      "impact": "3 interviews affected",
      "recommendation": "Move interviews to Room 201",
      "confidence": 0.94,
      "status": "pending"
    }
  ]
}
```

---

# 17. Panel Coordination

Backend must provide panel information.

Data:

```text
Panel
Panel Members
Panel Availability
Panel Specialization
Assigned Interviews
```

Flow:

```text
Panel Availability
       +
Interview Requirements
       ↓
Scheduler
       ↓
Panel Assignment
```

---

# 18. Panelist APIs

## Today's Interviews

```http
GET /api/panel/today
```

Returns:

```text
Today's interviews
Candidate
Company
Room
Time
Round
Status
```

## Submit Feedback

```http
POST /api/panel/feedback
```

Example:

```json
{
  "interview_id": "...",
  "technical_score": 4,
  "communication_score": 4,
  "overall_result": "pass",
  "comments": "Strong technical fundamentals."
}
```

## Confirm Evaluation

```http
POST /api/panel/evaluation/confirm
```

---

# 19. Notification Agent

## Purpose

Generate placement notifications.

Events:

```text
Interview scheduled
Interview rescheduled
Room changed
Panel changed
Interview reminder
Shortlist result
```

Flow:

```text
Placement Event
      ↓
Notification Agent
      ↓
Create Notification
      ↓
Database
      ↓
Frontend / Simulated Channel
```

Channels:

```text
In-App
Email
WhatsApp (simulated if required)
```

For the hackathon, notifications can initially be simulated.

---

# 20. Student APIs

## Student Dashboard

```http
GET /api/student/dashboard
```

Should return:

```text
Student profile
Upcoming interview
Placement status
Match information
Readiness
Notifications
```

## Job Matches

```http
GET /api/student/matches
```

Returns:

```text
Company
Role
Match Score
Matched Skills
Missing Skills
Explanation
```

## Interview

```http
GET /api/student/interview
```

Returns:

```text
Company
Role
Date
Time
Room
Panel
Status
```

## Campus Route

```http
GET /api/student/campus-route
```

For MVP, use a simple predefined campus route/grid.

No external map API is required.

---

# 21. Resume Processing

Student resume flow:

```text
Student Uploads Resume
          ↓
Backend
          ↓
PDF Text Extraction
          ↓
Resume Parser
          ↓
Extract:
├── Name
├── Education
├── CGPA
├── Skills
├── Projects
├── Experience
└── Certifications
          ↓
Validate
          ↓
Store in Database
```

The resume parser should eventually provide structured student information to the Matchmaker.

---

# 22. Placement Readiness

The backend should calculate student readiness from:

```text
Skills
+
Skill Gaps
+
CGPA
+
Projects
+
Job Matches
+
Interview Performance
```

Example:

```text
Aarav

Overall Readiness: 87%

Technical Skills:       90%
Projects:               85%
Interview Performance:  88%
Communication:          82%
```

---

# 23. Readiness API

```http
GET /api/analytics/readiness
```

Possible response:

```json
{
  "overall_readiness": 87,
  "skill_breakdown": {},
  "top_skill_gaps": [],
  "recommended_actions": []
}
```

---

# 24. Admin Analytics

Backend should eventually provide:

```text
Total Students
Eligible Students
Shortlisted Students
Interview Scheduled
Selected
Rejected
Pending
Placement Rate
Top Skill Gaps
Average Match Score
Readiness Distribution
```

Flow:

```text
Database
   ↓
Analytics Service
   ↓
Aggregated Data
   ↓
Admin Dashboard
```

---

# 25. Agent Activity / Audit Logs

Every important agent action should be traceable.

Example:

```text
10:02
🤖 JD Agent
Analyzed TechNova JD

10:05
🤖 Eligibility Agent
Checked 15 students

10:07
🤖 Matchmaker Agent
Generated candidate matches

10:10
👤 Admin
Approved shortlist

10:12
🤖 Scheduler Agent
Generated interview schedule

10:15
⚠ Exception Agent
Detected Room 101 delay

10:16
🤖 Scheduler Agent
Generated recovery plan

10:17
👤 Admin
Approved recovery plan
```

Store in:

```text
agent_logs
```

Important fields:

```text
agent_name
session_id
action
tool_name
input_data
output_data
status
created_at
```

---

# 26. AI Agent Design Pattern

Each agent should follow:

```text
GOAL
  ↓
CONTEXT
  ↓
TOOLS / DATA
  ↓
DECISION LOGIC
  ↓
OUTPUT
  ↓
CONFIDENCE
  ↓
ACTION
  ↓
AUDIT LOG
```

Example:

```text
MATCHMAKER AGENT

Goal:
Find best candidates.

Context:
Job requirements + eligible students.

Tools:
Supabase + skill comparison.

Decision:
Compare mandatory and preferred skills.

Output:
Match score + explanation.

Confidence:
High / Medium / Low.

Action:
Recommend candidate.

Audit:
Save agent action to agent_logs.
```

---

# 27. Human-in-the-Loop Architecture

AI should recommend, not blindly make final decisions.

```text
AI
 ↓
Recommendation
 ↓
Human Review
 ↓
┌───────────────┐
│               │
Approve       Reject
│               │
▼               ▼
Execute       Stop
```

For important actions:

```text
Shortlist
Schedule
Schedule Recovery
Final Selection
```

Human approval should be required where appropriate.

---

# 28. API Structure

Backend routes:

```text
backend/
│
├── main.py
│
└── app/
    │
    ├── agents/
    │   ├── jd_agent.py
    │   ├── eligibility_agent.py
    │   ├── match_agent.py
    │   ├── schedule_agent.py
    │   ├── exception_agent.py
    │   ├── panel_agent.py
    │   ├── notification_agent.py
    │   └── readiness_agent.py
    │
    ├── api/
    │   ├── routes_admin.py
    │   ├── routes_student.py
    │   ├── routes_panel.py
    │   └── routes_analytics.py
    │
    ├── core/
    │   ├── config.py
    │   └── db.py
    │
    ├── models/
    │   └── pydantic_schemas.py
    │
    ├── services/
    │   ├── scheduler.py
    │   ├── constraints.py
    │   ├── notification_service.py
    │   └── audit_service.py
    │
    └── utils/
        └── pdf_extractor.py
```

---

# 29. Complete Backend Flow

The complete Placify backend should eventually work like this:

```text
                    COMPANY JD
                       │
                       ▼
                 JD ANALYZER
                       │
                       ▼
              JOB REQUIREMENTS
                       │
                       ▼
                ELIGIBILITY
                       │
              ┌────────┴────────┐
              │                 │
          Eligible          Ineligible
              │
              ▼
             MATCH
              │
              ▼
       MATCH SCORE + XAI
              │
              ▼
       HUMAN APPROVAL
              │
              ▼
       APPROVED SHORTLIST
              │
              ▼
          SCHEDULER
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   STUDENT  PANEL     ROOM
      │       │        │
      └───────┼────────┘
              ▼
       CONFLICT CHECK
              │
       ┌──────┴──────┐
       │             │
      Safe        Conflict
       │             │
       ▼             ▼
   Schedule      Exception
                     │
                     ▼
              AI Recommendation
                     │
                     ▼
               Human Approval
                     │
                     ▼
                New Schedule
                     │
                     ▼
              NOTIFICATIONS
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      STUDENT                PANELIST
          │                     │
          ▼                     ▼
      Interview              Feedback
          │                     │
          └──────────┬──────────┘
                     ▼
                  ANALYTICS
                     │
                     ▼
              READINESS / GAPS
```

---

# 30. Backend Development Priority

## 🔴 P0 — Must Finish

These are essential for the hackathon demo:

```text
1. JD Analyzer
2. Eligibility Agent
3. Matchmaker Agent
4. Explainable Matching
5. Human Shortlist Approval
6. Interview Scheduler
7. Conflict Detection
8. Chaos Button
9. Student Dashboard APIs
10. Admin Dashboard APIs
```

## 🟡 P1 — Important

```text
11. Exception Center
12. Panelist APIs
13. Panel Feedback
14. Notifications
15. Readiness Analytics
16. Agent Activity Timeline
```

## 🟢 P2 — If Time Allows

```text
17. AI Assistant
18. Predictive Analytics
19. Advanced Resume Parsing
20. Advanced Vector Matching
21. Advanced UI/AI features
```

---

# 31. Backend Testing Strategy

Every major API should be tested using:

```text
Swagger /docs
      OR
Postman
```

Testing order:

```text
1. JD Analyzer
       ↓
2. Eligibility
       ↓
3. Matchmaker
       ↓
4. Shortlist Approval
       ↓
5. Scheduler
       ↓
6. Conflict Detection
       ↓
7. Chaos Button
       ↓
8. Student APIs
       ↓
9. Panel APIs
       ↓
10. Analytics
```

For each API verify:

```text
✓ HTTP status
✓ Request validation
✓ Correct database operation
✓ Correct response
✓ Error handling
✓ Agent log
✓ Edge cases
```

---

# 32. Security Rules

Never commit:

```text
.env
Supabase secret keys
OpenAI API keys
Service-role keys
Passwords
```

Use:

```text
backend/.env
```

and keep it in `.gitignore`.

Frontend must NEVER receive:

```text
SUPABASE_SERVICE_ROLE_KEY
OPENAI_SECRET_KEY
```

Only FastAPI should use secret keys.

---

# 33. Final Backend Goal

Placify backend should demonstrate:

```text
UNDERSTAND
    ↓
ANALYZE
    ↓
CHECK
    ↓
MATCH
    ↓
EXPLAIN
    ↓
RECOMMEND
    ↓
ASK HUMAN
    ↓
PLAN
    ↓
EXECUTE
    ↓
MONITOR
    ↓
DETECT EXCEPTION
    ↓
REPLAN
    ↓
ASK HUMAN
    ↓
CONTINUE
```

The key idea is:

> **Placify is not just a placement database or CRUD application. It is an AI-powered placement operations system where agents analyze requirements, verify candidates, recommend matches, plan interviews, detect operational problems, propose solutions, and continue execution under human supervision.**
