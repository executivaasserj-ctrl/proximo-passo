/*
 * Próximo Passo — transforma as respostas no currículo
 * ------------------------------------------------------------
 * montar(estado) devolve um "modelo" único do currículo, usado para
 * três saídas: a prévia na tela, o PDF e o texto para copiar.
 */
window.PP_CURRICULO = (function () {
  'use strict';
  var Q = window.PP_PERGUNTAS;
  var ANO_ATUAL = new Date().getFullYear();
  var MINUSCULAS = { da: 1, de: 1, di: 1, do: 1, das: 1, dos: 1, e: 1 };

  function limpar(t) {
    return String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  }

  function maiuscula(t) {
    t = limpar(t);
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }

  function semPontoFinal(t) {
    return limpar(t).replace(/[.;,]+$/, '');
  }

  // "maria DA silva" -> "Maria da Silva" (só mexe se estiver tudo minúsculo ou tudo maiúsculo)
  function nomeProprio(t) {
    t = limpar(t);
    if (!t) return t;
    if (t !== t.toLowerCase() && t !== t.toUpperCase()) return t;
    return t.toLowerCase().split(' ').map(function (p, i) {
      if (i > 0 && MINUSCULAS[p]) return p;
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');
  }

  // ["a","b","c"] -> "a, b e c"
  function juntar(lista, conectivo) {
    conectivo = conectivo || 'e';
    lista = lista.filter(Boolean);
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' ' + conectivo + ' ' + lista[lista.length - 1];
  }

  function formatarTelefone(t) {
    var d = String(t || '').replace(/\D/g, '');
    if (d.length === 13 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return limpar(t);
  }

  function periodo(inicio, fim) {
    var i = limpar(inicio), f = limpar(fim);
    if (f === 'atual') return i ? i + ' – atual' : 'Atual';
    if (i && f && Number(f) < Number(i)) { var tmp = i; i = f; f = tmp; }
    if (i && f) return i === f ? i : i + ' – ' + f;
    return i || f;
  }

  function experienciasValidas(e) {
    if (!e.temExperiencia) return [];
    return (e.experiencias || []).filter(function (x) {
      return x.tipo && (limpar(x.cargo) || (Q.porId(Q.EXPERIENCIAS, x.tipo) || {}).cargo);
    });
  }

  // Mais recente primeiro: "atual" antes, depois pelo ano de saída.
  function ordenar(lista) {
    function peso(x) {
      if (x.fim === 'atual') return 99999;
      return Number(x.fim) || Number(x.inicio) || 0;
    }
    return lista.slice().sort(function (a, b) { return peso(b) - peso(a); });
  }

  function linhasExtras(texto) {
    return String(texto || '').split(/\n+/).map(semPontoFinal).filter(Boolean).map(maiuscula);
  }

  function objetivoSugerido(e) {
    var titulos = [];
    var primeiraArea = null;
    (e.areas || []).forEach(function (id) {
      var a = Q.porId(Q.AREAS, id);
      if (!a) return;
      if (id === 'outra') {
        if (limpar(e.areaOutra)) titulos.push(maiuscula(e.areaOutra));
      } else {
        titulos.push(a.titulo);
      }
      if (!primeiraArea) primeiraArea = a;
    });
    if (!titulos.length) return Q.OBJETIVO_SEM_VAGA;
    var foco = Q.FOCOS[(primeiraArea && primeiraArea.foco) || 'geral'] || Q.FOCOS.geral;
    return 'Atuar como ' + juntar(titulos, 'ou') + ', ' + foco + '.';
  }

  function resumoSugerido(e) {
    var forcas = (e.forcas || []).map(function (id) { return Q.porId(Q.FORCAS, id); }).filter(Boolean);
    var adjetivos = forcas.filter(function (f) { return f.adj; }).map(function (f) { return f.adj; }).slice(0, 3);
    var frases = forcas.filter(function (f) { return f.frase; }).map(function (f) { return f.frase; }).slice(0, 2);
    var exps = ordenar(experienciasValidas(e));

    var s1 = 'Profissional' + (adjetivos.length ? ' ' + juntar(adjetivos) + ',' : '');
    if (exps.length) {
      var dominios = [], outras = [];
      exps.forEach(function (x) {
        var t = Q.porId(Q.EXPERIENCIAS, x.tipo);
        if (t && t.dominio) {
          if (dominios.indexOf(t.dominio) < 0) dominios.push(t.dominio);
        } else {
          var c = limpar(x.cargo).toLowerCase();
          if (c && outras.indexOf(c) < 0) outras.push(c);
        }
      });
      if (dominios.length && outras.length) {
        s1 += ' com experiência em ' + juntar(dominios.slice(0, 3)) + ', além de atuação como ' + juntar(outras.slice(0, 2)) + '.';
      } else if (dominios.length) {
        s1 += ' com experiência em ' + juntar(dominios.slice(0, 3)) + '.';
      } else {
        s1 += ' com experiência como ' + juntar(outras.slice(0, 2)) + '.';
      }
    } else {
      s1 += ' em busca de oportunidade no mercado de trabalho.';
    }

    var frasesResumo = [s1];
    if (frases.length) frasesResumo.push(maiuscula(juntar(frases)) + '.');

    if (exps.length) {
      var temAtual = exps.some(function (x) { return x.fim === 'atual'; });
      var ultimoAno = Math.max.apply(null, exps.map(function (x) { return Number(x.fim) || Number(x.inicio) || 0; }));
      if (!temAtual && ultimoAno > 0 && ultimoAno <= ANO_ATUAL - 2) {
        frasesResumo.push('Pronta para retornar ao mercado de trabalho.');
      }
    }
    if (e.imediato) frasesResumo.push('Disponível para início imediato.');
    return frasesResumo.join(' ');
  }

  function formacao(e) {
    var nivel = Q.porId(Q.ESCOLARIDADE, e.escolaridade);
    if (!nivel) return [];
    var linha;
    if (nivel.curso && limpar(e.cursoFormal)) {
      linha = nivel.curso + ' ' + limpar(e.cursoFormal) + ' (' + nivel.situacao + ')';
    } else {
      linha = nivel.rotulo;
    }
    if (nivel.curso && limpar(e.instituicaoFormal)) linha += ' – ' + limpar(e.instituicaoFormal);
    return [linha];
  }

  function cursos(e) {
    return (e.cursos || []).filter(function (c) { return limpar(c.nome); }).map(function (c) {
      var t = maiuscula(c.nome);
      if (limpar(c.local)) t += ' – ' + limpar(c.local);
      if (limpar(c.ano)) t += ' (' + limpar(c.ano) + ')';
      return t;
    });
  }

  function habilidades(e) {
    var itens = (e.ferramentas || []).map(function (id) {
      var f = Q.porId(Q.FERRAMENTAS, id);
      return f ? f.cv : '';
    }).filter(Boolean);
    String(e.outraHabilidade || '').split(/[\n;]+/).map(semPontoFinal).filter(Boolean).forEach(function (h) {
      itens.push(maiuscula(h));
    });
    return itens;
  }

  function adicionais(e) {
    var itens = [];
    var turnos = (e.turnos || []).map(function (id) {
      var t = Q.porId(Q.TURNOS, id);
      return t ? t.cv : '';
    }).filter(Boolean);
    if (turnos.length) itens.push('Disponibilidade de horário: ' + juntar(turnos));
    if (e.cnh) itens.push('CNH categoria ' + e.cnh);
    return itens;
  }

  function contato(e) {
    var partes = [];
    var cidade = nomeProprio(e.cidade);
    var bairro = nomeProprio(e.bairro);
    var lugar = cidade ? cidade + (e.uf ? ' – ' + e.uf : '') : '';
    if (bairro && lugar) lugar = bairro + ', ' + lugar;
    if (lugar) partes.push(lugar);
    if (limpar(e.telefone)) partes.push(formatarTelefone(e.telefone));
    if (limpar(e.email)) partes.push(limpar(e.email).toLowerCase());
    return partes;
  }

  function montar(e) {
    var objetivo = e.objetivoEditado != null ? limpar(e.objetivoEditado) : objetivoSugerido(e);
    var resumo = e.resumoEditado != null ? limpar(e.resumoEditado) : resumoSugerido(e);

    var secoes = [];
    if (objetivo) secoes.push({ titulo: 'Objetivo', tipo: 'paragrafo', texto: objetivo });
    if (resumo) secoes.push({ titulo: 'Resumo', tipo: 'paragrafo', texto: resumo });

    var exps = ordenar(experienciasValidas(e)).map(function (x) {
      var t = Q.porId(Q.EXPERIENCIAS, x.tipo) || {};
      var marcadas = (x.atividades || []).slice().sort(function (a, b) { return a - b; })
        .map(function (i) { return (t.atividades || [])[i]; }).filter(Boolean);
      return {
        cargo: maiuscula(x.cargo) || t.cargo,
        local: limpar(x.local) || t.localPadrao || '',
        periodo: periodo(x.inicio, x.fim),
        topicos: marcadas.concat(linhasExtras(x.extra))
      };
    });
    if (exps.length) secoes.push({ titulo: 'Experiência', tipo: 'experiencias', itens: exps });

    var f = formacao(e);
    if (f.length) secoes.push({ titulo: 'Formação', tipo: 'lista', itens: f });
    var c = cursos(e);
    if (c.length) secoes.push({ titulo: 'Cursos', tipo: 'lista', itens: c });
    var h = habilidades(e);
    if (h.length) secoes.push({ titulo: 'Habilidades', tipo: 'lista', itens: h, colunas: h.length > 3 });
    var a = adicionais(e);
    if (a.length) secoes.push({ titulo: 'Informações adicionais', tipo: 'lista', itens: a });

    return {
      nome: nomeProprio(e.nome) || 'Seu nome',
      contato: contato(e),
      secoes: secoes,
      objetivoSugerido: objetivoSugerido(e),
      resumoSugerido: resumoSugerido(e)
    };
  }

  // Versão em texto simples, para colar em sites de vagas ou no WhatsApp.
  function comoTexto(cv) {
    var linhas = [cv.nome.toUpperCase(), cv.contato.join(' | '), ''];
    cv.secoes.forEach(function (s) {
      linhas.push(s.titulo.toUpperCase());
      if (s.tipo === 'paragrafo') {
        linhas.push(s.texto);
      } else if (s.tipo === 'experiencias') {
        s.itens.forEach(function (x, i) {
          if (i) linhas.push('');
          linhas.push([x.cargo, x.local, x.periodo].filter(Boolean).join(' | '));
          x.topicos.forEach(function (t) { linhas.push('- ' + t); });
        });
      } else {
        s.itens.forEach(function (t) { linhas.push('- ' + t); });
      }
      linhas.push('');
    });
    return linhas.join('\n').trim() + '\n';
  }

  function nomeArquivo(cv) {
    var base = String(cv.nome || 'curriculo').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return 'Curriculo-' + (base || 'novo') + '.pdf';
  }

  return {
    montar: montar, comoTexto: comoTexto, nomeArquivo: nomeArquivo,
    formatarTelefone: formatarTelefone, nomeProprio: nomeProprio, ANO_ATUAL: ANO_ATUAL
  };
})();
