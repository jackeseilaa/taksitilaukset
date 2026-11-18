# Kuljetuskirja – projektiohje

Kommunikoi suomeksi. Rahasummat aina euroina (€). Älä koskaan syötä salasanoja tai tunnuksia.

HUOM: repo on julkinen (GitHub Pages). Älä kirjoita tänne taulukon/Driven tunnisteita, henkilötietoja tai salaisuuksia. Ne ovat käyttäjän muistissa / Apps Script -projektissa.

## Yleiskuva
- PWA: `index.html` (versiotunniste `<div class="v-tag">V38.xx | Päivitetty: pp.kk.2026</div>`, nyt V38.46). Tausta Firestore.
- Syöttää Google Sheetin "Taksi_palkat_2026_v11" container-bound Apps Scriptin (web-app) kautta. doPost ajaa DEPLOYATTUA versiota: uusi versio pitää ottaa käyttöön (Ota käyttöön → Hallinnoi käyttöönottoja → kynä → Uusi versio → Ota käyttöön). Nyt versio 61.
- Taulukon kuukausivälilehdet (esim. MARRAS): otsikkorivi 5, data riviltä 6; KASSA-vuororivi (Selite sarakkeessa G); N=Aloitus km, O=Lopetus km, P=Ajettu km (kaava).
- Käyttäjä: taksinkuljettaja, AJarmo Oy / Taksipalvelu Simonen Oy. Kuljetuspalvelut vain AJarmo Oy:n kautta; purjehdus, vakuutus ja ajotoiminta pidetään erillään.

## Taulukkosynkka
- Tulevat (ajamattomat) ajot eivät mene taulukkoon: `queueSheet` siirtää ne listaan `kk_sheet_deferred` (localStorage) ja lähettää soft-deleten; `syncDeferredRides` (datan latautuessa + 60 s välein) lähettää upsertin, kun ajon pvm+klo on ohi. Vapautus vaatii, että sovellus on auki.

## Ajopäiväkirja (index.html)
- Funktiot: `printLogbook(perRide, opts)`, `saveLogbookPdf`, `saveLogbooksFromModal` (#printDate, #printCar, #printMsg), `scriptCall`, `fetchDayShifts`, km-toiminto `openKmModal`/`saveKm`/`kmLoadDay`.
- Säännöt: `isAutoon=/autoon/i`; "Maksu autoon" -ajot eivät kuulu Laskuliitteeseen (tarkoituksella). Numeroautot/SMB: 5 riviä/lehti (`oneSheet`); tekstiautot (Ix3, Veho C, i7…): yksi lehti per ajo + yksi yhteenvetolehti autoon-ajoille.
- Auton km syötetään käsin (taksamittarin km ≠ auton mittari).
- PDF Driveen: html2pdf.js 0.10.1 piilotetussa iframessa (kuvapohjainen). Nimet `Ajopäiväkirja_YYYY-MM-DD_<auto>.pdf`, samanniminen korvataan.
- Lomake: ei harmaata, ei lihavointia, kentät "Huomautettavaa toimistolle" ja "Auton kunto" poistettu; ajoriveillä ohut fontti.

## Työtavat
- Julkaisu: push → GitHub Pages (1–3 min). Tarkista no-cache fetchillä (`?nc=<ts>`) ja versiotunnisteen regexillä ennen testausta.
- Syntaksitarkistus: poimi `<script type="module">` sisältö tiedostoon ja aja `node --check`.
- Älä käytä yksittäisiä lainausmerkkejä fonttilistoissa (rikkoo JS-merkkijonon).
- Bumppaa versio aina muutoksessa; commit-viestit suomeksi tai lyhyesti.

## Avoin: tulostus
- HP Envy 4500 (mustesuihku, Mac) tulostaa ajopäiväkirjan sumeana/tuplatun näköisenä; testisivu moitteeton. Kokeiltu: kuva-PDF, 1-bit 300/600 dpi, vektori-PDF (Inter, Carlito) ja toinen tietokone HP-ajurilla: sama tulos. HP-foorumeilla vastaava korjaantui laadulla "Normaali" + "vain musta muste". Käyttäjä kokeilee laserilla.
- `tools/vektoripdf/build.py`: rakentaa vektori-PDF:n sivujen datasta (data.json) → `google-chrome --headless=new --no-sandbox --no-pdf-header-footer --print-to-pdf=out.pdf out.html`. TrueType-fontti (Carlito) pakollinen; OTF/CFF-fontit (Inter) päätyvät Type 3 -fonteiksi.
- Jos laser tulostaa vektorin hyvin: vie vektorituloste sovellukseen ja päivitä Driven PDF:t.

## Avoimet asiat
1. 4.11. ja 5.11. ajopäiväkirjoista puuttuu auton km (käyttäjä täyttää km-toiminnolla, sitten uusinta).
2. Ix3/ix3-nimeämisen yhtenäistäminen (valinnainen).
3. 4.11. Kone Oy -ajon 5 € korjaus (80→75 €) tämän viikon laskulla.
