<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI

The site must be **responsive** for mobile, tablet, and desktop.

- Mobile-first Tailwind: default = phone, `md` = tablet, `lg` = desktop.
- No horizontal scroll. Nav, cards, KPIs, and the chart stay usable from 320px up.
- Type, padding, and grid columns scale down on small screens; tap targets stay usable.
- Verify layout at ~375px, ~768px, and ~1280px before calling UI work done.

# Tests

Frontend tests are **unit tests** of public contracts. They live in `tests/unit/`.

- **AAA only:** each case is Arrange → Act → Assert. Do not hide the act inside helpers that also assert, except for shared shape checks used after an explicit arrange.
- **Contract, not emulation:** call exported functions and assert return values and shapes. Do not render React, do not use jsdom/happy-dom/Playwright, do not stub HTTP, and do not stand up a database.
- **Node environment:** Vitest runs with `environment: "node"` (`config/vitest.config.mts`).
- Run locally with `npm test`. CI is `.github/workflows/tests.yml`.
