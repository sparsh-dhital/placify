from datetime import datetime, timedelta, timezone
from typing import Any


INTERVIEW_DURATION_MINUTES = 30
ROUND_NAME = "Technical Interview"


def _parse_datetime(value: Any) -> datetime:
	parsed = value if isinstance(value, datetime) else datetime.fromisoformat(str(value).replace("Z", "+00:00"))
	if parsed.tzinfo is None:
		return parsed.replace(tzinfo=timezone.utc)
	return parsed.astimezone(timezone.utc)


def _overlaps(start: datetime, end: datetime, busy_start: datetime, busy_end: datetime) -> bool:
	return start < busy_end and end > busy_start


def _is_available(row: dict) -> bool:
	return str(row.get("status", "available")).lower() in {"available", "active", "open"}


def _candidate_slots(availability: list[dict], duration: timedelta) -> list[tuple[datetime, datetime]]:
	slots = set()
	for window in availability:
		if not _is_available(window):
			continue
		window_start = _parse_datetime(window["start_time"])
		window_end = _parse_datetime(window["end_time"])
		slot_start = window_start
		while slot_start + duration <= window_end:
			slots.add((slot_start, slot_start + duration))
			slot_start += duration
	return sorted(slots)


def _busy_intervals(interviews: list[dict], key: str) -> dict[str, list[tuple[datetime, datetime]]]:
	busy: dict[str, list[tuple[datetime, datetime]]] = {}
	for interview in interviews:
		resource_id = interview.get(key)
		if not resource_id or not interview.get("start_time") or not interview.get("end_time"):
			continue
		busy.setdefault(str(resource_id), []).append(
			(_parse_datetime(interview["start_time"]), _parse_datetime(interview["end_time"]))
		)
	return busy


def _resource_is_free(
	resource_id: str,
	start: datetime,
	end: datetime,
	busy: dict[str, list[tuple[datetime, datetime]]],
) -> bool:
	return not any(
		_overlaps(start, end, busy_start, busy_end)
		for busy_start, busy_end in busy.get(resource_id, [])
	)


def generate_schedule(supabase, job_id: str) -> dict:
	job_response = supabase.table("jobs").select("id,role").eq("id", job_id).limit(1).execute()
	if not job_response.data:
		return {"success": False, "message": "Job not found", "job_id": job_id}

	applications = (
		supabase.table("applications")
		.select("id,student_id,job_id,status,match_score")
		.eq("job_id", job_id)
		.eq("status", "shortlisted")
		.execute()
	).data or []
	applications.sort(key=lambda item: (-float(item.get("match_score") or 0), str(item.get("student_id"))))

	students = (supabase.table("students").select("id,name").execute()).data or []
	student_by_id = {str(student["id"]): student for student in students}
	panels = (supabase.table("panels").select("id,name,status").execute()).data or []
	rooms = (supabase.table("rooms").select("id,name,status").execute()).data or []
	panel_availability = (supabase.table("panel_availability").select("panel_id,start_time,end_time,status").execute()).data or []
	room_availability = (supabase.table("room_availability").select("room_id,start_time,end_time,status").execute()).data or []
	existing_interviews = (supabase.table("interviews").select("student_id,panel_id,room_id,job_id,start_time,end_time").execute()).data or []

	duration = timedelta(minutes=INTERVIEW_DURATION_MINUTES)
	panel_by_id = {str(panel["id"]): panel for panel in panels if _is_available(panel)}
	room_by_id = {str(room["id"]): room for room in rooms if _is_available(room)}
	panel_slots = {panel_id: _candidate_slots([row for row in panel_availability if str(row.get("panel_id")) == panel_id], duration) for panel_id in panel_by_id}
	room_slots = {room_id: _candidate_slots([row for row in room_availability if str(row.get("room_id")) == room_id], duration) for room_id in room_by_id}

	busy_student = _busy_intervals(existing_interviews, "student_id")
	busy_panel = _busy_intervals(existing_interviews, "panel_id")
	busy_room = _busy_intervals(existing_interviews, "room_id")
	existing_students = {str(item.get("student_id")) for item in existing_interviews if str(item.get("job_id")) == job_id}
	schedule = []
	unscheduled = []
	conflicts = []

	for application in applications:
		student_id = str(application["student_id"])
		if student_id in existing_students:
			unscheduled.append({"student_id": student_id, "reason": "Candidate already has an interview for this job"})
			continue
		assignment = None
		for start, end in sorted({slot for slots in panel_slots.values() for slot in slots}):
			for panel_id in sorted(panel_by_id):
				if (start, end) not in panel_slots[panel_id] or not _resource_is_free(panel_id, start, end, busy_panel):
					continue
				for room_id in sorted(room_by_id):
					if (start, end) not in room_slots[room_id] or not _resource_is_free(room_id, start, end, busy_room):
						continue
					if not _resource_is_free(student_id, start, end, busy_student):
						continue
					assignment = (panel_id, room_id, start, end)
					break
				if assignment:
					break
			if assignment:
				break

		if not assignment:
			unscheduled.append({"student_id": student_id, "reason": "No panel, room, and time slot available without a conflict"})
			continue

		panel_id, room_id, start, end = assignment
		record = {
			"student_id": student_id,
			"job_id": job_id,
			"panel_id": panel_id,
			"room_id": room_id,
			"start_time": start.isoformat().replace("+00:00", "Z"),
			"end_time": end.isoformat().replace("+00:00", "Z"),
			"round_name": ROUND_NAME,
			"status": "scheduled",
		}
		insert_response = supabase.table("interviews").insert(record).execute()
		if not insert_response.data:
			conflicts.append({"student_id": student_id, "reason": "Interview could not be persisted"})
			continue
		busy_student.setdefault(student_id, []).append((start, end))
		busy_panel.setdefault(panel_id, []).append((start, end))
		busy_room.setdefault(room_id, []).append((start, end))
		schedule.append({
			"student_id": student_id,
			"student_name": student_by_id.get(student_id, {}).get("name", "Unknown"),
			"panel_id": panel_id,
			"panel_name": panel_by_id[panel_id].get("name", "Unknown"),
			"room_id": room_id,
			"room_name": room_by_id[room_id].get("name", "Unknown"),
			"start_time": record["start_time"],
			"end_time": record["end_time"],
			"round_name": ROUND_NAME,
		})

	result = {
		"success": True,
		"agent": "Scheduler Agent",
		"job_id": job_id,
		"scheduled_count": len(schedule),
		"unscheduled_count": len(unscheduled),
		"schedule": schedule,
		"conflicts": conflicts,
		"unscheduled_candidates": unscheduled,
	}
	supabase.table("agent_logs").insert({
		"agent_name": "Scheduler Agent",
		"action": "generate_schedule",
		"tool_name": "deterministic_scheduler",
		"input_data": {"job_id": job_id},
		"output_data": result,
		"status": "completed",
		"confidence": 1.0,
		"human_approval_required": True,
	}).execute()
	return result
