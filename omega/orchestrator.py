"""Aly Omega orchestration reference implementation.

This module deliberately keeps domain logic outside the router. Specialist agents
return ACP objects; validation is mandatory between stages.
"""
from dataclasses import dataclass, field
from typing import Any, Dict, List
from uuid import uuid4

STAGES = ["INTAKE", "CLASSIFICATION", "INTELLIGENCE", "PLANNING", "QUOTATION", "EXECUTION", "QA", "LEARNING"]

@dataclass
class ACP:
    task: str
    context: Dict[str, Any] = field(default_factory=dict)
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    findings: List[str] = field(default_factory=list)
    assumptions: List[str] = field(default_factory=list)
    risks: List[str] = field(default_factory=list)
    confidence: float = 0.0
    recommendation: str = ""
    dependencies: List[str] = field(default_factory=list)
    validation_status: str = "PENDING"

@dataclass
class Task:
    request: str
    classification: str = "UNCLASSIFIED"
    priority: str = "NORMAL"
    state: str = "INTAKE"
    task_id: str = field(default_factory=lambda: str(uuid4()))
    history: List[ACP] = field(default_factory=list)

class ValidationGate:
    def validate(self, acp: ACP) -> bool:
        if not acp.task.strip():
            acp.validation_status = "FAILED"; return False
        if acp.confidence < 0 or acp.confidence > 1:
            acp.validation_status = "FAILED"; return False
        if acp.risks is None or acp.assumptions is None:
            acp.validation_status = "FAILED"; return False
        acp.validation_status = "PASSED"
        return True

class Orchestrator:
    def __init__(self, router, gate=None, red_team=None, final_gatekeeper=None):
        self.router = router
        self.gate = gate or ValidationGate()
        self.red_team = red_team
        self.final_gatekeeper = final_gatekeeper

    def run(self, request: str, context: Dict[str, Any] | None = None) -> Task:
        task = Task(request=request)
        task.context = context or {}
        task.classification = self.router.classify(task)
        for stage in STAGES[2:]:
            agent = self.router.select(stage, task)
            acp = agent.execute(task)
            task.history.append(acp)
            if not self.gate.validate(acp):
                task.state = "BLOCKED"
                return task
            if stage == "QA" and self.red_team and self.red_team.required(task, acp):
                review = self.red_team.review(task, acp)
                if not self.gate.validate(review):
                    task.state = "BLOCKED"
                    return task
            task.state = stage
        if self.final_gatekeeper and not self.final_gatekeeper.approve(task):
            task.state = "BLOCKED"
        else:
            task.state = "COMPLETED"
        return task
