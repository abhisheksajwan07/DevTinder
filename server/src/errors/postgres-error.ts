export type PostgresError = {
  code: string;
  constraint?: string;
  detail?: string;
  table?: string;
  schema?: string;
  column?: string;
};

const POSTGRES_ERROR_CODE = /^[0-9A-Z]{5}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toPostgresError = (value: unknown): PostgresError | null => {
  if (!isRecord(value) || typeof value.code !== "string") {
    return null;
  }

  if (!POSTGRES_ERROR_CODE.test(value.code)) {
    return null;
  }

  return {
    code: value.code,
    constraint:
      typeof value.constraint === "string" ? value.constraint : undefined,
    detail: typeof value.detail === "string" ? value.detail : undefined,
    table: typeof value.table === "string" ? value.table : undefined,
    schema: typeof value.schema === "string" ? value.schema : undefined,
    column: typeof value.column === "string" ? value.column : undefined,
  };
};

/**
 * PostgreSQL errors normally arrive directly from the pg driver. An AppError
 * can also preserve one as its cause, so inspect that one known wrapper too.
 */
export const getPostgresError = (error: unknown): PostgresError | null => {
  const directError = toPostgresError(error);
  if (directError) {
    return directError;
  }

  if (!isRecord(error)) {
    return null;
  }

  return toPostgresError(error.cause);
};
