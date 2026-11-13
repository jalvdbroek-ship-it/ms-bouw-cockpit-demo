// Voorbeeldgegevens voor de preview. Alles met "(vb)" en nummers met "VB-" is verzonnen testmateriaal.
// Bedrijfsgegevens komen van de website. Foto's zijn echte MSBouw-projecten van de website, hier gekoppeld aan voorbeeldklanten.
window.C = window.C || {};
C.seed = function () {
  const nu = new Date();
  const dag = (n, h = 8, m = 0) => { const d = new Date(nu); d.setHours(h, m, 0, 0); d.setDate(d.getDate() + n); return d.toISOString(); };
  // n werkdagen vanaf vandaag (za en zo overslaan)
  const wd = (n, h = 8, m = 0) => {
    const d = new Date(nu); d.setHours(h, m, 0, 0); const stap = n < 0 ? -1 : 1; let r = Math.abs(n);
    while (r > 0) { d.setDate(d.getDate() + stap); if (d.getDay() !== 0 && d.getDay() !== 6) r--; }
    return d.toISOString();
  };
  const T = 5000; // voorbeeld-uurtarief in centen
  const R = (sectie, soort, omschrijving, aantal, eenheid, prijs, btw = 21) => ({ sectie, soort, omschrijving, aantal, eenheid, prijs, btw });

  const klanten = [
    { id: 'k1', soort: 'particulier', naam: 'Fam. Jansen (vb)', tel: '06 0000 0001', mail: 'jansen@voorbeeld.nl', straat: 'Voorbeeldlaan 12', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: true, notities: 'Hond in huis, sleutel bij de buren op nr. 14 (vb).' },
    { id: 'k2', soort: 'particulier', naam: 'Mevr. De Boer (vb)', tel: '06 0000 0002', mail: 'deboer@voorbeeld.nl', straat: 'Proefstraat 3', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: false, notities: '' },
    { id: 'k3', soort: 'particulier', naam: 'Dhr. Smit (vb)', tel: '06 0000 0003', mail: 'smit@voorbeeld.nl', straat: 'Testweg 7', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: true, notities: '' },
    { id: 'k4', soort: 'particulier', naam: 'Fam. Mulder (vb)', tel: '06 0000 0004', mail: 'mulder@voorbeeld.nl', straat: 'Oefenhof 21', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: true, notities: 'Tevreden; wil later ook de overloop laten doen.' },
    { id: 'k5', soort: 'verzekeraar', naam: 'Voorbeeld Verzekeringen (vb)', tel: '010 000 0000', mail: 'schade@voorbeeld.nl', straat: 'Postbus 1', postcode: '0000 VB', plaats: 'Rotterdam', toestemmingFotos: false, notities: 'Schadebehandelaar: mevr. Kramer (vb).' },
    { id: 'k6', soort: 'particulier', naam: 'Fam. Bos (vb)', tel: '06 0000 0006', mail: 'bos@voorbeeld.nl', straat: 'Monsterkade 5', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: false, notities: 'Bewoner bij schadeproject; opdrachtgever is de verzekeraar.' },
    { id: 'k7', soort: 'particulier', naam: 'Fam. Meijer (vb)', tel: '06 0000 0007', mail: 'meijer@voorbeeld.nl', straat: 'Schetsweg 40', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: false, notities: '' },
    { id: 'k8', soort: 'particulier', naam: 'Dhr. Kok (vb)', tel: '06 0000 0008', mail: 'kok@voorbeeld.nl', straat: 'Ontwerplaan 2', postcode: '0000 VB', plaats: 'Rozenburg', toestemmingFotos: false, notities: '' },
  ];

  const aanvragen = [
    { id: 'a1', nummer: 'VB-A-011', klant: null, naam: 'Dhr. Peters (vb)', tel: '06 0000 0011', mail: 'peters@voorbeeld.nl', adres: 'Oefenweg 9, Rozenburg', dienst: 'Badkamer of toilet', bron: 'website', bericht: 'Wij willen ons toilet beneden laten vernieuwen. Hangend toilet, nieuwe tegels. Wanneer kunt u langskomen?', status: 'nieuw', ontvangen: dag(0, 7, 5), herinnering: null },
    { id: 'a2', nummer: 'VB-A-010', klant: null, naam: 'Jansen (vb)', tel: '06 0000 0001', mail: '', adres: '', dienst: 'Maatwerk timmerwerk', bron: 'telefoon', bericht: 'Belde over een vaste kast op zolder, na de badkamer.', status: 'contact', ontvangen: dag(-1, 18, 40), herinnering: dag(0, 12, 0) },
    { id: 'a3', nummer: 'VB-A-009', klant: null, naam: 'Mevr. Van Dam (vb)', tel: '06 0000 0009', mail: 'vandam@voorbeeld.nl', adres: 'Probeerpad 18, Rozenburg', dienst: 'Complete renovatie', bron: 'mail', bericht: 'Benedenverdieping: keuken eruit, wand weg, nieuwe vloer. Graag een afspraak.', status: 'afspraak', ontvangen: dag(-3, 9, 12), herinnering: null },
    { id: 'a4', nummer: 'VB-A-008', klant: 'k8', naam: 'Dhr. Kok (vb)', tel: '06 0000 0008', mail: 'kok@voorbeeld.nl', adres: 'Ontwerplaan 2, Rozenburg', dienst: 'Maatwerk timmerwerk', bron: 'website', bericht: 'Kast met schuifdeuren in de slaapkamer, van vloer tot plafond.', status: 'offerte_maken', ontvangen: dag(-6, 20, 15), herinnering: dag(1, 9, 0) },
    { id: 'a5', nummer: 'VB-A-007', klant: 'k7', naam: 'Fam. Meijer (vb)', tel: '06 0000 0007', mail: 'meijer@voorbeeld.nl', adres: 'Schetsweg 40, Rozenburg', dienst: 'Gevel of buitenwerk', bron: 'mondeling', bericht: 'Houten gevelbekleding achterzijde, via buren.', status: 'offerte_verzonden', ontvangen: dag(-15, 11, 0), herinnering: dag(0, 10, 0) },
    { id: 'a6', nummer: 'VB-A-006', klant: null, naam: 'Fam. De Wit (vb)', tel: '06 0000 0012', mail: '', adres: '', dienst: 'Traprenovatie', bron: 'telefoon', bericht: 'Trap wilde het voor de kerst klaar hebben.', status: 'verloren', reden: 'Planning paste niet', ontvangen: dag(-24, 13, 0), herinnering: null },
    { id: 'a7', nummer: 'VB-A-005', klant: 'k1', naam: 'Fam. Jansen (vb)', tel: '06 0000 0001', mail: 'jansen@voorbeeld.nl', adres: 'Voorbeeldlaan 12, Rozenburg', dienst: 'Badkamer of toilet', bron: 'website', bericht: 'Badkamer boven helemaal vernieuwen, bad onder de schuinte.', status: 'gewonnen', ontvangen: dag(-40, 10, 0), herinnering: null },
  ];

  const offertes = [
    { id: 'o1', nummer: 'VB-O-001', klant: 'k1', aanvraag: 'a7', project: 'p1', titel: 'Badkamer renovatie', werkadres: 'Voorbeeldlaan 12, Rozenburg', status: 'akkoord', datum: dag(-30), geldigTot: dag(0), verstuurd: dag(-30), akkoord: 'ak1',
      intro: 'Naar aanleiding van ons gesprek bied ik u de renovatie van de badkamer boven aan.',
      regels: [R('Sloop', 'arbeid', 'Sloop bestaande badkamer, afvoer puin', 16, 'uur', T), R('Sloop', 'overig', 'Container en stortkosten', 1, 'post', 38500),
        R('Installatie', 'arbeid', 'Leidingwerk en afvoer aanpassen', 10, 'uur', T), R('Installatie', 'materiaal', 'Leiding- en afvoermateriaal', 1, 'post', 24000),
        R('Tegelwerk', 'arbeid', 'Tegelwerk wanden en vloer', 32, 'uur', T), R('Tegelwerk', 'materiaal', 'Wandtegels 30x60, keuze klant', 18, 'm²', 3450), R('Tegelwerk', 'materiaal', 'Vloertegels 60x60', 6, 'm²', 4200), R('Tegelwerk', 'materiaal', 'Tegellijm en voegmiddel', 1, 'post', 18500),
        R('Sanitair', 'materiaal', 'Ligbad met houten opbouw', 1, 'st', 64500), R('Sanitair', 'materiaal', 'Inbouwspots IP44', 4, 'st', 3900), R('Sanitair', 'arbeid', 'Plaatsen sanitair, kitwerk en afwerking', 12, 'uur', T)] },
    { id: 'o2', nummer: 'VB-O-002', klant: 'k7', aanvraag: 'a5', project: null, titel: 'Gevelbekleding achterzijde', werkadres: 'Schetsweg 40, Rozenburg', status: 'verstuurd', datum: dag(-9), geldigTot: dag(21), verstuurd: dag(-9),
      intro: 'Hierbij de offerte voor houten gevelbekleding aan de achterzijde.',
      regels: [R('Voorbereiding', 'overig', 'Steigerhuur, 2 weken', 1, 'post', 42000), R('Gevel', 'arbeid', 'Regelwerk en bekleding monteren', 40, 'uur', T), R('Gevel', 'materiaal', 'Gevelbekleding hout', 22, 'm²', 6800), R('Gevel', 'materiaal', 'Regelwerk en bevestigingsmateriaal', 1, 'post', 14500)] },
    { id: 'o3', nummer: 'VB-O-003', klant: 'k8', aanvraag: 'a4', project: null, titel: 'Kast met schuifdeuren', werkadres: 'Ontwerplaan 2, Rozenburg', status: 'concept', datum: dag(-1), geldigTot: dag(29),
      intro: '',
      regels: [R('Maatwerk', 'arbeid', 'Kast maken en plaatsen, vloer tot plafond', 18, 'uur', T), R('Maatwerk', 'materiaal', 'Plaatmateriaal, schuifdeursysteem en beslag', 1, 'post', 0)] },
    { id: 'o4', nummer: 'VB-O-004', klant: 'k2', aanvraag: null, project: 'p2', titel: 'Traprenovatie', werkadres: 'Proefstraat 3, Rozenburg', status: 'akkoord', datum: dag(-14), geldigTot: dag(16), verstuurd: dag(-14), akkoord: 'ak2',
      intro: 'Uw bestaande trap vernieuwd met eiken treden en witte stootborden.',
      regels: [R('Trap', 'arbeid', 'Oude bekleding verwijderen, treden en stootborden plaatsen', 14, 'uur', T), R('Trap', 'materiaal', 'Eiken traptreden op maat', 13, 'st', 8900), R('Trap', 'materiaal', 'Stootborden wit', 13, 'st', 2200), R('Trap', 'arbeid', 'Trapgat afwerken', 4, 'uur', T)] },
  ];

  const projecten = [
    { id: 'p1', nummer: 'VB-P-001', klant: 'k1', offerte: 'o1', naam: 'Badkamer renovatie', soort: 'badkamer', adres: 'Voorbeeldlaan 12, Rozenburg', diensten: ['Badkamer en sanitair'], omschrijving: 'Badkamer boven volledig vernieuwen: sloop, leidingwerk, ligbad onder de schuinte met houten opbouw, tegelwerk, inbouwspots.', status: 'uitvoering', start: wd(-6), eind: wd(5), portaal: true },
    { id: 'p2', nummer: 'VB-P-002', klant: 'k2', offerte: 'o4', naam: 'Traprenovatie', soort: 'trap', adres: 'Proefstraat 3, Rozenburg', diensten: ['Traprenovatie'], omschrijving: 'Bestaande trap vernieuwen met eiken treden en witte stootborden; trapgat afwerken.', status: 'gepland', start: wd(3), eind: wd(5), portaal: true },
    { id: 'p3', nummer: 'VB-P-003', klant: 'k3', offerte: null, naam: 'Dakraam plaatsen', soort: 'dakraam', adres: 'Testweg 7, Rozenburg', diensten: ['Dakramen en daglicht'], omschrijving: 'Dakraam op zolder geplaatst, aftimmering binnen. Klaar voor oplevering.', status: 'oplevering', start: wd(-12), eind: wd(4), portaal: true },
    { id: 'p4', nummer: 'VB-P-004', klant: 'k6', opdrachtgever: 'k5', schadenummer: 'VB-SCH-2026-104', offerte: null, naam: 'Herstel waterschade plafond', soort: 'schade', adres: 'Monsterkade 5, Rozenburg', diensten: ['Schadeherstel en onderhoud'], omschrijving: 'Plafond keuken na lekkage van boven: verwijderen, drogen, nieuw plafond en stucwerk.', status: 'wacht', wachtOp: 'akkoord verzekeraar', start: null, eind: null, portaal: false },
    { id: 'p5', nummer: 'VB-P-005', klant: 'k4', offerte: null, naam: 'Traprenovatie donker', soort: 'trap', adres: 'Oefenhof 21, Rozenburg', diensten: ['Traprenovatie'], omschrijving: 'Kale treden vervangen door donkere treden met witte stootborden.', status: 'nazorg', start: dag(-48), eind: dag(-42), portaal: true },
  ];

  const planning = [
    { id: 'pl1', project: 'p1', soort: 'werk', titel: 'Tegelwerk wanden', start: dag(0, 7, 30), eind: dag(0, 16, 0) },
    { id: 'pl2', project: 'p1', soort: 'werk', titel: 'Tegelwerk vloer', start: wd(1, 7, 30), eind: wd(1, 16, 0) },
    { id: 'pl3', project: 'p1', soort: 'werk', titel: 'Sanitair plaatsen', start: wd(2, 7, 30), eind: wd(2, 16, 0) },
    { id: 'pl4', aanvraag: 'a3', soort: 'afspraak', titel: 'Opname bij Mevr. Van Dam (vb)', start: wd(1, 17, 0), eind: wd(1, 18, 0) },
    { id: 'pl5', project: 'p2', soort: 'levering', titel: 'Levering eiken treden', start: wd(2, 10, 0), eind: wd(2, 10, 30) },
    { id: 'pl6', project: 'p2', soort: 'werk', titel: 'Trap: bekleding eraf, treden plaatsen', start: wd(3, 7, 30), eind: wd(3, 16, 0) },
    { id: 'pl7', project: 'p2', soort: 'werk', titel: 'Trap: stootborden en trapgat', start: wd(4, 7, 30), eind: wd(4, 16, 0) },
    { id: 'pl8', project: 'p3', soort: 'afspraak', titel: 'Oplevering dakraam', start: wd(4, 16, 30), eind: wd(4, 17, 15) },
    { id: 'pl9', klant: 'k7', soort: 'herinnering', titel: 'Offerte VB-O-002 nabellen', start: dag(0, 12, 30), eind: dag(0, 12, 45) },
    { id: 'pl10', project: 'p4', soort: 'afspraak', titel: 'Schade-expert ter plaatse', start: wd(6, 9, 0), eind: wd(6, 10, 0) },
    { id: 'pl11', project: 'p5', soort: 'herinnering', titel: 'Nazorg: trap nalopen bij Fam. Mulder (vb)', start: dag(48, 9, 0), eind: dag(48, 9, 15) },
  ];

  const tk = (project, titel, klaar, deadline = null) => ({ project, titel, klaar, deadline });
  const taken = [
    tk('p1', 'Sloop oude badkamer', dag(-6)), tk('p1', 'Leidingwerk en afvoer aanpassen', dag(-2)), tk('p1', 'Houten opbouw ligbad', dag(-1)),
    tk('p1', 'Tegelwerk wanden', null, dag(0)), tk('p1', 'Tegelwerk vloer', null, wd(1)), tk('p1', 'Sanitair en spots plaatsen', null, wd(2)), tk('p1', 'Kitwerk en schoonmaken', null, wd(4)),
    tk('p2', 'Treden opmeten', dag(-15)), tk('p2', 'Treden bestellen', dag(-12)), tk('p2', 'Oude bekleding verwijderen', null, wd(3)), tk('p2', 'Treden en stootborden plaatsen', null, wd(4)), tk('p2', 'Trapgat afwerken', null, wd(5)),
    tk('p3', 'Dakraam plaatsen', dag(-10)), tk('p3', 'Aftimmering binnen', dag(-6)), tk('p3', 'Kitwerk buitenzijde nalopen', null, wd(3)),
    tk('p4', "Schadefoto's maken", dag(-5)), tk('p4', 'Offerte naar verzekeraar', dag(-4)), tk('p4', 'Akkoord verzekeraar afwachten', null, wd(5)),
    tk('p5', 'Treden plaatsen', dag(-44)), tk('p5', 'Stootborden en afwerking', dag(-42)),
  ].map((t, i) => ({ id: 't' + (i + 1), ...t }));

  const werkbonnen = [
    { id: 'wb1', project: 'p1', nummer: 'VB-W-014', datum: wd(-2), minuten: 480, werkzaamheden: 'Leidingwerk aangepast, afvoer bad verlegd en getest op lekkage.', bijzonderheden: 'Oude afvoer bleek gietijzer; meegenomen in de prijs.', openstaand: '', materiaal: [['Leiding- en afvoermateriaal', 1, 'post']], getekend: null },
    { id: 'wb2', project: 'p1', nummer: 'VB-W-015', datum: wd(-1), minuten: 510, werkzaamheden: 'Houten opbouw voor het ligbad gemaakt, wanden voorbereid voor tegelwerk.', bijzonderheden: 'Klant vraagt om een nis in de douchewand: meerwerk opgesteld.', openstaand: 'Inbouwspots nog bestellen.', materiaal: [['Regelwerk en plaat', 1, 'post']], getekend: null },
    { id: 'wb3', project: 'p3', nummer: 'VB-W-012', datum: dag(-10), minuten: 450, werkzaamheden: 'Dakraam geplaatst en waterdicht aangesloten.', bijzonderheden: '', openstaand: 'Aftimmering binnen.', materiaal: [['Dakraam met gootstuk', 1, 'st']], getekend: 'Dhr. Smit (vb)' },
  ];
  const uren = [
    { id: 'u1', project: 'p1', datum: wd(-2), minuten: 480, omschrijving: 'Leidingwerk', werkbon: 'wb1' },
    { id: 'u2', project: 'p1', datum: wd(-1), minuten: 510, omschrijving: 'Opbouw bad', werkbon: 'wb2' },
    { id: 'u3', project: 'p1', datum: wd(-6), minuten: 960, omschrijving: 'Sloop (2 dagen)', werkbon: null },
    { id: 'u4', project: 'p3', datum: dag(-10), minuten: 450, omschrijving: 'Dakraam plaatsen', werkbon: 'wb3' },
    { id: 'u5', project: 'p3', datum: dag(-6), minuten: 360, omschrijving: 'Aftimmering', werkbon: null },
  ];
  const m = (project, omschrijving, aantal, eenheid, prijs, leverancier, status) => ({ project, omschrijving, aantal, eenheid, prijs, leverancier, status });
  const materialen = [
    m('p1', 'Wandtegels 30x60', 18, 'm²', 3450, 'Tegelhandel (vb)', 'geleverd'), m('p1', 'Vloertegels 60x60', 6, 'm²', 4200, 'Tegelhandel (vb)', 'besteld'),
    m('p1', 'Tegellijm', 6, 'zak', 1650, 'Bouwmaterialen (vb)', 'geleverd'), m('p1', 'Ligbad 170x75', 1, 'st', 64500, 'Sanitairgroothandel (vb)', 'verwerkt'),
    m('p1', 'Inbouwspots IP44', 4, 'st', 3900, 'Elektrogroothandel (vb)', 'nodig'), m('p1', 'Sanitairkit wit', 3, 'koker', 890, 'Bouwmaterialen (vb)', 'nodig'),
    m('p2', 'Eiken traptreden op maat', 13, 'st', 8900, 'Houthandel (vb)', 'besteld'), m('p2', 'Stootborden wit', 13, 'st', 2200, 'Houthandel (vb)', 'besteld'),
    m('p3', 'Dakraam met gootstuk', 1, 'st', 0, 'Groothandel (vb)', 'verwerkt'),
  ].map((x, i) => ({ id: 'm' + (i + 1), ...x }));

  const fotos = [
    { id: 'f1', project: 'p1', categorie: 'tijdens', src: 'assets/img/bad-dakschuin-voor-800.webp', omschrijving: 'Houten opbouw van het ligbad onder de schuinte', datum: wd(-1, 15, 20), social: 'nee' },
    { id: 'f2', project: 'p2', categorie: 'begin', src: 'assets/img/trap-eiken-voor-640.webp', omschrijving: 'Huidige trap: versleten treden', datum: dag(-15, 10, 0), social: 'nee' },
    { id: 'f3', project: 'p5', categorie: 'begin', src: 'assets/img/trap-donker-voor-640.webp', omschrijving: 'Kale treden bij aanvang', datum: dag(-48, 8, 10), social: 'nee', paar: 'x1' },
    { id: 'f4', project: 'p5', categorie: 'tijdens', src: 'assets/img/trap-donker-tussen-640.webp', omschrijving: 'Treden geplaatst, stootborden volgen', datum: dag(-44, 15, 0), social: 'nee' },
    { id: 'f5', project: 'p5', categorie: 'eind', src: 'assets/img/trap-donker-na-640.webp', omschrijving: 'Donkere treden, witte stootborden', datum: dag(-42, 16, 0), social: 'kandidaat', paar: 'x1' },
  ];

  const meerwerk = [
    { id: 'mw1', project: 'p1', nummer: 'VB-M-003', omschrijving: 'Extra inbouwnis in de douchewand, 30 x 60 cm, betegeld', minuten: 240, materiaal: 6500, prijs: 26500, btw: 21, status: 'verstuurd', datum: dag(-1, 16, 10), akkoord: null },
    { id: 'mw2', project: 'p5', nummer: 'VB-M-002', omschrijving: 'Extra stootbord bij de trapopgang', minuten: 60, materiaal: 2200, prijs: 7200, btw: 21, status: 'akkoord', datum: dag(-45), akkoord: 'ak3' },
  ];
  const akkoorden = [
    { id: 'ak1', type: 'offerte', onderwerp: 'o1', naam: 'J. Jansen (vb)', wijze: 'link', op: dag(-28, 20, 14), hash: 'vb-3f9a…c21e' },
    { id: 'ak2', type: 'offerte', onderwerp: 'o4', naam: 'A. de Boer (vb)', wijze: 'telefonisch', op: dag(-9, 11, 2), hash: 'vb-81d0…7a44' },
    { id: 'ak3', type: 'meerwerk', onderwerp: 'mw2', naam: 'P. Mulder (vb)', wijze: 'handtekening', op: dag(-45, 14, 30), hash: 'vb-c2b7…09f1' },
    { id: 'ak4', type: 'oplevering', onderwerp: 'p5', naam: 'P. Mulder (vb)', wijze: 'handtekening', op: dag(-42, 16, 30), hash: 'vb-5e11…aa30' },
  ];
  const opleveringen = [
    { id: 'op1', project: 'p3', checklist: { 'Dakraam opent en sluit soepel': true, 'Waterdicht aangesloten, gootstuk gecontroleerd': true, 'Aftimmering en afwerking binnen': true, 'Kitwerk netjes en dicht': false, 'Bediening en onderhoud uitgelegd': false, 'Werkplek schoon opgeleverd': false }, punten: [{ id: 'pp1', tekst: 'Plint naast dakraam opnieuw bevestigen', klaar: false }], dossier: { 'Productinformatie dakraam': true, 'Gebruiks- en onderhoudsinformatie': false, 'Garantiebewijs': false, "Foto's van de uitvoering": false }, akkoord: null, nazorg: null },
    { id: 'op2', project: 'p5', checklist: { 'Treden vast en zonder kraken': true, 'Stootborden strak aangesloten': true, 'Trapgat afgewerkt': true, 'Werkplek schoon opgeleverd': true }, punten: [], dossier: { 'Beschrijving materialen': true, 'Onderhoudsadvies treden': true, "Foto's van de uitvoering": true }, akkoord: 'ak4', nazorg: dag(48) },
  ];
  const facturen = [
    { id: 'fa1', nummer: 'VB-F-021', project: 'p5', soort: 'eind', status: 'betaald', datum: dag(-41), betaald: dag(-30), regels: [['Traprenovatie volgens afspraak', 1, 186000, 21], ['Meerwerk VB-M-002: extra stootbord', 1, 7200, 21]] },
  ];
  const berichten = [
    { id: 'b1', project: 'p1', richting: 'van', tekst: 'Kunnen de tegels in de nis dezelfde zijn als op de wand?', op: dag(-1, 19, 2), gelezen: false },
    { id: 'b2', project: 'p2', richting: 'van', tekst: 'Gaat de start van de trap volgende week nog door?', op: dag(0, 7, 12), gelezen: false },
    { id: 'b3', project: 'p1', richting: 'naar', tekst: 'Ik heb het meerwerk voor de nis klaargezet. U kunt het bekijken en akkoord geven via uw projectpagina.', op: dag(-1, 16, 15), gelezen: true },
  ];
  const contact = [
    { id: 'c1', klant: 'k1', soort: 'bezoek', tekst: 'Opname badkamer, maten genomen.', op: dag(-35, 16, 0) },
    { id: 'c2', klant: 'k1', soort: 'telefoon', tekst: 'Tegelkeuze besproken; klant haalt monsters.', op: dag(-22, 12, 15) },
    { id: 'c3', klant: 'k7', soort: 'mail', tekst: 'Offerte VB-O-002 verstuurd.', op: dag(-9, 17, 0) },
    { id: 'c4', klant: 'k5', soort: 'mail', tekst: 'Offerte herstel plafond naar schadebehandelaar.', op: dag(-4, 15, 30) },
  ];
  const A = (type, id, project, tekst, op, groot = false) => ({ type, id, project, tekst, op, groot });
  const activiteit = [
    A('aanvraag', 'a7', 'p1', 'Aanvraag binnengekomen via de website', dag(-40, 10, 0)),
    A('offerte', 'o1', 'p1', 'Offerte VB-O-001 verstuurd', dag(-30, 17, 0)),
    A('akkoord', 'ak1', 'p1', 'Offerte akkoord gegeven door J. Jansen (vb) via de projectpagina', dag(-28, 20, 14), true),
    A('project', 'p1', 'p1', 'Project aangemaakt uit offerte VB-O-001', dag(-28, 20, 20)),
    A('planning', 'p1', 'p1', 'Start uitvoering: sloop', wd(-6, 7, 30), true),
    A('werkbon', 'wb1', 'p1', 'Werkbon VB-W-014: leidingwerk, 8 uur', wd(-2, 16, 10)),
    A('werkbon', 'wb2', 'p1', 'Werkbon VB-W-015: opbouw bad, 8,5 uur', wd(-1, 16, 5)),
    A('foto', 'f1', 'p1', 'Foto toegevoegd: houten opbouw ligbad', wd(-1, 15, 20)),
    A('meerwerk', 'mw1', 'p1', 'Meerwerk VB-M-003 (inbouwnis) ter akkoord verstuurd', dag(-1, 16, 15), true),
    A('bericht', 'b1', 'p1', 'Bericht van klant: tegels in de nis', dag(-1, 19, 2)),
    A('offerte', 'o4', 'p2', 'Offerte VB-O-004 verstuurd', dag(-14, 9, 0)),
    A('akkoord', 'ak2', 'p2', 'Offerte telefonisch akkoord (vastgelegd door Marcus)', dag(-9, 11, 2), true),
    A('materiaal', 'm7', 'p2', 'Eiken treden besteld bij Houthandel (vb)', dag(-12, 8, 30)),
    A('werkbon', 'wb3', 'p3', 'Werkbon VB-W-012: dakraam geplaatst, getekend door Dhr. Smit (vb)', dag(-10, 16, 0)),
    A('planning', 'pl8', 'p3', 'Oplevering ingepland', dag(-3, 9, 0)),
    A('project', 'p4', 'p4', "Schade opgenomen, foto's gemaakt", dag(-5, 10, 0)),
    A('offerte', 'p4', 'p4', 'Offerte naar Voorbeeld Verzekeringen (vb), schadenummer VB-SCH-2026-104', dag(-4, 15, 30)),
    A('akkoord', 'ak4', 'p5', 'Oplevering bevestigd door P. Mulder (vb)', dag(-42, 16, 30), true),
    A('factuur', 'fa1', 'p5', 'Eindfactuur VB-F-021 verstuurd', dag(-41, 9, 0)),
    A('factuur', 'fa1', 'p5', 'Eindfactuur VB-F-021 betaald', dag(-30, 9, 0)),
  ];

  return {
    versie: 1, gemaakt: nu.toISOString(),
    instellingen: { bedrijf: 'MSBouw Renovatie & Totaalverbouwing', eigenaar: 'Marcus van der Stel', tel: '06 1467 0460', vast: '0181 75 14 64', mail: 'info@MsBouwRozenburg.nl', plaats: 'Rozenburg', adres: '', kvk: '', btwnr: '', iban: '', uurtarief: T, geldigheid: 30, voorwaarden: '' },
    teller: { A: 11, O: 4, P: 5, W: 15, M: 3, F: 21 },
    klanten, aanvragen, offertes, projecten, planning, taken, werkbonnen, uren, materialen, fotos, meerwerk, akkoorden, opleveringen, facturen, berichten, contact, activiteit,
  };
};
