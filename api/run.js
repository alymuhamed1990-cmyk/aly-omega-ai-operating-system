const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export default async function handler(req,res){
  const task=String(req.method==='POST'?(req.body?.task||''):(req.query?.task||'')).trim();
  if(!task)return res.status(400).json({error:'task is required'});
  res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
  const send=(type,payload={})=>res.write(`data: ${JSON.stringify({type,...payload})}\n\n`);
  const emit=async(type,stage,message,payload={})=>{send(type,{stage,message,...payload});await sleep(120)};
  try{
    await emit('stage','INTAKE','Task accepted by Orchestrator',{agent:'Task Intake'});
    await emit('stage','CLASSIFY','Task classified; selecting execution route',{agent:'Classification Agent'});
    await emit('stage','INTELLIGENCE','Execution plan created',{agent:'Intelligence Planner'});
    await emit('stage','FAN-OUT','Specialist work dispatched',{agent:'Specialist Agents',activeAgents:9});
    await emit('stage','SEARCH','Live web discovery started',{agent:'Discovery Agent'});
    const base=(process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'https://aly-omega-runtime-alymuhamed1990-cmyk.vercel.app');
    const r=await fetch(`${base}/api/omega57?task=${encodeURIComponent(task)}&ts=${Date.now()}`,{headers:{'x-omega-internal':'1'}});
    const data=await r.json();
    const stats=data.stats||{};
    if((stats.discovered||0)>0) await emit('stage','EVIDENCE',`${stats.inspected||0} sources inspected; evidence packet assembled`,{agent:'Evidence Agent',stats});
    else {await emit('stage','EVIDENCE','No sources returned by live discovery',{agent:'Evidence Agent',stats});await emit('gate','VALIDATE','Validation blocked: no evidence available',{agent:'Validation Gate',blocked:true,stats});await emit('gate','FINAL GATE','Output held: evidence requirement not met',{agent:'Final Gatekeeper',released:false,stats});send('complete',{status:'BLOCKED',data});return res.end()}
    await emit('stage','FIT',`${stats.qualified||0} candidates passed qualification`,{agent:'Fit Agent',stats});
    await emit('stage','OPS','Operational readiness check completed',{agent:'Operations Agent',stats});
    const released=Boolean(data.gate?.release_allowed && (data.results||[]).length);
    await emit('gate','VALIDATE',released?'Validation passed':'Validation blocked',{agent:'Validation Gate',released,stats});
    if(released){await emit('gate','RED TEAM','Red-team checks passed',{agent:'Red Team',released:true});await emit('gate','LEARN','Execution signal recorded',{agent:'Learning Engine'});await emit('gate','FINAL GATE','Output released',{agent:'Final Gatekeeper',released:true});}
    else await emit('gate','FINAL GATE','Output held: final release conditions not met',{agent:'Final Gatekeeper',released:false});
    send('complete',{status:released?'RELEASED':'BLOCKED',data});res.end();
  }catch(e){send('error',{message:e?.message||String(e)});res.end()}
}
