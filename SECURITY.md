# Security policy

## Deployment boundary

This repository builds a static Vite single-page theme for Komari. It does not run React Router framework mode, React Server Components, server actions, SSR, or a router-managed application server.

Secrets, Komari tokens, node credentials, and real server configuration must not be committed. See `SOURCE_OF_TRUTH.md`. The maintainer checkout installs the canonical local PEM/token pre-commit scanner; GitHub push protection is an additional server-side layer, not a substitute for the local scanner.

## Dependency audit guard

`react-router-dom@7.18.2` fixes the older React Router XSS, redirect, cache-poisoning, and denial-of-service advisories that affected the previous dependency. npm previously reported `GHSA-qwww-vcr4-c8h2`, which concerns action execution in React Router RSC mode; as of 2026-08-23, a fresh `npm audit` reports zero vulnerabilities.

That vulnerable mode is not present in this static SPA deployment. The dependency audit guard retains a narrowly scoped regression test for that exact advisory shape, while rejecting every other moderate, high, or critical finding and any changed dependency chain. This is not a general React Router allowlist.

Re-evaluate and upgrade immediately when either condition changes:

1. React Router publishes a release fixing the advisory; or
2. this project adopts framework mode, SSR, RSC, server actions, or any server-side Router runtime.

CI must continue to run lint, the dependency audit guard, production build, and CodeQL default setup. New moderate, high, or critical findings are not covered by this document.
