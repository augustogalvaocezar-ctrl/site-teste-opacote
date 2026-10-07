/* =========================================================================
   Análise por IA (Claude) — usada quando o produto não está na base ou
   quando o usuário pede uma segunda opinião.
   A IA só CLASSIFICA o produto (características + quais regulamentos da
   base se aplicam + eventuais regulamentos fora da base). O conteúdo da
   ficha continua vindo da base curada sempre que possível.
   Este módulo recebe um cliente do SDK já criado, então funciona tanto no
   navegador quanto no Worker (servidor).
   ========================================================================= */
import { REGULAMENTOS, PRODUTOS, ATRIBUTOS, IDS_REGULAMENTOS } from './base-regulatoria.js';
import { montarFicha } from './motor.js';

export const MODELO = 'claude-opus-5-5';

const ATRIBUTO_IDS = ATRIBUTOS.map((a) => a.id);
const textoLista = { type: 'array', items: { type: 'string' } };

export const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['produto', 'categoria', 'descricao', 'atributos', 'regulamentosBase', 'normaEspecifica', 'regulamentosExtras', 'alertas', 'justificativa', 'confianca'],
  properties: {
    produto: { type: 'string', description: 'Nome do produto, claro e curto, em português' },
    categoria: { type: 'string' },
    descricao: { type: 'string', description: 'O que o produto é e como funciona, em uma ou duas frases' },
    atributos: {
      type: 'object',
      additionalProperties: false,
      required: ATRIBUTO_IDS,
      properties: Object.fromEntries(ATRIBUTO_IDS.map((id) => [id, { type: 'boolean' }])),
    },
    regulamentosBase: { type: 'array', items: { type: 'string', enum: IDS_REGULAMENTOS } },
    normaEspecifica: { type: 'string', description: 'Parte específica de norma (ex.: IEC 60335-2-9) ou string vazia' },
    regulamentosExtras: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['orgao', 'titulo', 'ato', 'motivo', 'compulsorio', 'modelo', 'normas', 'ensaios', 'documentos', 'identificacao', 'prazo', 'custo'],
        properties: {
          orgao: { type: 'string', enum: ['INMETRO', 'ANATEL', 'ANVISA', 'ANAC', 'AMBIENTAL'] },
          titulo: { type: 'string' },
          ato: { type: 'string' },
          motivo: { type: 'string' },
          compulsorio: { type: 'boolean' },
          modelo: { type: 'string' },
          normas: textoLista,
          ensaios: textoLista,
          documentos: textoLista,
          identificacao: { type: 'string' },
          prazo: { type: 'string' },
          custo: { type: 'string' },
        },
      },
    },
    alertas: textoLista,
    justificativa: { type: 'string' },
    confianca: { type: 'string', enum: ['alta', 'media', 'baixa'] },
  },
};

const regulamentosTexto = Object.entries(REGULAMENTOS)
  .map(([id, r]) => `- ${id} | ${r.orgao} | ${r.titulo} | ${r.ato} | Escopo: ${r.escopo}`)
  .join('\n');

const catalogoTexto = PRODUTOS.map((p) => `- ${p.nome}: ${p.regulamentos.join(', ') || 'nenhum'}`).join('\n');

const atributosTexto = ATRIBUTOS.map((a) => `- ${a.id}: ${a.rotulo}`).join('\n');

export const SYSTEM_PROMPT = `Você é especialista em regulamentação de produtos no Brasil (INMETRO, ANATEL, ANVISA, ANAC e logística reversa) e apoia a Opacote, empresa de marcas próprias que importa e vende em marketplaces (Mercado Livre, Shopee, Amazon, Magalu).

Sua tarefa: dado o nome de um produto, classificar o que ele precisa para ser vendido legalmente no Brasil. A ficha final é montada a partir da base interna abaixo, então:
1. Marque as características do produto (atributos). Rádio (Bluetooth, Wi-Fi, RF, NFC, carregamento por indução) leva à ANATEL; chip 4G/5G leva à Categoria I; "sem fio" em ferramenta significa bateria, não rádio; controle infravermelho não é rádio.
2. Em regulamentosBase, liste os ids da base que se aplicam. Use a base sempre que ela cobrir o caso.
3. Só use regulamentosExtras para exigências que a base não cobre (ex.: produto para saúde na ANVISA, metrologia legal, outra portaria INMETRO). Nunca invente número de portaria, resolução ou ato: se não tiver certeza do número vigente, escreva o nome do regulamento e "(confirmar número vigente)". Prazo e custo são faixas aproximadas em reais/dias, ou "Consultar organismo".
4. Em alertas, aponte dúvidas de enquadramento, pontos que mudam a exigência (ex.: versão com Wi-Fi, faixa etária, alimentação 127/220 V vs. USB) e o que confirmar com o OCP/OCD.
5. Seja conservador: na dúvida entre exigir ou não, aponte a dúvida no alerta e use confiança "media" ou "baixa".
Responda em português do Brasil.

Características disponíveis:
${atributosTexto}

Regulamentos da base (id | órgão | título | ato | escopo):
${regulamentosTexto}

Exemplos do catálogo (produto: regulamentos):
${catalogoTexto}`;

const ROTULO_ATRIBUTO = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, a.rotulo]));

export function montarPedido(consulta, contexto = {}) {
  const linhas = [`Produto: "${String(consulta).slice(0, 300)}"`];
  const marcados = Object.entries(contexto.atributos ?? {})
    .filter(([id, v]) => v && ROTULO_ATRIBUTO[id])
    .map(([id]) => ROTULO_ATRIBUTO[id]);
  if (marcados.length) linhas.push(`Características informadas pelo usuário: ${marcados.join(', ')}.`);
  const v = contexto.variacoes ?? {};
  const partes = [];
  for (const [chave, rotulo] of [['voltagem', 'voltagens'], ['cor', 'cores'], ['tamanho', 'tamanhos/potências'], ['marca', 'marcas']]) {
    const itens = (Array.isArray(v[chave]) ? v[chave] : []).map((x) => String(x).slice(0, 60)).slice(0, 20);
    if (itens.length) partes.push(`${rotulo}: ${itens.join(', ')}`);
  }
  if (v.conectividade) partes.push('terá versão com e sem conectividade');
  if (partes.length) linhas.push(`Variações planejadas: ${partes.join('; ')}.`);
  return linhas.join('\n');
}

export class ErroIA extends Error {}

function validarResultado(r) {
  if (!r || typeof r !== 'object') throw new ErroIA('Resposta da IA veio vazia.');
  return {
    ...r,
    regulamentosBase: (r.regulamentosBase ?? []).filter((id) => REGULAMENTOS[id]),
    regulamentosExtras: Array.isArray(r.regulamentosExtras) ? r.regulamentosExtras : [],
    alertas: Array.isArray(r.alertas) ? r.alertas : [],
    atributos: Object.fromEntries(ATRIBUTO_IDS.map((id) => [id, Boolean(r.atributos?.[id])])),
  };
}

/** Chama o Claude e devolve a classificação validada. */
export async function analisarComClaude(client, { consulta, contexto } = {}) {
  const resposta = await client.beta.messages.create({
    model: MODELO,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: montarPedido(consulta, contexto) }],
  });
  if (resposta.stop_reason === 'refusal') {
    throw new ErroIA('A IA não conseguiu analisar este pedido. Reformule o nome do produto.');
  }
  if (resposta.stop_reason === 'max_tokens') {
    throw new ErroIA('A resposta da IA foi cortada. Tente de novo com um nome de produto mais objetivo.');
  }
  const texto = resposta.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new ErroIA('A resposta da IA veio em formato inválido.');
  }
  return { ...validarResultado(json), modelo: resposta.model };
}

/** Traduz erros do SDK em mensagem + status HTTP (Anthropic = classe do SDK). */
export function mensagemDeErro(err, Anthropic) {
  if (err instanceof ErroIA) return { status: 502, mensagem: err.message };
  if (Anthropic) {
    if (err instanceof Anthropic.APIConnectionError) return { status: 503, mensagem: 'Sem conexão com a API da Anthropic. Verifique a internet e tente de novo.' };
    if (err instanceof Anthropic.AuthenticationError) return { status: 401, mensagem: 'Chave de API inválida. Confira a chave nas configurações da IA.' };
    if (err instanceof Anthropic.PermissionDeniedError) return { status: 403, mensagem: 'A chave não tem permissão para usar este modelo.' };
    if (err instanceof Anthropic.RateLimitError) return { status: 429, mensagem: 'Limite de uso da API atingido. Tente de novo em alguns instantes.' };
    if (err instanceof Anthropic.BadRequestError) return { status: 400, mensagem: `A API recusou a requisição: ${err.message}` };
    if (err instanceof Anthropic.InternalServerError) return { status: 502, mensagem: 'A API da Anthropic está instável. Tente de novo em instantes.' };
    if (err instanceof Anthropic.APIError) return { status: 502, mensagem: `Erro da API: ${err.message}` };
  }
  return { status: 500, mensagem: err?.message || 'Erro inesperado na análise por IA.' };
}

/** Converte a classificação da IA em ficha completa (mesmo formato da base). */
export function fichaDaIA(consulta, resultado, variacoes, atributos) {
  const produtoIA = {
    id: 'ia',
    nome: resultado.produto || consulta,
    categoria: resultado.categoria || 'Classificado por IA',
    norma: resultado.normaEspecifica || '',
    regulamentos: resultado.regulamentosBase,
    atributos: resultado.atributos,
    notas: resultado.alertas,
  };
  const ficha = montarFicha({
    consulta,
    produtoIA,
    atributos: atributos ?? resultado.atributos,
    variacoes,
    extras: resultado.regulamentosExtras,
  });
  ficha.ia = {
    descricao: resultado.descricao,
    justificativa: resultado.justificativa,
    confianca: resultado.confianca,
    modelo: resultado.modelo,
  };
  return ficha;
}
