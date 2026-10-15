# FuseRift community upgrade — preview report

Prepared 15 October 2026 on local branch `feature/community-support`. Nothing has been pushed or deployed. The live site, domains, artwork, Windows installer and signed update feed are unchanged.

## Ready to review

Open http://127.0.0.1:4174/ on this PC. Key pages: `/community/`, `/support/`, `/support/report-bug/`, `/contact/`, `/download/`, and any Fusion detail page.

- Clear independent/unofficial notices, updated Terms and Privacy; solicitor placeholder removed.
- Official required-game purchase links on every Fusion, configured centrally.
- Supplied Discord invitation verified to resolve to the FuseRift server.
- Private bug reports with optional email and small text-log attachment; private Game A + Game B suggestions.
- Shared 1–5 star ratings stored in Cloudflare's local D1 runtime, with signed anonymous cookies, vote updates and rate limits.
- Dedicated support and public correspondence/contact pages.
- Cleaner four-step phone layout, preserved full artwork and a Download button near the top of the mobile Download page.
- Individual Fusion social artwork, canonical URLs and indexable content.
- Donation hidden. Microsoft Store Coming soon. Both are config-controlled.

## Verification

- All 16 pages at 360, 390, 412, 430 and 1440 pixels: 80 checks, no overflow or browser script errors.
- Browser-tested navigation, search/empty state, support accordions, bug submission with log, suggestions, ratings after refresh and from a fresh browser, error messages and preserved failed-form input.
- 32 backend checks: persistence after restart, private storage, atomic abuse limits, malformed/oversized inputs, cross-origin rejection, scheduled retention and graceful storage failure.
- 16 data/build regressions, 104 content/privacy/SEO checks, signed-update-feed regressions passed.
- 15 Windows download buttons retain the real release URL. Downloaded the complete public installer: 105,077,846 bytes, SHA-256 dcdd2b04831226661a8c9ff616d6d5a1386d8a890e0445fff1425c0f0caa23a7.
- Seven official game store pages verified; game identities cross-checked against unchanged recipe manifests.
- Output scan found only the public support email, no developer paths/private keys or solicitor placeholder. Displayed postal details match the user-supplied correspondence address.
- Dependency audit reported no known vulnerabilities after patched development overrides. No runtime npm dependencies are shipped to Pages.
- Local test submissions and ratings cleared before handover. No test data will be copied to production.

## Still intentionally pending

- Publication approval, then provision the free Cloudflare Worker/D1 binding and secret and verify the real production routes. Local tests are not a claim that the production backend is already connected.
- Public HTTPS donation-page URL when Josh sets one up.
- Approved Microsoft Store listing URL when available; no fabricated listing.
- Mail links work; mailbox delivery has not been tested. The site stores bug reports privately for support review, without automatic email notifications.
- Launcher diagnostics export is outside this website-only update. The site describes the existing control if available and accepts text logs or directs larger archives to support email.

Screenshots are in `qa-results/`. See `COMMUNITY-OPERATIONS.md` for setup, private report retrieval, retention and rollback. No DNS/domain switch is needed.
