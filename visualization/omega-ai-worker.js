let pipe=null;
const MODEL='onnx-community/Qwen2.5-0.5B-Instruct';
function post(type,payload={}){self.postMessage({type,...payload})}
async function load(){
  if(pipe)return pipe;
  post('status',{message:'AI Worker starting — loading local Qwen 0.5B'});
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm');
  env.allowLocalModels=false;
  env.useBrowserCache=true;
  env.backends.onnx.wasm.numThreads=Math.min(4,self.navigator?.hardwareConcurrency||2);
  env.backends.onnx.wasm.simd=true;
  pipe=await pipeline('text-generation',MODEL,{device:'wasm',dtype:'q8',progress_callback:p=>post('progress',{progress:p})});
  post('ready',{model:MODEL,device:'WASM CPU'});
  return pipe;
}
function clean(text){return String(text||'').replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```$/,'').trim()}
async function generate(prompt,max_new_tokens=420){
  const p=await load();
  const out=await p(prompt,{max_new_tokens,do_sample:false,return_full_text:false});
  return out?.[0]?.generated_text||'';
}
self.onmessage=async e=>{
  const {type,task,evidence}=e.data||{};
  if(type!=='run')return;
  try{
    post('status',{message:'AI Research Planner running in worker'});
    const planRaw=await generate(`You are Aly Omega, the local reasoning brain for Etlaala Travel & Tourism, a Saudi travel agency. Understand this task and create a compact research plan. Return ONLY JSON with keys intent, entities, priorities, queries. Task: ${task}`,260);
    let plan;
    try{plan=JSON.parse(clean(planRaw))}catch{plan={intent:'supplier research',entities:[],priorities:['first-party source','B2B fit','services','commercial fit'],queries:[]}}
    post('plan',{plan});
    post('status',{message:'AI Evidence Reasoner evaluating real Internet evidence'});
    const ev=String(evidence||'').slice(0,30000);
    const result=await generate(`You are Aly Omega Evidence Reasoner for Etlaala Travel & Tourism. Evaluate ONLY the supplied Internet evidence; do not invent facts. Task: ${task}\nEvidence:\n${ev}\nReturn a concise decision-oriented result with: Summary, Fit for Etlaala, Evidence by supplier, Risks/verification needed, Next action. Explicitly distinguish verified evidence from assumptions.`,520);
    post('result',{text:result});
    post('status',{message:'AI evaluation complete'});
  }catch(err){post('error',{message:String(err?.message||err)})}
};
post('status',{message:'AI worker ready — model loads only after RUN'});
