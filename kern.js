// Kern van de preview: opslag (localStorage), rekenen, router, schil, onderblad, bevestigen, synchronisatie.
// Iconen: paden van Lucide (ISC-licentie, lucide.dev).
(() => {
  const C = window.C;
  const SLEUTEL = 'msbc-preview-v1';

  // ---------- iconen ----------
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    map: '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="1"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    meer: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    euro: '<path d="M4 10h12M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8 7.7 7.7 0 0 0 5.2-2"/>',
    spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    set: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    zoek: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    tel: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="1"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    terug: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    links: '<path d="m15 18-6-6 6-6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    bon: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h4"/>',
    klok: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    pakket: '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
    meerwerk: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 8v8M8 12h8"/>',
    vink: '<path d="M20 6 9 17l-5-5"/>',
    oplever: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
    bericht: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bel: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    offline: '<path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.17-2.69M19 13a10 10 0 0 0-2.3-1.53M2 8.82a15 15 0 0 1 4.17-2.65M22 8.82a15 15 0 0 0-11.29-3.76M12 20h.01"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    notitie: '<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    let: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    oog: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    slot: '<rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    verplaats: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    lijst: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    kopie: '<rect x="9" y="9" width="13" height="13" rx="1"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    afbeelding: '<rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  };
  C.i = (n, k = '') => `<svg class="i ${k}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || ''}</svg>`;
  C.LOGO = '<svg viewBox="0 0 56 28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="miter" aria-hidden="true"><path d="M1 26 15 15.5V6h6v5.5L33 2l22 19"/></svg>';

  // ---------- hulpjes ----------
  C.$ = (s, r = document) => r.querySelector(s);
  C.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  C.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  C.eur = (c) => '€ ' + ((c || 0) / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  C.uren = (min) => ((min || 0) / 60).toLocaleString('nl-NL', { maximumFractionDigits: 2 }) + ' u';
  const D = (iso) => new Date(iso);
  C.datum = (iso, o = { weekday: 'short', day: 'numeric', month: 'short' }) => iso ? D(iso).toLocaleDateString('nl-NL', o) : '';
  C.tijd = (iso) => iso ? D(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '';
  C.dagStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  C.zelfdeDag = (a, b) => C.dagStart(a).getTime() === C.dagStart(b).getTime();
  C.dagenTot = (iso) => Math.round((C.dagStart(iso) - C.dagStart(new Date())) / 864e5);
  C.relatief = (iso) => {
    const n = C.dagenTot(iso);
    if (n === 0) return 'vandaag'; if (n === 1) return 'morgen'; if (n === -1) return 'gisteren';
    return n > 0 ? `over ${n} dagen` : `${-n} dagen geleden`;
  };
  C.isoDag = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  C.normTel = (t) => String(t || '').replace(/\D/g, '').replace(/^31/, '0');

  // ---------- opslag ----------
  C.laad = () => {
    try { const d = JSON.parse(localStorage.getItem(SLEUTEL)); if (d && d.versie === 1) return d; } catch (e) { /* opnieuw beginnen */ }
    return C.seed();
  };
  C.db = C.laad();
  C.bewaar = () => {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(C.db)); return true; }
    catch (e) { C.toast('Opslag van dit toestel is vol. Verwijder foto\'s of laad de voorbeeldgegevens opnieuw.', 'let'); return false; }
  };
  C.reset = () => { localStorage.removeItem(SLEUTEL); C.db = C.seed(); C.bewaar(); };
  C.get = (coll, id) => C.db[coll].find((x) => x.id === id);
  C.klant = (id) => C.get('klanten', id);
  C.project = (id) => C.get('projecten', id);
  C.id = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  C.nummer = (l) => { C.db.teller[l] = (C.db.teller[l] || 0) + 1; return `VB-${l}-${String(C.db.teller[l]).padStart(3, '0')}`; };
  C.log = (type, id, project, tekst, groot = false) => C.db.activiteit.push({ type, id, project, tekst, op: new Date().toISOString(), groot });

  // ---------- rekenen (centen) ----------
  C.regelTotaal = (r) => Math.round((Number(r.aantal) || 0) * (Number(r.prijs) || 0));
  C.reken = (regels) => {
    const per = {};
    regels.forEach((r) => { per[r.btw] = (per[r.btw] || 0) + C.regelTotaal(r); });
    const tarieven = Object.keys(per).map(Number).sort((a, b) => b - a).map((t) => ({ t, grondslag: per[t], btw: Math.round((per[t] * t) / 100) }));
    const excl = tarieven.reduce((s, x) => s + x.grondslag, 0);
    const btw = tarieven.reduce((s, x) => s + x.btw, 0);
    return { tarieven, excl, btw, incl: excl + btw };
  };

  // ---------- statussen ----------
  C.ST = {
    aanvraag: { nieuw: ['Nieuw', 'blauw'], contact: ['Contact opnemen', 'oranje'], afspraak: ['Afspraak gepland', 'blauw'], offerte_maken: ['Offerte in voorbereiding', 'oranje'], offerte_verzonden: ['Offerte verzonden', 'navy'], gewonnen: ['Gewonnen', 'groen'], verloren: ['Verloren', 'leeg'] },
    offerte: { concept: ['Concept', 'leeg'], verstuurd: ['Wacht op akkoord', 'oranje'], akkoord: ['Akkoord', 'groen'], afgewezen: ['Afgewezen', 'rood'], verlopen: ['Verlopen', 'rood'] },
    project: { voorbereiding: ['Voorbereiding', 'leeg'], gepland: ['Gepland', 'blauw'], uitvoering: ['In uitvoering', 'oranje'], wacht: ['Wacht', 'rood'], oplevering: ['Oplevering', 'navy'], nazorg: ['Nazorg', 'groen'], afgerond: ['Afgerond', 'groen'] },
    meerwerk: { concept: ['Concept', 'leeg'], verstuurd: ['Wacht op akkoord', 'oranje'], akkoord: ['Akkoord', 'groen'], afgewezen: ['Afgewezen', 'rood'] },
    materiaal: { nodig: ['Nodig', 'rood'], besteld: ['Besteld', 'oranje'], geleverd: ['Geleverd', 'blauw'], verwerkt: ['Verwerkt', 'groen'] },
    factuur: { concept: ['Concept', 'leeg'], verstuurd: ['Verstuurd', 'oranje'], betaald: ['Betaald', 'groen'] },
  };
  C.st = (soort, s, extra = '') => { const [t, k] = (C.ST[soort] || {})[s] || [s, 'leeg']; return `<span class="st st--${k}">${t}${extra ? ' · ' + extra : ''}</span>`; };
  C.FASEN = ['Gesprek', 'Offerte', 'Voorbereiding', 'Uitvoering', 'Oplevering'];
  C.fase = (p) => ({ voorbereiding: 2, gepland: 2, wacht: 2, uitvoering: 3, oplevering: 4, nazorg: 5, afgerond: 5 })[p.status] ?? 1;
  C.voortgang = (p) => { const f = C.fase(p); return `<div class="voortgang" role="img" aria-label="Fase ${Math.min(f + 1, 5)} van 5: ${C.FASEN[Math.min(f, 4)]}">${C.FASEN.map((_, i) => `<i class="${i < f ? 'on' : i === f ? 'nu' : ''}"></i>`).join('')}</div>`; };
  C.vandaagWerk = () => C.db.planning.filter((x) => x.soort === 'werk' && C.zelfdeDag(x.start, new Date())).map((x) => C.project(x.project)).filter(Boolean)[0]
    || C.db.projecten.find((p) => p.status === 'uitvoering');

  // ---------- synchronisatie (gesimuleerd) ----------
  C.sync = { offline: !navigator.onLine, sim: false, wacht: 0, bezig: false };
  C.isOffline = () => C.sync.sim || C.sync.offline;
  C.syncTekst = () => C.sync.bezig ? ['bezig', 'Synchroniseren…'] : C.sync.wacht ? ['wacht', `Wacht op verbinding (${C.sync.wacht})`] : C.isOffline() ? ['wacht', 'Offline, alles opgeslagen'] : ['ok', 'Alles opgeslagen'];
  C.tekenSync = () => C.$$('[data-sync]').forEach((el) => { const [s, t] = C.syncTekst(); el.dataset.staat = s; el.innerHTML = `<span>${t}</span>`; el.setAttribute('aria-label', 'Synchronisatie: ' + t); });
  C.wijzig = (melding) => {
    const ok = C.bewaar();
    if (ok && C.isOffline()) C.sync.wacht++;
    C.tekenSync();
    if (melding) C.toast(C.isOffline() && ok ? melding + ' Wacht op verbinding.' : melding);
    return ok;
  };
  C.spoel = () => {
    if (C.isOffline() || !C.sync.wacht) { C.tekenSync(); return; }
    C.sync.bezig = true; C.tekenSync();
    setTimeout(() => { const n = C.sync.wacht; C.sync.wacht = 0; C.sync.bezig = false; C.tekenSync(); C.toast(`${n} ${n === 1 ? 'wijziging' : 'wijzigingen'} gesynchroniseerd.`); }, 1100);
  };
  addEventListener('online', () => { C.sync.offline = false; C.spoel(); });
  addEventListener('offline', () => { C.sync.offline = true; C.tekenSync(); });

  // ---------- melding, onderblad, bevestigen ----------
  C.toast = (t, icoon = 'vink') => { const el = C.$('#toast'); el.innerHTML = C.i(icoon) + `<span>${C.esc(t)}</span>`; el.classList.add('zicht'); clearTimeout(C._t); C._t = setTimeout(() => el.classList.remove('zicht'), 3200); };
  C.blad = (titel, html, voet = '') => {
    const d = C.$('#blad');
    d.innerHTML = `<div class="blad__kop"><h2 id="blad-titel">${C.esc(titel)}</h2><button class="ib" data-a="sluit" aria-label="Sluiten">${C.i('x')}</button></div><div class="blad__in">${html}</div>${voet ? `<div class="blad__voet">${voet}</div>` : ''}`;
    d.setAttribute('aria-labelledby', 'blad-titel');
    if (!d.open) d.showModal();
    const eerste = d.querySelector('[autofocus]'); if (eerste) eerste.focus();
    return d;
  };
  C.sluit = () => { const d = C.$('#blad'); if (d.open) d.close(); };
  C.bevestig = (titel, html, knop = 'Bevestigen', soort = 'knop') => new Promise((ok) => {
    const d = C.$('#bev');
    d.innerHTML = `<form method="dialog"><div class="blad__kop"><h2 id="bev-titel">${C.esc(titel)}</h2></div><div class="blad__in">${html}</div><div class="blad__voet knoppen knoppen--eind"><button class="knop knop--rand" value="nee">Annuleren</button><button class="knop ${soort === 'messing' ? 'knop--messing' : ''}" value="ja">${C.esc(knop)}</button></div></form>`;
    d.setAttribute('aria-labelledby', 'bev-titel');
    d.onclose = () => ok(d.returnValue === 'ja');
    d.returnValue = ''; d.showModal();
  });

  // ---------- router en schil ----------
  C.S = {}; C.A = {}; C.F = {};
  C.ga = (h) => { if (location.hash === h) C.route(); else location.hash = h; };
  const NAV = [
    ['Werk', [['vandaag', 'Vandaag', 'home'], ['projecten', 'Projecten', 'map'], ['agenda', 'Agenda', 'cal'], ['aanvragen', 'Aanvragen', 'inbox']]],
    ['Administratie', [['klanten', 'Klanten', 'users'], ['offertes', 'Offertes', 'file'], ['facturatie', 'Facturatie', 'euro']]],
    ['Hulp', [['assistent', 'Assistent', 'spark'], ['portaal/p1', 'Klantpagina (voorbeeld)', 'oog'], ['instellingen', 'Instellingen', 'set']]],
  ];
  C.tellers = () => ({
    aanvragen: C.db.aanvragen.filter((a) => ['nieuw', 'contact'].includes(a.status)).length,
    offertes: C.db.offertes.filter((o) => o.status === 'verstuurd').length,
  });
  C.schil = () => {
    const t = C.tellers();
    C.$('#side').innerHTML = `<a class="merk" href="#/vandaag">${C.LOGO}<span><b>MSBouw</b><i>Cockpit</i></span></a>
      <button class="side__vast" data-a="vastleggen">${C.i('plus')} Vastleggen</button>
      ${NAV.map(([g, items]) => `<div class="side__groep">${g}</div>${items.map(([r, n, ic]) => `<a class="nav" href="#/${r}" data-nav="${r.split('/')[0]}">${C.i(ic)}<span>${n}</span>${t[r] ? `<span class="tel" aria-label="${t[r]} open">${t[r]}</span>` : ''}</a>`).join('')}`).join('')}
      <div class="side__voet"><span class="tag">MV</span><span>Marcus van der Stel<br><small>Eigenaar</small></span></div>`;
    C.$('#bnav').innerHTML = `<a href="#/vandaag" data-nav="vandaag">${C.i('home')}<span>Vandaag</span></a><a href="#/projecten" data-nav="projecten">${C.i('map')}<span>Projecten</span></a>
      <button class="vast" data-a="vastleggen" aria-label="Vastleggen"><span class="rond">${C.i('plus')}</span><em>Vastleggen</em></button>
      <a href="#/agenda" data-nav="agenda">${C.i('cal')}<span>Agenda</span></a><a href="#/meer" data-nav="meer">${C.i('meer')}<span>Meer</span></a>`;
  };
  C.route = () => {
    const delen = location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
    const naam = delen[0] || 'vandaag';
    const app = C.$('#app'), portaal = C.$('#portaal');
    if (naam === 'portaal') {
      app.hidden = true; portaal.hidden = false;
      portaal.innerHTML = C.S.portaal(delen[1], delen[2], delen[3]); document.title = 'Projectpagina (voorbeeld) · MSBouw';
      scrollTo(0, 0); C.na && C.na(); return;
    }
    app.hidden = false; portaal.hidden = true; portaal.innerHTML = '';
    const scherm = C.S[naam] || C.S.vandaag;
    let r;
    try { r = scherm(...delen.slice(1)); } catch (e) { console.error(e); r = { titel: 'Er ging iets mis', html: `<div class="melding melding--rood">Dit scherm kon niet worden getoond. ${C.esc(e.message)}</div>` }; }
    C.$('#top-titel').textContent = r.titel;
    document.title = `${r.titel} · MS Bouw Cockpit`;
    const tb = C.$('#top-terug'); tb.hidden = !r.terug; if (r.terug) tb.dataset.naar = r.terug;
    C.$('#inhoud').innerHTML = r.html;
    const actief = r.nav || naam;
    C.$$('[data-nav]').forEach((a) => { if (a.dataset.nav === actief) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (!r.scrollHouden) scrollTo(0, 0);
    C.tekenSync();
    if (r.na) r.na();
  };

  // ---------- gebeurtenissen ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const f = C.A[el.dataset.a];
    if (f) { e.preventDefault(); f(el, e); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.dataset.f;
    if (!f || !C.F[f]) return;
    e.preventDefault();
    let fd; try { fd = new FormData(e.target, e.submitter); } catch (x) { fd = new FormData(e.target); }
    C.F[f](e.target, Object.fromEntries(fd), fd);
  });
  C.A.sluit = () => C.sluit();
  C.A.terug = (el) => { if (history.length > 1) history.back(); else C.ga(el.dataset.naar); };
  C.A.reset = async () => {
    if (await C.bevestig('Voorbeeldgegevens opnieuw laden?', '<p>Alles wat u in deze preview heeft gewijzigd, gaat verloren. Er worden geen echte gegevens geraakt.</p>', 'Opnieuw laden')) { C.reset(); C.sluit(); C.schil(); C.ga('#/vandaag'); C.toast('Voorbeeldgegevens opnieuw geladen.'); }
  };
  C.A.sync = () => {
    const [, t] = C.syncTekst();
    C.blad('Synchronisatie', `<p><b>${t}</b></p>
      <p class="klein" style="margin-top:8px">In de echte app staan werkbonnen, notities en foto's eerst veilig op de telefoon. Zodra er bereik is, gaan ze vanzelf naar de server. Offertes, facturen en de klantpagina werken alleen met verbinding.</p>
      <label class="vink" style="margin-top:12px"><input type="checkbox" data-a="simOffline" ${C.sync.sim ? 'checked' : ''}><span><b>Doe alsof er geen bereik is</b><br><span class="klein">Probeer een werkbon of foto op te slaan en zet dit daarna weer uit.</span></span></label>`);
  };
  C.A.simOffline = (el) => { setTimeout(() => { C.sync.sim = el.checked; if (!C.sync.sim) C.spoel(); C.tekenSync(); C.toast(C.sync.sim ? 'Geen bereik (gesimuleerd). Wijzigingen wachten op de telefoon.' : 'Weer verbinding.', C.sync.sim ? 'offline' : 'vink'); }, 0); };
  C.A.zoek = () => {
    C.blad('Zoeken', `<input class="inp" type="search" placeholder="Klant, project, offerte of telefoonnummer" aria-label="Zoeken" data-zoek autofocus><div class="kaart lijst" id="zoek-uit" style="margin-top:12px" aria-live="polite"></div>`);
    const inp = C.$('[data-zoek]');
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase(); const qt = C.normTel(q);
      if (q.length < 2) { C.$('#zoek-uit').innerHTML = ''; return; }
      const r = [];
      C.db.klanten.forEach((k) => { if (k.naam.toLowerCase().includes(q) || (qt.length > 3 && C.normTel(k.tel).includes(qt)) || k.mail.includes(q)) r.push([`#/klanten/${k.id}`, k.naam, 'Klant · ' + k.plaats]); });
      C.db.projecten.forEach((p) => { if ((p.naam + ' ' + p.nummer + ' ' + p.adres).toLowerCase().includes(q)) r.push([`#/projecten/${p.id}`, p.naam, `Project ${p.nummer} · ${C.klant(p.klant).naam}`]); });
      C.db.offertes.forEach((o) => { if ((o.titel + ' ' + o.nummer).toLowerCase().includes(q)) r.push([`#/offertes/${o.id}`, o.titel, `Offerte ${o.nummer}`]); });
      C.db.aanvragen.forEach((a) => { if ((a.naam + ' ' + a.nummer + ' ' + a.dienst).toLowerCase().includes(q)) r.push([`#/aanvragen/${a.id}`, a.naam, `Aanvraag ${a.nummer} · ${a.dienst}`]); });
      C.$('#zoek-uit').innerHTML = r.length ? r.slice(0, 12).map(([h, t, s]) => `<a class="rij" href="${h}" data-a="ganaar"><span class="rij__hoofd"><span class="rij__titel">${C.esc(t)}</span><span class="rij__sub">${C.esc(s)}</span></span>${C.i('chev', 'chev')}</a>`).join('') : '<p class="leeg">Niets gevonden.</p>';
    });
  };
  C.A.ganaar = (el) => { C.sluit(); C.ga(el.getAttribute('href')); };

  C.start = () => {
    C.schil();
    addEventListener('hashchange', () => { C.sluit(); C.route(); }); // een ander scherm sluit het onderblad
    C.$('#top-terug').addEventListener('click', (e) => C.A.terug(e.currentTarget));
    C.route();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  };
})();
