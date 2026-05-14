/**
 * Database connection singleton.
 *
 * Mobile (`expo-sqlite`): persists to `<documentDirectory>/SQLite/dhamma-at.db`.
 * Tests + web: in-memory shim that exposes the same surface — enough for unit
 * tests of repositories and migration runner without booting native modules.
 *
 * The exported type `DB` is intentionally narrow: just what the repositories
 * and migrations need.
 */

import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

export interface DB {
  /** Execute a statement with no return rows (CREATE TABLE, INSERT, UPDATE, DELETE). */
  exec(sql: string, params?: readonly unknown[]): void;

  /** Execute a SELECT and return all rows. */
  query<T = unknown>(sql: string, params?: readonly unknown[]): T[];

  /** Execute a SELECT and return the first row or null. */
  queryOne<T = unknown>(sql: string, params?: readonly unknown[]): T | null;

  /**
   * Run multiple statements in a transaction. Rolls back on throw.
   * Use this for migrations and seed inserts to keep partial writes from
   * leaving the DB in a half-broken state.
   */
  transaction(work: () => void): void;
}

const DB_NAME = 'dhamma-at.db';

let _db: DB | null = null;

export function getDb(): DB {
  if (_db) return _db;

  if (Platform.OS === 'web' || typeof jest !== 'undefined') {
    _db = createMemoryDb();
  } else {
    _db = createNativeDb();
  }
  return _db;
}

/** Test / dev helper — wipe the cached connection so the next `getDb()` rebuilds. */
export function resetDbForTests(): void {
  _db = null;
}

// ─── Native (expo-sqlite) ────────────────────────────────────────────────

function createNativeDb(): DB {
  // Lazy require so jest / web can avoid the native binding.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQLite = require('expo-sqlite');
  const handle = SQLite.openDatabaseSync(DB_NAME);

  return {
    exec(sql, params) {
      handle.runSync(sql, params ? (params as unknown[]) : []);
    },
    query<T>(sql: string, params?: readonly unknown[]): T[] {
      return handle.getAllSync(sql, params ? (params as unknown[]) : []) as T[];
    },
    queryOne<T>(sql: string, params?: readonly unknown[]): T | null {
      const row = handle.getFirstSync(sql, params ? (params as unknown[]) : []);
      return (row ?? null) as T | null;
    },
    transaction(work) {
      handle.execSync('BEGIN TRANSACTION;');
      try {
        work();
        handle.execSync('COMMIT;');
      } catch (err) {
        try {
          handle.execSync('ROLLBACK;');
        } catch (rollbackErr) {
          logger.error('[db] rollback failed', rollbackErr);
        }
        throw err;
      }
    },
  };
}

// ─── In-memory shim (web + tests) ───────────────────────────────────────
//
// Just enough SQL parsing to support our migration + seed + simple SELECTs.
// Repositories will be tested against this shim until SQLite WASM is wired
// for web.

interface TableState {
  columns: string[];
  pkColumn: string | null;
  rows: Record<string, unknown>[];
}

function createMemoryDb(): DB {
  const tables = new Map<string, TableState>();
  const indexes = new Set<string>();
  // Track the last auto-incremented rowid so `SELECT last_insert_rowid()`
  // works the same way as on native SQLite.
  let lastInsertId = 0;

  const ensureTable = (name: string) => {
    if (!tables.has(name)) {
      tables.set(name, { columns: [], pkColumn: null, rows: [] });
    }
    return tables.get(name)!;
  };

  const stripComments = (sql: string) => sql.replace(/--.*$/gm, '').trim();

  const runOne = (raw: string, params: readonly unknown[] = []): unknown => {
    const sql = stripComments(raw);
    if (!sql) return undefined;

    const upper = sql.toUpperCase();

    if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
      return undefined;
    }

    if (upper.startsWith('CREATE TABLE')) {
      handleCreateTable(sql);
      return undefined;
    }
    if (upper.startsWith('CREATE INDEX') || upper.startsWith('CREATE UNIQUE INDEX')) {
      const m = sql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)/i);
      if (m) indexes.add(m[1]);
      return undefined;
    }
    if (upper.startsWith('INSERT')) {
      handleInsert(sql, params);
      return undefined;
    }
    if (upper.startsWith('UPDATE')) {
      handleUpdate(sql, params);
      return undefined;
    }
    if (upper.startsWith('DELETE FROM')) {
      handleDelete(sql, params);
      return undefined;
    }
    if (upper.startsWith('SELECT')) {
      return handleSelect(sql, params);
    }
    if (upper.startsWith('DROP TABLE')) {
      const m = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
      if (m) tables.delete(m[1]);
      return undefined;
    }

    throw new Error(`[memory-db] unsupported SQL: ${sql.slice(0, 100)}…`);
  };

  const handleCreateTable = (sql: string) => {
    const nameMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
    if (!nameMatch) return;
    const tableName = nameMatch[1];
    const ifNotExists = /IF\s+NOT\s+EXISTS/i.test(sql);
    if (ifNotExists && tables.has(tableName)) return;
    const openParen = sql.indexOf('(');
    const closeParen = sql.lastIndexOf(')');
    const body = sql.slice(openParen + 1, closeParen);
    const cols: string[] = [];
    let pkColumn: string | null = null;
    let depth = 0;
    let current = '';
    for (const ch of body) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) cols.push(current.trim());

    const columns = cols
      .map((c) => {
        const lower = c.toLowerCase();
        if (lower.startsWith('check') || lower.startsWith('foreign key')) return null;
        const name = c.split(/\s+/)[0];
        if (lower.includes('primary key')) pkColumn = name;
        return name;
      })
      .filter((n): n is string => Boolean(n));

    tables.set(tableName, { columns, pkColumn, rows: [] });
  };

  const handleInsert = (sql: string, params: readonly unknown[]) => {
    const m = sql.match(
      /INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i,
    );
    if (!m) throw new Error(`[memory-db] cannot parse insert: ${sql.slice(0, 80)}`);
    const tableName = m[1];
    const colNames = m[2].split(',').map((s) => s.trim());
    const valueTokens = m[3].split(',').map((s) => s.trim());

    const replace = /INSERT\s+OR\s+REPLACE/i.test(sql);

    const row: Record<string, unknown> = {};
    let paramIdx = 0;
    valueTokens.forEach((token, i) => {
      if (token === '?') {
        row[colNames[i]] = params[paramIdx++];
      } else if (token.toUpperCase() === 'NULL') {
        row[colNames[i]] = null;
      } else {
        row[colNames[i]] = parseLiteral(token);
      }
    });

    const table = ensureTable(tableName);
    // Auto-increment integer PKs when the row doesn't supply one.
    if (table.pkColumn && (row[table.pkColumn] === undefined || row[table.pkColumn] === null)) {
      const nextId =
        (table.rows
          .map((r) => r[table.pkColumn!])
          .filter((v): v is number => typeof v === 'number')
          .reduce((acc, v) => Math.max(acc, v), 0) as number) + 1;
      row[table.pkColumn] = nextId;
      lastInsertId = nextId;
    } else if (table.pkColumn && typeof row[table.pkColumn] === 'number') {
      lastInsertId = row[table.pkColumn] as number;
    }
    if (replace && table.pkColumn && row[table.pkColumn] !== undefined) {
      const existing = table.rows.findIndex((r) => r[table.pkColumn!] === row[table.pkColumn!]);
      if (existing !== -1) {
        table.rows[existing] = row;
        return;
      }
    }
    // ON CONFLICT DO UPDATE shorthand — if INSERT carries the pk and a row
    // with that pk exists, treat as upsert (real SQLite would need the full
    // ON CONFLICT clause; for shim purposes the behavior is equivalent).
    if (table.pkColumn && row[table.pkColumn] !== undefined && /ON\s+CONFLICT/i.test(sql)) {
      const existing = table.rows.findIndex((r) => r[table.pkColumn!] === row[table.pkColumn!]);
      if (existing !== -1) {
        table.rows[existing] = { ...table.rows[existing], ...row };
        return;
      }
    }
    table.rows.push(row);
  };

  const handleUpdate = (sql: string, params: readonly unknown[]) => {
    const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/is);
    if (!m) throw new Error(`[memory-db] cannot parse update: ${sql.slice(0, 80)}`);
    const tableName = m[1];
    const table = tables.get(tableName);
    if (!table) return;

    const assignments = m[2].split(',').map((s) => s.trim());
    let paramIdx = 0;
    const setMap: [string, unknown][] = assignments.map((a) => {
      const [col, raw] = a.split('=').map((s) => s.trim());
      const value = raw === '?' ? params[paramIdx++] : parseLiteral(raw);
      return [col, value];
    });

    const wherePred = m[3]
      ? buildWherePredicate(m[3], params, paramIdx)
      : { test: () => true, consumed: 0 };

    table.rows = table.rows.map((r) =>
      wherePred.test(r) ? Object.fromEntries([...Object.entries(r), ...setMap]) : r,
    );
  };

  const handleDelete = (sql: string, params: readonly unknown[]) => {
    const m = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/is);
    if (!m) throw new Error(`[memory-db] cannot parse delete: ${sql.slice(0, 80)}`);
    const tableName = m[1];
    const table = tables.get(tableName);
    if (!table) return;
    const wherePred = m[2]
      ? buildWherePredicate(m[2], params, 0)
      : { test: () => true, consumed: 0 };
    table.rows = table.rows.filter((r) => !wherePred.test(r));
  };

  const handleSelect = (sql: string, params: readonly unknown[]): Record<string, unknown>[] => {
    // ── Scalar selects without a FROM clause ────────────────────────────────
    // `SELECT last_insert_rowid() AS id` is how repos retrieve the new id
    // after an auto-increment INSERT.
    const rowidMatch = sql.match(/^SELECT\s+last_insert_rowid\(\)\s+AS\s+(\w+)$/i);
    if (rowidMatch) return [{ [rowidMatch[1]]: lastInsertId }];

    // ── Aggregate: COUNT(*) AS alias FROM table [WHERE ...] ────────────────
    const countMatch = sql.match(
      /^SELECT\s+COUNT\(\*\)\s+AS\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/is,
    );
    if (countMatch) {
      const [, alias, tableName, whereClause] = countMatch;
      const table = tables.get(tableName);
      if (!table) return [{ [alias]: 0 }];
      const pred = whereClause ? buildWherePredicate(whereClause, params, 0) : { test: () => true };
      const n = table.rows.filter((r) => pred.test(r)).length;
      return [{ [alias]: n }];
    }

    const m = sql.match(
      /SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/is,
    );
    if (!m) throw new Error(`[memory-db] cannot parse select: ${sql.slice(0, 80)}`);
    const selectExpr = m[1].trim();
    const tableName = m[2];
    const table = tables.get(tableName);
    if (!table) return [];

    const pred = m[3] ? buildWherePredicate(m[3], params, 0) : { test: () => true };
    let rows = table.rows.filter((r) => pred.test(r));

    if (m[4]) {
      const orderClauses = m[4].split(',').map((c) => c.trim());
      rows = rows.slice().sort((a, b) => {
        for (const clause of orderClauses) {
          const [col, dir = 'ASC'] = clause.split(/\s+/);
          const av = a[col];
          const bv = b[col];
          const cmp =
            av == null && bv == null
              ? 0
              : av == null
                ? -1
                : bv == null
                  ? 1
                  : av < bv
                    ? -1
                    : av > bv
                      ? 1
                      : 0;
          if (cmp !== 0) return dir.toUpperCase() === 'DESC' ? -cmp : cmp;
        }
        return 0;
      });
    }
    if (m[5]) rows = rows.slice(0, Number(m[5]));

    if (selectExpr === '*') return rows;
    const cols = selectExpr.split(',').map((c) => c.trim());
    return rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c]])));
  };

  const buildWherePredicate = (
    clause: string,
    params: readonly unknown[],
    startIdx: number,
  ): { test: (row: Record<string, unknown>) => boolean; consumed: number } => {
    // Supports clauses combined with AND. Each clause can be:
    //   col = ?            equality (param or literal)
    //   col = LITERAL
    //   col LIKE ?
    //   col IN (?, ?, …) | col IN ('a','b')
    //   col IS NULL | col IS NOT NULL
    //   LOWER(col) = LOWER(?)     case-insensitive equality
    //   LOWER(col) = LOWER('lit') case-insensitive equality (literal)
    const parts = clause.split(/\s+AND\s+/i).map((p) => p.trim());
    let idx = startIdx;
    const checks: ((row: Record<string, unknown>) => boolean)[] = [];

    for (const p of parts) {
      // LOWER(col) = LOWER(?) | LOWER(col) = LOWER('lit')
      const lowerMatch = p.match(/^LOWER\((\w+)\)\s*=\s*LOWER\((.+)\)$/i);
      if (lowerMatch) {
        const col = lowerMatch[1];
        const raw = lowerMatch[2].trim();
        let expected: unknown;
        if (raw === '?') expected = params[idx++];
        else expected = parseLiteral(raw);
        const expLower = typeof expected === 'string' ? expected.toLowerCase() : expected;
        checks.push((row) => {
          const v = row[col];
          if (typeof v === 'string') return v.toLowerCase() === expLower;
          return v === expected;
        });
        continue;
      }

      // col IS NULL | col IS NOT NULL
      const isNullMatch = p.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
      if (isNullMatch) {
        const col = isNullMatch[1];
        const negated = !!isNullMatch[2];
        checks.push((row) => (row[col] == null) !== negated);
        continue;
      }

      // col LIKE ?  → substring match (supports `%foo%` style)
      const likeMatch = p.match(/^(\w+)\s+LIKE\s+(.+)$/i);
      if (likeMatch) {
        const col = likeMatch[1];
        const raw = likeMatch[2].trim();
        let pattern: unknown;
        if (raw === '?') pattern = params[idx++];
        else pattern = parseLiteral(raw);
        if (typeof pattern !== 'string') {
          checks.push(() => false);
          continue;
        }
        // % is "any chars", _ is "any single char". Translate to regex.
        const regex = new RegExp(
          '^' +
            pattern
              .replace(/[.+^${}()|[\]\\]/g, '\\$&')
              .replace(/%/g, '.*')
              .replace(/_/g, '.') +
            '$',
        );
        checks.push((row) => {
          const v = row[col];
          return typeof v === 'string' && regex.test(v);
        });
        continue;
      }

      // col IN (?, ?, …) | col IN ('a','b')
      const inMatch = p.match(/^(\w+)\s+IN\s*\(([^)]+)\)$/i);
      if (inMatch) {
        const col = inMatch[1];
        const tokens = inMatch[2].split(',').map((t) => t.trim());
        const values: unknown[] = tokens.map((t) => {
          if (t === '?') return params[idx++];
          return parseLiteral(t);
        });
        checks.push((row) => values.includes(row[col]));
        continue;
      }

      // col = ? | col = LITERAL
      const eqMatch = p.match(/^(\w+)\s*=\s*(.+)$/);
      if (!eqMatch) throw new Error(`[memory-db] unsupported WHERE: ${p}`);
      const col = eqMatch[1];
      const raw = eqMatch[2].trim();
      let expected: unknown;
      if (raw === '?') expected = params[idx++];
      else expected = parseLiteral(raw);
      checks.push((row) => row[col] === expected);
    }
    return {
      test: (row) => checks.every((c) => c(row)),
      consumed: idx - startIdx,
    };
  };

  const parseLiteral = (raw: string): unknown => {
    if (raw === 'NULL' || raw === 'null') return null;
    if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replace(/''/g, "'");
    if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
    if (/^-?\d*\.\d+$/.test(raw)) return parseFloat(raw);
    return raw;
  };

  return {
    exec(sql, params) {
      // Allow multi-statement migrations: split on semicolons that are followed by newline/EOF.
      const stmts = sql.split(/;\s*(?:\n|$)/).filter((s) => s.trim().length > 0);
      for (const s of stmts) runOne(s, params);
    },
    query<T>(sql: string, params?: readonly unknown[]): T[] {
      return runOne(sql, params ?? []) as T[];
    },
    queryOne<T>(sql: string, params?: readonly unknown[]): T | null {
      const rows = (runOne(sql, params ?? []) as Record<string, unknown>[]) ?? [];
      return (rows[0] ?? null) as T | null;
    },
    transaction(work) {
      // Snapshot tables for rollback on error.
      const snapshot = new Map<string, TableState>();
      tables.forEach((v, k) => {
        snapshot.set(k, {
          columns: [...v.columns],
          pkColumn: v.pkColumn,
          rows: v.rows.map((r) => ({ ...r })),
        });
      });
      try {
        work();
      } catch (err) {
        tables.clear();
        snapshot.forEach((v, k) => tables.set(k, v));
        throw err;
      }
    },
  };
}
