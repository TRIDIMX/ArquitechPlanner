/* Reporte de Visita — diseño v2 "limpio"
   Navegador: buildReportPDF(data, { jsPDF, logos: window.AGIS_LOGOS, fonts: window.AGIS_PDF_FONTS })
   Node:      buildReportPDF(data, { jsPDF, autoTable, logos, fonts })                                   */
(function (root) {
  'use strict';

  var C = {
    ink: [31, 35, 41], body: [58, 64, 73], muted: [128, 135, 146], faint: [176, 182, 191],
    hair: [227, 230, 235], soft: [246, 247, 249], red: [228, 25, 55], white: [255, 255, 255],
    pill: {
      OK: { bg: [230, 244, 236], fg: [21, 115, 71] },
      FALLA: { bg: [253, 231, 234], fg: [192, 21, 48] },
      'OBSERVACIÓN': { bg: [255, 243, 220], fg: [168, 98, 0] },
      PENDIENTE: { bg: [255, 243, 220], fg: [168, 98, 0] },
      'N/A': { bg: [238, 240, 243], fg: [107, 114, 128] }
    }
  };

  function fmt(iso) {
    if (!iso) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : iso;
  }
  function fmtLong(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return iso || '';
    var mes = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return (+m[3]) + ' de ' + mes[+m[2] - 1] + ' de ' + m[1];
  }

  function buildReportPDF(d, libs) {
    var doc = new libs.jsPDF({ unit: 'mm', format: 'letter' });
    var logos = libs.logos || root.AGIS_LOGOS || {};
    var fonts = libs.fonts || root.AGIS_PDF_FONTS || null;
    var table = function (o) { return libs.autoTable ? libs.autoTable(doc, o) : doc.autoTable(o); };

    /* ---- Tipografía ---- */
    var FAM = { r: ['helvetica', 'normal'], s: ['helvetica', 'bold'], b: ['helvetica', 'bold'] };
    if (fonts && fonts.regular) {
      try {
        doc.addFileToVFS('Manrope-Regular.ttf', fonts.regular); doc.addFont('Manrope-Regular.ttf', 'Manrope', 'normal');
        doc.addFileToVFS('Manrope-SemiBold.ttf', fonts.semibold); doc.addFont('Manrope-SemiBold.ttf', 'ManropeSB', 'normal');
        doc.addFileToVFS('Manrope-ExtraBold.ttf', fonts.extrabold); doc.addFont('Manrope-ExtraBold.ttf', 'ManropeXB', 'normal');
        FAM = { r: ['Manrope', 'normal'], s: ['ManropeSB', 'normal'], b: ['ManropeXB', 'normal'] };
      } catch (e) { /* se queda Helvetica */ }
    }
    function F(w, size, color) { doc.setFont(FAM[w][0], FAM[w][1]); doc.setFontSize(size); var c = color || C.ink; doc.setTextColor(c[0], c[1], c[2]); }
    function fill(c) { doc.setFillColor(c[0], c[1], c[2]); }
    function draw(c) { doc.setDrawColor(c[0], c[1], c[2]); }
    function hair(x1, yy, x2, c, lw) { draw(c || C.hair); doc.setLineWidth(lw || 0.25); doc.line(x1, yy, x2, yy); }
    function caps(t) { return String(t || '').toUpperCase(); }

    var W = 215.9, H = 279.4, L = 18, R = W - 18, CW = R - L;
    var TOP_NEXT = 36, BOTTOM = H - 26;
    var y = 0;
    var tipo = d.tipo || 'Reporte de Visita Técnica';

    /* ---- Encabezado ---- */
    function header() {
      if (logos.wordmark) {
        var lw = 44, lh = lw / (logos.wordmarkRatio || 5.94);
        try { doc.addImage(logos.wordmark, 'PNG', L, 13.2, lw, lh, 'wordmark', 'FAST'); } catch (e) {}
      } else { F('r', 18, C.ink); doc.text('arquitechtura', L, 20); }
      F('s', 7, C.red);
      doc.text(caps(tipo), R, 15.6, { align: 'right', charSpace: 0.55 });
      F('b', 12.5, C.ink);
      doc.text(d.folio || 'Sin folio', R, 22.2, { align: 'right' });
      hair(L, 27.5, R, C.hair, 0.3);
    }
    /* ---- Pie ---- */
    function footer(p, n) {
      var fy = H - 15.5;
      hair(L, fy - 4.5, R);
      var x = L;
      if (logos.mark) { try { doc.addImage(logos.mark, 'PNG', L, fy - 2.6, 6.2, 6.2, 'mark', 'FAST'); x = L + 8.4; } catch (e) {} }
      F('s', 7, C.ink); doc.text('ARQUITECHTURA AGIS S.A. DE C.V.', x, fy, { charSpace: 0.3 });
      F('r', 6.6, C.muted);
      doc.text('Lago Estefanía 31, Granada, Miguel Hidalgo, 11520, CDMX  ·  55 5255 1687  ·  55 5545 5054', x, fy + 3.4);
      F('r', 6.8, C.muted); doc.text('Página ' + p + ' de ' + n, R, fy, { align: 'right' });
      if (d.folio) { F('r', 6.6, C.faint); doc.text(d.folio, R, fy + 3.4, { align: 'right' }); }
    }
    function newPage() { doc.addPage(); header(); y = TOP_NEXT; }
    function ensure(h) { if (y + h > BOTTOM) newPage(); }

    var secN = 0;
    function section(name, need) {
      ensure((need || 0) + 14);
      secN++;
      var num = (secN < 10 ? '0' : '') + secN;
      F('b', 8.6, C.red); doc.text(num, L, y);
      F('s', 8.6, C.ink); doc.text(caps(name), L + 7.5, y, { charSpace: 0.7 });
      var tw = doc.getTextWidth(caps(name)) + caps(name).length * 0.7;
      hair(Math.min(R, L + 7.5 + tw + 4), y - 1.2, R);
      y += 7;
    }
    function lines(text, w, size, lh, color, weight, x) {
      F(weight || 'r', size, color || C.body);
      doc.splitTextToSize(String(text || ''), w).forEach(function (ln) { ensure(lh); doc.text(ln, x == null ? L : x, y); y += lh; });
    }

    /* ================= Página 1 ================= */
    header();
    y = 40;

    // Título
    F('s', 7, C.muted); doc.text('ASUNTO', L, y, { charSpace: 0.6 }); y += 6.2;
    F('b', 17, C.ink);
    doc.splitTextToSize(d.asunto || '—', CW).forEach(function (ln) { doc.text(ln, L, y); y += 7.4; });
    if (d.codigo) { y -= 1.2; F('s', 10.5, C.body); doc.text(d.codigo, L, y); y += 4; }
    y += 5;

    // Datos generales (banda suave)
    var cols = [
      { l: 'FECHA', v: fmtLong(d.fecha) || '—' },
      { l: 'PREPARADO POR', v: d.preparado || '—' },
      { l: 'DISTRIBUCIÓN', v: d.distribucion || '—' }
    ];
    var pad = 6, cw3 = (CW - pad * 2) / 3;
    F('r', 9, C.ink);
    var rowH1 = Math.max.apply(null, cols.map(function (c) { return doc.splitTextToSize(c.v, cw3 - 4).length; })) * 4.4;
    var partLines = doc.splitTextToSize(d.participantes || '—', CW - pad * 2);
    var bandH = pad + 4 + rowH1 + 5 + 4 + partLines.length * 4.4 + pad - 2;
    fill(C.soft); doc.roundedRect(L, y, CW, bandH, 2.5, 2.5, 'F');
    var by = y + pad + 1;
    cols.forEach(function (c, i) {
      var x = L + pad + i * cw3;
      F('s', 6.4, C.muted); doc.text(c.l, x, by, { charSpace: 0.5 });
      F('r', 9, C.ink); doc.text(doc.splitTextToSize(c.v, cw3 - 4), x, by + 4.6);
    });
    by += 4 + rowH1 + 3;
    hair(L + pad, by - 1.5, R - pad, [232, 234, 238]);
    by += 3.2;
    F('s', 6.4, C.muted); doc.text('PARTICIPANTES', L + pad, by, { charSpace: 0.5 });
    F('r', 9, C.ink); doc.text(partLines, L + pad, by + 4.6);
    y += bandH + 11;

    /* 01 · Descripción */
    section('Descripción de la falla', 10);
    lines(d.descripcion || '—', CW, 9.6, 5, C.body);
    y += 8;

    /* 02 · Diagnóstico */
    section('Diagnóstico por componente', 24);
    var comps = (d.componentes || []).map(function (c) { return [c.sistema || '', caps(c.estado), c.observacion || '']; });
    if (!comps.length) comps = [['—', '', '']];
    var fontR = FAM.r[0], fontS = FAM.s[0];
    table({
      startY: y, theme: 'plain', margin: { left: L, right: W - R, top: TOP_NEXT + 2, bottom: H - BOTTOM },
      head: [['SISTEMA / COMPONENTE', 'ESTADO', 'OBSERVACIÓN / HALLAZGO']],
      body: comps,
      styles: { font: fontR, fontStyle: FAM.r[1], fontSize: 8.8, textColor: C.body, cellPadding: { top: 3.4, bottom: 3.4, left: 2, right: 3 }, valign: 'middle', lineWidth: 0 },
      headStyles: { font: fontS, fontStyle: FAM.s[1], fontSize: 6.4, textColor: C.muted, cellPadding: { top: 1, bottom: 2.6, left: 2, right: 3 } },
      columnStyles: { 0: { cellWidth: 50, font: fontS, fontStyle: FAM.s[1], textColor: C.ink }, 1: { cellWidth: 30 } },
      didParseCell: function (h) {
        if (h.section === 'body' && h.column.index === 1) { h.cell._estado = String(h.cell.raw || ''); h.cell.text = ['']; }
      },
      didDrawCell: function (h) {
        var c = h.cell;
        if (h.section === 'head') hair(c.x, c.y + c.height, c.x + c.width, C.ink, 0.35);
        if (h.section === 'body') {
          hair(c.x, c.y + c.height, c.x + c.width, C.hair, 0.25);
          if (h.column.index === 1 && c._estado) {
            var st = C.pill[c._estado] || C.pill['N/A'];
            F('s', 6.6, st.fg);
            var tw = doc.getTextWidth(c._estado) + c._estado.length * 0.25, pw = tw + 6, ph = 5.2;
            var px = c.x + 2, py = c.y + (c.height - ph) / 2;
            fill(st.bg); doc.roundedRect(px, py, pw, ph, 2.6, 2.6, 'F');
            doc.text(c._estado, px + 3, py + 3.55, { charSpace: 0.25 });
          }
        }
      },
      didDrawPage: function (h) { if (h.pageNumber > 1) header(); }
    });
    y = doc.lastAutoTable.finalY + 10;

    /* 03 · Evidencia fotográfica (opcional) */
    var fotos = (d.fotos || []).filter(function (f) { return f && f.src; }).slice(0, 2);
    if (fotos.length) {
      var gapF = 6, cellW = fotos.length === 1 ? Math.min(118, CW) : (CW - gapF) / 2, maxH = fotos.length === 1 ? 80 : 58;
      var capH = fotos.some(function (f) { return f.caption; }) ? 10 : 6;
      var avail = BOTTOM - y - 14 - capH - 2;
      if (avail < maxH && avail >= 46) maxH = avail; // se ajusta al espacio antes de saltar de página
      section('Evidencia fotográfica', maxH + capH);
      var top0 = y;
      fotos.forEach(function (f, i) {
        var cellX = fotos.length === 1 ? L : L + i * (cellW + gapF);
        fill(C.soft); doc.roundedRect(cellX, top0, cellW, maxH, 2.2, 2.2, 'F');
        var ratio = (f.w && f.h) ? f.w / f.h : 4 / 3, iw = cellW - 4, ih = iw / ratio;
        if (ih > maxH - 4) { ih = maxH - 4; iw = ih * ratio; }
        var fmtImg = /^data:image\/png/.test(f.src) ? 'PNG' : 'JPEG';
        try { doc.addImage(f.src, fmtImg, cellX + (cellW - iw) / 2, top0 + (maxH - ih) / 2, iw, ih, undefined, 'MEDIUM'); } catch (e) {}
        var cy = top0 + maxH + 4.6;
        F('s', 6.8, C.red); doc.text('FOTO ' + (i + 1), cellX, cy, { charSpace: 0.5 });
        if (f.caption) {
          var off = doc.getTextWidth('FOTO ' + (i + 1)) + 6;
          F('r', 8, C.body);
          doc.text(doc.splitTextToSize(f.caption, cellW - off).slice(0, 2), cellX + off, cy);
        }
      });
      y = top0 + maxH + capH + 5;
    }

    /* Conclusión y dictamen */
    var bullets = (d.conclusiones || []).filter(function (s) { return s && s.trim(); });
    F('r', 9.4, C.body);
    var estH = 6 + bullets.reduce(function (a, b) { return a + doc.splitTextToSize(b, CW - 7).length * 4.9 + 2; }, 0);
    section('Conclusión y dictamen', Math.min(60, estH));
    lines(d.concIntro || 'Con base en las pruebas realizadas, se concluye lo siguiente:', CW, 9.4, 4.9, C.body);
    y += 2.2;
    bullets.forEach(function (b) {
      F('r', 9.4, C.ink);
      var ls = doc.splitTextToSize(b.trim(), CW - 7);
      ensure(4.9 + 1);
      fill(C.red); doc.circle(L + 1.6, y - 1.25, 0.75, 'F');
      ls.forEach(function (ln) { ensure(4.9); F('r', 9.4, C.ink); doc.text(ln, L + 6, y); y += 4.9; });
      y += 1.8;
    });
    if (d.recomendacion && d.recomendacion.trim()) {
      F('r', 9.2, C.ink);
      var rl = doc.splitTextToSize(d.recomendacion.trim(), CW - 16);
      var rh = 6 + 4 + rl.length * 4.7 + 4;
      y += 3; ensure(rh + 2);
      fill(C.soft); doc.roundedRect(L, y, CW, rh, 2.2, 2.2, 'F');
      fill(C.red); doc.rect(L, y + 3, 1.1, rh - 6, 'F');
      F('s', 6.4, C.red); doc.text('RECOMENDACIÓN', L + 7, y + 6.2, { charSpace: 0.5 });
      F('r', 9.2, C.ink); doc.text(rl, L + 7, y + 11.4);
      y += rh;
    }
    y += 9;

    /* Acciones y seguimiento */
    F('r', 8.6, C.body);
    var nl = d.nota ? doc.splitTextToSize(d.nota, CW - 72) : [];
    section('Acciones y seguimiento', Math.max(14, nl.length * 4.4 + 6));
    var ay = y;
    F('s', 6.4, C.muted); doc.text('RESPONSABLE DEL SEGUIMIENTO', L, ay, { charSpace: 0.5 });
    F('s', 10, C.ink);
    var resL = doc.splitTextToSize(d.responsable || '—', 62);
    doc.text(resL, L, ay + 5.2);
    if (nl.length) {
      draw(C.hair); doc.setLineWidth(0.25); doc.line(L + 66, ay - 2.5, L + 66, ay + Math.max(resL.length * 4.6 + 3, nl.length * 4.4) + 1);
      F('r', 8.6, C.body); doc.text(nl, L + 72, ay + 0.6);
    }
    y = ay + Math.max(resL.length * 4.6 + 5, nl.length * 4.4 + 2) + 8;

    /* Firmas */
    section('Firmas de conformidad', 40);
    var gap = 16, bw = (CW - gap) / 2, top = y;
    function sig(x, label, img, name, cargo, fecha) {
      F('s', 6.4, C.muted); doc.text(label, x, top, { charSpace: 0.5 });
      if (img) { try { doc.addImage(img, 'PNG', x + (bw - 46) / 2, top + 2, 46, 17, undefined, 'FAST'); } catch (e) {} }
      var ly = top + 21;
      hair(x, ly, x + bw, C.ink, 0.3);
      F('s', 9.6, C.ink); doc.text(name || ' ', x, ly + 5.4);
      F('r', 8.2, C.muted); doc.text(doc.splitTextToSize(cargo || 'Nombre y cargo', bw).slice(0, 2), x, ly + 9.8);
      F('r', 7.8, C.muted); doc.text('Fecha: ' + (fmt(fecha) || '____ / ____ / ________'), x, ly + 17.6);
    }
    sig(L, 'PRESTADOR DE SERVICIO', d.prestFirma, d.prestNombre, d.prestCargo, d.prestFecha);
    sig(L + bw + gap, 'RECIBE CONFORME', d.recFirma, d.recNombre, d.recCargo || 'Nombre y cargo del cliente', d.recFecha);
    y = top + 44;

    var n = doc.getNumberOfPages();
    for (var p = 1; p <= n; p++) { doc.setPage(p); footer(p, n); }
    return doc;
  }

  root.buildReportPDF = buildReportPDF;
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildReportPDF: buildReportPDF };
})(typeof window !== 'undefined' ? window : globalThis);
