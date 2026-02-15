/** biome-ignore-all lint/suspicious/noExplicitAny: <cutting-edge> */
import type { PgColumn } from "drizzle-orm/pg-core";

// id constraint
export interface UserTableConstraint {
  id: PgColumn<any>;
  [key: string]: any; // all else
}

// id, userId, and expiresAt constraints
export interface AuthSessionsTableConstraint {
  id: PgColumn<any>;
  userId: PgColumn<any>;
  expiresAt: PgColumn<any>;
  [key: string]: any; // all else
}

export type AuthConfig<
  TUser extends UserTableConstraint,
  TSession extends AuthSessionsTableConstraint,
> = {
  db: any; // drizzle instance
  schema: {
    users: TUser;
    authSessions: TSession;
  };
};
