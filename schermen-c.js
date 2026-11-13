// Schermen: Agenda, Facturatie, Assistent, Instellingen en de Klantpagina (portaal).
(() => {
  const C = window.C;
  const { esc, i, eur } = C;

  // ---------- Agenda ----------
  const maandag = (d) => { const x = C.dagStart(d); const w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; };
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const itemsOp = (d) => C.db.planning.filter((x) => C.zelfdeDag(x.start, d)).sort((a, b) => a.start.localeCompare(b.start));
  const itemHtml = (x, sleep = false) => {
    const p = x.project ? C.project(x.project) : null;
    return `<button class="item item--${x.soort}" data-a="item" data-id="${x.id}" ${sleep ? 'draggable="true"' : ''}>${C.tijd(x.start)} ${esc(x.titel)}<small>${p ? esc(C.klant(p.klant).naam) : x.soort}</small></button>`;
  };
  C.S.agenda = (view = 'week', datum) => {
    const d = datum ? new Date(datum + 'T12:00') : new Date();
    const v = ['dag', 'week', 'maand'].includes(view) ? view : 'week';
    const stap = v === 'dag' ? 1 : v === 'week' ? 7 : 0;
    const vorige = v === 'maand' ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : plus(d, -stap);
    const volgende = v === 'maand' ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : plus(d, stap);
    let titel, body;
    if (v === 'dag') {
      titel = C.datum(d.toISOString(), { weekday: 'long', day: 'numeric', month: 'long' });
      const it = itemsOp(d);
      body = `<div class="kaart lijst">${it.map((x) => `<button class="rij" data-a="item" data-id="${x.id}"><span class="rij__hoofd"><span class="rij__titel">${esc(x.titel)}</span><span class="rij__sub">${C.tijd(x.start)} tot ${C.tijd(x.eind)}${x.project ? ' · ' + esc(C.project(x.project).adres) : ''}</span></span><span class="rij__eind">${x.soort}</span></button>`).join('') || '<p class="leeg">Niets gepland op deze dag.</p>'}</div>`;
    } else if (v === 'week') {
      const ma = maandag(d);
      titel = `Week ${weeknr(ma)} · ${C.datum(ma.toISOString(), { day: 'numeric', month: 'short' })} tot ${C.datum(plus(ma, 6).toISOString(), { day: 'numeric', month: 'short' })}`;
      body = `<div class="week">${Array.from({ length: 7 }, (_, n) => { const dd = plus(ma, n); const it = itemsOp(dd); const nu = C.zelfdeDag(dd, new Date());
        return `<section class="dag ${nu ? 'dag--vandaag' : ''}" data-dag="${C.isoDag(dd)}" aria-label="${C.datum(dd.toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}"><div class="dag__kop"><span>${C.datum(dd.toISOString(), { weekday: 'short' })}</span><span>${dd.getDate()} ${C.datum(dd.toISOString(), { month: 'short' })}</span></div><div class="dag__in">${it.map((x) => itemHtml(x, true)).join('')}</div></section>`; }).join('')}</div>
        <p class="klein" style="margin-top:10px">Op een groot scherm: sleep een blok naar een andere dag. Op de telefoon: tik op een blok en kies Verplaatsen.</p>`;
    } else {
      const eerste = new Date(d.getFullYear(), d.getMonth(), 1); const start = maandag(eerste);
      titel = C.datum(eerste.toISOString(), { month: 'long', year: 'numeric' });
      body = `<div class="maand">${['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((w) => `<div class="wd">${w}</div>`).join('')}${Array.from({ length: 42 }, (_, n) => { const dd = plus(start, n); const it = itemsOp(dd);
        return `<div class="${dd.getMonth() !== eerste.getMonth() ? 'buiten' : ''} ${C.zelfdeDag(dd, new Date()) ? 'nu' : ''}"><a href="#/agenda/dag/${C.isoDag(dd)}" style="text-decoration:none" aria-label="${C.datum(dd.toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}, ${it.length} items">${dd.getDate()}</a>${it.slice(0, 3).map((x) => `<span class="stip ${x.soort === 'afspraak' ? 'stip--afspraak' : ''}">${esc(x.titel)}</span>`).join('')}${it.length > 3 ? `<span class="klein">+${it.length - 3}</span>` : ''}</div>`; }).join('')}</div>`;
    }
    return {
      titel: 'Agenda', nav: 'agenda',
      html: `<div class="ag-balk"><div class="ag-nav"><a class="ib" href="#/agenda/${v}/${C.isoDag(vorige)}" aria-label="Vorige">${i('links')}</a><b>${titel}</b><a class="ib" href="#/agenda/${v}/${C.isoDag(volgende)}" aria-label="Volgende">${i('chev')}</a></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><nav class="chips" style="margin:0;padding:0" aria-label="Weergave">${[['dag', 'Dag'], ['week', 'Week'], ['maand', 'Maand']].map(([k, n]) => `<a class="chip" href="#/agenda/${k}/${C.isoDag(d)}" ${k === v ? 'aria-current="true"' : ''}>${n}</a>`).join('')}</nav><a class="chip" href="#/agenda/${v}/${C.isoDag(new Date())}">Vandaag</a><button class="knop knop--messing" data-a="formulier" data-form="afspraak">${i('plus', 'i--s')} Inplannen</button></div></div>${body}`,
      na: () => {
        let sleep = null;
        C.$$('.item[draggable]').forEach((el) => el.addEventListener('dragstart', (e) => { sleep = el.dataset.id; e.dataTransfer.setData('text/plain', sleep); e.dataTransfer.effectAllowed = 'move'; }));
        C.$$('[data-dag]').forEach((dg) => {
          dg.addEventListener('dragover', (e) => { if (sleep) { e.preventDefault(); dg.classList.add('drop'); } });
          dg.addEventListener('dragleave', () => dg.classList.remove('drop'));
          dg.addEventListener('drop', (e) => { e.preventDefault(); dg.classList.remove('drop'); const x = C.get('planning', sleep); sleep = null; if (x) C.verplaats(x, dg.dataset.dag, false); });
        });
      },
    };
  };
  const weeknr = (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); };
  const naarWerkdag = (d) => { while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return d; };
  C.herberekenProject = (pid) => { const p = C.project(pid); if (!p) return; const w = C.db.planning.filter((x) => x.project === pid && x.soort === 'werk').sort((a, b) => a.start.localeCompare(b.start)); if (w.length) { p.start = w[0].start; p.eind = w[w.length - 1].eind; } };
  C.verplaats = (x, nieuweDag, ookRest, van, tot) => {
    const oud = new Date(x.start); const delta = Math.round((C.dagStart(nieuweDag + 'T12:00') - C.dagStart(oud)) / 864e5);
    const zet = (it, dagen, tv, tt) => {
      const s = new Date(it.start), e = new Date(it.eind); const duur = e - s;
      s.setDate(s.getDate() + dagen); if (it.soort === 'werk') naarWerkdag(s);
      if (tv) { const [h, m] = tv.split(':'); s.setHours(+h, +m); }
      let ne = new Date(s.getTime() + duur); if (tt) { ne = new Date(s); const [h, m] = tt.split(':'); ne.setHours(+h, +m); }
      it.start = s.toISOString(); it.eind = ne.toISOString();
    };
    const verplaatst = [x];
    zet(x, delta, van, tot);
    if (ookRest && x.project) C.db.planning.filter((y) => y.project === x.project && y.id !== x.id && new Date(y.start) > oud && y.soort !== 'herinnering').forEach((y) => { zet(y, delta); verplaatst.push(y); });
    if (x.project) { C.herberekenProject(x.project); C.log('planning', x.id, x.project, `Planning gewijzigd: ${x.titel} naar ${C.datum(x.start)}${verplaatst.length > 1 ? `, ${verplaatst.length - 1} vervolgonderdelen mee` : ''}`, true); }
    C.wijzig(verplaatst.length > 1 ? `${verplaatst.length} onderdelen verplaatst.` : 'Verplaatst.'); C.sluit(); C.route();
  };
  C.A.item = (el) => {
    const x = C.get('planning', el.dataset.id); if (!x) return;
    const p = x.project ? C.project(x.project) : null; const a = x.aanvraag ? C.get('aanvragen', x.aanvraag) : null;
    C.blad(x.titel, `<p><span class="tag">${esc(x.soort)}</span></p>
      <p style="margin-top:8px"><b>${C.datum(x.start, { weekday: 'long', day: 'numeric', month: 'long' })}</b>, ${C.tijd(x.start)} tot ${C.tijd(x.eind)}</p>
      ${p ? `<p style="margin-top:6px"><a href="#/projecten/${p.id}" data-a="ganaar">${esc(p.naam)} · ${esc(C.klant(p.klant).naam)}</a><br><a href="${C.kaartLink(p.adres)}" target="_blank" rel="noopener">${esc(p.adres)}</a></p>` : ''}
      ${a ? `<p style="margin-top:6px"><a href="#/aanvragen/${a.id}" data-a="ganaar">Aanvraag ${a.nummer} · ${esc(a.naam)}</a></p>` : ''}
      <form class="form kaart kaart--pad" data-f="verplaats" style="margin-top:14px" novalidate><input type="hidden" name="id" value="${x.id}"><span class="maat">Verplaatsen</span>
        <div class="rij3"><label class="veld"><span>Datum</span><input class="inp" type="date" name="datum" value="${C.isoDag(x.start)}" required></label><label class="veld"><span>Van</span><input class="inp" type="time" name="van" value="${C.tijd(x.start)}"></label><label class="veld"><span>Tot</span><input class="inp" type="time" name="tot" value="${C.tijd(x.eind)}"></label></div>
        ${p ? '<label class="vink"><input type="checkbox" name="rest"><span>Ook de rest van dit project evenveel dagen opschuiven</span></label>' : ''}
        <p class="fout" id="fout-v" role="alert"></p><button class="knop knop--messing">${i('verplaats', 'i--s')} Verplaatsen</button></form>
      <button class="knop knop--rood" style="margin-top:14px" data-a="itemWeg" data-id="${x.id}">Uit de agenda halen</button>`);
  };
  C.F.verplaats = (f, d) => { if (!d.datum) { C.$('#fout-v').textContent = 'Kies een datum.'; return; } if (d.van && d.tot && d.tot <= d.van) { C.$('#fout-v').textContent = 'De eindtijd ligt voor de begintijd.'; return; } C.verplaats(C.get('planning', d.id), d.datum, !!d.rest, d.van, d.tot); };
  C.A.itemWeg = async (el) => { const x = C.get('planning', el.dataset.id); if (!(await C.bevestig('Uit de agenda halen?', `<p>${esc(x.titel)}, ${C.datum(x.start)}</p>`, 'Verwijderen'))) return; C.db.planning = C.db.planning.filter((y) => y.id !== x.id); if (x.project) { C.herberekenProject(x.project); C.log('planning', null, x.project, `Uit de planning gehaald: ${x.titel}`); } C.sluit(); C.wijzig('Uit de agenda gehaald.'); C.route(); };

  // ---------- Facturatie ----------
  const fRegels = (f) => f.regels.map(([omschrijving, aantal, prijs, btw]) => ({ omschrijving, aantal, prijs, btw }));
  C.S.facturatie = () => {
    const klaar = C.teFactureren();
    const per = (s) => C.db.facturen.filter((f) => f.status === s);
    const fr = (f) => { const p = C.project(f.project); const r = C.reken(fRegels(f)); return `<button class="rij" data-a="factuurOpen" data-id="${f.id}"><span class="rij__hoofd"><span class="rij__titel">${f.nummer} · ${esc(p.naam)}</span><span class="rij__sub">${esc(C.klant(p.klant).naam)} · ${C.datum(f.datum)}${f.status === 'verstuurd' ? ` · ${-C.dagenTot(f.verstuurd || f.datum)} dagen open` : ''}</span></span><span class="rij__eind"><span class="bedrag">${eur(r.incl)}</span><br>${C.st('factuur', f.status)}</span></button>`; };
    return {
      titel: 'Facturatie',
      html: `<div class="melding melding--blauw"><b>Geen tweede boekhouding.</b> Nog onbekend welk boekhoudpakket MSBouw gebruikt. De app maakt conceptfacturen uit offerte en goedgekeurd meerwerk, en exporteert ze. Een koppeling met het pakket volgt zodra dat bekend is.</div>
      <div class="kop"><div><span class="maat">${klaar.length}</span><h2>Klaar om te factureren</h2></div></div>
      <div class="kaart lijst">${klaar.map((x) => `<div class="rij"><span class="rij__hoofd"><span class="rij__titel">${esc(x.titel)}</span><span class="rij__sub">${esc(x.sub)}</span></span><button class="knop knop--messing" data-a="factuurMaken" data-project="${x.project}">Concept maken</button></div>`).join('') || '<p class="leeg">Niets klaar om te factureren. Een project verschijnt hier na de oplevering.</p>'}</div>
      <div class="kop"><div><span class="maat">Facturen</span><h2>Overzicht</h2></div><button class="link" data-a="csvExport">${i('download', 'i--s')} Exporteer CSV</button></div>
      ${['concept', 'verstuurd', 'betaald'].map((s) => `<h3 class="klein" style="margin:14px 0 6px;text-transform:uppercase;letter-spacing:.12em;font-weight:700">${C.ST.factuur[s][0]} (${per(s).length})</h3><div class="kaart lijst">${per(s).map(fr).join('') || '<p class="leeg">Geen.</p>'}</div>`).join('')}`,
    };
  };
  C.A.factuurMaken = (el) => {
    const p = C.project(el.dataset.project); const o = p.offerte ? C.get('offertes', p.offerte) : null;
    const regels = [];
    if (o && !C.db.facturen.some((f) => f.project === p.id && f.soort === 'eind')) [...new Set(o.regels.map((r) => r.sectie))].forEach((s) => { const rs = o.regels.filter((r) => r.sectie === s); const btw = rs[0].btw; regels.push([`${o.titel}: ${s} (offerte ${o.nummer})`, 1, rs.reduce((t, r) => t + C.regelTotaal(r), 0), btw]); });
    C.db.meerwerk.filter((m) => m.project === p.id && m.status === 'akkoord' && !m.gefactureerd).forEach((m) => { regels.push([`Meerwerk ${m.nummer}: ${m.omschrijving}`, 1, m.prijs, m.btw]); m.gefactureerd = true; });
    if (!o && !C.db.facturen.some((f) => f.project === p.id && f.soort === 'eind')) {
      // geen offerte: regie volgens de registratie van uren en materiaal
      const min = C.db.uren.filter((u) => u.project === p.id).reduce((s, u) => s + u.minuten, 0);
      if (min) regels.push([`Arbeid volgens urenregistratie (${C.uren(min)})`, 1, Math.round((min / 60) * C.db.instellingen.uurtarief), 21]);
      C.db.materialen.filter((m) => m.project === p.id && m.prijs > 0).forEach((m) => regels.push([`${m.omschrijving} (${String(m.aantal).replace('.', ',')} ${m.eenheid})`, 1, C.regelTotaal(m), 21]));
    }
    if (!regels.length) { C.toast('Er is niets om te factureren: geen offerte, uren of materiaal met prijs.', 'let'); return; }
    const f = { id: C.id('fa'), nummer: C.nummer('F'), project: p.id, soort: 'eind', status: 'concept', datum: new Date().toISOString(), regels };
    C.db.facturen.push(f); C.log('factuur', f.id, p.id, `Conceptfactuur ${f.nummer} gemaakt`); C.wijzig('Conceptfactuur gemaakt.'); C.route(); C.A.factuurOpen({ dataset: { id: f.id } });
  };
  C.A.factuurOpen = (el) => {
    const f = C.get('facturen', el.dataset.id); const p = C.project(f.project); const r = C.reken(fRegels(f));
    C.blad(`Factuur ${f.nummer}`, `<p>${C.st('factuur', f.status)} · ${esc(p.naam)} · ${esc(C.klant(p.klant).naam)}</p>
      <table class="tabel" style="margin-top:12px"><thead><tr><th>Omschrijving</th><th class="r">Btw</th><th class="r">Bedrag</th></tr></thead><tbody>${fRegels(f).map((x) => `<tr><td>${esc(x.omschrijving)}</td><td class="r">${x.btw}%</td><td class="r">${eur(C.regelTotaal(x))}</td></tr>`).join('')}</tbody></table>
      <div class="totalen" style="padding:12px 0"><div><span>Totaal excl. btw</span><b>${eur(r.excl)}</b></div>${r.tarieven.map((t) => `<div class="klein"><span>Btw ${t.t}%</span><span>${eur(t.btw)}</span></div>`).join('')}<div class="groot"><span>Totaal incl. btw</span><span>${eur(r.incl)}</span></div></div>
      <div class="knoppen">${f.status === 'concept' ? `<button class="knop knop--messing" data-a="factuurStatus" data-id="${f.id}" data-s="verstuurd">${i('send', 'i--s')} Markeer als verstuurd</button>` : ''}${f.status === 'verstuurd' ? `<button class="knop knop--messing" data-a="factuurStatus" data-id="${f.id}" data-s="betaald">${i('vink', 'i--s')} Markeer als betaald</button>` : ''}<button class="knop knop--rand" data-a="csvExport" data-id="${f.id}">${i('download', 'i--s')} CSV</button></div>
      <p class="klein" style="margin-top:10px">In de MVP: PDF in de huisstijl, export als UBL-factuur, en versturen alleen na uw bevestiging. Het juiste factuurnummer en de btw-regels bevestigt de boekhouder.</p>`);
  };
  C.A.factuurStatus = async (el) => {
    const f = C.get('facturen', el.dataset.id);
    if (el.dataset.s === 'verstuurd' && !(await C.bevestig('Factuur als verstuurd markeren?', '<p>Doe dit pas als de factuur echt naar de klant is gegaan (vanuit uw boekhoudpakket of per mail).</p>', 'Markeer verstuurd'))) return;
    f.status = el.dataset.s; f[el.dataset.s] = new Date().toISOString(); C.log('factuur', f.id, f.project, `Factuur ${f.nummer}: ${C.ST.factuur[f.status][0].toLowerCase()}`); C.sluit(); C.wijzig('Factuur bijgewerkt.'); C.route();
  };
  C.A.csvExport = (el) => {
    const lijst = el.dataset.id ? [C.get('facturen', el.dataset.id)] : C.db.facturen;
    const rijen = [['factuurnummer', 'datum', 'klant', 'project', 'omschrijving', 'btw_tarief', 'bedrag_excl', 'btw_bedrag', 'status']];
    lijst.forEach((f) => { const p = C.project(f.project); fRegels(f).forEach((x) => { const ex = C.regelTotaal(x); rijen.push([f.nummer, C.isoDag(f.datum), C.klant(p.klant).naam, p.nummer, x.omschrijving, x.btw, (ex / 100).toFixed(2).replace('.', ','), (Math.round(ex * x.btw / 100) / 100).toFixed(2).replace('.', ','), f.status]); }); });
    const csv = '﻿' + rijen.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `facturen-${C.isoDag(new Date())}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    C.toast('CSV gedownload (puntkomma-gescheiden, voor Excel en boekhoudpakketten).', 'download');
  };

  // ---------- Assistent ----------
  const OPDR = [
    ['samenvatting', 'Projectsamenvatting maken', 'map'], ['taken', 'Openstaande taken samenvatten', 'lijst'], ['klantbericht', 'Klantbericht netjes formuleren', 'bericht'], ['offerte', 'Offerteconcept uit notities', 'file'],
    ['werkbon', 'Werkbon naar conceptverslag', 'bon'], ['overzicht', 'Uren en materiaal op een rij', 'klok'], ['checklist', 'Checklist voor een soort renovatie', 'oplever'], ['omschrijving', 'Projectomschrijving schrijven', 'pen'],
  ];
  C.S.assistent = () => ({
    titel: 'Assistent',
    html: `<div class="melding"><b>Concepten, geen beslissingen.</b> De assistent werkt alleen met gegevens uit deze app, maakt concepten en laat de bron zien. Versturen, prijzen vastzetten, akkoord geven en betalen doet hij nooit. <br><span class="klein">Preview: antwoorden worden opgebouwd uit de voorbeeldgegevens. In de MVP schrijft een taalmodel het concept.</span></div>
      <div class="kop"><div><span class="maat">Opdrachten</span><h2>Waarmee kan ik helpen?</h2></div></div>
      <div class="ai-opdr">${OPDR.map(([k, t, ic]) => `<button data-a="aiKies" data-k="${k}">${i(ic)}<span>${t}</span></button>`).join('')}</div>
      <div id="ai-in"></div><div id="ai-uit" class="ai-uit" aria-live="polite"></div>`,
  });
  const projSel = (naam = 'project') => `<label class="veld"><span>Project</span><select class="inp" name="${naam}">${C.db.projecten.map((p) => `<option value="${p.id}" ${p.id === C.vandaagWerk()?.id ? 'selected' : ''}>${esc(p.naam)} · ${esc(C.klant(p.klant).naam)}</option>`).join('')}</select></label>`;
  C.A.aiKies = (el) => {
    const k = el.dataset.k; const t = OPDR.find((x) => x[0] === k)[1];
    const velden = {
      samenvatting: projSel(), omschrijving: projSel(), overzicht: projSel(), taken: '<p class="sub">Alle lopende projecten.</p>',
      klantbericht: `<label class="veld"><span>Aan</span><select class="inp" name="klant">${C.db.klanten.map((x) => `<option value="${x.id}">${esc(x.naam)}</option>`).join('')}</select></label><label class="veld"><span>Wat wilt u zeggen? (in uw eigen woorden)</span><textarea class="inp" name="tekst" rows="3" placeholder="bv. tegels vloer pas donderdag binnen, dus vloer schuift 1 dag op, rest blijft gelijk"></textarea></label>`,
      offerte: `<label class="veld"><span>Klant</span><select class="inp" name="klant">${C.db.klanten.filter((x) => x.soort !== 'verzekeraar').map((x) => `<option value="${x.id}">${esc(x.naam)}</option>`).join('')}</select></label><label class="veld"><span>Notities van de opname</span><textarea class="inp" name="tekst" rows="4" placeholder="bv. toilet beneden slopen 4 uur, hangtoilet plaatsen 6 uur, wandtegels 8 m2, vloertegels 2 m2, afvoer verleggen"></textarea></label>`,
      werkbon: `<label class="veld"><span>Werkbon</span><select class="inp" name="werkbon">${C.db.werkbonnen.map((w) => `<option value="${w.id}">${w.nummer} · ${esc(C.project(w.project).naam)} · ${C.datum(w.datum)}</option>`).join('')}</select></label>`,
      checklist: `<label class="veld"><span>Soort werk</span><select class="inp" name="soort">${Object.entries(C.SJ_NAMEN).filter(([x]) => x !== 'leeg').map(([x, n]) => `<option value="${x}">${n}</option>`).join('')}</select></label>`,
    }[k];
    C.$('#ai-in').innerHTML = `<form class="kaart kaart--pad form" data-f="ai" style="margin-top:16px"><input type="hidden" name="k" value="${k}"><span class="maat">${t}</span>${velden}<button class="knop">${i('spark', 'i--s')} Concept maken</button></form>`;
    C.$('#ai-uit').innerHTML = '';
    C.$('#ai-in').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const zinnen = (t) => t.trim().split(/(?<=[.!?])\s+|\n+|,\s*(?=[a-z])/).map((s) => s.trim()).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? '' : '.')).join(' ');
  C.F.ai = (f, d) => {
    if (C.isOffline()) { C.toast('De assistent werkt alleen met verbinding.', 'offline'); return; }
    let tekst = '', bron = '', actie = '';
    const p = d.project ? C.project(d.project) : null;
    if (d.k === 'samenvatting' || d.k === 'omschrijving') {
      const k = C.klant(p.klant); const t = C.db.taken.filter((x) => x.project === p.id); const open = t.filter((x) => !x.klaar);
      const mw = C.db.meerwerk.filter((m) => m.project === p.id); const u = C.db.uren.filter((x) => x.project === p.id).reduce((s, x) => s + x.minuten, 0);
      tekst = d.k === 'samenvatting'
        ? `${p.naam} bij ${k.naam} (${p.adres})\nStatus: ${C.ST.project[p.status][0]}${p.start ? `, gepland van ${C.datum(p.start)} tot ${C.datum(p.eind)}` : ''}.\n\nGedaan: ${t.filter((x) => x.klaar).map((x) => x.titel.toLowerCase()).join(', ') || 'nog niets afgevinkt'}.\nNog te doen: ${open.map((x) => x.titel.toLowerCase()).join(', ') || 'niets'}.\nUren tot nu toe: ${C.uren(u)}.\nMeerwerk: ${mw.length ? mw.map((m) => `${m.omschrijving} (${C.ST.meerwerk[m.status][0].toLowerCase()})`).join('; ') : 'geen'}.`
        : `${p.naam}: ${p.omschrijving || ''}\n\nWerkzaamheden: ${t.map((x) => x.titel.toLowerCase()).join(', ')}. Eén vast aanspreekpunt: Marcus van der Stel.`;
      bron = `Project ${p.nummer}, ${t.length} taken, uren en meerwerk van dit project.`; actie = 'notitie';
    } else if (d.k === 'taken') {
      const lp = C.db.projecten.filter((x) => ['uitvoering', 'gepland', 'oplevering', 'wacht', 'voorbereiding'].includes(x.status));
      tekst = lp.map((x) => { const o = C.db.taken.filter((t) => t.project === x.id && !t.klaar); return `${x.naam} (${C.klant(x.klant).naam}): ${o.length ? o.map((t) => t.titel + (t.deadline ? ` [${C.relatief(t.deadline)}]` : '')).join('; ') : 'geen open taken'}`; }).join('\n');
      bron = `${lp.length} lopende projecten, taken met deadline.`;
    } else if (d.k === 'klantbericht') {
      const k = C.klant(d.klant); if (!d.tekst.trim()) { C.toast('Schrijf eerst kort wat u wilt zeggen.', 'let'); return; }
      tekst = `Beste ${k.naam.replace(/\s*\(vb\)/, '')},\n\n${zinnen(d.tekst)}\n\nHeeft u vragen, bel me gerust.\n\nMet vriendelijke groet,\nMarcus van der Stel\nMSBouw\n${C.db.instellingen.tel}`;
      bron = 'Uw eigen tekst, opnieuw opgemaakt. Lees na voor u het verstuurt.';
    } else if (d.k === 'offerte') {
      if (!d.tekst.trim()) { C.toast('Plak of typ eerst de notities.', 'let'); return; }
      const regels = d.tekst.split(/\n|,|;/).map((s) => s.trim()).filter(Boolean).map((s) => {
        const uur = s.match(/(\d+(?:[.,]\d+)?)\s*(uur|u)\b/i), m2 = s.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²)/i), st = s.match(/^(\d+)\s*x?\s+/i);
        const oms = s.replace(/(\d+(?:[.,]\d+)?)\s*(uur|u|m2|m²)\b/i, '').replace(/^\d+\s*x?\s+/, '').trim();
        const naam = oms[0] ? oms[0].toUpperCase() + oms.slice(1) : s;
        if (uur) return { soort: 'arbeid', omschrijving: naam, aantal: Number(uur[1].replace(',', '.')), eenheid: 'uur' };
        if (m2) return { soort: 'materiaal', omschrijving: naam, aantal: Number(m2[1].replace(',', '.')), eenheid: 'm²' };
        if (st) return { soort: 'materiaal', omschrijving: naam, aantal: Number(st[1]), eenheid: 'st' };
        return { soort: 'arbeid', omschrijving: naam, aantal: 0, eenheid: 'uur' };
      });
      C._aiRegels = { klant: d.klant, regels };
      tekst = regels.map((r) => `${r.soort === 'arbeid' ? 'Arbeid' : 'Materiaal'}: ${r.omschrijving} · ${r.aantal ? String(r.aantal).replace('.', ',') + ' ' + r.eenheid : 'aantal invullen'} · prijs: ${r.soort === 'arbeid' ? 'uw uurtarief' : 'invullen'}`).join('\n');
      bron = 'Alleen uw notities. Materiaalprijzen vult u zelf in; de assistent kiest geen prijzen.'; actie = 'offerte';
    } else if (d.k === 'werkbon') {
      const w = C.get('werkbonnen', d.werkbon); const wp = C.project(w.project);
      tekst = `Werkverslag ${C.datum(w.datum, { weekday: 'long', day: 'numeric', month: 'long' })}\n${wp.naam}, ${C.klant(wp.klant).naam}\n\nVandaag is ${C.uren(w.minuten).replace(' u', ' uur')} gewerkt. ${w.werkzaamheden}${w.materiaal.length ? `\nGebruikt materiaal: ${w.materiaal.map(([o, n, e]) => `${n} ${e} ${o.toLowerCase()}`).join(', ')}.` : ''}${w.bijzonderheden ? `\nBijzonderheden: ${w.bijzonderheden}` : ''}${w.openstaand ? `\nNog open: ${w.openstaand}` : ''}`;
      bron = `Werkbon ${w.nummer}.`; actie = 'notitie'; d.project = wp.id;
    } else if (d.k === 'overzicht') {
      const u = C.db.uren.filter((x) => x.project === p.id); const m = C.db.materialen.filter((x) => x.project === p.id);
      tekst = `Uren ${p.naam}: ${C.uren(u.reduce((s, x) => s + x.minuten, 0))}\n${u.map((x) => `- ${C.datum(x.datum)}: ${C.uren(x.minuten)} ${x.omschrijving || ''}`).join('\n')}\n\nMateriaal: ${eur(m.reduce((s, x) => s + C.regelTotaal(x), 0))} excl.\n${m.map((x) => `- ${x.aantal} ${x.eenheid} ${x.omschrijving} (${C.ST.materiaal[x.status][0].toLowerCase()})`).join('\n')}`;
      bron = `${u.length} urenregels en ${m.length} materiaalregels van ${p.nummer}.`;
    } else if (d.k === 'checklist') {
      const L = { badkamer: ['Opname: maten, leidingen, afvoer, ventilatie', 'Keuze tegels, sanitair, kranen vastgelegd', 'Sloop en afvoer puin geregeld', 'Leidingwerk en afvoer getest op lekkage', 'Waterdichting in natte zones', 'Tegelwerk, voegen, kitwerk', 'Sanitair, spots, ventilatie werkend', 'Eindfoto’s en onderhoudsinfo voor de klant'], trap: ['Treden en stootborden opgemeten', 'Materiaal en kleur gekozen, besteld', 'Oude bekleding verwijderen', 'Treden en stootborden plaatsen', 'Trapgat afwerken', 'Onderhoudsadvies'], dakraam: ['Maat en type dakraam gekozen', 'Levertijd en planning afgestemd', 'Plaatsen en waterdicht aansluiten', 'Aftimmering binnen', 'Bediening uitgelegd'], schade: ["Schadefoto's met datum", 'Schadenummer en opdrachtgever vastgelegd', 'Offerte naar verzekeraar', 'Akkoord verzekeraar', 'Herstel en afwerking', "Foto's na herstel"], maatwerk: ['Maten en ontwerp vastgelegd', 'Materiaal en beslag gekozen', 'Werkplaats: maken', 'Plaatsen en afstellen'] }[d.soort];
      tekst = L.map((x) => '[ ] ' + x).join('\n'); bron = 'Vaste lijst per soort werk (uit de sjablonen van de app); vul aan met uw eigen ervaring.';
    }
    C.$('#ai-uit').innerHTML = `<div class="kaart kaart--pad"><span class="maat">Concept</span><pre style="margin-top:10px">${esc(tekst)}</pre><p class="ai-bron">Bron: ${esc(bron)}</p>
      <div class="knoppen" style="margin-top:10px"><button class="knop knop--rand" data-a="aiKopie">${i('kopie', 'i--s')} Kopiëren</button>${actie === 'notitie' ? `<button class="knop" data-a="aiNotitie" data-project="${d.project}">Opslaan als notitie bij het project</button>` : ''}${actie === 'offerte' ? '<button class="knop knop--messing" data-a="aiOfferte">Maak er een conceptofferte van</button>' : ''}</div></div>`;
    C._aiTekst = tekst;
  };
  C.A.aiKopie = async () => { try { await navigator.clipboard.writeText(C._aiTekst); C.toast('Gekopieerd.'); } catch (e) { C.toast('Kopiëren lukt niet in deze browser; selecteer de tekst.', 'let'); } };
  C.A.aiNotitie = async (el) => { if (!(await C.bevestig('Opslaan als notitie?', `<p>Het concept komt als notitie in de tijdlijn van het project. Controleer de tekst eerst.</p><pre style="white-space:pre-wrap;font:inherit;margin-top:8px">${esc(C._aiTekst)}</pre>`, 'Opslaan'))) return; C.log('notitie', null, el.dataset.project, C._aiTekst); C.wijzig('Notitie opgeslagen bij het project.'); };
  C.A.aiOfferte = async () => {
    const x = C._aiRegels; if (!x) return;
    if (!(await C.bevestig('Conceptofferte maken?', `<p>${x.regels.length} regels worden een conceptofferte voor ${esc(C.klant(x.klant).naam)}. Er wordt niets verstuurd; u vult de prijzen en controleert alles.</p>`, 'Concept maken'))) return;
    const k = C.klant(x.klant); const o = C.nieuweOfferte(k, 'Offerte (uit notities)', 'leeg', [k.straat, k.plaats].filter(Boolean).join(', '));
    o.regels = x.regels.map((r) => ({ sectie: 'Werkzaamheden', soort: r.soort, omschrijving: r.omschrijving, aantal: r.aantal, eenheid: r.eenheid, prijs: r.soort === 'arbeid' ? C.db.instellingen.uurtarief : 0, btw: 21 }));
    C.wijzig('Conceptofferte gemaakt uit de notities.'); C.ga(`#/offertes/${o.id}`);
  };
  C.A.aiWerkbon = (el) => { C.sluit(); C.ga('#/assistent'); setTimeout(() => { C.A.aiKies({ dataset: { k: 'werkbon' } }); const s = C.$('[name=werkbon]'); s.value = el.dataset.id; }, 50); };

  // ---------- Instellingen ----------
  C.S.instellingen = () => {
    const s = C.db.instellingen;
    const veld = (n, t, ph = '') => `<label class="veld"><span>${t}${!s[n] ? ' <span class="tag tag--rood">ontbreekt</span>' : ''}</span><input class="inp" name="${n}" value="${esc(s[n])}" placeholder="${ph}"></label>`;
    return {
      titel: 'Instellingen',
      html: `<div class="grid2 grid2--gelijk"><div>
        <form class="kaart kaart--pad form" data-f="instellingen"><span class="maat">Bedrijf</span>
          ${veld('bedrijf', 'Bedrijfsnaam')}${veld('eigenaar', 'Eigenaar')}<div class="rij2">${veld('tel', 'Telefoon')}${veld('mail', 'E-mail')}</div>${veld('adres', 'Adres', 'Straat, postcode')}${veld('plaats', 'Plaats')}
          <div class="rij2">${veld('kvk', 'KvK-nummer')}${veld('btwnr', 'Btw-nummer')}</div>${veld('iban', 'IBAN')}
          <label class="veld"><span>Algemene voorwaarden (tekst of verwijzing)${!s.voorwaarden ? ' <span class="tag tag--rood">ontbreekt</span>' : ''}</span><textarea class="inp" name="voorwaarden" rows="2">${esc(s.voorwaarden)}</textarea></label>
          <span class="maat" style="margin-top:8px">Offertes</span>
          <div class="rij2"><label class="veld"><span>Uurtarief excl. btw <span class="tag">voorbeeld</span></span><input class="inp" name="uurtarief" inputmode="decimal" value="${(s.uurtarief / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}"></label><label class="veld"><span>Geldigheid (dagen)</span><input class="inp" name="geldigheid" inputmode="numeric" value="${s.geldigheid}"></label></div>
          <p class="klein">Naam, telefoon en e-mail komen van de website. De rest is nog niet bekend en vult Marcus in.</p>
          <p class="fout" id="fout-i" role="alert"></p><button class="knop">Opslaan</button></form>
      </div><div>
        <div class="kaart kaart--pad"><span class="maat">Gebruikers en rollen</span>
          <table class="tabel" style="margin-top:8px"><tbody><tr><td>Marcus van der Stel</td><td>Eigenaar: alles</td></tr><tr><td class="sub">Medewerker</td><td class="sub">Projecten, werkbonnen, foto's, uren. Geen prijzen, offertes of facturen.</td></tr><tr><td class="sub">Alleen lezen</td><td class="sub">Bijvoorbeeld de boekhouder.</td></tr></tbody></table>
          <button class="knop knop--rand" style="margin-top:10px" disabled>Medewerker uitnodigen (in de MVP)</button></div>
        <div class="kaart kaart--pad" style="margin-top:12px"><span class="maat">App op de telefoon</span>
          <p style="margin-top:8px"><b>Android (Samsung):</b> open in Chrome, menu met drie puntjes, <i>App installeren</i> of <i>Toevoegen aan startscherm</i>.<br><b>iPhone:</b> open in Safari, deelknop, <i>Zet op beginscherm</i>.</p>
          <button class="knop knop--messing" style="margin-top:10px" data-a="installeer" ${C._installeer ? '' : 'hidden'}>${i('download', 'i--s')} Nu installeren</button></div>
        <div class="kaart kaart--pad" style="margin-top:12px"><span class="maat">Gegevens</span>
          <div class="knoppen" style="margin-top:10px"><button class="knop knop--rand" data-a="sync">${i('offline', 'i--s')} Offline proberen</button><button class="knop knop--rand" data-a="backup">${i('download', 'i--s')} Back-up downloaden</button><button class="knop knop--rood" data-a="reset">Voorbeeldgegevens opnieuw laden</button></div>
          <p class="klein" style="margin-top:10px">Preview: alles staat alleen in deze browser (localStorage). In de MVP staat het in een eigen database met dagelijkse versleutelde back-up, en zijn bewaartermijnen ingesteld (administratie 7 jaar, aanvragen zonder opdracht korter).</p></div>
      </div></div>`,
    };
  };
  C.F.instellingen = (f, d) => {
    const t = C.parseEur(d.uurtarief); const g = Number(d.geldigheid);
    if (Number.isNaN(t) || t < 0) { C.$('#fout-i').textContent = 'Ongeldig uurtarief.'; return; }
    if (!(g > 0 && g < 366)) { C.$('#fout-i').textContent = 'Geldigheid tussen 1 en 365 dagen.'; return; }
    if (d.mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.mail)) { C.$('#fout-i').textContent = 'Het e-mailadres klopt niet.'; return; }
    Object.assign(C.db.instellingen, { ...d, uurtarief: t, geldigheid: g }); C.wijzig('Instellingen opgeslagen.'); C.route();
  };
  C.A.backup = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(C.db, null, 2)], { type: 'application/json' })); a.download = `ms-bouw-cockpit-preview-${C.isoDag(new Date())}.json`; a.click(); C.toast('Back-up gedownload.', 'download'); };
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); C._installeer = e; });
  C.A.installeer = async () => { if (!C._installeer) return; C._installeer.prompt(); await C._installeer.userChoice; C._installeer = null; C.route(); };

  // ---------- Klantpagina (portaal) ----------
  C.S.portaal = (pid, sub, subId) => {
    const p = C.project(pid);
    const balk = `<div class="vb" role="note"><b>Voorbeeld</b> Zo ziet de klant zijn projectpagina: alleen dit project, zonder account, via een beveiligde link. <a href="#/projecten/${pid || ''}" style="color:inherit;font-weight:700">Terug naar Cockpit</a></div>`;
    if (p && p.portaal && (sub === 'offerte' || sub === 'oplevering')) {
      const o = sub === 'offerte' ? C.get('offertes', subId) : null;
      if (sub === 'offerte' && (!o || o.klant !== p.klant)) return `${balk}<div class="portaal__in"><p class="leeg">Dit document hoort niet bij uw project.</p></div>`;
      const inner = sub === 'offerte' ? C.S.offerteA4(subId).html : C.S.opleverdocument(pid).html;
      return `${balk}<div class="portaal__in" style="max-width:900px"><div class="a4-werkbalk"><a class="knop knop--rand" href="#/portaal/${pid}">${i('terug', 'i--s')} Terug naar uw projectpagina</a><button class="knop" onclick="print()">${i('print', 'i--s')} Afdrukken of opslaan als PDF</button></div>${inner.replace(/<div class="a4-werkbalk">[\s\S]*?<\/div>/, '')}</div>`;
    }
    if (!p || !p.portaal) return `${balk}<div class="portaal"><div class="portaal__kop dark"><a class="merk" href="#">${C.LOGO}<span><b>MSBouw</b><i>Projectpagina</i></span></a></div><div class="portaal__in"><h1 class="h1">Deze link werkt niet (meer)</h1><p class="sub" style="margin-top:8px">Vraag Marcus om een nieuwe link: ${esc(C.db.instellingen.tel)}.</p></div></div>`;
    const k = C.klant(p.klant); const f = C.fase(p);
    const wacht = [];
    C.db.offertes.filter((o) => o.klant === k.id && o.status === 'verstuurd' && (!o.project || o.project === p.id)).forEach((o) => wacht.push({ type: 'offerte', id: o.id, titel: `Offerte ${o.nummer}: ${o.titel}`, bedrag: C.reken(o.regels).incl }));
    C.db.meerwerk.filter((m) => m.project === p.id && m.status === 'verstuurd').forEach((m) => wacht.push({ type: 'meerwerk', id: m.id, titel: `Meerwerk ${m.nummer}: ${m.omschrijving}`, bedrag: m.prijs + Math.round(m.prijs * m.btw / 100) }));
    const afspr = C.db.planning.filter((x) => x.project === p.id && ['werk', 'afspraak'].includes(x.soort) && new Date(x.eind) >= C.dagStart(new Date())).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 5);
    const o = p.offerte ? C.get('offertes', p.offerte) : null; const op = C.db.opleveringen.find((x) => x.project === p.id);
    const fotos = C.db.fotos.filter((x) => x.project === p.id && ['tijdens', 'eind', 'begin'].includes(x.categorie)).slice(-6);
    const ber = C.db.berichten.filter((b) => b.project === p.id).sort((a, b) => a.op.localeCompare(b.op));
    const mwAk = C.db.meerwerk.filter((m) => m.project === p.id && m.status === 'akkoord');
    const docs = (p.documenten || []).filter((d) => d.klant);
    const statusTekst = { voorbereiding: 'We bereiden uw project voor: planning en materialen.', gepland: `Uw project staat gepland${p.start ? ` vanaf ${C.datum(p.start, { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}.`, uitvoering: 'Marcus is bezig met de uitvoering.', wacht: 'Uw project wacht even (bijvoorbeeld op materiaal of een akkoord).', oplevering: 'Het werk is bijna klaar. We plannen de oplevering met u.', nazorg: 'Uw project is opgeleverd. Bedankt!', afgerond: 'Uw project is afgerond.' }[p.status];
    return `${balk}<div class="portaal"><header class="portaal__kop dark"><div style="max-width:760px;margin:0 auto"><a class="merk" href="#/portaal/${p.id}">${C.LOGO}<span><b>MSBouw</b><i>Uw projectpagina</i></span></a>
      <span class="maat">${esc(k.naam)}</span><h1 class="h1" style="margin-top:8px">${esc(p.naam)}</h1><p style="color:var(--on-dark);margin-top:4px">${esc(p.adres)}</p>
      <div class="stappen" role="list" aria-label="Voortgang">${C.FASEN.map((n, x) => `<div role="listitem" class="${x < f ? 'on' : x === f ? 'nu' : ''}">${n}${x === f ? '<span class="sr"> (nu)</span>' : ''}</div>`).join('')}</div></div></header>
      <main class="portaal__in">
        <p style="font-size:18px">${statusTekst}</p>
        ${wacht.length ? `<div class="kop"><div><span class="maat">Uw akkoord</span><h2>Wacht op u</h2></div></div>${wacht.map((w) => `<div class="kaart kaart--pad" style="margin-bottom:10px;border-left:4px solid var(--brass)"><b>${esc(w.titel)}</b><p style="margin-top:4px">Totaal incl. btw: <b>${eur(w.bedrag)}</b></p><div class="knoppen" style="margin-top:10px"><button class="knop knop--messing knop--groot" data-a="portaalAkkoord" data-type="${w.type}" data-id="${w.id}" data-project="${p.id}">Bekijken en akkoord geven</button></div></div>`).join('')}` : ''}
        <div class="kop"><div><span class="maat">Planning</span><h2>Afspraken</h2></div></div>
        <div class="kaart lijst">${afspr.map((x) => `<div class="rij"><span class="rij__hoofd"><span class="rij__titel">${C.datum(x.start, { weekday: 'long', day: 'numeric', month: 'long' })}</span><span class="rij__sub">${C.tijd(x.start)} tot ${C.tijd(x.eind)} · ${esc(x.titel)}</span></span></div>`).join('') || '<p class="leeg">Geen afspraken gepland.</p>'}</div>
        <div class="kop"><div><span class="maat">Dossier</span><h2>Documenten</h2></div></div>
        <div class="kaart lijst">${o ? `<a class="rij" href="#/portaal/${p.id}/offerte/${o.id}">${i('file')}<span class="rij__hoofd"><span class="rij__titel">Offerte ${o.nummer}</span><span class="rij__sub">${o.status === 'akkoord' ? 'Akkoord gegeven' : C.ST.offerte[o.status][0]}</span></span></a>` : ''}
          ${mwAk.map((m) => `<div class="rij">${i('slot')}<span class="rij__hoofd"><span class="rij__titel">Meerwerk ${m.nummer}</span><span class="rij__sub">${esc(m.omschrijving)} · akkoord</span></span></div>`).join('')}
          ${op ? `<a class="rij" href="#/portaal/${p.id}/oplevering">${i('oplever')}<span class="rij__hoofd"><span class="rij__titel">Opleverdocument en consumentendossier</span><span class="rij__sub">${op.akkoord ? 'Opgeleverd' : 'In voorbereiding'}</span></span></a>` : ''}
          ${docs.map((d) => `<div class="rij">${i('file')}<span class="rij__hoofd"><span class="rij__titel">${esc(d.naam)}</span></span></div>`).join('')}
          ${!o && !op && !mwAk.length && !docs.length ? '<p class="leeg">Nog geen documenten.</p>' : ''}</div>
        ${fotos.length ? `<div class="kop"><div><span class="maat">Voortgang</span><h2>Foto's</h2></div></div><div class="fotos">${fotos.map((x) => `<span class="foto" role="img" aria-label="${esc(x.omschrijving)}" style="background-image:url(${x.src})"></span>`).join('')}</div>` : ''}
        <div class="kop"><div><span class="maat">Contact</span><h2>Berichten</h2></div></div>
        <div class="kaart kaart--pad">${ber.length ? `<ol class="tl">${ber.map((b) => `<li><time>${b.richting === 'van' ? 'U' : 'Marcus'} · ${C.datum(b.op)} ${C.tijd(b.op)}</time><p>${esc(b.tekst)}</p></li>`).join('')}</ol>` : '<p class="sub">Nog geen berichten.</p>'}
          <form class="form" data-f="portaalBericht" style="margin-top:10px"><input type="hidden" name="project" value="${p.id}"><label class="veld"><span>Stel een vraag aan Marcus</span><textarea class="inp" name="tekst" rows="2" required></textarea></label><button class="knop">${i('send', 'i--s')} Versturen</button></form></div>
        <p class="klein" style="margin-top:20px">Liever bellen? ${esc(C.db.instellingen.tel)} · ${esc(C.db.instellingen.mail)}<br>U ziet hier alleen uw eigen project. Deze pagina gebruikt geen cookies voor reclame.</p>
      </main></div>`;
  };
  C.A.portaalAkkoord = (el) => {
    const { type, id } = el.dataset;
    const x = type === 'offerte' ? C.get('offertes', id) : C.get('meerwerk', id);
    const inhoud = type === 'offerte'
      ? (() => { const r = C.reken(x.regels); return `<p><b>${esc(x.titel)}</b> · ${x.nummer}</p><table class="tabel" style="margin-top:8px"><tbody>${x.regels.map((q) => `<tr><td>${esc(q.omschrijving)}</td><td class="r">${eur(C.regelTotaal(q))}</td></tr>`).join('')}</tbody></table><div class="totalen" style="padding:10px 0"><div><span>Excl. btw</span><span>${eur(r.excl)}</span></div><div><span>Btw</span><span>${eur(r.btw)}</span></div><div class="groot"><span>Totaal</span><span>${eur(r.incl)}</span></div></div>`; })()
      : `<p><b>${esc(x.omschrijving)}</b> · ${x.nummer}</p><div class="totalen" style="padding:10px 0"><div><span>Meerprijs excl. btw</span><span>${eur(x.prijs)}</span></div><div><span>Btw ${x.btw}%</span><span>${eur(Math.round(x.prijs * x.btw / 100))}</span></div><div class="groot"><span>Totaal</span><span>${eur(x.prijs + Math.round(x.prijs * x.btw / 100))}</span></div></div>`;
    C.blad('Akkoord geven', `${inhoud}<form class="form" data-f="portaalAkkoord" novalidate><input type="hidden" name="type" value="${type}"><input type="hidden" name="id" value="${id}"><input type="hidden" name="project" value="${el.dataset.project}">
      <label class="veld"><span>Uw naam</span><input class="inp" name="naam" required autocomplete="name"></label>
      <label class="vink"><input type="checkbox" name="ok" required><span>Ik ga akkoord met ${type === 'offerte' ? 'deze offerte' : 'dit meerwerk'} en de prijs hierboven.</span></label>
      <p class="klein">In de echte app krijgt u voor de zekerheid nog een code per e-mail. We bewaren uw naam, het tijdstip en een vaste kopie van wat u goedkeurt.</p>
      <p class="fout" id="fout-pa" role="alert"></p><button class="knop knop--messing knop--groot">Akkoord geven</button></form>`);
  };
  C.F.portaalAkkoord = async (f, d) => {
    if (!d.naam.trim() || !d.ok) { C.$('#fout-pa').textContent = 'Vul uw naam in en vink het akkoord aan.'; return; }
    if (C.isOffline()) { C.$('#fout-pa').textContent = 'Geen verbinding. Probeer het opnieuw zodra u internet heeft.'; return; }
    const x = d.type === 'offerte' ? C.get('offertes', d.id) : C.get('meerwerk', d.id);
    const snap = d.type === 'offerte' ? { nummer: x.nummer, regels: x.regels, totaal: C.reken(x.regels) } : { nummer: x.nummer, omschrijving: x.omschrijving, prijs: x.prijs, btw: x.btw };
    const ak = await C.maakAkkoord(d.type, x.id, d.naam.trim(), 'link', snap);
    x.status = 'akkoord'; x.akkoord = ak.id;
    C.db.berichten.push({ id: C.id('b'), project: d.project, richting: 'van', tekst: `Akkoord gegeven op ${d.type} ${x.nummer}.`, op: ak.op, gelezen: false });
    C.log('akkoord', ak.id, d.project, `${d.type === 'offerte' ? 'Offerte' : 'Meerwerk'} ${x.nummer} akkoord gegeven door ${ak.naam} via de projectpagina`, true);
    C.sluit(); C.wijzig('Bedankt, uw akkoord is vastgelegd.'); C.route();
  };
  C.F.portaalBericht = (f, d) => { if (!d.tekst.trim()) return; C.db.berichten.push({ id: C.id('b'), project: d.project, richting: 'van', tekst: d.tekst.trim(), op: new Date().toISOString(), gelezen: false }); C.log('bericht', null, d.project, 'Bericht van klant via de projectpagina'); C.wijzig('Uw bericht is verstuurd.'); C.route(); };
})();
