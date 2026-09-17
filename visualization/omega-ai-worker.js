let pipe=null,loading=null,taskState='';
const MODEL='onnx-community/Qwen2.5-0.5B-Instruct';
function post(type,payload={}){self.postMessage({type,...payload})}
async function load(){
  if(pipe)return pipe;
  if(loading)return loading;
  loading=(async()=>{
    post('status',{message:'AI Worker starting — loading local Qwen 0.5B'});
    const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm');
    env.allowLocalModels=false;env.useBrowserCache=true;
    env.backends.onnx.wasm.numThreads=Math.min(4,self.navigator?.hardwareConcurrency||2);env.backends.onnx.wasm.simd=true;
    pipe=await pipeline('text-generation',MODEL,{device:'wasm',dtype:'q8',progress_callback:p=>post('progress',{progress:p})});
    post('ready',{model:MODEL,device:'WASM CPU'});return pipe;
  })();
  return loading;
}
function clean(text){return String(text||'').replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```$/,'').trim()}
async function generate(prompt,max_new_tokens=420){const p=await load();const out=await p(prompt,{max_new_tokens,do_sample:false,return_full_text:false});return out?.[0]?.generated_text||''}
async function plan(task){
  post('status',{message:'AI Research Planner running in worker'});
  const raw=await generate(`You are Aly Omega, the reasoning brain for Etlaala Travel & Tourism, a Saudi travel agency. Understand the task and prepare a compact research plan. Return ONLY JSON with keys intent, entities, priorities, queries. Task: ${task}`,260);
  let p;try{p=JSON.parse(clean(raw))}catch{p={intent:'supplier research',entities:[],priorities:['first-party source','B2B fit','services','commercial fit'],queries:[]}}
  post('plan',{plan:p});
}
async function evaluate(task,evidence){
  post('status',{message:'AI Evidence Reasoner evaluating real Internet evidence'});
  const ev=String(evidence||'').slice(0,28000);
  const prompt=`You are Aly Omega, an evidence-first research analyst for Etlaala Travel & Tourism. Your job is NOT to guess and NOT to rank suppliers from weak evidence. Evaluate only facts explicitly present in the supplied evidence.
TASK: ${task}
RULES:
1. Never invent prices, contracts, WhatsApp numbers, destinations, ratings, certifications, or services.
2. Separate VERIFIED from NOT VERIFIED.
3. A first-party official website is stronger than a search snippet.
4. Explain why a supplier matches the task using only evidence.
5. If important information is missing, say "Needs verification".
6. Keep each supplier explanation simple and business-readable.
Return ONLY JSON array. For each supplier use exactly: {"company":"","website":"","fit":"","verified_facts":[],"missing_or_verify":[],"confidence":"High|Medium|Low","reason":""}
EVIDENCE:
${ev}`;
  let raw=await generate(prompt,700);let parsed;
  try{parsed=JSON.parse(clean(raw));if(!Array.isArray(parsed))parsed=[]}catch{parsed=[]}
  if(!parsed.length){parsed=[{company:'AI could not structure the evidence',website:'',fit:'Review source evidence directly',verified_facts:[],missing_or_verify:['Local model returned an unstructured response'],confidence:'Low',reason:'No unsupported claim is being made.'}]}
  post('result',{text:JSON.stringify(parsed)});post('status',{message:'AI evaluation complete'});
}
self.onmessage=async e=>{const m=e.data||{};try{if(m.type==='load'){taskState=m.task||'';await load();return}if(m.type==='plan'){taskState=m.task||taskState;await plan(taskState);return}if(m.type==='evaluate'){taskState=m.task||taskState;await evaluate(taskState,m.evidence);return}}catch(err){post('error',{message:String(err?.message||err)})}};
post('status',{message:'AI worker ready — model loads only after RUN'});
