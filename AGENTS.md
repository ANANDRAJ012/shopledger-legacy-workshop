# Repository Guidelines

## Project Structure & Module Organization

This is a small CommonJS Express application for point-of-sale orders, inventory, GST pricing, and customer Khata. `server.js` starts the app and mounts routers from `routes/`. Business logic is in `lib/` (`orders.js`, `inventory.js`, `pricing.js`, `ledger.js`, and related helpers). The browser interface is in `public/` (`index.html`, `js/app.js`, and `css/style.css`). `data/db.json` is the local application store; `config.js` contains shop, tax, coupon, and inventory settings. The architecture diagram is in `docs/architecture.svg`. There is no separate tests directory.

## Build, Test, and Development Commands

- `npm start` runs `node server.js` and serves the app at the configured port (3000 by default).
- `npm test` is currently a placeholder that exits with an error; no test framework is configured.

Dependencies are declared in `package.json` and pinned by `package-lock.json`. Do not run install commands unless dependency changes are part of the task.

## Coding Style & Naming Conventions

Follow the existing JavaScript style: CommonJS `require`/`module.exports`, two-space indentation, single-quoted strings, and semicolons. Keep route handlers in `routes/` and reusable business rules in `lib/`. Use descriptive lowercase filenames (for example, `gst-reconciliation` in route names and `inventory.js` for modules). No formatter or linter is configured, so keep changes consistent with nearby code.

## Rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests never touch `data/db.json`.
- Add no dependencies.

## Testing Guidelines

There are no automated tests or coverage requirements in the repository. For changes to order, stock, tax, coupon, or Khata behavior, review the affected route and library code together and describe the scenarios checked in the change summary. Do not treat `npm test` as a passing test suite.

## Commit & Pull Request Guidelines

Recent Git subjects are short, lowercase summaries (for example, `invoice page for accountant`). Use a concise subject that names the user-visible change. PRs should explain the behavior changed, list validation performed, and include a screenshot for browser UI changes. Call out changes to `data/db.json`, tax rules, coupons, or credit handling explicitly.

## Security & Data Notes

The app reads and writes business records in `data/db.json`; avoid replacing sample records unintentionally. Keep real credentials and private customer data out of commits. Review changes to request validation, invoice rendering, and HTML insertion paths carefully because the UI renders data from the store.
