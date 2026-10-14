# FuseRift website — review copy

This is the existing FuseRift website, refactored without a visual redesign. **These changes have not been published.** The live website and installer remain unchanged. Do not connect a deployment or push this revision to a connected production branch until Josh has reviewed it.

The website is plain HTML, CSS and browser JavaScript. Node.js is used only to generate the files before hosting. There is no database, server, paid CMS or runtime service. All 14 existing page URLs, artwork, mobile styles and working installer links are preserved.

## The three-step way to add a Fusion

1. Put its artwork in `assets/images/`, for example `new-fusion.jpg`.
2. Open `data/fusions.json`. Copy one existing entry, paste it after the last entry (with a comma between entries), and edit it using the guide below. Give it a unique `id`, `slug` and `order`.
3. From this project folder run **`node tools/build-check.mjs`**. A successful run ends with `CHECK PASS`. It builds the Home cards, catalogue, detail pages, search filters, metadata and sitemap together. It does not publish anything.

Then double-click **Preview Website.cmd** to review at http://127.0.0.1:4173/. Keep its window open; Ctrl+C stops it. Node.js 22 or newer is required. No packages need installing. Do not open the old root HTML files: the complete generated website is in `dist/`.

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
| `LATEST_VERSION` | Exact public Fusion/FuseRift launcher version. Currently `0.1.8.9`. |
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

`npm run build` and `npm test` are equivalent convenience commands; no dependencies are required. CSS and artwork are unchanged. Build-derived cache versions prevent stale browser config after future releases.

## GitHub and Cloudflare Pages — prepare now, enable only after review

**Current state:** the live `fuserift` Cloudflare project uses Direct Upload. No GitHub connection, repository push, custom-domain change or deployment was made for this refactor.

Cloudflare does not allow converting an existing Direct Upload project to native Git integration. The native Git-connected route therefore needs a new Pages project. Keep the current project available for rollback. Do not delete it or buy another domain. Official instructions:

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/

### One-time setup AFTER Josh approves this revision

1. Create a separate GitHub repository for this website (suggested name `fuserift-website`). Put this project folder's contents at its root. Do not use the launcher source repository or put installer binaries in it. `dist/` is generated and ignored by Git.
2. Review the initial revision locally before pushing it. Do not connect Cloudflare while this revision is awaiting review: connecting and selecting Save and Deploy publishes a site.
3. In Cloudflare go to Workers & Pages → Create application → Pages → Connect to Git. Select only the website repository. Choose an available new project name, e.g. `fuserift-site` if available. The existing `fuserift` project remains untouched during setup.
4. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework | None |
   | Production branch | `main` |
   | Root directory | Repository root (leave blank) |
   | Build command | `node tools/build-check.mjs` |
   | Build output directory | `dist` |
   | Node version | `22` (`.nvmrc` is supplied) |

5. Disable automatic preview-branch deployments if unreviewed changes must never be published at any public preview URL. Keep production builds enabled for `main`.
6. On GitHub require pull requests and passing `Website checks / check` before merging to `main`, and require review where your repository plan supports it. Do not allow ordinary direct pushes to `main`. If review enforcement is unavailable for your repository/plan, Josh must explicitly approve before merging; Cloudflare does not decide whether a change is approved.
7. After the approved initial build succeeds, check every existing page and the installer link at the new Pages URL. Only then move `fuserift.co.uk` and `www.fuserift.co.uk` from the old project's Custom domains to the new project's Custom domains using Cloudflare's flow. Save the old project/domain/DNS settings first and verify both names and HTTPS afterward. This domain cutover is a separate reviewed action, not part of this refactor.
8. Keep the original project and deployment for rollback. If cutover fails, reattach the domains to the original project; for later content mistakes, roll back to a known-good deployment and revert the bad Git commit so a future build does not reintroduce it.

Once connected, merging an approved change to `main` automatically runs the build/check command and republishes the static website. Do not add a second deployment workflow. The included GitHub Actions workflow only checks pull requests and pushes; it has no deployment credentials or publishing step.

### Josh's normal update after that setup

1. Create an update branch, edit the artwork/JSON and run `node tools/build-check.mjs`.
2. Preview locally; push the update branch and open a pull request.
3. Review the pages and passing checks. Merge to `main` only when approved.
4. Cloudflare builds and publishes automatically. Confirm its build succeeded, then open the changed page on your phone and check any changed download link.

This uses Cloudflare Pages Free with no paid runtime services: £0/month hosting within its free limits (currently 500 builds/month, 20,000 files, 25 MiB maximum per asset). The existing domain still has its separate annual renewal cost. Do not enable paid add-ons. GitHub usage is subject to its free allowance, particularly for private repositories. The installer stays on the existing GitHub release hosting.

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
