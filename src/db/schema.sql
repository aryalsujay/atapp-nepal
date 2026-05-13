-- Dhamma AT App — canonical schema (v1).
--
-- DO NOT execute this file directly. It's a human-readable reference.
-- The runtime schema is created by `src/db/migrations/0001_initial.ts`.
-- Any change to the schema:
--   1. Update this file (so reviewers can read the shape in one place).
--   2. Add a new migration in `src/db/migrations/` — never modify an applied one.

----------------------------------------------------------------
-- _migrations: tracks which migrations have been applied.
----------------------------------------------------------------
CREATE TABLE _migrations (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  applied_at  TEXT NOT NULL          -- ISO-8601
);

----------------------------------------------------------------
-- admins
----------------------------------------------------------------
CREATE TABLE admins (
  id              TEXT PRIMARY KEY,
  username        TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  center_name     TEXT,
  settings_json   TEXT,                 -- JSON object
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

----------------------------------------------------------------
-- teachers (covers both teacher + server roles via `role` column)
----------------------------------------------------------------
CREATE TABLE teachers (
  id                          TEXT PRIMARY KEY,
  role                        TEXT NOT NULL CHECK (role IN ('teacher','server')),
  name                        TEXT NOT NULL,
  gender                      TEXT,            -- 'M' | 'F' | NULL
  email                       TEXT UNIQUE,
  invite_code                 TEXT UNIQUE,
  password_hash               TEXT NOT NULL,
  region                      TEXT,
  flag                        TEXT,
  authorized_since            INTEGER,
  total_courses               INTEGER NOT NULL DEFAULT 0,
  centers_served              INTEGER NOT NULL DEFAULT 0,
  courses_this_year           INTEGER NOT NULL DEFAULT 0,
  is_onboarded                INTEGER NOT NULL DEFAULT 0,           -- boolean
  personal_note               TEXT,
  authorizations_json         TEXT,            -- JSON array
  languages_json              TEXT,            -- JSON object
  preferred_regions_json      TEXT,            -- JSON array
  available_months_json       TEXT,            -- JSON array of month ints 0-11
  festival_months_json        TEXT,            -- JSON array of month ints 0-11
  teaching_history_json       TEXT,            -- JSON array of HistoryEntry
  created_at                  TEXT NOT NULL,
  updated_at                  TEXT NOT NULL
);
CREATE INDEX idx_teachers_role  ON teachers(role);
CREATE INDEX idx_teachers_email ON teachers(email);

----------------------------------------------------------------
-- centres
----------------------------------------------------------------
CREATE TABLE centres (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  name_ne      TEXT,
  city         TEXT,
  region       TEXT,
  country      TEXT,
  flag         TEXT,
  altitude     INTEGER,
  lat          REAL,
  lng          REAL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

----------------------------------------------------------------
-- halls
----------------------------------------------------------------
CREATE TABLE halls (
  id               TEXT PRIMARY KEY,
  centre_id        TEXT NOT NULL REFERENCES centres(id),
  name             TEXT NOT NULL,
  teacher_slots    INTEGER NOT NULL DEFAULT 1,
  gender_required  TEXT,
  notes            TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX idx_halls_centre ON halls(centre_id);

----------------------------------------------------------------
-- courses
----------------------------------------------------------------
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
  students_json     TEXT,            -- JSON {expected, male, female}
  arrival_date      TEXT,
  arrival_time      TEXT,
  coordinator_json  TEXT,            -- JSON {name, role, phone}
  transport         TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_center ON courses(center_id);
CREATE INDEX idx_courses_start  ON courses(start_date);

----------------------------------------------------------------
-- service_areas
----------------------------------------------------------------
CREATE TABLE service_areas (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  label_ne    TEXT,
  emoji       TEXT,
  color       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

----------------------------------------------------------------
-- applications (teacher applications)
----------------------------------------------------------------
CREATE TABLE applications (
  id                INTEGER PRIMARY KEY,
  course_id         INTEGER NOT NULL REFERENCES courses(id),
  teacher_id        TEXT NOT NULL REFERENCES teachers(id),
  status            TEXT NOT NULL,
  applied_date      TEXT,
  source            TEXT,
  rejection_reason  TEXT,
  queue_position    INTEGER,
  withdrawal_note   TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_apps_teacher ON applications(teacher_id);
CREATE INDEX idx_apps_course  ON applications(course_id);
CREATE INDEX idx_apps_status  ON applications(status);

----------------------------------------------------------------
-- server_courses
----------------------------------------------------------------
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

----------------------------------------------------------------
-- server_applications
----------------------------------------------------------------
CREATE TABLE server_applications (
  id           INTEGER PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES server_courses(id),
  server_id    TEXT REFERENCES teachers(id),
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
CREATE INDEX idx_sapps_status ON server_applications(status);

----------------------------------------------------------------
-- notifications
----------------------------------------------------------------
CREATE TABLE notifications (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           TEXT NOT NULL,
  user_role         TEXT NOT NULL,
  kind              TEXT NOT NULL,
  title             TEXT NOT NULL,
  body              TEXT,
  link_target       TEXT,
  link_params_json  TEXT,
  is_read           INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX idx_notifs_user   ON notifications(user_id, user_role);
CREATE INDEX idx_notifs_unread ON notifications(user_id, is_read);

----------------------------------------------------------------
-- settings (key-value)
----------------------------------------------------------------
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL
);
