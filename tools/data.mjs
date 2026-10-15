import fs from 'node:fs/promises';
import path from 'node:path';
const fail = message => { throw new Error(message); };
const text = (value,label) => typeof value==='string' && value.trim() ? value : fail(`${label} must be non-empty text`);
const list = (value,label) => Array.isArray(value) && value.length && value.every(x=>typeof x==='string'&&x.trim()) ? value : fail(`${label} must be a non-empty list of text`);
const slug = (value,label) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(value,label)) ? value : fail(`${label} must use lowercase letters, numbers and hyphens`);
const local = value => typeof value==='string' && /^[a-zA-Z0-9_./-]+$/.test(value) && !value.startsWith('/') && !value.split('/').some(p=>p==='..'||p==='.') && !value.includes('//') ? value : fail(`Unsafe local asset path: ${value}`);
export async function loadData(root) {
 const read = async file => JSON.parse((await fs.readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,''));
 const fusions=await read('data/fusions.json'), config=await read('data/site-config.json'), games=await read('data/games.json');
 for(const [id,g] of Object.entries(games)){slug(id,'Game ID');text(g.title,'Game title');text(g.label,'Purchase label');const u=new URL(g.url);if(u.protocol!=='https:'||u.username||u.password||!['store.steampowered.com','www.minecraft.net','www.gog.com','www.xbox.com'].includes(u.hostname))fail('Purchase URL must use an approved official store');}
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(config.SUPPORT_EMAIL))fail('Invalid support email');
 list(config.SUPPORT_ADDRESS,'SUPPORT_ADDRESS');
 if(typeof config.MICROSOFT_STORE_ENABLED!=='boolean')fail('Store enabled must be boolean');
 if(config.MICROSOFT_STORE_ENABLED&&!config.MICROSOFT_STORE_URL)fail('Approved Store URL required');
 if(config.MICROSOFT_STORE_URL&&!['apps.microsoft.com','apps.microsoft.com/store'].includes(new URL(config.MICROSOFT_STORE_URL).hostname))fail('Use an approved Microsoft Store URL');
 if(!Array.isArray(fusions)||!fusions.length)fail('Add at least one Fusion');
 const ids=new Set(),slugs=new Set(),orders=new Set();
 const asset=async value=>{local(value);const info=await fs.stat(path.join(root,value));if(!info.isFile())fail(`Not an asset file: ${value}`);};
 for(const f of fusions){
  list(f.requiredGames,'Required games');if(f.requiredGames.some(id=>!games[id]))fail('Unknown required game');
  slug(f.id,'Fusion ID');slug(f.slug,'Fusion slug');
  if(ids.has(f.id)||slugs.has(f.slug))fail(`Duplicate Fusion ID or slug: ${f.id}`);ids.add(f.id);slugs.add(f.slug);
  for(const key of ['title','games','type','tag','shortDescription','fullDescription','status'])text(f[key],`${f.id}.${key}`);
  if(typeof f.nickname!=='string'||typeof f.featuredTitle!=='string')fail(`${f.id}: nickname and featuredTitle must be strings (empty is allowed)`);
  for(const key of ['requirements','features','steps'])list(f[key],`${f.id}.${key}`);
  for(const key of ['summary','description','notes'])text(f.compatibility?.[key],`${f.id}.compatibility.${key}`);
  if(typeof f.featured!=='boolean'||!Number.isSafeInteger(f.order)||orders.has(f.order))fail(`${f.id}: featured must be true/false and order must be a unique integer`);orders.add(f.order);
  const a=f.artwork;if(!a)fail(`${f.id}: missing artwork`);text(a.alt,'artwork.alt');slug(a.theme,'artwork.theme');
  if(!Number.isSafeInteger(a.width)||!Number.isSafeInteger(a.height)||a.width<1||a.height<1)fail('Artwork needs positive width and height');
  if(!/\.(png|jpe?g|webp)$/i.test(a.src))fail('Use PNG, JPG or WebP artwork');await asset(a.src);
  if(a.webp!==undefined){if(!Array.isArray(a.webp))fail('artwork.webp must be an array');for(const variant of a.webp){if(!Number.isSafeInteger(variant.width)||variant.width<1||!variant.src.endsWith('.webp'))fail('Invalid WebP variant');await asset(variant.src);}}
  if(f.showcase){list(f.showcase.titleLines,'showcase.titleLines');list(f.showcase.descriptionLines,'showcase.descriptionLines');}
 }
 if(fusions.filter(f=>f.showcase).length>1)fail('Only one Fusion can occupy the existing showcase');
 for(const key of ['DOWNLOAD_URL','RELEASE_NOTES_URL','BUG_REPORT_URL','TIKTOK_URL','YOUTUBE_URL','DISCORD_URL','SITE_URL','DONATION_URL','MICROSOFT_STORE_URL']){
  if(typeof config[key]!=='string')fail(`${key} must be a string`);
  if(config[key]){const u=new URL(config[key]);if(u.protocol!=='https:'||u.username||u.password)fail(`${key} must be HTTPS without credentials`);}
 }
 text(config.LATEST_VERSION,'LATEST_VERSION');text(config.DOWNLOAD_PRODUCT,'DOWNLOAD_PRODUCT');
 if(!/^[A-Za-z0-9._-]+\.exe$/.test(config.DOWNLOAD_FILENAME))fail('DOWNLOAD_FILENAME must be a Windows installer filename');
 if(config.DOWNLOAD_URL&&(!Number.isSafeInteger(config.DOWNLOAD_BYTES)||config.DOWNLOAD_BYTES<1||!/^[a-f0-9]{64}$/.test(config.DOWNLOAD_SHA256)))fail('Provide the actual installer byte size and SHA-256');
 if(!Array.isArray(config.BUNDLED_FUSION_IDS)||!config.BUNDLED_FUSION_IDS.length||new Set(config.BUNDLED_FUSION_IDS).size!==config.BUNDLED_FUSION_IDS.length||config.BUNDLED_FUSION_IDS.some(id=>!ids.has(id)))fail('BUNDLED_FUSION_IDS must reference unique existing Fusion IDs');
 if(!Array.isArray(config.HERO_FUSION_IDS)||config.HERO_FUSION_IDS.length!==4||new Set(config.HERO_FUSION_IDS).size!==4||config.HERO_FUSION_IDS.some(id=>!ids.has(id)))fail('HERO_FUSION_IDS must select four distinct catalogue entries');
 await asset(config.SOCIAL_IMAGE);
 if(config.RELEASE_AUDIT){await asset(config.RELEASE_AUDIT);const audit=await read(config.RELEASE_AUDIT);for(const [a,b] of [['version','LATEST_VERSION'],['filename','DOWNLOAD_FILENAME'],['bytes','DOWNLOAD_BYTES'],['sha256','DOWNLOAD_SHA256']])if(audit.release?.[a]!==config[b])fail(`Release audit does not match ${b}; provide the matching audit or set RELEASE_AUDIT to an empty string`);}
 return {fusions:fusions.sort((a,b)=>a.order-b.order),config,games};
}
