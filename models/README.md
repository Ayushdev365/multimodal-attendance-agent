# Models Directory & Local Weights Guide

This directory holds offline computer vision and audio model weights for the **Multimodal Attendance & Engagement Agent**.

## 1. Computer Vision Models

### A. OpenCV Haar Cascades (Face & Profile Detection)
- **Path**: Bundled automatically by `opencv-python-headless` or stored in `./models/haarcascade_frontalface_default.xml`.
- **License**: 3-Clause BSD License / Intel Corporation.
- **Offline Setup**:
  To ensure hermetic offline execution without internet access:
  ```bash
  python -c "import cv2, shutil; shutil.copy(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml', './models/')"
  ```

### B. MediaPipe BlazeFace / Face Mesh (Optional High-Accuracy Landmark Detector)
- **License**: Apache 2.0.
- **Model Card**: BlazeFace sub-millisecond neural face detector.
- **Download**:
  Download `face_detection_short_range.tflite` from Google MediaPipe model zoo into `./models/face_detection_short_range.tflite`.

---

## 2. Audio Processing Models

### Acoustic Energy & Voice Activity Detection (VAD)
- **Engine**: Energy Root-Mean-Square (RMS) sub-frame acoustic segmentation.
- **Weights Required**: **None**. The VAD engine is mathematical and deterministic, computing frame energy and thresholding directly via NumPy.
- **License**: MIT.
- **Offline Readiness**: 100% operational with zero external downloads.

---

## 3. Privacy Safeguards on Model Data

1. **No Cloud Ingestion**: Video frames and audio streams are processed in local memory and immediately discarded.
2. **Zero Biometric Embeddings**: The agent does not build or persist 512-dimensional facial recognition vectors. All attendance validation is mediated by sustained presence duration ($t \ge 60\text{s}$) and instructor authorization.
