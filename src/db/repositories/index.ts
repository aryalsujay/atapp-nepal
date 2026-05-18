/**
 * Repository barrel — single import point for all repos.
 *
 * Each repo exposes a small typed API around one table. Repos take the `DB`
 * connection by argument so they can be unit-tested against the in-memory
 * shim without booting native SQLite.
 *
 * Convention:
 *   - `listX()`        — returns all rows (sorted in a domain-sensible order)
 *   - `findX(id)`      — returns one row or null
 *   - `upsertX(row)`   — INSERT … ON CONFLICT DO UPDATE; idempotent
 *   - `upsertManyX()`  — same, batched in a transaction
 *   - `updateX(...)`   — partial update of a single row
 *   - `deleteX(id)`    — by primary key
 *
 * JSON columns are parsed/stringified at the repo boundary so callers always
 * deal in proper objects/arrays. `created_at`/`updated_at` are managed by
 * the repo (callers never pass them).
 */

export * as adminsRepo from './admins';
export * as teachersRepo from './teachers';
export * as centresRepo from './centres';
export * as hallsRepo from './halls';
export * as coursesRepo from './courses';
export * as serviceAreasRepo from './service_areas';
export * as applicationsRepo from './applications';
export * as serverCoursesRepo from './server_courses';
export * as serverApplicationsRepo from './server_applications';
export * as notificationsRepo from './notifications';
export * as settingsRepo from './settings';
export * as translationsRepo from './translations';
