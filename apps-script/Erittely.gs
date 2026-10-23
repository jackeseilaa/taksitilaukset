/**
 * Erittely.gs – ajovuorojen (KASSA-rivien) luku laskuliitettä varten. VAIN LUKU.
 *
 * Käyttöönotto (kun live-skriptin doPost on luettu):
 *  1) Lisää tämä tiedosto Apps Script -projektiin (uusi tiedosto "Erittely").
 *  2) Lisää doPost:iin verifyOwner_-tarkistuksen jälkeen yksi haara:
 *       if (action === 'shifts') return json_({ ok: true, shifts: vuorotData_(ss, a.from, a.to) });
 *     (muuttujien nimet sovitetaan live-koodiin; muuta toimintaa ei kosketa)
 *
 * Palauttaa jokaisesta KASSA-rivistä: { date:'yyyy-MM-dd', car, brutto, start, end, billed }
 * Käyttää vain omia apufunktioita (nimet vuorot*_), TABS/YEAR/TZ/HEADER_ROW/FIRST_ROW tulevat live-skriptistä.
 */
function vuorotData_(ss, fromIso, toIso) {
  var from = vuorotIsoToDate_(fromIso), to = vuorotIsoToDate_(toIso);
  if (!from || !to || from > to) throw new Error('Virheellinen aikaväli');
  var tz = ss.getSpreadsheetTimeZone() || TZ;
  var out = [];
  var seen = {};
  var d = new Date(from.getFullYear(), from.getMonth(), 1);
  while (d <= to) {
    if (d.getFullYear() === YEAR) {
      var name = TABS[d.getMonth()];
      if (name && !seen[name]) {
        seen[name] = true;
        var sh = ss.getSheetByName(name);
        if (sh) vuorotReadSheet_(sh, tz, fromIso, toIso, out);
      }
    }
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  out.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : String(a.car).localeCompare(String(b.car)); });
  return out;
}

function vuorotReadSheet_(sh, tz, fromIso, toIso, out) {
  var last = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (last < FIRST_ROW) return;
  var head = sh.getRange(HEADER_ROW, 1, 1, lastCol).getDisplayValues()[0];
  var col = function (re) { for (var i = 0; i < head.length; i++) if (re.test(String(head[i]).trim())) return i; return -1; };
  var cAuto = col(/^auto$/i), cPvm = col(/^pvm$/i), cKlo = col(/^klo$/i), cEnd = col(/^lopetus$/i),
      cBr = col(/^brutto$/i), cSel = col(/^selite$/i), cLask = col(/^laskutettu/i);
  if (cPvm < 0 || cBr < 0 || cSel < 0) return;
  var n = last - FIRST_ROW + 1;
  var vals = sh.getRange(FIRST_ROW, 1, n, lastCol).getValues();
  var disp = sh.getRange(FIRST_ROW, 1, n, lastCol).getDisplayValues();
  for (var i = 0; i < n; i++) {
    if (String(vals[i][cSel]).trim().toUpperCase() !== 'KASSA') continue;
    var iso = vuorotDateIso_(vals[i][cPvm], tz);
    if (!iso || iso < fromIso || iso > toIso) continue;
    var b = vals[i][cBr];
    if (typeof b === 'string') b = parseFloat(b.replace(/\s/g, '').replace(',', '.'));
    out.push({
      date: iso,
      car: cAuto >= 0 ? String(vals[i][cAuto]).replace(/\.0$/, '') : '',
      brutto: (typeof b === 'number' && isFinite(b)) ? b : 0,
      start: cKlo >= 0 ? String(disp[i][cKlo]) : '',
      end: cEnd >= 0 ? String(disp[i][cEnd]) : '',
      billed: cLask >= 0 ? String(vals[i][cLask] || '').trim() : ''
    });
  }
}

function vuorotDateIso_(v, tz) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  var m = String(v || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return '';
}

function vuorotIsoToDate_(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
