import fs from 'node:fs/promises';
import path from 'node:path';
import { verify, createPublicKey } from 'node:crypto';
export async function readUpdateFeed(directory,config) {
 const bytes=await fs.readFile(path.join(directory,'latest.json'));
 const sig=await fs.readFile(path.join(directory,'latest.json.sig'));
 const pem=await fs.readFile(path.join(directory,'public-key.pem'),'utf8');
 const key=createPublicKey(pem);
 if(bytes.length>65536||sig.length!==64||key.asymmetricKeyDetails?.namedCurve!=='prime256v1'||!verify('sha256',bytes,{key,dsaEncoding:'ieee-p1363'},sig))throw new Error('Update manifest signature rejected');
 const m=JSON.parse(bytes);
 for(const [manifest,site] of [['latestVersion','LATEST_VERSION'],['installerUrl','DOWNLOAD_URL'],['installerFileName','DOWNLOAD_FILENAME'],['installerBytes','DOWNLOAD_BYTES'],['installerSha256','DOWNLOAD_SHA256'],['releaseNotesUrl','RELEASE_NOTES_URL']])if(m[manifest]!==config[site])throw new Error(`Update feed differs from website: ${manifest}`);
 if(m.schemaVersion!==1||m.channel!=='alpha'||!/^\d+\.\d+\.\d+\.\d+$/.test(m.latestVersion)||Date.parse(m.expiresUtc)<=Date.now()||!Number.isFinite(Date.parse(m.expiresUtc)))throw new Error('Invalid/expired update feed');
 for(const name of ['installerUrl','payloadUrl']){const u=new URL(m[name]);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.port||u.username||u.password||u.search||!u.pathname.startsWith('/joshpullin14-alt/fuserift-downloads/releases/download/'))throw new Error('Unapproved release asset URL');}
 if(!/^[a-f0-9]{64}$/.test(m.payloadSha256)||!Number.isSafeInteger(m.payloadBytes)||m.payloadBytes<1)throw new Error('Invalid update payload metadata');
 return {bytes,sig,pem};
}
export async function stageUpdateFeed(root,output,config) {
 const source=path.join(root,'release-feed');
 try{await fs.access(source);}catch(e){if(e.code==='ENOENT')return;throw e;}
 const {bytes,sig}=await readUpdateFeed(source,config);
 await fs.mkdir(path.join(output,'update'),{recursive:true});
 await fs.writeFile(path.join(output,'update/latest.json'),bytes);
 await fs.writeFile(path.join(output,'update/latest.json.sig'),sig);
}
