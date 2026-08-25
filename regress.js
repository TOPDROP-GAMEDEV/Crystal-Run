/* Regression check for every runnable Crystal Run course program. */
global.window = global;
const MiniJava = require('../js/minijava.js');
const COURSE = require('../js/course.js');

let total = 0, failed = 0;
function check(label, source) {
  total++;
  const r = MiniJava.run(source);
  if (!r.ok) {
    failed++;
    console.log('FAIL ' + label + ': line ' + (r.line || '?') + ' — ' + r.error);
  }
}
function assemble(build, code) {
  return [build.context, code, build.harness].filter(x => x && x.trim()).join('\n\n');
}

COURSE.sections.forEach((section, si) => {
  (section.examples || []).forEach((example, ei) => check('example ' + (si + 1) + '.' + (ei + 1), example.code));
  if (section.build) {
    /* The reference solution is the runnable replacement for the learner's editor code. */
    check('build ' + (si + 1), assemble(section.build, section.build.reference || section.build.starter || ''));
  }
});
console.log('Regression: ' + (total - failed) + '/' + total + ' passed, ' + failed + ' failed.');
process.exitCode = failed ? 1 : 0;
