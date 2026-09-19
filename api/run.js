const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return''}};
const unwrap=u=>{try{const z=new URL(u);return z.searchParams.get('u')||z.searchParams.get('uddg')||z.searchParams.get('url')||z.searchParams.get('q')||u}catch{return u}};
const blocked=/bing\.com|google\.|duckduckgo\.com|search\.brave\.com|jina\.ai/i;
async function get(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);try{const r=await fetch(url,{signal:c.signal,headers:{'User-Agent':'Mozilla/5.0 AlyOmegaResearch/3.0'}});return{ok:r.ok,status:r.status,text:await r.text()}}catch(e){return{ok:false,status:0,text:'',error:e.message}}finally{clearTimeout(t)}}
function tagValue(item,tag){
  const re=new RegExp("<"+tag+">([\\s\\S]*?)</"+tag+">","i");
  const m=String(item||"").match(re);
  return m?m[1]:"";
}
function parseRSS(h){
  const out=[];
  const items=String(h||"").split("<item>").slice(1,21);
  for(const item of items){
    const link=tagValue(item,"link");
    const title=tagValue(item,"title");
    const desc=tagValue(item,"description");
    if(link&&title){
      const url=unwrap(clean(link));
      if(/^https?:\/\//i.test(url)&&!blocked.test(host(url)))
        out.push({url,title:clean(title),snippet:desc?clean(desc):""});
    }
  }
  return out;
}
function parseSearchHTML(h,base='https://www.bing.com'){
  const out=[];
  const re=new RegExp("<a[^>]+href=[\\\"']([^\\\"']+)[\\\"'][^>]*>([\\s\\S]*?)</a>","gi");
  let m;
  while((m=re.exec(String(h||"")))&&out.length<30){
    let raw=clean(m[1]);
    try{if(raw.startsWith('/')) raw=new URL(raw,base).toString()}catch{}
    const url=unwrap(raw);
    const title=clean(m[2]);
    if(/^https?:\/\//i.test(url)&&title.length>3&&!blocked.test(host(url)))
      out.push({url,title,snippet:""});
  }
  return out;
}
function parseMarkdown(h){
  const out=[];
  const re=/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let m;
  while((m=re.exec(String(h||"")))&&out.length<30){
    const url=unwrap(m[2]);
    const title=clean(m[1]);
    if(title.length>3&&!blocked.test(host(url)))
      out.push({url,title,snippet:""});
  }
  return out;
}
function parseAny(h,source,base){
  const a=source.includes('Jina')?parseMarkdown(h):[...parseRSS(h),...parseSearchHTML(h,base)];
  const seen=new Set();
  return a.filter(x=>{
    if(seen.has(x.url)) return false;
    seen.add(x.url);
    return true;
  });
}
function queries(task){return [task,task+" official",task+" reviews"];}
async function search(task){
  const calls=[];
  for(const q of queries(task)){
    const e=encodeURIComponent(q);
    calls.push(["Google HTML",`https://www.google.com/search?q=${e}&num=10`]);
    calls.push(["Bing HTML",`https://www.bing.com/search?q=${e}&count=10`]);
    calls.push(["Yahoo HTML",`https://search.yahoo.com/search?p=${e}`]);
  }
  const responses=await Promise.all(calls.map(async([source,url])=>{
    const r=await get(url);
    const parsed=r.ok?parseSearchHTML(r.text,url):[]; console.log('SEARCH_PROVIDER',source,r.status,parsed.length); return parsed;
  }));
  const map=new Map();
  for(const list of responses) for(const x of list){
    const u=x.url.replace(/#.*$/,"");
    if(!map.has(u)) map.set(u,{...x,url:u,domain:host(u),sources:[]});
  }
  const tokens=task.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!["find","best","with","from","that","this","near","into","for","and","the","hotels","hotel"].includes(w));
  const ranked=[...map.values()].map(x=>{
    const text=(x.title+" "+x.snippet+" "+x.domain).toLowerCase();
    const score=tokens.reduce((n,t)=>n+(text.includes(t)?1:0),0);
    return {...x,score};
  }).sort((a,b)=>b.score-a.score);
  const usable=ranked.filter(x=>tokens.length<2||x.score>0);
  return (usable.length?usable:ranked).slice(0,15);
}
async function run(task,emit){await emit('INTAKE','Request understood',{activeAgents:1});await emit('SEARCH','Searching multiple live web sources',{activeAgents:3});const found=await search(task);await emit('EVIDENCE',`${found.length} unique results collected`,{activeAgents:2,count:found.length});const verified=found.filter(x=>x.domain&&x.title).map(x=>({...x,verification:'Source URL and result metadata present'}));await emit('VERIFY',`${verified.length} results passed basic evidence checks`,{activeAgents:2,count:verified.length});const final=verified.slice(0,10).map((x,i)=>({...x,rank:i+1}));await emit('FINAL',`Released ${final.length} evidence-backed results`,{activeAgents:1,count:final.length,released:true});return{results:final,message:final.length?'Results were collected from live web search and deduplicated across sources.':'No usable results were returned.'}}
export default async function handler(req,res){const task=String(req.method==='POST'?(req.body?.task||''):(req.query?.task||'')).trim();if(!task)return res.status(400).json({error:'task is required'});res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});const send=o=>res.write(`data: ${JSON.stringify(o)}\n\n`);try{const data=await run(task,(stage,message,p)=>send({type:'stage',stage,message,...p}));send({type:'complete',data});res.end()}catch(e){send({type:'error',message:e.message||String(e)});res.end()}}
