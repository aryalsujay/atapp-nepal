/**
 * 0001_initial — creates the canonical v1 schema documented in
 * `src/db/schema.sql`. See that file for column-level documentation.
 *
 * DO NOT MODIFY THIS FILE AFTER IT HAS BEEN SHIPPED. Add a new
 * migration (`0002_*`) for any schema change.
 */

import type { Migration } from '../migrate';

export const migration0001Initial: Migration = {
  name: '0001_initial',
  up(db) {
    db.exec(`
      CREATE TABLE admins (
        id            TEXT PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name          TEXT NOT NULL,
        center_name   TEXT,
        settings_json TEXT,
        created_at    TEXT NOT NULL,
        updated_at    TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE teachers (
        id                       TEXT PRIMARY KEY,
        role                     TEXT NOT NULL,
        name                     TEXT NOT NULL,
        gender                   TEXT,
        email                    TEXT UNIQUE,
        invite_code              TEXT UNIQUE,
        password_hash            TEXT NOT NULL,
        region                   TEXT,
        flag                     TEXT,
        authorized_since         INTEGER,
        total_courses            INTEGER NOT NULL DEFAULT 0,
        centers_served           INTEGER NOT NULL DEFAULT 0,
        courses_this_year        INTEGER NOT NULL DEFAULT 0,
        is_onboarded             INTEGER NOT NULL DEFAULT 0,
        personal_note            TEXT,
        authorizations_json      TEXT,
        languages_json           TEXT,
        preferred_regions_json   TEXT,
        available_months_json    TEXT,
        festival_months_json     TEXT,
        teaching_history_json    TEXT,
        created_at               TEXT NOT NULL,
        updated_at               TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_teachers_role  ON teachers(role);`);
    db.exec(`CREATE INDEX idx_teachers_email ON teachers(email);`);

    db.exec(`
      CREATE TABLE centres (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        name_ne     TEXT,
        city        TEXT,
        region      TEXT,
        country     TEXT,
        flag        TEXT,
        altitude    INTEGER,
        lat         REAL,
        lng         REAL,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE halls (
        id              TEXT PRIMARY KEY,
        centre_id       TEXT NOT NULL,
        name            TEXT NOT NULL,
        teacher_slots   INTEGER NOT NULL DEFAULT 1,
        gender_required TEXT,
        notes           TEXT,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_halls_centre ON halls(centre_id);`);

    db.exec(`
      CREATE TABLE courses (
        id                INTEGER PRIMARY KEY,
        type              TEXT NOT NULL,
        center            TEXT NOT NULL,
        center_id         TEXT,
        city              TEXT,
        country           TEXT,
        flag              TEXT,
        dates             TEXT,
        start_date        TEXT NOT NULL,
        end_date          TEXT NOT NULL,
        languages_json    TEXT,
        need_count        INTEGER NOT NULL DEFAULT 1,
        gender_required   TEXT,
        status            TEXT,
        distance_km       INTEGER,
        travel_hrs        REAL,
        altitude          INTEGER,
        students_json     TEXT,
        arrival_date      TEXT,
        arrival_time      TEXT,
        coordinator_json  TEXT,
        transport         TEXT,
        notes             TEXT,
        created_at        TEXT NOT NULL,
        updated_at        TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_courses_status ON courses(status);`);
    db.exec(`CREATE INDEX idx_courses_center ON courses(center_id);`);
    db.exec(`CREATE INDEX idx_courses_start  ON courses(start_date);`);

    db.exec(`
      CREATE TABLE service_areas (
        id          TEXT PRIMARY KEY,
        label       TEXT NOT NULL,
        label_ne    TEXT,
        emoji       TEXT,
        color       TEXT,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE applications (
        id                INTEGER PRIMARY KEY,
        course_id         INTEGER NOT NULL,
        teacher_id        TEXT NOT NULL,
        status            TEXT NOT NULL,
        applied_date      TEXT,
        source            TEXT,
        rejection_reason  TEXT,
        queue_position    INTEGER,
        withdrawal_note   TEXT,
        created_at        TEXT NOT NULL,
        updated_at        TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_apps_teacher ON applications(teacher_id);`);
    db.exec(`CREATE INDEX idx_apps_course  ON applications(course_id);`);
    db.exec(`CREATE INDEX idx_apps_status  ON applications(status);`);

    db.exec(`
      CREATE TABLE server_courses (
        id          INTEGER PRIMARY KEY,
        center      TEXT NOT NULL,
        center_id   TEXT,
        city        TEXT,
        type        TEXT,
        dates       TEXT,
        start_date  TEXT,
        end_date    TEXT,
        days        INTEGER,
        m_servers   INTEGER NOT NULL DEFAULT 0,
        f_servers   INTEGER NOT NULL DEFAULT 0,
        filled      INTEGER NOT NULL DEFAULT 0,
        total       INTEGER NOT NULL DEFAULT 0,
        areas_json  TEXT,
        arrive_by   TEXT,
        altitude    INTEGER,
        country     TEXT,
        flag        TEXT,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE server_applications (
        id           INTEGER PRIMARY KEY,
        course_id    INTEGER NOT NULL,
        server_id    TEXT,
        center       TEXT,
        type         TEXT,
        dates        TEXT,
        status       TEXT NOT NULL,
        areas_json   TEXT,
        partial      INTEGER NOT NULL DEFAULT 0,
        days         TEXT,
        applied      TEXT,
        coordinator  TEXT,
        coord_phone  TEXT,
        arrive_by    TEXT,
        reason       TEXT,
        created_at   TEXT NOT NULL,
        updated_at   TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_sapps_status ON server_applications(status);`);

    db.exec(`
      CREATE TABLE notifications (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id          TEXT NOT NULL,
        user_role        TEXT NOT NULL,
        kind             TEXT NOT NULL,
        title            TEXT NOT NULL,
        body             TEXT,
        link_target      TEXT,
        link_params_json TEXT,
        is_read          INTEGER NOT NULL DEFAULT 0,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
      );
    `);
    db.exec(`CREATE INDEX idx_notifs_user   ON notifications(user_id, user_role);`);
    db.exec(`CREATE INDEX idx_notifs_unread ON notifications(user_id, is_read);`);

    db.exec(`
      CREATE TABLE settings (
        key         TEXT PRIMARY KEY,
        value       TEXT,
        updated_at  TEXT NOT NULL
      );
    `);
  },
};
