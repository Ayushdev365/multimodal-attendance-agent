import math
import time
from typing import Dict, List, Any

class PersonTracker:
    """
    Sustained Presence Centroid Tracker.
    Tracks detected bounding boxes across video frames, tracks first-seen,
    last-seen, and calculates continuous observed presence duration.
    """
    def __init__(self, max_disappeared_frames: int = 30, distance_threshold: float = 65.0):
        self.next_object_id = 1
        self.objects: Dict[int, Dict[str, Any]] = {}
        self.disappeared: Dict[int, int] = {}
        self.max_disappeared = max_disappeared_frames
        self.distance_threshold = distance_threshold

    def register(self, centroid: tuple, box: dict):
        obj_id = self.next_object_id
        self.next_object_id += 1
        now = time.time()
        self.objects[obj_id] = {
            "tracking_id": f"TRK-{obj_id:02d}",
            "centroid": centroid,
            "box": box,
            "first_seen": now,
            "last_seen": now,
            "sustained_seconds": 1,
        }
        self.disappeared[obj_id] = 0
        return self.objects[obj_id]

    def deregister(self, object_id: int):
        if object_id in self.objects:
            del self.objects[object_id]
        if object_id in self.disappeared:
            del self.disappeared[object_id]

    def update(self, rects: List[dict]) -> List[Dict[str, Any]]:
        """
        Takes current frame detections: [{"x", "y", "w", "h"}]
        Returns active tracked objects with sustained duration.
        """
        now = time.time()
        if len(rects) == 0:
            for obj_id in list(self.disappeared.keys()):
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)
            return list(self.objects.values())

        input_centroids = []
        for r in rects:
            cx = int(r["x"] + r["w"] / 2.0)
            cy = int(r["y"] + r["h"] / 2.0)
            input_centroids.append((cx, cy))

        if len(self.objects) == 0:
            for i, c in enumerate(input_centroids):
                self.register(c, rects[i])
        else:
            object_ids = list(self.objects.keys())
            matched_input = set()

            for obj_id in object_ids:
                prev_c = self.objects[obj_id]["centroid"]
                min_dist = float("inf")
                min_idx = -1

                for idx, c in enumerate(input_centroids):
                    if idx in matched_input:
                        continue
                    dist = math.hypot(prev_c[0] - c[0], prev_c[1] - c[1])
                    if dist < min_dist:
                        min_dist = dist
                        min_idx = idx

                if min_dist < self.distance_threshold and min_idx != -1:
                    matched_input.add(min_idx)
                    self.disappeared[obj_id] = 0
                    self.objects[obj_id]["centroid"] = input_centroids[min_idx]
                    self.objects[obj_id]["box"] = rects[min_idx]
                    self.objects[obj_id]["last_seen"] = now
                    self.objects[obj_id]["sustained_seconds"] = int(now - self.objects[obj_id]["first_seen"])
                else:
                    self.disappeared[obj_id] += 1
                    if self.disappeared[obj_id] > self.max_disappeared:
                        self.deregister(obj_id)

            for idx, c in enumerate(input_centroids):
                if idx not in matched_input:
                    self.register(c, rects[idx])

        return list(self.objects.values())
