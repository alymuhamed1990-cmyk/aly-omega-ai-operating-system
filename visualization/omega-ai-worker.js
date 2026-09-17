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
  const raw=await generate(`You are Aly Omega, the local reasoning brain for Etlaala Travel & Tourism, a Saudi travel agency. Understand this task and create a compact research plan. Return ONLY JSON with keys intent, entities, priorities, queries. Task: ${task}`,260);
  let p;try{p=JSON.parse(clean(raw))}catch{p={intent:'supplier research',entities:[],priorities:['first-party source','B2B fit','services','commercial fit'],queries:[]}}
  post('plan',{plan:p});
}
async function evaluate(task,evidence){
  post('status',{message:'AI Evidence Reasoner evaluating real Internet evidence'});
  const ev=String(evidence||'').slice(0,30000);
  const result=await generate(`You are Aly Omega Evidence Reasoner for Etlaala Travel & Tourism. Evaluate ONLY the supplied Internet evidence; do not invent facts. Task: ${task}\nEvidence:\n${ev}\nReturn a concise decision-oriented result with: Summary, Fit for Etlaala, Evidence by supplier, Risks/verification needed, Next action. Explicitly distinguish verified evidence from assumptions.`,520);
  post('result',{text:result});post('status',{message:'AI evaluation complete'});
}
self.onmessage=async e=>{
  const m=e.data||{};
  try{
    if(m.type==='load'){taskState=m.task||'';await load();return}
    if(m.type==='plan'){taskState=m.task||taskState;await plan(taskState);return}
    if(m.type==='evaluate'){taskState=m.task||taskState;await evaluate(taskState,m.evidence);return}
  }catch(err){post('error',{message:String(err?.message||err)})}
};
post('status',{message:'AI worker ready — model loads only after RUN'});
