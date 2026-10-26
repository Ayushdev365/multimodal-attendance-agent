import numpy as np
from typing import Dict, Any

class AudioActivityProcessor:
    """
    Local Voice Activity Detection (VAD) processor.
    Calculates root-mean-square (RMS) energy, speech-to-silence ratio,
    and windowed activity metrics from local PCM audio samples.
    """
    def __init__(self, energy_threshold: float = 0.015, sample_rate: int = 16000):
        self.energy_threshold = energy_threshold
        self.sample_rate = sample_rate

    def process_pcm_chunk(self, pcm_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes a raw 16-bit mono PCM audio chunk.
        Returns speech activity ratio and energy.
        """
        if not pcm_bytes or len(pcm_bytes) == 0:
            return {"voice_activity_ratio": 0.0, "is_speech": False, "rms_energy": 0.0}

        try:
            samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            rms = np.sqrt(np.mean(samples**2))
            is_speech = bool(rms > self.energy_threshold)

            # Sub-frame speech ratio
            frame_size = int(self.sample_rate * 0.03) # 30ms frames
            if len(samples) > frame_size:
                num_frames = len(samples) // frame_size
                speech_frames = 0
                for i in range(num_frames):
                    frame = samples[i * frame_size : (i + 1) * frame_size]
                    if np.sqrt(np.mean(frame**2)) > self.energy_threshold:
                        speech_frames += 1
                ratio = float(speech_frames / num_frames)
            else:
                ratio = 1.0 if is_speech else 0.0

            return {
                "voice_activity_ratio": round(ratio, 3),
                "is_speech": is_speech,
                "rms_energy": round(float(rms), 4),
            }
        except Exception:
            return {"voice_activity_ratio": 0.0, "is_speech": False, "rms_energy": 0.0}
