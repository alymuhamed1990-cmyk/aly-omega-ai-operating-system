import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/run.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000);

async function readBody(req){
  if(req.method!=='POST') return {};
  return await new Promise(resolve=>{
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',()=>{try{resolve(body?JSON.parse(body):{})}catch{resolve({})}});
  });
}

const server=http.createServer(async(req,res)=>{
  try{
    if(req.url?.startsWith('/api/run')){
      req.body=await readBody(req);
      req.query=Object.fromEntries(new URL(req.url,'http://localhost').searchParams.entries());
      return await handler(req,res);
    }

    const requested=req.url==='/'?'/visualization/operations.html':decodeURIComponent(req.url.split('?')[0]);
    const full=path.normalize(path.join(root,requested));
    if(!full.startsWith(root+path.sep)&&full!==root) return res.writeHead(403).end('Forbidden');
    const data=await fs.readFile(full);
    const ext=path.extname(full);
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data);
  }catch{
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
});

server.listen(port,'0.0.0.0',()=>console.log('Aly Omega Railway runtime listening on '+port));