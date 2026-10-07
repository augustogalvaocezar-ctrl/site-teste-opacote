/* =========================================================================
   Base regulatória — Sistema de Certificação Opacote
   -------------------------------------------------------------------------
   Aqui ficam TODAS as regras usadas pelo motor:
     - REGULAMENTOS: portarias/atos de cada órgão (INMETRO, ANATEL, ANVISA…)
     - PRODUTOS: catálogo de produtos conhecidos e os regulamentos de cada um
     - SINAIS: características detectadas no nome (Bluetooth, Wi-Fi, 220 V…)
   Para cadastrar um produto novo, copie um item de PRODUTOS e ajuste.
   Campo `confianca: 'conferir'` = número/escopo precisa ser confirmado no
   texto vigente antes de usar a ficha como definitiva.
   Prazos e custos são faixas de referência de mercado, NÃO são cotações.
   ========================================================================= */

export const BASE_INFO = {
  versao: '1.0',
  atualizadaEm: '2026-10-07',
  aviso:
    'Orientação preliminar gerada a partir da base interna. Antes de investir em ensaios, confirme o enquadramento com um OCP (INMETRO) ou OCD (ANATEL) e consulte o texto vigente da portaria/ato.',
};

export const ORGAOS = {
  INMETRO: { nome: 'INMETRO', descricao: 'Segurança e qualidade de produtos (certificação + selo + registro)' },
  ANATEL: { nome: 'ANATEL', descricao: 'Produtos que emitem radiofrequência ou acessam redes de telecom (homologação + selo)' },
  ANVISA: { nome: 'ANVISA', descricao: 'Materiais em contato com alimentos, cosméticos e produtos de saúde' },
  ANAC: { nome: 'ANAC', descricao: 'Aeronaves não tripuladas (drones)' },
  AMBIENTAL: { nome: 'Logística reversa', descricao: 'Obrigação ambiental de eletroeletrônicos e baterias' },
};

/* Níveis de impacto usados na análise de variações */
export const IMPACTOS = {
  'sem-impacto': { rotulo: 'Sem impacto', tom: 'ok' },
  'mesma-familia': { rotulo: 'Mesma família', tom: 'ok' },
  documental: { rotulo: 'Só documental', tom: 'info' },
  avaliar: { rotulo: 'Avaliar com o organismo', tom: 'neutro' },
  'ensaio-adicional': { rotulo: 'Ensaio adicional', tom: 'atencao' },
  'novo-certificado': { rotulo: 'Certificação separada', tom: 'alerta' },
};

/* Dimensões de variação que o usuário pode informar */
export const DIMENSOES = {
  voltagem: 'Voltagem',
  cor: 'Cores / estampas',
  tamanho: 'Tamanhos, capacidades ou potências',
  conectividade: 'Versão com e sem conectividade',
  marca: 'Marcas / nomes comerciais',
};

const VAR_INMETRO_PADRAO = {
  voltagem: {
    impacto: 'ensaio-adicional',
    texto:
      'Versões 127 V e 220 V costumam ficar na mesma família quando a construção é igual, mas o OCP define quais ensaios repetir em cada tensão. Produto bivolt é ensaiado nas duas tensões.',
  },
  cor: {
    impacto: 'mesma-familia',
    texto:
      'Variação só estética (cor/estampa) não exige novo ensaio. Liste todos os códigos comerciais no certificado e no registro.',
  },
  tamanho: {
    impacto: 'avaliar',
    texto:
      'Cada tamanho/potência é um modelo. Podem ficar na mesma família se o projeto e os componentes críticos forem os mesmos — ensaia-se o modelo mais crítico (em geral o de maior potência).',
  },
  conectividade: {
    impacto: 'mesma-familia',
    texto:
      'Para o INMETRO a versão com módulo de rádio costuma ficar na mesma família (o módulo entra na lista de componentes). A homologação ANATEL é separada.',
  },
  marca: {
    impacto: 'documental',
    texto:
      'Nova marca ou nome comercial para o mesmo produto exige inclusão no certificado e no registro (extensão), sem novos ensaios se o produto for idêntico.',
  },
};

const VAR_ANATEL_PADRAO = {
  voltagem: {
    impacto: 'sem-impacto',
    texto:
      'A tensão de alimentação não muda a homologação se o circuito de rádio for o mesmo. Atenção ao carregador/fonte que acompanha o produto.',
  },
  cor: {
    impacto: 'sem-impacto',
    texto:
      'Variações estéticas entram na mesma homologação quando o hardware de rádio é idêntico — declare os modelos/cores ao OCD.',
  },
  tamanho: {
    impacto: 'avaliar',
    texto:
      'Se placa, antena e potência de rádio forem as mesmas, pode ser a mesma família. Antena ou placa diferente exige novos ensaios.',
  },
  conectividade: {
    impacto: 'novo-certificado',
    texto:
      'Cada tecnologia de rádio é ensaiada. A versão sem rádio não precisa de ANATEL; versões com Wi-Fi e com Bluetooth são avaliações diferentes.',
  },
  marca: {
    impacto: 'documental',
    texto: 'Novo nome comercial/modelo precisa ser incluído na homologação (alteração junto ao OCD).',
  },
};

const VAR_SEM_IMPACTO = {
  voltagem: { impacto: 'sem-impacto', texto: 'Não altera esta exigência.' },
  cor: { impacto: 'sem-impacto', texto: 'Não altera esta exigência.' },
  tamanho: { impacto: 'sem-impacto', texto: 'Não altera esta exigência.' },
  conectividade: { impacto: 'sem-impacto', texto: 'Não altera esta exigência.' },
  marca: { impacto: 'sem-impacto', texto: 'Não altera esta exigência.' },
};

/* Passo a passo padrão por órgão */
export const PASSOS = {
  INMETRO: [
    { etapa: 'Confirmar enquadramento', detalhe: 'Conferir se o produto está no escopo da portaria e qual modelo de certificação se aplica.', prazo: '1 semana' },
    { etapa: 'Escolher o OCP', detalhe: 'Pedir cotação a 2 ou 3 Organismos de Certificação de Produto acreditados pela Cgcre/INMETRO.', prazo: '1–2 semanas' },
    { etapa: 'Montar o dossiê técnico', detalhe: 'Descritivo, fotos, diagramas, manual, etiqueta e embalagem em português (ver checklist).', prazo: '1–3 semanas' },
    { etapa: 'Auditoria de fábrica', detalhe: 'Quando o modelo exige, o OCP audita o sistema de gestão da qualidade da unidade fabril.', prazo: '2–6 semanas' },
    { etapa: 'Ensaios em laboratório', detalhe: 'Amostras enviadas a laboratório acreditado; reprovação exige correção e novo ensaio.', prazo: '3–8 semanas' },
    { etapa: 'Certificado + registro', detalhe: 'OCP emite o certificado; a empresa faz o registro do objeto no INMETRO e paga a taxa.', prazo: '1–3 semanas' },
    { etapa: 'Selo e venda', detalhe: 'Aplicar o selo de identificação da conformidade no produto/embalagem e liberar anúncios.', prazo: '—' },
    { etapa: 'Manutenção', detalhe: 'Ensaios e auditorias periódicas para manter o certificado válido.', prazo: 'Contínuo' },
  ],
  ANATEL: [
    { etapa: 'Identificar categoria e requisitos', detalhe: 'Definir Categoria I, II ou III e quais atos técnicos se aplicam a cada rádio.', prazo: '1 semana' },
    { etapa: 'Escolher o OCD', detalhe: 'Contratar um Organismo de Certificação Designado pela ANATEL.', prazo: '1–2 semanas' },
    { etapa: 'Ensaios', detalhe: 'Laboratório designado; relatórios estrangeiros podem ser aceitos conforme as regras do OCD. Módulo já homologado reduz ensaios.', prazo: '2–6 semanas' },
    { etapa: 'Certificado de conformidade', detalhe: 'OCD analisa relatórios e documentos e emite o certificado.', prazo: '1–3 semanas' },
    { etapa: 'Homologação', detalhe: 'Empresa com CNPJ (fabricante/importador ou representante) solicita a homologação no sistema Mosaico/SCH e paga a taxa.', prazo: '1–2 semanas' },
    { etapa: 'Selo e venda', detalhe: 'Aplicar selo ANATEL com o código de homologação no produto e informar o código nos anúncios.', prazo: '—' },
    { etapa: 'Manutenção', detalhe: 'Avaliações periódicas do OCD para manter o certificado.', prazo: 'Contínuo' },
  ],
  ANVISA: [
    { etapa: 'Mapear materiais', detalhe: 'Listar todos os materiais que tocam o alimento (plástico, silicone, inox, revestimento, tinta).', prazo: '1 semana' },
    { etapa: 'Laudos de migração', detalhe: 'Ensaios de migração total/específica em laboratório para os materiais que tocam o alimento.', prazo: '2–4 semanas' },
    { etapa: 'Declaração e rotulagem', detalhe: 'Declaração de conformidade do fornecedor e rotulagem adequada. Em geral não há registro prévio.', prazo: '1 semana' },
  ],
  ANAC: [
    { etapa: 'Cadastro SISANT', detalhe: 'Cadastro do drone pelo operador quando acima de 250 g.', prazo: '1 dia' },
    { etapa: 'Regras de voo', detalhe: 'Informar ao comprador as regras do RBAC-E nº 94 e as autorizações do DECEA.', prazo: '—' },
  ],
  AMBIENTAL: [
    { etapa: 'Aderir a um sistema de logística reversa', detalhe: 'Entidade gestora (ex.: programas setoriais de eletroeletrônicos/pilhas) ou sistema próprio.', prazo: '2–4 semanas' },
  ],
};

/* =========================================================================
   REGULAMENTOS
   ========================================================================= */
export const REGULAMENTOS = {
  /* ------------------------------ INMETRO ------------------------------ */
  'inmetro-eletro': {
    orgao: 'INMETRO',
    titulo: 'Aparelhos eletrodomésticos e similares',
    ato: 'Portaria INMETRO nº 148/2022 (consolidada)',
    escopo: 'Eletroportáteis e eletrodomésticos de uso doméstico ligados à rede (lista na Tabela 1 do Anexo III).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação – Modelo 5 (ensaio de tipo + auditoria do sistema da qualidade + manutenção) ou Modelo 7 (lote), conforme a portaria',
    normas: ['ABNT NBR NM IEC 60335-1 (requisitos gerais)', 'Parte 2 específica do aparelho (IEC 60335-2-x)', 'ABNT NBR 14136 (plugue padrão brasileiro)'],
    ensaios: [
      'Marcação, etiqueta e instruções em português',
      'Proteção contra acesso a partes vivas',
      'Potência e corrente de entrada',
      'Aquecimento (elevação de temperatura)',
      'Corrente de fuga e tensão suportável (rigidez dielétrica)',
      'Resistência à umidade',
      'Funcionamento anormal',
      'Estabilidade e perigos mecânicos',
      'Construção, fiação interna e componentes',
      'Cordão de alimentação e plugue',
      'Distâncias de escoamento e de isolação',
      'Resistência ao calor e ao fogo',
    ],
    documentos: [
      'Descritivo técnico com todos os modelos, tensões, potências e frequência (60 Hz)',
      'Diagrama elétrico',
      'Lista de componentes críticos (cabo, plugue, interruptor, termostato, fusível térmico, motor, resistência) com fabricante e certificados',
      'Fotos internas e externas',
      'Manual de instruções em português',
      'Arte da etiqueta de marcação (tensão, potência, fabricante/importador, CNPJ, origem)',
      'Arte da embalagem com posição do selo INMETRO',
      'Dados da unidade fabril e do importador',
      'Documentos do sistema de gestão da qualidade da fábrica (para a auditoria)',
    ],
    identificacao: 'Selo de Identificação da Conformidade INMETRO + registro do objeto no INMETRO',
    prazo: '60 a 120 dias',
    custo: 'R$ 15 mil a 45 mil por família no 1º ciclo',
    manutencao: 'Ensaios de manutenção e auditorias periódicas definidas pelo OCP (em geral anuais).',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: ['Confira se o aparelho aparece na Tabela 1 (dentro do escopo) ou na Tabela 2 (fora do escopo) do Anexo III.'],
    fonte: {
      rotulo: 'INMETRO – escopo da Portaria 148/2022',
      url: 'https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-conformidade/aparelhos-eletrodomesticos-e-similares/quais-eletrodomesticos-estao-no-escopo-da-portaria-inmetro-ndeg-148-de-2022',
    },
    confianca: 'alta',
  },

  'inmetro-ventilador': {
    orgao: 'INMETRO',
    titulo: 'Ventiladores de mesa, parede, pedestal e circuladores de ar',
    ato: 'Portaria INMETRO nº 299/2021 (consolidada), alterada pela Portaria nº 638/2025',
    escopo: 'Ventiladores de mesa, parede, coluna/pedestal e circuladores de ar de uso doméstico em 127 V, 220 V ou bivolt.',
    tipo: 'Certificação compulsória (segurança + eficiência energética)',
    compulsorio: true,
    modelo: 'Certificação com ensaios de segurança e de eficiência energética (ENCE)',
    normas: ['ABNT NBR NM IEC 60335-1', 'IEC 60335-2-80 (ventiladores)', 'Requisitos de eficiência energética da portaria'],
    ensaios: [
      'Segurança elétrica (IEC 60335-1 e 2-80)',
      'Acesso às pás / grade de proteção',
      'Estabilidade e quedas',
      'Eficiência energética (vazão × potência) para emissão da ENCE',
      'Marcação, etiqueta e instruções',
    ],
    documentos: [
      'Descritivo técnico (diâmetro da hélice, potência, velocidades, tensões)',
      'Diagrama elétrico e lista de componentes críticos',
      'Fotos internas e externas',
      'Manual em português',
      'Arte da etiqueta e da ENCE (Etiqueta Nacional de Conservação de Energia)',
      'Arte da embalagem com selo',
    ],
    identificacao: 'Selo INMETRO + ENCE (eficiência energética) + registro',
    prazo: '90 a 150 dias',
    custo: 'R$ 20 mil a 50 mil por família no 1º ciclo',
    manutencao: 'Ensaios periódicos de segurança e eficiência.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      tamanho: {
        impacto: 'ensaio-adicional',
        texto: 'Cada diâmetro de hélice/potência é ensaiado (segurança e eficiência energética). Ventiladores com hélice < 26 cm ou > 60 cm ficam fora só dos requisitos de eficiência.',
      },
    },
    alertas: ['Ventiladores USB/recarregáveis que não funcionam ligados a 127/220 V precisam ter o enquadramento confirmado com o OCP.'],
    fonte: {
      rotulo: 'INMETRO – perguntas frequentes sobre ventiladores',
      url: 'https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-conformidade/ventiladores-de-mesa',
    },
    confianca: 'alta',
  },

  'inmetro-plugues': {
    orgao: 'INMETRO',
    titulo: 'Plugues, tomadas, extensões, filtros de linha e adaptadores',
    ato: 'Portaria INMETRO nº 90/2022 (consolidada)',
    escopo: 'Plugues e tomadas de uso doméstico até 250 V/20 A, incluindo tomadas múltiplas móveis (extensões, filtros de linha, réguas) e adaptadores.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 14136 (padrão brasileiro de plugues e tomadas)', 'ABNT NBR NM 60884-1 (plugues e tomadas)'],
    ensaios: [
      'Dimensional (padrão NBR 14136, 10 A / 20 A)',
      'Proteção contra choque elétrico',
      'Aterramento',
      'Aquecimento',
      'Força de inserção e retirada',
      'Resistência mecânica',
      'Resistência ao calor e ao fogo (fio incandescente)',
      'Cordão flexível (seção e marcação)',
    ],
    documentos: [
      'Desenhos técnicos/dimensionais',
      'Especificação do cordão flexível (seção, comprimento, certificado)',
      'Lista de materiais (contatos, isolantes)',
      'Fotos internas e externas',
      'Arte da marcação e da embalagem com selo',
    ],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 10 mil a 30 mil por família no 1º ciclo',
    manutencao: 'Ensaios de manutenção periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      tamanho: {
        impacto: 'avaliar',
        texto: 'Comprimento do cabo costuma variar dentro da mesma família; corrente nominal (10 A / 20 A), número de tomadas e seção do condutor definem modelos diferentes.',
      },
    },
    alertas: ['Se a extensão/filtro tiver portas USB, confirme com o OCP como o circuito USB é avaliado.'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'alta',
  },

  'inmetro-fios': {
    orgao: 'INMETRO',
    titulo: 'Fios, cabos e cordões flexíveis elétricos',
    ato: 'Portaria INMETRO nº 131/2022 (consolidada)',
    escopo: 'Fios, cabos e cordões flexíveis elétricos vendidos como produto (rolos, cabos de força avulsos).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR NM 247-3 / NBR 13249 (conforme o tipo de condutor)'],
    ensaios: ['Resistência elétrica do condutor', 'Espessura da isolação', 'Tensão elétrica', 'Propriedades mecânicas', 'Marcação'],
    documentos: ['Especificação técnica (seção, classe, isolação)', 'Arte da marcação e da embalagem', 'Dados da fábrica'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 10 mil a 25 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: { ...VAR_INMETRO_PADRAO, tamanho: { impacto: 'ensaio-adicional', texto: 'Cada seção de condutor (mm²) é um modelo; comprimento do rolo não muda a família.' } },
    alertas: [],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'alta',
  },

  'inmetro-led': {
    orgao: 'INMETRO',
    titulo: 'Lâmpadas LED com dispositivo de controle integrado à base',
    ato: 'Portaria INMETRO nº 69/2022',
    escopo: 'Lâmpadas LED (bulbo, tubular com controle integrado etc.) para iluminação geral.',
    tipo: 'Certificação compulsória (segurança + desempenho/eficiência)',
    compulsorio: true,
    modelo: 'Certificação com ensaios de segurança, fotométricos e de durabilidade',
    normas: ['Requisitos técnicos da Portaria 69/2022', 'IEC 62560 (segurança)', 'Ensaios fotométricos (fluxo, eficiência luminosa, IRC, temperatura de cor)'],
    ensaios: ['Segurança elétrica', 'Fluxo luminoso e eficiência luminosa (lm/W)', 'Índice de reprodução de cor (IRC)', 'Temperatura de cor', 'Fator de potência', 'Durabilidade/manutenção do fluxo', 'Marcação e embalagem'],
    documentos: ['Ficha técnica por modelo (potência, fluxo, temperatura de cor, base E27/E14…)', 'Fotos', 'Arte da embalagem com selo e informações obrigatórias'],
    identificacao: 'Selo INMETRO + informações de eficiência na embalagem + registro',
    prazo: '120 a 240 dias (há ensaios de durabilidade)',
    custo: 'R$ 20 mil a 60 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      cor: { impacto: 'ensaio-adicional', texto: 'Temperaturas de cor diferentes (ex.: 3000 K e 6500 K) contam como modelos distintos nos ensaios fotométricos.' },
      tamanho: { impacto: 'ensaio-adicional', texto: 'Cada potência é um modelo com ensaios próprios; a família só agrupa modelos de construção muito semelhante.' },
    },
    alertas: ['Novos índices mínimos de eficiência para lâmpadas e luminárias LED foram anunciados pelo MME com prazo até 2028 — acompanhe as atualizações.'],
    fonte: { rotulo: 'Portaria INMETRO 69/2022', url: 'https://cprc-clasp.ngo/policies/inmetro-ordinance-no-69-16-february-2022' },
    confianca: 'alta',
  },

  'inmetro-brinquedos': {
    orgao: 'INMETRO',
    titulo: 'Brinquedos',
    ato: 'Portaria INMETRO nº 302/2021 (consolidada)',
    escopo: 'Produtos projetados ou destinados a brincar, para crianças menores de 14 anos.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação – Modelo 1b (lote), 2 ou 5, à escolha do fornecedor',
    normas: ['ABNT NBR NM 300-1 (propriedades mecânicas e físicas)', 'ABNT NBR NM 300-2 (inflamabilidade)', 'ABNT NBR NM 300-3 (migração de elementos)', 'ABNT NBR IEC 62115 (brinquedos elétricos)', 'Limites de ftalatos para brinquedos de PVC'],
    ensaios: [
      'Peças pequenas (cilindro de teste) para menores de 3 anos',
      'Pontas e bordas cortantes',
      'Tração, torção, queda e mordida (abuso razoável)',
      'Inflamabilidade',
      'Migração de elementos químicos (por cor e material)',
      'Ftalatos (quando houver PVC)',
      'Segurança elétrica e baterias (brinquedos eletrônicos, até 24 V)',
      'Advertências e faixa etária',
    ],
    documentos: [
      'Ficha técnica com faixa etária e lista de materiais por cor',
      'Fotos do produto e de todas as peças',
      'Arte da embalagem com advertências (ex.: "Não recomendável para menores de 3 anos"), faixa etária e selo',
      'Manual/instruções em português',
      'Dados do fabricante e importador',
      'Amostras de cada cor/material para os ensaios químicos',
    ],
    identificacao: 'Selo INMETRO na embalagem + registro',
    prazo: '30 a 90 dias',
    custo: 'R$ 4 mil a 20 mil por família',
    manutencao: 'Avaliação de manutenção periódica (fábrica e/ou ensaios), conforme o modelo escolhido.',
    variacoes: {
      voltagem: { impacto: 'avaliar', texto: 'Brinquedo elétrico deve funcionar em até 24 V (ABNT NBR IEC 62115); carregador/transformador é avaliado à parte.' },
      cor: {
        impacto: 'ensaio-adicional',
        texto: 'Cada cor/material precisa de ensaio químico (migração de elementos — NBR NM 300-3). Cores com o mesmo pigmento e material podem compartilhar laudo.',
      },
      tamanho: { impacto: 'avaliar', texto: 'Tamanhos diferentes do mesmo projeto e material podem formar uma família; mudança de faixa etária muda os ensaios (peças pequenas para menores de 3 anos).' },
      conectividade: VAR_INMETRO_PADRAO.conectividade,
      marca: VAR_INMETRO_PADRAO.marca,
    },
    alertas: ['Brinquedos com controle remoto por rádio, Bluetooth ou Wi-Fi também precisam de homologação ANATEL.'],
    fonte: { rotulo: 'SGS – Portaria INMETRO 302/2021', url: 'https://www.sgs.com/en/news/2021/08/safeguards-10721-brazil-issues-legislation-for-toys' },
    confianca: 'alta',
  },

  'inmetro-escolar': {
    orgao: 'INMETRO',
    titulo: 'Artigos escolares',
    ato: 'Portaria INMETRO nº 423/2021',
    escopo: 'Artigos usados em ambiente escolar por crianças menores de 14 anos (lápis, canetas, borracha, apontador, cola, tesoura de ponta redonda, régua, estojo, massa de modelar, giz de cera, tintas etc.).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 15236 (segurança de artigos escolares)'],
    ensaios: ['Requisitos mecânicos e físicos', 'Migração de elementos químicos (por cor)', 'Pontas e bordas', 'Peças pequenas', 'Marcação e advertências'],
    documentos: ['Ficha técnica com materiais e cores', 'Fotos', 'Arte da embalagem com selo, advertências e faixa etária', 'Dados do fabricante e importador'],
    identificacao: 'Selo INMETRO (no produto ou na embalagem) + registro',
    prazo: '30 a 60 dias',
    custo: 'R$ 3 mil a 12 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      cor: { impacto: 'ensaio-adicional', texto: 'Cada cor/tinta precisa de ensaio químico de migração; cores com a mesma formulação podem compartilhar laudo.' },
    },
    alertas: ['Importação de artigos escolares exige licenciamento não automático (anuência INMETRO).'],
    fonte: { rotulo: 'INMETRO – artigos escolares', url: 'https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-conformidade/artigos-escolares' },
    confianca: 'alta',
  },

  'inmetro-carrinho-bebe': {
    orgao: 'INMETRO',
    titulo: 'Carrinhos para crianças',
    ato: 'Portaria INMETRO nº 167/2021 (consolidada), alterada pela Portaria nº 11/2025',
    escopo: 'Carrinhos de bebê e para crianças.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['Regulamento Técnico da Qualidade da portaria (baseado em ABNT NBR 14389)'],
    ensaios: ['Estabilidade', 'Sistema de freio', 'Dispositivos de travamento', 'Cintos/retenção', 'Durabilidade e resistência', 'Pontos de aprisionamento e esmagamento', 'Marcação e advertências'],
    documentos: ['Ficha técnica e desenhos', 'Fotos', 'Manual em português', 'Arte da embalagem com selo e advertências'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 10 mil a 30 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: [],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'alta',
  },

  'inmetro-berco': {
    orgao: 'INMETRO',
    titulo: 'Berços infantis',
    ato: 'Portaria INMETRO nº 53/2016 (conferir texto consolidado vigente)',
    escopo: 'Berços infantis de uso doméstico.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 15860 (berços)'],
    ensaios: ['Dimensões e espaçamentos (aprisionamento)', 'Resistência estrutural', 'Estabilidade', 'Pontas e bordas', 'Marcação e instruções de montagem'],
    documentos: ['Desenhos técnicos', 'Manual de montagem em português', 'Fotos', 'Arte da embalagem com selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 8 mil a 25 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: ['Confirme o número da portaria consolidada vigente para berços antes de contratar o OCP.'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'conferir',
  },

  'inmetro-cadeirinha': {
    orgao: 'INMETRO',
    titulo: 'Dispositivos de retenção infantil (cadeirinhas para automóvel)',
    ato: 'Portaria INMETRO específica para dispositivos de retenção infantil (conferir número vigente)',
    escopo: 'Bebê-conforto, cadeirinhas e assentos de elevação para automóveis.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios dinâmicos e manutenção',
    normas: ['Regulamento técnico baseado na ECE R44/R129'],
    ensaios: ['Ensaio dinâmico de impacto (crash test)', 'Resistência das fivelas e cintos', 'Inflamabilidade', 'Marcação e instruções'],
    documentos: ['Desenhos técnicos', 'Manual de instalação em português', 'Fotos', 'Arte da etiqueta e embalagem com selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '90 a 180 dias',
    custo: 'R$ 30 mil a 80 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: ['Produto de alto risco: confirme a portaria vigente e o grupo de peso/altura antes de importar.'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'conferir',
  },

  'inmetro-bicicleta-infantil': {
    orgao: 'INMETRO',
    titulo: 'Bicicletas de uso infantil',
    ato: 'Portaria INMETRO de bicicletas de uso infantil (conferir número consolidado vigente)',
    escopo: 'Bicicletas infantis (com ou sem rodinhas laterais).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 14714 (bicicletas de uso infantil)'],
    ensaios: ['Freios', 'Resistência do quadro e garfo', 'Guidão e selim', 'Pontas e bordas', 'Rodinhas estabilizadoras', 'Marcação e manual'],
    documentos: ['Desenhos e ficha técnica (aro, altura do selim)', 'Manual em português', 'Fotos', 'Arte da embalagem com selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 8 mil a 25 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: { ...VAR_INMETRO_PADRAO, tamanho: { impacto: 'avaliar', texto: 'Aros diferentes (12, 16, 20…) podem ser modelos distintos da mesma família; o OCP define o mais crítico para ensaio.' } },
    alertas: ['Componentes de bicicleta adulta têm regulamento próprio (Portaria INMETRO nº 202/2021).'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'conferir',
  },

  'inmetro-panela-pressao': {
    orgao: 'INMETRO',
    titulo: 'Panelas de pressão',
    ato: 'Portaria INMETRO nº 499/2021 (panelas metálicas – consolidada), alterada pela Portaria nº 167/2025',
    escopo: 'Panelas de pressão metálicas (classificadas como risco III).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 11823 (panelas de pressão)'],
    ensaios: ['Válvula de segurança e de funcionamento', 'Pressão de operação e de ruptura', 'Sistema de fechamento/travamento', 'Resistência das alças', 'Estanqueidade', 'Marcação e manual'],
    documentos: ['Desenhos técnicos', 'Especificação de material', 'Manual em português', 'Fotos', 'Arte da embalagem com selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 10 mil a 30 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      tamanho: { impacto: 'avaliar', texto: 'Capacidades diferentes (4,5 L, 7 L…) com mesmo projeto de fechamento e válvulas podem formar uma família.' },
    },
    alertas: [],
    fonte: { rotulo: 'INMETRO – Portaria 499/2021 e alteração 167/2025', url: 'https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-de-resultado-regulatorio/2024/panelas-metalicas/relatorio' },
    confianca: 'alta',
  },

  'inmetro-panelas': {
    orgao: 'INMETRO',
    titulo: 'Panelas metálicas (exceto pressão)',
    ato: 'Portaria INMETRO nº 499/2021 (consolidada), alterada pela Portaria nº 167/2025',
    escopo: 'Panelas, frigideiras e caçarolas metálicas (alumínio, inox, antiaderente). Após 2025 foram reclassificadas como risco I.',
    tipo: 'Regulamento técnico — risco I (exigências reduzidas; confirmar forma de avaliação)',
    compulsorio: true,
    modelo: 'Risco I após a Portaria 167/2025 — confirmar com o OCP se basta declaração do fornecedor ou se ainda há certificação para o seu tipo de panela',
    normas: ['Regulamento Técnico da Qualidade da Portaria 499/2021', 'ABNT NBR 15718 (panelas metálicas)'],
    ensaios: ['Resistência das alças e fixação', 'Estabilidade', 'Aderência e resistência do revestimento (antiaderente)', 'Marcação'],
    documentos: ['Ficha técnica (material, espessura, revestimento)', 'Fotos', 'Arte da embalagem e das instruções de uso e limpeza'],
    identificacao: 'Conforme a forma de avaliação vigente (confirmar)',
    prazo: '30 a 90 dias',
    custo: 'R$ 3 mil a 15 mil por família',
    manutencao: 'Conforme regulamento vigente.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      tamanho: { impacto: 'mesma-familia', texto: 'Tamanhos da mesma linha (mesmo material, revestimento e processo) formam uma família; material ou revestimento diferente = outra família.' },
      cor: { impacto: 'avaliar', texto: 'Cor da pintura externa não muda a família; mudança do revestimento interno exige novos ensaios.' },
    },
    alertas: ['A Portaria 167/2025 reduziu as exigências para panelas que não são de pressão — confirme a regra atual antes de contratar ensaios.'],
    fonte: { rotulo: 'INMETRO – avaliação do regulamento de panelas metálicas', url: 'https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-de-resultado-regulatorio/2024/panelas-metalicas/relatorio' },
    confianca: 'conferir',
  },

  'inmetro-colchao': {
    orgao: 'INMETRO',
    titulo: 'Colchões e colchonetes de espuma flexível de poliuretano',
    ato: 'Portaria INMETRO nº 35/2021 (consolidada)',
    escopo: 'Colchões e colchonetes de espuma de poliuretano (risco III).',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 13579 (colchões de espuma)'],
    ensaios: ['Densidade da espuma', 'Resistência à compressão / fadiga', 'Dimensões', 'Etiquetagem (densidade, dimensões, composição)'],
    documentos: ['Ficha técnica (densidade, dimensões, revestimento)', 'Fotos', 'Arte da etiqueta e embalagem com selo'],
    identificacao: 'Selo INMETRO + etiqueta obrigatória + registro',
    prazo: '45 a 90 dias',
    custo: 'R$ 5 mil a 20 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      tamanho: { impacto: 'mesma-familia', texto: 'Medidas diferentes (solteiro, casal…) com a mesma densidade e espuma formam uma família; densidade diferente = outro modelo.' },
    },
    alertas: [],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'alta',
  },

  'inmetro-mangueira-glp': {
    orgao: 'INMETRO',
    titulo: 'Mangueiras de PVC para instalação doméstica de GLP',
    ato: 'Portaria INMETRO nº 247/2021 (consolidada)',
    escopo: 'Mangueiras plásticas (PVC plastificado) para ligar o botijão de gás ao fogão.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 8613 (mangueiras de PVC para GLP)'],
    ensaios: ['Dimensões', 'Resistência à pressão', 'Envelhecimento', 'Marcação com prazo de validade gravado'],
    documentos: ['Ficha técnica', 'Arte da marcação (validade, lote) e embalagem com selo'],
    identificacao: 'Selo INMETRO + marcação com validade + registro',
    prazo: '45 a 90 dias',
    custo: 'R$ 5 mil a 15 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: ['Reguladores de pressão para GLP têm regulamento próprio do INMETRO — confira se o kit inclui regulador.'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'alta',
  },

  'inmetro-regulador-glp': {
    orgao: 'INMETRO',
    titulo: 'Reguladores de baixa pressão para GLP',
    ato: 'Portaria INMETRO de reguladores para GLP (conferir número consolidado vigente)',
    escopo: 'Reguladores de pressão de botijões de gás de uso doméstico.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 8473 (reguladores de baixa pressão para GLP)'],
    ensaios: ['Pressão regulada', 'Vazão', 'Estanqueidade', 'Durabilidade', 'Marcação'],
    documentos: ['Ficha técnica', 'Manual de instalação em português', 'Arte da embalagem com selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '60 a 120 dias',
    custo: 'R$ 8 mil a 20 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: VAR_INMETRO_PADRAO,
    alertas: [],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'conferir',
  },

  'inmetro-mamadeira': {
    orgao: 'INMETRO',
    titulo: 'Mamadeiras, bicos de mamadeira e chupetas',
    ato: 'Portarias INMETRO de mamadeiras/bicos e de chupetas (conferir números consolidados vigentes)',
    escopo: 'Mamadeiras, bicos e chupetas. A personalização com strass, pérolas ou peças coladas é proibida.',
    tipo: 'Certificação compulsória',
    compulsorio: true,
    modelo: 'Certificação com ensaios de tipo e manutenção',
    normas: ['ABNT NBR 13793 (chupetas)', 'ABNT NBR 13796 (mamadeiras e bicos)'],
    ensaios: ['Resistência à tração do bico/escudo', 'Peças pequenas', 'Substâncias (nitrosaminas, bisfenol A proibido)', 'Marcação e advertências'],
    documentos: ['Ficha técnica de materiais', 'Fotos', 'Arte da embalagem com advertências e selo'],
    identificacao: 'Selo INMETRO + registro',
    prazo: '45 a 90 dias',
    custo: 'R$ 5 mil a 20 mil por família',
    manutencao: 'Ensaios periódicos.',
    variacoes: {
      ...VAR_INMETRO_PADRAO,
      cor: { impacto: 'ensaio-adicional', texto: 'Cada cor/material em contato com a boca do bebê pode exigir ensaio químico próprio.' },
    },
    alertas: ['Produtos personalizados (com peças coladas) são proibidos pelo INMETRO.'],
    fonte: { rotulo: 'INMETRO – produtos regulados', url: 'https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade' },
    confianca: 'conferir',
  },

  /* ------------------------------ ANATEL ------------------------------- */
  'anatel-cat2': {
    orgao: 'ANATEL',
    titulo: 'Equipamentos de radiocomunicação de radiação restrita (Categoria II)',
    ato: 'Resolução ANATEL nº 680/2017 + Ato nº 14.448/2017 (requisitos técnicos), alterado pelo Ato nº 14.158/2025 e pelo Ato nº 10.400/2026',
    escopo: 'Bluetooth, Wi-Fi, controle remoto por rádio (433 MHz, 2,4 GHz), carregamento sem fio, RFID/NFC e outros transmissores de baixa potência.',
    tipo: 'Homologação compulsória',
    compulsorio: true,
    modelo: 'Certificação por OCD + homologação ANATEL (Categoria II)',
    normas: ['Ato ANATEL nº 14.448/2017 (radiação restrita) e alterações', 'Requisitos de compatibilidade eletromagnética e segurança elétrica, quando aplicáveis', 'Resolução ANATEL nº 700/2018 (SAR), quando o equipamento é usado junto ao corpo e excede os limites de potência'],
    ensaios: [
      'Potência de saída e densidade espectral',
      'Faixa de frequência e largura de faixa ocupada',
      'Emissões espúrias e fora de faixa',
      'Compatibilidade eletromagnética (EMC), quando aplicável',
      'Segurança elétrica (produto ligado à rede ou com bateria), quando aplicável',
      'Taxa de absorção específica (SAR), se aplicável',
    ],
    documentos: [
      'Manual do usuário em português',
      'Fotos internas e externas, incluindo placa e antena',
      'Diagrama em blocos e esquemático',
      'Especificações de RF (faixa, potência, modulação, ganho da antena)',
      'Lista de modelos/família (declaração)',
      'Certificado do módulo de rádio, se usar módulo já homologado',
      'Relatórios de ensaio (laboratório designado ou estrangeiro aceito pelo OCD)',
      'CNPJ do requerente no Brasil e cadastro no sistema Mosaico',
      'Arte da etiqueta com selo ANATEL e código de homologação',
    ],
    identificacao: 'Selo ANATEL com código de homologação (no produto; etiqueta eletrônica permitida em alguns casos)',
    prazo: '30 a 90 dias',
    custo: 'R$ 8 mil a 25 mil por produto/família (menos se usar módulo já homologado)',
    manutencao: 'Avaliação periódica do OCD (documental na maioria dos casos de Categoria II).',
    variacoes: VAR_ANATEL_PADRAO,
    alertas: ['Usar módulo de rádio já homologado reduz ensaios, mas o produto final continua precisando de homologação própria.'],
    fonte: { rotulo: 'ANATEL – Ato nº 14.448/2017', url: 'https://informacoes.anatel.gov.br/legislacao/index.php/component/content/article?id=1139' },
    confianca: 'alta',
  },

  'anatel-cat1': {
    orgao: 'ANATEL',
    titulo: 'Terminais de telecomunicações com acesso à rede celular (Categoria I)',
    ato: 'Resolução ANATEL nº 715/2019 (regulamento de avaliação da conformidade e homologação) + requisitos técnicos de terminais móveis',
    escopo: 'Celulares, smartwatches com chip, rastreadores com chip, modems e roteadores 4G/5G.',
    tipo: 'Homologação compulsória',
    compulsorio: true,
    modelo: 'Certificação por OCD + homologação ANATEL (Categoria I)',
    normas: ['Requisitos técnicos ANATEL para terminais móveis (bandas 2G/3G/4G/5G)', 'Resolução ANATEL nº 700/2018 (SAR)', 'Requisitos de segurança elétrica, EMC e bateria'],
    ensaios: ['Desempenho de RF nas bandas celulares', 'SAR', 'Segurança elétrica', 'Compatibilidade eletromagnética', 'Bateria e carregador', 'Rádios auxiliares (Wi-Fi/Bluetooth)'],
    documentos: ['Manual em português', 'Fotos internas e externas', 'Esquemáticos e diagrama em blocos', 'Especificações de bandas', 'Dados do IMEI (cadastro)', 'CNPJ do requerente no Brasil', 'Arte da etiqueta com selo ANATEL'],
    identificacao: 'Selo ANATEL com código de homologação',
    prazo: '90 a 180 dias',
    custo: 'R$ 40 mil a 150 mil por produto',
    manutencao: 'Avaliação periódica com ensaios.',
    variacoes: VAR_ANATEL_PADRAO,
    alertas: ['Categoria I é o processo mais caro e longo da ANATEL — avalie usar módulo celular já homologado.'],
    fonte: { rotulo: 'ANATEL – legislação', url: 'https://informacoes.anatel.gov.br/legislacao/' },
    confianca: 'alta',
  },

  'anatel-acessorio-celular': {
    orgao: 'ANATEL',
    titulo: 'Carregadores e baterias para celular (inclui power bank)',
    ato: 'Requisitos técnicos ANATEL para carregadores e baterias de lítio de telefone celular (conferir ato vigente)',
    escopo: 'Carregadores de celular, baterias de lítio para celular e baterias auxiliares (power banks).',
    tipo: 'Homologação compulsória',
    compulsorio: true,
    modelo: 'Certificação por OCD + homologação ANATEL',
    normas: ['Requisitos técnicos ANATEL para carregadores', 'Requisitos técnicos ANATEL para baterias de lítio (células e pack)'],
    ensaios: ['Sobrecarga, curto-circuito e sobretensão', 'Temperatura e queda', 'Segurança da bateria (células e pack)', 'Compatibilidade eletromagnética (carregador)', 'Marcação'],
    documentos: ['Manual em português', 'Fotos internas e externas', 'Especificação das células (fabricante, capacidade)', 'Esquemático do circuito de proteção', 'Arte da etiqueta com selo ANATEL', 'Amostras (baterias costumam exigir dezenas de unidades e células)'],
    identificacao: 'Selo ANATEL com código de homologação',
    prazo: '60 a 120 dias',
    custo: 'R$ 15 mil a 40 mil por produto',
    manutencao: 'Avaliação periódica.',
    variacoes: {
      ...VAR_ANATEL_PADRAO,
      tamanho: { impacto: 'novo-certificado', texto: 'Cada capacidade (mAh) ou potência de carregamento (W) é avaliada; células diferentes exigem novos ensaios.' },
    },
    alertas: ['Power bank precisa de ANATEL (não de INMETRO). Se tiver carregamento sem fio, a parte de rádio também é avaliada.'],
    fonte: { rotulo: 'Tecnoblog – multa por power bank sem homologação', url: 'https://tecnoblog.net/noticias/tectoy-e-multada-em-r-500-pela-anatel-por-vender-powerbank-sem-homologacao/' },
    confianca: 'conferir',
  },

  /* ------------------------------ ANVISA ------------------------------- */
  'anvisa-alimentos': {
    orgao: 'ANVISA',
    titulo: 'Materiais em contato com alimentos',
    ato: 'RDC ANVISA nº 91/2001 (critérios gerais) e resoluções específicas por material (plásticos, metais, silicone, vidro…) — conferir texto vigente',
    escopo: 'Copos, garrafas, potes, utensílios, panelas e qualquer parte que toque alimento ou bebida.',
    tipo: 'Conformidade obrigatória (em geral sem registro prévio)',
    compulsorio: true,
    modelo: 'Responsabilidade do fornecedor: materiais em listas positivas + ensaios de migração',
    normas: ['Resoluções ANVISA por tipo de material', 'Limites de migração total e específica'],
    ensaios: ['Migração total', 'Migração específica (metais, monômeros, aditivos, conforme o material)', 'Verificação de cor/pigmentos em contato com alimento'],
    documentos: ['Lista de materiais em contato com alimento por componente', 'Laudos de migração', 'Declaração de conformidade do fabricante', 'Rotulagem/instruções de uso e limpeza'],
    identificacao: 'Sem selo; manter laudos e declaração disponíveis para fiscalização e marketplaces',
    prazo: '15 a 45 dias',
    custo: 'R$ 1,5 mil a 8 mil por material',
    manutencao: 'Renovar laudos quando mudar fornecedor ou material.',
    variacoes: {
      ...VAR_SEM_IMPACTO,
      cor: { impacto: 'avaliar', texto: 'Se a parte colorida toca o alimento, cada pigmento/material precisa estar coberto pelos laudos de migração.' },
      tamanho: { impacto: 'sem-impacto', texto: 'Tamanhos diferentes do mesmo material são cobertos pelos mesmos laudos.' },
    },
    alertas: ['Não anuncie "livre de BPA" ou "próprio para alimentos" sem laudo que comprove.'],
    fonte: { rotulo: 'ANVISA – materiais em contato com alimentos', url: 'https://www.gov.br/anvisa/pt-br' },
    confianca: 'conferir',
  },

  'anvisa-cosmeticos': {
    orgao: 'ANVISA',
    titulo: 'Cosméticos, produtos de higiene e perfumes',
    ato: 'Regularização de cosméticos na ANVISA (notificação para Grau 1, registro para Grau 2) — conferir RDC vigente',
    escopo: 'Cremes, xampus, maquiagem, perfumes, esmaltes e similares.',
    tipo: 'Regularização obrigatória',
    compulsorio: true,
    modelo: 'Notificação (Grau 1) ou registro (Grau 2) por empresa com Autorização de Funcionamento (AFE)',
    normas: ['RDCs ANVISA de cosméticos (definição, rotulagem, ingredientes permitidos)'],
    ensaios: ['Estabilidade', 'Segurança/irritação dérmica (conforme o produto)', 'Microbiológico', 'Eficácia, quando houver alegação'],
    documentos: ['Fórmula completa (INCI)', 'Rotulagem em português', 'AFE da empresa', 'Responsável técnico'],
    identificacao: 'Número de notificação/registro na rotulagem',
    prazo: '30 a 120 dias',
    custo: 'Variável — depende do grau e dos ensaios',
    manutencao: 'Atualização quando mudar fórmula ou rótulo.',
    variacoes: {
      ...VAR_SEM_IMPACTO,
      cor: { impacto: 'novo-certificado', texto: 'Cada cor/fragrância com fórmula diferente é uma regularização própria.' },
      tamanho: { impacto: 'documental', texto: 'Tamanhos diferentes da mesma fórmula entram na mesma regularização (apresentações).' },
    },
    alertas: ['A empresa precisa de AFE na ANVISA para importar/fabricar cosméticos.'],
    fonte: { rotulo: 'ANVISA – cosméticos', url: 'https://www.gov.br/anvisa/pt-br' },
    confianca: 'conferir',
  },

  /* ------------------------------ OUTROS ------------------------------- */
  'anac-drone': {
    orgao: 'ANAC',
    titulo: 'Aeronaves não tripuladas (drones)',
    ato: 'RBAC-E nº 94 (ANAC) + cadastro no SISANT',
    escopo: 'Drones recreativos acima de 250 g exigem cadastro do operador; o rádio do drone exige ANATEL.',
    tipo: 'Regras de uso e cadastro (responsabilidade do operador)',
    compulsorio: false,
    modelo: 'Sem certificação de produto para drones recreativos; informar o comprador',
    normas: ['RBAC-E nº 94', 'Regras do DECEA para espaço aéreo'],
    ensaios: [],
    documentos: ['Manual em português com orientações de cadastro SISANT e regras de voo', 'Peso de decolagem informado na embalagem'],
    identificacao: '—',
    prazo: '—',
    custo: '—',
    manutencao: '—',
    variacoes: VAR_SEM_IMPACTO,
    alertas: ['Drones com até 250 g têm regras simplificadas — informe o peso no anúncio.'],
    fonte: { rotulo: 'ANAC – drones', url: 'https://www.gov.br/anac/pt-br' },
    confianca: 'conferir',
  },

  'logistica-reversa': {
    orgao: 'AMBIENTAL',
    titulo: 'Logística reversa de eletroeletrônicos e baterias',
    ato: 'Decreto nº 10.240/2020 (eletroeletrônicos de uso doméstico) + Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010)',
    escopo: 'Fabricantes, importadores e comerciantes de eletroeletrônicos de uso doméstico e de pilhas/baterias.',
    tipo: 'Obrigação ambiental',
    compulsorio: true,
    modelo: 'Adesão a entidade gestora ou sistema próprio de recolhimento',
    normas: ['Decreto nº 10.240/2020', 'Lei nº 12.305/2010'],
    ensaios: [],
    documentos: ['Comprovante de adesão a sistema de logística reversa', 'Orientação de descarte no manual/embalagem'],
    identificacao: 'Informação de descarte correto na embalagem/manual',
    prazo: '2 a 4 semanas',
    custo: 'Taxa anual da entidade gestora (varia com volume)',
    manutencao: 'Relatórios anuais à entidade gestora.',
    variacoes: VAR_SEM_IMPACTO,
    alertas: [],
    fonte: { rotulo: 'Decreto nº 10.240/2020', url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/D10240.htm' },
    confianca: 'alta',
  },
};

/* =========================================================================
   SINAIS — características que mudam a ficha
   `termos` são procurados no nome digitado (sem acento, minúsculo).
   `provavel: true` = o termo só sugere (ex.: "smart"), pede confirmação.
   ========================================================================= */
export const SINAIS = [
  { id: 'eletrico', rotulo: 'Ligado à tomada (127/220 V)', termos: ['127v', '127 v', '220v', '220 v', '110v', 'bivolt', 'tomada'], regulamentos: ['logistica-reversa'] },
  { id: 'eletrico', rotulo: 'Ligado à tomada (127/220 V)', termos: ['eletrico', 'eletrica'], regulamentos: ['logistica-reversa'], provavel: true },
  { id: 'bateria', rotulo: 'Bateria recarregável', termos: ['recarregavel', 'bateria', 'li ion', 'litio', 'power bank'], regulamentos: ['logistica-reversa'] },
  { id: 'bluetooth', rotulo: 'Bluetooth', termos: ['bluetooth', 'ble', 'bt 5', 'tws'], regulamentos: ['anatel-cat2'] },
  { id: 'wifi', rotulo: 'Wi-Fi', termos: ['wifi', 'wi fi', 'wireless lan'], regulamentos: ['anatel-cat2'] },
  { id: 'wifi', rotulo: 'Wi-Fi', termos: ['smart', 'inteligente', 'alexa', 'google home', 'por app', 'pelo app', 'aplicativo'], regulamentos: ['anatel-cat2'], provavel: true },
  { id: 'rf', rotulo: 'Controle por rádio (RF)', termos: ['radio controle', 'radiocontrole', '433mhz', '433 mhz', '2 4ghz', '2 4 ghz'], regulamentos: ['anatel-cat2'] },
  { id: 'rf', rotulo: 'Controle por rádio (RF)', termos: ['controle remoto'], regulamentos: ['anatel-cat2'], provavel: true },
  { id: 'celular', rotulo: 'Rede celular (chip 4G/5G)', termos: ['4g', '5g', '3g', 'chip', 'sim card', 'esim', 'lte', 'gsm'], regulamentos: ['anatel-cat1'] },
  { id: 'infantil', rotulo: 'Público infantil (até 14 anos)', termos: ['infantil', 'crianca', 'criancas', 'kids', 'bebe', 'baby', 'menino', 'menina'], regulamentos: [] },
  { id: 'alimento', rotulo: 'Contato com alimentos/bebidas', termos: ['cozinha', 'alimento', 'comida', 'bebida', 'cafe', 'cha', 'agua', 'suco', 'marmita', 'lancheira'], regulamentos: ['anvisa-alimentos'], provavel: true },
  { id: 'saude', rotulo: 'Produto de saúde/medição', termos: ['termometro', 'oximetro', 'medidor de pressao', 'aparelho de pressao', 'glicosimetro', 'inalador', 'nebulizador'], regulamentos: [] },
];

export const ATRIBUTOS = [
  { id: 'eletrico', rotulo: 'Ligado à tomada (127/220 V)' },
  { id: 'bateria', rotulo: 'Bateria recarregável' },
  { id: 'bluetooth', rotulo: 'Bluetooth' },
  { id: 'wifi', rotulo: 'Wi-Fi' },
  { id: 'rf', rotulo: 'Controle por rádio (RF)' },
  { id: 'celular', rotulo: 'Rede celular (chip 4G/5G)' },
  { id: 'infantil', rotulo: 'Público infantil (até 14 anos)' },
  { id: 'alimento', rotulo: 'Contato com alimentos/bebidas' },
  { id: 'saude', rotulo: 'Produto de saúde/medição' },
];

/* Perguntas para produtos fora da base: cada resposta "Sim" marca os atributos */
export const PERGUNTAS = [
  { id: 'eletrico', texto: 'Liga na tomada (127 V / 220 V)?', atributos: ['eletrico'] },
  { id: 'bateria', texto: 'Funciona com bateria recarregável ou carregador USB?', atributos: ['bateria'] },
  { id: 'radio', texto: 'Tem Bluetooth, Wi-Fi, controle remoto sem fio ou conecta a aplicativo?', atributos: ['bluetooth', 'wifi', 'rf'] },
  { id: 'celular', texto: 'Usa chip de celular (4G/5G)?', atributos: ['celular'] },
  { id: 'infantil', texto: 'É para criança de até 14 anos (brinquedo ou material escolar)?', atributos: ['infantil'] },
  { id: 'alimento', texto: 'Encosta em comida ou bebida?', atributos: ['alimento'] },
];

/* Regulamentos disparados por cada atributo marcado na tela */
export const REGRAS_ATRIBUTO = {
  eletrico: ['logistica-reversa'],
  bateria: ['logistica-reversa'],
  bluetooth: ['anatel-cat2'],
  wifi: ['anatel-cat2'],
  rf: ['anatel-cat2'],
  celular: ['anatel-cat1'],
  infantil: [],
  alimento: ['anvisa-alimentos'],
  saude: [],
};

/* Exigências dos marketplaces por órgão */
export const MARKETPLACES = {
  INMETRO: [
    'Mostrar o selo INMETRO nas fotos do produto/embalagem e ter o número de registro/certificado em mãos — Mercado Livre, Shopee, Amazon e Magalu podem pedir comprovação nas categorias reguladas.',
    'Anúncio de produto regulado sem certificação pode ser removido e o estoque em fulfillment (Full/FBA) bloqueado.',
  ],
  ANATEL: [
    'Informar o código de homologação ANATEL no anúncio (campo exigido nas categorias de eletrônicos/telecom dos principais marketplaces).',
    'Selo ANATEL visível em foto do produto ou da etiqueta.',
    'A ANATEL fiscaliza centros de distribuição dos marketplaces e apreende produtos sem homologação.',
  ],
  ANVISA: [
    'Só use alegações como "livre de BPA" ou "próprio para alimentos" com laudo de migração.',
    'Cosméticos: informar o número de notificação/registro ANVISA.',
  ],
  ANAC: ['Informar o peso do drone e a necessidade de cadastro no SISANT para modelos acima de 250 g.'],
  AMBIENTAL: ['Incluir orientação de descarte correto na embalagem/manual.'],
  GERAL: ['Manual e etiqueta em português, com nome e CNPJ do fabricante/importador (Código de Defesa do Consumidor).'],
};

/* =========================================================================
   PRODUTOS — catálogo
   regulamentos: ids de REGULAMENTOS
   norma: parte específica da norma (quando houver)
   atributos: características padrão (podem ser ajustadas na tela)
   ========================================================================= */
const ELETRO = ['inmetro-eletro', 'logistica-reversa'];
const ELETRO_ALIM = ['inmetro-eletro', 'anvisa-alimentos', 'logistica-reversa'];
const RADIO = ['anatel-cat2', 'logistica-reversa'];

export const PRODUTOS = [
  /* ---------- Eletroportáteis de cozinha ---------- */
  { id: 'air-fryer', nome: 'Air fryer (fritadeira elétrica sem óleo)', categoria: 'Eletroportáteis', termos: ['air fryer', 'airfryer', 'fritadeira sem oleo', 'fritadeira eletrica sem oleo', 'fritadeira air'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'fritadeira-oleo', nome: 'Fritadeira elétrica com óleo', categoria: 'Eletroportáteis', termos: ['fritadeira eletrica', 'fritadeira com oleo', 'tacho eletrico'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-13', atributos: { eletrico: true, alimento: true } },
  { id: 'liquidificador', nome: 'Liquidificador', categoria: 'Eletroportáteis', termos: ['liquidificador', 'blender'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'liquidificador-portatil', nome: 'Mini liquidificador portátil recarregável', categoria: 'Eletroportáteis', termos: ['liquidificador portatil', 'mini liquidificador', 'garrafa liquidificador', 'blender portatil', 'mixer portatil usb'], regulamentos: ['anvisa-alimentos', 'logistica-reversa'], norma: 'IEC 60335-2-14', atributos: { bateria: true, alimento: true }, notas: ['Aparelho a bateria/USB: confirme com o OCP se entra no escopo da Portaria 148/2022 — a lista do Anexo III considera aparelhos ligados à rede.'] },
  { id: 'batedeira', nome: 'Batedeira', categoria: 'Eletroportáteis', termos: ['batedeira'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'mixer', nome: 'Mixer de mão', categoria: 'Eletroportáteis', termos: ['mixer'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'processador', nome: 'Processador de alimentos / multiprocessador', categoria: 'Eletroportáteis', termos: ['processador de alimentos', 'multiprocessador', 'picador eletrico', 'triturador eletrico'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'espremedor', nome: 'Espremedor / centrífuga de frutas', categoria: 'Eletroportáteis', termos: ['espremedor', 'centrifuga de frutas', 'extrator de suco', 'juicer'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'moedor-cafe', nome: 'Moedor de café elétrico', categoria: 'Eletroportáteis', termos: ['moedor de cafe', 'moedor eletrico'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-14', atributos: { eletrico: true, alimento: true } },
  { id: 'cafeteira', nome: 'Cafeteira elétrica', categoria: 'Eletroportáteis', termos: ['cafeteira', 'maquina de cafe', 'cafeteira expresso', 'maquina de espresso', 'cafeteira de capsula'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-15', atributos: { eletrico: true, alimento: true } },
  { id: 'chaleira', nome: 'Chaleira elétrica', categoria: 'Eletroportáteis', termos: ['chaleira eletrica', 'chaleira', 'jarra eletrica', 'aquecedor de agua eletrico'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-15', atributos: { eletrico: true, alimento: true } },
  { id: 'panela-arroz', nome: 'Panela elétrica de arroz / multicooker', categoria: 'Eletroportáteis', termos: ['panela eletrica', 'panela de arroz', 'multicooker', 'panela de pressao eletrica', 'slow cooker'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-15', atributos: { eletrico: true, alimento: true } },
  { id: 'sanduicheira', nome: 'Sanduicheira / grill elétrico', categoria: 'Eletroportáteis', termos: ['sanduicheira', 'grill eletrico', 'grill', 'misteira', 'chapa eletrica'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'torradeira', nome: 'Torradeira', categoria: 'Eletroportáteis', termos: ['torradeira'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'forno-eletrico', nome: 'Forno elétrico de bancada', categoria: 'Eletroportáteis', termos: ['forno eletrico', 'mini forno', 'forno de bancada'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'pipoqueira', nome: 'Pipoqueira elétrica', categoria: 'Eletroportáteis', termos: ['pipoqueira'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'waffle', nome: 'Máquina de waffle / crepe / cupcake', categoria: 'Eletroportáteis', termos: ['waffle', 'maquina de waffle', 'crepeira', 'maquina de cupcake', 'maquina de donuts', 'omeleteira'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'cooktop-inducao', nome: 'Cooktop / fogão de indução portátil', categoria: 'Eletroportáteis', termos: ['cooktop', 'cooktop de inducao', 'fogao de inducao', 'fogareiro eletrico', 'cooktop eletrico'], regulamentos: ['inmetro-eletro', 'logistica-reversa'], norma: 'IEC 60335-2-6', atributos: { eletrico: true } },
  { id: 'churrasqueira-eletrica', nome: 'Churrasqueira elétrica', categoria: 'Eletroportáteis', termos: ['churrasqueira eletrica'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-78 / 2-9', atributos: { eletrico: true, alimento: true } },
  { id: 'micro-ondas', nome: 'Forno micro-ondas', categoria: 'Eletrodomésticos', termos: ['micro ondas', 'microondas'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-25', atributos: { eletrico: true, alimento: true }, notas: ['Micro-ondas também tem requisitos de eficiência energética (PBE) — confirme a etiqueta ENCE vigente.'] },

  /* ---------- Eletroportáteis de casa ---------- */
  { id: 'ferro-passar', nome: 'Ferro de passar roupa', categoria: 'Eletroportáteis', termos: ['ferro de passar', 'ferro a vapor', 'ferro eletrico'], regulamentos: ELETRO, norma: 'IEC 60335-2-3', atributos: { eletrico: true } },
  { id: 'vaporizador', nome: 'Vaporizador de roupas', categoria: 'Eletroportáteis', termos: ['vaporizador de roupas', 'vaporizador', 'passadeira a vapor', 'steamer'], regulamentos: ELETRO, norma: 'IEC 60335-2-85', atributos: { eletrico: true } },
  { id: 'aspirador', nome: 'Aspirador de pó', categoria: 'Eletroportáteis', termos: ['aspirador de po', 'aspirador vertical', 'aspirador'], regulamentos: ELETRO, norma: 'IEC 60335-2-2', atributos: { eletrico: true } },
  { id: 'robo-aspirador', nome: 'Robô aspirador', categoria: 'Eletroportáteis', termos: ['robo aspirador', 'aspirador robo', 'robo de limpeza'], regulamentos: ['inmetro-eletro', 'anatel-cat2', 'logistica-reversa'], norma: 'IEC 60335-2-2', atributos: { bateria: true, wifi: true }, notas: ['A base de carregamento é ligada à tomada; o robô funciona a bateria. Confirme com o OCP o enquadramento no INMETRO. Se tiver app/Wi-Fi, precisa de ANATEL.'] },
  { id: 'mop-vapor', nome: 'Mop / limpador a vapor', categoria: 'Eletroportáteis', termos: ['mop a vapor', 'limpador a vapor', 'vaporetto'], regulamentos: ELETRO, norma: 'IEC 60335-2-54', atributos: { eletrico: true } },
  { id: 'umidificador', nome: 'Umidificador de ar / difusor elétrico', categoria: 'Eletroportáteis', termos: ['umidificador', 'difusor de aromas', 'difusor eletrico', 'aromatizador eletrico'], regulamentos: ELETRO, norma: 'IEC 60335-2-98', atributos: { eletrico: true }, notas: ['Umidificadores USB de baixa tensão podem ficar fora do escopo — confirme com o OCP.'] },
  { id: 'aquecedor', nome: 'Aquecedor elétrico', categoria: 'Eletroportáteis', termos: ['aquecedor eletrico', 'aquecedor de ambiente', 'aquecedor'], regulamentos: ELETRO, norma: 'IEC 60335-2-30', atributos: { eletrico: true } },
  { id: 'purificador-ar', nome: 'Purificador de ar', categoria: 'Eletroportáteis', termos: ['purificador de ar'], regulamentos: ELETRO, norma: 'IEC 60335-2-65', atributos: { eletrico: true } },
  { id: 'desumidificador', nome: 'Desumidificador', categoria: 'Eletroportáteis', termos: ['desumidificador'], regulamentos: ELETRO, norma: 'IEC 60335-2-40', atributos: { eletrico: true } },
  { id: 'maquina-costura', nome: 'Máquina de costura', categoria: 'Eletroportáteis', termos: ['maquina de costura'], regulamentos: ELETRO, norma: 'IEC 60335-2-28', atributos: { eletrico: true } },
  { id: 'chuveiro', nome: 'Chuveiro / torneira elétrica', categoria: 'Eletrodomésticos', termos: ['chuveiro eletrico', 'chuveiro', 'torneira eletrica', 'ducha eletrica'], regulamentos: ELETRO, norma: 'IEC 60335-2-35', atributos: { eletrico: true }, notas: ['Chuveiros elétricos também têm etiquetagem de eficiência (PBE) — confirme a portaria específica vigente.'] },

  /* ---------- Ventiladores ---------- */
  { id: 'ventilador', nome: 'Ventilador de mesa, parede ou coluna', categoria: 'Eletroportáteis', termos: ['ventilador', 'ventilador de mesa', 'ventilador de coluna', 'ventilador de parede', 'ventilador de pedestal'], regulamentos: ['inmetro-ventilador', 'logistica-reversa'], norma: 'IEC 60335-2-80', atributos: { eletrico: true } },
  { id: 'circulador', nome: 'Circulador de ar', categoria: 'Eletroportáteis', termos: ['circulador de ar', 'circulador'], regulamentos: ['inmetro-ventilador', 'logistica-reversa'], norma: 'IEC 60335-2-80', atributos: { eletrico: true } },
  { id: 'ventilador-teto', nome: 'Ventilador de teto', categoria: 'Eletroportáteis', termos: ['ventilador de teto'], regulamentos: ELETRO, norma: 'IEC 60335-2-80', atributos: { eletrico: true }, notas: ['Ventilador de teto não está na Portaria 299/2021 (mesa/parede/pedestal/circulador): confirme com o OCP o enquadramento na Portaria 148/2022.'] },
  { id: 'mini-ventilador', nome: 'Mini ventilador portátil USB/recarregável', categoria: 'Eletrônicos', termos: ['mini ventilador', 'ventilador portatil', 'ventilador usb', 'ventilador de mao', 'ventilador de pescoco'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Não funciona ligado diretamente a 127/220 V: em geral fica fora das portarias de ventiladores e eletrodomésticos — confirme com o OCP.'] },

  /* ---------- Beleza e cuidado pessoal (elétricos) ---------- */
  { id: 'secador', nome: 'Secador de cabelo', categoria: 'Beleza & Bem-estar', termos: ['secador de cabelo', 'secador'], regulamentos: ELETRO, norma: 'IEC 60335-2-23', atributos: { eletrico: true } },
  { id: 'prancha', nome: 'Prancha / chapinha alisadora', categoria: 'Beleza & Bem-estar', termos: ['prancha', 'chapinha', 'alisador de cabelo', 'prancha alisadora'], regulamentos: ELETRO, norma: 'IEC 60335-2-23', atributos: { eletrico: true } },
  { id: 'escova-secadora', nome: 'Escova secadora / modeladora', categoria: 'Beleza & Bem-estar', termos: ['escova secadora', 'escova modeladora', 'escova rotativa', 'escova alisadora', 'escova eletrica de cabelo'], regulamentos: ELETRO, norma: 'IEC 60335-2-23', atributos: { eletrico: true } },
  { id: 'modelador-cachos', nome: 'Modelador de cachos (babyliss)', categoria: 'Beleza & Bem-estar', termos: ['modelador de cachos', 'babyliss', 'cacheador', 'baby liss'], regulamentos: ELETRO, norma: 'IEC 60335-2-23', atributos: { eletrico: true } },
  { id: 'barbeador', nome: 'Barbeador / aparador de pelos', categoria: 'Beleza & Bem-estar', termos: ['barbeador', 'aparador de pelos', 'maquina de cortar cabelo', 'maquina de barbear', 'trimmer', 'aparador de barba'], regulamentos: ELETRO, norma: 'IEC 60335-2-8', atributos: { eletrico: true, bateria: true }, notas: ['Modelos só a bateria com carregador USB podem ter enquadramento diferente — confirme com o OCP.'] },
  { id: 'depilador', nome: 'Depilador elétrico', categoria: 'Beleza & Bem-estar', termos: ['depilador eletrico', 'depilador', 'epilador'], regulamentos: ELETRO, norma: 'IEC 60335-2-8', atributos: { eletrico: true } },
  { id: 'escova-dental', nome: 'Escova de dente elétrica / irrigador oral', categoria: 'Beleza & Bem-estar', termos: ['escova de dente eletrica', 'escova dental eletrica', 'irrigador oral', 'irrigador dental'], regulamentos: ELETRO, norma: 'IEC 60335-2-52', atributos: { bateria: true } },
  { id: 'massageador', nome: 'Massageador elétrico', categoria: 'Beleza & Bem-estar', termos: ['massageador', 'pistola de massagem', 'massageador eletrico'], regulamentos: ELETRO, norma: 'IEC 60335-2-32', atributos: { eletrico: true }, notas: ['Se o massageador fizer alegação terapêutica, pode virar produto para saúde (ANVISA).'] },
  { id: 'cosmetico', nome: 'Cosmético (creme, xampu, maquiagem, perfume)', categoria: 'Beleza & Bem-estar', termos: ['creme', 'shampoo', 'xampu', 'condicionador', 'maquiagem', 'batom', 'perfume', 'hidratante', 'protetor solar', 'esmalte', 'serum', 'cosmetico'], regulamentos: ['anvisa-cosmeticos'], atributos: {} },

  /* ---------- Material elétrico e iluminação ---------- */
  { id: 'extensao', nome: 'Extensão elétrica', categoria: 'Material elétrico', termos: ['extensao eletrica', 'extensao', 'cabo extensor'], regulamentos: ['inmetro-plugues'], atributos: { eletrico: true } },
  { id: 'filtro-linha', nome: 'Filtro de linha / régua de tomadas', categoria: 'Material elétrico', termos: ['filtro de linha', 'regua de tomadas', 'protetor eletronico', 'regua de energia'], regulamentos: ['inmetro-plugues'], atributos: { eletrico: true } },
  { id: 'adaptador-tomada', nome: 'Adaptador de tomada (T, benjamim, universal)', categoria: 'Material elétrico', termos: ['adaptador de tomada', 'benjamim', 'adaptador universal', 'adaptador t', 'tomada t', 'adaptador de plugue'], regulamentos: ['inmetro-plugues'], atributos: { eletrico: true } },
  { id: 'tomada-inteligente', nome: 'Tomada inteligente (smart plug)', categoria: 'Casa inteligente', termos: ['tomada inteligente', 'smart plug', 'tomada smart', 'tomada wifi'], regulamentos: ['inmetro-plugues', 'anatel-cat2', 'logistica-reversa'], atributos: { eletrico: true, wifi: true } },
  { id: 'fio-cabo', nome: 'Fio / cabo elétrico (rolo)', categoria: 'Material elétrico', termos: ['fio eletrico', 'cabo eletrico', 'cabo flexivel', 'rolo de fio', 'cabo de forca'], regulamentos: ['inmetro-fios'], atributos: {} },
  { id: 'lampada-led', nome: 'Lâmpada LED (bulbo/tubular)', categoria: 'Iluminação', termos: ['lampada led', 'lampada', 'bulbo led'], regulamentos: ['inmetro-led', 'logistica-reversa'], atributos: { eletrico: true } },
  { id: 'lampada-inteligente', nome: 'Lâmpada inteligente Wi-Fi/Bluetooth', categoria: 'Casa inteligente', termos: ['lampada inteligente', 'lampada smart', 'lampada wifi', 'lampada rgb', 'lampada bluetooth'], regulamentos: ['inmetro-led', 'anatel-cat2', 'logistica-reversa'], atributos: { eletrico: true, wifi: true } },
  { id: 'luminaria', nome: 'Luminária / abajur de uso doméstico', categoria: 'Iluminação', termos: ['luminaria', 'abajur', 'luminaria de mesa', 'arandela', 'pendente', 'luz noturna'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Luminária doméstica não tem certificação compulsória conhecida na base; a lâmpada LED vendida junto precisa ser certificada (Portaria 69/2022). Luminária pública tem portaria própria (62/2022).'] },
  { id: 'fita-led', nome: 'Fita LED', categoria: 'Iluminação', termos: ['fita led', 'led strip', 'mangueira led'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Fita LED não está entre as portarias da base. Se vier com controle por app, Bluetooth, Wi-Fi ou controle remoto RF, precisa de ANATEL.'] },
  { id: 'ring-light', nome: 'Ring light', categoria: 'Iluminação', termos: ['ring light', 'iluminador de selfie', 'luz de selfie'], regulamentos: ['logistica-reversa'], atributos: {}, notas: ['Sem certificação compulsória conhecida; se tiver controle Bluetooth (disparador) ou RF, precisa de ANATEL.'] },
  { id: 'luminaria-solar', nome: 'Luminária / refletor solar', categoria: 'Iluminação', termos: ['luminaria solar', 'refletor solar', 'luz solar', 'arandela solar', 'poste solar'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Se tiver controle remoto por rádio, precisa de ANATEL.'] },

  /* ---------- Carregadores e energia ---------- */
  { id: 'carregador-celular', nome: 'Carregador de celular (fonte USB)', categoria: 'Eletrônicos', termos: ['carregador de celular', 'carregador usb', 'fonte usb', 'carregador turbo', 'carregador veicular', 'carregador tomada'], regulamentos: ['anatel-acessorio-celular', 'logistica-reversa'], atributos: { eletrico: true } },
  { id: 'power-bank', nome: 'Power bank (bateria externa)', categoria: 'Eletrônicos', termos: ['power bank', 'powerbank', 'bateria externa', 'carregador portatil', 'bateria portatil'], regulamentos: ['anatel-acessorio-celular', 'logistica-reversa'], atributos: { bateria: true } },
  { id: 'bateria-celular', nome: 'Bateria de lítio para celular', categoria: 'Eletrônicos', termos: ['bateria de celular', 'bateria para celular', 'bateria iphone', 'bateria samsung'], regulamentos: ['anatel-acessorio-celular', 'logistica-reversa'], atributos: { bateria: true } },
  { id: 'carregador-sem-fio', nome: 'Carregador sem fio (indução)', categoria: 'Eletrônicos', termos: ['carregador sem fio', 'carregador por inducao', 'carregador wireless', 'base de carregamento sem fio', 'magsafe'], regulamentos: ['anatel-cat2', 'anatel-acessorio-celular', 'logistica-reversa'], atributos: { eletrico: true, rf: true }, notas: ['Carregamento por indução é transmissão de energia por radiofrequência (Ato 14.448) e também é acessório de celular.'] },
  { id: 'acessorio-celular', nome: 'Capinha, película ou suporte de celular', categoria: 'Eletrônicos', termos: ['capinha', 'capa de celular', 'capinha de celular', 'pelicula', 'pelicula de vidro', 'suporte de celular', 'suporte para celular', 'pop socket', 'tripe de celular', 'pau de selfie'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Pau de selfie com disparador Bluetooth precisa de ANATEL.'] },
  { id: 'cabo-usb', nome: 'Cabo USB / cabo de dados', categoria: 'Eletrônicos', termos: ['cabo usb', 'cabo de dados', 'cabo lightning', 'cabo tipo c', 'cabo usb c'], regulamentos: [], atributos: {}, notas: ['Cabo USB simples não tem certificação compulsória conhecida na base.'] },

  /* ---------- Áudio, vídeo e conectividade ---------- */
  { id: 'fone-bluetooth', nome: 'Fone de ouvido Bluetooth', categoria: 'Eletrônicos', termos: ['fone bluetooth', 'fone de ouvido bluetooth', 'fone sem fio', 'headset bluetooth', 'earbuds', 'headphone bluetooth', 'fone tws'], regulamentos: RADIO, atributos: { bluetooth: true, bateria: true } },
  { id: 'fone-com-fio', nome: 'Fone de ouvido com fio', categoria: 'Eletrônicos', termos: ['fone com fio', 'fone de ouvido com fio', 'fone p2', 'fone de ouvido'], regulamentos: [], atributos: {}, notas: ['Fone com fio não tem homologação compulsória. Se tiver Bluetooth, vira Categoria II da ANATEL.'] },
  { id: 'caixa-som', nome: 'Caixa de som Bluetooth', categoria: 'Eletrônicos', termos: ['caixa de som bluetooth', 'caixa de som', 'speaker bluetooth', 'caixinha de som', 'som portatil', 'jbl'], regulamentos: RADIO, atributos: { bluetooth: true, bateria: true } },
  { id: 'microfone-sem-fio', nome: 'Microfone sem fio', categoria: 'Eletrônicos', termos: ['microfone sem fio', 'microfone de lapela sem fio', 'microfone wireless', 'microfone bluetooth', 'microfone karaoke bluetooth'], regulamentos: RADIO, atributos: { rf: true, bateria: true }, notas: ['Confirme se a faixa de frequência do microfone é permitida no Brasil antes de importar.'] },
  { id: 'smartwatch', nome: 'Smartwatch / smartband', categoria: 'Eletrônicos', termos: ['smartwatch', 'relogio inteligente', 'smartband', 'pulseira inteligente', 'relogio smart'], regulamentos: RADIO, atributos: { bluetooth: true, bateria: true }, notas: ['Se tiver chip 4G/eSIM, passa a ser Categoria I (marque "Rede celular").'] },
  { id: 'teclado-mouse', nome: 'Teclado / mouse sem fio', categoria: 'Eletrônicos', termos: ['mouse sem fio', 'teclado sem fio', 'mouse bluetooth', 'teclado bluetooth', 'kit teclado e mouse sem fio'], regulamentos: RADIO, atributos: { rf: true } },
  { id: 'controle-game', nome: 'Controle de videogame sem fio', categoria: 'Eletrônicos', termos: ['controle de videogame', 'joystick bluetooth', 'gamepad', 'controle sem fio', 'controle bluetooth'], regulamentos: RADIO, atributos: { bluetooth: true, bateria: true } },
  { id: 'camera-wifi', nome: 'Câmera Wi-Fi / câmera IP de segurança', categoria: 'Casa inteligente', termos: ['camera wifi', 'camera ip', 'camera de seguranca', 'camera inteligente', 'camera espia wifi', 'camera 360'], regulamentos: RADIO, atributos: { wifi: true } },
  { id: 'baba-eletronica', nome: 'Babá eletrônica', categoria: 'Infantil', termos: ['baba eletronica', 'baba eletronica com camera', 'monitor de bebe'], regulamentos: RADIO, atributos: { rf: true, infantil: true } },
  { id: 'campainha-inteligente', nome: 'Campainha / interfone sem fio', categoria: 'Casa inteligente', termos: ['campainha sem fio', 'campainha inteligente', 'video porteiro wifi', 'campainha wifi'], regulamentos: RADIO, atributos: { rf: true } },
  { id: 'fechadura-digital', nome: 'Fechadura digital (Bluetooth/Wi-Fi)', categoria: 'Casa inteligente', termos: ['fechadura digital', 'fechadura eletronica', 'fechadura inteligente', 'fechadura biometrica'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Fechadura só com senha/biometria não precisa de ANATEL; se tiver Bluetooth, Wi-Fi, NFC/RFID ou controle remoto, marque o atributo e precisa de Categoria II.'] },
  { id: 'roteador', nome: 'Roteador / repetidor Wi-Fi', categoria: 'Eletrônicos', termos: ['roteador', 'repetidor wifi', 'repetidor de sinal', 'access point', 'mesh wifi', 'extensor de wifi'], regulamentos: RADIO, atributos: { wifi: true, eletrico: true } },
  { id: 'tv-box', nome: 'TV box / receptor de streaming', categoria: 'Eletrônicos', termos: ['tv box', 'tvbox', 'receptor de streaming', 'smart box', 'mi box'], regulamentos: RADIO, atributos: { wifi: true, eletrico: true }, notas: ['A ANATEL combate TV boxes que dão acesso a conteúdo pirata — só homologue modelos sem apps/serviços ilegais.'] },
  { id: 'controle-portao', nome: 'Controle remoto de portão / alarme (RF)', categoria: 'Casa inteligente', termos: ['controle de portao', 'controle remoto de portao', 'controle 433', 'controle de alarme'], regulamentos: RADIO, atributos: { rf: true, bateria: true } },
  { id: 'controle-ir', nome: 'Controle remoto infravermelho (TV/ar)', categoria: 'Eletrônicos', termos: ['controle remoto universal', 'controle de tv', 'controle de ar condicionado', 'controle infravermelho'], regulamentos: [], atributos: {}, notas: ['Infravermelho não é radiofrequência: não precisa de ANATEL. Se o controle usar rádio (RF/Bluetooth), precisa.'] },
  { id: 'rastreador', nome: 'Rastreador GPS com chip', categoria: 'Eletrônicos', termos: ['rastreador gps', 'rastreador veicular', 'localizador gps', 'rastreador com chip'], regulamentos: ['anatel-cat1', 'logistica-reversa'], atributos: { celular: true, bateria: true } },
  { id: 'tag-localizador', nome: 'Tag localizadora Bluetooth', categoria: 'Eletrônicos', termos: ['tag localizadora', 'localizador bluetooth', 'air tag', 'airtag', 'smart tag', 'localizador de chaves'], regulamentos: RADIO, atributos: { bluetooth: true } },
  { id: 'celular', nome: 'Celular / smartphone', categoria: 'Eletrônicos', termos: ['celular', 'smartphone', 'telefone celular'], regulamentos: ['anatel-cat1', 'logistica-reversa'], atributos: { celular: true, bateria: true, bluetooth: true, wifi: true } },
  { id: 'modem-4g', nome: 'Modem / roteador 4G-5G', categoria: 'Eletrônicos', termos: ['modem 4g', 'roteador 4g', 'modem 5g', 'roteador com chip', 'mifi'], regulamentos: ['anatel-cat1', 'logistica-reversa'], atributos: { celular: true, wifi: true } },
  { id: 'radio-comunicador', nome: 'Rádio comunicador (walkie-talkie)', categoria: 'Eletrônicos', termos: ['walkie talkie', 'radio comunicador', 'radinho comunicador', 'ht radio'], regulamentos: RADIO, atributos: { rf: true, bateria: true }, notas: ['Só faixas de uso pessoal permitidas no Brasil; rádios profissionais (VHF/UHF) seguem outra regulamentação e exigem licença.'] },
  { id: 'balanca-bluetooth', nome: 'Balança digital com Bluetooth/app', categoria: 'Beleza & Bem-estar', termos: ['balanca bluetooth', 'balanca inteligente', 'balanca bioimpedancia', 'balanca smart'], regulamentos: RADIO, atributos: { bluetooth: true } },
  { id: 'projetor', nome: 'Projetor portátil', categoria: 'Eletrônicos', termos: ['projetor', 'mini projetor', 'projetor portatil'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Sem certificação INMETRO compulsória conhecida; se tiver Wi-Fi/Bluetooth (a maioria tem), precisa de ANATEL.'] },
  { id: 'drone', nome: 'Drone', categoria: 'Eletrônicos', termos: ['drone', 'quadricoptero', 'quadcopter'], regulamentos: ['anatel-cat2', 'anac-drone', 'logistica-reversa'], atributos: { rf: true, bateria: true } },

  /* ---------- Infantil e lazer ---------- */
  { id: 'brinquedo', nome: 'Brinquedo (genérico)', categoria: 'Infantil & Lazer', termos: ['brinquedo', 'brinquedos', 'boneca', 'boneco', 'pelucia', 'carrinho de brinquedo', 'blocos de montar', 'quebra cabeca', 'jogo de tabuleiro', 'kit medico infantil', 'cozinha infantil', 'fidget', 'pop it', 'pião', 'piao', 'bola infantil', 'chocalho', 'mordedor'], regulamentos: ['inmetro-brinquedos'], atributos: { infantil: true } },
  { id: 'slime', nome: 'Slime / geleca', categoria: 'Infantil & Lazer', termos: ['slime', 'geleca', 'amoeba'], regulamentos: ['inmetro-brinquedos'], atributos: { infantil: true }, notas: ['Slime é avaliado como brinquedo (inclui ensaios químicos, como boro migrável).'] },
  { id: 'brinquedo-eletronico', nome: 'Brinquedo eletrônico / com pilha', categoria: 'Infantil & Lazer', termos: ['brinquedo eletronico', 'brinquedo com luz', 'brinquedo musical', 'brinquedo a pilha', 'brinquedo com som', 'robo de brinquedo', 'microfone infantil'], regulamentos: ['inmetro-brinquedos', 'logistica-reversa'], atributos: { infantil: true, bateria: true } },
  { id: 'carrinho-controle', nome: 'Carrinho / brinquedo de controle remoto', categoria: 'Infantil & Lazer', termos: ['carrinho de controle remoto', 'carro de controle remoto', 'brinquedo de controle remoto', 'caminhao controle remoto', 'helicoptero de controle remoto', 'barco de controle remoto'], regulamentos: ['inmetro-brinquedos', 'anatel-cat2', 'logistica-reversa'], atributos: { infantil: true, rf: true, bateria: true } },
  { id: 'drone-infantil', nome: 'Drone de brinquedo', categoria: 'Infantil & Lazer', termos: ['drone infantil', 'drone de brinquedo', 'mini drone'], regulamentos: ['inmetro-brinquedos', 'anatel-cat2', 'anac-drone', 'logistica-reversa'], atributos: { infantil: true, rf: true, bateria: true } },
  { id: 'patinete-infantil', nome: 'Patinete infantil (sem motor)', categoria: 'Infantil & Lazer', termos: ['patinete infantil', 'patinete', 'scooter infantil'], regulamentos: ['inmetro-brinquedos'], atributos: { infantil: true }, notas: ['Patinetes infantis costumam ser avaliados como brinquedo conforme peso/idade do usuário — confirme o limite com o OCP. Patinete elétrico adulto não está na base.'] },
  { id: 'triciclo', nome: 'Triciclo / velotrol / carrinho de passeio de brinquedo', categoria: 'Infantil & Lazer', termos: ['triciclo', 'velotrol', 'motoca', 'quadriciclo infantil', 'carrinho de passeio infantil', 'bicicleta de equilibrio', 'balance bike'], regulamentos: ['inmetro-brinquedos'], atributos: { infantil: true } },
  { id: 'piscina-infantil', nome: 'Piscina inflável / brinquedo aquático infantil', categoria: 'Infantil & Lazer', termos: ['piscina infantil', 'piscina inflavel', 'brinquedo aquatico', 'boia de braco', 'boia infantil'], regulamentos: ['inmetro-brinquedos'], atributos: { infantil: true }, notas: ['Confirme com o OCP se o produto é brinquedo aquático ou artigo de flutuação (boias de segurança têm requisitos diferentes).'] },
  { id: 'bicicleta-infantil', nome: 'Bicicleta infantil', categoria: 'Infantil & Lazer', termos: ['bicicleta infantil', 'bike infantil', 'bicicleta aro 12', 'bicicleta aro 16', 'bicicleta aro 20', 'bicicleta com rodinha'], regulamentos: ['inmetro-bicicleta-infantil'], atributos: { infantil: true } },
  { id: 'carrinho-bebe', nome: 'Carrinho de bebê', categoria: 'Infantil & Lazer', termos: ['carrinho de bebe', 'carrinho de passeio', 'travel system', 'carrinho guarda chuva'], regulamentos: ['inmetro-carrinho-bebe'], atributos: { infantil: true } },
  { id: 'berco', nome: 'Berço infantil', categoria: 'Infantil & Lazer', termos: ['berco', 'berco portatil', 'mini berco', 'berco desmontavel', 'cercadinho'], regulamentos: ['inmetro-berco'], atributos: { infantil: true } },
  { id: 'cadeirinha-auto', nome: 'Cadeirinha / bebê-conforto para carro', categoria: 'Infantil & Lazer', termos: ['cadeirinha de carro', 'cadeirinha para carro', 'bebe conforto', 'assento de elevacao', 'booster'], regulamentos: ['inmetro-cadeirinha'], atributos: { infantil: true } },
  { id: 'mamadeira', nome: 'Mamadeira / bico / chupeta', categoria: 'Infantil & Lazer', termos: ['mamadeira', 'chupeta', 'bico de mamadeira', 'bico'], regulamentos: ['inmetro-mamadeira', 'anvisa-alimentos'], atributos: { infantil: true, alimento: true } },

  /* ---------- Artigos escolares ---------- */
  { id: 'artigo-escolar', nome: 'Artigo escolar', categoria: 'Infantil & Lazer', termos: ['artigo escolar', 'material escolar', 'lapis', 'lapis de cor', 'caneta', 'canetinha', 'caneta hidrografica', 'borracha', 'apontador', 'cola escolar', 'cola bastao', 'tesoura escolar', 'tesoura sem ponta', 'regua', 'estojo', 'giz de cera', 'tinta guache', 'massinha', 'massa de modelar', 'marca texto', 'lapiseira', 'corretivo', 'compasso', 'kit escolar'], regulamentos: ['inmetro-escolar'], atributos: { infantil: true }, notas: ['Confira se o item está na lista da Portaria 423/2021 (24 tipos de artigos para menores de 14 anos).'] },
  { id: 'lancheira', nome: 'Lancheira / merendeira infantil', categoria: 'Infantil & Lazer', termos: ['lancheira', 'merendeira', 'lancheira termica'], regulamentos: ['inmetro-escolar', 'anvisa-alimentos'], atributos: { infantil: true, alimento: true }, notas: ['Confirme se a lancheira está entre os itens da Portaria 423/2021.'] },

  /* ---------- Cozinha e utilidades ---------- */
  { id: 'panela-pressao', nome: 'Panela de pressão', categoria: 'Cozinha & Dia a Dia', termos: ['panela de pressao'], regulamentos: ['inmetro-panela-pressao', 'anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'panela', nome: 'Panela / frigideira metálica (alumínio, inox, antiaderente)', categoria: 'Cozinha & Dia a Dia', termos: ['panela', 'jogo de panelas', 'frigideira', 'cacarola', 'panela antiaderente', 'panela inox', 'wok', 'leiteira', 'cacarola inox'], regulamentos: ['inmetro-panelas', 'anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'panela-ceramica', nome: 'Panela de cerâmica / vidro / ferro fundido', categoria: 'Cozinha & Dia a Dia', termos: ['panela de ceramica', 'panela de vidro', 'panela de barro', 'travessa', 'refratario', 'panela de ferro'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true }, notas: ['Panelas de ferro fundido são metálicas: confirme se entram na Portaria 499/2021.'] },
  { id: 'garrafa-termica', nome: 'Garrafa / copo térmico', categoria: 'Cozinha & Dia a Dia', termos: ['garrafa termica', 'copo termico', 'caneca termica', 'termo', 'stanley', 'garrafa inox', 'bule termico'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true }, notas: ['Não há certificação compulsória do INMETRO para garrafas térmicas na base (o INMETRO estuda atualizar a norma). Exige conformidade ANVISA para contato com bebidas.'] },
  { id: 'garrafa-plastica', nome: 'Garrafa / squeeze / copo plástico', categoria: 'Cozinha & Dia a Dia', termos: ['squeeze', 'garrafa plastica', 'garrafa de agua', 'copo plastico', 'copo reutilizavel', 'garrafa motivacional', 'coqueteleira'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'pote', nome: 'Pote / marmita / recipiente para alimentos', categoria: 'Cozinha & Dia a Dia', termos: ['pote hermetico', 'pote', 'marmita', 'recipiente', 'porta mantimentos', 'vasilha', 'pote de vidro', 'porta temperos', 'saleiro', 'acucareiro'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'utensilios', nome: 'Utensílios de cozinha (espátulas, talheres, formas)', categoria: 'Cozinha & Dia a Dia', termos: ['utensilio', 'utensilios de cozinha', 'espatula', 'concha', 'talher', 'talheres', 'faca', 'forma de silicone', 'forma de bolo', 'tabua de corte', 'escorredor', 'peneira', 'ralador', 'abridor', 'kit churrasco', 'assadeira', 'forma de pizza', 'cortador de legumes', 'mandoline', 'fatiador', 'espremedor de alho', 'pegador', 'colher de pau'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'copo-vidro', nome: 'Copos, taças e louças', categoria: 'Cozinha & Dia a Dia', termos: ['copo de vidro', 'taca', 'caneca', 'xicara', 'prato', 'jogo de jantar', 'louca', 'jarra'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true } },
  { id: 'mangueira-gas', nome: 'Mangueira de gás (GLP)', categoria: 'Casa', termos: ['mangueira de gas', 'mangueira glp', 'mangueira para fogao'], regulamentos: ['inmetro-mangueira-glp'], atributos: {} },
  { id: 'regulador-gas', nome: 'Regulador de gás (GLP)', categoria: 'Casa', termos: ['regulador de gas', 'registro de gas', 'regulador glp', 'kit gas'], regulamentos: ['inmetro-regulador-glp', 'inmetro-mangueira-glp'], atributos: {}, notas: ['Se o kit não inclui mangueira, remova a exigência de mangueira.'] },
  { id: 'colchao', nome: 'Colchão / colchonete de espuma', categoria: 'Casa', termos: ['colchao', 'colchonete', 'colchao de espuma', 'colchao solteiro', 'colchao casal'], regulamentos: ['inmetro-colchao'], atributos: {}, notas: ['Colchões de mola ou inflável não estão nesta portaria — confirme o tipo.'] },

  /* ---------- Casa, organização e ferramentas ---------- */
  { id: 'organizador', nome: 'Organizador / caixa organizadora / cabide', categoria: 'Organização', termos: ['organizador', 'caixa organizadora', 'cabide', 'nicho', 'prateleira', 'sapateira', 'gaveteiro', 'cesto', 'porta objetos', 'suporte', 'varal'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Se o organizador for para alimentos (porta-mantimentos), passa a exigir conformidade ANVISA.'] },
  { id: 'decoracao', nome: 'Item de decoração (quadro, vaso, tapete, almofada)', categoria: 'Casa & Decoração', termos: ['quadro', 'vaso', 'tapete', 'almofada', 'cortina', 'espelho', 'decoracao', 'porta retrato', 'relogio de parede'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Têxteis seguem regras de etiquetagem de composição (INMETRO – etiquetagem têxtil).'] },
  { id: 'ferramenta-eletrica', nome: 'Ferramenta elétrica (furadeira, parafusadeira, esmerilhadeira, serra)', categoria: 'Ferramentas & Utilidades', termos: ['ferramenta eletrica', 'ferramentas eletricas', 'furadeira', 'parafusadeira', 'esmerilhadeira', 'lixadeira', 'serra tico tico', 'serra circular', 'soprador termico', 'tupia', 'retifica', 'martelete', 'politriz', 'lavadora de alta pressao', 'pistola de cola quente', 'ferro de solda'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Não há certificação compulsória do INMETRO para ferramentas elétricas portáteis na base. Recomenda-se ensaio voluntário pela IEC 62841. "Sem fio" em ferramenta quer dizer bateria, não rádio. O carregador que acompanha deve ter plugue NBR 14136.'] },
  { id: 'ferramenta-manual', nome: 'Ferramenta manual / jogo de chaves', categoria: 'Ferramentas & Utilidades', termos: ['ferramenta manual', 'jogo de chaves', 'chave de fenda', 'alicate', 'martelo', 'trena', 'kit ferramentas', 'nivel', 'caixa de ferramentas'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Trenas e instrumentos de medição comercializados podem ter regras de metrologia legal — confirme se aplicável.'] },
  { id: 'mangueira-jardim', nome: 'Mangueira de jardim / irrigação', categoria: 'Ferramentas & Utilidades', termos: ['mangueira de jardim', 'mangueira', 'esguicho', 'irrigador', 'aspersor'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida (não confundir com mangueira de gás).'] },
  { id: 'travesseiro', nome: 'Travesseiro / roupa de cama', categoria: 'Casa', termos: ['travesseiro', 'lencol', 'edredom', 'cobertor', 'manta', 'fronha', 'toalha'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Têxteis exigem etiqueta de composição e cuidados (regulamento de etiquetagem têxtil do INMETRO).'] },
  { id: 'pet', nome: 'Produto para pet (brinquedo, cama, comedouro)', categoria: 'Pet', termos: ['pet', 'cachorro', 'gato', 'comedouro', 'bebedouro pet', 'caminha pet', 'arranhador', 'coleira', 'tapete higienico', 'guia para cachorro', 'casinha de cachorro'], regulamentos: [], atributos: {}, notas: ['Brinquedo para pet não é brinquedo infantil (não precisa da Portaria 302/2021). Bebedouro/fonte elétrica pode exigir avaliação elétrica — confirme.'] },
  /* ---------- Mais eletroportáteis ---------- */
  { id: 'sorveteira', nome: 'Sorveteira elétrica', categoria: 'Eletroportáteis', termos: ['sorveteira', 'maquina de sorvete', 'maquina de raspadinha'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-24', atributos: { eletrico: true, alimento: true } },
  { id: 'iogurteira', nome: 'Iogurteira / máquina de pão', categoria: 'Eletroportáteis', termos: ['iogurteira', 'maquina de pao', 'panificadora', 'fondue eletrico', 'panela fondue eletrica', 'chocolateira eletrica'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-9 / 2-15', atributos: { eletrico: true, alimento: true } },
  { id: 'aquecedor-mamadeira', nome: 'Aquecedor / esterilizador de mamadeira', categoria: 'Eletroportáteis', termos: ['aquecedor de mamadeira', 'esterilizador de mamadeira', 'esterilizador eletrico'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-15', atributos: { eletrico: true, alimento: true } },
  { id: 'algodao-doce', nome: 'Máquina de algodão doce / seladora a vácuo', categoria: 'Eletroportáteis', termos: ['algodao doce', 'maquina de algodao doce', 'seladora a vacuo', 'embaladora a vacuo', 'seladora de embalagem'], regulamentos: ELETRO_ALIM, atributos: { eletrico: true, alimento: true }, notas: ['Confirme com o OCP se o aparelho aparece na Tabela 1 do Anexo III da Portaria 148/2022.'] },
  { id: 'frigobar', nome: 'Frigobar / mini geladeira', categoria: 'Eletrodomésticos', termos: ['frigobar', 'mini geladeira', 'geladeira', 'adega climatizada', 'mini refrigerador'], regulamentos: ELETRO_ALIM, norma: 'IEC 60335-2-24', atributos: { eletrico: true, alimento: true }, notas: ['Refrigeradores também têm etiqueta de eficiência energética (ENCE/PBE) — confirme a portaria vigente. Mini geladeira USB/12 V pode ficar fora do escopo.'] },
  { id: 'aspirador-portatil', nome: 'Aspirador portátil de mão (recarregável)', categoria: 'Eletroportáteis', termos: ['aspirador portatil', 'aspirador de mao', 'aspirador sem fio', 'aspirador recarregavel'], regulamentos: ELETRO, norma: 'IEC 60335-2-2', atributos: { bateria: true }, notas: ['Aspirador só a bateria: confirme com o OCP se entra na Portaria 148/2022 (o carregador ligado à tomada costuma ser avaliado). "Sem fio" aqui quer dizer bateria, não rádio.'] },
  { id: 'aspirador-automotivo', nome: 'Aspirador automotivo / compressor 12 V', categoria: 'Automotivo', termos: ['aspirador automotivo', 'aspirador para carro', 'compressor de ar portatil', 'compressor 12v', 'calibrador de pneu', 'compressor automotivo'], regulamentos: ['logistica-reversa'], atributos: {}, notas: ['Aparelhos de 12 V do carro não estão nas portarias de eletrodomésticos da base.'] },
  { id: 'climatizador', nome: 'Climatizador / resfriador de ar', categoria: 'Eletroportáteis', termos: ['climatizador', 'climatizador de ar', 'resfriador de ar', 'ar condicionado portatil'], regulamentos: ELETRO, norma: 'IEC 60335-2-98 / 2-40', atributos: { eletrico: true }, notas: ['Ar-condicionado portátil tem também etiqueta de eficiência (ENCE). Mini climatizador USB pode ficar fora do escopo — confirme com o OCP.'] },
  { id: 'cobertor-eletrico', nome: 'Cobertor / manta / almofada térmica elétrica', categoria: 'Eletroportáteis', termos: ['cobertor eletrico', 'manta eletrica', 'manta termica eletrica', 'almofada termica eletrica', 'bolsa termica eletrica', 'aquecedor de pes', 'colchao termico'], regulamentos: ELETRO, norma: 'IEC 60335-2-17', atributos: { eletrico: true } },
  { id: 'mata-mosquito', nome: 'Mata-mosquito elétrico / repelente de tomada', categoria: 'Casa', termos: ['mata mosquito', 'raquete eletrica', 'raquete mata mosquito', 'repelente eletrico', 'armadilha para mosquito', 'luminaria mata mosquito'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Aparelhos contra insetos seguem a IEC 60335-2-59 — confirme com o OCP se o modelo está no escopo da Portaria 148/2022. Repelente com refil químico também envolve ANVISA (saneante).'] },
  { id: 'cabine-unha', nome: 'Cabine/secador de unha UV-LED', categoria: 'Beleza & Bem-estar', termos: ['cabine de unha', 'cabine led', 'secador de unha', 'lampada uv unha', 'cabine uv'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Não está entre as portarias da base: confirme com o OCP se a cabine (geralmente alimentada por fonte USB) tem enquadramento no INMETRO.'] },
  { id: 'depilacao-laser', nome: 'Depilador a laser / luz pulsada', categoria: 'Beleza & Bem-estar', termos: ['depilador a laser', 'depilacao a laser', 'luz pulsada', 'ipl'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true, saude: true }, notas: ['Equipamentos de laser/luz pulsada costumam ser regulados pela ANVISA como produto para saúde — confirme antes de importar.'] },
  { id: 'escova-facial', nome: 'Escova facial / aparelho de limpeza de pele', categoria: 'Beleza & Bem-estar', termos: ['escova facial', 'limpador facial', 'esponja facial eletrica', 'aparelho de limpeza de pele', 'espelho com led', 'espelho de maquiagem'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Sem certificação compulsória conhecida na base. Se fizer alegação terapêutica, pode virar produto para saúde (ANVISA).'] },
  { id: 'relogio-digital', nome: 'Relógio digital / despertador / balança simples', categoria: 'Casa', termos: ['despertador', 'relogio digital', 'relogio de mesa', 'balanca digital', 'balanca de banheiro', 'balanca de cozinha', 'termometro de ambiente', 'estacao meteorologica'], regulamentos: ['logistica-reversa'], atributos: {}, notas: ['Sem certificação compulsória para uso doméstico. Se tiver Bluetooth/Wi-Fi/app, precisa de ANATEL. Balança usada para vender por peso segue metrologia legal.'] },
  { id: 'termometro-culinario', nome: 'Termômetro culinário', categoria: 'Cozinha & Dia a Dia', termos: ['termometro culinario', 'termometro de cozinha', 'termometro para carne'], regulamentos: ['anvisa-alimentos', 'logistica-reversa'], atributos: { alimento: true, bateria: true } },

  /* ---------- Casa inteligente e segurança ---------- */
  { id: 'interruptor-inteligente', nome: 'Interruptor inteligente', categoria: 'Casa inteligente', termos: ['interruptor inteligente', 'interruptor wifi', 'interruptor smart', 'interruptor touch'], regulamentos: RADIO, atributos: { wifi: true, eletrico: true }, notas: ['Interruptores de instalação elétrica têm regulamento próprio do INMETRO — confirme o enquadramento com o OCP.'] },
  { id: 'sensor-alarme', nome: 'Sensor / alarme residencial sem fio', categoria: 'Casa inteligente', termos: ['sensor de presenca', 'sensor de porta', 'alarme residencial', 'alarme sem fio', 'hub zigbee', 'central de alarme', 'sensor inteligente', 'sirene sem fio'], regulamentos: RADIO, atributos: { rf: true, bateria: true } },

  /* ---------- Automotivo ---------- */
  { id: 'som-automotivo', nome: 'Som automotivo Bluetooth / transmissor FM', categoria: 'Automotivo', termos: ['som automotivo', 'radio automotivo', 'transmissor fm', 'kit bluetooth carro', 'receptor bluetooth carro', 'multimidia automotiva'], regulamentos: RADIO, atributos: { bluetooth: true } },
  { id: 'camera-re', nome: 'Câmera de ré / dashcam', categoria: 'Automotivo', termos: ['camera de re', 'dashcam', 'camera veicular', 'camera para carro'], regulamentos: ['logistica-reversa'], atributos: {}, notas: ['Com fio não precisa de ANATEL. Se for sem fio ou tiver Wi-Fi/app, marque a característica e passa a precisar.'] },

  /* ---------- Informática e energia ---------- */
  { id: 'acessorio-informatica', nome: 'Acessório de informática com fio (webcam, hub, mouse, headset)', categoria: 'Eletrônicos', termos: ['webcam', 'hub usb', 'mouse com fio', 'teclado com fio', 'headset gamer', 'cooler para notebook', 'suporte para notebook', 'mousepad', 'microfone usb', 'pen drive', 'cartao de memoria', 'hd externo'], regulamentos: ['logistica-reversa'], atributos: {}, notas: ['Sem certificação compulsória conhecida para versões com fio. Versão sem fio/Bluetooth precisa de ANATEL.'] },
  { id: 'adaptador-wireless', nome: 'Adaptador Bluetooth / Wi-Fi USB', categoria: 'Eletrônicos', termos: ['adaptador bluetooth', 'receptor bluetooth', 'dongle', 'adaptador wifi', 'antena wifi usb', 'receptor de audio bluetooth'], regulamentos: RADIO, atributos: { bluetooth: true } },
  { id: 'pilhas', nome: 'Pilhas e baterias comuns (AA, AAA, 9 V)', categoria: 'Eletrônicos', termos: ['pilha', 'pilhas', 'pilha aa', 'pilha aaa', 'bateria 9v', 'bateria de relogio', 'bateria cr2032', 'pilha recarregavel', 'carregador de pilha'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Pilhas e baterias seguem limites de metais pesados e logística reversa (Resolução CONAMA nº 401/2008) — conferir.'] },
  { id: 'lanterna', nome: 'Lanterna / luminária de emergência', categoria: 'Ferramentas & Utilidades', termos: ['lanterna', 'lanterna de cabeca', 'lanterna tatica', 'luminaria de emergencia', 'lampiao', 'luz de emergencia'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Sem certificação compulsória conhecida na base.'] },
  { id: 'laser-medicao', nome: 'Trena / nível a laser', categoria: 'Ferramentas & Utilidades', termos: ['trena a laser', 'trena laser', 'nivel a laser', 'nivel laser', 'medidor a laser'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Sem certificação compulsória conhecida; informe a classe do laser e as advertências em português. Se tiver Bluetooth, precisa de ANATEL.'] },
  { id: 'multimetro', nome: 'Multímetro / testador elétrico', categoria: 'Ferramentas & Utilidades', termos: ['multimetro', 'alicate amperimetro', 'testador de tensao', 'caneta detectora de tensao'], regulamentos: ['logistica-reversa'], atributos: { bateria: true }, notas: ['Sem certificação compulsória conhecida na base.'] },

  /* ---------- Lazer, esporte e camping ---------- */
  { id: 'carro-eletrico-infantil', nome: 'Carro / moto elétrica infantil (motorizado)', categoria: 'Infantil & Lazer', termos: ['carro eletrico infantil', 'moto eletrica infantil', 'carrinho eletrico infantil', 'quadriciclo eletrico infantil', 'mini carro eletrico'], regulamentos: ['inmetro-brinquedos', 'logistica-reversa'], atributos: { infantil: true, bateria: true }, notas: ['Brinquedo motorizado: inclui ensaios elétricos (ABNT NBR IEC 62115). Se vier com controle remoto para os pais, também precisa de ANATEL.'] },
  { id: 'fitness', nome: 'Acessório de academia (halter, corda, tapete de yoga)', categoria: 'Infantil & Lazer', termos: ['halter', 'anilha', 'kettlebell', 'corda de pular', 'tapete de yoga', 'faixa elastica', 'elastico de exercicio', 'roda abdominal', 'caneleira', 'bola de pilates', 'colchonete de academia'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida.'] },
  { id: 'esporte', nome: 'Bola, skate, patins e artigos esportivos', categoria: 'Infantil & Lazer', termos: ['bola de futebol', 'bola de volei', 'bola de basquete', 'skate', 'patins', 'raquete', 'frescobol', 'luva de goleiro', 'rede de volei'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória para uso adulto. Se o produto for para criança de até 14 anos (tamanho infantil, personagem), pode ser enquadrado como brinquedo — marque "Público infantil".'] },
  { id: 'camping', nome: 'Camping e praia (barraca, cadeira, cooler)', categoria: 'Infantil & Lazer', termos: ['barraca', 'cadeira de praia', 'guarda sol', 'saco de dormir', 'rede de descanso', 'colchao inflavel', 'cooler', 'caixa termica', 'bolsa termica'], regulamentos: [], atributos: {}, notas: ['Sem certificação compulsória conhecida. Cooler/caixa térmica que guarda alimento deve ter material adequado (ANVISA) — marque "Contato com alimentos".'] },
  { id: 'descartaveis', nome: 'Copos, pratos e talheres descartáveis', categoria: 'Cozinha & Dia a Dia', termos: ['copo descartavel', 'prato descartavel', 'talher descartavel', 'canudo', 'embalagem para delivery', 'marmitex'], regulamentos: ['anvisa-alimentos'], atributos: { alimento: true }, notas: ['Copos plásticos descartáveis já tiveram regulamento específico no INMETRO — confirme se há exigência vigente.'] },

  /* ---------- Pet e aquário ---------- */
  { id: 'pet-eletrico', nome: 'Fonte de água / comedouro automático / aquário', categoria: 'Pet', termos: ['fonte para gatos', 'fonte de agua pet', 'bebedouro eletrico', 'comedouro automatico', 'bomba de aquario', 'filtro de aquario', 'termostato de aquario', 'aquario'], regulamentos: ['logistica-reversa'], atributos: { eletrico: true }, notas: ['Aparelhos para aquário e animais seguem a IEC 60335-2-55/2-71 — confirme com o OCP se o modelo está no escopo da Portaria 148/2022. Comedouro com app/Wi-Fi precisa de ANATEL.'] },
];

/* Lista de ids para validação (usada também no prompt da IA) */
export const IDS_REGULAMENTOS = Object.keys(REGULAMENTOS);
