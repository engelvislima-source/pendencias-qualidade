
const $ = (id) => document.getElementById(id);
const DB_KEY = "pq_vistorias_v1";
const DRAFT_KEY = "pq_draft_v1";
let vistorias = JSON.parse(localStorage.getItem(DB_KEY) || "[]");
let atual = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
let fotosAtuais = [];

function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(vistorias)); }
function saveDraft(){ atual ? localStorage.setItem(DRAFT_KEY, JSON.stringify(atual)) : localStorage.removeItem(DRAFT_KEY); }
function show(id){ document.querySelectorAll(".view").forEach(v=>v.classList.remove("active")); $(id).classList.add("active"); window.scrollTo({top:0,behavior:"smooth"}); }
function fmtDate(iso){ if(!iso) return "-"; const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`; }
function uid(){ return `${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
function statusClass(s){ return "status-"+s.replaceAll(" ","-"); }
function today(){ return new Date().toISOString().slice(0,10); }

$("dataVistoria").value = today();

$("pServico").addEventListener("change", e=>{
  $("servicoOutroWrap").classList.toggle("hidden", e.target.value !== "__outro__");
});

$("btnNovaVistoria").onclick = ()=>{ atual=null; saveDraft(); $("formVistoria").reset(); $("dataVistoria").value=today(); show("vistoriaView"); };
$("btnHome").onclick = ()=>{ renderHome(); show("homeView"); };
$("btnVoltarHome").onclick = ()=>{ renderHome(); show("homeView"); };
$("btnVoltarVistoria").onclick = ()=> show("vistoriaView");
$("btnVoltarRegistro").onclick = ()=> show("registroView");

$("formVistoria").addEventListener("submit", e=>{
  e.preventDefault();
  const obra = $("obra").value.trim();
  if(!obra) return alert("Informe a obra.");
  atual = {
    id: atual?.id || uid(),
    obra,
    data: $("dataVistoria").value,
    responsavel: $("responsavel").value.trim(),
    prazo: $("prazoCorrecao").value,
    blocoBase: $("blocoBase").value.trim(),
    localBase: $("localBase").value.trim(),
    obs: $("obsGeral").value.trim(),
    pendencias: atual?.pendencias || [],
    finalizada: false,
    criadaEm: atual?.criadaEm || new Date().toISOString()
  };
  saveDraft();
  carregarRegistro();
  show("registroView");
});

$("pFoto").addEventListener("change", async e=>{
  const files=[...(e.target.files||[])];
  if(!files.length) return;
  if(files.length > 4){
    alert("Selecione no máximo 4 fotos por pendência.");
    e.target.value="";
    return;
  }
  fotosAtuais = [];
  for(const file of files){
    fotosAtuais.push(await compressImage(file, 1280, .72));
  }
  renderPreviewFotos();
});

function renderPreviewFotos(){
  const box=$("previewFotos"); box.innerHTML="";
  fotosAtuais.forEach((src,i)=>{
    const wrap=document.createElement("div");
    wrap.style.position="relative";
    const img=document.createElement("img");
    img.src=src; img.alt=`Foto ${i+1}`;
    const btn=document.createElement("button");
    btn.type="button"; btn.textContent="×";
    btn.style.cssText="position:absolute;top:6px;right:6px;border:0;border-radius:999px;width:28px;height:28px;background:rgba(0,0,0,.7);color:#fff;font-weight:800";
    btn.onclick=()=>{ fotosAtuais.splice(i,1); renderPreviewFotos(); };
    wrap.append(img,btn); box.appendChild(wrap);
  });
}

async function compressImage(file,maxW,quality){
  const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=data;});
  const scale=Math.min(1,maxW/img.width); const c=document.createElement("canvas");
  c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",quality);
}

$("formPendencia").addEventListener("submit", e=>{
  e.preventDefault();
  if(!atual) return;
  const servico = $("pServico").value === "__outro__" ? $("pServicoOutro").value.trim() : $("pServico").value;
  const item = {
    id: uid(),
    bloco:$("pBloco").value.trim(),
    local:$("pLocal").value.trim(),
    servico,
    fotos:[...fotosAtuais],
    pendencia:$("pPendencia").value.trim(),
    acao:$("pAcao").value.trim(),
    prioridade:$("pPrioridade").value,
    status:$("pStatus").value,
    criadaEm:new Date().toISOString()
  };
  atual.pendencias.push(item); saveDraft();
  const keepBloco=item.bloco, keepLocal=item.local;
  $("formPendencia").reset(); $("pBloco").value=keepBloco; $("pLocal").value=keepLocal;
  $("pPrioridade").value="Média"; $("pStatus").value="Pendente"; fotosAtuais=[];
  $("previewFotos").innerHTML=""; $("servicoOutroWrap").classList.add("hidden");
  renderPendencias();
});

function carregarRegistro(){
  $("vistoriaAtualInfo").textContent=`${atual.obra} • ${fmtDate(atual.data)}`;
  $("pBloco").value=atual.blocoBase||""; $("pLocal").value=atual.localBase||"";
  renderPendencias();
}

function renderPendencias(){
  const box=$("listaPendencias"); box.innerHTML="";
  $("contadorPendencias").textContent=atual?.pendencias?.length||0;
  if(!atual?.pendencias?.length){ box.innerHTML='<div class="empty">Nenhuma pendência registrada ainda.</div>'; return; }
  atual.pendencias.forEach(item=>{
    const node=$("tplPendencia").content.cloneNode(true);
    const thumbs=node.querySelector(".thumbs");
    const fotos = item.fotos || (item.foto ? [item.foto] : []);
    if(fotos.length){
      fotos.slice(0,4).forEach(src=>{const im=document.createElement("img"); im.src=src; thumbs.appendChild(im);});
    } else {
      thumbs.innerHTML='<span style="font-size:11px;color:#7c897f">Sem foto</span>';
    }
    node.querySelector(".servico").textContent=item.servico;
    const pill=node.querySelector(".status-pill"); pill.textContent=item.status; pill.classList.add(statusClass(item.status));
    node.querySelector(".local").textContent=`${item.bloco} • ${item.local}`;
    node.querySelector(".texto").textContent=`Pendência: ${item.pendencia}`;
    node.querySelector(".acao").textContent=`Ação: ${item.acao}`;
    node.querySelector(".btnExcluir").onclick=()=>{ if(confirm("Excluir esta pendência?")){atual.pendencias=atual.pendencias.filter(x=>x.id!==item.id);saveDraft();renderPendencias();} };
    node.querySelector(".btnStatus").onclick=()=>{ const ordem=["Pendente","Em correção","Corrigido","Reprovado"]; item.status=ordem[(ordem.indexOf(item.status)+1)%ordem.length]; saveDraft(); renderPendencias(); };
    box.appendChild(node);
  });
}

$("btnSalvarSair").onclick=()=>{ saveDraft(); renderHome(); show("homeView"); };
$("btnFinalizar").onclick=()=>{
  if(!atual?.pendencias?.length) return alert("Registre ao menos uma pendência.");
  atual.finalizada=true; atual.finalizadaEm=new Date().toISOString();
  const idx=vistorias.findIndex(v=>v.id===atual.id);
  if(idx>=0) vistorias[idx]=structuredClone(atual); else vistorias.unshift(structuredClone(atual));
  saveDB(); saveDraft(); renderResumo(); show("resumoView");
};

function renderResumo(){
  const r=$("resumoRelatorio");
  const total=atual.pendencias.length;
  const counts={}; atual.pendencias.forEach(p=>counts[p.status]=(counts[p.status]||0)+1);
  r.innerHTML=`
    <h2>PENDÊNCIAS DA QUALIDADE — ${escapeHtml(atual.obra)}</h2>
    <div class="meta">Vistoria: ${fmtDate(atual.data)} • Responsável: ${escapeHtml(atual.responsavel)} • Prazo: ${fmtDate(atual.prazo)} • Total: ${total}</div>
    <p><strong>Status:</strong> Pendente ${counts["Pendente"]||0} • Em correção ${counts["Em correção"]||0} • Corrigido ${counts["Corrigido"]||0} • Reprovado ${counts["Reprovado"]||0}</p>
    ${atual.obs?`<p><strong>Observação:</strong> ${escapeHtml(atual.obs)}</p>`:""}
    <div id="reportItems"></div>`;
  const list=r.querySelector("#reportItems");
  atual.pendencias.forEach((p,i)=>{
    const el=document.createElement("div"); el.className="report-item";
    const fotos = p.fotos || (p.foto ? [p.foto] : []);
    el.innerHTML=`<div class="report-photos"></div>
      <div>
        <p><strong>${i+1}. ${escapeHtml(p.bloco)} — ${escapeHtml(p.local)}</strong></p>
        <p><strong>Serviço:</strong> ${escapeHtml(p.servico)}</p>
        <p><strong>Pendência:</strong> ${escapeHtml(p.pendencia)}</p>
        <p><strong>Ação:</strong> ${escapeHtml(p.acao)}</p>
        <p><strong>Status:</strong> ${escapeHtml(p.status)} • <strong>Prioridade:</strong> ${escapeHtml(p.prioridade)}</p>
      </div>`;
    const rp=el.querySelector(".report-photos");
    if(fotos.length){
      rp.style.display="grid"; rp.style.gridTemplateColumns="repeat(2,1fr)"; rp.style.gap="4px";
      fotos.slice(0,4).forEach(src=>{
        const im=document.createElement("img");
        im.src=src; im.style.width="100%"; im.style.height="70px"; im.style.objectFit="cover"; im.style.borderRadius="8px";
        rp.appendChild(im);
      });
    } else {
      rp.textContent="Sem foto"; rp.style.fontSize="11px"; rp.style.color="#7c897f";
    }
    list.appendChild(el);
  });
}

function resumoTexto(){
  let t=`PENDÊNCIAS DA QUALIDADE — ${atual.obra}\nVistoria: ${fmtDate(atual.data)}\nResponsável: ${atual.responsavel}\nPrazo: ${fmtDate(atual.prazo)}\nTotal: ${atual.pendencias.length}\n`;
  atual.pendencias.forEach((p,i)=>{t+=`\n${i+1}. ${p.bloco} — ${p.local}\nServiço: ${p.servico}\nPendência: ${p.pendencia}\nAção: ${p.acao}\nStatus: ${p.status}\n`;});
  return t;
}
$("btnWhatsapp").onclick=()=>{ window.open("https://wa.me/?text="+encodeURIComponent(resumoTexto()),"_blank"); };
$("btnCompartilhar").onclick=async()=>{
  const text=resumoTexto();
  if(navigator.share){ try{await navigator.share({title:`Pendências - ${atual.obra}`,text});}catch(e){} }
  else { await navigator.clipboard.writeText(text); alert("Resumo copiado."); }
};
$("btnImprimir").onclick=()=>window.print();
$("btnNovaAposFinalizar").onclick=()=>{ atual=null; saveDraft(); $("formVistoria").reset(); $("dataVistoria").value=today(); show("vistoriaView"); };

function renderHome(){
  const pend=vistorias.reduce((n,v)=>n+v.pendencias.filter(p=>p.status==="Pendente").length,0);
  const corr=vistorias.reduce((n,v)=>n+v.pendencias.filter(p=>p.status==="Corrigido").length,0);
  $("stats").innerHTML=`<div class="stat"><strong>${vistorias.length}</strong><span>Vistorias finalizadas</span></div><div class="stat"><strong>${pend}</strong><span>Pendências abertas</span></div><div class="stat"><strong>${corr}</strong><span>Itens corrigidos</span></div><div class="stat"><strong>${vistorias.reduce((n,v)=>n+v.pendencias.length,0)}</strong><span>Itens registrados</span></div>`;
  const box=$("listaVistorias"); box.innerHTML="";
  if(atual && !atual.finalizada){
    const d=document.createElement("div"); d.className="visit-card";
    d.innerHTML=`<div><strong>Rascunho — ${escapeHtml(atual.obra)}</strong><p>${fmtDate(atual.data)} • ${atual.pendencias.length} pendência(s)</p></div><button class="secondary">Continuar</button>`;
    d.querySelector("button").onclick=()=>{ carregarRegistro(); show("registroView"); }; box.appendChild(d);
  }
  if(!vistorias.length && !(atual&&!atual.finalizada)){box.innerHTML='<div class="empty">Nenhuma vistoria salva.</div>';return;}
  vistorias.forEach(v=>{
    const d=document.createElement("div"); d.className="visit-card";
    d.innerHTML=`<div><strong>${escapeHtml(v.obra)}</strong><p>${fmtDate(v.data)} • ${v.pendencias.length} pendência(s) • ${escapeHtml(v.responsavel)}</p></div><div class="visit-actions"><button class="ghost btnAbrir">Abrir</button><button class="ghost danger-text btnExcluirVistoria">Excluir</button></div>`;
    d.querySelector(".btnAbrir").onclick=()=>{ atual=structuredClone(v); saveDraft(); carregarRegistro(); renderResumo(); show("resumoView"); };
    d.querySelector(".btnExcluirVistoria").onclick=()=>{
      if(confirm(`Excluir definitivamente a vistoria de ${v.obra} (${fmtDate(v.data)})?`)){
        vistorias=vistorias.filter(x=>x.id!==v.id); saveDB();
        if(atual?.id===v.id){atual=null;saveDraft();}
        renderHome();
      }
    };
    box.appendChild(d);
  });
}
$("btnExportarBackup").onclick=()=>{
  const blob=new Blob([JSON.stringify({vistorias,rascunho:atual},null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`backup_pendencias_${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
};
$("btnLimparTudo").onclick=()=>{
  if(!vistorias.length && !atual) return alert("Não há arquivos salvos.");
  if(confirm("Excluir TODAS as vistorias, pendências e fotos salvas neste aparelho? Esta ação não pode ser desfeita.")){
    vistorias=[]; atual=null; saveDB(); saveDraft(); renderHome();
    alert("Todos os arquivos locais foram excluídos.");
  }
};

function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js").catch(()=>{}); }
renderHome();
