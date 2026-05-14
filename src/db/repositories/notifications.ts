/**
 * Notifications repo — append-only (mostly). Read-most-recent-first; mark
 * read flips one column; clearing is a delete by user.
 */

import type { DB } from '../index';
import type { NotificationRow } from '../types';

export type Role = 'teacher' | 'server' | 'admin';

export interface NotificationDomain {
  id: number;
  userId: string;
  userRole: Role;
  kind: string;
  title: string;
  body: string | null;
  linkTarget: string | null;
  linkParams: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

function rowToDomain(r: NotificationRow): NotificationDomain {
  let linkParams: Record<string, unknown> | null = null;
  if (r.link_params_json) {
    try {
      linkParams = JSON.parse(r.link_params_json) as Record<string, unknown>;
    } catch {
      linkParams = null;
    }
  }
  return {
    id: r.id,
    userId: r.user_id,
    userRole: r.user_role as Role,
    kind: r.kind,
    title: r.title,
    body: r.body,
    linkTarget: r.link_target,
    linkParams,
    isRead: r.is_read === 1,
    createdAt: r.created_at,
  };
}

export function listForUser(db: DB, userId: string, userRole: Role): NotificationDomain[] {
  return db
    .query<NotificationRow>(
      `SELECT * FROM notifications
       WHERE user_id = ? AND user_role = ?
       ORDER BY created_at DESC`,
      [userId, userRole],
    )
    .map(rowToDomain);
}

export function unreadCount(db: DB, userId: string, userRole: Role): number {
  const row = db.queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM notifications
     WHERE user_id = ? AND user_role = ? AND is_read = 0`,
    [userId, userRole],
  );
  return row?.n ?? 0;
}

export function insert(db: DB, n: Omit<NotificationDomain, 'id' | 'createdAt'>): number {
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO notifications (
       user_id, user_role, kind, title, body, link_target, link_params_json,
       is_read, created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      n.userId,
      n.userRole,
      n.kind,
      n.title,
      n.body,
      n.linkTarget,
      n.linkParams ? JSON.stringify(n.linkParams) : null,
      n.isRead ? 1 : 0,
      now,
      now,
    ],
  );
  const row = db.queryOne<{ id: number }>('SELECT last_insert_rowid() AS id');
  return row?.id ?? 0;
}

export function markRead(db: DB, id: number): void {
  db.exec('UPDATE notifications SET is_read = 1, updated_at = ? WHERE id = ?', [
    new Date().toISOString(),
    id,
  ]);
}

export function markAllRead(db: DB, userId: string, userRole: Role): void {
  db.exec(
    `UPDATE notifications SET is_read = 1, updated_at = ?
     WHERE user_id = ? AND user_role = ? AND is_read = 0`,
    [new Date().toISOString(), userId, userRole],
  );
}

export function deleteForApplication(db: DB, userId: string, courseId: number): void {
  // Notifications can link to a courseId via link_params_json — we match by
  // user + courseId substring.
  db.exec(
    `DELETE FROM notifications
     WHERE user_id = ? AND link_params_json LIKE ?`,
    [userId, `%"courseId":${courseId}%`],
  );
}

export function deleteAll(db: DB, userId: string, userRole: Role): void {
  db.exec('DELETE FROM notifications WHERE user_id = ? AND user_role = ?', [userId, userRole]);
}
