from typing import List, Dict, Any

class SessionAnalyticsEngine:
    """
    Computes statistical aggregate indicators from vision tracking
    and acoustic VAD streams across session time slices.
    """

    @staticmethod
    def calculate_visibility_trend(metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not metrics:
            return {"mean_visibility": 0, "max_visibility": 0, "coverage_ratio": 0.0}

        counts = [m.get("visible_participants_count", 0) for m in metrics]
        mean_vis = sum(counts) / len(counts)
        max_vis = max(counts) if counts else 0
        quality_scores = [m.get("data_quality_score", 1.0) for m in metrics]
        mean_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 1.0

        return {
            "mean_visibility": round(mean_vis, 1),
            "max_visibility": max_vis,
            "data_quality_mean": round(mean_quality, 2),
            "total_intervals": len(metrics),
        }

    @staticmethod
    def calculate_acoustic_summary(metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not metrics:
            return {"voice_ratio_mean": 0.0, "instructor_speech_mean": 0.0}

        voice_ratios = [m.get("voice_activity_ratio", 0.0) for m in metrics]
        instructor_ratios = [m.get("instructor_speaking_ratio", 0.0) for m in metrics]

        return {
            "voice_ratio_mean": round(sum(voice_ratios) / len(voice_ratios), 3),
            "instructor_speech_mean": round(sum(instructor_ratios) / len(instructor_ratios), 3),
        }
