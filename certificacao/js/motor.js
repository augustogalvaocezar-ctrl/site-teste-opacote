/* =========================================================================
   Motor de regras — transforma o nome do produto em uma ficha completa.
   Funções puras (sem DOM) para poder rodar no navegador, no Worker e nos
   testes em Node.
   ========================================================================= */
import {
  REGULAMENTOS,
  PRODUTOS,
  SINAIS,
  ATRIBUTOS,
  REGRAS_ATRIBUTO,
  PASSOS,
  MARKETPLACES,
  IMPACTOS,
  DIMENSOES,
  ORGAOS,
  BASE_INFO,
} from './base-regulatoria.js';

/* Regulamento só vale se pelo menos uma destas características estiver marcada */
const DEPENDENCIAS = {
  'anatel-cat2': ['bluetooth', 'wifi', 'rf'],
  'anatel-cat1': ['celular'],
  'anvisa-alimentos': ['alimento'],
};

const ORDEM_ORGAOS = ['INMETRO', 'ANATEL', 'ANVISA', 'ANAC', 'AMBIENTAL'];

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* "panelas eletricas" -> "panela eletrica" (plural simples) */
function singular(texto) {
  return texto
    .split(' ')
    .map((p) => (p.length > 3 && p.endsWith('s') ? p.slice(0, -1) : p))
    .join(' ');
}

function contemFrase(consultaPad, termo) {
  return consultaPad.includes(` ${termo} `);
}

function pontuarTermo(consulta, termo) {
  const t = normalizar(termo);
  if (!t) return 0;
  const variantes = [` ${consulta} `, ` ${singular(consulta)} `];
  const tVariantes = [t, singular(t)];
  const palavras = t.split(' ').length;
  for (const c of variantes) {
    for (const tv of tVariantes) {
      if (contemFrase(c, tv)) return 100 + t.length * 2 + palavras * 5;
    }
  }
  // Todas as palavras significativas do termo aparecem, em qualquer ordem
  const tokensConsulta = new Set(singular(consulta).split(' '));
  const tokensTermo = singular(t).split(' ').filter((p) => p.length >= 3);
  if (tokensTermo.length >= 2 && tokensTermo.every((p) => tokensConsulta.has(p))) {
    return 50 + t.length;
  }
  return 0;
}

export function identificarProduto(consulta) {
  const q = normalizar(consulta);
  if (!q) return { melhor: null, alternativas: [] };
  const ranking = PRODUTOS.map((produto) => {
    let pontos = 0;
    let termo = null;
    for (const t of [produto.nome, ...produto.termos]) {
      const p = pontuarTermo(q, t);
      if (p > pontos) {
        pontos = p;
        termo = t;
      }
    }
    return { produto, pontos, termo };
  })
    .filter((r) => r.pontos >= 50)
    .sort((a, b) => b.pontos - a.pontos);
  return { melhor: ranking[0] ?? null, alternativas: ranking.slice(1, 5) };
}

export function detectarSinais(consulta) {
  const pad = ` ${normalizar(consulta)} `;
  const encontrados = {};
  for (const sinal of SINAIS) {
    const termo = sinal.termos.find((t) => contemFrase(pad, normalizar(t)));
    if (!termo) continue;
    const atual = encontrados[sinal.id];
    if (!atual || (atual.provavel && !sinal.provavel)) {
      encontrados[sinal.id] = { rotulo: sinal.rotulo, termo, provavel: Boolean(sinal.provavel) };
    }
  }
  return encontrados;
}

export function buscarProduto(id) {
  return PRODUTOS.find((p) => p.id === id) ?? null;
}

export function listarCatalogo() {
  const grupos = new Map();
  for (const p of PRODUTOS) {
    if (!grupos.has(p.categoria)) grupos.set(p.categoria, []);
    grupos.get(p.categoria).push(p);
  }
  return [...grupos.entries()].map(([categoria, produtos]) => ({ categoria, produtos }));
}

/* Atributos iniciais = do produto + detectados no texto */
export function atributosIniciais(produto, sinais) {
  const atributos = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, false]));
  for (const [id, valor] of Object.entries(produto?.atributos ?? {})) atributos[id] = Boolean(valor);
  for (const id of Object.keys(sinais ?? {})) atributos[id] = true;
  return atributos;
}

function maiorPrazoEmDias(regs) {
  let maior = 0;
  for (const r of regs) {
    const nums = String(r.prazo ?? '').match(/\d+/g);
    if (nums && /dia/.test(r.prazo)) maior = Math.max(maior, ...nums.map(Number));
  }
  return maior;
}

function variacoesDe(reg) {
  if (reg.variacoes) return reg.variacoes;
  const ref = reg.orgao === 'ANATEL' ? REGULAMENTOS['anatel-cat2'] : REGULAMENTOS['inmetro-eletro'];
  return reg.orgao === 'ANATEL' || reg.orgao === 'INMETRO' ? ref.variacoes : null;
}

export function analisarVariacoes(regs, variacoes = {}) {
  const valores = {
    voltagem: (variacoes.voltagem ?? []).filter(Boolean),
    cor: (variacoes.cor ?? []).filter(Boolean),
    tamanho: (variacoes.tamanho ?? []).filter(Boolean),
    conectividade: variacoes.conectividade ? ['Com conectividade', 'Sem conectividade'] : [],
    marca: (variacoes.marca ?? []).filter(Boolean),
  };
  const linhas = [];
  for (const dim of Object.keys(DIMENSOES)) {
    if (!valores[dim].length) continue;
    const impactos = [];
    for (const reg of regs) {
      const regra = variacoesDe(reg)?.[dim];
      if (!regra || regra.impacto === 'sem-impacto') continue;
      impactos.push({
        regId: reg.id,
        orgao: reg.orgao,
        titulo: reg.titulo,
        impacto: regra.impacto,
        rotuloImpacto: IMPACTOS[regra.impacto]?.rotulo ?? regra.impacto,
        tom: IMPACTOS[regra.impacto]?.tom ?? 'neutro',
        texto: regra.texto,
      });
    }
    linhas.push({ dimensao: dim, rotulo: DIMENSOES[dim], valores: valores[dim], impactos });
  }
  const skus = Object.entries(valores).reduce((acc, [, v]) => acc * Math.max(1, v.length), 1);
  const separadas = linhas.filter((l) => l.impactos.some((i) => i.impacto === 'novo-certificado')).map((l) => l.rotulo);
  const ensaios = linhas.filter((l) => l.impactos.some((i) => i.impacto === 'ensaio-adicional')).map((l) => l.rotulo);
  return { linhas, skus, separadas, ensaios, informado: linhas.length > 0 };
}

/**
 * Monta a ficha completa.
 * @param {object} p
 * @param {string} p.consulta            texto digitado
 * @param {string} [p.produtoId]         força um produto do catálogo
 * @param {object} [p.produtoIA]         produto sintético vindo da IA
 * @param {object} [p.atributos]         atributos editados na tela
 * @param {object} [p.variacoes]         variações informadas
 * @param {Array}  [p.extras]            regulamentos fora da base (IA)
 */
export function montarFicha(p) {
  const consulta = String(p.consulta ?? '').trim();
  const ident = identificarProduto(consulta);
  const sinais = detectarSinais(consulta);
  const produto = p.produtoIA ?? (p.produtoId ? buscarProduto(p.produtoId) : ident.melhor?.produto ?? null);
  const atributos = p.atributos ? { ...atributosIniciais(null, {}), ...p.atributos } : atributosIniciais(produto, sinais);

  /* 1. Regulamentos do produto + das características */
  const motivos = new Map();
  const adicionar = (id, motivo) => {
    if (!REGULAMENTOS[id]) return;
    if (!motivos.has(id)) motivos.set(id, []);
    if (!motivos.get(id).includes(motivo)) motivos.get(id).push(motivo);
  };
  for (const id of produto?.regulamentos ?? []) adicionar(id, `Produto: ${produto.nome}`);
  for (const atr of ATRIBUTOS) {
    if (!atributos[atr.id]) continue;
    for (const id of REGRAS_ATRIBUTO[atr.id] ?? []) adicionar(id, `Característica: ${atr.rotulo}`);
  }

  const alertas = [];
  /* 2. Remove o que depende de característica desmarcada */
  for (const [id, deps] of Object.entries(DEPENDENCIAS)) {
    if (motivos.has(id) && !deps.some((d) => atributos[d])) {
      motivos.delete(id);
      alertas.push(`${REGULAMENTOS[id].titulo} foi removido porque nenhuma característica que o exige está marcada.`);
    }
  }
  if (motivos.has('anatel-cat1') && motivos.has('anatel-cat2')) {
    motivos.delete('anatel-cat2');
    alertas.push('Os rádios Wi-Fi/Bluetooth são avaliados dentro da homologação Categoria I.');
  }

  const regs = [...motivos.entries()]
    .map(([id, mot]) => ({ id, ...REGULAMENTOS[id], motivos: mot, origem: 'base' }))
    .concat(
      (p.extras ?? []).map((e, i) => ({
        id: `extra-${i + 1}`,
        variacoes: null,
        alertas: [],
        fonte: null,
        confianca: 'conferir',
        ...e,
        motivos: [e.motivo || 'Indicado pela análise por IA'],
        origem: 'ia',
      })),
    )
    .sort((a, b) => ORDEM_ORGAOS.indexOf(a.orgao) - ORDEM_ORGAOS.indexOf(b.orgao));

  /* 3. Alertas */
  if (!produto) {
    alertas.unshift('Produto não encontrado na base: a ficha considera só as características marcadas. Use "Analisar com IA" para um enquadramento completo.');
  }
  for (const nota of produto?.notas ?? []) alertas.push(nota);
  for (const reg of regs) for (const a of reg.alertas ?? []) if (!alertas.includes(a)) alertas.push(a);
  const temInmetro = regs.some((r) => r.orgao === 'INMETRO');
  if (atributos.eletrico && !temInmetro) {
    alertas.push('Produto ligado à tomada sem portaria INMETRO identificada: confira se ele aparece na Tabela 1 do Anexo III da Portaria INMETRO nº 148/2022.');
  }
  if (atributos.infantil && !temInmetro) {
    alertas.push('Produto para crianças: verifique se ele é brinquedo (Portaria 302/2021) ou artigo escolar (Portaria 423/2021).');
  }
  if (atributos.saude) {
    alertas.push('Produto de saúde/medição: pode exigir regularização na ANVISA e controle metrológico do INMETRO — fora da base atual. Use a análise por IA e confirme com especialista.');
  }
  if (atributos.bateria) {
    alertas.push('Baterias de lítio: o transporte (importação e envio aéreo) exige relatório UN 38.3 e ficha de segurança (MSDS) do fornecedor.');
  }
  for (const [id, s] of Object.entries(sinais)) {
    if (s.provavel) alertas.push(`O nome sugere "${s.rotulo}" (termo "${s.termo}"): confirme se o produto realmente tem esse recurso e ajuste as características.`);
    else if (!produto?.atributos?.[id]) alertas.push(`Detectado no nome: ${s.rotulo}.`);
  }
  if (regs.some((r) => r.confianca === 'conferir')) {
    alertas.push('Itens marcados como "conferir" precisam de confirmação do número ou do escopo vigente antes de contratar ensaios.');
  }

  /* 4. Resumo */
  const obrigatorios = regs.filter((r) => r.compulsorio);
  const orgaos = ORDEM_ORGAOS.filter((o) => obrigatorios.some((r) => r.orgao === o));
  const certificacoes = orgaos.filter((o) => o === 'INMETRO' || o === 'ANATEL');
  let resumo;
  if (certificacoes.length === 2) resumo = 'Precisa de INMETRO e ANATEL';
  else if (certificacoes.length === 1) resumo = `Precisa de ${certificacoes[0]}`;
  else if (!produto) resumo = 'Enquadramento pendente: produto fora da base';
  else resumo = 'Sem certificação INMETRO/ANATEL obrigatória';
  const outros = orgaos.filter((o) => !certificacoes.includes(o)).map((o) => ORGAOS[o].nome);
  const resumoExtra = outros.length ? `Também: ${outros.join(', ')}` : '';

  const passos = ORDEM_ORGAOS.filter((o) => regs.some((r) => r.orgao === o) && PASSOS[o]).map((o) => ({ orgao: o, nome: ORGAOS[o].nome, passos: PASSOS[o] }));
  const marketplaces = [...MARKETPLACES.GERAL, ...orgaos.flatMap((o) => MARKETPLACES[o] ?? [])];
  if (regs.some((r) => r.orgao === 'ANAC')) marketplaces.push(...MARKETPLACES.ANAC);

  return {
    consulta,
    produto: produto ? { id: produto.id, nome: produto.nome, categoria: produto.categoria, norma: produto.norma ?? '' } : null,
    pontuacao: p.produtoIA ? null : ident.melhor?.pontos ?? null,
    alternativas: ident.alternativas.map((a) => ({ id: a.produto.id, nome: a.produto.nome })),
    origem: p.produtoIA ? 'ia' : 'base',
    atributos,
    sinais,
    regulamentos: regs,
    orgaos,
    resumo,
    resumoExtra,
    prazoMaxDias: maiorPrazoEmDias(regs.filter((r) => r.compulsorio)),
    variacoes: analisarVariacoes(regs, p.variacoes),
    passos,
    marketplaces,
    alertas,
    base: BASE_INFO,
  };
}
