// src/services/api.ts

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}

async function apiError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = await response.json();
    return new Error(body.detail || body.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

// ==========================================
// 1. JD ANALYZER AGENT
// ==========================================
export interface JDAnalysisResponse {
  success: boolean;
  company?: string;
  company_name?: string;
  role: string;
  min_cgpa: number;
  max_backlogs: number;
  salary: string;
  required_skills: string[];
  preferred_skills: string[];
  ai_confidence?: number;
  raw_text?: string;
}

export const analyzeJD = async (
  text: string,
  useMock = false,
): Promise<JDAnalysisResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      success: true,
      company: "TechNova Solutions",
      role: "Software Engineer",
      min_cgpa: 7.5,
      max_backlogs: 0,
      salary: "12 LPA",
      required_skills: ["Python", "SQL", "Git"],
      preferred_skills: ["React", "Docker"],
      ai_confidence: 92,
    };
  }
  const response = await apiFetch("/api/admin/jd/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw await apiError(response, "Failed to analyze JD");
  return response.json();
};

// ==========================================
// 2. ELIGIBILITY AGENT
// ==========================================
export interface EligibilityResult {
  student_id: string;
  student_name: string;
  cgpa: number;
  backlogs: number;
  eligible: boolean;
  status: string;
  reasons: string[];
}

export interface EligibilityResponse {
  success: boolean;
  agent: string;
  job_id: string;
  job: string;
  company: string;
  total_students: number;
  eligible_students: number;
  ineligible_students: number;
  results: EligibilityResult[];
}

export const runEligibility = async (
  jobId: string,
  useMock = false,
): Promise<EligibilityResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return {
      success: true,
      agent: "Eligibility Agent",
      job_id: jobId,
      job: "Software Engineer",
      company: "TechNova Solutions",
      total_students: 4,
      eligible_students: 2,
      ineligible_students: 2,
      results: [
        {
          student_id: "s1",
          student_name: "Aarav",
          cgpa: 8.7,
          backlogs: 0,
          eligible: true,
          status: "Eligible",
          reasons: [],
        },
        {
          student_id: "s2",
          student_name: "Ananya",
          cgpa: 9.1,
          backlogs: 0,
          eligible: true,
          status: "Eligible",
          reasons: [],
        },
        {
          student_id: "s3",
          student_name: "Rahul",
          cgpa: 7.8,
          backlogs: 1,
          eligible: false,
          status: "Ineligible",
          reasons: ["Backlogs: 1 (Allowed: 0)"],
        },
        {
          student_id: "s4",
          student_name: "Vikram",
          cgpa: 6.9,
          backlogs: 0,
          eligible: false,
          status: "Ineligible",
          reasons: ["CGPA: 6.9 (Required: 7.5)"],
        },
      ],
    };
  }
  const response = await apiFetch("/api/admin/eligibility/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok) throw await apiError(response, "Failed to run eligibility");
  return response.json();
};

// ==========================================
// 3. MATCHMAKER AGENT
// ==========================================
export interface MatchResult {
  student_id: string;
  student_name: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  confidence: "high" | "medium" | "low";
}

export interface MatchResponse {
  success: boolean;
  agent: string;
  job_id: string;
  job: string;
  company: string;
  candidates_analyzed: number;
  matches: MatchResult[];
}

export const generateMatches = async (
  jobId: string,
  useMock = false,
): Promise<MatchResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      success: true,
      agent: "Matchmaker Agent",
      job_id: jobId,
      job: "Software Engineer",
      company: "TechNova Solutions",
      candidates_analyzed: 10,
      matches: [
        {
          student_id: "s1",
          student_name: "Aarav Mehta",
          match_score: 92,
          matched_skills: ["Python", "SQL", "Git", "React"],
          missing_skills: ["Docker"],
          explanation:
            "Candidate has most mandatory skills and strong alignment with the Software Engineer role.",
          confidence: "high",
        },
        {
          student_id: "s2",
          student_name: "Ananya Sharma",
          match_score: 88,
          matched_skills: ["Python", "SQL", "Git"],
          missing_skills: ["React", "Docker"],
          explanation:
            "Solid backend fundamentals, but missing preferred frontend and containerization skills.",
          confidence: "high",
        },
        {
          student_id: "s3",
          student_name: "Sneha Patel",
          match_score: 64,
          matched_skills: ["React", "Git"],
          missing_skills: ["Python", "SQL", "Docker"],
          explanation:
            "Strong frontend skills, but lacks core mandatory backend requirements for this specific role.",
          confidence: "medium",
        },
        {
          student_id: "s4",
          student_name: "Nikhil Verma",
          match_score: 61,
          matched_skills: ["SQL", "React"],
          missing_skills: ["Python", "Git", "Docker"],
          explanation:
            "Partial match. Missing primary programming language (Python) and version control.",
          confidence: "high",
        },
      ],
    };
  }
  const response = await apiFetch("/api/admin/matches/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok)
    throw await apiError(response, "Failed to generate matches");
  return response.json();
};

// ==========================================
// 4. SHORTLIST APPROVAL
// ==========================================
export interface ShortlistDecision {
  student_id: string;
  action?: "approve" | "reject";
  decision?: "approve" | "reject";
  override_reason?: string;
  reason?: string;
}

export interface ShortlistSubmitResponse {
  success: boolean;
  message: string;
  approved_count: number;
  rejected_count: number;
}

export const submitShortlistApproval = async (
  jobId: string,
  decisions: ShortlistDecision[],
  useMock = false,
): Promise<ShortlistSubmitResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const approved = decisions.filter((d) => d.action === "approve").length;
    return {
      success: true,
      message:
        "Shortlist successfully saved to database. Ready for scheduling.",
      approved_count: approved,
      rejected_count: decisions.length - approved,
    };
  }
  const results: ShortlistSubmitResponse[] = [];
  for (const decision of decisions) {
    const response = await apiFetch("/api/admin/shortlist/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: decision.student_id,
        decision: decision.decision || decision.action,
        reason: decision.reason || decision.override_reason || "",
        job_id: jobId,
      }),
    });
    if (!response.ok)
      throw await apiError(response, "Failed to submit shortlist");
    results.push(await response.json());
  }
  const approved = decisions.filter(
    (decision) => (decision.decision || decision.action) === "approve",
  ).length;
  return {
    success: results.every((result) => result.success !== false),
    message: "Shortlist decisions saved successfully.",
    approved_count: approved,
    rejected_count: decisions.length - approved,
  };
};

// ==========================================
// 5. INTERVIEW SCHEDULER AGENT
// ==========================================
export interface ScheduleItem {
  id: string;
  student?: string;
  student_id?: string;
  panel?: string;
  panel_id?: string;
  room?: string;
  start_time: string;
  end_time: string;
  status: "proposed" | "confirmed" | "conflict";
}

export interface ConflictDetails {
  type: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface ScheduleResponse {
  success: boolean;
  agent: string;
  schedule: ScheduleItem[];
  conflict_detected: boolean;
  conflict_details?: ConflictDetails;
  conflicts?: ConflictDetails[];
  unscheduled_candidates?: string[];
}

export const generateSchedule = async (
  jobId: string,
  useMock = false,
): Promise<ScheduleResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 3500));
    return {
      success: true,
      agent: "Scheduler Agent",
      conflict_detected: true,
      conflict_details: {
        type: "Double Booking",
        description: "Panel A is assigned to two interviews at 10:00 AM.",
        impact: "Aarav and Nikhil are scheduled for the same time.",
        recommendation: "Move Aarav to Room 102 (Panel B is available).",
      },
      schedule: [
        {
          id: "int_1",
          student: "Aarav Mehta",
          panel: "Panel A",
          room: "Room 101",
          start_time: "09:00",
          end_time: "09:30",
          status: "proposed",
        },
        {
          id: "int_2",
          student: "Ananya Sharma",
          panel: "Panel B",
          room: "Room 102",
          start_time: "09:00",
          end_time: "09:30",
          status: "proposed",
        },
        {
          id: "int_3",
          student: "Nikhil Verma",
          panel: "Panel A",
          room: "Room 101",
          start_time: "10:00",
          end_time: "10:30",
          status: "conflict",
        },
      ],
    };
  }
  const response = await apiFetch("/api/admin/schedule/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok)
    throw await apiError(response, "Failed to generate schedule");
  const result = await response.json();
  return {
    ...result,
    conflict_detected:
      result.conflict_detected ?? Boolean(result.conflicts?.length),
    conflict_details: result.conflict_details || result.conflicts?.[0],
    schedule: (result.schedule || []).map((item: ScheduleItem) => ({
      ...item,
      start_time:
        item.start_time?.length > 5
          ? item.start_time.slice(11, 16)
          : item.start_time,
      end_time:
        item.end_time?.length > 5 ? item.end_time.slice(11, 16) : item.end_time,
    })),
  };
};

export interface DelayRecoveryResponse {
  success: boolean;
  proposed_changes: Array<Record<string, unknown>>;
  affected_interviews?: Array<Record<string, unknown>>;
  message?: string;
}

export const simulateDelay = async (
  roomId: string,
  delayMinutes: number,
): Promise<DelayRecoveryResponse> => {
  const response = await apiFetch("/api/admin/simulate-delay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id: roomId, delay_minutes: delayMinutes }),
  });
  if (!response.ok)
    throw await apiError(response, "Failed to simulate room delay");
  return response.json();
};

export const approveDelayRecovery = async (
  proposedChanges: Array<Record<string, unknown>>,
): Promise<Record<string, unknown>> => {
  const response = await apiFetch("/api/admin/simulate-delay/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proposed_changes: proposedChanges }),
  });
  if (!response.ok)
    throw await apiError(response, "Failed to approve recovery plan");
  return response.json();
};

// ==========================================
// 6. STUDENT DASHBOARD
// ==========================================
export interface StudentProfile {
  name: string;
  roll_no: string;
  branch: string;
  cgpa: number;
  readiness_score: number;
  id?: string;
  backlogs?: number;
  graduation_year?: number | null;
  skills?: string[];
  projects?: string[];
}

export interface UpcomingInterview {
  company: string;
  role: string;
  date: string;
  time: string;
  room: string;
  panel: string;
  status: string;
}

export interface JobMatch {
  company: string;
  role: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation?: string;
  min_cgpa?: number;
  max_backlogs?: number;
  required_skills?: string[];
  preferred_skills?: string[];
}

export interface StudentDashboardResponse {
  success: boolean;
  profile: StudentProfile;
  upcoming_interview: UpcomingInterview | null;
  job_matches: JobMatch[];
  ai_recommendations: string[];
}

export const getStudentDashboard = async (
  studentId: string,
  useMock = false,
): Promise<StudentDashboardResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      profile: {
        name: "Aarav Mehta",
        roll_no: "23CSE001",
        branch: "CSE",
        cgpa: 8.7,
        readiness_score: 87,
      },
      upcoming_interview: {
        company: "TechNova Solutions",
        role: "Software Engineer",
        date: "Tomorrow",
        time: "10:00 AM",
        room: "Room 101",
        panel: "Technical Panel A",
        status: "Confirmed",
      },
      job_matches: [
        {
          company: "TechNova Solutions",
          role: "Software Engineer",
          match_score: 92,
          matched_skills: ["Python", "SQL", "Git", "React"],
          missing_skills: ["Docker"],
        },
        {
          company: "DataSphere AI",
          role: "ML Engineer",
          match_score: 74,
          matched_skills: ["Python", "SQL"],
          missing_skills: ["Machine Learning", "Pandas"],
        },
      ],
      ai_recommendations: [
        "Learn Docker basics to improve TechNova match.",
        "Practice advanced SQL queries.",
        "Complete 1 backend project.",
        "Run a mock technical interview.",
      ],
    };
  }
  const response = await apiFetch(
    `/api/student/dashboard?student_id=${studentId}`,
  );
  if (!response.ok) {
    throw await apiError(response, "Failed to fetch student dashboard");
  }
  return response.json();
};

// ==========================================
// 7. PANELIST DASHBOARD
// ==========================================
export interface PanelCandidate {
  id: string;
  name: string;
  cgpa: number;
  branch: string;
  skills: string[];
  projects: string[];
}

export interface PanelInterview {
  id: string;
  time: string;
  candidate: PanelCandidate;
  company: string;
  room: string;
  round: string;
  status: "pending" | "completed";
}

export interface PanelDashboardResponse {
  success: boolean;
  panelist_name: string;
  interviews: PanelInterview[];
}

export interface FeedbackPayload {
  interview_id: string;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  overall_result: "pass" | "fail" | "hold" | "";
  comments: string;
}

export const getPanelInterviews = async (
  panelistId: string,
  useMock = false,
): Promise<PanelDashboardResponse> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      panelist_name: "Technical Panel A",
      interviews: [
        {
          id: "int_001",
          time: "09:00",
          candidate: {
            id: "c1",
            name: "Aarav Mehta",
            cgpa: 8.7,
            branch: "CSE",
            skills: ["Python", "React", "SQL", "Git"],
            projects: [
              "Smart Traffic Management System",
              "Placement Portal Backend",
            ],
          },
          company: "TechNova Solutions",
          room: "Room 101",
          round: "Technical Round 1",
          status: "pending",
        },
        {
          id: "int_002",
          time: "10:00",
          candidate: {
            id: "c2",
            name: "Ananya Sharma",
            cgpa: 9.1,
            branch: "CSE",
            skills: ["Python", "SQL", "Git"],
            projects: ["Data Analytics Dashboard"],
          },
          company: "TechNova Solutions",
          room: "Room 101",
          round: "Technical Round 1",
          status: "pending",
        },
      ],
    };
  }
  const response = await apiFetch(`/api/panel/today?panelist_id=${panelistId}`);
  if (!response.ok)
    throw await apiError(response, "Failed to fetch panel schedule");
  return response.json();
};

export const submitInterviewFeedback = async (
  payload: FeedbackPayload,
  useMock = false,
): Promise<{ success: boolean; message: string }> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "Feedback submitted successfully." };
  }
  const response = await apiFetch("/api/panel/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await apiError(response, "Failed to submit feedback");
  return response.json();
};

export interface ResumeUploadResponse {
  success: boolean;
  student_id: string;
  resume_id: string;
  profile: StudentProfile;
  resume_text: string;
  skills_saved: number;
}

export const uploadResume = async (
  studentId: string,
  file: File,
): Promise<ResumeUploadResponse> => {
  const body = new FormData();
  body.append("student_id", studentId);
  body.append("file", file);
  const response = await apiFetch("/api/student/upload-resume", {
    method: "POST",
    body,
  });
  if (!response.ok) throw await apiError(response, "Failed to upload resume");
  return response.json();
};
