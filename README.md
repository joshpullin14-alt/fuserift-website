# FuseRift website

This is the existing FuseRift website, refactored without a visual redesign. The automatic version is connected at https://fuserift-website.pages.dev/ using https://github.com/joshpullin14-alt/fuserift-website. Josh authorized setup and testing on this separate address. The original website and custom domains remain unchanged; domain switching requires separate approval.

The website is plain HTML, CSS and browser JavaScript. Node.js is used only to generate the files before hosting. The new community upgrade adds a small Cloudflare Worker and D1 database for ratings and private submissions, using the free plan. All 14 existing page URLs, artwork and installer links remain; Contact and Report a Bug bring the total to 16 pages. This update is local and awaiting approval, not live.

## The three-step way to add a Fusion

1. Put its artwork in `assets/images/`, for example `new-fusion.jpg`.
2. Open `data/fusions.json`. Copy one existing entry, paste it after the last entry (with a comma between entries), and edit it using the guide below. Give it a unique `id`, `slug` and `order`.
3. From this project folder run **`node tools/build-check.mjs`**. A successful run ends with `CHECK PASS`. It builds the Home cards, catalogue, detail pages, search filters, metadata and sitemap together. It does not publish anything.

For the full interactive preview, run `npm ci` once, then `npm run preview` and open http://127.0.0.1:4174/. Keep its window open; Ctrl+C stops it. Node.js 22 or newer is required. Preview Website.cmd also starts this preview. Do not open the old root HTML files: the complete generated website is in `dist/`.

### What each Fusion field means

| Field | What Josh enters |
| --- | --- |
| `id` | Stable unique ID, such as `new-fusion`. Do not reuse another entry's ID. |
| `slug` | The URL segment, e.g. `new-fusion` becomes `/fusions/new-fusion/`. Keep existing slugs to preserve links. |
| `title` | Main title shown in the catalogue and detail page. |
| `nickname` | Optional familiar name, such as `Killcraft` or `PortalCraft`; use `""` if none. Also searchable. |
| `featuredTitle` | Optional Home card title override; `""` uses the main title. Preserves the existing Killcraft Home label. |
| `games` | The two games involved. |
| `type` | Filter category, such as `Combat`. New categories appear automatically. |
| `tag` | Short tagline shown on the detail page. |
| `shortDescription` | Card and introductory description; also used for search and SEO. Plain text. |
| `fullDescription` | The detail page's “What it does” paragraph. Plain text. |
| `status` | Honest status, such as `Experimental` or `Coming soon`. |
| `requiredGames` | IDs from `data/games.json`, which holds official game titles and purchase links. Reuse existing IDs; add a verified official store entry there only for a new game. |
| `requirements` | List of required games, Windows version, storage and other requirements. |
| `compatibility` | `summary`, `description` and `notes`, all plain text. Do not invent tested versions. |
| `features` | List of features. |
| `steps` | List of setup steps. |
| `order` | Unique whole number; lower numbers appear first. Use 10, 20, 30… so there is room between entries. |
| `featured` | `true` for a Home featured card; `false` for catalogue/detail only. |
| `artwork` | Image information below. |
| `showcase` | Optional special Home showcase; only one Fusion may have it. Keep it on the existing Balatro entry unless intentionally changing that content. |

A single image is enough. Replace the copied `artwork` object with this, using the image's actual pixel dimensions and a useful description:

```json
"artwork": {
  "src": "assets/images/new-fusion.jpg",
  "alt": "Describe what the picture shows.",
  "width": 1672,
  "height": 941,
  "theme": "halo"
}
```

Use landscape artwork matching the existing 1672:941 proportions to keep the layout consistent. The original pictures retain their responsive WebP variants. `webp` is optional; remove the copied variants if they belong to a different picture. `theme` is the existing artwork styling label; copying an existing value keeps styling consistent. Do not put HTML in text fields. JSON uses double quotes and does not allow comments or trailing commas.

The Home hero uses the first four entries by `order`. Featured cards use `featured`. The showcase's line breaks live in that Fusion's `showcase.titleLines` and `showcase.descriptionLines`. A new catalogue entry is **not automatically claimed to be in the already-released installer**.

## Change the download, version or social links

Edit **`data/site-config.json`**, then run the same `node tools/build-check.mjs` command.

| Setting | What to enter |
| --- | --- |
| `LATEST_VERSION` | Exact public Fusion/FuseRift launcher version. Currently `0.1.9.0`. |
| `DOWNLOAD_URL` | Real HTTPS URL to the complete Windows installer. Keep large installers on GitHub Releases, outside this website. |
| `DOWNLOAD_FILENAME` | Exact installer filename ending in `.exe`. |
| `DOWNLOAD_BYTES` | Actual whole-number size in bytes, not a rounded MB value. |
| `DOWNLOAD_SHA256` | Actual SHA-256 in lowercase. |
| `DOWNLOAD_PRODUCT` | Public product label; currently Fusion Engine Pro — Experimental Customer Alpha. |
| `RELEASE_NOTES_URL` | HTTPS release notes page. |
| `RELEASE_AUDIT` | Local matching audit JSON path, or `""` if no audit is ready. The build rejects an audit for a different version, filename, size or hash. |
| `BUNDLED_FUSION_IDS` | IDs from `fusions.json` actually included in this installer, in display order. Names are pulled from the catalogue. Do not add a future Fusion here before it is packaged. |
| `BUG_REPORT_URL` | HTTPS support/issue destination, or `""`. |
| `TIKTOK_URL`, `YOUTUBE_URL` | Real HTTPS channel URLs, or `""`. Footer links appear only when configured. |
| `DISCORD_URL` | Optional real HTTPS invitation, or `""`. |
| `SITE_URL` | Primary HTTPS website address ending in `/`. Keep `https://fuserift.co.uk/`. |
| `SOCIAL_IMAGE` | Existing local image for social previews. |

For a new installer: upload it to the release host first, download it back without signing in, and verify its exact size/hash before changing these settings. In PowerShell:

```powershell
(Get-Item .\FusionSetup-NEW-VERSION.exe).Length
(Get-FileHash .\FusionSetup-NEW-VERSION.exe -Algorithm SHA256).Hash.ToLowerInvariant()
```

Changing this website does not package the Windows app or modify any game integration. Never upload just the launcher EXE as if it were a complete installer.

`dist/js/config.js` is generated automatically for browser enhancements. Do not edit it. There is no second manually maintained settings file.

## Build and checks

```text
node tools/build-check.mjs
node tools/test-data.mjs
```

The first command is the normal one-command update: validates JSON, unique IDs/slugs/order, artwork, HTTPS links, installer metadata and audit; generates a clean `dist/`; then checks every local link, page count, featured count, sitemap, download links and Cloudflare asset limits. It stops on failure and publishes nothing. Generated pages contain full content and real download links even without JavaScript. Search/menu enhancements still work in the browser.

The second command is the regression suite. It uses a temporary copy to test adding a sixth Fusion using one image, auto-generated detail/SEO/filter entries, featured selection, unchanged installer contents, stale-page removal, missing artwork, duplicate IDs, unsafe paths/URLs and mismatched release audits. It does not change the live data or publish.

`npm run build` and `npm test` remain convenience commands for the static checks. Run `npm ci` and `npm run check` for all content, signed-feed and community API checks. Browser tests use `npx playwright install chromium`, then `npm run test:browser` with the preview running. Artwork is unchanged; CSS has targeted mobile and community additions. Build-derived cache versions prevent stale browser config after future releases.

## Automatic publishing and approval

Josh can simply ask the assistant to add or change a Fusion. The assistant prepares and tests the change, shows Josh what changed, and waits for approval. After approval, the assistant merges it; Cloudflare automatically rebuilds and publishes. Josh does not need to operate GitHub or Cloudflare for normal updates.

Current setup:

- Repository: https://github.com/joshpullin14-alt/fuserift-website
- Git-connected Cloudflare project: `fuserift-website`
- Test site: https://fuserift-website.pages.dev/
- Production branch: `main`; automatic production builds enabled.
- Framework: None; repository root; build command `node tools/build-check.mjs`; output `dist`; Node 22.
- Automatic preview branch deployments disabled. Draft changes are reviewed locally.
- GitHub requires a pull request, a passing `check`, and an up-to-date branch. Admin bypass, force pushes and branch deletion are disabled.
- Josh is the sole repository owner, so GitHub reviewer approval is not required (an author cannot approve their own request). His approval must instead be obtained in chat and recorded briefly in the pull request, as required by AGENTS.md. Do not merge future content changes without it.
- The Actions workflow checks changes only. Native Cloudflare Git integration handles deployment; no deployment tokens or second publishing workflow are needed.

### Domain switch still awaiting approval

`fuserift.co.uk` and `www.fuserift.co.uk` remain on the original Direct Upload project `fuserift`. Do not switch either domain until Josh approves the tested automatic version. Keep the original project and deployment for rollback; never delete them as part of this migration.

After approval, save current domain/DNS settings, move both custom domains through Cloudflare's supported flow, and verify HTTPS and all pages. If cutover fails, reconnect the original project. For later content mistakes, roll back to a known-good deployment and revert the bad Git commit.

### Assistant's update procedure

1. Create an update branch, edit artwork/JSON, and run both checks shown above.
2. Preview locally and open a pull request with a clear summary and validation.
3. Obtain Josh's approval of that concrete update and record it briefly in the request.
4. Merge only when required checks pass. Confirm Cloudflare automatically builds the merged commit and verify the affected public pages/download.

Hosting remains static on Cloudflare Pages Free, with no paid runtime service. Hosting is £0/month within free limits; the existing domain has its separate annual renewal cost. Installer binaries stay on the existing GitHub Releases host. Do not enable paid add-ons.

## Import a future approved launcher release

The launcher repository's `release/application.json` is the source for future release metadata. Its local exporter produces `website-release-fields.json` and a signed `update/` folder. Do not retype versions or hashes into HTML.

After reviewing the release and copying its matching audit into `download/`, run:

```text
node tools/import-release.mjs <export/website-release-fields.json> download/<matching-audit>.json <export/update>
node tools/build-check.mjs
node tools/test-update-feed.mjs
```

The import checks the manifest signature and matching installer metadata. A configured `release-feed/` is verified again during the build and emitted as `/update/latest.json` and `/update/latest.json.sig`. No feed exists in this revision: the production key and endpoint remain unconfigured. No updater release has been imported or published. Keep the current 0.1.8.9 download unchanged until a new installer is approved and verified.

The updater milestone is on a publication hold. The setup pull request remains open; do not merge or switch custom domains until Josh approves.

## Source map

- `data/fusions.json`: canonical catalogue facts.
- `data/site-config.json`: canonical release, social and destination settings.
- `tools/build.mjs`: shared templates and static generator.
- `tools/data.mjs`: input validation.
- `tools/build-check.mjs`: build and output checks.
- `tools/test-data.mjs`: regression checks in a temporary copy.
- `css/`, `assets/`, `js/main.js`, `js/enable.js`: unchanged design/assets and browser enhancements.
- `download/*.json`: release audit documents, not catalogue data.
- `dist/`: generated website, including all existing pages and sitemap; safe to regenerate.
- `.github/workflows/check.yml`: checks only, no publishing.

Do not edit generated HTML. Keep artwork provenance in ARTWORK.md/content/ARTWORK.md. Historical PUBLISHED.txt describes the previous live release, not approval or publication of this refactor.

## Community, support and purchase settings

See **COMMUNITY-OPERATIONS.md** for the plain-English settings guide, testing and approval-gated setup. `DONATION_URL` stays empty until Josh supplies a donation page. `MICROSOFT_STORE_URL` stays empty and `MICROSOFT_STORE_ENABLED` false until an approved listing exists. `SUPPORT_EMAIL` and `SUPPORT_ADDRESS` contain only the public support/correspondence details. Official purchase links are stored once in `data/games.json`.

The new local preview is http://127.0.0.1:4174/. It includes persistent test ratings and private forms. Publishing the backend requires a free Cloudflare D1 binding and encrypted abuse-prevention secret, handled by Codex after Josh approves. No domain switch is necessary for this upgrade.
