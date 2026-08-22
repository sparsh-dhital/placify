// src/services/api.ts

// ==========================================
// 0. AUTHENTICATION & AI CRITIC (MongoDB)
// ==========================================
export const API_URL = "http://localhost:8000/api";

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

export async function requestOtpLogin(email: string) {
  const response = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok)
    throw new Error((await response.json()).detail || "Failed to request OTP");
  return response.json();
}

export async function verifyOtpLogin(email: string, otp: string) {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!response.ok)
    throw new Error((await response.json()).detail || "Invalid or expired OTP");
  return response.json();
}

export const sendChatMessage = async (
  userId: string,
  role: string,
  message: string,
) => {
  const response = await fetch(`${API_URL}/chat/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        `Server error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
};

export const getChatHistory = async (userId: string) => {
  const response = await fetch(
    `${API_URL}/chat/history?user_id=${encodeURIComponent(userId)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch chat history");
  return response.json();
};

export const deleteChatMessage = async (messageId: string) => {
  const response = await fetch(`${API_URL}/chat/delete-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id: messageId }),
  });
  if (!response.ok) throw new Error("Failed to delete message from database");
  return response.json();
};

export const clearChatHistory = async (userId: string) => {
  const response = await fetch(`${API_URL}/chat/clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok)
    throw new Error("Failed to clear chat history from database");
  return response.json();
};

// ==========================================
// 1. JD ANALYZER AGENT
// ==========================================
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
  const response = await fetch("/api/admin/jd/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Failed to analyze JD");
  return response.json();
};

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
  const response = await fetch("/api/admin/eligibility/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok) throw new Error("Failed to run eligibility");
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
  const response = await fetch("/api/admin/matches/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok) throw new Error("Failed to generate matches");
  return response.json();
};

// ==========================================
// 4. SHORTLIST APPROVAL
// ==========================================
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
  const response = await fetch("/api/admin/shortlist/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId, decisions }),
  });
  if (!response.ok) throw new Error("Failed to submit shortlist");
  return response.json();
};

// ==========================================
// 5. INTERVIEW SCHEDULER AGENT
// ==========================================
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
  const response = await fetch("/api/admin/schedule/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId }),
  });
  if (!response.ok) throw new Error("Failed to generate schedule");
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
  const response = await fetch(
    `/api/student/dashboard?student_id=${studentId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch student dashboard");
  return response.json();
};

// ==========================================
// 8. RESUME PARSER + JOB MATCHING
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

const skillCatalog = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Node",
  "Node.js",
  "SQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "Django",
  "Flask",
  "Spring",
  "Express",
  "Power BI",
  "Tableau",
  "Excel",
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
  if (lower.includes("git")) return "Git";
  if (lower.includes("mongodb") || lower.includes("mongo db")) return "MongoDB";
  return text;
};

const cleanOcrText = (text: string) =>
  text
    .replace(/\r/g, "\n")
    .split("")
    .filter(
      (character) =>
        character === "\n" ||
        character === "\t" ||
        character.charCodeAt(0) >= 32,
    )
    .join("")
    .replace(/[ ]{2,}/g, " ")
    .trim();

const recognizeCanvasText = async (canvas: HTMLCanvasElement) => {
  const result = await Tesseract.recognize(canvas, "eng", {
    logger: () => undefined,
  });
  return cleanOcrText(result.data.text || "");
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  const textLayer = pages.join("\n").trim();
  if (textLayer.length >= 40) return textLayer;

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

  return [textLayer, ...ocrPages].filter(Boolean).join("\n");
};

const preprocessCanvasImage = (
  canvas: HTMLCanvasElement,
  invert: boolean = false,
  threshold: number = 140,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (invert) {
      gray = 255 - gray;
    }

    if (gray < threshold) gray = gray * 1.7;
    else if (gray > threshold + 40) gray = 255;
    else gray = gray * 1.12 + 16;

    const finalValue = Math.max(0, Math.min(255, gray));
    data[i] = finalValue;
    data[i + 1] = finalValue;
    data[i + 2] = finalValue;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to load image."));
      img.src = objectUrl;
    });

    const maxDimension = 3200;
    const scale = Math.min(
      2.5,
      maxDimension / Math.max(image.width, image.height),
    );

    const baseCanvas = document.createElement("canvas");
    const baseCtx = baseCanvas.getContext("2d");
    if (!baseCtx) return "";

    baseCanvas.width = Math.max(1, Math.round(image.width * scale));
    baseCanvas.height = Math.max(1, Math.round(image.height * scale));
    baseCtx.fillStyle = "#ffffff";
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.drawImage(image, 0, 0, baseCanvas.width, baseCanvas.height);

    const candidates: HTMLCanvasElement[] = [baseCanvas];
    for (const [invert, threshold] of [
      [false, 120],
      [true, 160],
      [false, 170],
    ] as const) {
      const candidate = document.createElement("canvas");
      candidate.width = baseCanvas.width;
      candidate.height = baseCanvas.height;
      const candidateContext = candidate.getContext("2d");
      if (!candidateContext) continue;
      candidateContext.drawImage(baseCanvas, 0, 0);
      candidates.push(preprocessCanvasImage(candidate, invert, threshold));
    }

    const recognizedTexts: string[] = [];

    for (const canvas of candidates) {
      const text = await recognizeCanvasText(canvas);

      if (text && text.length > 20) recognizedTexts.push(text);
    }

    const directResult = await Tesseract.recognize(file, "eng", {
      logger: () => undefined,
    });
    const directText = cleanOcrText(directResult.data.text || "");
    if (directText && directText.length > 20) recognizedTexts.push(directText);

    if (!recognizedTexts.length) return "";
    return recognizedTexts.sort((a, b) => b.length - a.length)[0].trim();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const extractTextFromTextFile = async (file: File): Promise<string> => {
  return await file.text();
};

const resumeParsingAgent = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const fileType = file.type.toLowerCase();
  if (extension === "pdf" || fileType === "application/pdf")
    return extractTextFromPdf(file);
  if (
    ["png", "jpg", "jpeg", "webp"].includes(extension) ||
    fileType.startsWith("image/")
  )
    return extractTextFromImage(file);
  return extractTextFromTextFile(file);
};

const parseResumeText = (text: string): ParsedResumeData => {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const cleanText = normalizedText || "";
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/,
  );
  const cgpaMatch = text.match(
    /(?:CGPA|Cumulative GPA|GPA|cgpa|CGP A)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i,
  );

  const fallbackName = lines.find((line) => {
    const normalized = line.replace(/\s+/g, " ");
    return (
      /^[A-Z][A-Za-z'-.]+(?:\s+[A-Z][A-Za-z'-.]+){0,4}$/.test(normalized) &&
      !/[0-9]/.test(normalized) &&
      normalized.length > 2 &&
      !/(SKILLS|PROJECTS|EDUCATION|EXPERIENCE|CONTACT|PHONE|EMAIL)/i.test(
        normalized,
      )
    );
  });

  const education = lines.filter((line) =>
    /B\.Tech|BTech|M\.Tech|MBA|B\.E|Bachelor|Master|Engineering|Computer Science|CSE|ECE|Computer Science and Engineering/i.test(
      line,
    ),
  );

  const skillMatches = new Set<string>();
  skillCatalog.forEach((skill) => {
    const regex = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (regex.test(text)) {
      skillMatches.add(normalizeSkill(skill));
    }
  });

  const fallbackSkills = Array.from(
    new Set(
      (
        text.match(
          /(?:Python|Java|C\+\+|JavaScript|TypeScript|React|SQL|AWS|Docker|Git|MongoDB|Node\.js|Node|Machine Learning|ML|Algorithms|Data Structures|Django|Flask|Spring|Express|MongoDB|Tableau|Power BI|Excel)/gi,
        ) || []
      ).map((skill) => normalizeSkill(skill)),
    ),
  );

  const extractedSkills = [
    ...Array.from(skillMatches),
    ...fallbackSkills,
  ].filter(Boolean);

  return {
    name: fallbackName || "Student",
    email: emailMatch?.[0] || "N/A",
    phone: phoneMatch?.[0] || "N/A",
    cgpa: cgpaMatch ? Number(cgpaMatch[1]) : null,
    skills: [...new Set(extractedSkills.map((s) => normalizeSkill(s)))].filter(
      Boolean,
    ),
    education: education.slice(0, 3),
    summary: cleanText.slice(0, 220) || "Resume parsed successfully.",
    extracted_text: cleanText,
  };
};

export const parseStudentResume = async (
  file: File,
  targetJob: {
    company: string;
    role: string;
    matched_skills: string[];
    missing_skills: string[];
  } = {
    company: "TechNova Solutions",
    role: "Software Engineer",
    matched_skills: ["Python", "SQL", "Git", "React"],
    missing_skills: ["Docker"],
  },
): Promise<ResumeMatchResult> => {
  const resumeText = await resumeParsingAgent(file);

  const parsed = parseResumeText(resumeText);
  const requiredSkills = [...new Set(targetJob.matched_skills)];
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
  if (score >= 75 && (parsed.cgpa === null || parsed.cgpa >= 7.0)) {
    eligibilityStatus = "Eligible";
  } else if (score >= 55) {
    eligibilityStatus = "Borderline";
  }

  const reasons: string[] = [];
  if (parsed.cgpa !== null && parsed.cgpa < 7) {
    reasons.push("CGPA below the target eligibility threshold.");
  }
  if (missingSkills.length > 0) {
    reasons.push(`Missing key skills: ${missingSkills.join(", ")}.`);
  }
  if (!parsed.skills.length) {
    reasons.push(
      "Resume text was not detected clearly enough for skill extraction.",
    );
  }

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
  const response = await fetch(`/api/panel/today?panelist_id=${panelistId}`);
  if (!response.ok) throw new Error("Failed to fetch panel schedule");
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
  const response = await fetch("/api/panel/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to submit feedback");
  return response.json();
};