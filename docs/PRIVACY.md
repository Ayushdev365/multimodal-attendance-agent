# Privacy, Ethics, and Data Governance

The **Multimodal Attendance & Engagement Agent** is designed under strict ethical, pedagogical, and privacy standards to protect student rights and prevent academic surveillance harms.

## 1. Epistemological Limitations

- **Attention & Cognition**: The application calculates observable acoustic energy, detected participant counts, and optical movement. **It does not claim that these measurements directly establish student attention, cognitive comprehension, motivation, or learning capacity.**
- **No Automated Penalties**: The software strictly prohibits automated student ranking, grade deductions, or punitive measures derived from behavioral indices.

## 2. Zero Biometric Storage

- The system does not compute or store permanent facial biometric feature vectors or embeddings.
- Face detection is used solely to establish temporal bounding box continuity across frames.
- Participants are identified via student codes (`PAR-101`) or manual instructor verification rather than automated biometric facial matches.

## 3. Ephemeral Media Processing

- **No Video Archiving**: Camera video frames are processed in volatile system memory and immediately discarded.
- **No Voice Recording**: Audio input is converted to non-reversible acoustic energy metrics (speech/silence ratios); raw voice waveforms are not written to persistent storage.

## 4. Compliance & Auditability

- **FERPA & GDPR**: Public CSV reports support pseudonymization (`Participant-104`).
- **Audit Logging**: Every manual attendance override, threshold adjustment, and verification is logged with timestamp and instructor attribution.
