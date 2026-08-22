"""Deterministic interview scheduling and conflict detection."""

from datetime import datetime, timedelta
from typing import Any, Iterable
from uuid import uuid4


def _time(value: str) -> datetime:
	return datetime.strptime(value, "%H:%M")


def generate_schedule(shortlisted: Iterable[dict[str, Any]], panels: Iterable[dict[str, Any]], rooms: Iterable[dict[str, Any]], duration_minutes: int = 30, start_time: str = "09:00", end_time: str = "17:00") -> dict[str, Any]:
	if duration_minutes <= 0:
		raise ValueError("duration_minutes must be positive")
	panel_list, room_list = list(panels), list(rooms)
	if not panel_list or not room_list:
		raise ValueError("At least one panel and room are required")
	cursor, limit = _time(start_time), _time(end_time)
	schedule, conflicts = [], []
	panel_busy: dict[str, list[tuple[datetime, datetime]]] = {}
	room_busy: dict[str, list[tuple[datetime, datetime]]] = {}
	for student in shortlisted:
		placed = False
		while cursor + timedelta(minutes=duration_minutes) <= limit:
			finish = cursor + timedelta(minutes=duration_minutes)
			def available(item: dict[str, Any], busy: dict[str, list[tuple[datetime, datetime]]]) -> bool:
				key = str(item.get("id", item.get("name", "")))
				return not any(cursor < end and finish > begin for begin, end in busy.get(key, []))
			panel, room = next((item for item in panel_list if available(item, panel_busy)), None), next((item for item in room_list if available(item, room_busy)), None)
			if panel and room:
				panel_id, room_id = str(panel.get("id", panel.get("name"))), str(room.get("id", room.get("name")))
				panel_busy.setdefault(panel_id, []).append((cursor, finish)); room_busy.setdefault(room_id, []).append((cursor, finish))
				schedule.append({"id": str(uuid4()), "student": student.get("student_name", student.get("name", "Unknown student")), "panel": panel.get("name", panel_id), "room": room.get("name", room_id), "start_time": cursor.strftime("%H:%M"), "end_time": finish.strftime("%H:%M"), "status": "proposed"})
				placed = True; break
			cursor += timedelta(minutes=duration_minutes)
		if not placed:
			conflicts.append(f"No available panel and room slot for {student.get('student_name', student.get('name', 'student'))}.")
	return {"success": True, "agent": "Scheduler Agent", "schedule": schedule, "conflict_detected": bool(conflicts), "conflict_details": {"type": "Capacity or availability", "description": conflicts[0], "impact": f"{len(conflicts)} interview(s) remain unscheduled.", "recommendation": "Add availability, panels, or rooms and regenerate."} if conflicts else None}


class SchedulerAgent:
	def generate(self, shortlisted: Iterable[dict[str, Any]], panels: Iterable[dict[str, Any]], rooms: Iterable[dict[str, Any]], **kwargs: Any) -> dict[str, Any]:
		return generate_schedule(shortlisted, panels, rooms, **kwargs)
