import uuid
from typing import List, Dict, Any

class RecommendationEngine:
    """
    Deterministic rule-based pedagogical recommendation engine.
    Synthesizes empirical acoustic intervals and observable room presence
    into actionable teaching interventions with full evidence and limitations.
    """

    @staticmethod
    def evaluate(session_id: str, metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not metrics or len(metrics) < 2:
            return []

        recommendations = []
        latest = metrics[-1]
        minute = latest.get("minute_offset", 0)
        inst_speech = latest.get("instructor_speaking_ratio", 0.0)
        voice_ratio = latest.get("voice_activity_ratio", 0.0)
        movement = latest.get("movement_index", 0.0)
        visible = latest.get("visible_participants_count", 0)

        # Rule 1: Sustained Monologue Check
        if inst_speech >= 0.80 and movement < 0.30:
            recommendations.append({
                "id": f"rec-{uuid.uuid4().hex[:8]}",
                "session_id": session_id,
                "title": "Sustained Lecture Monologue Detected: Introduce Active Q&A",
                "explanation": f"Instructor speaking proportion remained elevated at {int(inst_speech * 100)}% while room movement dipped to {movement:.2f}.",
                "supporting_evidence": f"At minute {minute}, instructor speech ratio: {inst_speech:.2f}; movement index: {movement:.2f}; voice activity: {voice_ratio:.2f}.",
                "suggested_action": "Pause the slide deck to introduce an interactive think-pair-share problem or check-for-understanding prompt.",
                "confidence_score": 0.88,
                "limitations": "Measures acoustic speech continuity and frame movement vectors; does not parse semantic understanding or student note-taking.",
                "time_interval": f"{max(0, minute - 10)}:00 - {minute}:00",
                "priority": "high",
            })

        # Rule 2: Active Collaborative Discussion Window
        if voice_ratio > 0.60 and inst_speech < 0.60:
            recommendations.append({
                "id": f"rec-{uuid.uuid4().hex[:8]}",
                "session_id": session_id,
                "title": "Distributed Discussion Window Active",
                "explanation": f"Classroom acoustic energy reflects balanced participatory voice activity ({int(voice_ratio * 100)}%).",
                "supporting_evidence": f"Acoustic turn-taking detected; total voice ratio: {voice_ratio:.2f} with instructor speech at {inst_speech:.2f}.",
                "suggested_action": "Allow the conversation to conclude organically before synthesizing the main points on the board.",
                "confidence_score": 0.92,
                "limitations": "Acoustic VAD does not transcribe discussion content or verify linguistic topicality.",
                "time_interval": f"{max(0, minute - 5)}:00 - {minute}:00",
                "priority": "low",
            })

        # Rule 3: Abrupt Presence Drop Check
        if len(metrics) >= 3:
            prev_visible = metrics[-2].get("visible_participants_count", 0)
            if prev_visible > 0 and visible < prev_visible * 0.70:
                recommendations.append({
                    "id": f"rec-{uuid.uuid4().hex[:8]}",
                    "session_id": session_id,
                    "title": "Observable Participant Count Reduction",
                    "explanation": f"Detected participants decreased from {prev_visible} to {visible} across consecutive sample windows.",
                    "supporting_evidence": f"Observed in-frame count decreased by {int((1 - visible/prev_visible)*100)}% at minute {minute}.",
                    "suggested_action": "Verify whether participants moved out of the camera field-of-view or if a natural break occurred.",
                    "confidence_score": 0.84,
                    "limitations": "Camera field-of-view occlusion or lighting changes can reduce detected bounding boxes without actual departure.",
                    "time_interval": f"{max(0, minute - 5)}:00 - {minute}:00",
                    "priority": "medium",
                })

        return recommendations
