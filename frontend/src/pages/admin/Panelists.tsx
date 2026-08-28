// frontend/src/pages/admin/Panelists.tsx
import { useState, useEffect } from "react";
import { UsersRound, DoorClosed, Award } from "lucide-react";
import { apiGet } from "../../services/api";

interface Panel {
  panel_id: string;
  members: string[];
  expertise: string;
  status: string;
}

interface Room {
  room_number: string;
  building: string;
  capacity: number;
  status: string;
}

export default function Panelists() {
  const [data, setData] = useState<{ panels: Panel[]; rooms: Room[] }>({
    panels: [],
    rooms: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/panelists")
      .then((res: { panels: Panel[]; rooms: Room[] }) => setData(res))
      .catch((err: unknown) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">Loading panelists and rooms...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UsersRound className="w-7 h-7 text-indigo-500" />
          Panelist & Room Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Manage interview panels, faculty assignments, and room capacities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" /> Active Interview
            Panels
          </h2>
          <div className="space-y-4">
            {data.panels.map((p, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {p.panel_id}
                  </h3>
                  <span className="text-xs px-2.5 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Expertise:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {p.expertise}
                  </strong>
                </p>
                <div className="text-xs text-slate-500">
                  Members:{" "}
                  {Array.isArray(p.members) ? p.members.join(", ") : p.members}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-emerald-500" /> Room Allocation
            Matrix
          </h2>
          <div className="space-y-4">
            {data.rooms.map((r, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {r.room_number}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.building} • Capacity: {r.capacity} seats
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}