from datetime import datetime, timedelta
from typing import Any

from app.agents.schedule_agent import (
    _candidate_slots,
    _is_available,
    _overlaps,
    _parse_datetime,
    _resource_is_free,
)


def _format_datetime(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")


def _load_context(supabase):
    interviews = supabase.table("interviews").select(
        "id,student_id,panel_id,room_id,job_id,start_time,end_time,round_name,status"
    ).execute().data or []
    students = supabase.table("students").select("id,name").execute().data or []
    rooms = supabase.table("rooms").select("id,name,status").execute().data or []
    room_availability = supabase.table("room_availability").select(
        "room_id,start_time,end_time,status"
    ).execute().data or []
    panel_availability = supabase.table("panel_availability").select(
        "panel_id,start_time,end_time,status"
    ).execute().data or []
    return interviews, students, rooms, room_availability, panel_availability


def _busy_intervals(interviews: list[dict], key: str, excluded_id: str | None = None):
    busy: dict[str, list[tuple[datetime, datetime]]] = {}
    for interview in interviews:
        if excluded_id and str(interview.get("id")) == excluded_id:
            continue
        resource_id = interview.get(key)
        if resource_id and interview.get("start_time") and interview.get("end_time"):
            busy.setdefault(str(resource_id), []).append((
                _parse_datetime(interview["start_time"]),
                _parse_datetime(interview["end_time"]),
            ))
    return busy


def _availability_slots(rows: list[dict], resource_id: str, duration: timedelta):
    return _candidate_slots([
        row for row in rows if str(row.get("room_id", row.get("panel_id"))) == resource_id
    ], duration)


def _valid_assignment(
    interview: dict,
    room_id: str,
    start: datetime,
    end: datetime,
    rooms: dict[str, dict],
    room_availability: list[dict],
    panel_availability: list[dict],
    interviews: list[dict],
) -> bool:
    if room_id not in rooms or not _is_available(rooms[room_id]):
        return False
    if (start, end) not in _availability_slots(room_availability, room_id, end - start):
        return False
    panel_id = str(interview["panel_id"])
    if (start, end) not in _availability_slots(panel_availability, panel_id, end - start):
        return False
    for key, resource_id in (("student_id", interview["student_id"]), ("panel_id", panel_id), ("room_id", room_id)):
        busy = _busy_intervals(interviews, key, str(interview["id"]))
        if not _resource_is_free(str(resource_id), start, end, busy):
            return False
    return True


def simulate_room_delay(supabase, room_id: str, delay_minutes: int) -> dict:
    interviews, students, room_rows, room_availability, panel_availability = _load_context(supabase)
    rooms = {str(room["id"]): room for room in room_rows}
    student_by_id = {str(student["id"]): student for student in students}
    affected = [
        interview for interview in interviews
        if str(interview.get("room_id")) == room_id
        and str(interview.get("status", "scheduled")).lower() in {"scheduled", "confirmed", "approved"}
    ]
    affected.sort(key=lambda item: (_parse_datetime(item["start_time"]), str(item["id"])))
    alternative_rooms = sorted(
        room_id_value for room_id_value in rooms
        if room_id_value != room_id and _is_available(rooms[room_id_value])
    )
    proposed_changes = []
    conflicts = []
    original_room_name = rooms.get(room_id, {}).get("name", "Unknown")

    for interview in affected:
        interview_id = str(interview["id"])
        old_start = _parse_datetime(interview["start_time"])
        old_end = _parse_datetime(interview["end_time"])
        replacement = None
        for alternative_room_id in alternative_rooms:
            if _valid_assignment(
                interview, alternative_room_id, old_start, old_end,
                rooms, room_availability, panel_availability, interviews,
            ):
                replacement = (alternative_room_id, old_start, old_end)
                break
        if replacement is None:
            shifted_start = old_start + timedelta(minutes=delay_minutes)
            shifted_end = old_end + timedelta(minutes=delay_minutes)
            if _valid_assignment(
                interview, room_id, shifted_start, shifted_end,
                rooms, room_availability, panel_availability, interviews,
            ):
                replacement = (room_id, shifted_start, shifted_end)
        if replacement is None:
            conflicts.append({
                "interview_id": interview_id,
                "reason": "No alternative room or conflict-free delayed time is available",
            })
            continue
        new_room_id, new_start, new_end = replacement
        proposed_changes.append({
            "interview_id": interview_id,
            "student_id": str(interview["student_id"]),
            "student_name": student_by_id.get(str(interview["student_id"]), {}).get("name", "Unknown"),
            "old_room_id": room_id,
            "old_room": original_room_name,
            "new_room_id": new_room_id,
            "new_room": rooms[new_room_id].get("name", "Unknown"),
            "old_start": _format_datetime(old_start),
            "old_end": _format_datetime(old_end),
            "new_start": _format_datetime(new_start),
            "new_end": _format_datetime(new_end),
            "reason": f"{original_room_name} delayed by {delay_minutes} minutes",
        })

    result = {
        "success": True,
        "agent": "Exception Recovery Agent",
        "event": {"type": "room_delay", "room_id": room_id, "delay_minutes": delay_minutes},
        "affected_interviews": [
            {
                "interview_id": str(item["id"]),
                "student_id": str(item["student_id"]),
                "student_name": student_by_id.get(str(item["student_id"]), {}).get("name", "Unknown"),
                "original_room": original_room_name,
                "original_start": item["start_time"],
                "original_end": item["end_time"],
            }
            for item in affected
        ],
        "proposed_changes": proposed_changes,
        "conflicts": conflicts,
        "requires_approval": True,
    }
    supabase.table("agent_logs").insert({
        "agent_name": "Exception Recovery Agent",
        "action": "simulate_room_delay",
        "tool_name": "deterministic_exception_recovery",
        "input_data": {"room_id": room_id, "delay_minutes": delay_minutes},
        "output_data": result,
        "status": "proposal_created",
        "confidence": 1.0,
        "human_approval_required": True,
    }).execute()
    return result


def approve_recovery(supabase, proposed_changes: list[dict]) -> dict:
    interviews, _, room_rows, room_availability, panel_availability = _load_context(supabase)
    rooms = {str(room["id"]): room for room in room_rows}
    by_id = {str(interview["id"]): interview for interview in interviews}
    conflicts = []
    validated = []
    for change in proposed_changes:
        interview = by_id.get(str(change.get("interview_id")))
        if not interview:
            conflicts.append({"interview_id": change.get("interview_id"), "reason": "Interview not found"})
            continue
        if (
            str(interview.get("room_id")) != str(change.get("old_room_id"))
            or _parse_datetime(interview["start_time"]) != _parse_datetime(change["old_start"])
        ):
            conflicts.append({"interview_id": change["interview_id"], "reason": "Interview changed since proposal was created"})
            continue
        start = _parse_datetime(change["new_start"])
        end = _parse_datetime(change["new_end"])
        if not _valid_assignment(interview, str(change["new_room_id"]), start, end, rooms, room_availability, panel_availability, interviews):
            conflicts.append({"interview_id": change["interview_id"], "reason": "Proposed assignment is no longer valid"})
            continue
        validated.append((interview, change))

    if conflicts:
        return {"success": False, "message": "Recovery approval blocked by conflicts", "conflicts": conflicts, "updated_count": 0}
    for interview, change in validated:
        supabase.table("interviews").update({
            "room_id": change["new_room_id"],
            "start_time": change["new_start"],
            "end_time": change["new_end"],
        }).eq("id", str(interview["id"])).execute()
    if validated:
        supabase.table("approvals").insert({
            "action_type": "schedule_recovery",
            "reference_id": str(validated[0][0]["id"]),
            "status": "approved",
            "reason": "Room delay recovery approved",
        }).execute()
    return {"success": True, "message": "Recovery schedule approved", "updated_count": len(validated), "conflicts": []}