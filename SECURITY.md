# Security policy

## Deployment boundary

This repository builds a static Vite single-page theme for Komari. It does not run React Router framework mode, React Server Components, server actions, SSR, or a router-managed application server.

Secrets, Komari tokens, node credentials, and real server configuration must not be committed. See `SOURCE_OF_TRUTH.md`.

## Dependency audit exception

As of 2026-07-29, `react-router-dom@7.18.2` is the newest available release and fixes the older React Router XSS, redirect, cache-poisoning, and denial-of-service advisories that affected the previous dependency. npm still reports `GHSA-qwww-vcr4-c8h2`, which concerns action execution in React Router RSC mode.

That vulnerable mode is not present in this static SPA deployment. This is a scoped applicability exception, not a claim that the upstream package has no advisory.

Re-evaluate and upgrade immediately when either condition changes:

1. React Router publishes a release fixing the advisory; or
2. this project adopts framework mode, SSR, RSC, server actions, or any server-side Router runtime.

CI must continue to run lint and production build. Dependency audits should report this exception separately from any new moderate, high, or critical finding; new findings are not covered by this document.
