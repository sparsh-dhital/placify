// frontend/src/pages/admin/Communications.tsx
import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "../../services/api";

interface Communication {
  id?: string;
  title: string;
  body?: string;
  recipients: string;
  date: string;
  status: string;
}

export default function Communications() {
  const [comms, setComms] = useState<Communication[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("Shortlisted Candidates");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet("/admin/communications")
      .then((res: { communications: Communication[] }) =>
        setComms(res.communications || []),
      )
      .catch((err: unknown) => console.error(err));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    try {
      await apiPost("/admin/communications/broadcast", {
        title,
        body,
        recipients,
      });
      alert("Broadcast successfully dispatched to student portals!");
      setTitle("");
      setBody("");
      const res: { communications: Communication[] } = await apiGet(
        "/admin/communications",
      );
      setComms(res.communications || []);
    } catch (err: any) {
      alert("Failed to send broadcast: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-500" />
          Communications & Broadcast Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Send announcements, schedule updates, and notifications directly to
          candidate dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            New Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Subject / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Interview Timing Update"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Target Audience
              </label>
              <select
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Shortlisted Candidates">
                  Shortlisted Candidates
                </option>
                <option value="All Eligible Students">
                  All Eligible Students
                </option>
                <option value="Panelists">Panelists Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Write your announcement details..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />{" "}
              {loading ? "Broadcasting..." : "Broadcast Message"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Recent Broadcast History
          </h2>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px]">
            {comms.map((c, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {c.body || c.recipients}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-white/5">
                  <span>To: {c.recipients}</span>
                  <span>{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}