# DataBase Helper

## Running the Database

Run the main dev script. It will run the database, migrate the schema, push it, and seed the database.

```bash
# (in root of repo)
bun install
bun run dev

bun db:seed
```

The test users usernames after seed are our (devs) first names, and the password is always 'P@ssw0rd' (without the single quotes).

## Visualizing the Database

```ts
cd packages/db
bun db:studio
```

Open `https://local.drizzle.studio` in a ewb browser.
