"""Learning engine: records corrections and converts repeated patterns into
reviewable playbook updates. It never silently changes policy."""
from dataclasses import dataclass, field
from collections import Counter
from typing import Any

@dataclass
class LearningEvent:
    task_id: str
    event_type: str
    detail: str
    agent: str | None = None

@dataclass
class LearningEngine:
    events: list[LearningEvent] = field(default_factory=list)
    counters: Counter = field(default_factory=Counter)

    def record(self, task_id: str, event_type: str, detail: str, agent: str | None = None):
        event = LearningEvent(task_id, event_type, detail, agent)
        self.events.append(event)
        self.counters[event_type] += 1
        return event

    def detect_recurrence(self, threshold: int = 3):
        return {k: v for k, v in self.counters.items() if v >= threshold}

    def propose_playbook_change(self, pattern: str, evidence: list[dict[str, Any]]):
        return {
            "pattern": pattern,
            "evidence": evidence,
            "status": "PROPOSED",
            "human_review_required": True,
        }
