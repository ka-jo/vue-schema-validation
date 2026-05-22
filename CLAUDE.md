# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`vue-schema-validation` is a Vue 3 composable library that wraps a schema validation library (currently only Yup) and exposes reactive validation state. The public entry point is `useSchemaValidation(options)` in `src/useSchemaValidation.ts`, which returns a reactive `SchemaValidation` object with `value`, `errors`, `isValid`, `isDirty`, `validate()`, `reset()`, and (for object/array/tuple schemas) `fields`.

## Commands

- `pnpm test` — run the Vitest suite, including `.test-d.ts` type-level tests (`--typecheck` is on by default).
- `pnpm test <pattern>` — run a subset, e.g. `pnpm test ObjectValidationHandler`.
- `pnpm test -t "<name>"` — run tests matching a `describe`/`it` name.
- `pnpm bench` — run benchmark suites.

Requires pnpm (see `packageManager` in `package.json`). The `@/*` path alias maps to `src/*` and `tests/*` resolves from the repo root, wired through `vite-tsconfig-paths`.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat: <description>` for new features
- `fix: <description>` for bug fixes
- `refactor: <description>` for non-feature, non-fix changes
- `test: <description>` for test additions or modifications
- `docs: <description>` for documentation changes
- `chore: <description>` for dependency updates and other maintenance

## Architecture

The library is built around two parallel abstraction layers that mirror each other by schema type (`object`, `array`, `tuple`, `primitive`, `unknown`):

**Schema layer (`src/Schema/`)** — abstracts away the validation library. `Schema.create()` dispatches to `YupSchema.create()`, which recursively walks a Yup schema and builds a tree of `Schema` instances. A `Schema` exposes `type`, `fields`, `defaultValue`, and `validate()`/`validateRoot()`. `validateRoot()` validates only the container's own rules (e.g. array length, no-unknown-keys) without recursing into fields — needed to support `abortEarly`. To add another validation library, implement a new `Schema` subclass and branch in `Schema.create()`. Validation failures are normalized into `SchemaValidationError`.

**ValidationHandler layer (`src/ValidationHandler/`)** — owns the reactive state. `ValidationHandler.create()` dispatches on `schema.type` to one of the four handler subclasses. Object/array/tuple handlers create child handlers recursively, one per field. The base class wires the `value` ref as a Vue `customRef` whose `get`/`set` delegate to each subclass's `getValue`/`setValue`, with `_trackValue`/`_triggerValue` driving reactivity manually. `toReactive()` produces the consumer-facing facade object — it carries the handler itself under the `Handler` symbol key (see `src/common.ts`) so a parent handler can reach into a child's handler.

**Composition of state across the tree:** a child field is exposed three ways simultaneously — as its own `SchemaValidation` facade (`fields[key]`), via the parent's `value` ref (a `reactive` object whose entries are the children's `value` refs), and via the parent's `errors` ref. `isValid`/`isDirty` on container handlers are `computed` aggregations over child handlers. Error objects for containers are made iterable via `makeIterableErrorObject` (`src/common.ts`), which flattens all field errors and adds a `$root` property for container-level errors.

**ValueProxy (`src/ValueProxy/`)** — array and tuple values are surfaced through an `ArrayProxy` (`ArrayValueProxy.ts`): a `Proxy` over an array of refs that looks like a plain array to consumers while routing index writes and mutating methods (`push`, `splice`, etc.) through `onUpdate`/`onFieldUpdate` hooks so reactivity and child-handler bookkeeping stay in sync.

## Testing conventions

- Unit tests live in `tests/unit/`, mirroring `src/`. `.test.ts` files are runtime tests; `.test-d.ts` files are type-level tests run under Vitest's typecheck mode.
- Handler tests mock the `Schema` layer with **ts-mockito** rather than constructing real Yup schemas. Mocks live in `tests/fixtures/mocks/`; each exposes `initialize*SchemaMock()` / `reset*SchemaMock()` to call from `beforeEach`/`afterEach`. Pass `instance(mock)` into `Handler.create()`.
- Shared data fixtures: `tests/fixtures/{default,valid,invalid}-data.ts`.
- Custom matchers (`toBeVueRef`, `toBeReactive`, `toBeIterable`, `toBeSchemaValidation`) are defined in `tests/util/` and registered as Vitest `setupFiles` in `vite.config.ts`.
- `tests/sandbox/` is a standalone Vite/Vue app for manual experimentation; it has its own `node_modules` and is not part of the test run.
