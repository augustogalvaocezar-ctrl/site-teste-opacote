/* =========================================================================
   Lado do navegador da análise por IA: configuração (salva neste
   navegador) e chamada pelo servidor (Worker) ou direto com o SDK.
   ========================================================================= */
import { analisarComClaude, mensagemDeErro } from './ia-claude.js';

const CHAVE_CONFIG = 'opacote-cert-ia';
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm';

export function lerConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem(CHAVE_CONFIG) || '{}');
    return { modo: 'desligada', url: '', token: '', chave: '', ...cfg };
  } catch {
    return { modo: 'desligada', url: '', token: '', chave: '' };
  }
}

export function salvarConfig(cfg) {
  try {
    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}

export function iaPronta(cfg = lerConfig()) {
  return (cfg.modo === 'servidor' && Boolean(cfg.url)) || (cfg.modo === 'direto' && Boolean(cfg.chave));
}

async function viaServidor(cfg, pedido) {
  let resp;
  try {
    resp = await fetch(cfg.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(cfg.token ? { 'x-acesso': cfg.token } : {}) },
      body: JSON.stringify(pedido),
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor da IA. Confira o endereço nas configurações.');
  }
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok || !dados.resultado) throw new Error(dados.erro || `Servidor da IA respondeu com erro ${resp.status}.`);
  return dados.resultado;
}

let sdk = null;
async function viaNavegador(cfg, pedido) {
  try {
    sdk ??= (await import(SDK_URL)).default;
  } catch {
    throw new Error('Não foi possível carregar o SDK da Anthropic (cdn.jsdelivr.net).');
  }
  const client = new sdk({ apiKey: cfg.chave, dangerouslyAllowBrowser: true });
  try {
    return await analisarComClaude(client, pedido);
  } catch (err) {
    throw new Error(mensagemDeErro(err, sdk).mensagem);
  }
}

/** pedido = { consulta, contexto: { atributos, variacoes } } */
export async function analisar(pedido) {
  const cfg = lerConfig();
  if (cfg.modo === 'servidor' && cfg.url) return viaServidor(cfg, pedido);
  if (cfg.modo === 'direto' && cfg.chave) return viaNavegador(cfg, pedido);
  throw new Error('A análise por IA está desligada. Configure em "IA" no topo da página.');
}
