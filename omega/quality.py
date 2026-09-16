"""Quality controls for research, analysis, recommendations, writing, operations,
commercial work, suppliers, data and decisions."""
from dataclasses import dataclass
from typing import Any

@dataclass
class ReviewResult:
    passed: bool
    reasons: list[str]
    severity: str = "LOW"

class RedTeam:
    def required(self, task: Any, acp: Any) -> bool:
        return bool(acp.risks) or acp.confidence < 0.80 or getattr(task, "priority", "NORMAL") == "CRITICAL"

    def review(self, task: Any, acp: Any):
        acp.findings.append("Red Team review completed")
        if not acp.evidence and acp.confidence >= 0.80:
            acp.confidence = 0.50
            acp.risks.append("High confidence without explicit evidence")
            acp.validation_status = "FAILED"
        return acp

class FinalGatekeeper:
    def approve(self, task: Any) -> bool:
        if getattr(task, "state", None) == "BLOCKED":
            return False
        if not getattr(task, "history", None):
            return False
        return all(item.validation_status == "PASSED" for item in task.history)
