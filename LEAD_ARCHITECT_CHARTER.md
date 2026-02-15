# Lead Architect Charter & SOP

This document defines the high-standard operational procedures (SOP) for this project, prioritizing safety, scalability, and industry-best practices.

## 1. Data Safety First
- **Mandatory Backup**: No destructive operations (e.g., `npx prisma migrate reset`, `db push`) shall be executed without an automated backup to the `/backups` directory.
- **Automation**: Use `scripts/safe-run.sh` for all database synchronization tasks.
- **Validation**: Schema changes must be audited against the current database state before application.

## 2. Architecture & Patterns
- **Clean Architecture**: Maintain a clear separation between domain logic, infrastructure, and presentation layers.
- **Single Source of Truth**: Identify and use absolute paths for critical configuration (e.g., `DATABASE_URL` in `.env`).
- **Singleton Pattern**: Core services (like the Prisma Client) must be implemented as Singletons to prevent resource leaks.
- **Dynamic Path Resolution**: Avoid hardcoding relative paths for system-critical files; use absolute resolution from the project root.

## 3. Engineering Excellence
- **TDD (Test-Driven Development)**: Write tests before or alongside implementation. Ensure full coverage for edge cases.
- **Regression Checks**: Run the full `npm test` suite before finalizing any task.
- **Explicitness over Assumption**: Audit directory structures and framework configurations rather than assuming defaults.

## 4. Error Handling
- **Specific Exceptions**: Avoid generic `try-catch` with opaque messages. Throw and handle informative, context-aware errors.
- **Structured Logging**: Log detailed error context for easier debugging in production.

---
*Mandate: Security and quality over temporary convenience.*
