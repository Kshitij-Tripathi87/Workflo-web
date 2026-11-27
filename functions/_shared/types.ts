export interface D1PreparedStatement {
  bind(...values: Array<string | number | null>): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; results?: T[]; meta?: Record<string, unknown> }>;
  all<T = unknown>(): Promise<{ success: boolean; results?: T[]; meta?: Record<string, unknown> }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(
    statements: D1PreparedStatement[],
  ): Promise<Array<{ success: boolean; results?: T[]; meta?: Record<string, unknown> }>>;
}

export interface Env {
  DB?: D1Database;
  SUBMISSION_RETENTION_DAYS?: string;
  RATE_LIMIT_MAX_PER_MINUTE?: string;
  RATE_LIMIT_SECRET?: string;
}

export interface PagesContext {
  request: Request;
  env: Env;
  next?: () => Promise<Response>;
}
