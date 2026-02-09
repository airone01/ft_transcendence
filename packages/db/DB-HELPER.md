# DataBase Helper

### To run the DB

- First, do not forget to mount the project, in the root of the project:
```bash
bun run dev
```

- Then:
```bash
cd packages/db/

bun db:generate    # can be needed if DB schemas have changed
bun db:migrate

bun db:studio      # to visualize the DB
```

- Click on `https://local.drizzle.studio` to visualize the DB
