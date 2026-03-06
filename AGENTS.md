# AGENTS.md

Guidelines for AI coding agents working on `@uscreen.de/fastify-mongo-crud`.

## Project Overview

A tiny MongoDB decorator for Fastify providing CRUD-style database methods. ESM-only package (`"type": "module"`) requiring Fastify >= 2.x, integrating with `@fastify/mongodb` and `@fastify/sensible`. Pure JavaScript — no TypeScript.

## Package Manager

**pnpm only.** The `preinstall` script enforces this via `only-allow`. Do not use npm or yarn.

## Build, Lint, and Test Commands

```bash
pnpm install                    # Install dependencies
pnpm test                       # Run all tests (node --test --test-reporter spec)
pnpm test:cov                   # Tests with coverage (html + text via c8)
pnpm test:ci                    # Tests with coverage for CI (lcov + text)
pnpm lint                       # ESLint check only (no auto-fix)
pnpm lint:fix                   # ESLint with auto-fix

# Run a single test file
node --test test/crud.test.js
node --test test/noop.test.js

# Run a single test with readable output
node --test --test-reporter spec test/crud.test.js
```

**Test requirements:**
- MongoDB must be running locally on `127.0.0.1:27017`
- Override with: `mongoServer=localhost:27018 pnpm test`
- Tests use Node.js built-in test runner (`node:test`)
- Each run creates a unique database via `ulid` and drops it on cleanup

## ESLint Configuration

Uses `@antfu/eslint-config` (flat config, ESLint 9.x) with `eslint-plugin-format` for non-JS formatting. Configured in `eslint.config.js`.

**Effective JS style rules:**
- **No semicolons** (`semi: false`)
- **Single quotes** (`quotes: 'single'`)
- **No trailing commas** (`style/comma-dangle: ['error', 'never']`)
- **2-space indentation**
- **Curly braces**: required for multi-line blocks, consistent within if/else (`curly: ['error', 'multi-line', 'consistent']`)
- **Arrow functions allowed** at top level (`antfu/top-level-function: 'off'`)
- **Console statements allowed** (`no-console: 'off'`)

## Code Style

### Imports
- **ESM only** — no `require()` or CommonJS
- Node.js built-ins use `node:` prefix: `import { test } from 'node:test'`
- Local imports use relative paths **with `.js` extension**: `import crud from '../index.js'`
- Group: Node built-ins → external packages → local modules (blank line between groups)

### Naming Conventions
- **camelCase** for variables, functions, methods
- **PascalCase** for classes/constructors (`ObjectId`, `Fastify`)
- **lowercase with hyphens** for filenames (`crud.test.js`)
- Prefix unused parameters with underscore: `(_t) => { ... }`

### Functions
- Arrow functions for everything (top-level and callbacks):
  ```js
  const fastifyMongoCrud = (fastify, opts, next) => { ... }
  const uuid = (prefix = '') => { ... }
  ```
- Prefer `async/await` over raw promises or callbacks
- Always `await` database operations

### Error Handling
- Use `fastify.httpErrors` from `@fastify/sensible`:
  ```js
  if (result) return result
  throw fastify.httpErrors.notFound()
  ```
- In tests, verify errors with try-catch and a `thrown` flag:
  ```js
  let thrown = false
  try {
    await accounts.read(unknownId)
  }
  catch (error) {
    thrown = true
    assert.equal(error.name, 'NotFoundError')
    assert.equal(error.statusCode, Number(404))
  }
  assert.ok(thrown)
  ```

### Object Patterns
- `Object.assign()` to add fields in-place: `Object.assign(data, { created: new Date() })`
- Use object shorthand and destructuring where natural

### Comments
- Keep comments minimal — focus on "why" not "what"
- Use JSDoc only for complex public functions if needed

## Testing Patterns

Tests use `node:test` with `node:assert/strict`. Structure with nested `t.test()`:

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from './helper.js'

test('feature', async (t) => {
  const fastify = await build(t)

  await t.test('should do something', async (_t) => {
    // assertions
  })
})
```

- `build(t)` from `test/helper.js` returns a configured Fastify instance with sensible, mongodb, and crud registered
- Cleanup is automatic via `t.after()` in the helper (drops test DB, closes Fastify)
- Use `await` before `t.test()` for sequential subtests (tests share state)

## Plugin Development

- Wrap with `fastify-plugin` to break encapsulation:
  ```js
  export default fp(fastifyMongoCrud, {
    fastify: '>=2.x',
    name: 'fastify-mongo-crud',
    decorators: { fastify: ['httpErrors', 'mongo'] },
    dependencies: ['@fastify/sensible', '@fastify/mongodb']
  })
  ```
- Use `fastify.decorate()` to add properties to the Fastify instance
- Synchronous plugins call `next()` when done

## CRUD Behavior Notes

- `create()` mutates the passed data object (adds `created` timestamp, `_id`)
- `update()` uses `$set` + `$currentDate` for `modified`; upserts by default
- `read()` / `findOne()` throw 404 (`NotFoundError`) when not found
- `delete()` throws 404 when not found
- `list()` returns empty array when nothing matches (no error)

## CI/CD

- Tests run on Node.js 20, 22, 24 via GitHub Actions
- CI runs on push to `main`/`legacy` and PRs to those branches
- Coverage uploaded to Coveralls
- Dependabot PRs auto-merge after tests pass
- No pre-commit hooks (husky/lint-staged were removed)

## File Structure

```
├── index.js              # Main plugin (single file, ~77 lines)
├── eslint.config.js      # ESLint flat config (@antfu/eslint-config)
├── test/
│   ├── crud.test.js      # Full CRUD test suite
│   ├── helper.js         # Test setup: build(t) helper
│   └── noop.test.js      # Sanity check for test runner
├── examples/
│   └── plain-fastify/    # Example Fastify app with CRUD routes
└── services/
    └── .compose/         # MongoDB docker-compose for local dev
```

## Common Pitfalls

1. **No CommonJS** — `require()` will fail; use ESM imports only
2. **Include `.js` extension** — required for all local ESM imports
3. **No semicolons** — enforced by ESLint
4. **No trailing commas** — enforced by `style/comma-dangle` rule
5. **MongoDB required** — tests fail without a local MongoDB instance
6. **pnpm only** — npm/yarn blocked by preinstall script
