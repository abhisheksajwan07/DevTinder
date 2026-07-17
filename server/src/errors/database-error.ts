import { AppError } from "../utils/AppError.js";
import { PG_ERROR } from "../constants/postgres-errors.js";
import { DB_CONSTRAINTS } from "../constants/db-constraints.js";

const FK_ERROR_MAP: Record<string, { code: string; message: string }> = {
  [DB_CONSTRAINTS.PROFILE_SKILL]: {
    code: "INVALID_SKILLS",
    message: "One or more skills are invalid.",
  },
  [DB_CONSTRAINTS.PROFILE_AVATAR]: {
    code: "INVALID_AVATAR",
    message: "Invalid avatar selected.",
  },
  [DB_CONSTRAINTS.PROFILE_INTEREST]: {
    code: "INVALID_INTERESTS",
    message: "One or more interests are invalid.",
  },
  [DB_CONSTRAINTS.PROFILE_LOOKING_FOR]: {
    code: "INVALID_LOOKING_FOR",
    message: "One or more 'looking for' options are invalid.",
  },
};

const UNIQUE_ERROR_MAP: Record<string, { code: string; message: string }> = {
  [DB_CONSTRAINTS.PROFILE_USERNAME]: {
    code: "USERNAME_TAKEN",
    message: "Username already taken.",
  },
  [DB_CONSTRAINTS.PROFILE_USERNAME_IDX]: {
    code: "USERNAME_TAKEN",
    message: "Username already taken.",
  },
};

export const handleDbError = (error: any): never => {
  const dbError = error.cause || error;

  switch (dbError?.code) {
    case PG_ERROR.UNIQUE: {
      const constraint = dbError.constraint || "";
      const mapped = UNIQUE_ERROR_MAP[constraint];
      if (mapped) {
        throw new AppError(mapped.message, 409, mapped.code, dbError);
      }
      throw new AppError("A duplicate record exists.", 409, "DUPLICATE_RECORD", dbError);
    }

    case PG_ERROR.FOREIGN_KEY: {
      const constraint = dbError.constraint || "";
      const mapped = FK_ERROR_MAP[constraint];
      if (mapped) {
        throw new AppError(mapped.message, 400, mapped.code, dbError);
      }
      throw new AppError("Invalid reference provided.", 400, "INVALID_REFERENCE", dbError);
    }
  }

  throw error;
};
