// src/services/api.ts

export const API_URL = "http://localhost:8000/api";

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
  skills: string[];
  education: string[];
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

// Comprehensive Catalog to prevent regex hallucination
const skillCatalog = [
  "Python",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue",
  "Node",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Spring Boot",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Firebase",
  "Git",
  "GitHub",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "Power BI",
  "Tableau",
  "Excel",
  "HTML",
  "CSS",
  "Tailwind",
  "Visualforce",
  "Web Services",
  "Troubleshooting",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe After Effects",
  "Adobe InDesign",
  "Adobe Premiere Pro",
  "Facebook",
  "Instagram",
  "TikTok",
];

const normalizeSkill = (skill: string) => {
  const text = skill.trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  if (
    lower.includes("node.js") ||
    lower.includes("node js") ||
    lower.includes("node")
  )
    return "Node.js";
  if (lower.includes("react.js") || lower.includes("react")) return "React";
  if (lower.includes("python") || lower.includes("py")) return "Python";
  if (lower.includes("sql") || lower.includes("structured query")) return "SQL";
  if (lower.includes("docker")) return "Docker";
  if (lower.includes("machine learning") || lower.includes("ml"))
    return "Machine Learning";
  if (lower.includes("javascript") || lower.includes("js")) return "JavaScript";
  if (lower.includes("typescript") || lower.includes("ts")) return "TypeScript";
  if (lower.includes("data structures") || lower.includes("dsa"))
    return "Data Structures";
  if (lower.includes("algorithm")) return "Algorithms";
  if (lower === "c++") return "C++";
  if (lower.includes("git") && !lower.includes("github")) return "Git";
  if (lower.includes("mongodb") || lower.includes("mongo db")) return "MongoDB";
  return text;
};

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

const parseResumeText = (text: string): ParsedResumeData => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/,
  );

  let extractedCgpa: number | null = null;
  const fractionMatch = text.match(
    /(\d{1,2}(?:\.\d{1,2})?)\s*\/\s*(4\.?0?|5\.?0?|10\.?0?)/,
  );
  if (fractionMatch) {
    const rawVal = Number(fractionMatch[1]);
    const scale = Number(fractionMatch[2]);
    if (scale === 4 || scale === 4.0) extractedCgpa = (rawVal / 4.0) * 10;
    else if (scale === 5 || scale === 5.0) extractedCgpa = (rawVal / 5.0) * 10;
    else extractedCgpa = rawVal;
  } else {
    const cgpaMatch = text.match(
      /(?:CGPA|Cumulative GPA|GPA)\s*[:=-]?\s*([0-9](?:\.\d{1,2})?)/i,
    );
    if (cgpaMatch) {
      let rawVal = Number(cgpaMatch[1]);
      if (rawVal <= 4.0) rawVal = (rawVal / 4.0) * 10;
      else if (rawVal <= 5.0 && rawVal > 4.0) rawVal = (rawVal / 5.0) * 10;
      extractedCgpa = rawVal;
    }
  }
  if (extractedCgpa !== null) extractedCgpa = Number(extractedCgpa.toFixed(1));

  // Restored strict name extraction for the bottom Profile Box
  let fallbackName = "Candidate Name";
  const forbiddenNameKeywords =
    /(student|engineer|developer|intern|resume|cv|skills|education|experience|contact|phone|email|summary|objective|ak|al|ar|az|ca|co|ct|dc|de|fl|ga|hi|ia|portfolio|profile)/i;

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (/[0-9@]/.test(line) || /github|linkedin|\.com/i.test(line)) continue;

    const cleanLine = line.replace(/[^a-zA-Z\s]/g, "").trim();
    const words = cleanLine.split(/\s+/);
    if (
      words.length >= 1 &&
      words.length <= 4 &&
      cleanLine.length > 2 &&
      !forbiddenNameKeywords.test(cleanLine)
    ) {
      fallbackName = line.trim();
      break;
    }
  }

  // Strict word boundaries to avoid 'received' hallucinating 'ECE'
  const education = lines.filter((line) =>
    /\b(B\.Tech|BTech|M\.Tech|MBA|B\.E|B\.F\.A|BFA|Bachelor|Master|Engineering|Computer Science|CSE|ECE|Arts|Science)\b/i.test(
      line,
    ),
  );

  const skillMatches = new Set<string>();

  skillCatalog.forEach((skill) => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Strict non-word boundary checks prevent URLs from firing skills
    const regex = new RegExp(
      `(?:^|[^a-zA-Z0-9_])${escapedSkill}(?=[^a-zA-Z0-9_]|$)`,
      "i",
    );
    if (regex.test(text)) {
      skillMatches.add(normalizeSkill(skill));
    }
  });

  const extractedSkills = Array.from(skillMatches).filter(Boolean);

  return {
    name: fallbackName,
    email: emailMatch?.[0] || "N/A",
    phone: phoneMatch?.[0] || "N/A",
    cgpa: extractedCgpa,
    skills: [...new Set(extractedSkills.map((s) => normalizeSkill(s)))].filter(
      Boolean,
    ),
    education: education.slice(0, 3),
    summary: text.slice(0, 220) || "Resume parsed successfully.",
    extracted_text: text,
  };
};

export const parseStudentResume = async (
  file: File,
  targetJob: any,
): Promise<ResumeMatchResult> => {
  const resumeText = await resumeParsingAgent(file);
  const parsed = parseResumeText(resumeText);
  const requiredSkills = [...new Set(targetJob.matched_skills as string[])];

  const normalizedParsedSkills = parsed.skills.map((skill) =>
    normalizeSkill(skill).toLowerCase(),
  );
  const matchedSkills = requiredSkills.filter((skill) => {
    const normalizedSkill = normalizeSkill(skill).toLowerCase();
    return normalizedParsedSkills.some(
      (parsedSkill) =>
        parsedSkill.includes(normalizedSkill) ||
        normalizedSkill.includes(parsedSkill),
    );
  });

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );
  const cgpaScore = parsed.cgpa
    ? Math.max(0, Math.min(100, (parsed.cgpa / 10) * 100))
    : 0;
  const skillCoverage = requiredSkills.length
    ? (matchedSkills.length / requiredSkills.length) * 100
    : 0;
  const score = Math.round(cgpaScore * 0.45 + skillCoverage * 0.55);

  let eligibilityStatus: "Eligible" | "Borderline" | "Not Eligible" =
    "Not Eligible";
  if (score >= 75 && (parsed.cgpa === null || parsed.cgpa >= 7.0))
    eligibilityStatus = "Eligible";
  else if (score >= 55) eligibilityStatus = "Borderline";

  const reasons: string[] = [];
  if (parsed.cgpa !== null && parsed.cgpa < 7)
    reasons.push("CGPA below the target eligibility threshold.");
  if (missingSkills.length > 0)
    reasons.push(`Missing key skills: ${missingSkills.join(", ")}.`);

  return {
    success: true,
    file_name: file.name,
    company: targetJob.company,
    role: targetJob.role,
    required_skills: requiredSkills,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    eligibility_score: score,
    eligibility_status: eligibilityStatus,
    reasons: reasons.length
      ? reasons
      : ["Strong match with the company requirements."],
    parsed,
  };
};