/* Generador PDF del Reporte de Visita — réplica del formato TRU-IDO-001
   Navegador: buildReportPDF(data, { jsPDF: window.jspdf.jsPDF, logos: window.AGIS_LOGOS })
   Node:      buildReportPDF(data, { jsPDF, autoTable, logos })                              */
(function (root) {
  'use strict';

  var C = {
    text: [26, 26, 46], black: [0, 0, 0], red: [192, 0, 0], redHead: [178, 10, 22],
    gray: [127, 127, 127], okFill: [26, 122, 74], badFill: [184, 26, 26], warnFill: [214, 140, 20], naFill: [190, 196, 204],
    rowAlt: [242, 245, 248], line: [208, 216, 224], boxGray: [217, 217, 217], boxBorder: [89, 89, 89],
    sigLabel: [27, 108, 168], muted: [102, 102, 102], white: [255, 255, 255]
  };

  function fmt(iso) {
    if (!iso) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : iso;
  }

  function buildReportPDF(d, libs) {
    var doc = new libs.jsPDF({ unit: 'mm', format: 'letter' });
    var logos = libs.logos || root.AGIS_LOGOS || {};
    var table = function (o) { return libs.autoTable ? libs.autoTable(doc, o) : doc.autoTable(o); };
    var W = 215.9, H = 279.4, L = 19, R = 206, CW = R - L;
    var TOP_NEXT = 40, BOTTOM = 250;
    var y = 0;
    var title = d.tipo || 'Reporte de Visita Técnica';

    function poly(pts, style) { // pts absolutos
      var first = pts[0], rel = [];
      for (var i = 1; i < pts.length; i++) rel.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
      doc.lines(rel, first[0], first[1], [1, 1], style || 'F', true);
    }
    function setText(c) { doc.setTextColor(c[0], c[1], c[2]); }
    function setFill(c) { doc.setFillColor(c[0], c[1], c[2]); }
    function setDraw(c) { doc.setDrawColor(c[0], c[1], c[2]); }

    /* ---------- Encabezado (todas las páginas) ---------- */
    function header() {
      if (logos.wordmark) {
        var lw = 71.7, lh = lw / (logos.wordmarkRatio || 5.94);
        try { doc.addImage(logos.wordmark, 'PNG', 8.6, 8.1, lw, lh, 'wordmark', 'FAST'); } catch (e) {}
      } else {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(26); setText(C.text); doc.text('arquitechtura', 8.6, 18);
      }
      // Franjas
      var t = 4.57, b = 23.2;
      setFill(C.red);
      poly([[101.6, t], [110.2, t], [95.6, b], [86.95, b]]);
      poly([[113.6, t], [122.3, t], [107.6, b], [99.0, b]]);
      setFill(C.gray);
      poly([[125.6, t], [W, t], [W, b], [111.0, b]]);
      // Título
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); setText(C.black);
      doc.text(title, 22.4, 33.9);
      if (d.folio) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(C.muted); doc.text(d.folio, R, 33.9, { align: 'right' }); }
    }
    /* ---------- Pie (todas las páginas) ---------- */
    function footer(p, n) {
      setFill(C.gray);
      poly([[0, 265.5], [86.7, 265.5], [100.2, 275.5], [0, 275.5]]);
      poly([[118.4, 257.9], [W, 257.9], [W, 267.9], [131.4, 267.9]]);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); setText(C.white);
      doc.text('ARQUITECHTURA AGIS S.A. DE C.V.', 6, 269.6);
      doc.text('Automatización Residencial y Comercial', 1, 273.6);
      doc.text('Lago Estefanía 31, Granada, Miguel Hidalgo,11520, CDMX', 210.5, 261.6, { align: 'right' });
      doc.text('55 5255 1687   /   55 5545 5054', 210.5, 265.6, { align: 'right' });
      if (logos.mark) { try { doc.addImage(logos.mark, 'PNG', 100, 257.9, 18.3, 18.3, 'mark', 'FAST'); } catch (e) {} }
      if (n > 1) { doc.setFontSize(7); setText(C.gray); doc.text(p + '/' + n, R, 254.5, { align: 'right' }); }
    }
    function newPage() { doc.addPage(); header(); y = TOP_NEXT; }
    function ensure(h) { if (y + h > BOTTOM) newPage(); }

    function section(num, name) {
      ensure(16);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); setText(C.black);
      doc.text(num + ' | ' + name.toUpperCase(), L - 0.5, y);
      y += 6;
    }
    function paragraph(text) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setText(C.text);
      doc.splitTextToSize(String(text || '—'), CW).forEach(function (ln) { ensure(4.6); doc.text(ln, L - 0.5, y); y += 4.6; });
    }

    /* Caja con relleno/borde que se parte entre páginas.
       rows: [{text, style:'normal'|'bold'|'italic', bullet, gap}]                  */
    function box(rows, fill, border, opts) {
      opts = opts || {};
      var padX = 6, padY = 4.2, lh = 4.5, size = 9;
      var segTop = y;
      var lines = [];
      rows.forEach(function (r) {
        doc.setFont('helvetica', r.style || 'normal'); doc.setFontSize(size);
        var ind = r.bullet ? 4 : 0;
        doc.splitTextToSize(r.text || '', CW - padX * 2 - ind).forEach(function (t, i) {
          lines.push({ t: t, style: r.style || 'normal', ind: ind, bullet: r.bullet && i === 0, color: r.color });
        });
        if (r.gap) lines.push({ gap: r.gap });
      });
      function drawBg(top, h) { setFill(fill); doc.rect(L, top, CW, h, 'F'); }
      function closeSeg(bottom) {
        if (border) { setDraw(border); doc.setLineWidth(opts.lw || 0.3); doc.rect(L, segTop, CW, bottom - segTop, 'S'); }
      }
      ensure(padY * 2 + lh);
      segTop = y; drawBg(y, padY); y += padY;
      lines.forEach(function (ln) {
        var h = ln.gap || lh;
        if (y + h > BOTTOM) { drawBg(y, 2); y += 2; closeSeg(y); newPage(); segTop = y; drawBg(y, 2.5); y += 2.5; }
        drawBg(y, h);
        if (!ln.gap) {
          doc.setFont('helvetica', ln.style); doc.setFontSize(size); setText(ln.color || C.text);
          if (ln.bullet) { setFill(C.muted); var bx = L + padX + 0.4, by = y + 2.3; doc.triangle(bx, by - 0.9, bx, by + 0.9, bx + 1.4, by, 'F'); }
          doc.text(ln.t, L + padX + ln.ind, y + 3.2);
        }
        y += h;
      });
      drawBg(y, padY); y += padY;
      closeSeg(y);
      y += 6;
    }

    function boxHeight(rows) {
      var h = 4.2 * 2;
      rows.forEach(function (r) {
        doc.setFont('helvetica', r.style || 'normal'); doc.setFontSize(9);
        h += doc.splitTextToSize(r.text || '', CW - 12 - (r.bullet ? 4 : 0)).length * 4.5 + (r.gap || 0);
      });
      return h;
    }
    function keepWithHeading(rows) { var h = boxHeight(rows); if (h < 90) ensure(h + 8); }

    /* ================= Contenido ================= */
    header();
    y = 42;

    // Datos generales
    var info = [
      ['Fecha:', fmt(d.fecha)], ['Asunto:', (d.asunto || '').toUpperCase()], ['Preparado por:', d.preparado || ''],
      ['Código:', (d.codigo || '').toUpperCase()], ['Participantes:', d.participantes || ''], ['Distribución:', d.distribucion || '']
    ];
    info.forEach(function (r) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6);
      var lines = doc.splitTextToSize(r[1], R - 66.5);
      ensure(lines.length * 3.6 + 3);
      doc.setFont('helvetica', 'bold'); setText(C.text); doc.text(r[0], 21.2, y);
      doc.setFont('helvetica', 'normal'); doc.text(lines, 66.5, y);
      y += Math.max(6.5, lines.length * 3.6 + 2.9);
    });
    y -= 1.5;
    setDraw(C.black); doc.setLineWidth(0.35); doc.line(L, y, 196.5, y);
    y += 6;

    // 01
    section('01', 'Descripción de la falla');
    paragraph(d.descripcion);
    y += 7;

    // 02
    section('02', 'Diagnóstico por componente');
    var comps = (d.componentes || []).map(function (c) { return [c.sistema || '', (c.estado || '').toUpperCase(), c.observacion || '']; });
    if (!comps.length) comps = [['—', '', '']];
    table({
      startY: y, theme: 'grid', margin: { left: L, right: W - R, top: TOP_NEXT, bottom: H - BOTTOM },
      head: [['SISTEMA / COMPONENTE', 'ESTADO', 'OBSERVACIÓN / HALLAZGO']],
      body: comps,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: { top: 2.6, bottom: 2.6, left: 3, right: 3 }, lineColor: C.white, lineWidth: 0.5, textColor: C.text, valign: 'middle', fillColor: C.white },
      headStyles: { fillColor: C.redHead, textColor: C.white, fontStyle: 'bold', fontSize: 8, halign: 'center', cellPadding: 1.8 },
      alternateRowStyles: { fillColor: C.rowAlt },
      columnStyles: { 0: { cellWidth: 48, fontStyle: 'bold' }, 1: { cellWidth: 31, halign: 'center', fontStyle: 'bold' } },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 1) {
          var v = String(data.cell.raw || '');
          var f = v === 'OK' ? C.okFill : v === 'FALLA' ? C.badFill : v === 'N/A' ? C.naFill : v ? C.warnFill : null;
          if (f) data.cell.styles.fillColor = f;
          data.cell.styles.textColor = C.text;
        }
      },
      didDrawPage: function (data) { if (data.pageNumber > 1) header(); }
    });
    y = doc.lastAutoTable.finalY + 10;

    // 03
    var rows3 = [{ text: d.concIntro || 'Con base en las pruebas realizadas, se concluye lo siguiente:', gap: 3 }];
    (d.conclusiones || []).filter(function (s) { return s && s.trim(); }).forEach(function (s) { rows3.push({ text: s.trim(), bullet: true }); });
    if (d.recomendacion && d.recomendacion.trim()) { rows3[rows3.length - 1].gap = 3.5; rows3.push({ text: d.recomendacion.trim() }); }
    keepWithHeading(rows3); section('03', 'Conclusión y dictamen');
    box(rows3, C.boxGray, C.boxBorder, { lw: 0.35 });
    y += 2;

    // 04
    var rows4 = [{ text: 'Responsable del seguimiento:', style: 'bold' }, { text: d.responsable || '—', gap: d.nota ? 2.5 : 0 }];
    if (d.nota) rows4.push({ text: d.nota, style: 'italic' });
    keepWithHeading(rows4); section('04', 'Acciones y seguimiento');
    box(rows4, C.white, C.line, { lw: 0.3 });
    y += 2;

    // 05
    ensure(62);
    section('05', 'Firmas de conformidad');
    var gap = 7, bw = (CW - gap) / 2, bh = 52, top = y;
    function sig(x, label, img, name, cargo, fecha) {
      setFill(C.rowAlt); setDraw(C.line); doc.setLineWidth(0.3); doc.rect(x, top, bw, bh, 'FD');
      var cx = x + bw / 2, yy = top + 6;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); setText(C.sigLabel); doc.text(label, cx, yy, { align: 'center' });
      if (img) { try { doc.addImage(img, 'PNG', cx - 22, yy + 1.5, 44, 16, undefined, 'FAST'); } catch (e) {} }
      yy += 19;
      setDraw([192, 200, 208]); doc.setLineWidth(0.3); doc.line(x + 6, yy, x + bw - 6, yy);
      yy += 4.5;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.6); setText(C.text);
      doc.text(name || '________________________________', cx, yy, { align: 'center' });
      yy += 6.5;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.8); setText(C.muted);
      doc.splitTextToSize(cargo || 'Nombre y cargo del cliente', bw - 8).slice(0, 2).forEach(function (ln, i) { doc.text(ln, cx, yy + i * 3.6, { align: 'center' }); });
      yy += 10;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setText(C.text);
      doc.text('Fecha: ' + (fmt(fecha) || '________'), cx, yy, { align: 'center' });
    }
    sig(L, 'PRESTADOR DE SERVICIO', d.prestFirma, d.prestNombre, d.prestCargo, d.prestFecha);
    sig(L + bw + gap, 'RECIBE CONFORME', d.recFirma, d.recNombre, d.recCargo, d.recFecha);
    y = top + bh + 6;

    var n = doc.getNumberOfPages();
    for (var p = 1; p <= n; p++) { doc.setPage(p); footer(p, n); }
    return doc;
  }

  root.buildReportPDF = buildReportPDF;
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildReportPDF: buildReportPDF };
})(typeof window !== 'undefined' ? window : globalThis);
