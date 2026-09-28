/*
 * Próximo Passo — gerador de PDF próprio, sem bibliotecas externas
 * ------------------------------------------------------------
 * Monta um PDF A4 com as fontes padrão (Helvetica), que todo leitor de PDF
 * e todo sistema de recrutamento conseguem ler. O arquivo é criado dentro
 * do aparelho; nada é enviado para a internet.
 */
window.PP_PDF = (function () {
  'use strict';
  var M = window.PP_PDF_METRICAS;
  var A4 = { w: 595.28, h: 841.89 };
  var MARGEM = { x: 50, topo: 52, base: 52 };
  var LARG = A4.w - 2 * MARGEM.x;
  var COR = {
    tinta: '0.102 0.110 0.106',
    acento: '0.118 0.420 0.345',
    suave: '0.353 0.376 0.365'
  };
  var TEXTO = { tam: 10.5, entrelinha: 14.6 };

  // Letras fora do padrão Latin-1 que o PDF conhece por outro código.
  var ESPECIAIS = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86,
    0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
    0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95,
    0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
    0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
  };

  // Converte o texto para os códigos da fonte do PDF (1 caractere = 1 byte).
  function paraPdf(texto) {
    var s = String(texto == null ? '' : texto).normalize('NFC');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var cp = s.codePointAt(i);
      if (cp > 0xFFFF) { i++; continue; } // emoji e símbolos raros: descarta
      if (cp === 9 || cp === 10 || cp === 13) { out += ' '; continue; }
      if ((cp >= 0x20 && cp <= 0x7E) || (cp >= 0xA0 && cp <= 0xFF)) { out += String.fromCharCode(cp); continue; }
      if (ESPECIAIS[cp]) { out += String.fromCharCode(ESPECIAIS[cp]); continue; }
      var base = s.charAt(i).normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (base && base.charCodeAt(0) < 0x7F) out += base;
    }
    return out;
  }

  function largura(bin, tam, negrito) {
    var tabela = negrito ? M.negrito : M.normal;
    var soma = 0;
    for (var i = 0; i < bin.length; i++) soma += tabela[bin.charCodeAt(i)] || 556;
    return soma * tam / 1000;
  }

  function quebrar(bin, tam, negrito, max) {
    var linhas = [];
    var atual = '';
    bin.split(' ').forEach(function (p) {
      if (!p) return;
      var tentativa = atual ? atual + ' ' + p : p;
      if (largura(tentativa, tam, negrito) <= max) { atual = tentativa; return; }
      if (atual) linhas.push(atual);
      while (largura(p, tam, negrito) > max && p.length > 1) {
        var n = p.length;
        while (n > 1 && largura(p.slice(0, n), tam, negrito) > max) n--;
        linhas.push(p.slice(0, n));
        p = p.slice(n);
      }
      atual = p;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  function num(v) { return String(Math.round(v * 100) / 100); }

  function escapar(bin) {
    return bin.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  // ---------- Página e desenho ----------
  function Documento() {
    this.paginas = [];
    this.novaPagina();
  }

  Documento.prototype.novaPagina = function () {
    this.ops = [];
    this.paginas.push(this.ops);
    this.y = MARGEM.topo;
  };

  Documento.prototype.garantir = function (altura) {
    if (this.y + altura > A4.h - MARGEM.base) this.novaPagina();
  };

  // y = topo da linha de texto (medido de cima para baixo)
  Documento.prototype.texto = function (bin, x, y, tam, negrito, cor, espacamento) {
    if (!bin) return;
    var base = A4.h - (y + tam * 0.76);
    this.ops.push('BT /' + (negrito ? 'F2' : 'F1') + ' ' + num(tam) + ' Tf ' + cor + ' rg ' +
      (espacamento ? num(espacamento) + ' Tc ' : '') +
      '1 0 0 1 ' + num(x) + ' ' + num(base) + ' Tm (' + escapar(bin) + ') Tj' +
      (espacamento ? ' 0 Tc' : '') + ' ET');
  };

  Documento.prototype.linha = function (x1, y, x2, cor, espessura) {
    var yy = num(A4.h - y);
    this.ops.push(cor + ' RG ' + num(espessura) + ' w ' + num(x1) + ' ' + yy + ' m ' + num(x2) + ' ' + yy + ' l S');
  };

  Documento.prototype.paragrafo = function (texto, x, max) {
    var self = this;
    quebrar(paraPdf(texto), TEXTO.tam, false, max).forEach(function (l) {
      self.garantir(TEXTO.entrelinha);
      self.texto(l, x, self.y, TEXTO.tam, false, COR.tinta);
      self.y += TEXTO.entrelinha;
    });
  };

  // Tópico com marcador. Devolve a altura usada (para colunas).
  Documento.prototype.topico = function (texto, x, max) {
    var self = this;
    var linhas = quebrar(paraPdf(texto), TEXTO.tam, false, max - 11);
    linhas.forEach(function (l, i) {
      self.garantir(TEXTO.entrelinha);
      if (i === 0) self.texto('\x95', x + 1, self.y, TEXTO.tam, false, COR.acento);
      self.texto(l, x + 11, self.y, TEXTO.tam, false, COR.tinta);
      self.y += TEXTO.entrelinha;
    });
  };

  // ---------- Montagem do currículo ----------
  function desenhar(cv) {
    var d = new Documento();
    var x = MARGEM.x;

    quebrar(paraPdf(cv.nome), 22, true, LARG).forEach(function (l) {
      d.texto(l, x, d.y, 22, true, COR.tinta);
      d.y += 26;
    });
    d.y += 1;

    // Contato: quebra entre as partes, nunca no meio de um e-mail.
    var sep = '   |   ';
    var linhaAtual = '';
    var linhasContato = [];
    cv.contato.map(paraPdf).forEach(function (p) {
      var tentativa = linhaAtual ? linhaAtual + sep + p : p;
      if (!linhaAtual || largura(tentativa, 10, false) <= LARG) { linhaAtual = tentativa; return; }
      linhasContato.push(linhaAtual);
      linhaAtual = p;
    });
    if (linhaAtual) linhasContato.push(linhaAtual);
    linhasContato.forEach(function (l) {
      quebrar(l, 10, false, LARG).forEach(function (q) {
        d.texto(q, x, d.y, 10, false, COR.suave);
        d.y += 13.5;
      });
    });

    d.y += 7;
    d.linha(x, d.y, x + LARG, COR.acento, 1.4);
    d.y += 2;

    cv.secoes.forEach(function (s) {
      d.y += 15;
      d.garantir(12 + 5 + TEXTO.entrelinha * 2);
      d.texto(paraPdf(s.titulo.toUpperCase()), x, d.y, 9.5, true, COR.acento, 1.1);
      d.y += 12 + 5;

      if (s.tipo === 'paragrafo') {
        d.paragrafo(s.texto, x, LARG);
      } else if (s.tipo === 'experiencias') {
        s.itens.forEach(function (it, i) {
          if (i) d.y += 8;
          var per = paraPdf(it.periodo);
          var larguraPer = per ? largura(per, 10, false) : 0;
          var linhasCargo = quebrar(paraPdf(it.cargo), 11, true, LARG - larguraPer - 14);
          d.garantir(14 * linhasCargo.length + (it.local ? 13.5 : 0) + 2 + TEXTO.entrelinha * Math.min(2, it.topicos.length || 1));
          linhasCargo.forEach(function (l, j) {
            d.texto(l, x, d.y, 11, true, COR.tinta);
            if (j === 0 && per) d.texto(per, x + LARG - larguraPer, d.y + 1, 10, false, COR.suave);
            d.y += 14;
          });
          if (it.local) {
            quebrar(paraPdf(it.local), 10, false, LARG).forEach(function (l) {
              d.texto(l, x, d.y, 10, false, COR.suave);
              d.y += 13.5;
            });
          }
          d.y += 2;
          it.topicos.forEach(function (t) { d.topico(t, x, LARG); });
        });
      } else if (s.colunas) {
        var colLarg = (LARG - 18) / 2;
        for (var i = 0; i < s.itens.length; i += 2) {
          var alturaEsq = quebrar(paraPdf(s.itens[i]), TEXTO.tam, false, colLarg - 11).length;
          var alturaDir = s.itens[i + 1] ? quebrar(paraPdf(s.itens[i + 1]), TEXTO.tam, false, colLarg - 11).length : 0;
          var alturaLinha = Math.max(alturaEsq, alturaDir) * TEXTO.entrelinha;
          d.garantir(alturaLinha);
          var topo = d.y;
          d.topico(s.itens[i], x, colLarg);
          if (s.itens[i + 1]) {
            d.y = topo;
            d.topico(s.itens[i + 1], x + colLarg + 18, colLarg);
          }
          d.y = topo + alturaLinha;
        }
      } else {
        s.itens.forEach(function (t) { d.topico(t, x, LARG); });
      }
    });
    return d;
  }

  // ---------- Arquivo PDF ----------
  function textoUnicode(t) {
    var hex = 'FEFF';
    for (var i = 0; i < t.length; i++) hex += ('0000' + t.charCodeAt(i).toString(16).toUpperCase()).slice(-4);
    return '<' + hex + '>';
  }

  function serializar(d, titulo) {
    var objetos = [
      [1, '<< /Type /Catalog /Pages 2 0 R /Lang (pt-BR) >>'],
      null,
      [3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'],
      [4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'],
      [5, '<< /Title ' + textoUnicode(titulo) + ' /Creator (Proximo Passo) >>']
    ];
    var proximo = 6;
    var filhas = [];
    d.paginas.forEach(function (ops) {
      var conteudo = ops.join('\n');
      var idConteudo = proximo++;
      var idPagina = proximo++;
      objetos.push([idConteudo, '<< /Length ' + conteudo.length + ' >>\nstream\n' + conteudo + '\nendstream']);
      objetos.push([idPagina, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + A4.w + ' ' + A4.h + '] ' +
        '/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + idConteudo + ' 0 R >>']);
      filhas.push(idPagina + ' 0 R');
    });
    objetos[1] = [2, '<< /Type /Pages /Kids [' + filhas.join(' ') + '] /Count ' + filhas.length + ' >>'];

    var saida = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    var posicoes = [];
    objetos.forEach(function (o) {
      posicoes[o[0]] = saida.length;
      saida += o[0] + ' 0 obj\n' + o[1] + '\nendobj\n';
    });
    var inicioXref = saida.length;
    saida += 'xref\n0 ' + proximo + '\n0000000000 65535 f \n';
    for (var i = 1; i < proximo; i++) saida += ('0000000000' + posicoes[i]).slice(-10) + ' 00000 n \n';
    saida += 'trailer\n<< /Size ' + proximo + ' /Root 1 0 R /Info 5 0 R >>\nstartxref\n' + inicioXref + '\n%%EOF\n';

    var bytes = new Uint8Array(saida.length);
    for (var j = 0; j < saida.length; j++) bytes[j] = saida.charCodeAt(j) & 0xFF;
    return bytes;
  }

  function gerar(cv) {
    var bytes = serializar(desenhar(cv), 'Currículo – ' + cv.nome);
    return new Blob([bytes], { type: 'application/pdf' });
  }

  return { gerar: gerar, _paraPdf: paraPdf, _serializar: serializar, _desenhar: desenhar };
})();
