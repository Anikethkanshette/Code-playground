# Code Playground 🎛️ — Interactive, Shareable, Embeddable

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge)](https://codeplayground.aniketh.info/)
[![Release](https://img.shields.io/github/v/release/Anikethkanshette/code-playground?style=for-the-badge)](https://github.com/Anikethkanshette/code-playground/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Anikethkanshette/code-playground/ci.yml?branch=main&style=for-the-badge)](https://github.com/Anikethkanshette/code-playground/actions)
[![Stars](https://img.shields.io/github/stars/Anikethkanshette/code-playground?style=social)](https://github.com/Anikethkanshette/code-playground/stargazers)

A polished, lightweight, and extensible in-browser code playground for prototyping, demos, tutorials, and documentation. Run, edit, preview, and share snippets with a single click — built with developer ergonomics and security in mind.

Live demo: https://codeplayground.aniketh.info/ 🚀

---

Why this project exists
- Teach & demo faster: embed runnable examples directly alongside docs or blog posts.
- Prototype quickly: edit, run, and iterate with instant preview and hot reload.
- Share confidently: generate permalinks, export to Gist or ZIP, and embed snippets anywhere.

Hero preview
- Try the live playground: https://codeplayground.aniketh.info/
- GIF/screenshots (replace these placeholders with actual images in /docs/assets):
  - Hero GIF: docs/assets/hero.gif
  - Multi-file tabs: docs/assets/multifile.png
  - Share modal: docs/assets/share.png

Key features
- Modern editor: Monaco (default) with optional CodeMirror support
- Multi-file workspaces (JS/TS/HTML/CSS + assets)
- Secure in-browser execution via iframe sandboxing and CSP
- Shareable permalink, GitHub Gist export, ZIP download
- Embeddable iframe widget with configurable height & theme
- Theming (light/dark), keyboard shortcuts, accessibility-first UI
- Extensible runtime and plugin API (linters, formatters, custom runtimes)
- CLI scaffolding for snippet templates

Quick start — local development
Prerequisites
- Node.js LTS (>= 18), npm/yarn/pnpm

Get started
```bash
git clone https://github.com/Anikethkanshette/code-playground.git
cd code-playground
npm install
npm run dev          # start dev server (http://localhost:3000)
npm run build        # production build
npm run preview      # preview production build locally
```

Docker
```bash
docker build -t code-playground:latest .
docker run -p 3000:3000 code-playground:latest
```

Try example snippets
- Open the playground and paste:
```js
// Hello World
console.log('Hello from Code Playground!');
```
- TypeScript:
```ts
const greet = (name: string) => `Hello, ${name}!`;
console.log(greet('Aniketh'));
```

Embedding examples
Embed a single snippet:
```html
<iframe
  src="https://codeplayground.aniketh.info/embed/<SNIPPET_ID>?theme=dark&height=520"
  width="100%"
  height="520"
  title="Code Playground snippet">
</iframe>
```

Embed a read-only example:
```html
<iframe
  src="https://codeplayground.aniketh.info/embed/<SNIPPET_ID>?mode=readonly"
  width="100%"
  height="420"
  title="Read-only example">
</iframe>
```

Runtime API (server-side or internal usage)
```ts
import { runSnippet } from 'code-playground-runtime';

const result = await runSnippet({
  files: [{ path: 'index.js', content: 'console.log("hello")' }],
  timeoutMs: 3000,
  env: { NODE_ENV: 'test' }
});

console.log(result.output);
```

Security & best practices
- Default execution: iframe with sandbox attributes + strict CSP.
- Sanitize any user-supplied HTML and limit network access for untrusted code.
- For server-side execution, enforce CPU/memory/time quotas and isolate execution environments.
- Require authentication & auditing for exporting or persisting user code to external services.

Project structure (high-level)
- /src — application source
  - /components — UI components
  - /editor — editor adapters + helpers
  - /runtimes — iframe & server runtime implementations
  - /hooks, /utils, /services
- /public — static assets
- /docs — documentation, screenshots, guides
- /tests — unit & e2e tests
- package.json, vite.config.ts, Dockerfile, .github/workflows

Testing & CI
- Unit tests: Jest
- E2E tests: Playwright
- CI: GitHub Actions runs lint, tests, and build on PRs

Deployment
- Static frontend only: Vercel / Netlify
- Full-stack with server runtime: Render, DigitalOcean App Platform, or any Docker host
- Example: Vercel — connect repo, set env vars, push — automatic deploy

Configuration & environment
.example .env
```
PORT=3000
NODE_ENV=development
GIST_TOKEN=ghp_xxxxxxx   # optional for Gist export
SANDBOX_POLICY=strict
```

Contributing
We welcome contributions of all sizes. To get started:
1. Fork the repo and create a feature branch.
2. Follow code style, add tests, and update docs.
3. Run the test suite: npm run test
4. Open a PR with a clear description and linked issues.

See CONTRIBUTING.md for detailed workflow, commit conventions, and code reviews.

Code of Conduct
This project follows the Contributor Covenant. Be kind and collaborative. See CODE_OF_CONDUCT.md.

Roadmap highlights
- Collaborative editing (live cursors)
- Plugin marketplace (runtimes & formatters)
- Account-based snippet collections & favorites
- Server-side secure runtimes with billing/quotas

License
MIT — see LICENSE.

Contact & support
- Live playground: https://codeplayground.aniketh.info/
- Issues & feature requests: https://github.com/Anikethkanshette/code-playground/issues
- Maintainer: Anikethkanshette (https://github.com/Anikethkanshette)

Acknowledgements
Built with ❤️ using Monaco, Vite, esbuild, Playwright, Jest, and sponsorship from the open source community.

---

Quick checklist to ship a polished repo:
- [ ] Replace GIF/screenshot placeholders in /docs/assets
- [ ] Add deploy badge (Vercel/Netlify) and coverage badge
- [ ] Add CONTRIBUTING.md and CODE_OF_CONDUCT.md if missing
- [ ] Add templates for issues and PRs (.github/ISSUE_TEMPLATE, PULL_REQUEST_TEMPLATE)

Thank you for building and sharing developer tools — happy prototyping and teaching!
