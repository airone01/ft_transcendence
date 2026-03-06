# DataBase Helper

## Running the Database

Run the main dev script. It will run the database.

```bash
bun install
bun run dev
```

Docker-compose is now running a container with a PG DB.
You can then connect to the database to push the schema.

```bash
# migrate and push the schema
bun db:setup

# optionally, run this to seed the DB with some default users
# their usernames are our (devs) first names, and the password
# is always 'P@ssw0rd' (without the single quotes).
bun db:seed
```

## Visualizing the Database

```ts
cd packages/db
bun db:studio
```

Open `https://local.drizzle.studio` in a ewb browser.
