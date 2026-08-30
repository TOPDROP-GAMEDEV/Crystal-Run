/* Validate one course level file.
   Usage: node test/validate-level.js js/course-l2.js
   Loads the interpreter, level 1, then the level file under test, and checks:
     - every example runs with ok:true and prints something
     - every build reference passes its own checks[] substrings
     - assemble(context, reference, harness) runs ok and satisfies expect / expectLines / minPrints
     - every build starter parses far enough to run OR fails only with a clear message (starters may be incomplete)
     - the whole level assembles (slots in level.assemble order, reference code) and runs ok
*/
global.window = global;
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'js/minijava.js'));
require(path.join(root, 'js/course.js'));

const target = process.argv[2];
if (!target) { console.error('usage: node test/validate-level.js js/course-l2.js'); process.exit(2); }
require(path.join(root, target));

const L = global.CR_LEVELS[global.CR_LEVELS.length - 1];
let pass = 0, fail = 0;
const problems = [];

function run(src, max) {
  return MiniJava.run(src, { maxSteps: max || 900000, maxOutput: 900 });
}
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++; problems.push(label + (detail ? '\n      ' + String(detail).split('\n').join('\n      ') : ''));
  return false;
}
function assemble(b, code) {
  return [b.context, code, b.harness].filter(x => x && x.trim()).join('\n\n');
}

console.log('Validating level ' + L.id + ' — ' + L.title + ' (' + L.sections.length + ' sections)\n');

L.sections.forEach((s, i) => {
  const tag = 'S' + (i + 1) + ' ' + s.id;
  ok(s.id && s.title && s.goal && s.brief && Array.isArray(s.concepts) && s.concepts.length, tag + ': metadata complete');
  ok(s.examples && s.examples.length >= 3, tag + ': has 3+ examples');

  (s.examples || []).forEach((ex, j) => {
    const label = tag + ' example ' + (j + 1) + ' (' + ex.title + ')';
    ok(ex.title && ex.teach && ex.code && ex.tryThis, label + ': fields complete');
    const r = run(ex.code);
    if (ok(r.ok, label + ': runs clean', r.error + (r.line ? ' (line ' + r.line + ')' : ''))) {
      ok((r.output || '').trim().length > 0, label + ': prints something');
    }
  });

  const b = s.build;
  if (!b) { ok(false, tag + ': has a build task'); return; }
  ok(b.label && b.brief && b.starter && b.reference && b.checks && b.checks.length >= 2,
    tag + ' build: fields complete');

  const missing = (b.checks || []).filter(c => b.reference.indexOf(c[0]) < 0).map(c => c[0]);
  ok(missing.length === 0, tag + ' build: reference satisfies every check', 'missing: ' + JSON.stringify(missing));

  const full = assemble(b, b.reference);
  const r = run(full);
  if (ok(r.ok, tag + ' build: reference runs clean', r.error + (r.line ? ' (line ' + r.line + ')' : ''))) {
    const out = r.output || '';
    if (b.minPrints) {
      const n = (b.reference.match(/System\.out\.print/g) || []).length;
      ok(n >= b.minPrints, tag + ' build: reference has ' + b.minPrints + '+ prints');
    }
    if (b.expect) {
      const miss = b.expect.filter(x => out.indexOf(x) < 0);
      ok(miss.length === 0, tag + ' build: output contains every expect string', 'missing: ' + JSON.stringify(miss) + '\noutput:\n' + out);
    }
    if (b.expectLines) {
      const lines = out.split('\n').filter(x => x.trim());
      const uniq = {}; lines.forEach(l => uniq[l] = 1);
      ok(lines.length >= b.expectLines && Object.keys(uniq).length >= 2,
        tag + ' build: output has ' + b.expectLines + '+ distinct-ish lines', 'output:\n' + out);
    }
  }

  /* the starter must NOT already pass the checks (otherwise there is nothing to write) */
  const starterMissing = (b.checks || []).filter(c => b.starter.indexOf(c[0]) < 0).length;
  ok(starterMissing > 0, tag + ' build: starter leaves real work to do');
});

/* whole-level assembly */
const slotOf = L.slotOf || {};
const slots = {};
L.sections.forEach(s => { slots[slotOf[s.id] || s.slot || s.id] = s.build.reference; });
const order = L.assemble || Object.keys(slots);
const missingSlots = order.filter(k => !slots[k]);
ok(missingSlots.length === 0, 'level assembly: every slot in assemble[] exists', JSON.stringify(missingSlots));
const src = order.map(k => slots[k]).filter(Boolean).join('\n\n');
const full = run(src, 1400000);
if (ok(full.ok, 'level assembly: whole game runs clean', full.error + (full.line ? ' (line ' + full.line + ')' : ''))) {
  ok((full.output || '').split('\n').length > 8, 'level assembly: game prints a real playthrough');
  console.log('--- full game output ---\n' + full.output + '\n------------------------\n');
}

console.log('Level ' + L.id + ': ' + pass + ' passed, ' + fail + ' failed.');
if (problems.length) {
  console.log('\nFAILURES:');
  problems.forEach(p => console.log('  • ' + p));
  process.exit(1);
}
