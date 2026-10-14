# FuseRift website maintenance

Josh wants to describe changes in plain English and approve the result in chat. Handle the GitHub and Cloudflare steps for him.

- Preserve the existing appearance unless Josh explicitly requests a design change.
- Catalogue facts belong only in data/fusions.json. Release/social destinations belong only in data/site-config.json.
- Do not claim a newly listed Fusion is bundled in the existing installer. Update BUNDLED_FUSION_IDS only for an actual verified release.
- Make future updates on a named branch. Run node tools/build-check.mjs and node tools/test-data.mjs. Open a pull request and present a local preview or clear review summary to Josh.
- Do not merge to main or otherwise publish a future content/release update until Josh explicitly approves that concrete update. A request such as "Add Bully + Skate 3" authorizes preparation, not automatic unreviewed publication. Do not enable auto-merge before his approval.
- Record Josh's approval in the pull request using a brief summary, without private conversation content. Require the passing check before merging. Do not bypass branch protection.
- After approval, merge the pull request and verify Cloudflare's automatic deployment, changed public pages and any affected download URL. Explain only actions Josh actually needs to take.
- GitHub repository: joshpullin14-alt/fuserift-website. Production branch: main. New Git-connected Cloudflare project: fuserift-website. Existing upload-only project: fuserift.
- Until separate explicit domain-switch approval is received, fuserift.co.uk and www.fuserift.co.uk MUST remain on the existing fuserift project. Do not delete that project, alter its deployment or change its DNS/custom domains.
- This setup's automatic deployment test on fuserift-website.pages.dev is authorized. Domain cutover is not yet authorized. After a future approved cutover, update this note to reflect the verified state, preserving the old project for rollback.
- Keep hosting static and within the free plan. No paid services, upgrades, new domains or installer binaries in this repository.
