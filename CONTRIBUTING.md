# Contributing Guidelines

Thank you for contributing to the **Multimodal Attendance & Engagement Agent**!

## Code of Conduct

All contributors must respect academic privacy standards (FERPA / GDPR) and uphold honest, evidence-based pedagogical guidelines. We do not accept features designed for punitive or intrusive student surveillance.

## Development Workflow

1. Fork the repository and create your feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Backend Development:
   - Ensure you are working in a Python 3.11 virtual environment.
   - Run linter: `ruff check backend/app backend/tests`
   - Run tests: `pytest backend/tests`

3. Frontend Development:
   - Run typecheck: `npm run lint`
   - Test production build: `npm run build`

4. Commit Hygiene:
   - Write clear, imperative commit messages (`feat: add head-orientation estimator`).
   - Confirm that no `.env`, local database files, or media recordings are staged:
     ```bash
     git status
     git diff --cached --check
     ```

5. Submitting Pull Requests:
   - Open a PR against `main`.
   - Ensure all CI tests pass.
