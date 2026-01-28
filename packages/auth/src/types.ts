import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

// minimum requirement
export type UserTableRequirement = {
  id: PgColumn<{
    name: "id";
    tableName: "user";
    dataType: "number";
    columnType: "PgSerial";
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
    isPrimaryKey: true;
    isAutoincrement: false;
    hasRuntimeDefault: false;
    enumValues: undefined;
    baseColumn: never;
    identity: undefined;
    generated: undefined;
  }>; // int or uuid
  email: PgColumn<
    {
      name: "email";
      tableName: "user";
      dataType: "string";
      columnType: "PgVarchar";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    },
    // biome-ignore lint/complexity/noBannedTypes: <not my choice>
    {},
    {
      length: number | undefined;
    }
  >;
  // password_hash is optional because OAuth-only users might not have one
};

export interface AuthConfig<
  TUser extends UserTableRequirement,
  TSession extends PgTable,
> {
  db: unknown;
  schema: {
    user: TUser;
    session: TSession;
    // accounts: TAccount; // oauth later
  };
}
