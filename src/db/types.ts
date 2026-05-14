/**
 * Row types — one interface per table. These mirror the canonical schema in
 * `schema.sql`. Repositories return these row shapes (snake_case columns) and
 * stores convert to camelCase domain types when needed.
 *
 * `*_json` fields hold serialized JSON; pass them through `JSON.parse` /
 * `JSON.stringify` at the repository boundary.
 */

export interface AdminRow {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  center_name: string | null;
  settings_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherRow {
  id: string;
  role: 'teacher' | 'server';
  name: string;
  gender: 'M' | 'F' | null;
  email: string | null;
  phone: string | null;
  invite_code: string | null;
  password_hash: string;
  region: string | null;
  flag: string | null;
  authorized_since: number | null;
  total_courses: number;
  centers_served: number;
  courses_this_year: number;
  is_onboarded: 0 | 1;
  personal_note: string | null;
  authorizations_json: string | null;
  languages_json: string | null;
  preferred_regions_json: string | null;
  available_months_json: string | null;
  festival_months_json: string | null;
  teaching_history_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface CentreRow {
  id: string;
  name: string;
  name_ne: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  flag: string | null;
  altitude: number | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface HallRow {
  id: string;
  centre_id: string;
  name: string;
  teacher_slots: number;
  gender_required: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: number;
  type: string;
  center: string;
  center_id: string | null;
  city: string | null;
  country: string | null;
  flag: string | null;
  dates: string | null;
  start_date: string;
  end_date: string;
  languages_json: string | null;
  need_count: number;
  gender_required: string | null;
  status: string | null;
  distance_km: number | null;
  travel_hrs: number | null;
  altitude: number | null;
  students_json: string | null;
  arrival_date: string | null;
  arrival_time: string | null;
  coordinator_json: string | null;
  coteacher_json: string | null;
  transport: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceAreaRow {
  id: string;
  label: string;
  label_ne: string | null;
  emoji: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: number;
  course_id: number;
  teacher_id: string;
  status: string;
  applied_date: string | null;
  source: string | null;
  rejection_reason: string | null;
  queue_position: number | null;
  withdrawal_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerCourseRow {
  id: number;
  center: string;
  center_id: string | null;
  city: string | null;
  type: string | null;
  dates: string | null;
  start_date: string | null;
  end_date: string | null;
  days: number | null;
  m_servers: number;
  f_servers: number;
  filled: number;
  total: number;
  areas_json: string | null;
  arrive_by: string | null;
  altitude: number | null;
  country: string | null;
  flag: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerApplicationRow {
  id: number;
  course_id: number;
  server_id: string | null;
  center: string | null;
  type: string | null;
  dates: string | null;
  status: string;
  areas_json: string | null;
  partial: 0 | 1;
  days: string | null;
  applied: string | null;
  coordinator: string | null;
  coord_phone: string | null;
  arrive_by: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: number;
  user_id: string;
  user_role: string;
  kind: string;
  title: string;
  body: string | null;
  link_target: string | null;
  link_params_json: string | null;
  is_read: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface SettingRow {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface MigrationRow {
  id: number;
  name: string;
  applied_at: string;
}
