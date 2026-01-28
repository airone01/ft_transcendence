# @transc/db

## How to use

Simply import the package in the SvelteKit project.

```ts
import { db } from '@transc/db';
import { user } from '@transc/db/schema';
```

## Notes

- Because SvelteKit's `$env` is dynamically generated at comptime (in `.svelte-kit/ambient.d.ts` within `@transc/web`) and does not exist on disk declaratively, we need to use `process.env` and statically check it against a custom zod schema. This is probably fine though.
- Schemas of our database are defined in `schemas`.
- Schemas are propagated to the database using `drizzle-kit` cli.

## Reference

- Drizzle Kit: [https://orm.drizzle.team/docs/kit-overview](https://orm.drizzle.team/docs/kit-overview)
- Drizzle schema fundamentals: [https://orm.drizzle.team/docs/sql-schema-declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- Drizzle Kit migration fundamentals: [https://orm.drizzle.team/docs/migrations](https://orm.drizzle.team/docs/migrations)

