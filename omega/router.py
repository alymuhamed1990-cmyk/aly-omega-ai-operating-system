"""Deterministic routing reference. Production adapters can replace the keyword
classifier while preserving the same interface."""

ROUTES = {
    "research": "intelligence",
    "analysis": "intelligence",
    "supplier": "commercial",
    "b2b": "commercial",
    "quotation": "commercial",
    "booking": "operations",
    "customer": "operations",
    "incident": "operations",
    "decision": "executive",
    "report": "executive",
    "learning": "learning",
    "qa": "quality",
}

class Router:
    def classify(self, task):
        text = task.request.lower()
        for keyword, domain in ROUTES.items():
            if keyword in text:
                return domain
        return "core"

    def select(self, stage, task):
        # Adapter point: map stage + classification to a concrete agent implementation.
        return NullAgent(stage)

class NullAgent:
    def __init__(self, stage): self.stage = stage
    def execute(self, task):
        from .orchestrator import ACP
        return ACP(task=f"{self.stage} for {task.task_id}", confidence=0.0, validation_status="PENDING")
