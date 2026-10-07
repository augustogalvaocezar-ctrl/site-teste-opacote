# Sistema de Certificação — Opacote

Página interna (`/certificacao/`) em que você digita o nome de um produto e recebe a ficha completa:

- **O que precisa:** INMETRO, ANATEL, os dois, e também ANVISA, ANAC e logística reversa quando se aplicam
- **Enquadramento:** portaria ou ato, modelo de certificação, normas, selo e registro
- **Ensaios previstos e checklist de documentos**, com o progresso salvo no navegador
- **Variações e família:** voltagem, cores, tamanhos ou potências, versões com e sem rádio, marcas. Mostra o que fica na mesma família e o que exige ensaio adicional ou certificação separada
- **Passo a passo, prazos e custos estimados**, exigências dos marketplaces e pontos de atenção
- **Exportar PDF**, copiar o resumo e copiar um link direto para a ficha

> Os prazos e custos são faixas de referência, não cotações. Antes de pagar ensaios, confirme o enquadramento com um OCP (INMETRO) ou OCD (ANATEL). Itens marcados como **"conferir"** precisam de confirmação do número ou do escopo vigente.

## Como funciona

1. **Base de regras** (`js/base-regulatoria.js`): regulamentos, catálogo de produtos e sinais. Sinais são palavras no nome do produto (como "bluetooth", "wi-fi", "4G" ou "infantil") que acrescentam exigências.
2. **Motor** (`js/motor.js`): identifica o produto e as características e monta a ficha. Roda 100% no navegador, sem custo.
3. **IA (Claude)** (`js/ia-claude.js`): entra quando o produto não está na base ou quando você clica em **Analisar com IA**. A IA só classifica o produto (características e regulamentos da base que se aplicam). O conteúdo da ficha continua vindo da base curada. Ela usa o modelo `claude-opus-5-5`, com saída em JSON validada por schema e fallback automático em caso de recusa.

## Abrir localmente

A página usa módulos JavaScript, então precisa de um servidor (abrir o arquivo direto não funciona):

```bash
python3 -m http.server 8000
# acesse http://localhost:8000/certificacao/
```

## Ligar a IA

Clique em **IA** no topo da página e escolha um modo:

- **Servidor da empresa (recomendado):** a chave da Anthropic fica no servidor.
  ```bash
  cd certificacao/worker
  npm install
  npx wrangler secret put ANTHROPIC_API_KEY
  npx wrangler secret put ACCESS_TOKEN      # opcional: senha da equipe
  npx wrangler deploy
  ```
  Ajuste `ALLOWED_ORIGINS` no `wrangler.toml` para o domínio onde a página está publicada. Depois, cole o endereço `https://…workers.dev/analisar` (e a senha, se houver) na configuração da IA.
- **Chave neste navegador (teste):** cole a chave `sk-ant-…`. Ela fica salva só naquele navegador. Use apenas em computador da equipe.

## Cadastrar ou corrigir produtos

Edite `js/base-regulatoria.js`:

- **Produto novo:** copie um item de `PRODUTOS` e ajuste `termos` (como as pessoas escrevem o nome), `regulamentos` e `atributos`.
- **Portaria mudou:** atualize o item em `REGULAMENTOS` (ato, prazos, custos, documentos). Quando confirmar no texto vigente, troque `confianca: 'conferir'` por `'alta'`.
- Atualize `BASE_INFO.atualizadaEm`.

Depois rode os testes:

```bash
cd certificacao && npm test
```
