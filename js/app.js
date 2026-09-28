/*
 * Próximo Passo — telas e navegação
 * ------------------------------------------------------------
 * Tudo o que a pessoa escreve fica só na memória desta página (variável
 * "estado"). Não há cookies, localStorage, banco de dados nem envio pela
 * internet. Ao fechar ou recarregar a página, tudo some.
 */
(function () {
  'use strict';
  var C = window.PP_CONFIG;
  var Q = window.PP_PERGUNTAS;
  var CV = window.PP_CURRICULO;
  var PDF = window.PP_PDF;

  var NOMES_PASSOS = ['Seus dados', 'Trabalho que você procura', 'Sua experiência', 'Seus estudos',
    'Seus pontos fortes', 'Seu currículo'];
  var TOTAL_PASSOS = 6;

  function estadoVazio() {
    return {
      nome: '', telefone: '', email: '', cidade: '', bairro: '', uf: 'RJ',
      areas: [], areaOutra: '', imediato: true, turnos: [],
      temExperiencia: null, experiencias: [],
      escolaridade: '', cursoFormal: '', instituicaoFormal: '', cursos: [],
      forcas: [], ferramentas: [], outraHabilidade: '', cnh: '',
      objetivoEditado: null, resumoEditado: null, exemplo: false
    };
  }

  function estadoExemplo() {
    var e = estadoVazio();
    var ex = JSON.parse(JSON.stringify(Q.EXEMPLO));
    Object.keys(ex).forEach(function (k) { e[k] = ex[k]; });
    e.exemplo = true;
    return e;
  }

  function novaExperiencia() {
    return { tipo: '', cargo: '', local: '', inicio: '', fim: '', atividades: [], extra: '' };
  }

  var estado = estadoVazio();
  var passo = 0;

  // ---------- Utilidades ----------
  function $(id) { return document.getElementById(id); }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function obter(caminho) {
    return caminho.split('.').reduce(function (alvo, parte) { return alvo == null ? alvo : alvo[parte]; }, estado);
  }

  function definir(caminho, valor) {
    var partes = caminho.split('.');
    var alvo = estado;
    for (var i = 0; i < partes.length - 1; i++) alvo = alvo[partes[i]];
    alvo[partes[partes.length - 1]] = valor;
  }

  function anos() {
    var lista = [];
    for (var a = CV.ANO_ATUAL; a >= CV.ANO_ATUAL - 45; a--) lista.push(String(a));
    return lista;
  }

  var temporizadorAviso = null;
  function aviso(msg) {
    var el = $('aviso');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { el.hidden = true; }, 5000);
  }

  // ---------- Peças de formulário ----------
  function campoTexto(o) {
    var desc = [];
    if (o.dica) desc.push(o.id + '-dica');
    desc.push(o.id + '-erro');
    var atributos = [
      'id="' + o.id + '"',
      'data-campo="' + o.campo + '"',
      'autocomplete="off"',
      'aria-describedby="' + desc.join(' ') + '"'
    ];
    if (o.inputmode) atributos.push('inputmode="' + o.inputmode + '"');
    if (o.capitalizar) atributos.push('autocapitalize="' + o.capitalizar + '"');
    if (o.semCorretor) atributos.push('spellcheck="false" autocorrect="off"');
    if (o.placeholder) atributos.push('placeholder="' + esc(o.placeholder) + '"');
    if (o.max) atributos.push('maxlength="' + o.max + '"');
    if (o.extraAtributos) atributos.push(o.extraAtributos);

    var controle = o.multilinha
      ? '<textarea ' + atributos.join(' ') + ' rows="3">' + esc(o.valor) + '</textarea>'
      : '<input type="' + (o.tipo || 'text') + '" ' + atributos.join(' ') + ' value="' + esc(o.valor) + '">';

    return '<div class="campo">' +
      '<label for="' + o.id + '">' + esc(o.rotulo) +
      (o.opcional ? ' <span class="opcional">(opcional)</span>' : '') + '</label>' +
      (o.dica ? '<p class="dica" id="' + o.id + '-dica">' + esc(o.dica) + '</p>' : '') +
      controle +
      '<p class="erro" id="' + o.id + '-erro" hidden></p>' +
      '</div>';
  }

  function campoSelecao(o) {
    var html = '<div class="campo">' +
      '<label for="' + o.id + '">' + esc(o.rotulo) +
      (o.opcional ? ' <span class="opcional">(opcional)</span>' : '') + '</label>' +
      (o.dica ? '<p class="dica" id="' + o.id + '-dica">' + esc(o.dica) + '</p>' : '') +
      '<select id="' + o.id + '" data-campo="' + o.campo + '"' + (o.reconstruir ? ' data-reconstruir' : '') +
      ' aria-describedby="' + (o.dica ? o.id + '-dica ' : '') + o.id + '-erro">';
    html += o.opcoesHtml;
    html += '</select><p class="erro" id="' + o.id + '-erro" hidden></p></div>';
    return html;
  }

  function opcoes(lista, valorAtual, vazio) {
    var html = vazio != null ? '<option value="">' + esc(vazio) + '</option>' : '';
    lista.forEach(function (o) {
      var v = typeof o === 'string' ? o : o.valor;
      var r = typeof o === 'string' ? o : o.rotulo;
      html += '<option value="' + esc(v) + '"' + (String(valorAtual) === String(v) ? ' selected' : '') + '>' + esc(r) + '</option>';
    });
    return html;
  }

  // Grupo de botões de escolha. multiplo=true permite marcar vários.
  function chips(o) {
    var html = '<div class="chips" role="group" aria-labelledby="' + o.rotuloId + '">';
    o.itens.forEach(function (item) {
      var marcado = o.multiplo ? (obter(o.lista) || []).indexOf(item.id) >= 0 : obter(o.campo) === item.valor;
      var dados = o.multiplo
        ? 'data-acao="alternar" data-lista="' + o.lista + '" data-valor="' + esc(item.id) + '"' + (o.max ? ' data-max="' + o.max + '"' : '')
        : 'data-acao="escolher" data-campo="' + o.campo + '" data-valor="' + esc(String(item.valor)) + '"' + (o.reconstruir ? ' data-reconstruir' : '');
      html += '<button type="button" class="chip" id="' + o.prefixo + '-' + esc(item.id) + '" ' + dados +
        ' aria-pressed="' + (marcado ? 'true' : 'false') + '">' + esc(item.rotulo) + '</button>';
    });
    return html + '</div>';
  }

  function cabecalho(titulo, lead) {
    return '<div class="cabecalho-passo"><h1 tabindex="-1" id="titulo-tela">' + titulo + '</h1>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '') + '</div>';
  }

  // ---------- Telas ----------
  function telaBoasVindas() {
    var itensPrivacidade = [
      'Este site não tem cadastro, senha, banco de dados, cookies nem rastreamento.',
      'O currículo e o PDF são montados dentro do seu aparelho, sem passar por nenhum servidor.',
      'Como em qualquer site, o endereço desta página pode ficar no histórico do navegador. Se outra pessoa mexe no seu celular, abra o site numa aba anônima (no Chrome: menu ⋮ e depois "Nova guia anônima").',
      'Depois de enviar o currículo, você pode apagar o PDF da pasta Downloads.',
      'Coloque um telefone e um e-mail que só você usa. Se precisar, crie um e-mail novo só para procurar emprego.'
    ];
    if (C.mostrarLigue180) {
      itensPrivacidade.push('Se precisar de apoio, a Central de Atendimento à Mulher atende pelo telefone 180, de graça, 24 horas por dia.');
    }
    return '<section class="boas-vindas">' +
      '<p class="sobretitulo">Currículo gratuito</p>' +
      '<h1 tabindex="-1" id="titulo-tela">Seu currículo pronto em <mark>poucos minutos</mark></h1>' +
      '<p class="lead">Responda perguntas simples. No final, você baixa um currículo em PDF, organizado do jeito que as empresas gostam de ler.</p>' +
      '<ul class="garantias">' +
      '<li><strong>Fica só com você.</strong> Nada do que você escreve é enviado pela internet.</li>' +
      '<li><strong>Nada fica guardado.</strong> Ao fechar a página, tudo é apagado.</li>' +
      '<li><strong>Saída rápida.</strong> O botão "Sair rápido", no alto da tela, apaga tudo e abre o Google.</li>' +
      '</ul>' +
      '<div class="acoes">' +
      '<button type="button" class="botao botao-primario botao-grande" data-acao="comecar">Começar</button>' +
      '<button type="button" class="botao botao-secundario" data-acao="ver-exemplo">Ver um currículo de exemplo</button>' +
      '</div>' +
      '<p class="nota">Leva cerca de 10 minutos. Você não precisa de CPF, foto nem endereço completo.</p>' +
      '<details class="privacidade"><summary>Como este site protege você</summary><ul>' +
      itensPrivacidade.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
      '</ul></details>' +
      '</section>';
  }

  function telaDados() {
    return cabecalho('Seus dados', 'Só o essencial para a empresa falar com você.') +
      '<div class="bloco">' +
      campoTexto({ id: 'nome', campo: 'nome', rotulo: 'Nome completo', valor: estado.nome, capitalizar: 'words',
        dica: 'Do jeito que você quer que apareça no currículo.', max: 80 }) +
      campoTexto({ id: 'telefone', campo: 'telefone', rotulo: 'Telefone ou WhatsApp com DDD', valor: estado.telefone,
        tipo: 'tel', inputmode: 'tel', dica: 'Use um número que só você atende.', placeholder: '(21) 98765-4321', max: 20 }) +
      campoTexto({ id: 'email', campo: 'email', rotulo: 'E-mail', valor: estado.email, tipo: 'email', inputmode: 'email',
        opcional: true, semCorretor: true, capitalizar: 'none', max: 80,
        dica: 'Se precisar, crie um e-mail novo só para procurar emprego.' }) +
      '<div class="linha-campos cidade">' +
      campoTexto({ id: 'cidade', campo: 'cidade', rotulo: 'Cidade', valor: estado.cidade, capitalizar: 'words', max: 60 }) +
      campoSelecao({ id: 'uf', campo: 'uf', rotulo: 'Estado', opcoesHtml: opcoes(Q.UFS, estado.uf) }) +
      '</div>' +
      campoTexto({ id: 'bairro', campo: 'bairro', rotulo: 'Bairro', valor: estado.bairro, opcional: true, capitalizar: 'words',
        max: 60, dica: 'Muitas empresas preferem quem mora perto. Não coloque rua nem número.' }) +
      '</div>' +
      '<p class="lembrete">Não coloque CPF, RG, idade, estado civil, endereço completo nem foto. A empresa não precisa disso para chamar você para uma entrevista.</p>';
  }

  function telaVaga() {
    var temOutra = estado.areas.indexOf('outra') >= 0;
    return cabecalho('Que trabalho você procura?', 'Escolha até 3 opções. Pode misturar áreas diferentes.') +
      '<div class="bloco">' +
      '<p class="so-leitor" id="rotulo-areas">Vagas</p>' +
      chips({ multiplo: true, lista: 'areas', max: Q.LIMITE_AREAS, rotuloId: 'rotulo-areas', prefixo: 'area',
        itens: Q.AREAS.map(function (a) { return { id: a.id, rotulo: a.rotulo }; }) }) +
      '<div id="bloco-outra"' + (temOutra ? '' : ' hidden') + '>' +
      campoTexto({ id: 'vaga-outra', campo: 'areaOutra', rotulo: 'Qual outra vaga?', valor: estado.areaOutra,
        placeholder: 'Ex.: Auxiliar de farmácia', max: 60 }) +
      '</div></div>' +
      '<div class="bloco">' +
      '<h2 id="rotulo-inicio">Quando você pode começar?</h2>' +
      chips({ multiplo: false, campo: 'imediato', rotuloId: 'rotulo-inicio', prefixo: 'inicio',
        itens: [{ id: 'sim', valor: true, rotulo: 'Agora mesmo' }, { id: 'nao', valor: false, rotulo: 'Daqui a um tempo' }] }) +
      '</div>' +
      '<div class="bloco">' +
      '<h2 id="rotulo-turnos">Em quais horários você pode trabalhar? <span class="opcional">(opcional)</span></h2>' +
      chips({ multiplo: true, lista: 'turnos', rotuloId: 'rotulo-turnos', prefixo: 'turno', itens: Q.TURNOS }) +
      '</div>';
  }

  function opcoesExperiencia(valorAtual) {
    var html = '<option value="">Escolha uma opção</option>';
    Q.GRUPOS_EXPERIENCIA.forEach(function (g) {
      html += '<optgroup label="' + esc(g) + '">';
      Q.EXPERIENCIAS.filter(function (x) { return x.grupo === g; }).forEach(function (x) {
        html += '<option value="' + x.id + '"' + (valorAtual === x.id ? ' selected' : '') + '>' + esc(x.rotulo) + '</option>';
      });
      html += '</optgroup>';
    });
    return html;
  }

  function cartaoExperiencia(x, i) {
    var p = 'exp-' + i;
    var t = Q.porId(Q.EXPERIENCIAS, x.tipo);
    var html = '<fieldset class="cartao" id="' + p + '"><legend>Trabalho ' + (i + 1) + '</legend>' +
      campoSelecao({ id: p + '-tipo', campo: 'experiencias.' + i + '.tipo', rotulo: 'O que você fazia?',
        reconstruir: true, opcoesHtml: opcoesExperiencia(x.tipo) });

    if (t) {
      var ehOutra = t.id === 'outra';
      html += campoTexto({ id: p + '-cargo', campo: 'experiencias.' + i + '.cargo',
        rotulo: ehOutra ? 'Nome da função' : 'Nome da função no currículo', valor: x.cargo, capitalizar: 'words',
        dica: ehOutra ? 'Ex.: Feirante, Ajudante de pedreiro, Promotora de vendas' : 'Já deixamos uma sugestão. Pode mudar, se quiser.',
        max: 60, extraAtributos: 'data-atualiza-cv' });
      html += campoTexto({ id: p + '-local', campo: 'experiencias.' + i + '.local', rotulo: 'Onde?', valor: x.local,
        opcional: true, capitalizar: 'words', max: 70,
        placeholder: t.localPadrao ? 'Em branco = "Autônoma"' : 'Nome da empresa, loja ou "Casa de família"',
        dica: t.localPadrao ? 'Se era por conta própria, pode deixar em branco.' : null });
      var listaAnos = anos();
      html += '<div class="linha-campos">' +
        campoSelecao({ id: p + '-inicio', campo: 'experiencias.' + i + '.inicio', rotulo: 'Começou em', opcional: false,
          opcoesHtml: opcoes(listaAnos, x.inicio, 'Ano') }) +
        campoSelecao({ id: p + '-fim', campo: 'experiencias.' + i + '.fim', rotulo: 'Saiu em',
          opcoesHtml: opcoes([{ valor: 'atual', rotulo: 'Ainda faço' }].concat(listaAnos), x.fim, 'Ano') }) +
        '</div>' +
        '<p class="dica">Não lembra o ano certo? Coloque o mais perto que lembrar. O currículo mostra só os anos.</p>';

      if (t.atividades.length) {
        html += '<fieldset class="atividades"><legend>Marque o que você fazia</legend>';
        t.atividades.forEach(function (a, k) {
          var marcado = (x.atividades || []).indexOf(k) >= 0;
          html += '<label class="opcao"><input type="checkbox" data-lista-campo="experiencias.' + i + '.atividades" value="' + k + '"' +
            (marcado ? ' checked' : '') + '><span>' + esc(a) + '</span></label>';
        });
        html += '</fieldset>';
      }
      html += campoTexto({ id: p + '-extra', campo: 'experiencias.' + i + '.extra', multilinha: true,
        rotulo: ehOutra ? 'O que você fazia nesse trabalho?' : 'Quer contar mais alguma coisa?', opcional: !ehOutra,
        valor: x.extra, dica: 'Escreva uma coisa por linha. Cada linha vira um item do currículo.', max: 400 });
    }
    html += '<button type="button" class="botao botao-texto" data-acao="remover-exp" data-i="' + i + '">Remover este trabalho</button>';
    return html + '</fieldset>';
  }

  function telaExperiencia() {
    var html = cabecalho('Sua experiência', 'Você já fez algum trabalho, mesmo sem carteira assinada?') +
      '<p class="dica">Tudo conta: bico, faxina, vender produtos, cozinhar para fora, cuidar de crianças ou de idosos, ajudar na igreja ou na comunidade.</p>' +
      '<div class="bloco"><p class="so-leitor" id="rotulo-tem-exp">Já trabalhou?</p>' +
      chips({ multiplo: false, campo: 'temExperiencia', rotuloId: 'rotulo-tem-exp', prefixo: 'tem-exp', reconstruir: true,
        itens: [{ id: 'sim', valor: true, rotulo: 'Sim, já trabalhei' }, { id: 'nao', valor: false, rotulo: 'Ainda não' }] }) +
      '</div>';

    if (estado.temExperiencia === true) {
      html += '<div class="lista-cartoes">' + estado.experiencias.map(cartaoExperiencia).join('') + '</div>';
      if (estado.experiencias.length < Q.LIMITE_EXPERIENCIAS) {
        html += '<button type="button" class="botao botao-secundario" data-acao="adicionar-exp">+ Adicionar outro trabalho</button>';
      }
      html += '<p class="dica">Comece pelo mais recente. Até ' + Q.LIMITE_EXPERIENCIAS + ' trabalhos deixam o currículo em uma página.</p>';
    } else if (estado.temExperiencia === false) {
      html += '<p class="lembrete">Tudo bem. Seu currículo vai destacar seus estudos, cursos e pontos fortes. Se lembrar de algum bico ou trabalho voluntário, toque em "Sim, já trabalhei".</p>';
    }
    return html;
  }

  function cartaoCurso(c, i) {
    var p = 'curso-' + i;
    return '<fieldset class="cartao"><legend>Curso ' + (i + 1) + '</legend>' +
      campoTexto({ id: p + '-nome', campo: 'cursos.' + i + '.nome', rotulo: 'Nome do curso', valor: c.nome, max: 70 }) +
      '<div class="linha-campos">' +
      campoTexto({ id: p + '-local', campo: 'cursos.' + i + '.local', rotulo: 'Onde', opcional: true, valor: c.local,
        placeholder: 'Ex.: Senac', max: 50 }) +
      campoSelecao({ id: p + '-ano', campo: 'cursos.' + i + '.ano', rotulo: 'Ano', opcional: true,
        opcoesHtml: opcoes(anos(), c.ano, 'Ano') }) +
      '</div>' +
      '<button type="button" class="botao botao-texto" data-acao="remover-curso" data-i="' + i + '">Remover este curso</button>' +
      '</fieldset>';
  }

  function telaEstudos() {
    var nivel = Q.porId(Q.ESCOLARIDADE, estado.escolaridade);
    var html = cabecalho('Seus estudos', 'EJA e supletivo também contam.') +
      '<div class="bloco">' +
      campoSelecao({ id: 'escolaridade', campo: 'escolaridade', rotulo: 'Até onde você estudou?', reconstruir: true,
        opcoesHtml: opcoes(Q.ESCOLARIDADE.map(function (e) { return { valor: e.id, rotulo: e.rotulo }; }),
          estado.escolaridade, 'Escolha uma opção') });
    if (nivel && nivel.curso) {
      html += campoTexto({ id: 'curso-formal', campo: 'cursoFormal', rotulo: 'Qual curso?', valor: estado.cursoFormal,
        placeholder: 'Ex.: Administração', max: 60, opcional: true }) +
        campoTexto({ id: 'instituicao-formal', campo: 'instituicaoFormal', rotulo: 'Onde?', valor: estado.instituicaoFormal,
          opcional: true, max: 60 });
    }
    html += '</div>';

    var jaTem = estado.cursos.map(function (c) { return c.nome; });
    var sugestoes = Q.CURSOS_SUGERIDOS.filter(function (s) { return jaTem.indexOf(s) < 0; });
    html += '<div class="bloco"><h2>Cursos que você fez <span class="opcional">(opcional)</span></h2>' +
      '<p class="dica">Cursos rápidos, on-line ou presenciais, com ou sem certificado. Toque numa sugestão ou adicione o seu.</p>';
    if (sugestoes.length && estado.cursos.length < Q.LIMITE_CURSOS) {
      html += '<div class="chips sugestoes">' + sugestoes.map(function (s) {
        return '<button type="button" class="chip" data-acao="adicionar-curso" data-nome="' + esc(s) + '">' + esc(s) + '</button>';
      }).join('') + '</div>';
    }
    html += '</div>';
    if (estado.cursos.length) {
      html += '<div class="lista-cartoes">' + estado.cursos.map(cartaoCurso).join('') + '</div>';
    }
    if (estado.cursos.length < Q.LIMITE_CURSOS) {
      html += '<button type="button" class="botao botao-secundario" data-acao="adicionar-curso" data-nome="">+ Adicionar outro curso</button>';
    }
    return html;
  }

  function telaForcas() {
    return cabecalho('Seus pontos fortes', 'Como as pessoas descreveriam você no trabalho? Escolha até 5.') +
      '<div class="bloco"><p class="so-leitor" id="rotulo-forcas">Pontos fortes</p>' +
      chips({ multiplo: true, lista: 'forcas', max: Q.LIMITE_FORCAS, rotuloId: 'rotulo-forcas', prefixo: 'forca', itens: Q.FORCAS }) +
      '</div>' +
      '<div class="bloco"><h2 id="rotulo-ferramentas">O que você sabe usar ou fazer?</h2>' +
      '<p class="dica">Marque quantas quiser.</p>' +
      chips({ multiplo: true, lista: 'ferramentas', rotuloId: 'rotulo-ferramentas', prefixo: 'ferr', itens: Q.FERRAMENTAS }) +
      campoTexto({ id: 'outra-habilidade', campo: 'outraHabilidade', rotulo: 'Outra habilidade', opcional: true,
        valor: estado.outraHabilidade, placeholder: 'Ex.: Falo espanhol', max: 80 }) +
      '</div>' +
      '<div class="bloco"><h2 id="rotulo-cnh">Carteira de motorista</h2>' +
      chips({ multiplo: false, campo: 'cnh', rotuloId: 'rotulo-cnh', prefixo: 'cnh',
        itens: Q.CNH.map(function (c) { return { id: c.id || 'nao', valor: c.id, rotulo: c.rotulo }; }) }) +
      '</div>';
  }

  function htmlCurriculo(cv) {
    var h = '<header class="cv-cabeca"><p class="cv-nome">' + esc(cv.nome) + '</p>' +
      '<p class="cv-contato">' + cv.contato.map(function (c) { return '<span class="cv-parte">' + esc(c) + '</span>'; }).join('<span class="cv-sep" aria-hidden="true">|</span>') + '</p></header>';
    cv.secoes.forEach(function (s) {
      h += '<section><h2 class="cv-titulo">' + esc(s.titulo) + '</h2>';
      if (s.tipo === 'paragrafo') {
        h += '<p>' + esc(s.texto) + '</p>';
      } else if (s.tipo === 'experiencias') {
        s.itens.forEach(function (x) {
          h += '<div class="cv-exp"><div class="cv-exp-linha"><strong>' + esc(x.cargo) + '</strong>' +
            (x.periodo ? '<span class="cv-periodo">' + esc(x.periodo) + '</span>' : '') + '</div>' +
            (x.local ? '<p class="cv-local">' + esc(x.local) + '</p>' : '') +
            (x.topicos.length ? '<ul class="cv-topicos">' + x.topicos.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
            '</div>';
        });
      } else {
        h += '<ul class="cv-topicos' + (s.colunas ? ' cv-colunas' : '') + '">' +
          s.itens.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
      }
      h += '</section>';
    });
    return h;
  }

  function podeCompartilhar() {
    if (C.modoPrevia) return false;
    try {
      return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'teste.pdf', { type: 'application/pdf' })] }));
    } catch (e) {
      return false;
    }
  }

  function telaCurriculo() {
    var cv = CV.montar(estado);
    var html = '';
    if (estado.exemplo) {
      html += '<div class="faixa-exemplo"><span>Exemplo com dados inventados.</span>' +
        '<button type="button" class="botao botao-primario" data-acao="comecar">Montar o meu</button></div>';
    }
    html += cabecalho(estado.exemplo ? 'Veja como fica' : 'Seu currículo está <mark>pronto</mark>',
      estado.exemplo ? 'O seu terá este formato, com as suas informações.'
        : 'Confira abaixo. Para mudar alguma resposta, toque em "Voltar".');
    html += '<div class="acoes-cv">' +
      '<button type="button" class="botao botao-primario botao-grande" data-acao="baixar-pdf">Baixar PDF</button>' +
      (podeCompartilhar() ? '<button type="button" class="botao botao-secundario" data-acao="compartilhar-pdf">Enviar PDF</button>' : '') +
      '<button type="button" class="botao botao-secundario" data-acao="copiar-texto">Copiar como texto</button>' +
      '</div>' +
      '<label class="so-leitor" for="texto-copia">Texto do currículo</label>' +
      '<textarea id="texto-copia" class="texto-copia" readonly hidden></textarea>';
    html += '<article class="folha" id="folha" aria-label="Prévia do currículo">' + htmlCurriculo(cv) + '</article>';

    html += '<details class="ajustes"><summary>Mudar o texto do objetivo ou do resumo</summary><div class="ajustes-conteudo">' +
      campoTexto({ id: 'objetivo', campo: 'objetivoEditado', rotulo: 'Objetivo', multilinha: true, max: 300,
        valor: estado.objetivoEditado != null ? estado.objetivoEditado : cv.objetivoSugerido, extraAtributos: 'data-atualiza-cv' }) +
      '<button type="button" class="botao botao-texto" data-acao="restaurar" data-campo="objetivoEditado" data-alvo="objetivo">Voltar ao texto sugerido</button>' +
      campoTexto({ id: 'resumo', campo: 'resumoEditado', rotulo: 'Resumo', multilinha: true, max: 600,
        valor: estado.resumoEditado != null ? estado.resumoEditado : cv.resumoSugerido, extraAtributos: 'data-atualiza-cv' }) +
      '<button type="button" class="botao botao-texto" data-acao="restaurar" data-campo="resumoEditado" data-alvo="resumo">Voltar ao texto sugerido</button>' +
      '</div></details>';

    html += '<div class="dicas-finais bloco"><h2>Antes de enviar</h2><ul>' +
      '<li>Confira se o telefone está certo.</li>' +
      '<li>Envie em PDF: é o formato que as empresas preferem.</li>' +
      '<li>Se outra pessoa mexe no seu celular, apague o PDF da pasta Downloads depois de enviar.</li>' +
      '</ul></div>';

    if (!estado.exemplo) {
      html += '<div class="bloco"><button type="button" class="botao botao-texto" data-acao="apagar">Apagar tudo e começar de novo</button>' +
        '<div class="confirmar" id="confirmar-apagar" hidden><p>Tudo o que você escreveu será apagado. Quer continuar?</p>' +
        '<div class="acoes-linha"><button type="button" class="botao botao-perigo" data-acao="apagar-sim">Sim, apagar tudo</button>' +
        '<button type="button" class="botao botao-secundario" data-acao="apagar-nao">Cancelar</button></div></div></div>';
    }
    return html;
  }

  var TELAS = [telaBoasVindas, telaDados, telaVaga, telaExperiencia, telaEstudos, telaForcas, telaCurriculo];

  // ---------- Validação ----------
  function mostrarErro(id, msg) {
    var campo = $(id);
    var erro = $(id + '-erro');
    if (erro) { erro.textContent = msg; erro.hidden = false; }
    if (campo) campo.setAttribute('aria-invalid', 'true');
  }

  function limparErro(campo) {
    if (!campo || !campo.id) return;
    var erro = $(campo.id + '-erro');
    if (erro && !erro.hidden) { erro.hidden = true; erro.textContent = ''; }
    campo.removeAttribute('aria-invalid');
  }

  function validar() {
    var erros = [];
    if (passo === 1) {
      if (estado.nome.trim().length < 3) erros.push(['nome', 'Escreva seu nome.']);
      if (estado.telefone.replace(/\D/g, '').length < 10) erros.push(['telefone', 'Escreva o telefone com DDD. Ex.: (21) 98765-4321']);
      if (estado.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estado.email.trim())) {
        erros.push(['email', 'Confira o e-mail. Ex.: nome@gmail.com']);
      }
      if (!estado.cidade.trim()) erros.push(['cidade', 'Escreva sua cidade.']);
    }
    if (passo === 2 && estado.areas.indexOf('outra') >= 0 && !estado.areaOutra.trim()) {
      erros.push(['vaga-outra', 'Escreva qual vaga você procura ou desmarque "Outra".']);
    }
    if (passo === 3 && estado.temExperiencia === true) {
      estado.experiencias.forEach(function (x, i) {
        if (!x.tipo) erros.push(['exp-' + i + '-tipo', 'Escolha uma opção ou remova este trabalho.']);
        else if (x.tipo === 'outra' && !x.cargo.trim()) erros.push(['exp-' + i + '-cargo', 'Escreva o nome da função.']);
      });
    }
    if (passo === 4) {
      if (!estado.escolaridade) erros.push(['escolaridade', 'Escolha até onde você estudou.']);
      estado.cursos.forEach(function (c, i) {
        if (!c.nome.trim()) erros.push(['curso-' + i + '-nome', 'Escreva o nome do curso ou remova este curso.']);
      });
    }
    erros.forEach(function (e) { mostrarErro(e[0], e[1]); });
    if (erros.length) {
      var primeiro = $(erros[0][0]);
      if (primeiro) primeiro.focus();
      aviso(erros.length === 1 ? 'Falta uma informação.' : 'Faltam ' + erros.length + ' informações.');
      return false;
    }
    return true;
  }

  // ---------- Desenho da tela ----------
  function atualizarProgresso() {
    var el = $('progresso');
    if (passo === 0 || estado.exemplo) { el.hidden = true; el.innerHTML = ''; return; }
    var barras = '';
    for (var i = 1; i <= TOTAL_PASSOS; i++) {
      barras += '<li class="' + (i < passo ? 'feito' : i === passo ? 'atual' : '') + '"></li>';
    }
    el.innerHTML = '<p class="progresso-texto"><strong>Passo ' + passo + ' de ' + TOTAL_PASSOS + '</strong> · ' +
      esc(NOMES_PASSOS[passo - 1]) + '</p><ol class="progresso-barra" aria-hidden="true">' + barras + '</ol>';
    el.hidden = false;
  }

  function atualizarNavegacao() {
    $('navegacao').hidden = passo === 0;
    var avancar = $('avancar');
    avancar.hidden = passo >= TOTAL_PASSOS;
    avancar.textContent = passo === TOTAL_PASSOS - 1 ? 'Ver meu currículo' : 'Continuar';
    $('voltar').textContent = passo === TOTAL_PASSOS && !estado.exemplo ? 'Voltar e corrigir' : 'Voltar';
  }

  function desenhar(focoId) {
    $('tela').innerHTML = TELAS[passo]();
    atualizarProgresso();
    atualizarNavegacao();
    if (focoId) {
      var el = $(focoId);
      if (el) el.focus();
    }
  }

  function irPara(n) {
    passo = n;
    $('aviso').hidden = true;
    desenhar();
    window.scrollTo(0, 0);
    var titulo = $('titulo-tela');
    if (titulo) titulo.focus({ preventScroll: true });
  }

  function atualizarFolha() {
    var folha = $('folha');
    if (folha) folha.innerHTML = htmlCurriculo(CV.montar(estado));
  }

  // ---------- Ações ----------
  function alternar(botao) {
    var lista = estado[botao.dataset.lista];
    var valor = botao.dataset.valor;
    var max = Number(botao.dataset.max) || 0;
    var i = lista.indexOf(valor);
    if (i >= 0) {
      lista.splice(i, 1);
    } else {
      if (max && lista.length >= max) {
        aviso('Você pode escolher até ' + max + '. Desmarque uma opção para trocar.');
        return;
      }
      lista.push(valor);
    }
    botao.setAttribute('aria-pressed', i >= 0 ? 'false' : 'true');
    if (botao.dataset.lista === 'areas' && valor === 'outra') {
      var bloco = $('bloco-outra');
      bloco.hidden = i >= 0;
      if (i < 0) $('vaga-outra').focus();
      else estado.areaOutra = '';
    }
  }

  function escolher(botao) {
    var campo = botao.dataset.campo;
    var bruto = botao.dataset.valor;
    var valor = bruto === 'true' ? true : bruto === 'false' ? false : bruto;
    definir(campo, valor);
    if (campo === 'temExperiencia' && valor === true && !estado.experiencias.length) {
      estado.experiencias.push(novaExperiencia());
    }
    if ('reconstruir' in botao.dataset) {
      desenhar(botao.id);
      return;
    }
    var grupo = botao.parentNode.querySelectorAll('[data-acao="escolher"]');
    Array.prototype.forEach.call(grupo, function (b) { b.setAttribute('aria-pressed', b === botao ? 'true' : 'false'); });
  }

  function gerarPdf() {
    var cv = CV.montar(estado);
    return { blob: PDF.gerar(cv), nome: CV.nomeArquivo(cv) };
  }

  function baixarPdf() {
    if (C.modoPrevia) {
      aviso('Nesta prévia o download fica desligado. No site publicado, este botão baixa o PDF.');
      return;
    }
    try {
      var r = gerarPdf();
      var url = URL.createObjectURL(r.blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = r.nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      aviso('Pronto! O arquivo ' + r.nome + ' está na pasta Downloads.');
    } catch (e) {
      aviso('Não foi possível criar o PDF. Tente de novo ou use "Copiar como texto".');
    }
  }

  function compartilharPdf() {
    var r = gerarPdf();
    var arquivo = new File([r.blob], r.nome, { type: 'application/pdf' });
    navigator.share({ files: [arquivo] }).catch(function (e) {
      if (e && e.name === 'AbortError') return;
      aviso('Não deu para enviar. Use "Baixar PDF" e envie o arquivo pelo WhatsApp ou e-mail.');
    });
  }

  function copiarTexto() {
    var texto = CV.comoTexto(CV.montar(estado));
    var area = $('texto-copia');
    function copiaManual() {
      area.value = texto;
      area.hidden = false;
      area.focus();
      area.select();
      aviso('Selecione o texto abaixo e copie.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        aviso('Texto copiado. Agora é só colar onde quiser.');
      }, copiaManual);
    } else {
      copiaManual();
    }
  }

  function sairRapido() {
    estado = estadoVazio();
    passo = 0;
    $('tela').innerHTML = '';
    if (C.modoPrevia) {
      desenhar();
      aviso('No site publicado, este botão apaga tudo e abre o Google na hora.');
      return;
    }
    document.title = 'Google';
    window.location.replace(C.saidaUrl);
  }

  function aoClicar(ev) {
    var b = ev.target.closest('[data-acao]');
    if (!b) return;
    var i = Number(b.dataset.i);
    switch (b.dataset.acao) {
      case 'comecar':
        if (estado.exemplo) estado = estadoVazio();
        irPara(1);
        break;
      case 'ver-exemplo':
        estado = estadoExemplo();
        irPara(TOTAL_PASSOS);
        break;
      case 'alternar':
        alternar(b);
        break;
      case 'escolher':
        escolher(b);
        break;
      case 'adicionar-exp':
        estado.experiencias.push(novaExperiencia());
        desenhar('exp-' + (estado.experiencias.length - 1) + '-tipo');
        break;
      case 'remover-exp':
        estado.experiencias.splice(i, 1);
        if (!estado.experiencias.length) estado.temExperiencia = null;
        desenhar('titulo-tela');
        aviso('Trabalho removido.');
        break;
      case 'adicionar-curso':
        estado.cursos.push({ nome: b.dataset.nome || '', local: '', ano: '' });
        desenhar('curso-' + (estado.cursos.length - 1) + (b.dataset.nome ? '-local' : '-nome'));
        break;
      case 'remover-curso':
        estado.cursos.splice(i, 1);
        desenhar('titulo-tela');
        aviso('Curso removido.');
        break;
      case 'baixar-pdf':
        baixarPdf();
        break;
      case 'compartilhar-pdf':
        compartilharPdf();
        break;
      case 'copiar-texto':
        copiarTexto();
        break;
      case 'restaurar':
        definir(b.dataset.campo, null);
        var cv = CV.montar(estado);
        $(b.dataset.alvo).value = b.dataset.campo === 'objetivoEditado' ? cv.objetivoSugerido : cv.resumoSugerido;
        atualizarFolha();
        break;
      case 'apagar':
        $('confirmar-apagar').hidden = false;
        b.hidden = true;
        break;
      case 'apagar-nao':
        $('confirmar-apagar').hidden = true;
        document.querySelector('[data-acao="apagar"]').hidden = false;
        break;
      case 'apagar-sim':
        estado = estadoVazio();
        irPara(0);
        aviso('Tudo foi apagado.');
        break;
    }
  }

  function aoDigitar(ev) {
    var el = ev.target;
    if (el.dataset.listaCampo) {
      var lista = obter(el.dataset.listaCampo) || [];
      var v = Number(el.value);
      var pos = lista.indexOf(v);
      if (el.checked && pos < 0) lista.push(v);
      if (!el.checked && pos >= 0) lista.splice(pos, 1);
      definir(el.dataset.listaCampo, lista);
      return;
    }
    if (!el.dataset.campo) return;
    definir(el.dataset.campo, el.value);
    limparErro(el);

    if (ev.type === 'change' && el.dataset.campo === 'telefone') {
      el.value = CV.formatarTelefone(el.value);
      estado.telefone = el.value;
    }
    if (ev.type === 'change' && 'reconstruir' in el.dataset) {
      var m = /^experiencias\.(\d+)\.tipo$/.exec(el.dataset.campo);
      if (m) {
        var x = estado.experiencias[Number(m[1])];
        var t = Q.porId(Q.EXPERIENCIAS, x.tipo);
        x.cargo = t ? t.cargo : '';
        x.atividades = [];
      }
      desenhar(el.id);
    }
    if ('atualizaCv' in el.dataset) atualizarFolha();
  }

  function iniciar() {
    var tela = $('tela');
    tela.addEventListener('click', aoClicar);
    tela.addEventListener('input', aoDigitar);
    tela.addEventListener('change', aoDigitar);

    $('avancar').addEventListener('click', function () {
      if (!validar()) return;
      irPara(Math.min(passo + 1, TOTAL_PASSOS));
    });
    $('voltar').addEventListener('click', function () {
      if (estado.exemplo) { estado = estadoVazio(); irPara(0); return; }
      irPara(Math.max(passo - 1, 0));
    });
    $('sair').addEventListener('click', sairRapido);

    // No computador: Esc duas vezes seguidas = sair rápido.
    var ultimoEsc = 0;
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var agora = Date.now();
      if (agora - ultimoEsc < 900) sairRapido();
      ultimoEsc = agora;
    });

    desenhar();
  }

  iniciar();
})();
