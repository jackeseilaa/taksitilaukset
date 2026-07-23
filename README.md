# Kuljetuskirja (taksitilaukset)

Kuljetus-/taksitilausten kirjaus- ja laskutustyökalu yhden käyttäjän sisäiseen käyttöön. Yksi staattinen `index.html`, Firebase-taustajärjestelmä (jaettu `jsailing-f716c`-Firebase-projekti muiden tilin sovellusten kanssa).

## Ominaisuudet

- **Vapaan tekstin tunnistus**: liitä tilausviesti (esim. WhatsApp/SMS-kopio) tekstikenttään, ja sovellus poimii regex-heuristiikoilla automaattisesti päivämäärän, kellonajan, hinnan, lähtö-/kohdeosoitteen, matkustajan nimen, puhelinnumeron, tilaajan ja laskutustiedon.
- Manuaalinen syöttölomake samoilla kentillä + validointi (päivämäärän ja hinnan muoto).
- Tilaustaulukko: reitit klikattavina Google Maps -linkkeinä, puhelinnumerot `tel:`-linkkeinä, tämän päivän/tulevat rivit korostettu vihreällä.
- Rivikohtainen muokkaus- ja poistotila.
- CSV-vienti neljällä tavalla: koko data, valittu päivä/aikaväli, erillinen "tilaajan CSV" (nimetyt/kirjainkoodiset ajoneuvot omaa laskutusta varten) ja lomakkeen tyhjennys.
- Pikanappi ("ASETA SMB TÄNÄÄN") oletusajoneuvon ja -päivän asettamiseen.

## Backend

- **Auth**: Firebase Auth, Google-kirjautuminen rajattu yhteen sähköpostiin (`ALLOWED_EMAIL`).
- **Data**: Firestore-kokoelma `taksitulot`, reaaliaikainen synkronointi (`onSnapshot`).

## Versiointi

Juokseva versionumero (`VXX.YY`) + päivämäärä, näkyy sivun otsikossa ja käyttöliittymässä. Ei semanttinen versiointi.

## Rajoitukset

Ei PWA-tukea (ei `manifest.json`/service workeria) — pelkkä staattinen HTML-sivu. Sivulla on tarkoituksella aggressiiviset no-cache-headerit, koska GitHub Pagesin/selainten välimuisti on aiemmin toistuvasti tarjoillut vanhentuneita versioita.

## Deploy

GitHub Pages. Live: https://jackeseilaa.github.io/taksitilaukset/
