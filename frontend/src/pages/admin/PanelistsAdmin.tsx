import { useState, useEffect } from "react";
import {
  UsersRound,
  DoorClosed,
  Award,
  Pencil,
  Trash2,
  Save,
  UserRound,
  Building2,
  CalendarRange,
} from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../services/api";

interface Panel {
  panel_id: string;
  members: string[];
  expertise: string;
  status: string;
}

interface Room {
  room_id?: string;
  room_number: string;
  building: string;
  capacity: number;
  status: string;
}

interface Student {
  student_id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  skills: string[];
  shortlist_status: string;
  readiness_score: number;
}

interface InterviewAssignment {
  id: string;
  student: string;
  company: string;
  room: string;
  panel: string;
  status: string;
  start_time: string;
  end_time: string;
}

const emptyStudent = {
  student_id: "",
  name: "",
  email: "",
  branch: "Computer Science",
  cgpa: 8.0,
  backlogs: 0,
  skills: "",
  shortlist_status: "pending",
  readiness_score: 0,
};

const emptyRoom = {
  room_number: "",
  building: "Tech Block A",
  capacity: 6,
  status: "Available",
};

const emptyPanel = {
  panel_id: "",
  members: "",
  expertise: "General Interview",
  status: "Active",
};

export default function PanelistsAdmin() {
  const [data, setData] = useState<{
    panels: Panel[];
    rooms: Room[];
    students: Student[];
    interviews: InterviewAssignment[];
  }>({
    panels: [],
    rooms: [],
    students: [],
    interviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [panelForm, setPanelForm] = useState(emptyPanel);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = (await apiGet("/admin/panelists")) as {
        success: boolean;
        panels: Panel[];
        rooms: Room[];
        students: Student[];
        interviews: InterviewAssignment[];
      };
      if (res.success) {
        setData({
          panels: res.panels || [],
          rooms: res.rooms || [],
          students: res.students || [],
          interviews: res.interviews || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch admin registry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...studentForm,
        student_id: studentForm.student_id || studentForm.email,
        skills: studentForm.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      if (editingStudentId) {
        await apiPut(`/admin/students/${editingStudentId}`, payload);
      } else {
        await apiPost("/admin/students", payload);
      }

      setStudentForm(emptyStudent);
      setEditingStudentId(null);
      await load();
    } catch (err: any) {
      alert(
        "Failed to save student record: " + (err.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRoomSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = { ...roomForm };
      if (editingRoomId) {
        await apiPut(`/admin/rooms/${editingRoomId}`, payload);
      } else {
        await apiPost("/admin/rooms", payload);
      }

      setRoomForm(emptyRoom);
      setEditingRoomId(null);
      await load();
    } catch (err: any) {
      alert("Failed to save room record: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePanelSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...panelForm,
        members: panelForm.members
          .split(",")
          .map((member) => member.trim())
          .filter(Boolean),
      };

      if (editingPanelId) {
        await apiPut(`/admin/panels/${editingPanelId}`, payload);
      } else {
        await apiPost("/admin/panels", payload);
      }

      setPanelForm(emptyPanel);
      setEditingPanelId(null);
      await load();
    } catch (err: any) {
      alert("Failed to save panel record: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleReassignRoom = async (interviewId: string, room: string) => {
    if (!room?.trim()) return;

    try {
      await apiPut(`/admin/interviews/${interviewId}/room`, {
        room: room.trim(),
      });

      // Optimistically update UI immediately
      setData((prev) => ({
        ...prev,
        interviews: prev.interviews.map((item) =>
          item.id === interviewId ? { ...item, room: room.trim() } : item,
        ),
      }));

      // Reload data from backend to ensure consistency
      try {
        await load();
      } catch (reloadErr) {
        console.warn("Data reload warning after room update:", reloadErr);
      }
    } catch (err: any) {
      console.error("Room update error:", err);
      alert("Failed to reassign room: " + (err.message || "Unknown error"));
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      await apiDelete(`/admin/students/${studentId}`);
      await load();
    } catch (err: any) {
      alert("Failed to delete student: " + (err.message || "Unknown error"));
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await apiDelete(`/admin/rooms/${roomId}`);
      await load();
    } catch (err: any) {
      alert("Failed to delete room: " + (err.message || "Unknown error"));
    }
  };

  const deletePanel = async (panelId: string) => {
    try {
      await apiDelete(`/admin/panels/${panelId}`);
      await load();
    } catch (err: any) {
      alert("Failed to delete panel: " + (err.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium">
        Loading admin registry and room assignments...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UsersRound className="w-7 h-7 text-indigo-500" />
          Admin Registry & Room Control
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Create, update, and remove student profiles, interview rooms, and
          panel assignments in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-8">
          <form
            onSubmit={handleStudentSubmit}
            className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserRound className="w-5 h-5 text-indigo-500" />
                {editingStudentId ? "Edit Student" : "Add Student"}
              </h2>
              {editingStudentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudentId(null);
                    setStudentForm(emptyStudent);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4 text-sm">
              <input
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
                placeholder="Student name"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <input
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
                placeholder="student@college.edu"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <input
                value={studentForm.branch}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, branch: e.target.value })
                }
                placeholder="Branch"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={studentForm.cgpa}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      cgpa: Number(e.target.value),
                    })
                  }
                  placeholder="CGPA"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={studentForm.backlogs}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      backlogs: Number(e.target.value),
                    })
                  }
                  placeholder="Backlogs"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <input
                value={studentForm.skills}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, skills: e.target.value })
                }
                placeholder="Skills (comma separated)"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={studentForm.shortlist_status}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      shortlist_status: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approve">Approved</option>
                  <option value="reject">Rejected</option>
                </select>
                <input
                  type="number"
                  value={studentForm.readiness_score}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      readiness_score: Number(e.target.value),
                    })
                  }
                  placeholder="Readiness"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {saving
                  ? "Saving..."
                  : editingStudentId
                    ? "Update Student"
                    : "Create Student"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleRoomSubmit}
            className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                {editingRoomId ? "Edit Room" : "Add Room"}
              </h2>
              {editingRoomId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoomId(null);
                    setRoomForm(emptyRoom);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="space-y-4 text-sm">
              <input
                value={roomForm.room_number}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, room_number: e.target.value })
                }
                placeholder="Room number"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <input
                value={roomForm.building}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, building: e.target.value })
                }
                placeholder="Building"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      capacity: Number(e.target.value),
                    })
                  }
                  placeholder="Capacity"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                />
                <select
                  value={roomForm.status}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {saving
                  ? "Saving..."
                  : editingRoomId
                    ? "Update Room"
                    : "Create Room"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <form
            onSubmit={handlePanelSubmit}
            className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-500" />
                {editingPanelId ? "Edit Panel" : "Add Panel"}
              </h2>
              {editingPanelId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPanelId(null);
                    setPanelForm(emptyPanel);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="space-y-4 text-sm">
              <input
                value={panelForm.panel_id}
                onChange={(e) =>
                  setPanelForm({ ...panelForm, panel_id: e.target.value })
                }
                placeholder="Panel name"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <input
                value={panelForm.expertise}
                onChange={(e) =>
                  setPanelForm({ ...panelForm, expertise: e.target.value })
                }
                placeholder="Expertise"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <input
                value={panelForm.members}
                onChange={(e) =>
                  setPanelForm({ ...panelForm, members: e.target.value })
                }
                placeholder="Members (comma separated)"
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              />
              <select
                value={panelForm.status}
                onChange={(e) =>
                  setPanelForm({ ...panelForm, status: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] px-3 py-2.5 text-slate-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Offline">Offline</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {saving
                  ? "Saving..."
                  : editingPanelId
                    ? "Update Panel"
                    : "Create Panel"}
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <CalendarRange className="w-5 h-5 text-amber-500" />
              Interview Room Reassignment
            </div>
            <div className="space-y-3">
              {data.interviews.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No interview assignments yet.
                </p>
              ) : (
                data.interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {interview.student}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {interview.company} • {interview.start_time} -{" "}
                          {interview.end_time}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                        {interview.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={interview.room || ""}
                        onChange={(e) =>
                          handleReassignRoom(interview.id, e.target.value)
                        }
                        className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#05050A] px-3 py-2 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="">Select a room...</option>
                        {data.rooms.map((room) => (
                          <option
                            key={room.room_id ?? room.room_number}
                            value={room.room_number}
                          >
                            {room.room_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <DoorClosed className="w-5 h-5 text-emerald-500" />
            Rooms
          </div>
          <div className="space-y-3">
            {data.rooms.map((room) => (
              <div
                key={room.room_id ?? room.room_number}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {room.room_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      {room.building} • Capacity {room.capacity}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    {room.status}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoomId(room.room_id ?? room.room_number);
                      setRoomForm({
                        room_number: room.room_number,
                        building: room.building,
                        capacity: room.capacity,
                        status: room.status,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRoom(room.room_id ?? room.room_number)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Award className="w-5 h-5 text-violet-500" />
            Panels
          </div>
          <div className="space-y-3">
            {data.panels.map((panel) => (
              <div
                key={panel.panel_id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {panel.panel_id}
                    </p>
                    <p className="text-xs text-slate-500">{panel.expertise}</p>
                  </div>
                  <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700">
                    {panel.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {Array.isArray(panel.members)
                    ? panel.members.join(", ")
                    : panel.members}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPanelId(panel.panel_id);
                      setPanelForm({
                        panel_id: panel.panel_id,
                        expertise: panel.expertise,
                        members: Array.isArray(panel.members)
                          ? panel.members.join(", ")
                          : panel.members,
                        status: panel.status,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePanel(panel.panel_id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <UsersRound className="w-5 h-5 text-indigo-500" />
            Students
          </div>
          <div className="space-y-3">
            {data.students.map((student) => (
              <div
                key={student.student_id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                    {student.shortlist_status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  CGPA {student.cgpa} • {student.branch}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudentId(student.student_id);
                      setStudentForm({
                        student_id: student.student_id,
                        name: student.name,
                        email: student.email,
                        branch: student.branch,
                        cgpa: student.cgpa,
                        backlogs: student.backlogs,
                        skills: student.skills.join(", "),
                        shortlist_status: student.shortlist_status,
                        readiness_score: student.readiness_score,
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStudent(student.student_id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
