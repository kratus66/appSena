const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/app/dashboard/planeacion/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');
const eol = lines[0].endsWith('\r') ? '\r' : '';
const t = s => s.replace(/\r$/, '');

console.log('Total lines:', lines.length);

// ── FIX 1: Insert utility functions before "// ─── Main page" ──────────────
const mainPageIdx = lines.findIndex(l => t(l).startsWith('// \u2500\u2500\u2500 Main page'));
console.log('Main page comment at line:', mainPageIdx + 1);

const Q = "'";
const BT = '`';

const utilFns = [
  '// \u2500\u2500\u2500 Week date utilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500' + eol,
  "const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];" + eol,
  "const DIAS_ORDEN = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];" + eol,
  eol,
  "function snapToMonday(dateStr: string): string {" + eol,
  "  const [y, m, d] = dateStr.split('-').map(Number);" + eol,
  "  const date = new Date(y, m - 1, d);" + eol,
  "  const dow = date.getDay();" + eol,
  "  const diff = dow === 0 ? -6 : 1 - dow;" + eol,
  "  date.setDate(date.getDate() + diff);" + eol,
  "  return " + BT + "${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}" + BT + ";" + eol,
  "}" + eol,
  eol,
  "function addDays(dateStr: string, days: number): string {" + eol,
  "  const [y, m, d] = dateStr.split('-').map(Number);" + eol,
  "  const date = new Date(y, m - 1, d + days);" + eol,
  "  return " + BT + "${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}" + BT + ";" + eol,
  "}" + eol,
  eol,
  "function getWeekDates(mondayStr: string): Record<string, string> {" + eol,
  "  if (!mondayStr) return {};" + eol,
  "  const result: Record<string, string> = {};" + eol,
  "  DIAS_ORDEN.forEach((dia, i) => {" + eol,
  "    const [y, m, d] = mondayStr.split('-').map(Number);" + eol,
  "    const fecha = new Date(y, m - 1, d + i);" + eol,
  "    result[dia] = " + BT + "${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}" + BT + ";" + eol,
  "  });" + eol,
  "  return result;" + eol,
  "}" + eol,
  eol,
  "function formatWeekRange(fechaInicio?: string, fechaFin?: string): string {" + eol,
  "  if (!fechaInicio) return '';" + eol,
  "  const [y1, m1, d1] = fechaInicio.split('-').map(Number);" + eol,
  "  if (!fechaFin) return " + BT + "Desde ${d1} ${MESES_CORTOS[m1 - 1]} ${y1}" + BT + ";" + eol,
  "  const [y2, m2, d2] = fechaFin.split('-').map(Number);" + eol,
  "  if (y1 === y2) return " + BT + "${d1} ${MESES_CORTOS[m1 - 1]} \u2013 ${d2} ${MESES_CORTOS[m2 - 1]} ${y1}" + BT + ";" + eol,
  "  return " + BT + "${d1} ${MESES_CORTOS[m1 - 1]} ${y1} \u2013 ${d2} ${MESES_CORTOS[m2 - 1]} ${y2}" + BT + ";" + eol,
  "}" + eol,
  eol,
];

lines.splice(mainPageIdx, 0, ...utilFns);
console.log('Inserted', utilFns.length, 'utility function lines before Main page comment');

// ── FIX 2: Repair corrupted day selector + info grid section ─────────────────
// After Fix 1, find the corrupted section again
let ci = -1;
for (let i = 0; i < lines.length - 1; i++) {
  if (t(lines[i]).match(/^\s+\{$/) && t(lines[i + 1]).includes("label: 'Seleccion actual'")) {
    ci = i;
    break;
  }
}
console.log('Corrupted section at line:', ci + 1);

if (ci === -1) {
  console.log('ERROR: Corrupted section not found!');
  process.exit(1);
}

// Find end of corrupted section: look for "{/* Ambiente grid */}"
let ce = ci;
for (let i = ci + 1; i < lines.length; i++) {
  if (t(lines[i]).includes('{/* Ambiente grid */}')) {
    ce = i - 1;
    while (ce > ci && t(lines[ce]).trim() === '') ce--;
    break;
  }
}
console.log('Corrupted section end at line:', ce + 1);
console.log('Corrupted lines count:', ce - ci + 1);

// Fixed replacement (correct button close + complete info grid)
const i28 = '                            ';
const i26 = '                          ';
const i24 = '                        ';

const fixed = [
  i28 + '</button>' + eol,
  i24 + '  ))}\r',
  i24 + '</div>' + eol,
  eol,
  i24 + '{/* Info grid */}' + eol,
  i24 + '<div className="grid gap-3 sm:grid-cols-3">' + eol,
  i26 + '{[' + eol,
  i28 + '{ label: ' + Q + 'Dia visible' + Q + ', val: weekDates[programmingDay] ? ' + BT + '${programmingDay} \u00b7 ${weekDates[programmingDay]}' + BT + ' : programmingDay },' + eol,
  i28 + '{' + eol,
  i28 + '  label: ' + Q + 'Jornadas del dia' + Q + ',' + eol,
  i28 + "  val: visibleBlocks.map((b) => b.split(' ').slice(1).join(' ')).join(' \u00b7 ') || '\u2014'," + eol,
  i28 + '},' + eol,
  i28 + '{' + eol,
  i28 + '  label: ' + Q + 'Seleccion actual' + Q + ',' + eol,
  i28 + '  val: selectedAmbienteNombre' + eol,
  i28 + '    ? ' + BT + '${selectedAmbienteNombre} \u00b7 ${selectedBlockLabels.length} bloques' + BT + eol,
  i28 + "    : 'Sin ambiente seleccionado'," + eol,
  i28 + '},' + eol,
  i26 + '].map((item) => (' + eol,
  i28 + '<div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">' + eol,
  i28 + '  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>' + eol,
  i28 + '  <p className="mt-1 text-sm text-gray-800">{item.val}</p>' + eol,
  i28 + '</div>' + eol,
  i26 + '))}\r',
  i24 + '</div>' + eol,
];

lines.splice(ci, ce - ci + 1, ...fixed);
console.log('Replaced', ce - ci + 1, 'corrupted lines with', fixed.length, 'fixed lines');

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('File saved successfully. Total lines now:', lines.length);
