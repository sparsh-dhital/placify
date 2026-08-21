from datetime import date, datetime, time, timedelta, timezone
from typing import Any


def build_schedule(
	student_ids: list[str],
	existing: list[dict[str, Any]],
	schedule_date: date | None = None,
	rooms: tuple[str, ...] = ("Room 101", "Room 102", "Room 103"),
) -> dict[str, Any]:
	"""Allocate non-overlapping interview slots and report existing conflicts."""
	target_date = schedule_date or (datetime.now(timezone.utc).date() + timedelta(days=1))
	slot_length = timedelta(minutes=30)
	first_slot = datetime.combine(target_date, time(9), tzinfo=timezone.utc)
	occupied: dict[str, list[tuple[datetime, datetime]]] = {room: [] for room in rooms}
	existing_students = set()
	conflicts: list[dict[str, str]] = []

	for item in existing:
		existing_students.add(str(item.get("student_id")))
		start = _parse_datetime(item.get("start_time"))
		end = _parse_datetime(item.get("end_time"))
		room = item.get("room")
		if start and end and room in occupied:
			if any(start < busy_end and end > busy_start for busy_start, busy_end in occupied[room]):
				conflicts.append({"type": "Room overlap", "description": f"{room} is already double-booked.", "impact": "Existing interviews may overlap.", "recommendation": "Move one interview to another room."})
			occupied[room].append((start, end))

	items: list[dict[str, Any]] = []
	for student_id in student_ids:
		if student_id in existing_students:
			continue
		assigned = None
		for offset in range(max(1, len(student_ids) * 2)):
			start = first_slot + timedelta(minutes=30 * offset)
			end = start + slot_length
			for room in rooms:
				if not any(start < busy_end and end > busy_start for busy_start, busy_end in occupied[room]):
					assigned = (room, start, end)
					break
			if assigned:
				break
		if not assigned:
			conflicts.append({"type": "Capacity", "description": f"No free interview slot is available for {student_id}.", "impact": "This candidate was not scheduled.", "recommendation": "Add rooms or extend the interview window."})
			continue
		room, start, end = assigned
		occupied[room].append((start, end))
		items.append({"student_id": student_id, "room": room, "start_time": start.isoformat().replace("+00:00", "Z"), "end_time": end.isoformat().replace("+00:00", "Z"), "status": "proposed"})

	return {"schedule": items, "conflict_detected": bool(conflicts), "conflict_details": conflicts[0] if conflicts else None}


def _parse_datetime(value: Any) -> datetime | None:
	if not value:
		return None
	try:
		parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
		return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
	except ValueError:
		return None
