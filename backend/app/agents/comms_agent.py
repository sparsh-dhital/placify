"""Notification drafting for approved placement operations."""

from datetime import datetime, timezone
from typing import Any, Iterable


def draft_notifications(schedule: Iterable[dict[str, Any]], company: str = "the company", role: str = "your interview") -> dict[str, Any]:
	notifications = []
	for item in schedule:
		student = item.get("student", "Student")
		notifications.append({"recipient": student, "channel": "email", "subject": f"Interview schedule: {company}", "message": f"Hi {student}, your interview for {role} at {company} is scheduled for {item.get('start_time', '')}-{item.get('end_time', '')} in {item.get('room', 'the assigned room')} with {item.get('panel', 'the interview panel')}. Please arrive 10 minutes early.", "status": "draft", "created_at": datetime.now(timezone.utc).isoformat()})
	return {"success": True, "agent": "Communication Agent", "notifications": notifications, "total": len(notifications)}


class CommunicationAgent:
	def draft(self, schedule: Iterable[dict[str, Any]], **kwargs: Any) -> dict[str, Any]:
		return draft_notifications(schedule, **kwargs)
