/* =========================================================================
   Interface do Sistema de Certificação Opacote
   ========================================================================= */
import { montarFicha, listarCatalogo, normalizar } from './motor.js';
import { ATRIBUTOS, PRODUTOS, ORGAOS, BASE_INFO } from './base-regulatoria.js';
import { fichaDaIA } from './ia-claude.js';
import { analisar, lerConfig, salvarConfig, iaPronta } from './ia-navegador.js';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const EXEMPLOS = [
  'Air fryer 5L bivolt',
  'Fone de ouvido Bluetooth',
  'Carrinho de controle remoto',
  'Lâmpada inteligente Wi-Fi',
  'Garrafa térmica inox',
  'Power bank 10000 mAh',
  'Panela de pressão',
  'Extensão elétrica 3 tomadas',
];

const CHAVE_RECENTES = 'opacote-cert-recentes';
const CHAVE_CHECK = 'opacote-cert-checklist';

const VARIACOES_VAZIAS = () => ({ voltagem: [], cor: [], tamanho: [], marca: [], conectividade: false });

const estado = {
  consulta: '',
  produtoId: null,
  atributos: null, // null = usar os padrões do produto/texto
  variacoes: VARIACOES_VAZIAS(),
  resultadoIA: null,
  ficha: null,
  carregandoIA: false,
};

/* ---------------- armazenamento local (conveniência) ---------------- */
function lerLocal(chave, padrao) {
  try {
    const v = localStorage.getItem(chave);
    return v ? JSON.parse(v) : padrao;
  } catch {
    return padrao;
  }
}
function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* modo privado: segue sem salvar */
  }
}

/* ---------------- utilidades de interface ---------------- */
let toastTimer;
function toast(msg, ms = 2800) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), ms);
}

const selo = (orgao) => `<span class="selo selo-${esc(orgao)}">${esc(ORGAOS[orgao]?.nome ?? orgao)}</span>`;
const lista = (itens) => (itens?.length ? `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '—');
const dividir = (txt) =>
  String(txt ?? '')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

/* ---------------- busca, sugestões, recentes, catálogo ---------------- */
function renderSugestoes() {
  $('#sugestoes').innerHTML =
    '<span class="sugestoes-rotulo">Exemplos:</span>' +
    EXEMPLOS.map((e) => `<button type="button" class="chip-link" data-busca="${esc(e)}">${esc(e)}</button>`).join('');
  const recentes = lerLocal(CHAVE_RECENTES, []);
  const el = $('#recentes');
  el.hidden = recentes.length === 0;
  el.innerHTML =
    '<span class="sugestoes-rotulo">Recentes:</span>' +
    recentes.map((e) => `<button type="button" class="chip-link" data-busca="${esc(e)}">${esc(e)}</button>`).join('');
  $('#btnCatalogo').textContent = `Ver todos os ${PRODUTOS.length} produtos da base`;
}

function salvarRecente(consulta) {
  const atual = lerLocal(CHAVE_RECENTES, []).filter((c) => normalizar(c) !== normalizar(consulta));
  gravarLocal(CHAVE_RECENTES, [consulta, ...atual].slice(0, 8));
}

function renderCatalogo() {
  $('#catalogo').innerHTML =
    '<div class="catalogo-grupos">' +
    listarCatalogo()
      .map(
        (g) =>
          `<div class="catalogo-grupo"><h3>${esc(g.categoria)}</h3><ul>${g.produtos
            .map((p) => `<li><button type="button" data-produto="${esc(p.id)}">${esc(p.nome)}</button></li>`)
            .join('')}</ul></div>`,
      )
      .join('') +
    '</div>';
}

function atualizarHash() {
  const params = new URLSearchParams();
  params.set('q', estado.consulta);
  if (estado.produtoId) params.set('p', estado.produtoId);
  history.replaceState(null, '', `#${params.toString()}`);
}

function buscar(consulta, produtoId = null) {
  consulta = String(consulta ?? '').trim();
  if (consulta.length < 2) return;
  Object.assign(estado, { consulta, produtoId, atributos: null, variacoes: VARIACOES_VAZIAS(), resultadoIA: null });
  $('#campoProduto').value = consulta;
  limparCamposVariacao();
  salvarRecente(consulta);
  renderSugestoes();
  atualizarHash();
  render({ ajustes: true });
  $('#resultado').hidden = false;
  $('#secResumo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!estado.ficha.produto && iaPronta()) rodarIA();
}

/* ---------------- ficha ---------------- */
function calcularFicha() {
  if (estado.resultadoIA) {
    return fichaDaIA(estado.consulta, estado.resultadoIA, estado.variacoes, estado.atributos ?? undefined);
  }
  return montarFicha({
    consulta: estado.consulta,
    produtoId: estado.produtoId,
    atributos: estado.atributos ?? undefined,
    variacoes: estado.variacoes,
  });
}

function render({ ajustes = false } = {}) {
  const f = calcularFicha();
  estado.ficha = f;
  renderResumo(f);
  if (ajustes) renderAtributos(f);
  renderOrgaos(f);
  renderDocumentos(f);
  renderVariacoes(f);
  renderPassos(f);
  renderMercado(f);
  $('#avisoLegal').textContent = `${BASE_INFO.aviso} Base interna v${BASE_INFO.versao}, atualizada em ${new Date(`${BASE_INFO.atualizadaEm}T12:00:00`).toLocaleDateString('pt-BR')}. Prazos e custos são faixas de referência, não cotações.`;
  $('#printData').textContent = new Date().toLocaleDateString('pt-BR');
}

function renderResumo(f) {
  const prazo = f.prazoMaxDias ? `até ~${f.prazoMaxDias} dias` : '—';
  const obrig = f.regulamentos.filter((r) => r.compulsorio).length;
  const alternativas = f.alternativas.length
    ? `<span>Não é isso?</span>${f.alternativas.map((a) => `<button type="button" data-produto="${esc(a.id)}">${esc(a.nome)}</button>`).join('')}`
    : '';
  const opcoes = PRODUTOS.map((p) => `<option value="${esc(p.id)}"${f.produto?.id === p.id ? ' selected' : ''}>${esc(p.nome)}</option>`).join('');
  const origem = f.origem === 'ia' ? '<span class="tag tag-ia">Classificado por IA</span>' : '<span class="tag">Base interna</span>';
  const botaoIA = estado.carregandoIA
    ? '<button type="button" class="btn btn-escuro btn-sm" disabled><span class="carregando"></span> Analisando…</button>'
    : estado.resultadoIA
      ? '<button type="button" class="btn btn-escuro btn-sm" data-acao="base">Voltar para a base</button>'
      : '<button type="button" class="btn btn-escuro btn-sm" data-acao="ia">Analisar com IA</button>';

  let banner = '';
  if (f.ia) {
    banner = `<div class="banner-ia"><strong>Ficha montada com apoio da IA (confiança ${esc(f.ia.confianca)}).</strong> ${esc(f.ia.descricao)} ${esc(f.ia.justificativa)}</div>`;
  } else if (!f.produto) {
    banner = `<div class="banner-vazio"><span><strong>Produto não está na base interna.</strong> A ficha abaixo usa só as características marcadas. Para um enquadramento completo, use a IA.</span>${
      estado.carregandoIA ? '' : `<button type="button" class="btn btn-escuro btn-sm" data-acao="ia">${iaPronta() ? 'Analisar com IA' : 'Configurar IA'}</button>`
    }</div>`;
  }

  $('#secResumo').innerHTML = `
    <div>
      <div class="resumo-produto">
        <span class="tag">${esc(f.produto?.categoria ?? 'Não identificado')}</span>${origem}
        <span>Busca: “${esc(f.consulta)}”</span>
      </div>
      <h2>${esc(f.resumo)}</h2>
      ${f.resumoExtra ? `<p class="resumo-extra">${esc(f.resumoExtra)}</p>` : ''}
      <div class="selos">${f.orgaos.map(selo).join('')}</div>
      <div class="resumo-meta">
        <div><strong>${esc(f.produto?.nome ?? '—')}</strong>Produto identificado</div>
        <div><strong>${esc(prazo)}</strong>Prazo estimado (órgãos em paralelo)</div>
        <div><strong>${obrig}</strong>Exigências obrigatórias</div>
        ${f.produto?.norma ? `<div><strong>${esc(f.produto.norma)}</strong>Norma específica</div>` : ''}
      </div>
      <div class="alternativas">
        ${alternativas}
        <label class="sr-only" for="selProduto">Escolher produto da base</label>
        <select id="selProduto"><option value="">Escolher outro produto da base…</option>${opcoes}</select>
      </div>
    </div>
    <div class="resumo-acoes">
      ${botaoIA}
      <button type="button" class="btn btn-contorno btn-sm" data-acao="pdf">Exportar PDF</button>
      <button type="button" class="btn btn-contorno btn-sm" data-acao="copiar">Copiar resumo</button>
      <button type="button" class="btn btn-fantasma btn-sm" data-acao="link">Copiar link</button>
    </div>
    ${banner}`;
}

function renderAtributos(f) {
  $('#atributos').innerHTML = ATRIBUTOS.map((a) => {
    const provavel = f.sinais[a.id]?.provavel ? ' provavel' : '';
    const titulo = provavel ? ` title="Sugerido pelo nome (“${esc(f.sinais[a.id].termo)}”) — confirme"` : '';
    return `<label class="chip-check${provavel}"${titulo}><input type="checkbox" value="${esc(a.id)}"${f.atributos[a.id] ? ' checked' : ''}><span>${esc(a.rotulo)}</span></label>`;
  }).join('');
}

function renderOrgaos(f) {
  const regs = f.regulamentos;
  const cards = regs
    .map((r) => {
      const normas = [...(r.normas ?? [])];
      if (r.id === 'inmetro-eletro' && f.produto?.norma) normas.push(`Parte específica deste produto: ${f.produto.norma}`);
      const item = (rotulo, valor) => `<div class="reg-item"><dt>${esc(rotulo)}</dt><dd>${valor}</dd></div>`;
      return `
      <article class="reg org-${esc(r.orgao)}">
        <div class="reg-topo">
          ${selo(r.orgao)}
          <span class="tag${r.compulsorio ? ' tag-obrig' : ''}">${esc(r.tipo ?? (r.compulsorio ? 'Obrigatório' : 'Orientação'))}</span>
          ${r.confianca === 'conferir' ? '<span class="tag tag-conferir">Conferir número/escopo</span>' : ''}
          ${r.origem === 'ia' ? '<span class="tag tag-ia">Indicado pela IA</span>' : ''}
        </div>
        <h3>${esc(r.titulo)}</h3>
        <p class="reg-ato">${esc(r.ato)}</p>
        <dl class="reg-grade">
          ${item('Modelo de avaliação', esc(r.modelo || '—'))}
          ${item('Normas e requisitos', lista(normas))}
          ${item('Identificação no produto', esc(r.identificacao || '—'))}
          ${item('Prazo estimado', esc(r.prazo || '—'))}
          ${item('Custo estimado', esc(r.custo || '—'))}
          ${r.manutencao ? item('Manutenção', esc(r.manutencao)) : ''}
          ${item('Por que se aplica', lista(r.motivos))}
        </dl>
        ${r.ensaios?.length ? `<details><summary>Ensaios previstos (${r.ensaios.length})</summary>${lista(r.ensaios)}</details>` : ''}
        ${r.fonte ? `<div class="reg-rodape"><a href="${esc(r.fonte.url)}" target="_blank" rel="noopener">Fonte: ${esc(r.fonte.rotulo)}</a></div>` : ''}
      </article>`;
    })
    .join('');
  $('#secOrgaos').innerHTML = `
    <h2 class="titulo-secao">Exigências por órgão <span class="contador">${regs.length}</span></h2>
    ${regs.length ? `<div class="regs">${cards}</div>` : '<p class="vazio">Nenhuma exigência identificada para as características marcadas. Confira os alertas abaixo e, se tiver dúvida, use a análise por IA.</p>'}`;
}

function chaveChecklist(f) {
  if (f.produto && f.produto.id !== 'ia') return f.produto.id;
  return `q:${normalizar(f.consulta)}`;
}

function renderDocumentos(f) {
  const grupos = f.regulamentos.filter((r) => r.documentos?.length);
  const marcados = lerLocal(CHAVE_CHECK, {});
  const base = chaveChecklist(f);
  let total = 0;
  let feitos = 0;
  const html = grupos
    .map((r) => {
      const itens = r.documentos
        .map((d, i) => {
          const id = `${base}|${r.id}|${normalizar(d).slice(0, 60)}`;
          total += 1;
          if (marcados[id]) feitos += 1;
          return `<li><label><input type="checkbox" data-check="${esc(id)}"${marcados[id] ? ' checked' : ''}><span>${esc(d)}</span></label></li>`;
        })
        .join('');
      return `<div class="check-grupo"><h3>${selo(r.orgao)} ${esc(r.titulo)}</h3><ul class="check-lista">${itens}</ul></div>`;
    })
    .join('');
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  $('#secDocumentos').innerHTML = `
    <div class="cabecalho-secao">
      <div>
        <h2 class="titulo-secao">Checklist de documentos <span class="contador">${total}</span></h2>
        <p class="dica">Marque o que já está pronto. Fica salvo neste navegador para este produto.</p>
      </div>
      ${total ? `<div><div class="progresso-texto">${feitos} de ${total} prontos</div><div class="progresso"><span style="width:${pct}%"></span></div></div>` : ''}
    </div>
    ${total ? html : '<p class="vazio">Sem documentos obrigatórios para as exigências atuais.</p>'}`;
}

function renderVariacoes(f) {
  const v = f.variacoes;
  if (!v.informado) {
    $('#secVariacoes').innerHTML = `
      <h2 class="titulo-secao">Variações e família</h2>
      <p class="vazio">Informe voltagens, cores, tamanhos ou marcas em “Variações planejadas” (acima) para ver o que pode ficar na mesma família de certificação e o que precisa de certificação ou ensaio separado.</p>`;
    return;
  }
  const linhas = v.linhas
    .map((l) => {
      const impactos = l.impactos.length
        ? l.impactos
            .map(
              (i) =>
                `<div class="impacto"><span class="impacto-chip tom-${esc(i.tom)}">${esc(i.rotuloImpacto)}</span><div><small>${esc(ORGAOS[i.orgao]?.nome ?? i.orgao)} · ${esc(i.titulo)}</small>${esc(i.texto)}</div></div>`,
            )
            .join('')
        : '<div class="impacto"><span class="impacto-chip tom-ok">Sem impacto</span><div>Esta variação não muda as exigências identificadas.</div></div>';
      return `
      <div class="var-linha">
        <div><h3>${esc(l.rotulo)}</h3><div class="var-valores">${l.valores.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div></div>
        <div class="var-impactos">${impactos}</div>
      </div>`;
    })
    .join('');
  $('#secVariacoes').innerHTML = `
    <h2 class="titulo-secao">Variações e família</h2>
    <div class="tiles">
      <div class="tile"><strong>${v.skus}</strong><span>combinações (SKUs) previstas</span></div>
      <div class="tile"><strong>${v.separadas.length}</strong><span>tipos de variação com certificação separada</span></div>
      <div class="tile"><strong>${v.ensaios.length}</strong><span>tipos de variação com ensaio adicional</span></div>
    </div>
    <div class="var-linhas">${linhas}</div>`;
}

function renderPassos(f) {
  if (!f.passos.length) {
    $('#secPassos').innerHTML = '<h2 class="titulo-secao">Passo a passo</h2><p class="vazio">Sem processo de certificação para as exigências atuais.</p>';
    return;
  }
  $('#secPassos').innerHTML = `
    <h2 class="titulo-secao">Passo a passo e prazos</h2>
    <p class="dica">Processos de órgãos diferentes podem correr em paralelo.</p>
    <div class="passos-grupos">
      ${f.passos
        .map(
          (g) => `<div><h3>${selo(g.orgao)}</h3><ol class="passos">${g.passos
            .map((p) => `<li><strong>${esc(p.etapa)}</strong><p>${esc(p.detalhe)}</p><em>${esc(p.prazo)}</em></li>`)
            .join('')}</ol></div>`,
        )
        .join('')}
    </div>`;
}

function renderMercado(f) {
  $('#secMercado').innerHTML = `
    <div>
      <h2 class="titulo-secao">Marketplaces</h2>
      <ul class="lista-icone">${f.marketplaces.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="titulo-secao">Pontos de atenção <span class="contador">${f.alertas.length}</span></h2>
      ${f.alertas.length ? `<ul class="lista-icone lista-alerta">${f.alertas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : '<p class="vazio">Nenhum alerta.</p>'}
    </div>`;
}

/* ---------------- ações ---------------- */
async function rodarIA() {
  if (!iaPronta()) {
    abrirModalIA();
    return;
  }
  estado.carregandoIA = true;
  renderResumo(estado.ficha);
  try {
    const resultado = await analisar({
      consulta: estado.consulta,
      contexto: { atributos: estado.atributos ?? {}, variacoes: estado.variacoes },
    });
    estado.resultadoIA = resultado;
    estado.atributos = null;
    estado.carregandoIA = false;
    render({ ajustes: true });
    toast('Ficha atualizada com a análise da IA.');
  } catch (err) {
    estado.carregandoIA = false;
    renderResumo(estado.ficha);
    toast(err.message, 6000);
  }
}

function textoResumo(f) {
  const linhas = [
    `FICHA DE CERTIFICAÇÃO — ${f.produto?.nome ?? f.consulta}`,
    `${f.resumo}${f.resumoExtra ? ` (${f.resumoExtra})` : ''}`,
    '',
    'EXIGÊNCIAS',
    ...f.regulamentos.map((r) => `- [${ORGAOS[r.orgao]?.nome ?? r.orgao}] ${r.titulo} — ${r.ato} | ${r.tipo ?? ''} | prazo: ${r.prazo || '—'} | custo: ${r.custo || '—'}`),
  ];
  if (f.variacoes.informado) {
    linhas.push('', `VARIAÇÕES (${f.variacoes.skus} SKUs)`);
    for (const l of f.variacoes.linhas) {
      linhas.push(`- ${l.rotulo}: ${l.valores.join(', ')}`);
      for (const i of l.impactos) linhas.push(`    • ${ORGAOS[i.orgao]?.nome ?? i.orgao}: ${i.rotuloImpacto} — ${i.texto}`);
    }
  }
  if (f.alertas.length) linhas.push('', 'ATENÇÃO', ...f.alertas.map((a) => `- ${a}`));
  linhas.push('', `Gerado em ${new Date().toLocaleDateString('pt-BR')} — ${BASE_INFO.aviso}`);
  return linhas.join('\n');
}

async function copiar(texto, msg) {
  try {
    await navigator.clipboard.writeText(texto);
    toast(msg);
  } catch {
    toast('Não foi possível copiar automaticamente.');
  }
}

function exportarPDF() {
  const abertos = $$('#resultado details:not([open])');
  abertos.forEach((d) => (d.open = true));
  window.addEventListener('afterprint', () => abertos.forEach((d) => (d.open = false)), { once: true });
  window.print();
}

/* ---------------- variações ---------------- */
function limparCamposVariacao() {
  $$('#varVoltagem input').forEach((i) => (i.checked = false));
  ['#varCor', '#varTamanho', '#varMarca'].forEach((s) => ($(s).value = ''));
  $('#varConectividade').checked = false;
}

function lerVariacoes() {
  estado.variacoes = {
    voltagem: $$('#varVoltagem input:checked').map((i) => i.value),
    cor: dividir($('#varCor').value),
    tamanho: dividir($('#varTamanho').value),
    marca: dividir($('#varMarca').value),
    conectividade: $('#varConectividade').checked,
  };
}

/* ---------------- configuração da IA ---------------- */
function atualizarStatusIA() {
  const cfg = lerConfig();
  const pronta = iaPronta(cfg);
  $('#iaStatusPonto').classList.toggle('on', pronta);
  $('#iaStatusTexto').textContent = pronta ? (cfg.modo === 'servidor' ? 'IA: servidor' : 'IA: navegador') : 'IA desligada';
}

function mostrarCamposModo() {
  const modo = $('#formIA input[name=modo]:checked')?.value;
  $$('#formIA .modo-campos').forEach((el) => (el.hidden = el.dataset.modo !== modo));
}

function abrirModalIA() {
  const cfg = lerConfig();
  $(`#formIA input[name=modo][value=${cfg.modo}]`).checked = true;
  $('#iaUrl').value = cfg.url;
  $('#iaToken').value = cfg.token;
  $('#iaChave').value = cfg.chave;
  mostrarCamposModo();
  $('#modalIA').showModal();
}

/* ---------------- eventos ---------------- */
function ligarEventos() {
  $('#formBusca').addEventListener('submit', (e) => {
    e.preventDefault();
    buscar($('#campoProduto').value);
  });

  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-busca],[data-produto],[data-acao]');
    if (!alvo) return;
    if (alvo.dataset.busca) buscar(alvo.dataset.busca);
    else if (alvo.dataset.produto) {
      const p = PRODUTOS.find((x) => x.id === alvo.dataset.produto);
      if (!p) return;
      if (alvo.closest('#catalogo')) buscar(p.nome, p.id);
      else escolherProduto(p.id);
    } else {
      const acao = alvo.dataset.acao;
      if (acao === 'ia') rodarIA();
      if (acao === 'base') {
        estado.resultadoIA = null;
        estado.atributos = null;
        render({ ajustes: true });
      }
      if (acao === 'pdf') exportarPDF();
      if (acao === 'copiar') copiar(textoResumo(estado.ficha), 'Resumo copiado.');
      if (acao === 'link') copiar(location.href, 'Link copiado.');
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'selProduto' && e.target.value) escolherProduto(e.target.value);
    if (e.target.closest('#atributos')) {
      estado.atributos = Object.fromEntries($$('#atributos input').map((i) => [i.value, i.checked]));
      render();
    }
    if (e.target.dataset.check) {
      const marcados = lerLocal(CHAVE_CHECK, {});
      if (e.target.checked) marcados[e.target.dataset.check] = true;
      else delete marcados[e.target.dataset.check];
      gravarLocal(CHAVE_CHECK, marcados);
      renderDocumentos(estado.ficha);
    }
    if (e.target.closest('#varVoltagem') || e.target.id === 'varConectividade') {
      lerVariacoes();
      render();
    }
  });

  let espera;
  ['#varCor', '#varTamanho', '#varMarca'].forEach((s) =>
    $(s).addEventListener('input', () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        lerVariacoes();
        render();
      }, 250);
    }),
  );

  $('#btnCatalogo').addEventListener('click', () => {
    const cat = $('#catalogo');
    if (!cat.innerHTML) renderCatalogo();
    cat.hidden = !cat.hidden;
    $('#btnCatalogo').setAttribute('aria-expanded', String(!cat.hidden));
    $('#btnCatalogo').textContent = cat.hidden ? `Ver todos os ${PRODUTOS.length} produtos da base` : 'Esconder lista de produtos';
  });

  $('#btnConfigIA').addEventListener('click', abrirModalIA);
  $('#btnFecharIA').addEventListener('click', () => $('#modalIA').close());
  $$('#formIA input[name=modo]').forEach((r) => r.addEventListener('change', mostrarCamposModo));
  $('#formIA').addEventListener('submit', () => {
    const cfg = {
      modo: $('#formIA input[name=modo]:checked')?.value ?? 'desligada',
      url: $('#iaUrl').value.trim(),
      token: $('#iaToken').value.trim(),
      chave: $('#iaChave').value.trim(),
    };
    if (!salvarConfig(cfg)) toast('Este navegador bloqueou o armazenamento local; a configuração não foi salva.', 5000);
    else toast(iaPronta(cfg) ? 'IA configurada.' : 'IA desligada.');
    atualizarStatusIA();
    if (estado.ficha) renderResumo(estado.ficha);
  });
}

function escolherProduto(id) {
  Object.assign(estado, { produtoId: id, atributos: null, resultadoIA: null });
  atualizarHash();
  render({ ajustes: true });
}

/* ---------------- início ---------------- */
function iniciar() {
  renderSugestoes();
  ligarEventos();
  atualizarStatusIA();
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('q')) buscar(params.get('q'), PRODUTOS.some((p) => p.id === params.get('p')) ? params.get('p') : null);
}

iniciar();
