import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {readUpdateFeed} from './update-feed.mjs';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'fuserift-feed-'));
try {
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 const config={LATEST_VERSION:'0.1.9.0',DOWNLOAD_URL:'https://github.com/joshpullin14-alt/fuserift-downloads/releases/download/test/setup.exe',DOWNLOAD_FILENAME:'setup.exe',DOWNLOAD_BYTES:20,DOWNLOAD_SHA256:'a'.repeat(64),RELEASE_NOTES_URL:'https://fuserift.co.uk/notes'};
 const m={schemaVersion:1,channel:'alpha',latestVersion:config.LATEST_VERSION,installerUrl:config.DOWNLOAD_URL,installerFileName:config.DOWNLOAD_FILENAME,installerBytes:20,installerSha256:config.DOWNLOAD_SHA256,releaseNotesUrl:config.RELEASE_NOTES_URL,payloadUrl:config.DOWNLOAD_URL.replace('setup.exe','payload.zip'),payloadBytes:20,payloadSha256:'b'.repeat(64),expiresUtc:new Date(Date.now()+86400000).toISOString()};
 await fs.writeFile(path.join(dir,'public-key.pem'),publicKey.export({type:'spki',format:'pem'}));
 async function write(value){const bytes=Buffer.from(JSON.stringify(value));await fs.writeFile(path.join(dir,'latest.json'),bytes);await fs.writeFile(path.join(dir,'latest.json.sig'),sign('sha256',bytes,{key:privateKey,dsaEncoding:'ieee-p1363'}));}
 await write(m);await readUpdateFeed(dir,config);
 await assert.rejects(()=>readUpdateFeed(dir,{...config,LATEST_VERSION:'0.1.8.9'}));
 await fs.appendFile(path.join(dir,'latest.json'),' ');await assert.rejects(()=>readUpdateFeed(dir,config));
 await write({...m,payloadUrl:'https://example.com/evil.exe'});await assert.rejects(()=>readUpdateFeed(dir,config));
 await write({...m,expiresUtc:'2000-01-01T00:00:00Z'});await assert.rejects(()=>readUpdateFeed(dir,config));
 console.log('PASS: valid signature, release mismatch, tampering, disallowed host and expiry checks. Nothing published.');
} finally { await fs.rm(dir,{recursive:true,force:true}); }
