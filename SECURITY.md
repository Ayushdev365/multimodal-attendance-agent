# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Multimodal Attendance & Engagement Agent processes classroom video and audio exclusively within local memory under strict privacy constraints.

If you discover a security vulnerability or privacy leak:

1. **Do NOT open a public GitHub issue.**
2. Email details to: `security@multimodal-agent.org` (or contact the maintainers through the repository security advisory page).
3. Include:
   - Detailed description of the potential exploit or vulnerability.
   - Steps to reproduce or proof-of-concept.
   - Impact assessment on student privacy or system isolation.
4. We aim to acknowledge reports within 48 hours and provide a fix or mitigation plan within 7 business days.

## Privacy & Biometrics Guardrails

- This project deliberately **prohibits automated facial biometric database synchronization**.
- Any Pull Request attempting to add external cloud upload of unconsented student faces or audio streams will be rejected.
