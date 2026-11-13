// Schermen: Vandaag, Meer, Aanvragen, Klanten, Offertes (met rekenen, A4, versturen, akkoord, omzetten naar project).
(() => {
  const C = window.C;
  const { esc, i, eur } = C;
  const DIENSTEN = ['Complete renovatie', 'Verbouwing', 'Badkamer of toilet', 'Traprenovatie', 'Maatwerk timmerwerk', 'Gevel of buitenwerk', 'Interieurafwerking', 'Dakraam of daglicht', 'Schadeherstel', 'Iets anders'];
  const kaartLink = (adres) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`;
  const rij = (href, titel, sub, eind = '', extra = '') => `<a class="rij" href="${href}" ${extra}><span class="rij__hoofd"><span class="rij__titel">${titel}</span>${sub ? `<span class="rij__sub">${sub}</span>` : ''}</span>${eind ? `<span class="rij__eind">${eind}</span>` : ''}${i('chev', 'chev')}</a>`;
  C.rij = rij;
  C.kaartLink = kaartLink;

  C.pkaart = (p) => {
    const f = C.db.fotos.filter((x) => x.project === p.id).slice(-1)[0];
    const k = C.klant(p.klant);
    const volgende = C.db.planning.filter((x) => x.project === p.id && new Date(x.eind) >= C.dagStart(new Date())).sort((a, b) => a.start.localeCompare(b.start))[0];
    return `<a class="pkaart" href="#/projecten/${p.id}">
      <span class="pkaart__foto ${f ? '' : 'pkaart__foto--leeg'}" ${f ? `style="background-image:url(${f.src})"` : ''}>${f ? '' : i('afbeelding')}</span>
      <span class="pkaart__in"><span>${C.st('project', p.status, p.wachtOp || '')}</span><h3>${esc(p.naam)}</h3>
      <span class="klein">${esc(k.naam)} · ${esc(p.adres.split(',')[0])}</span>
      <span class="klein">${volgende ? `${C.datum(volgende.start)}: ${esc(volgende.titel)}` : p.start ? `Start ${C.datum(p.start)}` : 'Nog niet ingepland'}</span>
      ${C.voortgang(p)}</span></a>`;
  };

  // ---------- Vandaag ----------
  C.aandacht = () => {
    const a = [];
    C.db.aanvragen.filter((x) => x.status === 'nieuw').forEach((x) => a.push([`#/aanvragen/${x.id}`, `Nieuwe aanvraag: ${esc(x.naam)}`, `${esc(x.dienst)} · ${C.tijd(x.ontvangen)} via ${x.bron}`, '<span class="tag">Nieuw</span>']));
    C.db.aanvragen.filter((x) => x.herinnering && C.dagenTot(x.herinnering) <= 0 && !['gewonnen', 'verloren'].includes(x.status)).forEach((x) => a.push([`#/aanvragen/${x.id}`, `Herinnering: ${esc(x.naam)}`, `${C.ST.aanvraag[x.status][0]} · ${esc(x.dienst)}`, `<span class="tag">${C.tijd(x.herinnering)}</span>`]));
    C.db.offertes.filter((o) => o.status === 'verstuurd' && C.dagenTot(o.verstuurd) <= -7).forEach((o) => a.push([`#/offertes/${o.id}`, `Offerte ${o.nummer} wacht al ${-C.dagenTot(o.verstuurd)} dagen`, `${esc(C.klant(o.klant).naam)} · ${esc(o.titel)} · nabellen?`, '<span class="tag tag--rood">Reactie</span>']));
    C.db.meerwerk.filter((m) => m.status === 'verstuurd').forEach((m) => a.push([`#/projecten/${m.project}/meerwerk`, `Meerwerk wacht op akkoord`, `${esc(m.omschrijving)} · ${eur(m.prijs)} excl.`, '<span class="tag">Akkoord</span>']));
    C.db.berichten.filter((b) => b.richting === 'van' && !b.gelezen).forEach((b) => { const p = C.project(b.project); a.push([`#/projecten/${p.id}/overzicht`, `Bericht van ${esc(C.klant(p.klant).naam)}`, esc(b.tekst), `<span class="tag">${C.relatief(b.op)}</span>`]); });
    C.db.projecten.filter((p) => ['uitvoering', 'gepland'].includes(p.status)).forEach((p) => { const n = C.db.materialen.filter((m) => m.project === p.id && m.status === 'nodig').length; if (n) a.push([`#/projecten/${p.id}/materiaal`, `${n} ${n === 1 ? 'materiaal' : 'materialen'} nog bestellen`, `${esc(p.naam)} · ${esc(C.klant(p.klant).naam)}`, '<span class="tag">Bestellen</span>']); });
    C.db.projecten.filter((p) => p.status === 'oplevering').forEach((p) => { const o = C.db.opleveringen.find((x) => x.project === p.id); const open = o ? Object.values(o.checklist).filter((v) => !v).length + o.punten.filter((x) => !x.klaar).length : 0; a.push([`#/projecten/${p.id}/oplevering`, `Oplevering voorbereiden: ${esc(p.naam)}`, `${open} punten open · ${esc(C.klant(p.klant).naam)}`, '<span class="tag">Opleveren</span>']); });
    C.teFactureren().forEach((x) => a.push(['#/facturatie', `Te factureren: ${esc(x.titel)}`, esc(x.sub), '<span class="tag">Factuur</span>']));
    C.db.planning.filter((x) => x.soort === 'herinnering' && C.dagenTot(x.start) === 0).forEach((x) => a.push(['#/agenda/dag', esc(x.titel), 'Herinnering voor vandaag', `<span class="tag">${C.tijd(x.start)}</span>`]));
    return a;
  };
  C.teFactureren = () => {
    const r = [];
    C.db.projecten.filter((p) => ['nazorg', 'afgerond', 'oplevering'].includes(p.status)).forEach((p) => {
      if (!C.db.facturen.some((f) => f.project === p.id && f.soort === 'eind') && C.db.opleveringen.some((o) => o.project === p.id && o.akkoord)) r.push({ project: p.id, titel: `${p.naam} (${p.nummer})`, sub: 'Opgeleverd, nog geen eindfactuur' });
    });
    C.db.meerwerk.filter((m) => m.status === 'akkoord' && !m.gefactureerd && !C.db.facturen.some((f) => f.project === m.project)).forEach((m) => r.push({ project: m.project, titel: `Meerwerk ${m.nummer}`, sub: `${m.omschrijving} · ${eur(m.prijs)} excl.` }));
    return r;
  };
  C.S.vandaag = () => {
    const nu = new Date();
    const uur = nu.getHours();
    const groet = uur < 12 ? 'Goedemorgen' : uur < 18 ? 'Goedemiddag' : 'Goedenavond';
    const p = C.vandaagWerk();
    const vandaagItems = C.db.planning.filter((x) => C.zelfdeDag(x.start, nu)).sort((a, b) => a.start.localeCompare(b.start));
    const werkVandaag = vandaagItems.filter((x) => x.soort === 'werk');
    let blok;
    if (p) {
      const k = C.klant(p.klant);
      const taken = C.db.taken.filter((t) => t.project === p.id && !t.klaar).slice(0, 4);
      blok = `<section class="vandaag dark" aria-labelledby="v-titel">
        <div class="vandaag__kop"><span class="maat">${werkVandaag.length ? 'Vandaag op de planning' : 'Lopend project'}</span>${C.st('project', p.status)}</div>
        <h2 id="v-titel">${esc(p.naam)} · ${esc(k.naam)}</h2>
        <a class="adres" href="${kaartLink(p.adres)}" target="_blank" rel="noopener">${i('pin', 'i--s')} ${esc(p.adres)}</a>
        ${werkVandaag.length ? `<p style="margin-top:10px;color:var(--on-dark)">${werkVandaag.map((x) => `${C.tijd(x.start)} tot ${C.tijd(x.eind)}: ${esc(x.titel)}`).join('<br>')}</p>` : ''}
        ${taken.length ? `<ul class="taken" aria-label="Open taken">${taken.map((t) => `<li><label class="vink" style="min-height:44px;padding:0;color:inherit"><input type="checkbox" data-a="taak" data-id="${t.id}"><span>${esc(t.titel)}${t.deadline ? ` <small>· ${C.relatief(t.deadline)}</small>` : ''}</span></label></li>`).join('')}</ul>` : ''}
        <div class="snel">${[['camera', 'Foto', 'foto'], ['bon', 'Werkbon', 'werkbon'], ['klok', 'Uren', 'uren'], ['pakket', 'Materiaal', 'materiaal']].map(([ic, t, f]) => `<button data-a="formulier" data-form="${f}" data-project="${p.id}">${i(ic)}${t}</button>`).join('')}</div>
        <div class="knoppen"><a class="knop knop--rand" href="#/projecten/${p.id}">Project openen ${i('chev', 'i--s')}</a><a class="knop knop--rand" href="tel:${C.normTel(k.tel)}">${i('tel', 'i--s')} Bel klant</a></div>
      </section>`;
    } else {
      blok = `<section class="kaart kaart--pad"><span class="maat">Vandaag</span><h2 class="h1" style="margin-top:8px;font-size:22px">Geen werk op de planning</h2><p class="sub" style="margin-top:6px">Plan een project in of bekijk de agenda.</p><a class="knop" style="margin-top:12px" href="#/agenda">Agenda openen</a></section>`;
    }
    const aand = C.aandacht();
    const lopend = C.db.projecten.filter((x) => ['uitvoering', 'gepland', 'oplevering', 'wacht'].includes(x.status));
    const komend = C.db.planning.filter((x) => x.soort !== 'werk' && new Date(x.start) >= nu && C.dagenTot(x.start) <= 7).sort((a, b) => a.start.localeCompare(b.start));
    const berichten = C.db.berichten.filter((b) => b.richting === 'van').sort((a, b) => b.op.localeCompare(a.op)).slice(0, 3);
    return {
      titel: 'Vandaag',
      html: `<div class="groet"><h1>${groet}, Marcus</h1><span class="sub">${C.datum(nu.toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
        <div class="grid2"><div>${blok}
          <div class="kop"><div><span class="maat">Lopend</span><h2>Projecten</h2></div><a href="#/projecten">Alle projecten</a></div>
          <div class="pkaarten">${lopend.map(C.pkaart).join('')}</div></div>
        <div>
          <div class="kop"><div><span class="maat">${aand.length} ${aand.length === 1 ? 'punt' : 'punten'}</span><h2>Vraagt aandacht</h2></div></div>
          <div class="kaart lijst aandacht">${aand.length ? aand.map(([h, t, s, e]) => rij(h, t, s, e)).join('') : '<p class="leeg">Niets dat wacht. Mooi zo.</p>'}</div>
          <div class="kop"><div><span class="maat">7 dagen</span><h2>Komende afspraken</h2></div><a href="#/agenda">Agenda</a></div>
          <div class="kaart lijst">${komend.length ? komend.map((x) => `<button class="rij" data-a="item" data-id="${x.id}"><span class="rij__hoofd"><span class="rij__titel">${esc(x.titel)}</span><span class="rij__sub">${C.datum(x.start)} · ${C.tijd(x.start)}</span></span><span class="rij__eind">${x.soort}</span></button>`).join('') : '<p class="leeg">Geen afspraken deze week.</p>'}</div>
          <div class="kop"><div><span class="maat">Klanten</span><h2>Berichten</h2></div></div>
          <div class="kaart lijst">${berichten.map((b) => { const pp = C.project(b.project); return rij(`#/projecten/${pp.id}/overzicht`, esc(C.klant(pp.klant).naam) + (b.gelezen ? '' : ' <span class="tag">Nieuw</span>'), esc(b.tekst), C.relatief(b.op)); }).join('') || '<p class="leeg">Geen berichten.</p>'}</div>
        </div></div>`,
    };
  };
  C.A.taak = (el) => {
    const t = C.get('taken', el.dataset.id); if (!t) return;
    setTimeout(() => {
      t.klaar = el.checked ? new Date().toISOString() : null;
      if (t.klaar) C.log('taak', t.id, t.project, `Taak afgerond: ${t.titel}`);
      C.wijzig(t.klaar ? 'Taak afgevinkt.' : 'Taak weer open.');
      el.closest('li')?.classList.toggle('klaar', !!t.klaar);
    }, 0);
  };

  // ---------- Meer (mobiel) ----------
  C.S.meer = () => {
    const t = C.tellers();
    const items = [['aanvragen', 'Aanvragen', 'inbox', t.aanvragen ? `${t.aanvragen} open` : ''], ['klanten', 'Klanten', 'users', ''], ['offertes', 'Offertes', 'file', t.offertes ? `${t.offertes} wachten` : ''], ['facturatie', 'Facturatie', 'euro', ''], ['assistent', 'Assistent', 'spark', ''], ['portaal/p1', 'Klantpagina (voorbeeld)', 'oog', ''], ['instellingen', 'Instellingen', 'set', '']];
    return { titel: 'Meer', html: `<div class="kaart lijst">${items.map(([r, n, ic, s]) => `<a class="rij" href="#/${r}">${i(ic)}<span class="rij__hoofd"><span class="rij__titel">${n}</span></span><span class="rij__eind">${s}</span>${i('chev', 'chev')}</a>`).join('')}</div>
      <p class="klein" style="margin-top:16px">Preview met voorbeeldgegevens. <button class="link" style="background:none;border:0;color:var(--blue);font-weight:600;padding:8px 0;cursor:pointer" data-a="reset">Opnieuw beginnen</button></p>` };
  };

  // ---------- Aanvragen ----------
  C.S.aanvragen = (id) => {
    if (id) return C.S.aanvraag(id);
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('status') || 'open';
    const OPEN = ['nieuw', 'contact', 'afspraak', 'offerte_maken'];
    const filters = [['open', 'Open'], ...Object.entries(C.ST.aanvraag).map(([k, [n]]) => [k, n])];
    const tel = (k) => k === 'open' ? C.db.aanvragen.filter((a) => OPEN.includes(a.status)).length : C.db.aanvragen.filter((a) => a.status === k).length;
    const lijst = C.db.aanvragen.filter((a) => f === 'open' ? OPEN.includes(a.status) : a.status === f).sort((a, b) => b.ontvangen.localeCompare(a.ontvangen));
    return {
      titel: 'Aanvragen',
      html: `<div class="kop"><div><span class="maat">Leads</span><h2>Aanvragen</h2></div><button class="knop knop--messing" data-a="formulier" data-form="aanvraag">${i('plus', 'i--s')} Nieuwe aanvraag</button></div>
        <nav class="chips" aria-label="Filter op status">${filters.map(([k, n]) => `<a class="chip" href="#/aanvragen?status=${k}" ${k === f ? 'aria-current="true"' : ''}>${n} <span class="tel">${tel(k)}</span></a>`).join('')}</nav>
        <div class="kaart lijst" style="margin-top:12px">${lijst.length ? lijst.map((a) => rij(`#/aanvragen/${a.id}`, esc(a.naam), `${esc(a.dienst)} · via ${a.bron} · ${C.relatief(a.ontvangen)}`, C.st('aanvraag', a.status) + (a.herinnering && C.dagenTot(a.herinnering) <= 0 && OPEN.includes(a.status) ? '<br><span class="tag tag--rood">Herinnering</span>' : ''))).join('') : '<p class="leeg">Geen aanvragen met deze status.</p>'}</div>`,
    };
  };
  C.dubbel = (x) => {
    const t = C.normTel(x.tel), m = String(x.mail || '').toLowerCase().trim();
    return C.db.klanten.find((k) => (t.length > 5 && C.normTel(k.tel) === t) || (m && k.mail.toLowerCase() === m));
  };
  C.S.aanvraag = (id) => {
    const a = C.get('aanvragen', id);
    if (!a) return { titel: 'Niet gevonden', terug: '#/aanvragen', html: '<p class="leeg">Deze aanvraag bestaat niet (meer).</p>' };
    const k = a.klant ? C.klant(a.klant) : null;
    const dub = !k ? C.dubbel(a) : null;
    const o = C.db.offertes.find((x) => x.aanvraag === a.id);
    const stappen = Object.entries(C.ST.aanvraag);
    return {
      titel: a.nummer, terug: '#/aanvragen', nav: 'aanvragen',
      html: `<div class="kop"><div><span class="maat">${esc(a.dienst)}</span><h2>${esc(a.naam)}</h2></div>${C.st('aanvraag', a.status)}</div>
      ${dub ? `<div class="melding" style="margin-bottom:12px"><b>Bestaande klant gevonden:</b> ${esc(dub.naam)} (zelfde ${C.normTel(dub.tel) === C.normTel(a.tel) ? 'telefoonnummer' : 'e-mailadres'}). <button class="knop knop--rand" style="margin-top:8px" data-a="koppelKlant" data-id="${a.id}" data-klant="${dub.id}">Koppelen aan ${esc(dub.naam)}</button></div>` : ''}
      <div class="grid2"><div>
        <div class="kaart kaart--pad"><p style="white-space:pre-line">${esc(a.bericht)}</p>
          <p class="klein" style="margin-top:10px">Ontvangen ${C.datum(a.ontvangen, { weekday: 'long', day: 'numeric', month: 'long' })} om ${C.tijd(a.ontvangen)}, via ${a.bron}</p></div>
        <div class="kaart lijst" style="margin-top:12px">
          ${a.tel ? `<a class="rij" href="tel:${C.normTel(a.tel)}">${i('tel')}<span class="rij__hoofd"><span class="rij__titel">${esc(a.tel)}</span><span class="rij__sub">Bellen</span></span></a>` : ''}
          ${a.mail ? `<a class="rij" href="mailto:${esc(a.mail)}">${i('mail')}<span class="rij__hoofd"><span class="rij__titel">${esc(a.mail)}</span><span class="rij__sub">Mailen</span></span></a>` : ''}
          ${a.adres ? `<a class="rij" href="${kaartLink(a.adres)}" target="_blank" rel="noopener">${i('pin')}<span class="rij__hoofd"><span class="rij__titel">${esc(a.adres)}</span><span class="rij__sub">Route</span></span></a>` : ''}
          ${k ? rij(`#/klanten/${k.id}`, 'Klantkaart: ' + esc(k.naam), 'Gekoppeld') : ''}
          ${o ? rij(`#/offertes/${o.id}`, `Offerte ${o.nummer}`, C.ST.offerte[o.status][0]) : ''}
        </div>
      </div><div>
        <div class="kaart kaart--pad"><span class="maat">Volgende stap</span>
          <div class="knoppen" style="margin-top:12px">
            ${!o ? `<button class="knop knop--messing" data-a="offerteUitAanvraag" data-id="${a.id}">${i('file', 'i--s')} Offerte maken</button>` : ''}
            <button class="knop" data-a="formulier" data-form="afspraak" data-aanvraag="${a.id}">${i('cal', 'i--s')} Afspraak plannen</button>
            ${!k ? `<button class="knop knop--rand" data-a="klantUitAanvraag" data-id="${a.id}">${i('users', 'i--s')} Klant aanmaken</button>` : ''}
          </div>
          <label class="veld" style="margin-top:16px"><span>Status</span><select class="inp" data-a2="aanvraagStatus" data-id="${a.id}">${stappen.map(([s, [n]]) => `<option value="${s}" ${s === a.status ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <form class="form" data-f="herinnering" style="margin-top:16px"><input type="hidden" name="id" value="${a.id}">
            <label class="veld"><span>Herinnering</span><input class="inp" type="datetime-local" name="op" value="${a.herinnering ? a.herinnering.slice(0, 16) : ''}"><small>Verschijnt op Vandaag zodra het zover is.</small></label>
            <button class="knop knop--rand">${i('bel', 'i--s')} Herinnering opslaan</button></form>
          ${a.status === 'verloren' ? `<p class="klein" style="margin-top:12px">Reden: ${esc(a.reden || 'niet ingevuld')}</p>` : ''}
        </div>
      </div></div>`,
      na: () => C.$('[data-a2="aanvraagStatus"]').addEventListener('change', async (e) => {
        const s = e.target.value;
        if (s === 'verloren') { const r = prompt('Waarom verloren? (optioneel)'); a.reden = r || ''; }
        a.status = s; C.log('aanvraag', a.id, null, `Aanvraag ${a.nummer}: ${C.ST.aanvraag[s][0]}`); C.wijzig('Status bijgewerkt.'); C.schil(); C.route();
      }),
    };
  };
  C.F.herinnering = (f, d) => { const a = C.get('aanvragen', d.id); a.herinnering = d.op ? new Date(d.op).toISOString() : null; C.wijzig(d.op ? 'Herinnering gezet.' : 'Herinnering verwijderd.'); };
  C.klantUit = (a) => {
    if (a.klant) return C.klant(a.klant);
    const bestaand = C.dubbel(a); if (bestaand) { a.klant = bestaand.id; return bestaand; }
    const [straat, plaats] = (a.adres || '').split(',').map((s) => s.trim());
    const k = { id: C.id('k'), soort: 'particulier', naam: a.naam, tel: a.tel, mail: a.mail, straat: straat || '', postcode: '', plaats: plaats || '', toestemmingFotos: false, notities: '' };
    C.db.klanten.push(k); a.klant = k.id; C.log('klant', k.id, null, `Klant aangemaakt uit aanvraag ${a.nummer}`);
    return k;
  };
  C.A.koppelKlant = (el) => { const a = C.get('aanvragen', el.dataset.id); a.klant = el.dataset.klant; C.wijzig('Gekoppeld aan bestaande klant.'); C.route(); };
  C.A.klantUitAanvraag = (el) => { const k = C.klantUit(C.get('aanvragen', el.dataset.id)); C.wijzig(`Klant ${k.naam} aangemaakt.`); C.ga(`#/klanten/${k.id}`); };
  C.A.offerteUitAanvraag = (el) => {
    const a = C.get('aanvragen', el.dataset.id); const k = C.klantUit(a);
    const sj = ({ 'Badkamer of toilet': 'badkamer', Traprenovatie: 'trap', 'Dakraam of daglicht': 'dakraam', Schadeherstel: 'schade', 'Maatwerk timmerwerk': 'maatwerk' })[a.dienst] || 'leeg';
    const o = C.nieuweOfferte(k, a.dienst, sj, a.adres || [k.straat, k.plaats].filter(Boolean).join(', '), a.id);
    a.status = 'offerte_maken'; C.wijzig('Conceptofferte gemaakt.'); C.schil(); C.ga(`#/offertes/${o.id}`);
  };

  // ---------- Klanten ----------
  C.S.klanten = (id) => {
    if (id) return C.S.klant(id);
    const rijen = C.db.klanten.slice().sort((a, b) => a.naam.localeCompare(b.naam)).map((k) => {
      const n = C.db.projecten.filter((p) => p.klant === k.id || p.opdrachtgever === k.id).length;
      return `<a class="rij" href="#/klanten/${k.id}" data-zoek="${esc((k.naam + ' ' + k.plaats + ' ' + k.tel + ' ' + k.mail).toLowerCase())}"><span class="rij__hoofd"><span class="rij__titel">${esc(k.naam)}</span><span class="rij__sub">${esc([k.straat, k.plaats].filter(Boolean).join(', '))}${k.soort !== 'particulier' ? ' · ' + k.soort : ''}</span></span><span class="rij__eind">${n ? n + (n === 1 ? ' project' : ' projecten') : ''}</span>${i('chev', 'chev')}</a>`;
    }).join('');
    return {
      titel: 'Klanten',
      html: `<div class="kop"><div><span class="maat">${C.db.klanten.length} klanten</span><h2>Klanten</h2></div><button class="knop knop--messing" data-a="formulier" data-form="klant">${i('plus', 'i--s')} Nieuwe klant</button></div>
        <input class="inp" type="search" placeholder="Zoek op naam, plaats of telefoon" aria-label="Klanten filteren" id="kfilter">
        <div class="kaart lijst" style="margin-top:12px" id="klijst">${rijen}</div>`,
      na: () => C.$('#kfilter').addEventListener('input', (e) => { const q = e.target.value.toLowerCase(); C.$$('#klijst .rij').forEach((r) => { r.hidden = q && !r.dataset.zoek.includes(q); }); }),
    };
  };
  C.S.klant = (id) => {
    const k = C.klant(id); if (!k) return { titel: 'Niet gevonden', terug: '#/klanten', html: '<p class="leeg">Deze klant bestaat niet.</p>' };
    const proj = C.db.projecten.filter((p) => p.klant === k.id || p.opdrachtgever === k.id);
    const off = C.db.offertes.filter((o) => o.klant === k.id);
    const aan = C.db.aanvragen.filter((a) => a.klant === k.id);
    const pids = proj.map((p) => p.id);
    const fotos = C.db.fotos.filter((f) => pids.includes(f.project));
    const afspr = C.db.planning.filter((x) => (x.klant === k.id || pids.includes(x.project)) && x.soort !== 'werk' && new Date(x.start) >= C.dagStart(new Date()));
    const hist = C.db.contact.filter((c) => c.klant === k.id).sort((a, b) => b.op.localeCompare(a.op));
    const adres = [k.straat, k.postcode, k.plaats].filter(Boolean).join(', ');
    return {
      titel: k.naam, terug: '#/klanten', nav: 'klanten',
      html: `<div class="kop"><div><span class="maat">${k.soort}</span><h2>${esc(k.naam)}</h2></div><a class="knop knop--messing" href="#/offertes/nieuw?klant=${k.id}">${i('plus', 'i--s')} Offerte</a></div>
      <div class="grid2"><div>
        <div class="kaart lijst">
          <a class="rij" href="tel:${C.normTel(k.tel)}">${i('tel')}<span class="rij__hoofd"><span class="rij__titel">${esc(k.tel)}</span><span class="rij__sub">Bellen</span></span></a>
          ${k.mail ? `<a class="rij" href="mailto:${esc(k.mail)}">${i('mail')}<span class="rij__hoofd"><span class="rij__titel">${esc(k.mail)}</span><span class="rij__sub">Mailen</span></span></a>` : ''}
          ${adres ? `<a class="rij" href="${kaartLink(adres)}" target="_blank" rel="noopener">${i('pin')}<span class="rij__hoofd"><span class="rij__titel">${esc(adres)}</span><span class="rij__sub">Route</span></span></a>` : ''}
        </div>
        <div class="kop"><div><span class="maat">${proj.length}</span><h2>Projecten</h2></div></div>
        <div class="pkaarten">${proj.map(C.pkaart).join('') || '<p class="leeg kaart">Nog geen projecten.</p>'}</div>
        <div class="kop"><div><span class="maat">${off.length}</span><h2>Offertes</h2></div></div>
        <div class="kaart lijst">${off.map((o) => rij(`#/offertes/${o.id}`, `${esc(o.titel)} <span class="klein">${o.nummer}</span>`, C.datum(o.datum), C.st('offerte', o.status) + '<br>' + eur(C.reken(o.regels).incl))).join('') || '<p class="leeg">Geen offertes.</p>'}</div>
        ${aan.length ? `<div class="kop"><div><span class="maat">${aan.length}</span><h2>Aanvragen</h2></div></div><div class="kaart lijst">${aan.map((a) => rij(`#/aanvragen/${a.id}`, esc(a.dienst), a.nummer + ' · ' + C.datum(a.ontvangen), C.st('aanvraag', a.status))).join('')}</div>` : ''}
        ${fotos.length ? `<div class="kop"><div><span class="maat">${fotos.length}</span><h2>Foto's</h2></div></div><div class="fotos">${fotos.map((f) => `<a class="foto" href="#/projecten/${f.project}/fotos" style="background-image:url(${f.src})" aria-label="${esc(f.omschrijving)}"></a>`).join('')}</div>` : ''}
      </div><div>
        <div class="kop"><div><span class="maat">Komend</span><h2>Afspraken</h2></div></div>
        <div class="kaart lijst">${afspr.map((x) => `<button class="rij" data-a="item" data-id="${x.id}"><span class="rij__hoofd"><span class="rij__titel">${esc(x.titel)}</span><span class="rij__sub">${C.datum(x.start)} · ${C.tijd(x.start)}</span></span></button>`).join('') || '<p class="leeg">Geen afspraken.</p>'}</div>
        <div class="kop"><div><span class="maat">Historie</span><h2>Contact</h2></div></div>
        <form class="kaart kaart--pad form" data-f="contact"><input type="hidden" name="klant" value="${k.id}">
          <div class="keuze" role="radiogroup" aria-label="Soort contact">${['telefoon', 'mail', 'bezoek', 'bericht'].map((s, n) => `<label><input type="radio" name="soort" value="${s}" ${n === 0 ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
          <label class="veld"><span>Wat is besproken?</span><textarea class="inp" name="tekst" required rows="2"></textarea></label>
          <button class="knop">Vastleggen</button></form>
        <ol class="tl kaart kaart--pad" style="margin-top:12px;padding-left:44px">${hist.map((c) => `<li><time>${C.datum(c.op)} · ${c.soort}</time><p>${esc(c.tekst)}</p></li>`).join('') || '<li><p class="sub">Nog geen contactmomenten.</p></li>'}</ol>
        <div class="kop"><div><span class="maat">Intern</span><h2>Notities</h2></div></div>
        <form class="form" data-f="klantNotitie"><input type="hidden" name="id" value="${k.id}"><textarea class="inp" name="notities" rows="4" aria-label="Notities">${esc(k.notities)}</textarea>
          <label class="vink"><input type="checkbox" name="toestemming" ${k.toestemmingFotos ? 'checked' : ''}><span>Klant geeft toestemming voor foto's van het werk op social media</span></label>
          <button class="knop knop--rand">Opslaan</button></form>
      </div></div>`,
    };
  };
  C.F.contact = (f, d) => { if (!d.tekst.trim()) return; C.db.contact.push({ id: C.id('c'), klant: d.klant, soort: d.soort, tekst: d.tekst.trim(), op: new Date().toISOString() }); C.wijzig('Contactmoment vastgelegd.'); C.route(); };
  C.F.klantNotitie = (f, d) => { const k = C.klant(d.id); k.notities = d.notities; k.toestemmingFotos = !!d.toestemming; C.wijzig('Klant bijgewerkt.'); };

  // ---------- Offertes ----------
  const SJ = {
    leeg: [],
    badkamer: [['Sloop', 'arbeid', 'Sloop bestaande badkamer, afvoer puin', 'uur'], ['Sloop', 'overig', 'Container en stortkosten', 'post'], ['Installatie', 'arbeid', 'Leidingwerk en afvoer aanpassen', 'uur'], ['Installatie', 'materiaal', 'Leiding- en afvoermateriaal', 'post'], ['Tegelwerk', 'arbeid', 'Tegelwerk wanden en vloer', 'uur'], ['Tegelwerk', 'materiaal', 'Wandtegels, keuze klant', 'm²'], ['Tegelwerk', 'materiaal', 'Vloertegels, keuze klant', 'm²'], ['Sanitair', 'materiaal', 'Sanitair volgens keuze klant', 'post'], ['Sanitair', 'arbeid', 'Plaatsen sanitair, kitwerk en afwerking', 'uur']],
    trap: [['Trap', 'arbeid', 'Oude bekleding verwijderen', 'uur'], ['Trap', 'materiaal', 'Traptreden op maat', 'st'], ['Trap', 'materiaal', 'Stootborden', 'st'], ['Trap', 'arbeid', 'Treden en stootborden plaatsen', 'uur'], ['Trap', 'arbeid', 'Trapgat afwerken', 'uur']],
    dakraam: [['Dakraam', 'materiaal', 'Dakraam met gootstuk', 'st'], ['Dakraam', 'arbeid', 'Dakraam plaatsen en waterdicht aansluiten', 'uur'], ['Afwerking', 'arbeid', 'Aftimmering binnen', 'uur'], ['Afwerking', 'materiaal', 'Afwerkmateriaal', 'post']],
    schade: [['Opname', 'arbeid', 'Schade opnemen en fotograferen', 'uur'], ['Herstel', 'arbeid', 'Beschadigde delen verwijderen', 'uur'], ['Herstel', 'arbeid', 'Herstel en afwerking', 'uur'], ['Herstel', 'materiaal', 'Herstelmateriaal', 'post']],
    maatwerk: [['Maatwerk', 'arbeid', 'Maken in de werkplaats', 'uur'], ['Maatwerk', 'arbeid', 'Plaatsen op locatie', 'uur'], ['Maatwerk', 'materiaal', 'Plaatmateriaal en beslag', 'post']],
  };
  C.SJ_NAMEN = { leeg: 'Leeg', badkamer: 'Badkamer', trap: 'Traprenovatie', dakraam: 'Dakraam', schade: 'Schadeherstel', maatwerk: 'Maatwerk' };
  C.nieuweOfferte = (k, titel, sj, werkadres, aanvraag = null) => {
    const T = C.db.instellingen.uurtarief || 0;
    const o = { id: C.id('o'), nummer: C.nummer('O'), klant: k.id, aanvraag, project: null, sjabloon: sj, titel: titel || 'Offerte', werkadres: werkadres || '', status: 'concept', datum: new Date().toISOString(), geldigTot: new Date(Date.now() + (C.db.instellingen.geldigheid || 30) * 864e5).toISOString(), intro: '',
      regels: (SJ[sj] || []).map(([sectie, soort, omschrijving, eenheid]) => ({ sectie, soort, omschrijving, aantal: 0, eenheid, prijs: soort === 'arbeid' ? T : 0, btw: 21 })) };
    C.db.offertes.push(o); C.log('offerte', o.id, null, `Conceptofferte ${o.nummer} gemaakt voor ${k.naam}`);
    return o;
  };
  C.S.offertes = (id, sub) => {
    if (id === 'nieuw') return C.S.offerteNieuw();
    if (id && sub === 'a4') return C.S.offerteA4(id);
    if (id) return C.S.offerte(id);
    const f = new URLSearchParams(location.hash.split('?')[1] || '').get('status') || 'alle';
    const lijst = C.db.offertes.filter((o) => f === 'alle' || o.status === f).sort((a, b) => b.datum.localeCompare(a.datum));
    return {
      titel: 'Offertes',
      html: `<div class="kop"><div><span class="maat">Calculatie</span><h2>Offertes</h2></div><a class="knop knop--messing" href="#/offertes/nieuw">${i('plus', 'i--s')} Nieuwe offerte</a></div>
      <nav class="chips" aria-label="Filter">${[['alle', 'Alle'], ...Object.entries(C.ST.offerte).map(([k, [n]]) => [k, n])].map(([k, n]) => `<a class="chip" href="#/offertes?status=${k}" ${k === f ? 'aria-current="true"' : ''}>${n} <span class="tel">${k === 'alle' ? C.db.offertes.length : C.db.offertes.filter((o) => o.status === k).length}</span></a>`).join('')}</nav>
      <div class="kaart lijst" style="margin-top:12px">${lijst.map((o) => rij(`#/offertes/${o.id}`, `${esc(o.titel)}`, `${esc(C.klant(o.klant).naam)} · ${o.nummer}${o.status === 'verstuurd' ? ` · ${-C.dagenTot(o.verstuurd)} dagen geleden verstuurd` : ''}`, `<span class="bedrag">${eur(C.reken(o.regels).incl)}</span><br>${C.st('offerte', o.status)}`)).join('') || '<p class="leeg">Geen offertes.</p>'}</div>`,
    };
  };
  C.S.offerteNieuw = () => {
    const kq = new URLSearchParams(location.hash.split('?')[1] || '').get('klant');
    return {
      titel: 'Nieuwe offerte', terug: '#/offertes', nav: 'offertes',
      html: `<form class="kaart kaart--pad form" data-f="offerteNieuw" style="max-width:640px" novalidate>
        <label class="veld"><span>Klant</span><select class="inp" name="klant" required><option value="">Kies een klant</option>${C.db.klanten.map((k) => `<option value="${k.id}" ${k.id === kq ? 'selected' : ''}>${esc(k.naam)}</option>`).join('')}</select><small>Staat de klant er niet bij? Maak eerst een <a href="#/klanten">klant</a> of start vanuit een aanvraag.</small></label>
        <label class="veld"><span>Titel</span><input class="inp" name="titel" required placeholder="Bijvoorbeeld: Badkamer renovatie"></label>
        <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Sjabloon</legend><div class="keuze">${Object.entries(C.SJ_NAMEN).map(([k, n], x) => `<label><input type="radio" name="sjabloon" value="${k}" ${x === 0 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div><small>Een sjabloon zet de gebruikelijke regels klaar, zonder aantallen. Arbeid krijgt het uurtarief uit de instellingen.</small></fieldset>
        <label class="veld"><span>Werkadres</span><input class="inp" name="werkadres" placeholder="Leeg = adres van de klant"></label>
        <p class="fout" id="fout-on" role="alert"></p>
        <button class="knop knop--messing knop--groot">Offerte opstellen</button></form>`,
    };
  };
  C.F.offerteNieuw = (f, d) => {
    const fout = []; if (!d.klant) fout.push('Kies een klant.'); if (!d.titel.trim()) fout.push('Geef de offerte een titel.');
    C.$('#fout-on').textContent = fout.join(' '); if (fout.length) return;
    const k = C.klant(d.klant);
    const o = C.nieuweOfferte(k, d.titel.trim(), d.sjabloon, d.werkadres.trim() || [k.straat, k.plaats].filter(Boolean).join(', '));
    C.wijzig('Conceptofferte gemaakt.'); C.ga(`#/offertes/${o.id}`);
  };
  C.parseEur = (s) => {
    let t = String(s).replace(/[€\s]/g, '');
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    if (t === '') return 0;
    const n = Number(t); return Number.isFinite(n) && n >= -1e9 && n <= 1e9 ? Math.round(n * 100) : NaN;
  };
  const prijsTekst = (c) => (c / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  C.totalenHtml = (o) => {
    const r = C.reken(o.regels);
    const negen = o.regels.some((x) => Number(x.btw) === 9);
    const leeg = o.regels.filter((x) => !Number(x.aantal) || !Number(x.prijs)).length;
    return `<div class="totalen">
      <div><span>Totaal excl. btw</span><b>${eur(r.excl)}</b></div>
      ${r.tarieven.map((t) => `<div class="klein"><span>Btw ${t.t}% over ${eur(t.grondslag)}</span><span>${eur(t.btw)}</span></div>`).join('')}
      <div class="groot"><span>Totaal incl. btw</span><span>${eur(r.incl)}</span></div></div>
      ${negen ? `<div class="melding" style="margin:0 16px 12px"><b>9% btw gekozen.</b> Alleen voor isoleren, schilderen, stukadoren of behangen van een woning ouder dan 2 jaar die permanent bewoond wordt (Belastingdienst). Tegelwerk, gipswanden en vloeren: 21%. Laat uw boekhouder dit bevestigen.</div>` : ''}
      ${leeg ? `<div class="melding melding--blauw" style="margin:0 16px 12px">${leeg} ${leeg === 1 ? 'regel heeft' : 'regels hebben'} nog geen aantal of prijs.</div>` : ''}`;
  };
  C.S.offerte = (id) => {
    const o = C.get('offertes', id); if (!o) return { titel: 'Niet gevonden', terug: '#/offertes', html: '<p class="leeg">Deze offerte bestaat niet.</p>' };
    const k = C.klant(o.klant); const bewerk = o.status === 'concept';
    const secties = [...new Set(o.regels.map((r) => r.sectie))];
    const ak = o.akkoord ? C.get('akkoorden', o.akkoord) : null;
    const regelHtml = (r, n) => bewerk ? `<div class="regel" data-regel="${n}">
        <div class="regel__boven"><input class="inp" value="${esc(r.omschrijving)}" data-rv="omschrijving" aria-label="Omschrijving regel ${n + 1}"><button class="ib" data-a="regelWeg" data-n="${n}" aria-label="Regel verwijderen">${i('x')}</button></div>
        <div class="regel__onder">
          <label><span>Soort</span><select class="inp" data-rv="soort">${['arbeid', 'materiaal', 'overig'].map((s) => `<option ${s === r.soort ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <label><span>Aantal (${esc(r.eenheid)})</span><input class="inp" inputmode="decimal" value="${String(r.aantal).replace('.', ',')}" data-rv="aantal"></label>
          <label><span>Prijs excl. per ${esc(r.eenheid)}</span><input class="inp" inputmode="decimal" value="${prijsTekst(r.prijs)}" data-rv="prijs"></label>
          <label><span>Btw</span><select class="inp" data-rv="btw">${[21, 9, 0].map((t) => `<option value="${t}" ${Number(r.btw) === t ? 'selected' : ''}>${t}%</option>`).join('')}</select></label>
        </div><div class="regel__tot" data-tot>${eur(C.regelTotaal(r))}</div></div>`
      : `<div class="regel"><div style="display:flex;justify-content:space-between;gap:12px"><span>${esc(r.omschrijving)}<br><span class="klein">${String(r.aantal).replace('.', ',')} ${esc(r.eenheid)} × ${eur(r.prijs)} · ${r.btw}% btw</span></span><b>${eur(C.regelTotaal(r))}</b></div></div>`;
    return {
      titel: o.nummer, terug: '#/offertes', nav: 'offertes', scrollHouden: false,
      html: `<div class="kop"><div><span class="maat">${o.nummer}</span><h2>${esc(o.titel)}</h2></div>${C.st('offerte', o.status)}</div>
      <div class="grid2"><div>
        <div class="kaart kaart--pad"><div class="rij2"><div><span class="klein">Klant</span><br><a href="#/klanten/${k.id}"><b>${esc(k.naam)}</b></a></div><div><span class="klein">Werkadres</span><br>${esc(o.werkadres)}</div></div>
          <div class="rij2" style="margin-top:10px"><div><span class="klein">Datum</span><br>${C.datum(o.datum, { day: 'numeric', month: 'long', year: 'numeric' })}</div><div><span class="klein">Geldig tot</span><br>${C.datum(o.geldigTot, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
          ${bewerk ? `<label class="veld" style="margin-top:12px"><span>Inleiding</span><textarea class="inp" rows="2" data-intro>${esc(o.intro)}</textarea></label>` : o.intro ? `<p style="margin-top:12px">${esc(o.intro)}</p>` : ''}</div>
        <div class="kaart" style="margin-top:12px" id="regels">
          ${secties.map((s) => `<div class="sectie-kop"><span>${esc(s)}</span>${bewerk ? `<span><button class="chip" data-a="regelErbij" data-sectie="${esc(s)}" data-soort="arbeid">+ arbeid</button> <button class="chip" data-a="regelErbij" data-sectie="${esc(s)}" data-soort="materiaal">+ materiaal</button></span>` : ''}</div>${o.regels.map((r, n) => r.sectie === s ? regelHtml(r, n) : '').join('')}`).join('')}
          ${bewerk ? `<div style="padding:12px 14px;display:flex;gap:8px;flex-wrap:wrap"><button class="knop knop--rand" data-a="sectieErbij">${i('plus', 'i--s')} Onderdeel toevoegen</button><button class="knop knop--rand" data-a="regelErbij" data-sectie="Overig" data-soort="overig">${i('plus', 'i--s')} Overige kosten</button></div>` : ''}
          ${!o.regels.length ? '<p class="leeg">Nog geen regels. Voeg een onderdeel toe.</p>' : ''}
        </div>
      </div><div>
        <div class="kaart" style="position:sticky;top:calc(var(--top) + 12px)"><div id="som" aria-live="polite">${C.totalenHtml(o)}</div>
          <div style="padding:0 16px 16px;display:grid;gap:8px">
            <a class="knop knop--rand knop--breed" href="#/offertes/${o.id}/a4">${i('print', 'i--s')} Bekijk als A4 / PDF</a>
            ${o.status === 'concept' ? `<button class="knop knop--messing knop--breed knop--groot" data-a="offerteVersturen" data-id="${o.id}">${i('send', 'i--s')} Versturen naar klant</button>` : ''}
            ${o.status === 'verstuurd' ? `<button class="knop knop--messing knop--breed" data-a="akkoordVastleggen" data-type="offerte" data-id="${o.id}">${i('vink', 'i--s')} Akkoord vastleggen</button><button class="knop knop--rand knop--breed" data-a="offerteStatus" data-id="${o.id}" data-s="afgewezen">Afgewezen</button><button class="knop knop--rand knop--breed" data-a="offerteStatus" data-id="${o.id}" data-s="concept">Terug naar concept</button>` : ''}
            ${o.status === 'akkoord' && !o.project ? `<button class="knop knop--messing knop--breed knop--groot" data-a="naarProject" data-id="${o.id}">${i('map', 'i--s')} Omzetten naar project</button>` : ''}
            ${o.project ? `<a class="knop knop--breed" href="#/projecten/${o.project}">${i('map', 'i--s')} Naar het project</a>` : ''}
          </div>
          ${ak ? `<div class="melding melding--blauw" style="margin:0 16px 16px"><b>Akkoord</b> van ${esc(ak.naam)}, ${ak.wijze}, ${C.datum(ak.op, { day: 'numeric', month: 'long', year: 'numeric' })} om ${C.tijd(ak.op)}.<br><span class="klein">Vastgelegd met momentopname (${esc(ak.hash)}).</span></div>` : ''}
        </div>
      </div></div>`,
      na: () => {
        if (!bewerk) return;
        const intro = C.$('[data-intro]'); if (intro) intro.addEventListener('change', () => { o.intro = intro.value; C.wijzig(); });
        C.$('#regels').addEventListener('change', (e) => {
          const el = e.target.closest('[data-rv]'); if (!el) return;
          const n = Number(el.closest('[data-regel]').dataset.regel); const r = o.regels[n]; const v = el.dataset.rv;
          if (v === 'prijs') { const c = C.parseEur(el.value); if (Number.isNaN(c)) { el.setAttribute('aria-invalid', 'true'); C.toast('Ongeldig bedrag. Gebruik bijvoorbeeld 34,50.', 'let'); return; } el.removeAttribute('aria-invalid'); r.prijs = c; el.value = prijsTekst(c); }
          else if (v === 'aantal') { const a = Number(String(el.value).replace(',', '.')); if (!Number.isFinite(a) || a < 0) { el.setAttribute('aria-invalid', 'true'); C.toast('Ongeldig aantal.', 'let'); return; } el.removeAttribute('aria-invalid'); r.aantal = a; }
          else if (v === 'btw') { r.btw = Number(el.value); }
          else r[v] = el.value;
          el.closest('[data-regel]').querySelector('[data-tot]').textContent = eur(C.regelTotaal(r));
          C.$('#som').innerHTML = C.totalenHtml(o);
          C.wijzig();
        });
      },
    };
  };
  C.A.regelErbij = (el) => { const o = C.get('offertes', location.hash.split('/')[2]); const s = el.dataset.soort; const at = o.regels.map((r) => r.sectie).lastIndexOf(el.dataset.sectie); const r = { sectie: el.dataset.sectie, soort: s, omschrijving: '', aantal: 0, eenheid: s === 'arbeid' ? 'uur' : s === 'materiaal' ? 'st' : 'post', prijs: s === 'arbeid' ? C.db.instellingen.uurtarief : 0, btw: 21 }; o.regels.splice(at < 0 ? o.regels.length : at + 1, 0, r); C.wijzig(); C.route(); };
  C.A.sectieErbij = () => { const naam = prompt('Naam van het onderdeel, bijvoorbeeld "Tegelwerk"'); if (!naam) return; const o = C.get('offertes', location.hash.split('/')[2]); o.regels.push({ sectie: naam.trim(), soort: 'arbeid', omschrijving: '', aantal: 0, eenheid: 'uur', prijs: C.db.instellingen.uurtarief, btw: 21 }); C.wijzig(); C.route(); };
  C.A.regelWeg = async (el) => { const o = C.get('offertes', location.hash.split('/')[2]); const r = o.regels[Number(el.dataset.n)]; if (await C.bevestig('Regel verwijderen?', `<p>${esc(r.omschrijving || 'Lege regel')}</p>`, 'Verwijderen')) { o.regels.splice(Number(el.dataset.n), 1); C.wijzig('Regel verwijderd.'); C.route(); } };
  C.A.offerteStatus = (el) => { const o = C.get('offertes', el.dataset.id); o.status = el.dataset.s; C.log('offerte', o.id, o.project, `Offerte ${o.nummer}: ${C.ST.offerte[o.status][0]}`); if (o.aanvraag && o.status === 'afgewezen') C.get('aanvragen', o.aanvraag).status = 'verloren'; C.wijzig('Status bijgewerkt.'); C.schil(); C.route(); };
  C.A.offerteVersturen = async (el) => {
    const o = C.get('offertes', el.dataset.id); const k = C.klant(o.klant); const r = C.reken(o.regels);
    if (C.isOffline()) { C.toast('Versturen kan alleen met verbinding. De offerte blijft als concept bewaard.', 'offline'); return; }
    const leeg = o.regels.filter((x) => !Number(x.aantal) || !Number(x.prijs)).length;
    if (!o.regels.length) { C.toast('Een lege offerte kan niet worden verstuurd.', 'let'); return; }
    const ok = await C.bevestig('Offerte versturen?', `<p>Controleer de offerte voordat hij de deur uit gaat.</p>
      <dl class="totalen" style="padding:12px 0"><div><dt>Aan</dt><dd>${esc(k.naam)} &lt;${esc(k.mail || 'geen e-mailadres')}&gt;</dd></div><div><dt>Offerte</dt><dd>${o.nummer}, ${esc(o.titel)}</dd></div><div><dt>Totaal incl. btw</dt><dd><b>${eur(r.incl)}</b></dd></div><div><dt>Bijlage</dt><dd>PDF + link naar de projectpagina voor akkoord</dd></div></dl>
      ${leeg ? `<div class="melding melding--rood">${leeg} ${leeg === 1 ? 'regel heeft' : 'regels hebben'} geen aantal of prijs.</div>` : ''}
      ${!k.mail ? '<div class="melding melding--rood">De klant heeft geen e-mailadres. Voeg dat eerst toe op de klantkaart.</div>' : ''}
      <p class="klein" style="margin-top:10px">Preview: er wordt niets echt verstuurd.</p>`, 'Versturen', 'messing');
    if (!ok) return;
    if (!k.mail) { C.toast('Niet verstuurd: geen e-mailadres.', 'let'); return; }
    o.status = 'verstuurd'; o.verstuurd = new Date().toISOString();
    if (o.aanvraag) C.get('aanvragen', o.aanvraag).status = 'offerte_verzonden';
    C.db.contact.push({ id: C.id('c'), klant: k.id, soort: 'mail', tekst: `Offerte ${o.nummer} verstuurd.`, op: o.verstuurd });
    C.log('offerte', o.id, o.project, `Offerte ${o.nummer} verstuurd naar ${k.naam}`);
    C.wijzig('Offerte verstuurd (preview).'); C.schil(); C.route();
  };
  C.snapshotHash = async (obj) => {
    const tekst = JSON.stringify(obj);
    if (crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst)); const h = [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); return h.slice(0, 6) + '…' + h.slice(-4); }
    return 'zonder-hash';
  };
  C.maakAkkoord = async (type, id, naam, wijze, snapshot) => {
    const ak = { id: C.id('ak'), type, onderwerp: id, naam, wijze, op: new Date().toISOString(), hash: await C.snapshotHash(snapshot), momentopname: snapshot };
    C.db.akkoorden.push(ak); return ak;
  };
  C.A.akkoordVastleggen = (el) => {
    const type = el.dataset.type, id = el.dataset.id;
    C.blad('Akkoord vastleggen', `<form class="form" data-f="akkoord" novalidate><input type="hidden" name="type" value="${type}"><input type="hidden" name="id" value="${id}">
      <p class="sub">Gebruik dit als de klant niet via de projectpagina akkoord gaf, maar telefonisch, per mail of op papier.</p>
      <fieldset class="veld" style="border:0;padding:0;margin:0"><legend>Hoe gaf de klant akkoord?</legend><div class="keuze">${['telefonisch', 'mail', 'papier'].map((w, n) => `<label><input type="radio" name="wijze" value="${w}" ${n === 0 ? 'checked' : ''}><span>${w}</span></label>`).join('')}</div></fieldset>
      <label class="veld"><span>Naam van wie akkoord gaf</span><input class="inp" name="naam" required autocomplete="off"></label>
      <p class="fout" id="fout-ak" role="alert"></p>
      <button class="knop knop--messing knop--groot">Akkoord vastleggen</button></form>`);
  };
  C.F.akkoord = async (f, d) => {
    if (!d.naam.trim()) { C.$('#fout-ak').textContent = 'Vul de naam in van wie akkoord gaf.'; return; }
    if (d.type === 'offerte') {
      const o = C.get('offertes', d.id); const ak = await C.maakAkkoord('offerte', o.id, d.naam.trim(), d.wijze, { nummer: o.nummer, regels: o.regels, totaal: C.reken(o.regels) });
      o.status = 'akkoord'; o.akkoord = ak.id; C.log('akkoord', ak.id, o.project, `Offerte ${o.nummer} akkoord (${d.wijze}, ${d.naam.trim()})`, true);
    } else if (d.type === 'meerwerk') {
      const m = C.get('meerwerk', d.id); const ak = await C.maakAkkoord('meerwerk', m.id, d.naam.trim(), d.wijze, { ...m });
      m.status = 'akkoord'; m.akkoord = ak.id; C.log('akkoord', ak.id, m.project, `Meerwerk ${m.nummer} akkoord (${d.wijze}, ${d.naam.trim()})`, true);
    }
    C.sluit(); C.wijzig('Akkoord vastgelegd.'); C.schil(); C.route();
  };
  C.A.naarProject = (el) => {
    const o = C.get('offertes', el.dataset.id); const k = C.klant(o.klant);
    const p = { id: C.id('p'), nummer: C.nummer('P'), klant: k.id, offerte: o.id, naam: o.titel, soort: o.sjabloon || 'leeg', adres: o.werkadres, diensten: [], omschrijving: o.intro || '', status: 'voorbereiding', start: null, eind: null, portaal: true };
    C.db.projecten.push(p); o.project = p.id;
    [...new Set(o.regels.map((r) => r.sectie))].forEach((s) => C.db.taken.push({ id: C.id('t'), project: p.id, titel: s, klaar: null, deadline: null }));
    o.regels.filter((r) => r.soort === 'materiaal').forEach((r) => C.db.materialen.push({ id: C.id('m'), project: p.id, omschrijving: r.omschrijving, aantal: r.aantal, eenheid: r.eenheid, prijs: r.prijs, leverancier: '', status: 'nodig' }));
    if (o.aanvraag) C.get('aanvragen', o.aanvraag).status = 'gewonnen';
    C.log('project', p.id, p.id, `Project ${p.nummer} aangemaakt uit offerte ${o.nummer}; taken en materialen overgenomen`, true);
    C.wijzig('Project aangemaakt.'); C.schil(); C.ga(`#/projecten/${p.id}`);
  };
  C.S.offerteA4 = (id) => {
    const o = C.get('offertes', id); const k = C.klant(o.klant); const s = C.db.instellingen; const r = C.reken(o.regels);
    const ontbreekt = (v, n) => v ? esc(v) : `<span class="ontbreekt">${n} ontbreekt</span>`;
    const secties = [...new Set(o.regels.map((x) => x.sectie))];
    return {
      titel: `${o.nummer} als A4`, terug: `#/offertes/${o.id}`, nav: 'offertes',
      html: `<div class="a4-werkbalk"><a class="knop knop--rand" href="#/offertes/${o.id}">${i('terug', 'i--s')} Terug</a><button class="knop" onclick="print()">${i('print', 'i--s')} Afdrukken of opslaan als PDF</button></div>
      <article class="a4"><div class="a4-kop"><div style="display:flex;gap:12px;align-items:center;color:var(--navy)"><span style="width:56px;color:var(--brass)">${C.LOGO}</span><div><b style="font:400 24px var(--serif)">MSBouw</b><br><span style="font-size:11px;letter-spacing:.14em;text-transform:uppercase">Renovatie &amp; Totaalverbouwing</span></div></div>
        <div style="text-align:right;font-size:13px">${esc(s.eigenaar)}<br>${ontbreekt(s.adres, 'Adres')}<br>${esc(s.plaats)}<br>${esc(s.tel)} · ${esc(s.mail)}<br>KvK: ${ontbreekt(s.kvk, 'KvK-nummer')} · Btw: ${ontbreekt(s.btwnr, 'btw-nummer')}<br>IBAN: ${ontbreekt(s.iban, 'IBAN')}</div></div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-top:24px"><div>${esc(k.naam)}<br>${esc(k.straat)}<br>${esc([k.postcode, k.plaats].filter(Boolean).join(' '))}</div><div style="text-align:right">Offerte ${o.nummer}<br>Datum ${C.datum(o.datum, { day: 'numeric', month: 'long', year: 'numeric' })}<br>Geldig tot ${C.datum(o.geldigTot, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
        <h1>${esc(o.titel)}</h1><p>Werkadres: ${esc(o.werkadres)}</p>${o.intro ? `<p style="margin-top:10px">${esc(o.intro)}</p>` : ''}
        <table class="tabel" style="margin-top:18px"><thead><tr><th>Omschrijving</th><th class="r">Aantal</th><th class="r">Prijs</th><th class="r">Btw</th><th class="r">Bedrag</th></tr></thead>
        <tbody>${secties.map((sec) => `<tr><td colspan="5" style="font-weight:700;background:#F4F1EA">${esc(sec)}</td></tr>${o.regels.filter((x) => x.sectie === sec).map((x) => `<tr><td>${esc(x.omschrijving)}</td><td class="r">${String(x.aantal).replace('.', ',')} ${esc(x.eenheid)}</td><td class="r">${eur(x.prijs)}</td><td class="r">${x.btw}%</td><td class="r">${eur(C.regelTotaal(x))}</td></tr>`).join('')}`).join('')}</tbody></table>
        <div class="totalen" style="max-width:340px;margin-left:auto;padding:16px 0"><div><span>Totaal excl. btw</span><b>${eur(r.excl)}</b></div>${r.tarieven.map((t) => `<div><span>Btw ${t.t}% over ${eur(t.grondslag)}</span><span>${eur(t.btw)}</span></div>`).join('')}<div class="groot"><span>Totaal incl. btw</span><span>${eur(r.incl)}</span></div></div>
        <p style="margin-top:12px">Akkoord? Dat kan via de link naar uw projectpagina in de e-mail, of door deze offerte ondertekend terug te sturen.</p>
        <p style="margin-top:8px;font-size:12px;color:#555">${s.voorwaarden ? esc(s.voorwaarden) : '<span class="ontbreekt">Algemene voorwaarden ontbreken (instellingen).</span>'}</p>
        <p style="margin-top:20px;font-size:12px;color:#555">Voorbeeldofferte uit de preview van MS Bouw Cockpit. Bedragen zijn voorbeelden.</p></article>`,
    };
  };
})();
