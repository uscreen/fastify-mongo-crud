# AGENTS.md

This document provides guidelines for AI coding agents working on the `@uscreen.de/fastify-mongo-crud` project.

## Project Overview

A tiny MongoDB decorator for Fastify providing CRUD-style database methods. This is an ESM-only package that requires Fastify >= 2.x and integrates with `@fastify/mongodb` and `@fastify/sensible`.

## Build, Lint, and Test Commands

### Package Manager
This project uses **pnpm** exclusively. The `preinstall` script enforces this.

```bash
pnpm install                    # Install dependencies
```

### Testing
```bash
pnpm test                       # Run all tests with spec reporter
pnpm test:cov                   # Run tests with coverage (html + text)
pnpm test:ci                    # Run tests with coverage for CI (lcov + text)
make test                       # Alternative: run tests via Makefile
make test.coverage              # Alternative: run tests with coverage

# Run a single test file
node --test test/crud.test.js
node --test test/noop.test.js

# Run tests with specific reporter
node --test --test-reporter spec test/crud.test.js
```

**Test Requirements:**
- Tests require MongoDB running locally on `127.0.0.1:27017` (default)
- Set `mongoServer` environment variable to override: `mongoServer=localhost:27018 pnpm test`
- Tests use Node.js built-in test runner (`node:test`)
- Each test creates a unique database using `ulid` to avoid conflicts
- Test helper automatically cleans up test databases after completion

### Linting
```bash
pnpm lint                       # Run ESLint with auto-fix
```

ESLint will automatically fix issues where possible. Pre-commit hooks run lint-staged on changed files.

## Code Style Guidelines

### ESLint Configuration
The project extends `@uscreen.de/eslint-config-prettystandard-node` which combines:
- **standard** (JavaScript Standard Style)
- **prettier** (opinionated formatting)

### Prettier Rules
- **No semicolons** (`semi: false`)
- **Single quotes** for strings (`singleQuote: true`)
- **No trailing commas** (`trailingComma: 'none'`)
- **Bracket spacing** enabled (`bracketSpacing: true`)
- **2-space indentation** (from .editorconfig)

### Imports
- Use **ESM imports** only (no CommonJS)
- Import Node.js built-ins with `node:` prefix:
  ```js
  import { test } from 'node:test'
  import assert from 'node:assert/strict'
  ```
- Group imports logically: Node built-ins → external packages → local modules
- Use relative paths with `.js` extension for local imports:
  ```js
  import crud from '../index.js'
  import { build } from './helper.js'
  ```

### Naming Conventions
- **camelCase** for variables, functions, and methods
- **PascalCase** for classes (e.g., `ObjectId`, `Fastify`)
- **lowercase** for file names with hyphens for multi-word names (e.g., `crud.test.js`)
- Prefix unused test parameters with underscore: `(_t) => { ... }`

### Functions and Arrow Functions
- Use traditional functions for plugin definitions:
  ```js
  const fastifyMongoCrud = (fastify, opts, next) => { ... }
  ```
- Use arrow functions for callbacks and short functions:
  ```js
  const uuid = (prefix = '') => { ... }
  ```
- No space before function parentheses (handled by prettier)

### Async/Await
- Prefer `async/await` over promises and callbacks
- Always use `await` for database operations:
  ```js
  const result = await collection.findOne(query)
  ```

### Error Handling
- Use `fastify.httpErrors` from `@fastify/sensible` for HTTP errors:
  ```js
  throw fastify.httpErrors.notFound()
  ```
- Check results before throwing errors:
  ```js
  if (result) return result
  throw fastify.httpErrors.notFound()
  ```
- Use try-catch in tests to verify error handling:
  ```js
  let thrown = false
  try {
    await accounts.read(unknownId)
  } catch (error) {
    thrown = true
    assert.equal(error.name, 'NotFoundError')
    assert.equal(error.statusCode, Number(404))
  }
  assert.ok(thrown)
  ```

### Object Construction
- Use `Object.assign()` to add fields to objects:
  ```js
  Object.assign(data, { created: new Date() })
  ```
- Use object shorthand when possible
- Prefer destructuring for extracting values

### Types and JSDoc
- No TypeScript in this project (pure JavaScript)
- Use JSDoc comments for complex functions if needed
- Keep comments minimal and focused on "why" not "what"

### Testing Patterns
- Use Node.js built-in test runner with nested tests:
  ```js
  await t.test('feature()', async (t) => {
    await t.test('should do something', async (_t) => {
      // test code
    })
  })
  ```
- Use `node:assert/strict` for assertions
- Test helper provides `build(t)` function that returns configured Fastify instance
- Always register cleanup with `t.after()` for database cleanup

### Plugin Development
- Wrap plugins with `fastify-plugin`:
  ```js
  export default fp(fastifyMongoCrud, {
    fastify: '>=2.x',
    name: 'fastify-mongo-crud',
    decorators: { fastify: ['httpErrors', 'mongo'] },
    dependencies: ['@fastify/sensible', '@fastify/mongodb']
  })
  ```
- Use `fastify.decorate()` to add properties to Fastify instance
- Call `next()` callback after synchronous plugin setup

## Git Workflow

### Pre-commit Hooks
- **husky** runs pre-commit hooks
- **lint-staged** automatically lints changed JavaScript files
- ESLint auto-fixes issues before commit

### CI/CD
- Tests run on Node.js versions: 20, 22, 24
- CI runs on push to `main` and `legacy` branches and PRs
- Coverage reports uploaded to Coveralls
- Dependabot PRs auto-merge after tests pass

## File Structure

```
├── index.js              # Main plugin implementation
├── test/
│   ├── crud.test.js      # Main CRUD functionality tests
│   ├── helper.js         # Test setup and utilities
│   └── noop.test.js      # Basic test runner validation
├── examples/
│   └── plain-fastify/    # Example application
└── services/
    └── .compose/         # MongoDB docker-compose setup
```

## Common Pitfalls

1. **Don't use CommonJS** - This is an ESM-only package
2. **Don't forget .js extensions** - Required for ESM imports
3. **Don't use semicolons** - Prettier removes them
4. **Don't forget MongoDB** - Tests require MongoDB running locally
5. **Don't use npm or yarn** - Only pnpm is allowed

## Additional Notes

- This package modifies data in-place (e.g., adding `created` timestamp to passed object)
- CRUD operations automatically add timestamps: `created` on insert, `modified` on update
- The `update()` method performs upsert by default (creates if not found)
- The `read()` and `findOne()` methods throw 404 errors for not found
- The `list()` method returns empty array (not error) when nothing found
