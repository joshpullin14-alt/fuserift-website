// Local preparation only. No network calls or publication.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from './data.mjs';
import { readUpdateFeed } from './update-feed.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [fieldsFile,auditRelative,feedDirectory]=process.argv.slice(2);
if(!fieldsFile||!auditRelative||!feedDirectory||!/^download\/[A-Za-z0-9._-]+\.json$/.test(auditRelative))throw new Error('Usage: node tools/import-release.mjs exported/website-release-fields.json download/matching-release-audit.json exported/update');
const fields=JSON.parse(await fs.readFile(fieldsFile,'utf8'));
const allowed=['LATEST_VERSION','DOWNLOAD_URL','DOWNLOAD_FILENAME','DOWNLOAD_BYTES','DOWNLOAD_SHA256','RELEASE_NOTES_URL'];
if(Object.keys(fields).length!==allowed.length||allowed.some(k=>!Object.hasOwn(fields,k)))throw new Error('Unexpected release fields');
const configPath=path.join(root,'data/site-config.json');
const original=await fs.readFile(configPath,'utf8');
const next={...JSON.parse(original),...fields,RELEASE_AUDIT:auditRelative};
const feed=await readUpdateFeed(feedDirectory,next);
try {
 await fs.writeFile(configPath,JSON.stringify(next,null,2)+'\n');
 await loadData(root);
} catch(error) { await fs.writeFile(configPath,original); throw error; }
await fs.mkdir(path.join(root,'release-feed'),{recursive:true});
await fs.writeFile(path.join(root,'release-feed/latest.json'),feed.bytes);
await fs.writeFile(path.join(root,'release-feed/latest.json.sig'),feed.sig);
await fs.writeFile(path.join(root,'release-feed/public-key.pem'),feed.pem);
console.log('Release fields imported and audit checked locally. Run node tools/build-check.mjs, review, and obtain approval before merging. Nothing published.');
