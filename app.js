
const $ = (id) => document.getElementById(id);
const DB_KEY = "pq_vistorias_v1";
const DRAFT_KEY = "pq_draft_v1";
const SUGESTOES_KEY = "pq_sugestoes_v1";
let vistorias = JSON.parse(localStorage.getItem(DB_KEY) || "[]");
let atual = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
let fotosAtuais = [];
let editandoId = null;
let editandoSugestaoId = null;

const SUGESTOES_INICIAIS = [
  {servico:"Pintura interna", acaoTipo:"Refazer", pendencia:"Falha de acabamento", texto:"Executar correção da superfície, realizar a preparação adequada e aplicar nova demão de pintura, garantindo uniformidade do acabamento."},
  {servico:"Pintura interna", acaoTipo:"Corrigir", pendencia:"Teto descascando", texto:"Remover as partes soltas, preparar a superfície e executar a correção da pintura, garantindo aderência e acabamento uniforme."},
  {servico:"Pintura interna", acaoTipo:"Pintar", pendencia:"Parte sem pintura", texto:"Executar a pintura da área pendente, garantindo cobertura uniforme e compatibilidade com o acabamento existente."},
  {servico:"Revestimento cerâmico", acaoTipo:"Substituir", pendencia:"Peça com som oco ou comprometida", texto:"Remover a peça comprometida, preparar a base e executar nova instalação, garantindo aderência, alinhamento e nivelamento adequados."},
  {servico:"Revestimento cerâmico", acaoTipo:"Rejuntar", pendencia:"Falta de rejunte", texto:"Executar o preenchimento das juntas com rejunte adequado, garantindo uniformidade, acabamento e preenchimento completo."},
  {servico:"Porta de madeira", acaoTipo:"Ajustar", pendencia:"Porta não fecha corretamente", texto:"Executar regulagem da folha, ferragens e componentes de fixação, garantindo o correto funcionamento e fechamento da porta."},
  {servico:"Esquadria", acaoTipo:"Regularizar", pendencia:"Dificuldade de abertura ou fechamento", texto:"Executar regulagem da esquadria, verificando alinhamento, ferragens e funcionamento da folha, garantindo abertura e fechamento adequados."},
  {servico:"Gesso cola", acaoTipo:"Corrigir", pendencia:"Falha ou irregularidade no acabamento", texto:"Executar a correção da superfície de gesso, eliminando irregularidades e garantindo acabamento uniforme antes da pintura."},
  {servico:"Gesso acartonado", acaoTipo:"Corrigir", pendencia:"Junta ou acabamento aparente", texto:"Executar tratamento da junta e correção do acabamento, garantindo superfície regular e pronta para pintura."},
  {servico:"Reboco e requadração", acaoTipo:"Refazer", pendencia:"Requadro fora de padrão", texto:"Refazer o requadro, garantindo prumo, nível, esquadro e dimensões conforme projeto e padrão de execução."},
  {servico:"Guarda-corpo das varandas", acaoTipo:"Regularizar", pendencia:"Elemento desalinhado", texto:"Executar a correção do guarda-corpo, garantindo alinhamento, nivelamento e fixação adequada."},
  {servico:"Corrimão e guarda-corpo das escadas", acaoTipo:"Regularizar", pendencia:"Elemento desalinhado", texto:"Executar a correção do corrimão e guarda-corpo, garantindo alinhamento, nivelamento e fixação adequada."},
  {servico:"Estrutura metálica do telhado", acaoTipo:"Regularizar", pendencia:"Elemento desalinhado", texto:"Executar a correção da estrutura metálica, garantindo alinhamento, nivelamento e fixação adequada."},
  {servico:"Louças e metais", acaoTipo:"Instalar", pendencia:"Item não instalado", texto:"Executar a instalação do componente conforme projeto e especificação, garantindo fixação, funcionamento e acabamento adequado."}
];
const AMBIENTES_POR_SERVICO = {
  "Porta de madeira": [
    "Quarto 1 - Porta", "Quarto 1 - Alizar", "Quarto 1 - Fechadura/maçaneta",
    "Quarto 2 - Porta", "Quarto 2 - Alizar", "Quarto 2 - Fechadura/maçaneta",
    "Banheiro - Porta", "Banheiro - Alizar", "Banheiro - Fechadura/maçaneta",
    "Entrada - Porta", "Entrada - Alizar", "Entrada - Fechadura/maçaneta", "Outro ambiente/item..."
  ],
  "Esquadria": [
    "Sala - Esquadria/janela", "Sala - Pingadeira",
    "Quarto 1 - Esquadria/janela", "Quarto 1 - Pingadeira",
    "Quarto 2 - Esquadria/janela", "Quarto 2 - Pingadeira",
    "Banheiro - Esquadria/janela", "Banheiro - Pingadeira",
    "Cozinha - Esquadria/janela", "Cozinha - Pingadeira", "Outro ambiente/item..."
  ],
  "Louças e metais": [
    "Tanque", "Torneira do tanque",
    "Bancada/pia da cozinha", "Torneira da pia da cozinha",
    "Pia/lavatório do banheiro", "Torneira do lavatório",
    "Vaso sanitário", "Registro/acessórios", "Outro ambiente/item..."
  ],
  "Guarda-corpo das varandas": ["Varanda - guarda-corpo", "Outro ambiente/item..."],
  "Corrimão e guarda-corpo das escadas": ["Escada - corrimão", "Escada - guarda-corpo", "Outro ambiente/item..."],
  "Estrutura metálica do telhado": ["Telhado - estrutura metálica", "Outro ambiente/item..."],
  "Revestimento cerâmico": [
    "Sala", "Quarto 1", "Quarto 2", "Banheiro", "Cozinha", "Área de serviço", "Outro ambiente/item..."
  ],
  "Pintura interna": [
    "Sala", "Quarto 1", "Quarto 2", "Banheiro", "Cozinha", "Área de serviço", "Teto", "Outro ambiente/item..."
  ]
};

function atualizarAmbientesServico(valorInicial="") {
  const sel=$("pAmbienteItem"), outro=$("ambienteOutroWrap"), outroInput=$("pAmbienteOutro");
  if(!sel) return;
  const servico=$("pServico").value === "__outro__" ? $("pServicoOutro").value : $("pServico").value;
  const lista=AMBIENTES_POR_SERVICO[servico] || ["Ambiente/item não especificado", "Outro ambiente/item..."];
  sel.innerHTML='<option value="">Selecione o ambiente/item</option>'+lista.map(x=>`<option value="${escapeAttr(x)}">${escapeHtml(x)}</option>`).join("");
  const val=valorInicial || "";
  if(val && lista.includes(val)){ sel.value=val; outro.classList.add("hidden"); outroInput.value=""; }
  else if(val){ sel.value="Outro ambiente/item..."; outro.classList.remove("hidden"); outroInput.value=val; }
  else { sel.value=""; outro.classList.add("hidden"); outroInput.value=""; }
}
function escapeAttr(s=""){ return String(s).replace(/&/g,"&amp;").replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function ambienteAtual(){
  const v=$("pAmbienteItem")?.value || "";
  return v === "Outro ambiente/item..." ? ($("pAmbienteOutro")?.value.trim() || "Outro ambiente/item") : v;
}

let sugestoes = JSON.parse(localStorage.getItem(SUGESTOES_KEY) || "null");
if(!Array.isArray(sugestoes) || !sugestoes.length){ sugestoes=SUGESTOES_INICIAIS.map(x=>({id:uid(),...x, criadaEm:new Date().toISOString()})); localStorage.setItem(SUGESTOES_KEY,JSON.stringify(sugestoes)); }
function saveSugestoes(){ localStorage.setItem(SUGESTOES_KEY, JSON.stringify(sugestoes)); }
function normalizar(s=""){ return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
function buscarSugestoes(){
  const servicoRaw = $("pServico").value === "__outro__" ? $("pServicoOutro").value : $("pServico").value;
  const servico = normalizar(servicoRaw);
  const acaoSelecionada = normalizar($("pAcaoTipo").value);
  const pend = normalizar($("pPendencia").value);
  const ambiente = normalizar(ambienteAtual());
  const acaoTexto = normalizar($("pAcao").value);

  // A pesquisa é intencionalmente flexível: basta uma palavra relevante
  // digitada na ação/pendência para encontrar sugestões relacionadas.
  const termos = [...new Set(
    `${acaoSelecionada} ${acaoTexto} ${pend} ${ambiente}`
      .split(/\s+/)
      .map(t => t.replace(/[^a-z0-9áéíóúàâêôãõçü-]/gi, ""))
      .filter(t => t.length >= 3)
  )];

  const filtradas = sugestoes
    .filter(x => {
      const textoBusca = normalizar(`${x.servico} ${x.acaoTipo} ${x.pendencia} ${x.texto}`);
      const okServico = !servico || normalizar(x.servico) === servico || textoBusca.includes(servico);
      const okTermos = !termos.length || termos.some(t => textoBusca.includes(t));
      return okServico && okTermos;
    })
    .sort((a,b) => {
      const score = x => {
        const t = normalizar(`${x.acaoTipo} ${x.pendencia} ${x.texto}`);
        return termos.reduce((n, termo) => n + (t.includes(termo) ? 1 : 0), 0);
      };
      return score(b) - score(a);
    });

  renderSugestoesContexto(filtradas);
}

function renderSugestoesContexto(lista){
  const box=$("sugestoesBox"); if(!box)return;
  if(!lista.length){
    box.classList.remove("hidden");
    box.innerHTML=`<div class="suggestion-title">💡 Sugestões da base <span>0</span></div><div class="suggestion-empty">Nenhuma sugestão encontrada para esta ação. Você pode salvar o texto atual como uma nova sugestão.</div>`;
    return;
  }
  box.classList.remove("hidden");
  box.innerHTML=`<div class="suggestion-title">💡 Sugestões da base <span>${lista.length}</span></div>` + lista.slice(0,5).map(x=>`<div class="suggestion-item"><div><strong>${escapeHtml(x.acaoTipo)} • ${escapeHtml(x.pendencia)}</strong><p>${escapeHtml(x.texto)}</p></div><button type="button" class="mini usarSugestao" data-id="${x.id}">Usar</button></div>`).join("");
  box.querySelectorAll(".usarSugestao").forEach(btn=>btn.onclick=()=>{ const x=sugestoes.find(y=>y.id===btn.dataset.id); if(!x)return; $("pAcaoTipo").value=x.acaoTipo; $("pAcao").value=x.texto; $("pPendencia").value=$("pPendencia").value.trim() || x.pendencia; buscarSugestoes(); });
}
function salvarSugestaoAtual(){
  const servico=$("pServico").value === "__outro__" ? $("pServicoOutro").value.trim() : $("pServico").value;
  const pendencia=$("pPendencia").value.trim(); const acaoTipo=$("pAcaoTipo").value; const texto=$("pAcao").value.trim();
  if(!servico || !acaoTipo || !texto){ alert("Para salvar uma sugestão, informe serviço, ação adotada e texto técnico."); return; }
  const existente=sugestoes.find(x=>normalizar(x.servico)===normalizar(servico)&&normalizar(x.acaoTipo)===normalizar(acaoTipo)&&normalizar(x.texto)===normalizar(texto));
  if(existente){alert("Essa sugestão já está cadastrada no banco.");return;}
  sugestoes.unshift({id:uid(),servico,acaoTipo,pendencia:pendencia||"Geral",texto,criadaEm:new Date().toISOString()}); saveSugestoes();
  alert("Nova sugestão salva no banco técnico."); buscarSugestoes(); renderBanco();
}
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
$("pServicoOutro").addEventListener("input", buscarSugestoes);
$("pAcaoTipo").addEventListener("change", buscarSugestoes);
$("pAcao").addEventListener("input", buscarSugestoes);
$("pPendencia").addEventListener("input", buscarSugestoes);
$("pServicoOutro").addEventListener("input", buscarSugestoes);
$("pServico").addEventListener("change", buscarSugestoes);
$("pAcaoTipo").addEventListener("change", buscarSugestoes);
$("pPendencia").addEventListener("input", ()=>{ clearTimeout(window._sugTimer); window._sugTimer=setTimeout(buscarSugestoes,180); });
$("btnNovaSugestao").onclick=salvarSugestaoAtual;
$("btnBancoSugestoes").onclick=()=>{renderBanco();show("bancoView");};
$("btnVoltarBanco").onclick=()=>{renderHome();show("homeView");};
$("buscaSugestoes").addEventListener("input",renderBanco);
$("filtroSugestaoServico").addEventListener("change",renderBanco);

$("btnNovaVistoria").onclick = ()=>{ editandoId=null; atual=null; saveDraft(); $("formVistoria").reset(); $("dataVistoria").value=today(); show("vistoriaView"); };
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

async function addPhotos(files){
  const selected=[...files]; if(!selected.length)return;
  const remaining=4-fotosAtuais.length;
  if(remaining<=0){alert("Esta pendência já possui 4 fotos.");return;}
  for(const file of selected.slice(0,remaining)) fotosAtuais.push(await compressImage(file,1280,.72));
  renderPreviewFotos();
}
$("btnCamera").onclick=()=>$("cameraInput").click();
$("btnGaleria").onclick=()=>$("galleryInput").click();
$("cameraInput").addEventListener("change",async e=>{await addPhotos(e.target.files);e.target.value="";});
$("galleryInput").addEventListener("change",async e=>{await addPhotos(e.target.files);e.target.value="";});
function renderPreviewFotos(){
  const box=$("previewFotos");box.innerHTML="";
  $("photoCounter").textContent=`${fotosAtuais.length}/4 fotos`;
  fotosAtuais.forEach((src,i)=>{
    const w=document.createElement("div");w.className="photo-slot";
    const im=document.createElement("img");im.src=src;im.alt=`Foto ${i+1}`;
    const b=document.createElement("button");b.type="button";b.className="remove-photo";b.textContent="×";
    b.onclick=()=>{fotosAtuais.splice(i,1);renderPreviewFotos();};
    const n=document.createElement("span");n.className="photo-number";n.textContent=`Foto ${i+1}`;
    w.append(im,b,n);box.appendChild(w);
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

function atualizarCeramica(){
  const isCer = $("pServico").value === "Revestimento cerâmico";
  $("ceramicaExecWrap")?.classList.toggle("hidden", !isCer);
  const exec = document.querySelector('input[name="ceramicaExec"]:checked')?.value || "";
  $("ceramicaMotivoWrap")?.classList.toggle("hidden", !(isCer && exec === "Parcial"));
}
document.querySelectorAll('input[name="ceramicaExec"]').forEach(r=>r.addEventListener("change", atualizarCeramica));

$("pServico").addEventListener("change",()=>{ $("servicoOutroWrap").classList.toggle("hidden", $("pServico").value!=="__outro__"); atualizarAmbientesServico(); atualizarCeramica(); buscarSugestoes(); });
$("pServicoOutro").addEventListener("input",()=>{ atualizarAmbientesServico(); buscarSugestoes(); });
$("pAmbienteItem").addEventListener("change",()=>{ $("ambienteOutroWrap").classList.toggle("hidden", $("pAmbienteItem").value!=="Outro ambiente/item..."); buscarSugestoes(); });
$("pAmbienteOutro").addEventListener("input",buscarSugestoes);

$("formPendencia").addEventListener("submit", e=>{
  e.preventDefault();
  if(!atual) return;

  const servico = $("pServico").value === "__outro__" ? $("pServicoOutro").value.trim() : $("pServico").value;
  if(!servico) return alert("Informe o serviço.");

  const dados = {
    bloco:$("pBloco").value.trim(),
    local:$("pLocal").value.trim(),
    ambiente:ambienteAtual(),
    servico,
    fotos:[...fotosAtuais],
    pendencia:$("pPendencia").value.trim(),
    acaoTipo:$("pAcaoTipo").value,
    acao:$("pAcao").value.trim(),
    prioridade:$("pPrioridade").value,
    status:$("pStatus").value,
    execucao:$("pServico").value === "Revestimento cerâmico" ? (document.querySelector('input[name="ceramicaExec"]:checked')?.value || "") : "",
    motivoExecucao:$("pServico").value === "Revestimento cerâmico" && document.querySelector('input[name="ceramicaExec"]:checked')?.value === "Parcial" ? $("pCeramicaMotivo").value : ""
  };

  if(editandoId){
    const item = atual.pendencias.find(x=>x.id===editandoId);
    if(item) Object.assign(item, dados, {editadaEm:new Date().toISOString()});
  }else{
    atual.pendencias.push({id:uid(), ...dados, criadaEm:new Date().toISOString()});
  }

  saveDraft();
  const keepBloco=dados.bloco, keepLocal=dados.local;
  $("formPendencia").reset();
  $("pBloco").value=keepBloco;
  $("pLocal").value=keepLocal;
  $("pPrioridade").value="Média";
  $("pStatus").value="Pendente";
  $("pAcaoTipo").value="";
  document.querySelectorAll('input[name="ceramicaExec"]').forEach(r=>r.checked=false);
  $("pCeramicaMotivo").value="";
  atualizarAmbientesServico();
  atualizarCeramica();
  $("sugestoesBox").classList.add("hidden");
  fotosAtuais=[];
  $("previewFotos").innerHTML="";
  $("servicoOutroWrap").classList.add("hidden");
  editandoId=null;
  $("formPendencia").querySelector('button[type="submit"]').textContent="Salvar pendência";
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
    node.querySelector(".local").textContent=`${item.bloco} • ${item.local}${item.ambiente ? " • " + item.ambiente : ""}`;
    node.querySelector(".texto").textContent=`Pendência: ${item.pendencia}`;
    node.querySelector(".acao").textContent=`Ação: ${item.acao}`;
    node.querySelector(".btnEditar").onclick=()=>{
      editandoId=item.id;
      $("pBloco").value=item.bloco||"";
      $("pLocal").value=item.local||"";
      atualizarAmbientesServico(item.ambiente||"");
      const conhecidos=[...$("pServico").options].map(o=>o.value).filter(v=>v && v!=="__outro__");
      if(conhecidos.includes(item.servico)){
        $("pServico").value=item.servico;
        $("servicoOutroWrap").classList.add("hidden");
        $("pServicoOutro").value="";
      }else{
        $("pServico").value="__outro__";
        $("servicoOutroWrap").classList.remove("hidden");
        $("pServicoOutro").value=item.servico||"";
      }
      fotosAtuais=[...(item.fotos || (item.foto ? [item.foto] : []))];
      renderPreviewFotos();
      $("pPendencia").value=item.pendencia||"";
      $("pAcaoTipo").value=item.acaoTipo||"";
      $("pAcao").value=item.acao||"";
      buscarSugestoes();
      $("pPrioridade").value=item.prioridade||"Média";
      $("pStatus").value=item.status||"Pendente";
      $("formPendencia").querySelector('button[type="submit"]').textContent="Salvar alterações";
      $("formPendencia").scrollIntoView({behavior:"smooth",block:"start"});
    };
    node.querySelector(".btnDuplicar").onclick=()=>{
  editandoId=null;
  $("pBloco").value=item.bloco||"";$("pLocal").value=item.local||"";
  const opts=[...$("pServico").options].map(o=>o.value);
  if(opts.includes(item.servico)){ $("pServico").value=item.servico;$("servicoOutroWrap").classList.add("hidden");}
  else{$("pServico").value="__outro__";$("servicoOutroWrap").classList.remove("hidden");$("pServicoOutro").value=item.servico||"";}
  fotosAtuais=[...(item.fotos||(item.foto?[item.foto]:[]))];renderPreviewFotos();
  $("pPendencia").value=""; atualizarAmbientesServico(); $("pAcao").value=item.acao||"";$("pPrioridade").value=item.prioridade||"Média";$("pStatus").value="Pendente";
  $("formPendencia").querySelector('button[type="submit"]').textContent="Salvar pendência";
  $("formPendencia").scrollIntoView({behavior:"smooth",block:"start"});
};
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
        ${p.ambiente?`<p><strong>Ambiente/item:</strong> ${escapeHtml(p.ambiente)}</p>`:""}
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
  atual.pendencias.forEach((p,i)=>{t+=`\n${i+1}. ${p.bloco} — ${p.local}${p.ambiente?" — "+p.ambiente:""}\nServiço: ${p.servico}\nPendência: ${p.pendencia}\nAção: ${p.acao}\nStatus: ${p.status}\n`;});
  return t;
}
$("btnWhatsapp").onclick=()=>{ window.open("https://wa.me/?text="+encodeURIComponent(resumoTexto()),"_blank"); };
$("btnCompartilhar").onclick=async()=>{
  const text=resumoTexto();
  if(navigator.share){ try{await navigator.share({title:`Pendências - ${atual.obra}`,text});}catch(e){} }
  else { await navigator.clipboard.writeText(text); alert("Resumo copiado."); }
};
$("btnImprimir").onclick=()=>window.print();
$("btnNovaAposFinalizar").onclick=()=>{ editandoId=null; atual=null; saveDraft(); $("formVistoria").reset(); $("dataVistoria").value=today(); show("vistoriaView"); };

function renderBanco(){
  const box=$("listaSugestoes"); if(!box)return;
  const busca=normalizar($("buscaSugestoes").value); const servico=$("filtroSugestaoServico").value;
  const servicos=[...new Set(sugestoes.map(x=>x.servico).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  const filtro=$("filtroSugestaoServico"); const atualFiltro=filtro.value; filtro.innerHTML='<option value="">Todos os serviços</option>'+servicos.map(x=>`<option>${escapeHtml(x)}</option>`).join(""); filtro.value=servicos.includes(atualFiltro)?atualFiltro:"";
  const lista=sugestoes.filter(x=>{ const hay=normalizar(`${x.servico} ${x.acaoTipo} ${x.pendencia} ${x.texto}`); return (!busca||hay.includes(busca))&&(!servico||x.servico===servico); });
  $("contadorSugestoes").textContent=lista.length; box.innerHTML="";
  if(!lista.length){box.innerHTML='<div class="empty">Nenhuma sugestão encontrada.</div>';return;}
  lista.forEach(x=>{ const d=document.createElement("article"); d.className="suggestion-card"; d.innerHTML=`<div class="suggestion-card-head"><strong>${escapeHtml(x.servico)}</strong><span>${escapeHtml(x.acaoTipo)}</span></div><small>${escapeHtml(x.pendencia||"Geral")}</small><p>${escapeHtml(x.texto)}</p><div class="pend-actions"><button class="mini btnUsarBanco">Usar na pendência</button><button class="mini danger btnExcluirSug">Excluir</button></div>`; d.querySelector(".btnUsarBanco").onclick=()=>{show("registroView");$("pServico").value=[...$("pServico").options].some(o=>o.value===x.servico)?x.servico:"__outro__";$("servicoOutroWrap").classList.toggle("hidden",$("pServico").value!=="__outro__");if($("pServico").value==="__outro__")$("pServicoOutro").value=x.servico;$("pAcaoTipo").value=x.acaoTipo;$("pPendencia").value=x.pendencia==="Geral"?"":x.pendencia;$("pAcao").value=x.texto;buscarSugestoes();}; d.querySelector(".btnExcluirSug").onclick=()=>{if(confirm("Excluir esta sugestão do banco?")){sugestoes=sugestoes.filter(y=>y.id!==x.id);saveSugestoes();renderBanco();}}; box.appendChild(d); });
}

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


// Inicializa o seletor de ambiente/item conforme o serviço atual.
atualizarAmbientesServico();
