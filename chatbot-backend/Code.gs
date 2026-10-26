/**
 * LAOYU AI Assistant — chat recorder for Google Sheets
 *
 * Paste this into Extensions → Apps Script of a Google Sheet,
 * run setup() once, then deploy as a Web app
 * (Execute as: Me · Who has access: Anyone).
 * Put the web app URL into LOG_URL at the top of chatbot.js.
 *
 * Tabs it creates:
 *   Chats     — every visitor question, topic matched, answered or not
 *   Leads     — chatbot contacts and free-resource sign-ups (valid emails only)
 *   Rejected  — sign-ups whose email failed the checks, with the reason
 *   Dashboard — live summary: totals, chats per day, top topics,
 *               unanswered questions, languages, pages
 */

var MAX_PER_MINUTE = 30; // per chat session, to block spam

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var chats = ensureSheet_(ss, 'Chats',
    ['Time', 'Session', 'Page', 'Language', 'Question', 'Topic', 'Answered']);
  chats.setColumnWidth(5, 380);
  chats.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');

  var leads = ensureSheet_(ss, 'Leads',
    ['Time', 'Name', 'Email', 'Message', 'Page', 'Language', 'Session', 'Status']);
  leads.setColumnWidth(4, 380);
  leads.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');

  var rej = ensureSheet_(ss, 'Rejected',
    ['Time', 'Name', 'Email', 'Reason', 'Message', 'Page']);
  rej.setColumnWidth(3, 240);
  rej.setColumnWidth(4, 260);
  rej.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');

  buildDashboard_(ss);

  var first = ss.getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);

  SpreadsheetApp.flush();
  Logger.log('LAOYU chatbot recorder is set up. Next: Deploy → New deployment → Web app.');
}

function doGet() {
  return ContentService.createTextOutput('LAOYU chatbot recorder is running.');
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.hp) return ok_();                    // honeypot filled: bot traffic
    if (tooMany_(String(data.session || ''))) return ok_();

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var now = new Date();

      if (data.type === 'lead') {
        var problem = emailProblem_(String(data.email || '').trim().toLowerCase());
        if (problem) {
          (ss.getSheetByName('Rejected') || ensureSheet_(ss, 'Rejected', ['Time', 'Name', 'Email', 'Reason', 'Message', 'Page'])).appendRow([
            now, clean_(data.name, 80), clean_(data.email, 120), problem, clean_(data.message, 500), clean_(data.page, 60)
          ]);
          return ok_();
        }
        ss.getSheetByName('Leads').appendRow([
          now,
          clean_(data.name, 80),
          clean_(data.email, 120),
          clean_(data.message, 1000),
          clean_(data.page, 60),
          clean_(data.lang, 5),
          clean_(data.session, 40),
          'New'
        ]);
      } else {
        ss.getSheetByName('Chats').appendRow([
          now,
          clean_(data.session, 40),
          clean_(data.page, 60),
          clean_(data.lang, 5),
          clean_(data.question, 500),
          clean_(data.topic, 40),
          data.answered === true
        ]);
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
  }
  return ok_();
}

/* ---------------- Dashboard ---------------- */

function buildDashboard_(ss) {
  var d = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard', 0);
  d.clear();
  d.getCharts().forEach(function (c) { d.removeChart(c); });

  d.getRange('A1').setValue('LAOYU AI Assistant — Dashboard')
    .setFontSize(18).setFontWeight('bold').setFontColor('#0b2b44');
  d.getRange('A2').setValue('Updates live as visitors chat on the website.').setFontColor('#6b7f90');

  var kpis = [
    ['Total questions',  '=COUNTA(Chats!E2:E)'],
    ['Chat sessions',    '=COUNTUNIQUE(Chats!B2:B)'],
    ['Questions today',  '=COUNTIF(Chats!A2:A,">="&TODAY())'],
    ['Answered rate',    '=IFERROR(COUNTIF(Chats!G2:G,TRUE)/COUNTA(Chats!G2:G),0)'],
    ['Unanswered',       '=COUNTIF(Chats!G2:G,FALSE)'],
    ['Contacts left',    '=COUNTA(Leads!C2:C)'],
    ['New contacts',     '=COUNTIF(Leads!H2:H,"New")'],
    ['Resource sign-ups','=COUNTIF(Leads!D2:D,"Free resource:*")'],
    ['Rejected emails',  '=COUNTA(Rejected!C2:C)']
  ];
  d.getRange(4, 1, kpis.length, 2).setValues(kpis);
  d.getRange(4, 1, kpis.length, 1).setFontWeight('bold');
  d.getRange(4, 2, kpis.length, 1).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('left');
  d.getRange('B7').setNumberFormat('0%');

  section_(d, 'D4', 'Questions per day');
  d.getRange('D5').setFormula(
    '=IFERROR(QUERY(Chats!A2:G,"select toDate(A), count(E) where A is not null group by toDate(A) order by toDate(A) desc limit 30 label toDate(A) \'Day\', count(E) \'Questions\'",0),"No chats yet")');
  d.getRange('D6:D40').setNumberFormat('yyyy-mm-dd');

  section_(d, 'G4', 'Top topics');
  d.getRange('G5').setFormula(
    '=IFERROR(QUERY(Chats!A2:G,"select F, count(F) where F is not null group by F order by count(F) desc label F \'Topic\', count(F) \'Asked\'",0),"No chats yet")');

  section_(d, 'J4', 'Language');
  d.getRange('J5').setFormula(
    '=IFERROR(QUERY(Chats!A2:G,"select D, count(D) where D is not null group by D label D \'Lang\', count(D) \'Questions\'",0),"No chats yet")');

  section_(d, 'J10', 'Pages');
  d.getRange('J11').setFormula(
    '=IFERROR(QUERY(Chats!A2:G,"select C, count(C) where C is not null group by C order by count(C) desc label C \'Page\', count(C) \'Questions\'",0),"No chats yet")');

  section_(d, 'A13', 'Unanswered questions (newest first) — ideas for new content');
  d.getRange('A14').setFormula(
    '=IFERROR(SORT(FILTER({Chats!A2:A,Chats!E2:E},Chats!G2:G=FALSE),1,FALSE),"None yet")');
  d.getRange('A15:A200').setNumberFormat('yyyy-mm-dd hh:mm');

  d.setColumnWidth(1, 150);
  d.setColumnWidth(2, 300);
  d.setColumnWidths(4, 2, 110);
  d.setColumnWidth(7, 130);
  d.setColumnWidth(10, 130);
  d.setFrozenRows(2);

  var chart = d.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(d.getRange('D5:E35'))
    .setPosition(4, 13, 0, 0)
    .setOption('title', 'Questions per day')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#35e0ff'])
    .build();
  d.insertChart(chart);
}

/* ---------------- Email checks ---------------- */

var DISPOSABLE_ = ('mailinator.com guerrillamail.com guerrillamail.net guerrillamail.org sharklasers.com grr.la 10minutemail.com ' +
  '10minutemail.net tempmail.com temp-mail.org temp-mail.io tempmail.net tempmailo.com tempr.email yopmail.com yopmail.net ' +
  'trashmail.com trashmail.de getnada.com nada.email dispostable.com maildrop.cc throwawaymail.com fakeinbox.com mintemail.com ' +
  'mohmal.com emailondeck.com discard.email mailnesia.com mytemp.email spamgourmet.com burnermail.io mail.tm moakt.com ' +
  'tempinbox.com spambox.us mailcatch.com getairmail.com inboxkitten.com emailfake.com fakemail.net tempail.com ' +
  'example.com example.org example.net test.com test.org invalid.com').split(' ');

/** Returns '' when the email looks real, otherwise the reason it was rejected. */
function emailProblem_(email) {
  var re = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/;
  if (!re.test(email) || email.indexOf('..') >= 0) return 'Invalid format';
  var domain = email.split('@')[1];
  if (DISPOSABLE_.indexOf(domain) >= 0) return 'Temporary or test email';
  var mail = domainReceivesMail_(domain);
  if (mail === false) return 'Domain cannot receive email';
  return '';
}

/** true = has mail (MX) or address record, false = domain does not exist / no mail, null = could not check. */
function domainReceivesMail_(domain) {
  var cache = CacheService.getScriptCache(), key = 'mx_' + domain;
  var hit = cache.get(key);
  if (hit) return hit === 'yes' ? true : hit === 'no' ? false : null;
  var result = null;
  try {
    var mx = dns_(domain, 'MX', 15);
    result = mx === true ? true : (dns_(domain, 'A', 1) === true ? true : (mx === false ? false : null));
  } catch (err) {
    result = null; // DNS service unreachable: do not block the sign-up
  }
  cache.put(key, result === true ? 'yes' : result === false ? 'no' : 'unknown', 21600);
  return result;
}

function dns_(domain, type, code) {
  var res = UrlFetchApp.fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=' + type,
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  var j = JSON.parse(res.getContentText());
  if (j.Status === 3) return false;                       // domain does not exist
  if (j.Status !== 0) return null;
  return (j.Answer || []).some(function (a) { return a.type === code; }) ? true : false;
}

/** Run this once from the editor to check old rows already in Leads. Bad ones are marked in the Status column. */
function checkExistingLeads() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
  var last = sh.getLastRow();
  if (last < 2) return;
  var emails = sh.getRange(2, 3, last - 1, 1).getValues();
  var status = sh.getRange(2, 8, last - 1, 1).getValues();
  emails.forEach(function (row, i) {
    var p = emailProblem_(String(row[0]).trim().toLowerCase());
    if (p) status[i][0] = 'Invalid: ' + p;
  });
  sh.getRange(2, 8, last - 1, 1).setValues(status);
}

/* ---------------- Helpers ---------------- */

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#0b2b44').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function section_(sheet, cell, title) {
  sheet.getRange(cell).setValue(title).setFontWeight('bold').setFontColor('#ff7a1a');
}

function clean_(value, max) {
  var s = String(value == null ? '' : value).replace(/[\u0000-\u001f]/g, ' ').trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;           // stop formula injection
  return s.slice(0, max);
}

function tooMany_(session) {
  var cache = CacheService.getScriptCache();
  var key = 'rate_' + session.slice(0, 40);
  var count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 60);
  return count > MAX_PER_MINUTE;
}

function ok_() {
  return ContentService.createTextOutput('ok');
}
