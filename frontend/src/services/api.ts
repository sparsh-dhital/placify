// frontend/src/services/api.ts
export const API_URL =
  import.meta.env.VITE_API_URL || "https://placify-o7ci.onrender.com/api";

// ==========================================
// SECURITY & ERROR HELPER
// ==========================================
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("placify_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("placify_token");
      localStorage.removeItem("placify_user");
      window.location.href = "/login";
    }

    const errorData = await response.json().catch(() => ({}));
    let errMsg = errorData.detail || `Server error: ${response.status}`;

    if (Array.isArray(errMsg)) {
      errMsg = errMsg
        .map((e: any) => `${e.loc?.slice(-1)[0] || "Field"}: ${e.msg}`)
        .join(" | ");
    }

    throw new Error(
      typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
    );
  }
  return response.json();
};

// ==========================================
// DATA SANITIZER
// ==========================================
export const sanitizeStringArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        return (
          item.skill ||
          item.name ||
          item.title ||
          Object.values(item)[0] ||
          JSON.stringify(item)
        );
      }
      return String(item);
    })
    .filter(Boolean);
};

// ==========================================
// GENERIC API HELPERS
// ==========================================
export const apiGet = async (endpoint: string) => fetchWithAuth(endpoint);
export const apiPost = async (endpoint: string, data: any) =>
  fetchWithAuth(endpoint, { method: "POST", body: JSON.stringify(data) });

// ==========================================
// AUTHENTICATION
// ==========================================
export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  return apiPost("/auth/login", credentials);
}
export async function requestSignupOtp(email: string) {
  return apiPost("/auth/signup/request-otp", { email });
}
export async function verifySignupOtp(data: any) {
  return apiPost("/auth/signup/verify", data);
}
export async function requestPasswordResetOtp(email: string) {
  return apiPost("/auth/forgot-password/request-otp", { email });
}
export async function resetPassword(data: any) {
  return apiPost("/auth/forgot-password/reset", data);
}
export async function verifyOAuthCode(
  code: string,
  provider: string,
  role: string,
) {
  return apiPost("/auth/oauth/callback", { code, provider, role });
}

// ==========================================
// CHAT
// ==========================================
export const sendChatMessage = async (
  userId: string,
  role: string,
  message: string,
) => apiPost("/chat/analyze", { user_id: userId, role, message });
export const getChatHistory = async (userId: string) =>
  apiGet(`/chat/history?user_id=${encodeURIComponent(userId)}`);
export const deleteChatMessage = async (messageId: string) =>
  apiPost("/chat/delete-message", { message_id: messageId });
export const clearChatHistory = async (userId: string) =>
  apiPost("/chat/clear", { user_id: userId });

// ==========================================
// ADMIN & AGENTS
// ==========================================
export interface AdminDashboardMetrics {
  active_companies_count: number;
  eligible_students_count: number;
  shortlisted_count: number;
  interviews_today_count: number;
  pending_actions: {
    title: string;
    detail: string;
    link: string;
    action: string;
  }[];
  todays_schedule: {
    time: string;
    company: string;
    round: string;
    room: string;
    count: string;
  }[];
  agent_activity: {
    agent: string;
    detail: string;
    time: string;
    color: string;
  }[];
  readiness_stats: {
    verified_count: number;
    total_count: number;
    avg_readiness: number;
    open_exceptions: number;
  };
}
export const getAdminMetrics = async (): Promise<AdminDashboardMetrics> =>
  apiGet("/admin/metrics");

export interface JobRecord {
  job_id: string;
  company: string;
  role: string;
  min_cgpa: number;
  max_backlogs: number;
  status: string;
  required_skills: string[];
  preferred_skills?: string[];
  salary?: string;
}
export const getActiveJobs = async (): Promise<{
  success: boolean;
  jobs: JobRecord[];
}> => apiGet("/admin/jobs");
export const publishActiveJob = async (jobData: { text: string }) =>
  apiPost("/admin/jobs/publish", jobData);

export interface JDAnalysisResponse {
  success: boolean;
  company: string;
  role: string;
  min_cgpa: number;
  max_backlogs: number;
  salary: string;
  required_skills: string[];
  preferred_skills: string[];
  ai_confidence?: number;
}
export const analyzeJD = async (text: string): Promise<JDAnalysisResponse> =>
  apiPost("/admin/jd/analyze", { text });
export const analyzeJDFile = async (
  file: File,
): Promise<JDAnalysisResponse> => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const text =
    extension === "pdf" || file.type === "application/pdf"
      ? await extractTextFromPdf(file)
      : await file.text();
  if (!text.trim()) throw new Error("No readable text was found in this file.");
  return analyzeJD(text);
};

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
): Promise<EligibilityResponse> =>
  apiPost("/admin/eligibility/run", { job_id: jobId });

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
export const generateMatches = async (jobId: string): Promise<MatchResponse> =>
  apiPost("/admin/matches/generate", { job_id: jobId });

export interface ShortlistDecision {
  student_id: string;
  action: "approve" | "reject";
  override_reason?: string;
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
): Promise<ShortlistSubmitResponse> =>
  apiPost("/admin/shortlist/approve", { job_id: jobId, decisions });

export interface ScheduleItem {
  id: string;
  student: string;
  panel: string;
  room: string;
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
}
export const generateSchedule = async (
  jobId: string,
): Promise<ScheduleResponse> =>
  apiPost("/admin/schedule/generate", { job_id: jobId });

export interface ExceptionItem {
  id: string;
  severity: "high" | "medium" | "low";
  resource: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
  status: "pending" | "resolved";
}
export const getAdminExceptions = async (): Promise<{
  success: boolean;
  exceptions: ExceptionItem[];
}> => apiGet("/admin/exceptions");
export const resolveAdminException = async (id: string) =>
  apiPost(`/admin/exceptions/${id}/resolve`, {});

export interface AuditLogItem {
  id: string;
  time: string;
  agent_name: string;
  type: "agent" | "human" | "system" | "exception";
  action: string;
  details: string;
}
export const getAuditLogs = async (): Promise<{
  success: boolean;
  logs: AuditLogItem[];
}> => apiGet("/admin/audit-logs");

// ==========================================
// STUDENT
// ==========================================
export interface StudentProfile {
  name: string;
  roll_no: string;
  branch: string;
  cgpa: number;
  readiness_score: number;
  skills?: string[];
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
  required_skills?: string[];
  description?: string;
  min_cgpa?: number;
  max_backlogs?: number;
}
export interface StudentDashboardResponse {
  success: boolean;
  profile: StudentProfile;
  upcoming_interview: UpcomingInterview | null;
  job_matches: JobMatch[];
  ai_recommendations: string[];
}

export const getStudentDashboard =
  async (): Promise<StudentDashboardResponse> => {
    const response = await apiGet("/student/dashboard");
    if (response.job_matches && Array.isArray(response.job_matches)) {
      response.job_matches = response.job_matches.map((match: any) => ({
        ...match,
        matched_skills: sanitizeStringArray(match.matched_skills),
        missing_skills: sanitizeStringArray(match.missing_skills),
        required_skills: sanitizeStringArray(match.required_skills),
      }));
    }
    return response;
  };

// ==========================================
// PANELIST
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
export const getPanelInterviews = async (): Promise<PanelDashboardResponse> =>
  apiGet("/panel/today");
export const submitInterviewFeedback = async (
  payload: FeedbackPayload,
): Promise<{ success: boolean; message: string }> =>
  apiPost("/panel/feedback", payload);

// ==========================================
// RESUME PARSING (OCR + LLM)
// ==========================================
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  cgpa: number | null;
  raw_cgpa: number | null;
  gpa_type: string;
  skills: string[];
  education: string[];
  strong_points: string[];
  weak_points: string[];
  summary: string;
  extracted_text: string;
}
export interface ResumeMatchResult {
  success: boolean;
  file_name: string;
  company: string;
  role: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  eligibility_score: number;
  eligibility_status: "Eligible" | "Borderline" | "Not Eligible";
  reasons: string[];
  parsed: ParsedResumeData;
}

const cleanOcrText = (text: string) =>
  text
    .replace(/\r/g, "\n")
    .split("")
    .filter((c) => c === "\n" || c === "\t" || c.charCodeAt(0) >= 32)
    .join("")
    .replace(/[ ]{2,}/g, " ")
    .trim();
const recognizeCanvasText = async (canvas: HTMLCanvasElement) => {
  const result = await Tesseract.recognize(canvas, "eng", {
    logger: () => undefined,
  });
  return cleanOcrText(result.data.text || "");
};

const extractTextFromImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          resolve(await recognizeCanvasText(canvas));
        } catch {
          resolve(
            cleanOcrText(
              (
                await Tesseract.recognize(file, "eng", {
                  logger: () => undefined,
                })
              ).data.text || "",
            ),
          );
        }
      } else {
        resolve(
          cleanOcrText(
            (
              await Tesseract.recognize(file, "eng", {
                logger: () => undefined,
              })
            ).data.text || "",
          ),
        );
      }
    };
    img.onerror = async () =>
      resolve(
        cleanOcrText(
          (await Tesseract.recognize(file, "eng", { logger: () => undefined }))
            .data.text || "",
        ),
      );
    img.src = URL.createObjectURL(file);
  });
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
    );
  }
  const textLayer = pages.join("\n").trim();
  if (
    textLayer.length >= 40 &&
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(textLayer) &&
    !/[\ufffd]{2,}/.test(textLayer)
  )
    return textLayer;

  const ocrPages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) continue;
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const text = await recognizeCanvasText(canvas);
    if (text) ocrPages.push(text);
  }
  const cleanedOcr = ocrPages.filter(Boolean).join("\n");
  return cleanedOcr.length > 20 ? cleanedOcr : textLayer;
};

const extractTextFromTextFile = async (file: File): Promise<string> => {
  const text = await file.text();
  if (
    text.length > 0 &&
    (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/g) || []).length /
      text.length >
      0.05
  ) {
    throw new Error(
      "Unsupported binary format detected. Please upload a standard PDF, Image, or plain text document.",
    );
  }
  return text;
};

const resumeParsingAgent = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const type = file.type.toLowerCase();
  if (ext === "pdf" || type === "application/pdf")
    return extractTextFromPdf(file);
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext))
    return extractTextFromImage(file);
  if (type.startsWith("text/") || ["txt", "md", "csv"].includes(ext))
    return extractTextFromTextFile(file);
  throw new Error(
    `The file extension (.${ext}) cannot be parsed. Please upload a PDF, Image, or plain text file.`,
  );
};

// ==========================================
// DYNAMIC RESUME PARSING
// ==========================================
export const parseStudentResume = async (
  file: File,
  targetJob?: {
    company: string;
    role: string;
    matched_skills: string[];
    missing_skills: string[];
  },
): Promise<ResumeMatchResult> => {
  const resumeText = await resumeParsingAgent(file);

  const payload = {
    text: resumeText,
    company: targetJob?.company || "Global Evaluator",
    role: targetJob?.role || "General Applicant",
    matched_skills: targetJob?.matched_skills || [],
    missing_skills: targetJob?.missing_skills || [],
  };

  const response = await fetchWithAuth("/student/parse-resume-llm", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response && response.parsed) {
    response.parsed.extracted_text = resumeText;
    response.parsed.skills = sanitizeStringArray(response.parsed.skills);
    response.parsed.education = sanitizeStringArray(response.parsed.education);
    response.parsed.strong_points = sanitizeStringArray(
      response.parsed.strong_points,
    );
    response.parsed.weak_points = sanitizeStringArray(
      response.parsed.weak_points,
    );
  }

  response.matched_skills = sanitizeStringArray(response.matched_skills);
  response.missing_skills = sanitizeStringArray(response.missing_skills);
  response.required_skills = sanitizeStringArray(response.required_skills);
  response.file_name = file.name;

  return response;
};
