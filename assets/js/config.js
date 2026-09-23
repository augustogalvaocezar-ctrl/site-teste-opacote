/* =========================================================
   CONFIGURAÇÃO DA LANDING PAGE — edite só este arquivo.
   Tudo que ficar vazio simplesmente não aparece no site.
   ========================================================= */
window.LP_CONFIG = {
  /* WhatsApp que recebe as solicitações do formulário.
     Formato internacional, só dígitos. Ex.: '5548999999999' */
  whatsapp: '',

  /* Vídeo do Paulo no YouTube: cole só o ID do vídeo.
     Ex.: para https://www.youtube.com/watch?v=AbC123xyz → 'AbC123xyz'
     Vazio = a seção de vídeo fica escondida. */
  youtubeId: '',

  /* Depoimentos REAIS de mentorados (com autorização deles).
     Vazio = a seção de depoimentos fica escondida.
     Modelo de um item:
     { nome: 'Nome Sobrenome', empresa: 'Empresa · Cidade/UF',
       foto: 'assets/img/depoimento-1.jpg',   // opcional
       resultado: 'Primeira importação com margem de 38%', // opcional, destaque curto
       texto: 'O que a pessoa disse, com as palavras dela.' } */
  depoimentos: [],

  /* Rastreamento (opcional). Cole os IDs quando tiver. */
  metaPixelId: '',      // Ex.: '1234567890'
  ga4Id: '',            // Ex.: 'G-XXXXXXXXXX'
};

/* ---------------------------------------------------------
   MODO DE PRÉVIA: abra a página com ?demo no final do link
   para ver como ficam vídeo e depoimentos. Os textos abaixo
   são FICTÍCIOS e aparecem com o selo "EXEMPLO".
   Eles nunca aparecem no link normal.
   --------------------------------------------------------- */
if (/[?&]demo\b/.test(location.search)) {
  window.LP_CONFIG.demo = true;
  window.LP_CONFIG.depoimentos = [
    { nome: 'Ricardo Menezes', empresa: 'Distribuidora de utilidades · SC',
      resultado: 'Primeira importação sem surpresa de custo',
      texto: 'Eu já comprava de importadores e achava que ir direto à origem era só achar um fornecedor mais barato. No diagnóstico o Paulo mostrou que o meu maior risco era a classificação fiscal. Ajustamos antes de fechar o pedido.' },
    { nome: 'Camila Duarte', empresa: 'Marca própria de casa e cozinha · SP',
      resultado: 'Fornecedor validado antes do pagamento',
      texto: 'Tinha três fornecedores com preços parecidos. Nas reuniões a gente analisou prazo, qualidade e negociação de cada um. Escolhi com segurança, e o suporte pelo WhatsApp resolveu dúvidas que não podiam esperar.' },
    { nome: 'André Luiz Farias', empresa: 'E-commerce de ferramentas · PR',
      resultado: 'Operação planejada para escalar',
      texto: 'O que mais me ajudou foi o planejamento logístico. Eu teria deixado capital parado no porto. Depois da primeira importação, fizemos a análise dos resultados e já planejamos o próximo container.' },
  ];
}
