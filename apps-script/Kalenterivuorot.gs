/**
 * Kalenterivuorot.gs – hakee ajovuorojen alku- ja loppuajat Google-kalenterista
 * kuukausivälilehden KASSA-riveille (sarakkeet "Klo" ja "Lopetus").
 *
 * Säännöt:
 *  - Kalenterista luetaan vain tapahtumat, joiden otsikossa on sana "Taksi" (esim. "Taksi 154", "Taksi Veho C").
 *  - Täytetään VAIN tyhjät solut: vuororaportilta tai käsin syötetyt ajat jäävät ennalleen.
 *  - Rivi yhdistetään päivämäärällä ja autolla. Jos päivällä on yksi vuoro ja yksi KASSA-rivi, auton nimeä ei vaadita.
 *  - Uusia rivejä ei luoda. Vuorot, joille ei löydy KASSA-riviä, näytetään yhteenvedossa.
 *
 * Käyttöönotto:
 *  1) Lisää tämä tiedosto Apps Script -projektiin (uusi tiedosto "Kalenterivuorot").
 *  2) Lisää live-skriptin onOpen-funktion Taksi-valikkoon rivi:
 *       .addItem('Hae vuoroajat kalenterista', 'kalenteriVuorot')
 *  3) Ensimmäisellä ajokerralla Google pyytää lupaa lukea kalenteria.
 * Käyttää live-skriptin vakioita TABS, YEAR, HEADER_ROW, FIRST_ROW.
 */
function kalenteriVuorot() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getActiveSheet();
  var idx = TABS.indexOf(sh.getName());
  if (idx < 0) {
    idx = new Date().getMonth();
    sh = ss.getSheetByName(TABS[idx]);
  }
  var msg = kalVuorotKuukausi_(ss, sh, YEAR, idx);
  SpreadsheetApp.getUi().alert('Vuoroajat kalenterista – ' + sh.getName(), msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Ajastinta varten (esim. joka aamu): käsittelee kuluvan kuukauden ilman ilmoitusikkunaa. */
function kalenteriVuorotAjastin() {
  var ss = SpreadsheetApp.getActive();
  var now = new Date();
  if (now.getFullYear() !== YEAR) return;
  var sh = ss.getSheetByName(TABS[now.getMonth()]);
  if (sh) kalVuorotKuukausi_(ss, sh, YEAR, now.getMonth());
}

function kalVuorotKuukausi_(ss, sh, year, month) {
  var tz = ss.getSpreadsheetTimeZone();
  var from = new Date(year, month, 1);
  var to = new Date(year, month + 1, 1);
  var now = new Date();
  if (to > now) to = now; // vain jo alkaneet vuorot

  // 1) Kalenterin Taksi-vuorot päivittäin
  var events = CalendarApp.getDefaultCalendar().getEvents(from, to);
  var byDay = {};
  events.forEach(function (ev) {
    var title = String(ev.getTitle() || '');
    if (!/(^|[^a-zäöå])taksi([^a-zäöå]|$)/i.test(title) || ev.isAllDayEvent()) return;
    var iso = Utilities.formatDate(ev.getStartTime(), tz, 'yyyy-MM-dd');
    (byDay[iso] = byDay[iso] || []).push({
      car: title.replace(/taksi/i, '').replace(/[,:].*$/, '').trim(),
      start: Utilities.formatDate(ev.getStartTime(), tz, 'HH:mm'),
      end: Utilities.formatDate(ev.getEndTime(), tz, 'HH:mm'),
      used: false
    });
  });

  // 2) KASSA-rivit
  var last = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (last < FIRST_ROW) return 'Välilehdellä ei ole rivejä.';
  var head = sh.getRange(HEADER_ROW, 1, 1, lastCol).getDisplayValues()[0];
  var col = function (re) { for (var i = 0; i < head.length; i++) if (re.test(String(head[i]).trim())) return i; return -1; };
  var cPvm = col(/^pvm$/i), cAuto = col(/^auto$/i), cKlo = col(/^klo$/i), cEnd = col(/^lopetus$/i), cSel = col(/^selite$/i);
  if (cPvm < 0 || cKlo < 0 || cEnd < 0 || cSel < 0) return 'Otsikkoriviltä ei löytynyt sarakkeita Pvm, Klo, Lopetus ja Selite.';
  var n = last - FIRST_ROW + 1;
  var vals = sh.getRange(FIRST_ROW, 1, n, lastCol).getValues();
  var disp = sh.getRange(FIRST_ROW, 1, n, lastCol).getDisplayValues();

  var kassaByDay = {};
  for (var i = 0; i < n; i++) {
    if (String(vals[i][cSel]).trim().toUpperCase() !== 'KASSA') continue;
    var iso = kalVuorotIso_(vals[i][cPvm], tz);
    if (!iso) continue;
    (kassaByDay[iso] = kassaByDay[iso] || []).push(i);
  }

  var norm = function (s) { return String(s || '').toLowerCase().replace(/\.0$/, '').replace(/\s+/g, ''); };
  var filled = [], noRow = [];
  Object.keys(byDay).sort().forEach(function (iso) {
    var shifts = byDay[iso], rows = kassaByDay[iso] || [];
    rows.forEach(function (i) {
      var car = norm(cAuto >= 0 ? vals[i][cAuto] : '');
      var s = null;
      for (var k = 0; k < shifts.length && !s; k++) {
        var c = norm(shifts[k].car);
        if (!shifts[k].used && car && c && (c === car || c.indexOf(car) === 0 || car.indexOf(c) === 0)) s = shifts[k];
      }
      if (!s && shifts.length === 1 && rows.length === 1 && !shifts[0].used) s = shifts[0];
      if (!s) return;
      s.used = true;
      var r = FIRST_ROW + i, did = [];
      if (!String(disp[i][cKlo]).trim()) { sh.getRange(r, cKlo + 1).setValue(s.start); did.push('alku ' + s.start); }
      if (!String(disp[i][cEnd]).trim()) { sh.getRange(r, cEnd + 1).setValue(s.end); did.push('loppu ' + s.end); }
      if (did.length) filled.push(kalVuorotFi_(iso) + ' ' + (cAuto >= 0 ? disp[i][cAuto] : '') + ': ' + did.join(', '));
    });
    shifts.forEach(function (s) { if (!s.used) noRow.push(kalVuorotFi_(iso) + ' Taksi ' + s.car + ' (' + s.start + '–' + s.end + ')'); });
  });

  var out = [];
  out.push(filled.length ? 'Täytetty:\n' + filled.join('\n') : 'Ei täytettävää: kaikilla löytyneillä KASSA-riveillä oli jo ajat.');
  if (noRow.length) out.push('\nKalenterissa vuoro, mutta välilehdellä ei KASSA-riviä:\n' + noRow.join('\n'));
  return out.join('\n');
}

function kalVuorotIso_(v, tz) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  var m = String(v || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return m ? m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) : '';
}

function kalVuorotFi_(iso) {
  var p = iso.split('-');
  return (+p[2]) + '.' + (+p[1]) + '.';
}
