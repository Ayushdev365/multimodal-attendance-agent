from app.recommendations.rules import RecommendationEngine

def test_recommendation_engine_rules():
    # Scenario 1: High monologue + low movement
    metrics = [
        {"minute_offset": 5, "visible_participants_count": 10, "voice_activity_ratio": 0.6, "movement_index": 0.4, "instructor_speaking_ratio": 0.75},
        {"minute_offset": 10, "visible_participants_count": 10, "voice_activity_ratio": 0.5, "movement_index": 0.22, "instructor_speaking_ratio": 0.88},
    ]
    recs = RecommendationEngine.evaluate("test-ses", metrics)
    assert len(recs) >= 1
    rec = recs[0]
    assert "Sustained Lecture Monologue" in rec["title"]
    assert rec["priority"] == "high"
    assert rec["confidence_score"] >= 0.85
    assert "limitations" in rec
    assert "suggested_action" in rec

def test_recommendation_collaborative_discussion():
    metrics = [
        {"minute_offset": 15, "visible_participants_count": 8, "voice_activity_ratio": 0.4, "movement_index": 0.3, "instructor_speaking_ratio": 0.8},
        {"minute_offset": 20, "visible_participants_count": 8, "voice_activity_ratio": 0.72, "movement_index": 0.45, "instructor_speaking_ratio": 0.45},
    ]
    recs = RecommendationEngine.evaluate("test-ses", metrics)
    assert any("Discussion Window Active" in r["title"] for r in recs)
