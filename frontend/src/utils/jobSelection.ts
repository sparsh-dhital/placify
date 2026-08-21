const JOB_KEY = "placify_active_job_id";

export function getActiveJobId(): string {
  return localStorage.getItem(JOB_KEY) || "";
}

export function saveActiveJobId(jobId: string): void {
  localStorage.setItem(JOB_KEY, jobId.trim());
}
