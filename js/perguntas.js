/*
 * Próximo Passo — banco de perguntas e frases
 * ------------------------------------------------------------
 * Este é o arquivo para mudar o conteúdo do app sem mexer na lógica:
 * opções de vaga, funções, frases que viram tópicos do currículo,
 * pontos fortes, habilidades e cursos sugeridos.
 *
 * Regras simples para editar:
 *  - Mantenha as aspas simples e a vírgula no fim de cada item.
 *  - Não mude os "id" que já existem (eles ligam as partes do app).
 *  - As frases estão no feminino porque o app foi pensado para mulheres.
 */
window.PP_PERGUNTAS = (function () {
  'use strict';

  // Vagas que a pessoa pode escolher (até 3).
  // "titulo" aparece no currículo; "foco" escolhe o final da frase do objetivo.
  var AREAS = [
    { id: 'caixa', rotulo: 'Operadora de caixa', titulo: 'Operadora de Caixa', foco: 'atendimento' },
    { id: 'repositora', rotulo: 'Repositora', titulo: 'Repositora', foco: 'loja' },
    { id: 'balcao', rotulo: 'Padaria, frios ou açougue', titulo: 'Atendente de Padaria e Frios', foco: 'alimentos' },
    { id: 'empacotadora', rotulo: 'Empacotadora', titulo: 'Empacotadora', foco: 'loja' },
    { id: 'estoque', rotulo: 'Estoque', titulo: 'Auxiliar de Estoque', foco: 'loja' },
    { id: 'vendedora', rotulo: 'Vendedora', titulo: 'Vendedora', foco: 'atendimento' },
    { id: 'limpeza', rotulo: 'Limpeza', titulo: 'Auxiliar de Limpeza', foco: 'limpeza' },
    { id: 'cozinha', rotulo: 'Cozinha', titulo: 'Auxiliar de Cozinha', foco: 'alimentos' },
    { id: 'recepcao', rotulo: 'Recepção', titulo: 'Recepcionista', foco: 'atendimento' },
    { id: 'administrativo', rotulo: 'Escritório', titulo: 'Auxiliar Administrativa', foco: 'administrativo' },
    { id: 'cuidadora', rotulo: 'Cuidadora de idosos', titulo: 'Cuidadora de Idosos', foco: 'cuidado' },
    { id: 'baba', rotulo: 'Babá', titulo: 'Babá', foco: 'cuidado' },
    { id: 'beleza', rotulo: 'Beleza (unhas, cabelo)', titulo: 'Profissional de Beleza', foco: 'beleza' },
    { id: 'costura', rotulo: 'Costura', titulo: 'Costureira', foco: 'costura' },
    { id: 'outra', rotulo: 'Outra', titulo: '', foco: 'geral' }
  ];

  // Final da frase do objetivo, conforme a primeira vaga escolhida.
  var FOCOS = {
    atendimento: 'oferecendo atendimento cordial, agilidade e atenção aos detalhes',
    loja: 'contribuindo com organização, agilidade e cuidado com os produtos',
    alimentos: 'com cuidado na higiene, agilidade e bom atendimento',
    limpeza: 'com capricho, organização e responsabilidade',
    administrativo: 'contribuindo com organização, atenção aos detalhes e bom atendimento',
    cuidado: 'com paciência, responsabilidade e atenção às pessoas',
    beleza: 'com capricho, cuidado com a higiene e atenção às clientes',
    costura: 'com capricho, atenção aos detalhes e cumprimento de prazos',
    geral: 'com dedicação, responsabilidade e vontade de aprender'
  };

  var OBJETIVO_SEM_VAGA =
    'Conquistar uma oportunidade de trabalho para contribuir com dedicação, responsabilidade e vontade de aprender.';

  // Horários que a pessoa pode marcar.
  var TURNOS = [
    { id: 'manha', rotulo: 'Manhã', cv: 'manhã' },
    { id: 'tarde', rotulo: 'Tarde', cv: 'tarde' },
    { id: 'noite', rotulo: 'Noite', cv: 'noite' },
    { id: 'fds', rotulo: 'Fins de semana', cv: 'fins de semana' },
    { id: 'feriados', rotulo: 'Feriados', cv: 'feriados' },
    { id: 'escala', rotulo: 'Escala (6x1, 12x36)', cv: 'escala (6x1, 12x36)' }
  ];

  // Funções que a pessoa já fez. Cada uma traz:
  //  cargo       -> nome da função no currículo (a pessoa pode mudar)
  //  localPadrao -> o que aparece se ela não disser onde trabalhou
  //  dominio     -> expressão usada no resumo ("com experiência em ...")
  //  atividades  -> frases prontas que ela marca e viram tópicos
  var GRUPOS_EXPERIENCIA = [
    'Comércio e supermercado',
    'Por conta própria',
    'Limpeza e cozinha',
    'Cuidados',
    'Escritório e atendimento',
    'Outras'
  ];

  var EXPERIENCIAS = [
    {
      id: 'caixa', grupo: 'Comércio e supermercado', rotulo: 'Operadora de caixa',
      cargo: 'Operadora de Caixa', localPadrao: '', dominio: 'operação de caixa',
      atividades: [
        'Atendimento ao cliente e registro de compras no caixa',
        'Recebimento em dinheiro, cartão e Pix, com conferência de troco',
        'Abertura, sangria e fechamento de caixa',
        'Orientação sobre promoções, trocas e formas de pagamento'
      ]
    },
    {
      id: 'repositora', grupo: 'Comércio e supermercado', rotulo: 'Repositora ou auxiliar de loja',
      cargo: 'Repositora', localPadrao: '', dominio: 'reposição de mercadorias',
      atividades: [
        'Reposição e organização de produtos nas gôndolas',
        'Conferência de validade e troca de etiquetas de preço',
        'Recebimento e conferência de mercadorias',
        'Atendimento e orientação a clientes na loja'
      ]
    },
    {
      id: 'balcao', grupo: 'Comércio e supermercado', rotulo: 'Padaria, frios, açougue ou lanchonete',
      cargo: 'Atendente de Balcão', localPadrao: '', dominio: 'atendimento em balcão de alimentos',
      atividades: [
        'Atendimento ao público no balcão',
        'Fatiamento, pesagem e embalagem de produtos',
        'Preparo de lanches, café e produtos de padaria',
        'Limpeza e organização do setor, seguindo as normas de higiene'
      ]
    },
    {
      id: 'estoque', grupo: 'Comércio e supermercado', rotulo: 'Estoque ou almoxarifado',
      cargo: 'Auxiliar de Estoque', localPadrao: '', dominio: 'controle de estoque',
      atividades: [
        'Recebimento, conferência e armazenamento de mercadorias',
        'Controle de entrada e saída de produtos',
        'Organização do estoque por data de validade',
        'Separação de pedidos'
      ]
    },
    {
      id: 'vendedora', grupo: 'Comércio e supermercado', rotulo: 'Vendedora em loja',
      cargo: 'Vendedora', localPadrao: '', dominio: 'vendas no varejo',
      atividades: [
        'Atendimento e venda de produtos ao cliente',
        'Organização de vitrine e exposição de produtos',
        'Controle e reposição do estoque da loja',
        'Pós-venda e contato com clientes pelo WhatsApp'
      ]
    },
    {
      id: 'revendedora', grupo: 'Por conta própria', rotulo: 'Revenda por catálogo ou vendas',
      cargo: 'Revendedora', localPadrao: 'Autônoma', dominio: 'vendas diretas',
      atividades: [
        'Venda direta de produtos (cosméticos, roupas, utilidades)',
        'Formação e manutenção de carteira de clientes própria',
        'Controle de pedidos, pagamentos e entregas',
        'Divulgação de produtos pelo WhatsApp e redes sociais'
      ]
    },
    {
      id: 'encomendas', grupo: 'Por conta própria', rotulo: 'Salgados, doces ou marmitas por encomenda',
      cargo: 'Cozinheira', localPadrao: 'Autônoma', dominio: 'produção de alimentos',
      atividades: [
        'Preparo de salgados, doces ou marmitas por encomenda',
        'Produção em quantidade para festas e eventos',
        'Controle de ingredientes, compras e custos',
        'Venda e entrega para clientes, com divulgação pelo WhatsApp'
      ]
    },
    {
      id: 'diarista', grupo: 'Por conta própria', rotulo: 'Diarista ou faxina',
      cargo: 'Diarista', localPadrao: 'Autônoma', dominio: 'limpeza residencial',
      atividades: [
        'Limpeza e organização de residências',
        'Lavar, passar e organizar roupas',
        'Atendimento a clientes fixos, com pontualidade e confiança',
        'Uso correto e seguro de produtos de limpeza'
      ]
    },
    {
      id: 'beleza', grupo: 'Por conta própria', rotulo: 'Unhas, cabelo ou estética',
      cargo: 'Manicure', localPadrao: 'Autônoma', dominio: 'serviços de beleza',
      atividades: [
        'Atendimento com hora marcada e fidelização de clientes',
        'Execução de serviços de beleza com capricho e bom acabamento',
        'Higienização e esterilização de materiais',
        'Divulgação dos serviços pelas redes sociais'
      ]
    },
    {
      id: 'costura', grupo: 'Por conta própria', rotulo: 'Costura',
      cargo: 'Costureira', localPadrao: 'Autônoma', dominio: 'costura',
      atividades: [
        'Ajustes, consertos e reformas de roupas',
        'Confecção de peças sob encomenda',
        'Operação de máquina reta, overloque e galoneira',
        'Cumprimento de prazos de entrega'
      ]
    },
    {
      id: 'limpeza', grupo: 'Limpeza e cozinha', rotulo: 'Limpeza em empresa ou condomínio',
      cargo: 'Auxiliar de Limpeza', localPadrao: '', dominio: 'limpeza e conservação',
      atividades: [
        'Limpeza e conservação de salas, banheiros e áreas comuns',
        'Uso correto e seguro de produtos de limpeza',
        'Coleta e separação de lixo e recicláveis',
        'Reposição de materiais de higiene'
      ]
    },
    {
      id: 'cozinha', grupo: 'Limpeza e cozinha', rotulo: 'Cozinha de restaurante ou refeitório',
      cargo: 'Auxiliar de Cozinha', localPadrao: '', dominio: 'cozinha profissional',
      atividades: [
        'Pré-preparo e preparo de refeições',
        'Higiene e boas práticas na manipulação de alimentos',
        'Organização e limpeza da cozinha e dos utensílios',
        'Montagem de pratos e porcionamento'
      ]
    },
    {
      id: 'cuidadora', grupo: 'Cuidados', rotulo: 'Cuidar de pessoa idosa',
      cargo: 'Cuidadora de Idosos', localPadrao: '', dominio: 'cuidado de pessoas idosas',
      atividades: [
        'Acompanhamento e cuidados diários de pessoa idosa',
        'Apoio na higiene, alimentação e locomoção',
        'Controle dos horários de medicamentos',
        'Acompanhamento em consultas e atividades'
      ]
    },
    {
      id: 'baba', grupo: 'Cuidados', rotulo: 'Cuidar de crianças (babá)',
      cargo: 'Babá', localPadrao: '', dominio: 'cuidado de crianças',
      atividades: [
        'Cuidados com crianças: alimentação, higiene e rotina',
        'Acompanhamento de tarefas escolares e brincadeiras educativas',
        'Levar e buscar na escola e em atividades',
        'Organização do quarto e dos pertences das crianças'
      ]
    },
    {
      id: 'recepcao', grupo: 'Escritório e atendimento', rotulo: 'Recepção ou atendimento ao público',
      cargo: 'Recepcionista', localPadrao: '', dominio: 'atendimento ao público',
      atividades: [
        'Recepção de clientes, presencial e por telefone',
        'Agendamentos e organização da agenda',
        'Cadastro de clientes e controle de documentos',
        'Resolução de dúvidas e encaminhamento de pedidos'
      ]
    },
    {
      id: 'administrativo', grupo: 'Escritório e atendimento', rotulo: 'Escritório ou administrativo',
      cargo: 'Auxiliar Administrativa', localPadrao: '', dominio: 'rotinas administrativas',
      atividades: [
        'Arquivo e organização de documentos',
        'Lançamento de informações em planilhas e sistemas',
        'Apoio em contas a pagar e a receber',
        'Atendimento por telefone e e-mail'
      ]
    },
    {
      id: 'voluntario', grupo: 'Outras', rotulo: 'Trabalho voluntário (igreja, escola, associação)',
      cargo: 'Voluntária', localPadrao: '', dominio: 'trabalho voluntário',
      atividades: [
        'Organização de eventos, bazares e campanhas',
        'Arrecadação e distribuição de doações',
        'Acolhimento e atendimento de pessoas',
        'Trabalho em equipe com outros voluntários'
      ]
    },
    {
      id: 'outra', grupo: 'Outras', rotulo: 'Outra atividade',
      cargo: '', localPadrao: '', dominio: '',
      atividades: []
    }
  ];

  var ESCOLARIDADE = [
    { id: 'fund_inc', rotulo: 'Ensino Fundamental incompleto' },
    { id: 'fund_com', rotulo: 'Ensino Fundamental completo' },
    { id: 'medio_inc', rotulo: 'Ensino Médio incompleto' },
    { id: 'medio_and', rotulo: 'Ensino Médio em andamento' },
    { id: 'medio_com', rotulo: 'Ensino Médio completo' },
    { id: 'tec_and', rotulo: 'Curso Técnico em andamento', curso: 'Técnico em', situacao: 'em andamento' },
    { id: 'tec_com', rotulo: 'Curso Técnico completo', curso: 'Técnico em', situacao: 'completo' },
    { id: 'sup_inc', rotulo: 'Faculdade incompleta', curso: 'Graduação em', situacao: 'incompleta' },
    { id: 'sup_and', rotulo: 'Faculdade em andamento', curso: 'Graduação em', situacao: 'em andamento' },
    { id: 'sup_com', rotulo: 'Faculdade completa', curso: 'Graduação em', situacao: 'completa' }
  ];

  // Cursos sugeridos (um toque adiciona o curso à lista).
  var CURSOS_SUGERIDOS = [
    'Informática básica',
    'Atendimento ao cliente',
    'Operadora de caixa',
    'Manipulação de alimentos',
    'Cuidadora de idosos',
    'Empreendedorismo'
  ];

  // Pontos fortes (até 5).
  //  adj   -> entra na primeira frase do resumo ("Profissional pontual, ...")
  //  frase -> entra na segunda frase ("Aprende rápido e ...")
  var FORCAS = [
    { id: 'pontual', rotulo: 'Pontual', adj: 'pontual' },
    { id: 'responsavel', rotulo: 'Responsável', adj: 'responsável' },
    { id: 'organizada', rotulo: 'Organizada', adj: 'organizada' },
    { id: 'comunicativa', rotulo: 'Comunicativa', adj: 'comunicativa' },
    { id: 'paciente', rotulo: 'Paciente', adj: 'paciente' },
    { id: 'agil', rotulo: 'Ágil', adj: 'ágil' },
    { id: 'dedicada', rotulo: 'Dedicada', adj: 'dedicada' },
    { id: 'proativa', rotulo: 'Tomo iniciativa', adj: 'proativa' },
    { id: 'honesta', rotulo: 'Honesta', adj: 'honesta' },
    { id: 'calma', rotulo: 'Calma sob pressão', adj: 'calma sob pressão' },
    { id: 'aprende', rotulo: 'Aprendo rápido', frase: 'aprende rápido' },
    { id: 'equipe', rotulo: 'Gosto de trabalhar em equipe', frase: 'gosta de trabalhar em equipe' },
    { id: 'numeros', rotulo: 'Boa com números e contas', frase: 'tem facilidade com números e contas' }
  ];

  // Habilidades práticas (sem limite). "cv" é como aparece no currículo.
  var FERRAMENTAS = [
    { id: 'pix', rotulo: 'Maquininha de cartão e Pix', cv: 'Recebimento com maquininha de cartão e Pix' },
    { id: 'troco', rotulo: 'Contar dinheiro e dar troco', cv: 'Manuseio de dinheiro e troco' },
    { id: 'whatsapp', rotulo: 'WhatsApp e redes sociais', cv: 'Atendimento por WhatsApp e redes sociais' },
    { id: 'informatica', rotulo: 'Computador (Word, Excel, internet)', cv: 'Informática básica (Word, Excel e internet)' },
    { id: 'balanca', rotulo: 'Balança e fatiador', cv: 'Operação de balança e fatiador' },
    { id: 'higiene', rotulo: 'Higiene com alimentos', cv: 'Boas práticas de higiene com alimentos' },
    { id: 'limpeza', rotulo: 'Produtos de limpeza', cv: 'Uso seguro de produtos de limpeza' },
    { id: 'socorros', rotulo: 'Primeiros socorros', cv: 'Noções de primeiros socorros' }
  ];

  var CNH = [
    { id: '', rotulo: 'Não tenho' },
    { id: 'A', rotulo: 'Moto (A)' },
    { id: 'B', rotulo: 'Carro (B)' },
    { id: 'AB', rotulo: 'Moto e carro (AB)' }
  ];

  var UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
    'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // Exemplo com dados inventados, para mostrar o resultado antes de começar.
  var EXEMPLO = {
    nome: 'Joana Pereira', telefone: '21987654321', email: 'joana.trabalho@exemplo.com',
    cidade: 'Rio de Janeiro', bairro: 'Campo Grande', uf: 'RJ',
    areas: ['caixa', 'repositora'], areaOutra: '',
    imediato: true, turnos: ['manha', 'tarde', 'fds'],
    temExperiencia: true,
    experiencias: [
      { tipo: 'revendedora', cargo: 'Revendedora', local: '', inicio: '2019', fim: 'atual',
        atividades: [0, 1, 3], extra: '' },
      { tipo: 'caixa', cargo: 'Operadora de Caixa', local: 'Mercado Bom Preço', inicio: '2014', fim: '2017',
        atividades: [0, 1, 2], extra: '' }
    ],
    escolaridade: 'medio_com', cursoFormal: '', instituicaoFormal: '',
    cursos: [
      { nome: 'Informática básica', local: 'Faetec', ano: '2024' },
      { nome: 'Atendimento ao cliente', local: 'Curso on-line', ano: '2025' }
    ],
    forcas: ['pontual', 'responsavel', 'comunicativa', 'aprende', 'equipe'],
    ferramentas: ['pix', 'troco', 'whatsapp', 'informatica'], outraHabilidade: '', cnh: ''
  };

  function porId(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  return {
    AREAS: AREAS, FOCOS: FOCOS, OBJETIVO_SEM_VAGA: OBJETIVO_SEM_VAGA, TURNOS: TURNOS,
    GRUPOS_EXPERIENCIA: GRUPOS_EXPERIENCIA, EXPERIENCIAS: EXPERIENCIAS, ESCOLARIDADE: ESCOLARIDADE,
    CURSOS_SUGERIDOS: CURSOS_SUGERIDOS, FORCAS: FORCAS, FERRAMENTAS: FERRAMENTAS, CNH: CNH, UFS: UFS,
    EXEMPLO: EXEMPLO, porId: porId,
    LIMITE_AREAS: 3, LIMITE_FORCAS: 5, LIMITE_EXPERIENCIAS: 4, LIMITE_CURSOS: 5
  };
})();
