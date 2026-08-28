// frontend/src/services/api.ts

export const API_URL = "http://localhost:8000/api";

// ==========================================
// SECURITY HELPER: Auto-inject JWT Tokens
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
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }
  return response.json();
};

// ==========================================
// GENERIC API HELPERS
// ==========================================
export const apiGet = async (endpoint: string) => {
  return fetchWithAuth(endpoint);
};

export const apiPost = async (endpoint: string, data: any) => {
  return fetchWithAuth(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ==========================================
// AUTHENTICATION
// ==========================================
export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok)
    throw new Error((await response.json()).detail || "Login failed");
  return response.json();
}
export async function requestSignupOtp(email: string) {
  const response = await fetch(`${API_URL}/auth/signup/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok)
    throw new Error((await response.json()).detail || "Failed to send code");
  return response.json();
}
export async function verifySignupOtp(data: any) {
  const response = await fetch(`${API_URL}/auth/signup/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).detail || "Failed to create account",
    );
  return response.json();
}
export async function requestPasswordResetOtp(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).detail || "Failed to send reset code",
    );
  return response.json();
}
export async function resetPassword(data: any) {
  const response = await fetch(`${API_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).detail || "Failed to reset password",
    );
  return response.json();
}
export async function verifyOAuthCode(
  code: string,
  provider: string,
  role: string,
) {
  const response = await fetch(`${API_URL}/auth/oauth/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, provider, role }),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).detail || "OAuth verification failed",
    );
  return response.json();
}

// ==========================================
// CHAT
// ==========================================
export const sendChatMessage = async (
  userId: string,
  role: string,
  message: string,
) =>
  fetchWithAuth("/chat/analyze", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role, message }),
  });
export const getChatHistory = async (userId: string) =>
  fetchWithAuth(`/chat/history?user_id=${encodeURIComponent(userId)}`);
export const deleteChatMessage = async (messageId: string) =>
  fetchWithAuth("/chat/delete-message", {
    method: "POST",
    body: JSON.stringify({ message_id: messageId }),
  });
export const clearChatHistory = async (userId: string) =>
  fetchWithAuth("/chat/clear", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });

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
  fetchWithAuth("/admin/metrics");

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
}> => fetchWithAuth("/admin/jobs");

export const publishActiveJob = async (jobData: { text: string }) =>
  fetchWithAuth("/admin/jobs/publish", {
    method: "POST",
    body: JSON.stringify(jobData),
  });

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
  fetchWithAuth("/admin/jd/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
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
  fetchWithAuth("/admin/eligibility/run", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });

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
  fetchWithAuth("/admin/matches/generate", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });

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
  fetchWithAuth("/admin/shortlist/approve", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, decisions }),
  });

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
  fetchWithAuth("/admin/schedule/generate", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });

// ==========================================
// STUDENT
// ==========================================
export interface StudentProfile {
  name: string;
  roll_no: string;
  branch: string;
  cgpa: number;
  readiness_score: number;
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
}
export interface StudentDashboardResponse {
  success: boolean;
  profile: StudentProfile;
  upcoming_interview: UpcomingInterview | null;
  job_matches: JobMatch[];
  ai_recommendations: string[];
}
export const getStudentDashboard =
  async (): Promise<StudentDashboardResponse> =>
    fetchWithAuth("/student/dashboard");

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
  fetchWithAuth("/panel/today");
export const submitInterviewFeedback = async (
  payload: FeedbackPayload,
): Promise<{ success: boolean; message: string }> =>
  fetchWithAuth("/panel/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  });

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
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const text = await recognizeCanvasText(canvas);
          resolve(text);
        } catch {
          const result = await Tesseract.recognize(file, "eng", {
            logger: () => undefined,
          });
          resolve(cleanOcrText(result.data.text || ""));
        }
      } else {
        const result = await Tesseract.recognize(file, "eng", {
          logger: () => undefined,
        });
        resolve(cleanOcrText(result.data.text || ""));
      }
    };
    img.onerror = async () => {
      const result = await Tesseract.recognize(file, "eng", {
        logger: () => undefined,
      });
      resolve(cleanOcrText(result.data.text || ""));
    };
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
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  const textLayer = pages.join("\n").trim();
  const hasValidEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(
    textLayer,
  );
  const hasGarbledEncoding = /[\ufffd]{2,}/.test(textLayer);

  if (textLayer.length >= 40 && hasValidEmail && !hasGarbledEncoding)
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
  const nonPrintableCount = (
    text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/g) || []
  ).length;
  if (text.length > 0 && nonPrintableCount / text.length > 0.05) {
    throw new Error(
      "Unsupported binary format detected. Please upload a standard PDF, Image, or plain text document.",
    );
  }
  return text;
};

const resumeParsingAgent = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const fileType = file.type.toLowerCase();

  if (extension === "pdf" || fileType === "application/pdf")
    return extractTextFromPdf(file);
  if (
    fileType.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp"].includes(extension)
  )
    return extractTextFromImage(file);
  if (fileType.startsWith("text/") || ["txt", "md", "csv"].includes(extension))
    return extractTextFromTextFile(file);
  throw new Error(
    `The file extension (.${extension}) cannot be parsed. Please upload a PDF, Image, or plain text file.`,
  );
};

export const parseStudentResume = async (
  file: File,
  targetJob: any,
): Promise<ResumeMatchResult> => {
  const resumeText = await resumeParsingAgent(file);

  const response = await fetchWithAuth("/student/parse-resume-llm", {
    method: "POST",
    body: JSON.stringify({
      text: resumeText,
      company: targetJob.company,
      role: targetJob.role,
      matched_skills: targetJob.matched_skills,
      missing_skills: targetJob.missing_skills,
    }),
  });

  response.parsed.extracted_text = resumeText;
  response.file_name = file.name;

  return response;
};