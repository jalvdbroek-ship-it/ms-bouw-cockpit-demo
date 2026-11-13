// Schermen: Projecten, projectomgeving (tabbladen), Vastleggen en de snelle formulieren.
(() => {
  const C = window.C;
  const { esc, i, eur } = C;
  const CAT = { begin: 'Beginsituatie', tijdens: 'Tijdens werk', eind: 'Eindresultaat', schade: 'Schade of bijzonderheid', overig: 'Overig' };
  C.CAT = CAT;

  // ---------- Projecten ----------
  C.S.projecten = (id, tab) => {
    if (id) return C.S.project(id, tab || 'overzicht');
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('status') || 'lopend';
    const LOPEND = ['voorbereiding', 'gepland', 'uitvoering', 'wacht', 'oplevering'];
    const lijst = C.db.projecten.filter((p) => f === 'lopend' ? LOPEND.includes(p.status) : f === 'alle' || p.status === f);
    const filt = [['lopend', 'Lopend'], ['alle', 'Alle'], ...Object.entries(C.ST.project).map(([k, [n]]) => [k, n])];
    const n = (k) => k === 'lopend' ? C.db.projecten.filter((p) => LOPEND.includes(p.status)).length : k === 'alle' ? C.db.projecten.length : C.db.projecten.filter((p) => p.status === k).length;
    return {
      titel: 'Projecten',
      html: `<div class="kop"><div><span class="maat">${n('lopend')} lopend</span><h2>Projecten</h2></div><a class="knop knop--rand" href="#/offertes?status=akkoord">Uit offerte</a></div>
      <nav class="chips" aria-label="Filter">${filt.filter(([k]) => n(k) || ['lopend', 'alle'].includes(k)).map(([k, t]) => `<a class="chip" href="#/projecten?status=${k}" ${k === f ? 'aria-current="true"' : ''}>${t} <span class="tel">${n(k)}</span></a>`).join('')}</nav>
      <div class="pkaarten pkaarten--3" style="margin-top:12px">${lijst.map(C.pkaart).join('') || '<p class="leeg kaart">Geen projecten met deze status.</p>'}</div>`,
    };
  };

  const TABS = [['overzicht', 'Overzicht'], ['tijdlijn', 'Tijdlijn'], ['fotos', "Foto's"], ['werkbonnen', 'Werkbonnen'], ['materiaal', 'Uren en materiaal'], ['meerwerk', 'Meerwerk'], ['oplevering', 'Oplevering'], ['documenten', 'Documenten']];
  C.S.project = (id, tab) => {
    if (tab === 'opleverdocument') return C.S.opleverdocument(id);
    const p = C.project(id); if (!p) return { titel: 'Niet gevonden', terug: '#/projecten', html: '<p class="leeg">Dit project bestaat niet.</p>' };
    const k = C.klant(p.klant);
    const tel = { fotos: C.db.fotos.filter((f) => f.project === id).length, werkbonnen: C.db.werkbonnen.filter((w) => w.project === id).length, meerwerk: C.db.meerwerk.filter((m) => m.project === id).length };
    const inhoud = (C.T[tab] || C.T.overzicht)(p, k);
    return {
      titel: p.naam, terug: '#/projecten', nav: 'projecten',
      html: `<header class="pkop dark"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><span class="maat">${p.nummer}</span>${C.st('project', p.status, p.wachtOp || '')}</div>
        <h1>${esc(p.naam)}</h1>
        <div class="pkop__meta"><a href="#/klanten/${k.id}">${esc(k.naam)}</a><a href="${C.kaartLink(p.adres)}" target="_blank" rel="noopener">${esc(p.adres)}</a><span>${p.start ? `${C.datum(p.start, { day: 'numeric', month: 'short' })} tot ${C.datum(p.eind, { day: 'numeric', month: 'short' })}` : 'Nog niet ingepland'}</span></div>
        ${C.voortgang(p)}
        <nav class="ptabs" aria-label="Onderdelen van het project">${TABS.map(([t, n]) => `<a href="#/projecten/${p.id}/${t}" ${t === tab ? 'aria-current="page"' : ''}>${n}${tel[t] ? ` <span class="tel">${tel[t]}</span>` : ''}</a>`).join('')}</nav></header>
        <div class="ptab-in">${inhoud.html}</div>`,
      na: () => { const a = C.$('.ptabs [aria-current]'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'center' }); inhoud.na && inhoud.na(); },
    };
  };

  C.T = {};
  C.T.overzicht = (p, k) => {
    const taken = C.db.taken.filter((t) => t.project === p.id);
    const open = taken.filter((t) => !t.klaar);
    const plan = C.db.planning.filter((x) => x.project === p.id && new Date(x.eind) >= C.dagStart(new Date())).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 4);
    const ber = C.db.berichten.filter((b) => b.project === p.id).sort((a, b) => a.op.localeCompare(b.op));
    const o = p.offerte ? C.get('offertes', p.offerte) : null;
    const mwAk = C.db.meerwerk.filter((m) => m.project === p.id && m.status === 'akkoord').reduce((s, m) => s + m.prijs, 0);
    const urenMin = C.db.uren.filter((u) => u.project === p.id).reduce((s, u) => s + u.minuten, 0);
    const matKost = C.db.materialen.filter((m) => m.project === p.id).reduce((s, m) => s + C.regelTotaal(m), 0);
    const opdr = p.opdrachtgever ? C.klant(p.opdrachtgever) : null;
    return {
      html: `<div class="grid2"><div>
        ${p.omschrijving ? `<p>${esc(p.omschrijving)}</p>` : ''}
        ${opdr ? `<div class="melding melding--blauw" style="margin-top:12px"><b>Opdrachtgever:</b> <a href="#/klanten/${opdr.id}">${esc(opdr.naam)}</a> · schadenummer ${esc(p.schadenummer)}<br><span class="klein">Bewoner: ${esc(k.naam)}</span></div>` : ''}
        <div class="kop"><div><span class="maat">${open.length} open van ${taken.length}</span><h2>Taken</h2></div></div>
        <div class="kaart lijst">${taken.map((t) => `<label class="vink rij" style="min-height:56px"><input type="checkbox" data-a="taak" data-id="${t.id}" ${t.klaar ? 'checked' : ''}><span class="rij__hoofd"><span class="rij__titel" style="white-space:normal">${esc(t.titel)}</span>${t.deadline && !t.klaar ? `<span class="rij__sub">${C.relatief(t.deadline)}</span>` : ''}</span></label>`).join('')}
          <form class="rij" data-f="taak" style="gap:8px"><input type="hidden" name="project" value="${p.id}"><input class="inp" name="titel" placeholder="Nieuwe taak" aria-label="Nieuwe taak" required><input class="inp" type="date" name="deadline" aria-label="Deadline" style="max-width:160px"><button class="knop" aria-label="Taak toevoegen">${i('plus', 'i--s')}</button></form></div>
        <div class="kop"><div><span class="maat">Klant</span><h2>Berichten</h2></div><a href="#/portaal/${p.id}">Klantpagina bekijken</a></div>
        <div class="kaart kaart--pad">${ber.length ? `<ol class="tl" style="padding-left:28px">${ber.map((b) => `<li><time>${b.richting === 'van' ? esc(k.naam) : 'Marcus'} · ${C.datum(b.op)} ${C.tijd(b.op)}</time><p>${esc(b.tekst)}</p></li>`).join('')}</ol>` : '<p class="sub">Nog geen berichten.</p>'}
          ${p.portaal ? `<form class="form" data-f="bericht" style="margin-top:10px"><input type="hidden" name="project" value="${p.id}"><label class="veld"><span>Bericht aan ${esc(k.naam)}</span><textarea class="inp" name="tekst" rows="2" required></textarea><small>Verschijnt op de projectpagina van de klant. Preview: er gaat geen e-mail uit.</small></label><button class="knop">${i('send', 'i--s')} Versturen</button></form>` : '<p class="klein" style="margin-top:8px">Klantpagina staat uit voor dit project.</p>'}
        </div>
      </div><div>
        <div class="kaart kaart--pad"><span class="maat">Status</span>
          <label class="veld" style="margin-top:10px"><span class="sr">Status</span><select class="inp" data-pstatus>${Object.entries(C.ST.project).map(([s, [n]]) => `<option value="${s}" ${s === p.status ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <div class="knoppen" style="margin-top:12px"><button class="knop" data-a="formulier" data-form="afspraak" data-project="${p.id}">${i('cal', 'i--s')} Inplannen</button><a class="knop knop--rand" href="tel:${C.normTel(k.tel)}">${i('tel', 'i--s')} Bel</a><a class="knop knop--rand" href="${C.kaartLink(p.adres)}" target="_blank" rel="noopener">${i('pin', 'i--s')} Route</a></div></div>
        <div class="kop"><div><span class="maat">Planning</span><h2>Komt eraan</h2></div><a href="#/agenda">Agenda</a></div>
        <div class="kaart lijst">${plan.map((x) => `<button class="rij" data-a="item" data-id="${x.id}"><span class="rij__hoofd"><span class="rij__titel">${esc(x.titel)}</span><span class="rij__sub">${C.datum(x.start)} · ${C.tijd(x.start)} tot ${C.tijd(x.eind)}</span></span><span class="rij__eind">${x.soort}</span></button>`).join('') || '<p class="leeg">Niets ingepland.</p>'}</div>
        <div class="kop"><div><span class="maat">Geld</span><h2>Overzicht</h2></div></div>
        <div class="kaart totalen">
          ${o ? `<div><span>Offerte <a href="#/offertes/${o.id}">${o.nummer}</a></span><b>${eur(C.reken(o.regels).excl)}</b></div>` : '<div><span>Geen offerte gekoppeld</span><span></span></div>'}
          <div><span>Meerwerk met akkoord</span><b>${eur(mwAk)}</b></div>
          <div class="klein"><span>Uren geregistreerd</span><span>${C.uren(urenMin)}</span></div>
          <div class="klein"><span>Materiaalkosten geregistreerd</span><span>${eur(matKost)}</span></div>
          <div class="klein" style="margin-top:6px">Bedragen excl. btw. Voorbeeldbedragen.</div></div>
      </div></div>`,
      na: () => C.$('[data-pstatus]').addEventListener('change', (e) => { p.status = e.target.value; if (p.status !== 'wacht') delete p.wachtOp; C.log('project', p.id, p.id, `Status: ${C.ST.project[p.status][0]}`, true); C.wijzig('Projectstatus bijgewerkt.'); C.route(); }),
    };
  };
  C.F.taak = (f, d) => { if (!d.titel.trim()) return; C.db.taken.push({ id: C.id('t'), project: d.project, titel: d.titel.trim(), klaar: null, deadline: d.deadline ? new Date(d.deadline + 'T17:00').toISOString() : null }); C.wijzig('Taak toegevoegd.'); C.route(); };
  C.F.bericht = (f, d) => {
    if (C.isOffline()) { C.toast('Berichten aan klanten gaan pas weg met verbinding.', 'offline'); return; }
    if (!d.tekst.trim()) return;
    C.db.berichten.filter((b) => b.project === d.project).forEach((b) => { b.gelezen = true; });
    C.db.berichten.push({ id: C.id('b'), project: d.project, richting: 'naar', tekst: d.tekst.trim(), op: new Date().toISOString(), gelezen: true });
    C.log('bericht', null, d.project, 'Bericht aan klant gestuurd'); C.wijzig('Bericht geplaatst op de klantpagina.'); C.route();
  };

  C.T.tijdlijn = (p) => {
    const items = C.db.activiteit.filter((a) => a.project === p.id).sort((a, b) => b.op.localeCompare(a.op));
    let dagNu = '';
    return { html: `<div class="kaart kaart--pad" style="max-width:760px"><ol class="tl">${items.map((a) => {
      const d = C.datum(a.op, { weekday: 'long', day: 'numeric', month: 'long' });
      const kop = d !== dagNu ? `<li class="tl-dag" style="list-style:none">${d}</li>` : ''; dagNu = d;
      const foto = a.type === 'foto' ? C.get('fotos', a.id) : null;
      return `${kop}<li class="${a.groot ? 'groot' : ''}"><time>${C.tijd(a.op)} · ${a.type}</time><p>${esc(a.tekst)}</p>${foto ? `<div class="duim"><img src="${foto.src}" alt="${esc(foto.omschrijving)}"></div>` : ''}</li>`;
    }).join('') || '<li>Nog geen gebeurtenissen.</li>'}</ol></div>` };
  };

  // ---------- foto's ----------
  C.T.fotos = (p) => {
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('cat') || 'alle';
    const alle = C.db.fotos.filter((x) => x.project === p.id);
    const lijst = alle.filter((x) => f === 'alle' || x.categorie === f).sort((a, b) => b.datum.localeCompare(a.datum));
    const paren = {}; alle.forEach((x) => { if (x.paar) (paren[x.paar] = paren[x.paar] || []).push(x); });
    let paar = Object.values(paren).find((v) => v.length === 2);
    if (!paar) { const b = alle.find((x) => x.categorie === 'begin'), e = alle.filter((x) => x.categorie === 'eind').slice(-1)[0]; if (b && e) paar = [b, e]; }
    if (paar) paar.sort((a, b) => (a.categorie === 'begin' ? -1 : 1));
    return {
      html: `<div class="kop"><div><span class="maat">${alle.length} foto's</span><h2>Foto's</h2></div><button class="knop knop--messing" data-a="formulier" data-form="foto" data-project="${p.id}">${i('camera', 'i--s')} Foto toevoegen</button></div>
        <nav class="chips" aria-label="Categorie">${[['alle', 'Alle'], ...Object.entries(CAT)].map(([k, n]) => `<a class="chip" href="#/projecten/${p.id}/fotos?cat=${k}" ${k === f ? 'aria-current="true"' : ''}>${n} <span class="tel">${k === 'alle' ? alle.length : alle.filter((x) => x.categorie === k).length}</span></a>`).join('')}</nav>
        ${paar && f === 'alle' ? `<div class="kop"><div><span class="maat">Vergelijk</span><h2>Voor en na</h2></div></div><div class="vgl kaart" style="max-width:520px;--pos:50%"><img src="${paar[0].src}" alt="Voor: ${esc(paar[0].omschrijving)}"><img class="na" src="${paar[1].src}" alt="Na: ${esc(paar[1].omschrijving)}"><span class="lab lab--v">Voor</span><span class="lab lab--n">Na</span><input type="range" min="0" max="100" value="50" aria-label="Schuif tussen voor en na" data-vgl></div>` : ''}
        <div class="fotos" style="margin-top:14px">${lijst.map((x) => `<button class="foto" style="background-image:url(${x.src})" data-a="fotoOpen" data-id="${x.id}" aria-label="${esc(CAT[x.categorie])}: ${esc(x.omschrijving)}"><span>${esc(CAT[x.categorie])}</span>${x.social !== 'nee' ? `<span class="soc">${x.social === 'goedgekeurd' ? 'Social' : 'Kandidaat'}</span>` : ''}</button>`).join('')}</div>
        ${!lijst.length ? `<div class="leeg kaart">Nog geen foto's in deze categorie.<br><button class="knop" data-a="formulier" data-form="foto" data-project="${p.id}">${i('camera', 'i--s')} Eerste foto maken</button></div>` : ''}`,
      na: () => { const r = C.$('[data-vgl]'); if (r) r.addEventListener('input', () => r.parentElement.style.setProperty('--pos', r.value + '%')); },
    };
  };
  C.A.fotoOpen = (el) => {
    const f = C.get('fotos', el.dataset.id); const p = C.project(f.project); const k = C.klant(p.klant);
    C.blad(CAT[f.categorie], `<img src="${f.src}" alt="${esc(f.omschrijving)}" style="width:100%;max-height:52vh;object-fit:contain;background:#222">
      <p style="margin-top:10px"><b>${esc(f.omschrijving || 'Geen omschrijving')}</b><br><span class="klein">${C.datum(f.datum, { weekday: 'long', day: 'numeric', month: 'long' })} · ${C.tijd(f.datum)} · ${esc(p.naam)}</span></p>
      <label class="veld" style="margin-top:12px"><span>Categorie</span><select class="inp" data-fcat="${f.id}">${Object.entries(CAT).map(([c, n]) => `<option value="${c}" ${c === f.categorie ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <div class="kaart kaart--pad" style="margin-top:14px"><span class="maat">Social media</span>
        <p style="margin-top:8px">Status: <b>${({ nee: 'Niet geselecteerd', kandidaat: 'Kandidaat', goedgekeurd: 'Goedgekeurd voor social' })[f.social]}</b></p>
        ${f.social === 'goedgekeurd' ? `<button class="knop knop--rand" style="margin-top:10px" data-a="socialUit" data-id="${f.id}">Selectie intrekken</button>` : `<form class="form" data-f="social" style="margin-top:10px"><input type="hidden" name="id" value="${f.id}">
          <label class="vink"><input type="checkbox" name="t" ${k.toestemmingFotos ? 'checked disabled' : 'disabled'}><span>Klant gaf toestemming (${k.toestemmingFotos ? 'vastgelegd op de klantkaart' : '<b>nog niet vastgelegd</b>, zie klantkaart'})</span></label>
          <label class="vink"><input type="checkbox" name="p1" required><span>Geen personen, kentekens, huisnummers of persoonlijke spullen herkenbaar</span></label>
          <label class="vink"><input type="checkbox" name="p2" required><span>Laat echt werk van MSBouw zien, niet bewerkt tot iets wat het niet is</span></label>
          <button class="knop" ${k.toestemmingFotos ? '' : 'disabled'}>Goedkeuren voor social media</button>${k.toestemmingFotos ? '' : '<p class="klein">Zonder toestemming kan een foto alleen kandidaat blijven.</p>'}</form>`}
      </div>
      <button class="knop knop--rood" style="margin-top:14px" data-a="fotoWeg" data-id="${f.id}">Foto verwijderen</button>`);
    C.$('[data-fcat]').addEventListener('change', (e) => { f.categorie = e.target.value; C.wijzig('Categorie aangepast.'); C.route(); });
  };
  C.F.social = (form, d) => { const f = C.get('fotos', d.id); f.social = 'goedgekeurd'; C.log('foto', f.id, f.project, 'Foto goedgekeurd voor social media (toestemming en privacycheck gedaan)'); C.sluit(); C.wijzig('Foto goedgekeurd voor social media.'); C.route(); };
  C.A.socialUit = (el) => { const f = C.get('fotos', el.dataset.id); f.social = 'nee'; C.sluit(); C.wijzig('Selectie ingetrokken.'); C.route(); };
  C.A.fotoWeg = async (el) => { if (!(await C.bevestig('Foto verwijderen?', '<p>De foto verdwijnt uit het project. Dit kan niet ongedaan worden gemaakt.</p>', 'Verwijderen'))) return; C.db.fotos = C.db.fotos.filter((x) => x.id !== el.dataset.id); C.sluit(); C.wijzig('Foto verwijderd.'); C.route(); };

  C.verklein = (file, max = 1280, q = 0.72) => new Promise((ok, nee) => {
    if (!file.type.startsWith('image/')) { nee(new Error('Geen afbeelding')); return; }
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', q)); };
    img.onerror = () => nee(new Error('Afbeelding kon niet worden gelezen'));
    img.src = url;
  });
  const fotoInvoer = (naam = 'foto') => `<div class="veld"><span>Foto's</span><label class="fotoknop">${i('camera')} Foto maken of kiezen<input type="file" accept="image/*" capture="environment" multiple data-fotos="${naam}"></label><div class="duim" data-duim="${naam}"></div></div>`;
  const koppelFotos = (bak) => C.$$('[data-fotos]').forEach((inp) => inp.addEventListener('change', async () => {
    for (const f of inp.files) { try { const url = await C.verklein(f); bak.push(url); C.$(`[data-duim="${inp.dataset.fotos}"]`).insertAdjacentHTML('beforeend', `<img src="${url}" alt="Nieuwe foto">`); } catch (e) { C.toast(e.message, 'let'); } }
    inp.value = '';
  }));
  const handtekening = () => `<div class="veld"><span>Handtekening klant (optioneel)</span><canvas class="handt" width="600" height="160" data-handt aria-label="Tekenvlak voor de handtekening van de klant"></canvas><div style="display:flex;gap:8px"><input class="inp" name="getekend" placeholder="Naam van de klant" autocomplete="off"><button type="button" class="knop knop--rand" data-wis>Wissen</button></div></div>`;
  const koppelHandtekening = () => {
    const c = C.$('[data-handt]'); if (!c) return { leeg: () => true };
    const x = c.getContext('2d'); x.lineWidth = 2.5; x.lineCap = 'round'; x.strokeStyle = '#0F1D3A'; let tekent = false, iets = false;
    const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)]; };
    c.addEventListener('pointerdown', (e) => { tekent = true; iets = true; c.setPointerCapture(e.pointerId); x.beginPath(); x.moveTo(...pos(e)); });
    c.addEventListener('pointermove', (e) => { if (!tekent) return; x.lineTo(...pos(e)); x.stroke(); });
    c.addEventListener('pointerup', () => { tekent = false; });
    C.$('[data-wis]').addEventListener('click', () => { x.clearRect(0, 0, c.width, c.height); iets = false; });
    return { leeg: () => !iets, url: () => c.toDataURL('image/png') };
  };

  // ---------- Vastleggen ----------
  const projOpties = (sel) => C.db.projecten.filter((p) => !['afgerond'].includes(p.status)).map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.naam)} · ${esc(C.klant(p.klant).naam)}</option>`).join('');
  const projKeuze = (sel) => `<div class="projkeuze dark">${i('map')}<label class="sr" for="pk">Project</label><select id="pk" name="project">${projOpties(sel)}</select></div>`;
  C.A.vastleggen = () => {
    const pid = (location.hash.match(/#\/projecten\/([^/?]+)/) || [])[1] || C.vandaagWerk()?.id;
    C.blad('Vastleggen', `${projKeuze(pid)}<div class="vastgrid">${[['camera', 'Foto', 'foto'], ['bon', 'Werkbon', 'werkbon'], ['klok', 'Uren', 'uren'], ['pakket', 'Materiaal', 'materiaal'], ['meerwerk', 'Meerwerk', 'meerwerk'], ['notitie', 'Notitie', 'notitie']].map(([ic, t, f]) => `<button data-a="formulier" data-form="${f}" data-uitkeuze="1">${i(ic)}${t}</button>`).join('')}</div>
      <div class="knoppen" style="margin-top:14px"><button class="knop knop--rand" data-a="formulier" data-form="aanvraag">${i('inbox', 'i--s')} Nieuwe aanvraag</button><button class="knop knop--rand" data-a="formulier" data-form="afspraak">${i('cal', 'i--s')} Afspraak</button></div>`);
  };
  C.A.formulier = (el) => {
    const keuze = el.dataset.uitkeuze ? C.$('#pk')?.value : null;
    const pid = keuze || el.dataset.project || (location.hash.match(/#\/projecten\/([^/?]+)/) || [])[1] || C.vandaagWerk()?.id;
    C.FORM[el.dataset.form](pid, el.dataset);
  };
  const vandaagIso = () => C.isoDag(new Date());
  const urenKeuze = (naam = 'uren', std = '8') => `<fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Uren</legend><div class="keuze">${['4', '6', '8', '9'].map((u) => `<label><input type="radio" name="${naam}" value="${u}" ${u === std ? 'checked' : ''}><span>${u} u</span></label>`).join('')}<label><input type="radio" name="${naam}" value="anders"><span>Anders</span></label></div><input class="inp" name="${naam}Anders" inputmode="decimal" placeholder="Aantal uren, bv. 7,5" aria-label="Ander aantal uren" style="margin-top:8px"></fieldset>`;
  const leesUren = (d, naam = 'uren') => { const v = d[naam] === 'anders' ? Number(String(d[naam + 'Anders'] || '').replace(',', '.')) : Number(d[naam]); return Number.isFinite(v) ? v : NaN; };

  C.FORM = {};
  C.FORM.foto = (pid) => {
    const bak = [];
    C.blad('Foto toevoegen', `<form class="form" data-f="fotos" novalidate>${projKeuze(pid)}${fotoInvoer()}
      <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Categorie</legend><div class="keuze">${Object.entries(CAT).map(([c, n]) => `<label><input type="radio" name="categorie" value="${c}" ${c === 'tijdens' ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>
      <label class="veld"><span>Omschrijving (optioneel)</span><input class="inp" name="omschrijving" placeholder="Bijvoorbeeld: afvoer verlegd"></label>
      <p class="fout" id="fout-f" role="alert"></p><button class="knop knop--messing knop--groot">Opslaan</button></form>`);
    koppelFotos(bak); C._fotobak = bak;
  };
  C.F.fotos = (f, d) => {
    const bak = C._fotobak || []; if (!bak.length) { C.$('#fout-f').textContent = 'Maak of kies eerst een foto.'; return; }
    bak.forEach((src) => { const id = C.id('f'); C.db.fotos.push({ id, project: d.project, categorie: d.categorie, src, omschrijving: d.omschrijving.trim(), datum: new Date().toISOString(), social: 'nee' }); C.log('foto', id, d.project, `Foto toegevoegd (${CAT[d.categorie]})${d.omschrijving ? ': ' + d.omschrijving.trim() : ''}`); });
    C.sluit(); C.wijzig(`${bak.length} ${bak.length === 1 ? 'foto' : "foto's"} opgeslagen bij het project.`); C.route();
  };

  C.FORM.werkbon = (pid) => {
    const p = C.project(pid); const bak = [];
    const taken = C.db.taken.filter((t) => t.project === pid && !t.klaar);
    const mats = C.db.materialen.filter((m) => m.project === pid && m.status !== 'verwerkt');
    C.blad('Werkbon', `<form class="form" data-f="werkbon" novalidate>${projKeuze(pid)}
      <label class="veld"><span>Datum</span><input class="inp" type="date" name="datum" value="${vandaagIso()}" required></label>
      ${urenKeuze()}
      ${taken.length ? `<fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Vandaag afgerond</legend>${taken.map((t) => `<label class="vink"><input type="checkbox" name="taak" value="${t.id}"><span>${esc(t.titel)}</span></label>`).join('')}</fieldset>` : ''}
      <label class="veld"><span>Uitgevoerde werkzaamheden</span><textarea class="inp" name="werkzaamheden" rows="3" placeholder="Kort: wat is er gedaan?"></textarea><small>Tip: gebruik de microfoon van het toetsenbord om te dicteren.</small></label>
      ${mats.length ? `<fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Gebruikt materiaal</legend>${mats.map((m) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)"><span>${esc(m.omschrijving)}<br><span class="klein">${m.aantal} ${esc(m.eenheid)} · ${C.ST.materiaal[m.status][0].toLowerCase()}</span></span><span class="teller"><button type="button" data-tel="-1" aria-label="Minder">−</button><output name="mat_${m.id}" data-mat="${m.id}">0</output><button type="button" data-tel="1" aria-label="Meer">+</button></span></div>`).join('')}</fieldset>` : ''}
      <label class="veld"><span>Ander materiaal (optioneel)</span><input class="inp" name="extraMat" placeholder="Bijvoorbeeld: 2 kokers kit"></label>
      ${fotoInvoer()}
      <label class="veld"><span>Bijzonderheden</span><textarea class="inp" name="bijzonderheden" rows="2"></textarea></label>
      <label class="veld"><span>Nog open</span><textarea class="inp" name="openstaand" rows="2"></textarea></label>
      ${handtekening()}
      <p class="fout" id="fout-wb" role="alert"></p>
      <button class="knop knop--messing knop--groot">Werkbon opslaan</button><p class="klein">Zonder bereik blijft de werkbon op de telefoon en gaat hij later vanzelf mee.</p></form>`);
    koppelFotos(bak); C._fotobak = bak; C._handt = koppelHandtekening();
    C.$$('[data-tel]').forEach((b) => b.addEventListener('click', () => { const o = b.parentElement.querySelector('output'); o.value = Math.max(0, Number(o.value) + Number(b.dataset.tel)); }));
  };
  C.F.werkbon = (f, d, fd) => {
    const u = leesUren(d); const taakIds = fd.getAll('taak');
    const fout = [];
    if (!d.datum) fout.push('Kies een datum.');
    if (!(u > 0 && u <= 24)) fout.push('Vul het aantal uren in (tussen 0 en 24).');
    if (!d.werkzaamheden.trim() && !taakIds.length && !(C._fotobak || []).length) fout.push('Vink een taak af, schrijf wat er gedaan is of voeg een foto toe.');
    C.$('#fout-wb').textContent = fout.join(' '); if (fout.length) return;
    const p = C.project(d.project); const op = new Date(d.datum + 'T' + new Date().toTimeString().slice(0, 5)).toISOString();
    const materiaal = [];
    C.$$('[data-mat]').forEach((o) => { const n = Number(o.value); if (n > 0) { const m = C.get('materialen', o.dataset.mat); materiaal.push([m.omschrijving, n, m.eenheid]); m.status = 'verwerkt'; } });
    if (d.extraMat.trim()) materiaal.push([d.extraMat.trim(), 1, 'post']);
    const taakNamen = taakIds.map((id) => { const t = C.get('taken', id); t.klaar = op; return t.titel; });
    const tekst = [taakNamen.length ? 'Afgerond: ' + taakNamen.join(', ') + '.' : '', d.werkzaamheden.trim()].filter(Boolean).join(' ');
    const handt = C._handt && !C._handt.leeg() ? C._handt.url() : null;
    const wb = { id: C.id('wb'), project: p.id, nummer: C.nummer('W'), datum: op, minuten: Math.round(u * 60), werkzaamheden: tekst, bijzonderheden: d.bijzonderheden.trim(), openstaand: d.openstaand.trim(), materiaal, getekend: handt ? (d.getekend.trim() || 'Klant') : null, handtekening: handt };
    C.db.werkbonnen.push(wb);
    C.db.uren.push({ id: C.id('u'), project: p.id, datum: op, minuten: wb.minuten, omschrijving: 'Werkbon ' + wb.nummer, werkbon: wb.id });
    (C._fotobak || []).forEach((src) => { const id = C.id('f'); C.db.fotos.push({ id, project: p.id, werkbon: wb.id, categorie: 'tijdens', src, omschrijving: 'Bij werkbon ' + wb.nummer, datum: op, social: 'nee' }); });
    C.log('werkbon', wb.id, p.id, `Werkbon ${wb.nummer}: ${C.uren(wb.minuten)}${taakNamen.length ? ', ' + taakNamen.length + ' taken afgerond' : ''}${wb.getekend ? ', getekend door ' + wb.getekend : ''}`);
    if (p.status === 'gepland' || p.status === 'voorbereiding') p.status = 'uitvoering';
    C.sluit(); C.wijzig(`Werkbon ${wb.nummer} opgeslagen.`); C.route();
  };

  C.FORM.uren = (pid) => C.blad('Uren', `<form class="form" data-f="uren" novalidate>${projKeuze(pid)}<label class="veld"><span>Datum</span><input class="inp" type="date" name="datum" value="${vandaagIso()}" required></label>${urenKeuze()}<label class="veld"><span>Omschrijving (optioneel)</span><input class="inp" name="omschrijving" placeholder="Bijvoorbeeld: tegelwerk"></label><p class="fout" id="fout-u" role="alert"></p><button class="knop knop--messing knop--groot">Uren opslaan</button></form>`);
  C.F.uren = (f, d) => {
    const u = leesUren(d); if (!(u > 0 && u <= 24)) { C.$('#fout-u').textContent = 'Vul het aantal uren in (tussen 0 en 24).'; return; }
    const op = new Date(d.datum + 'T12:00').toISOString();
    C.db.uren.push({ id: C.id('u'), project: d.project, datum: op, minuten: Math.round(u * 60), omschrijving: d.omschrijving.trim(), werkbon: null });
    C.log('uren', null, d.project, `${C.uren(u * 60)} geregistreerd${d.omschrijving ? ': ' + d.omschrijving.trim() : ''}`); C.sluit(); C.wijzig('Uren opgeslagen.'); C.route();
  };

  C.FORM.materiaal = (pid) => C.blad('Materiaal', `<form class="form" data-f="materiaal" novalidate>${projKeuze(pid)}
    <label class="veld"><span>Omschrijving</span><input class="inp" name="omschrijving" required placeholder="Bijvoorbeeld: tegellijm C2"></label>
    <div class="rij2"><label class="veld"><span>Aantal</span><input class="inp" name="aantal" inputmode="decimal" value="1"></label><label class="veld"><span>Eenheid</span><select class="inp" name="eenheid">${['st', 'm²', 'm', 'zak', 'koker', 'doos', 'post'].map((e) => `<option>${e}</option>`).join('')}</select></label></div>
    <div class="rij2"><label class="veld"><span>Prijs per eenheid excl. (optioneel)</span><input class="inp" name="prijs" inputmode="decimal" placeholder="0,00"></label><label class="veld"><span>Leverancier (optioneel)</span><input class="inp" name="leverancier"></label></div>
    <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Status</legend><div class="keuze">${Object.entries(C.ST.materiaal).map(([s, [n]], x) => `<label><input type="radio" name="status" value="${s}" ${x === 0 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>
    <div class="veld"><span>Bon of factuur (optioneel)</span><label class="fotoknop">${i('camera')} Foto van de bon<input type="file" accept="image/*,application/pdf" capture="environment" name="bon"></label></div>
    <p class="fout" id="fout-m" role="alert"></p><button class="knop knop--messing knop--groot">Opslaan</button></form>`);
  C.F.materiaal = (f, d) => {
    const fout = []; const aantal = Number(String(d.aantal).replace(',', '.')); const prijs = d.prijs ? C.parseEur(d.prijs) : 0;
    if (!d.omschrijving.trim()) fout.push('Vul een omschrijving in.'); if (!(aantal > 0)) fout.push('Aantal moet groter dan 0 zijn.'); if (Number.isNaN(prijs) || prijs < 0) fout.push('Ongeldige prijs.');
    C.$('#fout-m').textContent = fout.join(' '); if (fout.length) return;
    const bon = f.querySelector('[name=bon]').files[0];
    const m = { id: C.id('m'), project: d.project, omschrijving: d.omschrijving.trim(), aantal, eenheid: d.eenheid, prijs, leverancier: d.leverancier.trim(), status: d.status, bon: bon ? bon.name : null };
    C.db.materialen.push(m); C.log('materiaal', m.id, d.project, `Materiaal: ${m.aantal} ${m.eenheid} ${m.omschrijving} (${C.ST.materiaal[m.status][0].toLowerCase()})`); C.sluit(); C.wijzig('Materiaal opgeslagen.'); C.route();
  };

  C.FORM.meerwerk = (pid) => {
    const bak = []; const T = C.db.instellingen.uurtarief;
    C.blad('Meerwerk', `<form class="form" data-f="meerwerk" novalidate>${projKeuze(pid)}
      <label class="veld"><span>Wat is het extra werk?</span><textarea class="inp" name="omschrijving" rows="2" required placeholder="Bijvoorbeeld: extra nis in de douchewand"></textarea></label>
      ${fotoInvoer()}
      <div class="rij2"><label class="veld"><span>Extra uren</span><input class="inp" name="uren" inputmode="decimal" value="0" data-mw></label><label class="veld"><span>Materiaal excl.</span><input class="inp" name="materiaal" inputmode="decimal" value="0,00" data-mw></label></div>
      <div class="rij2"><label class="veld"><span>Meerprijs excl.</span><input class="inp" name="prijs" inputmode="decimal" value="0,00" data-prijs><small>Voorstel: uren × ${eur(T)} + materiaal. Pas aan als dat nodig is.</small></label><label class="veld"><span>Btw</span><select class="inp" name="btw" data-mw><option value="21">21%</option><option value="9">9%</option><option value="0">0%</option></select></label></div>
      <p class="melding melding--blauw" data-incl>Totaal incl. btw: ${eur(0)}</p>
      <p class="fout" id="fout-mw" role="alert"></p>
      <div class="knoppen"><button class="knop knop--rand" name="actie" value="concept">Opslaan als concept</button><button class="knop knop--messing" name="actie" value="vragen">Opslaan en akkoord vragen</button></div></form>`);
    koppelFotos(bak); C._fotobak = bak;
    const f = C.$('[data-f="meerwerk"]'); let handmatig = false;
    const reken = () => { const u = Number(String(f.uren.value).replace(',', '.')) || 0; const m = C.parseEur(f.materiaal.value) || 0; if (!handmatig) f.prijs.value = ((Math.round(u * T) + m) / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2 }); const p = C.parseEur(f.prijs.value) || 0; C.$('[data-incl]').textContent = 'Totaal incl. btw: ' + eur(p + Math.round(p * Number(f.btw.value) / 100)); };
    C.$$('[data-mw]', f).forEach((x) => x.addEventListener('input', reken)); f.prijs.addEventListener('input', () => { handmatig = true; reken(); });
  };
  C.F.meerwerk = async (f, d) => {
    const prijs = C.parseEur(d.prijs); const u = Number(String(d.uren).replace(',', '.')); const mat = C.parseEur(d.materiaal);
    const fout = []; if (!d.omschrijving.trim()) fout.push('Beschrijf het extra werk.'); if (!(prijs > 0)) fout.push('Vul een meerprijs in.'); if (!(u >= 0) || Number.isNaN(mat)) fout.push('Controleer uren en materiaal.');
    C.$('#fout-mw').textContent = fout.join(' '); if (fout.length) return;
    const m = { id: C.id('mw'), project: d.project, nummer: C.nummer('M'), omschrijving: d.omschrijving.trim(), minuten: Math.round(u * 60), materiaal: mat, prijs, btw: Number(d.btw), status: 'concept', datum: new Date().toISOString(), akkoord: null };
    C.db.meerwerk.push(m);
    (C._fotobak || []).forEach((src) => { const id = C.id('f'); C.db.fotos.push({ id, project: m.project, meerwerk: m.id, categorie: 'schade', src, omschrijving: 'Meerwerk ' + m.nummer, datum: m.datum, social: 'nee' }); });
    C.log('meerwerk', m.id, m.project, `Meerwerk ${m.nummer} vastgelegd: ${m.omschrijving}, ${eur(prijs)} excl.`);
    C.sluit(); C.wijzig('Meerwerk vastgelegd.');
    if (d.actie === 'vragen') await C.akkoordVragen(m);
    C.route();
  };
  C.akkoordVragen = async (m) => {
    const p = C.project(m.project); const k = C.klant(p.klant);
    if (C.isOffline()) { C.toast('Akkoord vragen kan alleen met verbinding. Het meerwerk staat als concept klaar.', 'offline'); return false; }
    const incl = m.prijs + Math.round(m.prijs * m.btw / 100);
    const ok = await C.bevestig('Akkoord vragen aan de klant?', `<p>${esc(k.naam)} krijgt een bericht met een link naar de projectpagina. Daar staat:</p>
      <div class="kaart kaart--pad" style="margin-top:10px"><b>${esc(m.omschrijving)}</b><div class="totalen" style="padding:8px 0 0"><div><span>Meerprijs excl. btw</span><span>${eur(m.prijs)}</span></div><div><span>Btw ${m.btw}%</span><span>${eur(incl - m.prijs)}</span></div><div class="groot"><span>Totaal</span><span>${eur(incl)}</span></div></div></div>
      <p class="klein" style="margin-top:10px">Preview: er wordt niets echt verstuurd. U kunt het akkoord zelf proberen op de klantpagina.</p>`, 'Akkoord vragen', 'messing');
    if (!ok) return false;
    m.status = 'verstuurd';
    C.db.berichten.push({ id: C.id('b'), project: p.id, richting: 'naar', tekst: `Meerwerk ${m.nummer} staat klaar voor uw akkoord: ${m.omschrijving}.`, op: new Date().toISOString(), gelezen: true });
    C.log('meerwerk', m.id, p.id, `Meerwerk ${m.nummer} ter akkoord verstuurd`, true); C.wijzig('Akkoordverzoek verstuurd (preview).');
    return true;
  };

  C.FORM.notitie = (pid) => C.blad('Notitie', `<form class="form" data-f="notitie" novalidate>${projKeuze(pid)}<label class="veld"><span>Notitie</span><textarea class="inp" name="tekst" rows="4" required autofocus placeholder="Wat wilt u onthouden?"></textarea></label><p class="fout" id="fout-n" role="alert"></p><button class="knop knop--messing knop--groot">Opslaan in de tijdlijn</button></form>`);
  C.F.notitie = (f, d) => { if (!d.tekst.trim()) { C.$('#fout-n').textContent = 'De notitie is leeg.'; return; } C.log('notitie', null, d.project, d.tekst.trim()); C.sluit(); C.wijzig('Notitie opgeslagen.'); C.route(); };

  C.FORM.aanvraag = () => C.blad('Nieuwe aanvraag', `<form class="form" data-f="aanvraag" novalidate>
    <label class="veld"><span>Naam</span><input class="inp" name="naam" required autocomplete="off"></label>
    <div class="rij2"><label class="veld"><span>Telefoon</span><input class="inp" name="tel" type="tel" inputmode="tel"></label><label class="veld"><span>E-mail</span><input class="inp" name="mail" type="email" inputmode="email"></label></div>
    <label class="veld"><span>Adres (optioneel)</span><input class="inp" name="adres" placeholder="Straat en huisnummer, plaats"></label>
    <label class="veld"><span>Soort werk</span><select class="inp" name="dienst">${['Complete renovatie', 'Verbouwing', 'Badkamer of toilet', 'Traprenovatie', 'Maatwerk timmerwerk', 'Gevel of buitenwerk', 'Interieurafwerking', 'Dakraam of daglicht', 'Schadeherstel', 'Iets anders'].map((x) => `<option>${x}</option>`).join('')}</select></label>
    <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Binnengekomen via</legend><div class="keuze">${['telefoon', 'mail', 'website', 'mondeling'].map((b, n) => `<label><input type="radio" name="bron" value="${b}" ${n === 0 ? 'checked' : ''}><span>${b}</span></label>`).join('')}</div></fieldset>
    <label class="veld"><span>Wat wil de klant?</span><textarea class="inp" name="bericht" rows="3"></textarea></label>
    <p class="fout" id="fout-a" role="alert"></p><button class="knop knop--messing knop--groot">Aanvraag opslaan</button></form>`);
  C.F.aanvraag = (f, d) => {
    const fout = []; if (!d.naam.trim()) fout.push('Vul een naam in.'); if (!d.tel.trim() && !d.mail.trim()) fout.push('Vul een telefoonnummer of e-mailadres in.'); if (d.mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.mail.trim())) fout.push('Het e-mailadres klopt niet.');
    C.$('#fout-a').textContent = fout.join(' '); if (fout.length) return;
    const a = { id: C.id('a'), nummer: C.nummer('A'), klant: null, naam: d.naam.trim(), tel: d.tel.trim(), mail: d.mail.trim().toLowerCase(), adres: d.adres.trim(), dienst: d.dienst, bron: d.bron, bericht: d.bericht.trim(), status: 'nieuw', ontvangen: new Date().toISOString(), herinnering: null };
    const dub = C.dubbel(a); if (dub) a.klant = dub.id;
    C.db.aanvragen.push(a); C.log('aanvraag', a.id, null, `Aanvraag ${a.nummer} van ${a.naam}`);
    C.sluit(); C.wijzig(dub ? `Aanvraag opgeslagen en gekoppeld aan bestaande klant ${dub.naam}.` : 'Aanvraag opgeslagen.'); C.schil(); C.ga(`#/aanvragen/${a.id}`);
  };
  C.FORM.klant = () => C.blad('Nieuwe klant', `<form class="form" data-f="klant" novalidate>
    <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Soort</legend><div class="keuze">${['particulier', 'zakelijk', 'verzekeraar'].map((s, n) => `<label><input type="radio" name="soort" value="${s}" ${n === 0 ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div></fieldset>
    <label class="veld"><span>Naam</span><input class="inp" name="naam" required></label>
    <div class="rij2"><label class="veld"><span>Telefoon</span><input class="inp" name="tel" type="tel"></label><label class="veld"><span>E-mail</span><input class="inp" name="mail" type="email"></label></div>
    <label class="veld"><span>Straat en huisnummer</span><input class="inp" name="straat"></label>
    <div class="rij2"><label class="veld"><span>Postcode</span><input class="inp" name="postcode"></label><label class="veld"><span>Plaats</span><input class="inp" name="plaats" value="Rozenburg"></label></div>
    <div id="dub-melding"></div><p class="fout" id="fout-k" role="alert"></p><button class="knop knop--messing knop--groot">Klant opslaan</button></form>`);
  C.F.klant = (f, d) => {
    const fout = []; if (!d.naam.trim()) fout.push('Vul een naam in.'); if (!d.tel.trim() && !d.mail.trim()) fout.push('Vul een telefoonnummer of e-mailadres in.');
    C.$('#fout-k').textContent = fout.join(' '); if (fout.length) return;
    const dub = C.dubbel(d);
    if (dub && !d.toch) { C.$('#dub-melding').innerHTML = `<div class="melding"><b>Deze klant bestaat misschien al:</b> <a href="#/klanten/${dub.id}" data-a="ganaar">${esc(dub.naam)}</a>.<label class="vink"><input type="checkbox" name="toch"><span>Toch een nieuwe klant aanmaken</span></label></div>`; return; }
    const k = { id: C.id('k'), soort: d.soort, naam: d.naam.trim(), tel: d.tel.trim(), mail: d.mail.trim().toLowerCase(), straat: d.straat.trim(), postcode: d.postcode.trim(), plaats: d.plaats.trim(), toestemmingFotos: false, notities: '' };
    C.db.klanten.push(k); C.sluit(); C.wijzig('Klant opgeslagen.'); C.ga(`#/klanten/${k.id}`);
  };
  C.FORM.afspraak = (pid, ds = {}) => {
    const a = ds.aanvraag ? C.get('aanvragen', ds.aanvraag) : null;
    C.blad(a ? 'Afspraak plannen' : 'Inplannen', `<form class="form" data-f="afspraak" novalidate>${a ? `<input type="hidden" name="aanvraag" value="${a.id}"><p class="sub">Met ${esc(a.naam)}${a.adres ? ', ' + esc(a.adres) : ''}</p>` : `<label class="veld"><span>Project (optioneel)</span><select class="inp" name="project"><option value="">Geen project</option>${projOpties(pid)}</select></label>`}
      <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Soort</legend><div class="keuze">${[['afspraak', 'Afspraak'], ['werk', 'Werk'], ['levering', 'Levering'], ['herinnering', 'Herinnering']].map(([s, n]) => `<label><input type="radio" name="soort" value="${s}" ${s === (a ? 'afspraak' : 'werk') ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>
      <label class="veld"><span>Titel</span><input class="inp" name="titel" value="${a ? 'Opname bij ' + esc(a.naam) : ''}" required></label>
      <div class="rij3"><label class="veld"><span>Datum</span><input class="inp" type="date" name="datum" value="${C.isoDag(new Date(Date.now() + 864e5))}" required></label><label class="veld"><span>Van</span><input class="inp" type="time" name="van" value="${a ? '17:00' : '07:30'}"></label><label class="veld"><span>Tot</span><input class="inp" type="time" name="tot" value="${a ? '18:00' : '16:00'}"></label></div>
      <p class="fout" id="fout-af" role="alert"></p><button class="knop knop--messing knop--groot">Opslaan in de agenda</button></form>`);
  };
  C.F.afspraak = (f, d) => {
    const fout = []; if (!d.titel.trim()) fout.push('Geef een titel.'); if (!d.datum) fout.push('Kies een datum.'); if (d.van && d.tot && d.tot <= d.van) fout.push('De eindtijd ligt voor de begintijd.');
    C.$('#fout-af').textContent = fout.join(' '); if (fout.length) return;
    const item = { id: C.id('pl'), soort: d.soort, titel: d.titel.trim(), start: new Date(`${d.datum}T${d.van || '08:00'}`).toISOString(), eind: new Date(`${d.datum}T${d.tot || d.van || '09:00'}`).toISOString() };
    if (d.project) item.project = d.project; if (d.aanvraag) { item.aanvraag = d.aanvraag; const a = C.get('aanvragen', d.aanvraag); if (['nieuw', 'contact'].includes(a.status)) a.status = 'afspraak'; }
    C.db.planning.push(item);
    if (d.project) { const p = C.project(d.project); if (d.soort === 'werk') { if (!p.start || item.start < p.start) p.start = item.start; if (!p.eind || item.eind > p.eind) p.eind = item.eind; if (p.status === 'voorbereiding') p.status = 'gepland'; } C.log('planning', item.id, p.id, `Ingepland: ${item.titel}, ${C.datum(item.start)}`); }
    C.sluit(); C.wijzig('Opgeslagen in de agenda.'); C.schil(); C.route();
  };

  // ---------- tabbladen werkbonnen, materiaal, meerwerk, documenten ----------
  C.T.werkbonnen = (p) => {
    const l = C.db.werkbonnen.filter((w) => w.project === p.id).sort((a, b) => b.datum.localeCompare(a.datum));
    return { html: `<div class="kop"><div><span class="maat">${l.length} werkbonnen · ${C.uren(l.reduce((s, w) => s + w.minuten, 0))}</span><h2>Werkbonnen</h2></div><button class="knop knop--messing" data-a="formulier" data-form="werkbon" data-project="${p.id}">${i('bon', 'i--s')} Nieuwe werkbon</button></div>
      <div class="kaart lijst">${l.map((w) => `<button class="rij" data-a="werkbonOpen" data-id="${w.id}"><span class="rij__hoofd"><span class="rij__titel">${w.nummer} · ${C.datum(w.datum)}</span><span class="rij__sub">${esc(w.werkzaamheden)}</span></span><span class="rij__eind">${C.uren(w.minuten)}${w.getekend ? '<br>getekend' : ''}</span>${i('chev', 'chev')}</button>`).join('') || '<p class="leeg">Nog geen werkbonnen.</p>'}</div>` };
  };
  C.A.werkbonOpen = (el) => {
    const w = C.get('werkbonnen', el.dataset.id); const fotos = C.db.fotos.filter((f) => f.werkbon === w.id);
    C.blad(`Werkbon ${w.nummer}`, `<p class="klein">${C.datum(w.datum, { weekday: 'long', day: 'numeric', month: 'long' })} · ${C.uren(w.minuten)} · ${esc(C.project(w.project).naam)}</p>
      <h3 style="margin-top:12px">Werkzaamheden</h3><p>${esc(w.werkzaamheden) || '–'}</p>
      ${w.materiaal.length ? `<h3 style="margin-top:12px">Materiaal</h3><ul>${w.materiaal.map(([o, n, e]) => `<li>${n} ${esc(e)} ${esc(o)}</li>`).join('')}</ul>` : ''}
      ${w.bijzonderheden ? `<h3 style="margin-top:12px">Bijzonderheden</h3><p>${esc(w.bijzonderheden)}</p>` : ''}
      ${w.openstaand ? `<h3 style="margin-top:12px">Nog open</h3><p>${esc(w.openstaand)}</p>` : ''}
      ${fotos.length ? `<div class="duim" style="margin-top:12px">${fotos.map((f) => `<img src="${f.src}" alt="${esc(f.omschrijving)}">`).join('')}</div>` : ''}
      ${w.getekend ? `<p style="margin-top:12px"><b>Getekend door ${esc(w.getekend)}</b></p>${w.handtekening ? `<img src="${w.handtekening}" alt="Handtekening van ${esc(w.getekend)}" style="max-width:300px;border:1px solid var(--line)">` : ''}` : ''}
      <button class="knop knop--rand" style="margin-top:14px" data-a="aiWerkbon" data-id="${w.id}">${i('spark', 'i--s')} Maak er een conceptverslag van</button>`);
  };
  C.T.materiaal = (p) => {
    const mats = C.db.materialen.filter((m) => m.project === p.id);
    const uren = C.db.uren.filter((u) => u.project === p.id).sort((a, b) => b.datum.localeCompare(a.datum));
    const o = p.offerte ? C.get('offertes', p.offerte) : null;
    const begroot = o ? o.regels.filter((r) => r.soort === 'arbeid' && r.eenheid === 'uur').reduce((s, r) => s + Number(r.aantal), 0) : 0;
    const totMin = uren.reduce((s, u) => s + u.minuten, 0);
    const lev = {}; mats.filter((m) => m.status === 'nodig').forEach((m) => { (lev[m.leverancier || 'Leverancier onbekend'] = lev[m.leverancier || 'Leverancier onbekend'] || []).push(m); });
    return { html: `<div class="grid2 grid2--gelijk"><div>
      <div class="kop"><div><span class="maat">${mats.length} regels · ${eur(mats.reduce((s, m) => s + C.regelTotaal(m), 0))}</span><h2>Materiaal</h2></div><button class="knop knop--messing" data-a="formulier" data-form="materiaal" data-project="${p.id}">${i('plus', 'i--s')} Toevoegen</button></div>
      <div class="kaart lijst">${mats.map((m) => `<div class="rij"><span class="rij__hoofd"><span class="rij__titel">${esc(m.omschrijving)}</span><span class="rij__sub">${String(m.aantal).replace('.', ',')} ${esc(m.eenheid)}${m.prijs ? ' · ' + eur(C.regelTotaal(m)) : ''}${m.leverancier ? ' · ' + esc(m.leverancier) : ''}${m.bon ? ' · bon' : ''}</span></span><button class="chip" data-a="matStatus" data-id="${m.id}" aria-label="Status ${C.ST.materiaal[m.status][0]}, tik voor volgende">${C.st('materiaal', m.status)}</button></div>`).join('') || '<p class="leeg">Nog geen materiaal.</p>'}</div>
      ${Object.keys(lev).length ? `<div class="kop"><div><span class="maat">Nog bestellen</span><h2>Bestellijst</h2></div><button class="link" data-a="bestellijst" data-project="${p.id}">${i('kopie', 'i--s')} Kopiëren</button></div><div class="kaart kaart--pad">${Object.entries(lev).map(([l, ms]) => `<p><b>${esc(l)}</b></p><ul style="margin:4px 0 10px">${ms.map((m) => `<li>${String(m.aantal).replace('.', ',')} ${esc(m.eenheid)} ${esc(m.omschrijving)}</li>`).join('')}</ul>`).join('')}</div>` : ''}
    </div><div>
      <div class="kop"><div><span class="maat">${C.uren(totMin)}${begroot ? ` van ${begroot} u begroot` : ''}</span><h2>Uren</h2></div><button class="knop knop--messing" data-a="formulier" data-form="uren" data-project="${p.id}">${i('plus', 'i--s')} Uren</button></div>
      ${begroot ? `<div class="kaart kaart--pad"><div class="voortgang" style="padding:0" role="img" aria-label="${Math.round(totMin / 60 / begroot * 100)} procent van de begrote uren">${Array.from({ length: 10 }, (_, n) => `<i class="${n < Math.min(10, Math.round(totMin / 60 / begroot * 10)) ? (totMin / 60 > begroot ? 'nu' : 'on') : ''}"></i>`).join('')}</div><p class="klein" style="margin-top:8px">Nacalculatie: ${Math.round(totMin / 60 / begroot * 100)}% van de arbeidsuren uit offerte ${o.nummer} is gebruikt.</p></div>` : ''}
      <div class="kaart lijst" style="margin-top:12px">${uren.map((u) => `<div class="rij"><span class="rij__hoofd"><span class="rij__titel">${C.datum(u.datum)}</span><span class="rij__sub">${esc(u.omschrijving || '')}</span></span><span class="rij__eind bedrag">${C.uren(u.minuten)}</span></div>`).join('') || '<p class="leeg">Nog geen uren.</p>'}</div>
    </div></div>` };
  };
  C.A.matStatus = (el) => { const m = C.get('materialen', el.dataset.id); const v = Object.keys(C.ST.materiaal); m.status = v[(v.indexOf(m.status) + 1) % v.length]; C.log('materiaal', m.id, m.project, `${m.omschrijving}: ${C.ST.materiaal[m.status][0].toLowerCase()}`); C.wijzig(); C.route(); };
  C.A.bestellijst = async (el) => {
    const t = C.db.materialen.filter((m) => m.project === el.dataset.project && m.status === 'nodig').map((m) => `${String(m.aantal).replace('.', ',')} ${m.eenheid} ${m.omschrijving}${m.leverancier ? ' (' + m.leverancier + ')' : ''}`).join('\n');
    try { await navigator.clipboard.writeText(t); C.toast('Bestellijst gekopieerd.'); } catch (e) { C.blad('Bestellijst', `<textarea class="inp" rows="8">${esc(t)}</textarea>`); }
  };
  C.T.meerwerk = (p) => {
    const l = C.db.meerwerk.filter((m) => m.project === p.id).sort((a, b) => b.datum.localeCompare(a.datum));
    const ak = l.filter((m) => m.status === 'akkoord').reduce((s, m) => s + m.prijs, 0);
    return { html: `<div class="kop"><div><span class="maat">${eur(ak)} excl. met akkoord</span><h2>Meerwerk</h2></div><button class="knop knop--messing" data-a="formulier" data-form="meerwerk" data-project="${p.id}">${i('plus', 'i--s')} Meerwerk</button></div>
      <div class="kaart lijst">${l.map((m) => { const a = m.akkoord ? C.get('akkoorden', m.akkoord) : null; const fotos = C.db.fotos.filter((f) => f.meerwerk === m.id); return `<div style="padding:14px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><span><b>${m.nummer}</b> · ${C.datum(m.datum)}<br>${esc(m.omschrijving)}</span>${C.st('meerwerk', m.status)}</div>
        <p class="klein" style="margin-top:6px">${m.minuten ? C.uren(m.minuten) + ' · ' : ''}materiaal ${eur(m.materiaal)} · meerprijs <b>${eur(m.prijs)}</b> excl. (${m.btw}% btw)</p>
        ${fotos.length ? `<div class="duim" style="margin-top:8px">${fotos.map((f) => `<img src="${f.src}" alt="">`).join('')}</div>` : ''}
        ${a ? `<p class="melding melding--blauw" style="margin-top:8px">Akkoord van ${esc(a.naam)} (${a.wijze}), ${C.datum(a.op, { day: 'numeric', month: 'long' })} om ${C.tijd(a.op)}. Momentopname ${esc(a.hash)}.</p>` : ''}
        <div class="knoppen" style="margin-top:10px">${m.status === 'concept' ? `<button class="knop knop--messing" data-a="mwVragen" data-id="${m.id}">${i('send', 'i--s')} Akkoord vragen</button>` : ''}${m.status === 'verstuurd' ? `<button class="knop" data-a="akkoordVastleggen" data-type="meerwerk" data-id="${m.id}">Akkoord vastleggen</button><a class="knop knop--rand" href="#/portaal/${p.id}">Bekijk als klant</a>` : ''}</div></div>`; }).join('') || '<p class="leeg">Nog geen meerwerk. Ontstaat er extra werk, leg het direct vast met foto en prijs.</p>'}</div>` };
  };
  C.A.mwVragen = async (el) => { if (await C.akkoordVragen(C.get('meerwerk', el.dataset.id))) C.route(); };
  C.T.documenten = (p) => {
    const o = p.offerte ? C.get('offertes', p.offerte) : null;
    const ak = C.db.akkoorden.filter((a) => (a.type === 'offerte' && a.onderwerp === p.offerte) || (a.type === 'meerwerk' && C.db.meerwerk.some((m) => m.id === a.onderwerp && m.project === p.id)) || (a.type === 'oplevering' && a.onderwerp === p.id));
    const docs = (p.documenten || []);
    const op = C.db.opleveringen.find((x) => x.project === p.id);
    return { html: `<div class="kop"><div><span class="maat">Dossier</span><h2>Documenten</h2></div><label class="knop knop--messing" style="position:relative">${i('plus', 'i--s')} Document toevoegen<input type="file" data-doc="${p.id}" style="position:absolute;inset:0;opacity:0;cursor:pointer" aria-label="Document toevoegen"></label></div>
      <div class="kaart lijst">${o ? C.rij(`#/offertes/${o.id}/a4`, `Offerte ${o.nummer}`, `${C.ST.offerte[o.status][0]} · zichtbaar voor klant`) : ''}
        ${ak.map((a) => `<div class="rij">${i('slot')}<span class="rij__hoofd"><span class="rij__titel">Akkoord ${a.type} · ${esc(a.naam)}</span><span class="rij__sub">${a.wijze} · ${C.datum(a.op)} · ${esc(a.hash)}</span></span></div>`).join('')}
        ${op ? C.rij(`#/projecten/${p.id}/opleverdocument`, 'Opleverdocument', op.akkoord ? 'Bevestigd door de klant' : 'Concept') : ''}
        ${docs.map((d) => `<div class="rij">${i('file')}<span class="rij__hoofd"><span class="rij__titel">${esc(d.naam)}</span><span class="rij__sub">${Math.round(d.grootte / 1024)} kB · ${d.klant ? 'zichtbaar voor klant' : 'alleen intern'}</span></span></div>`).join('')}
      </div><p class="klein" style="margin-top:8px">Preview: van toegevoegde documenten wordt alleen de naam bewaard. Tekeningen, garanties en handleidingen horen in het consumentendossier (zie Oplevering).</p>`,
      na: () => C.$('[data-doc]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; const klant = await C.bevestig('Zichtbaar voor de klant?', `<p>${esc(f.name)}</p><p class="sub">Kies "Zichtbaar" als de klant dit document op de projectpagina mag zien.</p>`, 'Zichtbaar'); (p.documenten = p.documenten || []).push({ naam: f.name, grootte: f.size, klant }); C.log('document', null, p.id, `Document toegevoegd: ${f.name}`); C.wijzig('Document toegevoegd.'); C.route(); }) };
  };

  // ---------- Oplevering ----------
  const CHECK = {
    badkamer: ['Afvoer en kranen getest, geen lekkage', 'Tegelwerk en voegen strak en schoon', 'Kitwerk dicht en netjes', 'Sanitair en spots vast en werkend', 'Ventilatie werkt', 'Gebruiks- en onderhoudsinformatie overhandigd', 'Werkplek schoon opgeleverd'],
    trap: ['Treden vast en zonder kraken', 'Stootborden strak aangesloten', 'Trapgat afgewerkt', 'Onderhoudsadvies gegeven', 'Werkplek schoon opgeleverd'],
    dakraam: ['Dakraam opent en sluit soepel', 'Waterdicht aangesloten, gootstuk gecontroleerd', 'Aftimmering en afwerking binnen', 'Kitwerk netjes en dicht', 'Bediening en onderhoud uitgelegd', 'Werkplek schoon opgeleverd'],
    schade: ['Schade volledig hersteld volgens opdracht', 'Afwerking gelijk aan de omgeving', "Foto's na herstel gemaakt voor de verzekeraar", 'Werkplek schoon opgeleverd'],
    leeg: ['Werk uitgevoerd volgens afspraak', 'Afwerking gecontroleerd', 'Werkplek schoon opgeleverd'],
  };
  const DOSSIER = ['Tekeningen of schetsen', 'Beschrijving van gebruikte materialen', 'Gebruiks- en onderhoudsinformatie', 'Garantiebewijzen en handleidingen', "Foto's van de uitvoering"];
  C.T.oplevering = (p) => {
    const o = C.db.opleveringen.find((x) => x.project === p.id);
    if (!o) return { html: `<div class="leeg kaart"><p>Nog geen oplevering voor dit project.</p><button class="knop knop--messing" data-a="opleveringStart" data-id="${p.id}">${i('oplever', 'i--s')} Oplevering voorbereiden</button><p class="klein" style="margin-top:10px">Zet een checklist voor ${p.soort === 'leeg' ? 'dit werk' : esc(C.SJ_NAMEN[p.soort] || p.soort).toLowerCase()} klaar, met opleverpunten en het consumentendossier.</p></div>` };
    const ak = o.akkoord ? C.get('akkoorden', o.akkoord) : null;
    const eind = C.db.fotos.filter((f) => f.project === p.id && f.categorie === 'eind').length;
    const openC = Object.values(o.checklist).filter((v) => !v).length, openP = o.punten.filter((x) => !x.klaar).length;
    return { html: `<div class="grid2"><div>
      <div class="kop"><div><span class="maat">${openC} open</span><h2>Checklist</h2></div></div>
      <div class="kaart lijst">${Object.entries(o.checklist).map(([t, v]) => `<label class="vink rij"><input type="checkbox" data-a="opCheck" data-id="${o.id}" data-k="${esc(t)}" ${v ? 'checked' : ''} ${ak ? 'disabled' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
      <div class="kop"><div><span class="maat">${openP} open</span><h2>Opleverpunten</h2></div></div>
      <div class="kaart lijst">${o.punten.map((x) => `<label class="vink rij"><input type="checkbox" data-a="opPunt" data-id="${o.id}" data-p="${x.id}" ${x.klaar ? 'checked' : ''}><span>${esc(x.tekst)}</span></label>`).join('')}
        ${ak ? '' : `<form class="rij" data-f="opPunt" style="gap:8px"><input type="hidden" name="id" value="${o.id}"><input class="inp" name="tekst" placeholder="Nieuw opleverpunt" aria-label="Nieuw opleverpunt" required><button class="knop" aria-label="Toevoegen">${i('plus', 'i--s')}</button></form>`}</div>
      <div class="kop"><div><span class="maat">Art. 7:757a BW</span><h2>Consumentendossier</h2></div></div>
      <div class="kaart lijst">${Object.entries(o.dossier).map(([t, v]) => `<label class="vink rij"><input type="checkbox" data-a="opDossier" data-id="${o.id}" data-k="${esc(t)}" ${v ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
      <p class="klein" style="margin-top:6px">Overhandigen zodra het werk klaar is voor oplevering, vóór de oplevering zelf. Praktisch dossier, geen Wkb-kwaliteitsborging.</p>
    </div><div>
      <div class="kaart kaart--pad"><span class="maat">Eindfoto's</span><p style="margin-top:8px">${eind} ${eind === 1 ? 'foto' : "foto's"} in de categorie Eindresultaat.</p><div class="knoppen" style="margin-top:10px"><button class="knop knop--rand" data-a="formulier" data-form="foto" data-project="${p.id}">${i('camera', 'i--s')} Eindfoto maken</button><a class="knop knop--rand" href="#/projecten/${p.id}/fotos?cat=eind">Bekijken</a></div></div>
      <div class="kaart kaart--pad" style="margin-top:12px"><span class="maat">Bevestiging klant</span>
        ${ak ? `<p style="margin-top:8px"><b>Opgeleverd</b> en bevestigd door ${esc(ak.naam)} (${ak.wijze}) op ${C.datum(ak.op, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>${o.handtekening ? `<img src="${o.handtekening}" alt="Handtekening" style="max-width:260px;border:1px solid var(--line);margin-top:8px">` : ''}${o.opmerking ? `<p class="klein">Opmerking klant: ${esc(o.opmerking)}</p>` : ''}`
          : `<form class="form" data-f="opleveren" style="margin-top:10px" novalidate><input type="hidden" name="id" value="${o.id}">${openC || openP ? `<div class="melding">${openC + openP} punten staan nog open. Die komen als openstaand in het opleverdocument.</div>` : ''}
            <label class="veld"><span>Opmerkingen van de klant</span><textarea class="inp" name="opmerking" rows="2"></textarea></label>${handtekening()}
            <label class="veld"><span>Nazorg-herinnering</span><input class="inp" type="date" name="nazorg" value="${C.isoDag(new Date(Date.now() + 90 * 864e5))}"><small>Bijvoorbeeld na 3 maanden even nalopen.</small></label>
            <p class="fout" id="fout-op" role="alert"></p><button class="knop knop--messing knop--groot">Oplevering bevestigen</button></form>`}
        <a class="knop knop--rand knop--breed" style="margin-top:12px" href="#/projecten/${p.id}/opleverdocument">${i('print', 'i--s')} Opleverdocument (A4)</a></div>
    </div></div>`, na: () => { if (!ak) C._handt = koppelHandtekening(); } };
  };
  C.A.opleveringStart = (el) => { const p = C.project(el.dataset.id); C.db.opleveringen.push({ id: C.id('op'), project: p.id, checklist: Object.fromEntries((CHECK[p.soort] || CHECK.leeg).map((t) => [t, false])), punten: [], dossier: Object.fromEntries(DOSSIER.map((t) => [t, false])), akkoord: null, nazorg: null }); if (!['oplevering', 'nazorg', 'afgerond'].includes(p.status)) p.status = 'oplevering'; C.log('oplevering', null, p.id, 'Oplevering voorbereid', true); C.wijzig('Opleverchecklist klaargezet.'); C.route(); };
  C.A.opCheck = (el) => { setTimeout(() => { C.get('opleveringen', el.dataset.id).checklist[el.dataset.k] = el.checked; C.wijzig(); }, 0); };
  C.A.opDossier = (el) => { setTimeout(() => { C.get('opleveringen', el.dataset.id).dossier[el.dataset.k] = el.checked; C.wijzig(); }, 0); };
  C.A.opPunt = (el) => { setTimeout(() => { const x = C.get('opleveringen', el.dataset.id).punten.find((q) => q.id === el.dataset.p); x.klaar = el.checked; C.wijzig(el.checked ? 'Punt afgerond.' : ''); }, 0); };
  C.F.opPunt = (f, d) => { if (!d.tekst.trim()) return; C.get('opleveringen', d.id).punten.push({ id: C.id('pp'), tekst: d.tekst.trim(), klaar: false }); C.wijzig('Opleverpunt toegevoegd.'); C.route(); };
  C.F.opleveren = async (f, d) => {
    const o = C.get('opleveringen', d.id); const p = C.project(o.project);
    if (!C._handt || C._handt.leeg() || !d.getekend.trim()) { C.$('#fout-op').textContent = 'Laat de klant tekenen en vul de naam in.'; return; }
    o.handtekening = C._handt.url(); o.opmerking = d.opmerking.trim();
    const ak = await C.maakAkkoord('oplevering', p.id, d.getekend.trim(), 'handtekening', { checklist: o.checklist, punten: o.punten, opmerking: o.opmerking });
    o.akkoord = ak.id; p.status = 'nazorg';
    if (d.nazorg) { o.nazorg = new Date(d.nazorg + 'T09:00').toISOString(); C.db.planning.push({ id: C.id('pl'), project: p.id, soort: 'herinnering', titel: `Nazorg: ${p.naam} bij ${C.klant(p.klant).naam}`, start: o.nazorg, eind: o.nazorg }); }
    C.log('akkoord', ak.id, p.id, `Oplevering bevestigd door ${ak.naam}`, true);
    C.wijzig('Oplevering bevestigd. Nazorg staat in de agenda.'); C.route();
  };
  C.S.opleverdocument = (id) => {
    const p = C.project(id); const k = C.klant(p.klant); const o = C.db.opleveringen.find((x) => x.project === id); const ak = o?.akkoord ? C.get('akkoorden', o.akkoord) : null;
    const eind = C.db.fotos.filter((f) => f.project === id && f.categorie === 'eind');
    return { titel: 'Opleverdocument', terug: `#/projecten/${id}/oplevering`, nav: 'projecten', html: `<div class="a4-werkbalk"><a class="knop knop--rand" href="#/projecten/${id}/oplevering">${i('terug', 'i--s')} Terug</a><button class="knop" onclick="print()">${i('print', 'i--s')} Afdrukken of opslaan als PDF</button></div>
      <article class="a4"><div class="a4-kop"><div style="display:flex;gap:12px;align-items:center"><span style="width:56px;color:var(--brass)">${C.LOGO}</span><b style="font:400 24px var(--serif);color:var(--navy)">MSBouw</b></div><div style="text-align:right;font-size:13px">${esc(C.db.instellingen.tel)}<br>${esc(C.db.instellingen.mail)}</div></div>
      <h1>Opleverdocument</h1><p>${esc(p.naam)} · ${p.nummer}<br>${esc(k.naam)} · ${esc(p.adres)}</p>
      ${o ? `<h3 style="margin-top:18px">Checklist</h3><ul>${Object.entries(o.checklist).map(([t, v]) => `<li>${v ? '✓' : '○'} ${esc(t)}</li>`).join('')}</ul>
      <h3 style="margin-top:14px">Openstaande punten</h3>${o.punten.filter((x) => !x.klaar).length ? `<ul>${o.punten.filter((x) => !x.klaar).map((x) => `<li>${esc(x.tekst)}</li>`).join('')}</ul>` : '<p>Geen.</p>'}
      <h3 style="margin-top:14px">Consumentendossier</h3><ul>${Object.entries(o.dossier).map(([t, v]) => `<li>${v ? '✓ bijgevoegd' : '○ nog toevoegen'}: ${esc(t)}</li>`).join('')}</ul>
      ${eind.length ? `<h3 style="margin-top:14px">Eindresultaat</h3><div style="display:flex;gap:8px;flex-wrap:wrap">${eind.map((f) => `<img src="${f.src}" alt="${esc(f.omschrijving)}" style="width:180px;height:180px;object-fit:cover">`).join('')}</div>` : ''}
      <h3 style="margin-top:14px">Bevestiging</h3>${ak ? `<p>Opgeleverd en bevestigd door ${esc(ak.naam)} op ${C.datum(ak.op, { day: 'numeric', month: 'long', year: 'numeric' })} om ${C.tijd(ak.op)}.</p>${o.handtekening ? `<img src="${o.handtekening}" alt="Handtekening" style="max-width:260px">` : ''}` : '<p class="ontbreekt">Nog niet bevestigd.</p>'}` : '<p>Nog geen oplevering voorbereid.</p>'}
      <p style="margin-top:20px;font-size:12px;color:#555">Voorbeelddocument uit de preview van MS Bouw Cockpit.</p></article>` };
  };
})();
