// A loopback-only preview server. No npm packages and no public listening address.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
const server=http.createServer(async(req,res)=>{
 try {
  if(!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end('Forbidden');}
  if((await fs.stat(file)).isDirectory()) {
   if(!pathname.endsWith('/')) {res.writeHead(301,{'Location':pathname+'/'});return res.end();}
   file=path.join(file,'index.html');
  }
  const content=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
  res.end(req.method==='HEAD'?undefined:content);
 } catch {
  // Redirecting asset paths is avoided; missing files remain actual HTTP 404s.
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':csp});
  res.end(await fs.readFile(path.join(root,'404.html')));
 }
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is already in use. The preview may already be running at http://127.0.0.1:${port}/`:e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`FuseRift local preview: http://127.0.0.1:${port}/\nKeep this window open. Press Ctrl+C to stop. Nothing is published.`));
