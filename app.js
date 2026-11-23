(function(){
  const VIDEOS = window.VIDEOS || [];
  const KEY = "estudo:" + window.STORAGE_KEY;
  const estado = JSON.parse(localStorage.getItem(KEY) || '{"vistos":{},"notas":{}}');
  const salvar = () => localStorage.setItem(KEY, JSON.stringify(estado));
  const ic = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const dur = s => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` : "";
  let filtro = "Todos";

  const toastEl = document.getElementById("toast"); let tt;
  function toast(msg){ toastEl.innerHTML = ic("i-check") + esc(msg); toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(()=>toastEl.classList.remove("on"), 1800); }

  function progresso(){
    const feitos = VIDEOS.filter(v => estado.vistos[v.id]).length;
    document.getElementById("feitos").textContent = feitos;
    document.getElementById("total").textContent = VIDEOS.length;
    const p = VIDEOS.length ? Math.round(feitos/VIDEOS.length*100) : 0;
    document.getElementById("barra").style.width = p + "%";
    document.getElementById("pct").textContent = p + "% concluído";
  }

  function filtros(){
    const temas = ["Todos", ...new Set(VIDEOS.map(v => v.tema))];
    const nav = document.getElementById("filtros");
    nav.innerHTML = temas.map(t => `<button class="chip${t===filtro?" ativo":""}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
    nav.querySelectorAll(".chip").forEach(b => b.onclick = () => { filtro = b.dataset.t; filtros(); render(); });
  }

  function render(){
    const lista = document.getElementById("lista");
    lista.innerHTML = VIDEOS.filter(v => filtro==="Todos" || v.tema===filtro).map(v => {
      const visto = !!estado.vistos[v.id], nota = estado.notas[v.id] || "";
      return `<article class="card${visto?" visto":""}" data-id="${v.id}">
        <div class="card-top">
          <div class="num">${String(v.numero).padStart(2,"0")}</div>
          <div><h2>${esc(v.titulo)}</h2>
            <div class="meta"><span class="tag">${esc(v.tema)}</span><span class="dur">${ic("i-clock")}${dur(v.duracao)}</span></div>
          </div>
        </div>
        <div class="acoes">
          <a class="btn primario" href="${v.url}" target="_blank" rel="noopener">${ic("i-play")}Assistir no YouTube</a>
          <button class="btn copiar">${ic("i-link")}Copiar link</button>
          ${v.transcricao
            ? `<a class="btn" href="${v.transcricao}" download>${ic("i-download")}Transcrição</a>`
            : `<button class="btn" disabled title="Sem legenda no YouTube">${ic("i-download")}Sem transcrição</button>`}
          <button class="btn marcar" aria-pressed="${visto}">${ic("i-check")}${visto?"Assistido":"Marcar como assistido"}</button>
          <button class="btn nota-tog${nota?" com-nota":""}" aria-expanded="false"><span class="esq">${ic("i-note")}Anotação<span class="tem"></span></span><span class="mais">${ic("i-plus")}</span></button>
        </div>
        <div class="nota"><textarea placeholder="Escreva aqui o que aprendeu neste vídeo...">${esc(nota)}</textarea><small>Salvo automaticamente</small></div>
      </article>`;
    }).join("");
    lista.querySelectorAll(".card").forEach(card => {
      const id = card.dataset.id, v = VIDEOS.find(x => x.id === id);
      card.querySelector(".copiar").onclick = async () => {
        try { await navigator.clipboard.writeText(v.url); }
        catch(e){ const t=document.createElement("textarea"); t.value=v.url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
        toast("Link copiado");
      };
      card.querySelector(".marcar").onclick = () => {
        estado.vistos[id] ? delete estado.vistos[id] : (estado.vistos[id] = Date.now());
        salvar(); render(); progresso();
        if (estado.vistos[id]) toast("Marcado como assistido");
      };
      const tog = card.querySelector(".nota-tog"), box = card.querySelector(".nota"), ta = box.querySelector("textarea");
      tog.onclick = () => { const ab = box.classList.toggle("aberta"); tog.setAttribute("aria-expanded", ab); if (ab) ta.focus(); };
      let t; ta.oninput = () => { clearTimeout(t); t = setTimeout(() => {
        const val = ta.value.trim(); val ? estado.notas[id] = ta.value : delete estado.notas[id];
        salvar(); tog.classList.toggle("com-nota", !!val); }, 300); };
    });
  }
  filtros(); render(); progresso();
})();
