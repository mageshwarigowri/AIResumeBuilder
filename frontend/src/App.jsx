import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Download, FileText, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react"

const templates = [
  {id:"modern",name:"Modern",tag:"Most popular",desc:"Bold, balanced and built for clarity.",color:"#6d5dfc"},
  {id:"classic",name:"Classic",tag:"ATS friendly",desc:"Timeless structure with editorial polish.",color:"#19324d"},
  {id:"minimal",name:"Minimal",tag:"Clean focus",desc:"Quiet confidence with generous space.",color:"#dc5b3e"},
]
const emptyJob = {company:"",role:"",startDate:"",endDate:"",description:""}
const initial = {fullName:"",email:"",phone:"",location:"",linkedin:"",targetRole:"",skills:"",experience:[{...emptyJob}],education:[{school:"",degree:"",year:""}]}

function TemplateMini({template,selected}){
  return <div className={'mini '+template.id} style={{"--accent":template.color}}>
    <div className="mini-head"><span></span><i></i></div>
    <div className="mini-body"><div className="mini-side"><b></b><i></i><i></i><i></i></div><div className="mini-main"><b></b><i></i><i></i><b></b><i></i><i></i><b></b><i></i></div></div>
    {selected&&<div className="selected-check"><Check size={16}/></div>}
  </div>
}

function Resume({data,template}){
  const t = templates.find(x=>x.id===template)
  return <article className={'resume '+template} style={{"--accent":t.color}}>
    <header>
      <h1>{data.fullName}</h1><p className="role">{data.targetRole}</p>
      <div className="contact">{[data.email,data.phone,data.location,data.linkedin].filter(Boolean).map((x,i)=><span key={i}>{x}</span>)}</div>
    </header>
    <div className="resume-content">
      {data.summary&&<section><h2>Profile</h2><p>{data.summary}</p></section>}
      {data.experience?.some(x=>x.company)&&<section><h2>Experience</h2>{data.experience.filter(x=>x.company).map((job,i)=><div className="entry" key={i}><div className="entry-head"><div><h3>{job.role}</h3><strong>{job.company}</strong></div><time>{job.startDate}{job.startDate&&job.endDate?" — ":""}{job.endDate}</time></div><ul>{(job.bullets||[]).map((b,j)=><li key={j}>{b}</li>)}</ul></div>)}</section>}
      {data.education?.some(x=>x.school)&&<section><h2>Education</h2>{data.education.filter(x=>x.school).map((ed,i)=><div className="entry-head education" key={i}><div><h3>{ed.degree}</h3><strong>{ed.school}</strong></div><time>{ed.year}</time></div>)}</section>}
      {data.skills?.length>0&&<section><h2>Skills</h2><div className="skill-list">{data.skills.map((s,i)=><span key={i}>{s}</span>)}</div></section>}
    </div>
  </article>
}

function Field({label,required,...props}){return <label className="field"><span>{label}{required&&<em>*</em>}</span><input required={required} {...props}/></label>}

export default function App(){
  const [step,setStep]=useState(1)
  const [template,setTemplate]=useState("modern")
  const [form,setForm]=useState(initial)
  const [result,setResult]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState("")
  const selected=templates.find(t=>t.id===template)
  const update=(key,value)=>setForm(f=>({...f,[key]:value}))
  const updateList=(key,index,field,value)=>setForm(f=>({...f,[key]:f[key].map((x,i)=>i===index?{...x,[field]:value}:x)}))
  const add=(key,blank)=>setForm(f=>({...f,[key]:[...f[key],{...blank}]}))
  const remove=(key,index)=>setForm(f=>({...f,[key]:f[key].filter((_,i)=>i!==index)}))

  async function submit(e){
    e.preventDefault(); setLoading(true); setError("")
    try{
      const res=await fetch("/api/generate/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,template})})
      const body=await res.json()
      if(!res.ok) throw new Error(body.error||"Could not generate your resume.")
      setResult(body.resume); setStep(3); window.scrollTo({top:0,behavior:"smooth"})
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }

  return <div className="app">
    <nav><a className="brand" href="#" onClick={()=>setStep(1)}><span><FileText size={19}/></span>CareerCanvas</a><div className="nav-note"><Sparkles size={15}/> AI-powered resume studio</div></nav>
    <div className="progress" aria-label="Progress">{["Choose a style","Add your story","Your resume"].map((x,i)=><div className={(step>=i+1?"active ":"")+(step===i+1?"current":"")} key={x}><span>{step>i+1?<Check size={14}/>:i+1}</span><p>{x}</p>{i<2&&<i/>}</div>)}</div>

    {step===1&&<main className="choose">
      <div className="eyebrow"><WandSparkles size={15}/> STEP 1 OF 3</div>
      <h1>Start with a style<br/>that feels like <em>you.</em></h1>
      <p className="lede">Choose a professionally designed template. You can focus on your story—we’ll handle the polish.</p>
      <div className="template-grid">{templates.map(t=><button className={'template-card '+(template===t.id?"selected":"")} onClick={()=>setTemplate(t.id)} key={t.id}>
        <TemplateMini template={t} selected={template===t.id}/>
        <div className="template-meta"><div><h2>{t.name}</h2><span>{t.tag}</span></div><p>{t.desc}</p></div>
      </button>)}</div>
      <button className="primary" onClick={()=>{setStep(2);window.scrollTo(0,0)}}>Use {selected.name} template <ArrowRight size={18}/></button>
    </main>}

    {step===2&&<main className="builder">
      <aside><button className="back" onClick={()=>setStep(1)}><ArrowLeft size={16}/> Change template</button><TemplateMini template={selected}/><h3>{selected.name}</h3><p>{selected.desc}</p><div className="tip"><Sparkles size={17}/><div><b>AI writing assistant</b><p>Share the facts. We’ll sharpen the language and tailor it to your target role.</p></div></div></aside>
      <form onSubmit={submit}>
        <div className="form-head"><div className="eyebrow">STEP 2 OF 3</div><h1>Tell us about yourself.</h1><p>Start with the essentials. You stay in control of every detail.</p></div>
        <fieldset><legend>Personal details</legend><div className="fields two"><Field label="Full name" required placeholder="e.g. Jordan Lee" value={form.fullName} onChange={e=>update("fullName",e.target.value)}/><Field label="Target role" required placeholder="e.g. Product Designer" value={form.targetRole} onChange={e=>update("targetRole",e.target.value)}/><Field label="Email" required type="email" placeholder="you@email.com" value={form.email} onChange={e=>update("email",e.target.value)}/><Field label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={e=>update("phone",e.target.value)}/><Field label="Location" placeholder="Bengaluru, India" value={form.location} onChange={e=>update("location",e.target.value)}/><Field label="LinkedIn / Portfolio" placeholder="linkedin.com/in/you" value={form.linkedin} onChange={e=>update("linkedin",e.target.value)}/></div></fieldset>
        <fieldset><legend>Skills</legend><label className="field"><span>Core skills <em>*</em></span><textarea required placeholder="React, UX research, Python, project management..." value={form.skills} onChange={e=>update("skills",e.target.value)}/><small>Separate skills with commas.</small></label></fieldset>
        <fieldset><legend>Experience</legend>{form.experience.map((job,i)=><div className="repeat" key={i}><div className="repeat-title"><b>Position {i+1}</b>{form.experience.length>1&&<button type="button" onClick={()=>remove("experience",i)} aria-label="Remove position"><Trash2 size={16}/></button>}</div><div className="fields two"><Field label="Company" placeholder="Company name" value={job.company} onChange={e=>updateList("experience",i,"company",e.target.value)}/><Field label="Role" placeholder="Your title" value={job.role} onChange={e=>updateList("experience",i,"role",e.target.value)}/><Field label="Start date" placeholder="Jan 2023" value={job.startDate} onChange={e=>updateList("experience",i,"startDate",e.target.value)}/><Field label="End date" placeholder="Present" value={job.endDate} onChange={e=>updateList("experience",i,"endDate",e.target.value)}/></div><label className="field"><span>What did you do?</span><textarea placeholder={"Describe your work in plain language. Add each achievement on a new line."} value={job.description} onChange={e=>updateList("experience",i,"description",e.target.value)}/></label></div>)}<button className="add" type="button" onClick={()=>add("experience",emptyJob)}><Plus size={16}/> Add another position</button></fieldset>
        <fieldset><legend>Education</legend>{form.education.map((ed,i)=><div className="repeat" key={i}><div className="repeat-title"><b>Education {i+1}</b>{form.education.length>1&&<button type="button" onClick={()=>remove("education",i)}><Trash2 size={16}/></button>}</div><div className="fields three"><Field label="School" placeholder="University" value={ed.school} onChange={e=>updateList("education",i,"school",e.target.value)}/><Field label="Degree" placeholder="B.Tech, Computer Science" value={ed.degree} onChange={e=>updateList("education",i,"degree",e.target.value)}/><Field label="Year" placeholder="2024" value={ed.year} onChange={e=>updateList("education",i,"year",e.target.value)}/></div></div>)}<button className="add" type="button" onClick={()=>add("education",{school:"",degree:"",year:""})}><Plus size={16}/> Add education</button></fieldset>
        {error&&<div className="error">{error}</div>}
        <button className="primary generate" disabled={loading}>{loading?<><span className="spinner"/> Crafting your resume...</>:<>Generate with AI <Sparkles size={18}/></>}</button>
      </form>
    </main>}

    {step===3&&result&&<main className="result">
      <div className="result-head"><div><div className="eyebrow"><Check size={14}/> YOUR RESUME IS READY</div><h1>Meet your polished self.</h1><p>Review your AI-enhanced resume, then save it as a PDF.</p></div><div className="actions"><button className="secondary" onClick={()=>setStep(2)}><ArrowLeft size={17}/> Edit details</button><button className="primary" onClick={()=>window.print()}><Download size={17}/> Save as PDF</button></div></div>
      <div className="resume-shell"><Resume data={result} template={template}/></div>
      <p className="mode-note"><Sparkles size={14}/> {result.aiMode==="groq"?"Enhanced with Groq AI":"Generated in demo mode — add a Groq key to enable live AI rewriting"}</p>
    </main>}
    <footer><span>CareerCanvas</span><p>Build a resume that sounds like you—on your best day.</p></footer>
  </div>
}
