/* =========================================================================
   Worker (Cloudflare) — guarda a chave da Anthropic no servidor e expõe
   POST /analisar para a página de certificação.
   Corpo: { consulta: string, contexto?: { atributos, variacoes } }
   Resposta: { resultado } ou { erro }
   ========================================================================= */
import Anthropic from '@anthropic-ai/sdk';
import { analisarComClaude, mensagemDeErro } from '../../js/ia-claude.js';

function json(dados, status, cors) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors },
  });
}

export default {
  async fetch(request, env) {
    const origem = request.headers.get('Origin') ?? '';
    const permitidas = (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origemOk = permitidas.length === 0 || permitidas.includes(origem);
    const cors = origemOk
      ? {
          'access-control-allow-origin': origem || '*',
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type, x-acesso',
          vary: 'Origin',
        }
      : {};

    if (request.method === 'OPTIONS') return new Response(null, { status: origemOk ? 204 : 403, headers: cors });
    const { pathname } = new URL(request.url);
    if (request.method !== 'POST' || !['/', '/analisar'].includes(pathname)) return json({ erro: 'Use POST /analisar.' }, 404, cors);
    if (!origemOk) return json({ erro: 'Origem não autorizada.' }, 403, cors);
    if (env.ACCESS_TOKEN && request.headers.get('x-acesso') !== env.ACCESS_TOKEN) {
      return json({ erro: 'Senha de acesso inválida.' }, 401, cors);
    }
    if (!env.ANTHROPIC_API_KEY) return json({ erro: 'ANTHROPIC_API_KEY não configurada no Worker.' }, 500, cors);

    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return json({ erro: 'Corpo da requisição precisa ser JSON.' }, 400, cors);
    }
    const consulta = typeof corpo?.consulta === 'string' ? corpo.consulta.trim() : '';
    if (consulta.length < 2 || consulta.length > 300) return json({ erro: 'Informe o nome do produto (2 a 300 caracteres).' }, 400, cors);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const resultado = await analisarComClaude(client, { consulta, contexto: corpo.contexto ?? {} });
      return json({ resultado }, 200, cors);
    } catch (err) {
      const { status, mensagem } = mensagemDeErro(err, Anthropic);
      return json({ erro: mensagem }, status, cors);
    }
  },
};
