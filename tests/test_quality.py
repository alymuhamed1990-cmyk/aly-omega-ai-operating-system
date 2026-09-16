from omega.orchestrator import ACP
from omega.quality import FinalGatekeeper, RedTeam


def test_red_team_blocks_unsupported_high_confidence():
    acp = ACP(task="test", confidence=0.95)
    review = RedTeam().review(type("T", (), {"priority":"NORMAL"})(), acp)
    assert review.validation_status == "FAILED"


def test_final_gatekeeper_rejects_blocked_task():
    task = type("T", (), {"state":"BLOCKED", "history":[]})()
    assert FinalGatekeeper().approve(task) is False
