// Rodar com: node --test certificacao/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { montarFicha, identificarProduto, detectarSinais, normalizar } from '../js/motor.js';
import { PRODUTOS, REGULAMENTOS, ATRIBUTOS } from '../js/base-regulatoria.js';

const ids = (ficha) => ficha.regulamentos.map((r) => r.id);

test('base: todo produto aponta para regulamentos existentes e ids únicos', () => {
  const vistos = new Set();
  for (const p of PRODUTOS) {
    assert.ok(!vistos.has(p.id), `id duplicado: ${p.id}`);
    vistos.add(p.id);
    for (const r of p.regulamentos) assert.ok(REGULAMENTOS[r], `${p.id} -> regulamento inexistente ${r}`);
    for (const a of Object.keys(p.atributos)) assert.ok(ATRIBUTOS.some((x) => x.id === a), `${p.id} -> atributo inexistente ${a}`);
  }
});

test('base: produto com ANATEL/ANVISA tem a característica que sustenta a exigência', () => {
  // Sem isso o motor removeria o regulamento da ficha padrão do próprio produto.
  for (const p of PRODUTOS) {
    const ficha = montarFicha({ consulta: p.nome, produtoId: p.id });
    for (const r of p.regulamentos) {
      if (r === 'anatel-cat2' && ids(ficha).includes('anatel-cat1')) continue;
      assert.ok(ids(ficha).includes(r), `${p.id} perdeu ${r} na ficha padrão`);
    }
  }
});

test('normalizar remove acento e pontuação', () => {
  assert.equal(normalizar('Fritadeira Elétrica Air-Fryer 4,5L'), 'fritadeira eletrica air fryer 4 5l');
});

test('air fryer → INMETRO (148) + ANVISA, sem ANATEL', () => {
  const f = montarFicha({ consulta: 'Air fryer 4L bivolt' });
  assert.equal(f.produto.id, 'air-fryer');
  assert.ok(ids(f).includes('inmetro-eletro'));
  assert.ok(ids(f).includes('anvisa-alimentos'));
  assert.ok(!f.orgaos.includes('ANATEL'));
  assert.equal(f.veredito, 'sim');
  assert.ok(f.resumo.startsWith('Sim, precisa de INMETRO'));
});

test('air fryer com Wi-Fi → INMETRO e ANATEL', () => {
  const f = montarFicha({ consulta: 'Air fryer com wi-fi 5L' });
  assert.ok(f.orgaos.includes('INMETRO'));
  assert.ok(f.orgaos.includes('ANATEL'));
  assert.equal(f.resumo, 'Sim, precisa de INMETRO e ANATEL');
});

test('fone bluetooth → ANATEL Categoria II', () => {
  const f = montarFicha({ consulta: 'fone de ouvido bluetooth TWS' });
  assert.equal(f.produto.id, 'fone-bluetooth');
  assert.ok(ids(f).includes('anatel-cat2'));
  assert.ok(!f.orgaos.includes('INMETRO'));
});

test('parafusadeira sem fio NÃO vira ANATEL', () => {
  const f = montarFicha({ consulta: 'Parafusadeira sem fio 12V' });
  assert.equal(f.produto.id, 'ferramenta-eletrica');
  assert.ok(!f.orgaos.includes('ANATEL'));
});

test('carrinho de controle remoto → brinquedos + ANATEL', () => {
  const f = montarFicha({ consulta: 'Carrinho de controle remoto infantil' });
  assert.equal(f.produto.id, 'carrinho-controle');
  assert.deepEqual(f.orgaos.slice(0, 2), ['INMETRO', 'ANATEL']);
});

test('smartwatch com chip 4G → Categoria I (sem duplicar Categoria II)', () => {
  const f = montarFicha({ consulta: 'Smartwatch 4G com chip' });
  assert.ok(ids(f).includes('anatel-cat1'));
  assert.ok(!ids(f).includes('anatel-cat2'));
});

test('lâmpada inteligente → LED + ANATEL', () => {
  const f = montarFicha({ consulta: 'Lâmpada inteligente RGB Alexa' });
  assert.equal(f.produto.id, 'lampada-inteligente');
  assert.ok(ids(f).includes('inmetro-led'));
  assert.ok(ids(f).includes('anatel-cat2'));
});

test('panela de pressão tem prioridade sobre panela genérica', () => {
  const f = montarFicha({ consulta: 'Panela de pressão 4,5 litros' });
  assert.equal(f.produto.id, 'panela-pressao');
});

test('carregador de celular vence "celular"', () => {
  const r = identificarProduto('carregador de celular turbo 20W');
  assert.equal(r.melhor.produto.id, 'carregador-celular');
});

test('plural é reconhecido', () => {
  assert.equal(identificarProduto('jogo de panelas antiaderentes').melhor.produto.id, 'panela');
});

test('produto desconhecido usa só as características', () => {
  const f = montarFicha({ consulta: 'Gadget xyz bluetooth' });
  assert.equal(f.produto, null);
  assert.ok(ids(f).includes('anatel-cat2'));
  assert.ok(f.alertas[0].includes('fora da lista'));
});

test('"smart" é só provável e gera alerta de confirmação', () => {
  const s = detectarSinais('Garrafa smart');
  assert.equal(s.wifi.provavel, true);
});

test('desmarcar Bluetooth remove a ANATEL do fone', () => {
  const f = montarFicha({ consulta: 'fone bluetooth', atributos: { bluetooth: false, bateria: true } });
  assert.ok(!ids(f).includes('anatel-cat2'));
});

test('variações: cores em brinquedo pedem ensaio químico; SKUs multiplicam', () => {
  const f = montarFicha({ consulta: 'boneca', variacoes: { cor: ['rosa', 'azul', 'lilás'], tamanho: ['30 cm', '45 cm'] } });
  const cor = f.variacoes.linhas.find((l) => l.dimensao === 'cor');
  assert.ok(cor.impactos.some((i) => i.impacto === 'ensaio-adicional'));
  assert.equal(f.variacoes.skus, 6);
});

test('variações: versão com e sem rádio exige homologação separada', () => {
  const f = montarFicha({ consulta: 'caixa de som bluetooth', variacoes: { conectividade: true, voltagem: [] } });
  assert.ok(f.variacoes.separadas.length > 0);
});

test('extras da IA entram na ficha com origem "ia"', () => {
  const f = montarFicha({
    consulta: 'Termômetro digital',
    produtoIA: { id: 'ia', nome: 'Termômetro clínico digital', categoria: 'Saúde', regulamentos: [], atributos: { saude: true } },
    atributos: { saude: true, bateria: true },
    extras: [{ orgao: 'ANVISA', titulo: 'Produto para saúde', ato: 'RDC (confirmar)', compulsorio: true, modelo: '', normas: [], ensaios: [], documentos: [], identificacao: '', prazo: '60 a 120 dias', custo: '' }],
  });
  assert.equal(f.origem, 'ia');
  assert.ok(f.regulamentos.some((r) => r.origem === 'ia' && r.orgao === 'ANVISA'));
  assert.equal(f.prazoMaxDias, 120);
});

test('veredito: produto conhecido sem certificação → NÃO', () => {
  const f = montarFicha({ consulta: 'Garrafa térmica inox 1L' });
  assert.equal(f.veredito, 'nao');
  assert.ok(f.resumoExtra.includes('ANVISA'));
});

test('veredito: produto desconhecido sem respostas → pendente', () => {
  const f = montarFicha({ consulta: 'Cadeira gamer reclinável' });
  assert.equal(f.veredito, 'pendente');
});

test('veredito: desconhecido que liga na tomada → provavelmente INMETRO', () => {
  const f = montarFicha({ consulta: 'Cadeira massageadora', atributos: { eletrico: true }, respondido: true });
  assert.equal(f.veredito, 'provavel');
  assert.ok(f.regulamentos.find((r) => r.id === 'inmetro-eletro').provavel);
});

test('veredito: desconhecido com rádio → SIM (ANATEL) e provável INMETRO', () => {
  const f = montarFicha({ consulta: 'Cadeira gamer', atributos: { eletrico: true, bluetooth: true }, respondido: true });
  assert.equal(f.veredito, 'sim');
  assert.equal(f.resumo, 'Sim, precisa de ANATEL (e provavelmente INMETRO)');
});

test('veredito: desconhecido respondendo tudo "não" → NÃO', () => {
  const f = montarFicha({ consulta: 'Cadeira gamer', atributos: {}, respondido: true });
  assert.equal(f.veredito, 'nao');
});

test('"elétrico" no nome marca ligado à tomada', () => {
  assert.ok(detectarSinais('Cobertor elétrico casal').eletrico);
});

test('cobertor elétrico → INMETRO; bola infantil → provavelmente brinquedo', () => {
  assert.equal(montarFicha({ consulta: 'Cobertor elétrico casal' }).veredito, 'sim');
  const f = montarFicha({ consulta: 'Bola de futebol infantil' });
  assert.equal(f.veredito, 'provavel');
  assert.ok(f.resumo.includes('INMETRO'));
});

test('regra geral não duplica INMETRO de produto já certificado', () => {
  const f = montarFicha({ consulta: 'Boneca infantil' });
  assert.equal(f.regulamentos.filter((r) => r.orgao === 'INMETRO').length, 1);
});

test('garrafa infantil não vira brinquedo (só alerta)', () => {
  const f = montarFicha({ consulta: 'Garrafa térmica infantil' });
  assert.equal(f.veredito, 'nao');
  assert.ok(f.alertas.some((a) => a.includes('brinquedo')));
});
