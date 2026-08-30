(function () {
  'use strict';

  /* ---------------- levels ---------------- */
  const LEVELS = (window.CR_LEVELS || []).slice().sort((a, b) => a.id - b.id);
  const $ = id => document.getElementById(id);
  const XP_EXAMPLE = 1, XP_BUILD = 3, XP_PER_LEVEL = 10, PASS_TIERS = 15;

  /* ---- storage: in-memory always; browser-persisted when the host page allows it ---- */
  const mem = {};
  const PERSIST = (function () {
    try {
      const store = window[['local', 'Storage'].join('')];
      if (!store) return null;
      store.setItem('cr.probe', '1'); store.removeItem('cr.probe');
      return store;
    } catch (e) { return null; }
  })();
  const store = {
    get(k, d) {
      if (k in mem) return mem[k];
      if (PERSIST) { try { const v = PERSIST.getItem(k); if (v !== null) return JSON.parse(v); } catch (e) {} }
      return d;
    },
    set(k, v) { mem[k] = v; if (PERSIST) { try { PERSIST.setItem(k, JSON.stringify(v)); } catch (e) {} } },
    del(k) { delete mem[k]; if (PERSIST) { try { PERSIST.removeItem(k); } catch (e) {} } }
  };

  /* level 1 keeps the original key names so old progress still loads */
  function pre(l) { return l === 0 ? 'cr.' : 'cr.l' + (l + 1) + '.'; }
  const K = {
    done: l => pre(l) + 'done',
    build: (l, i) => pre(l) + 'build.' + i,
    ex: (l, i, j) => pre(l) + 'ex.' + i + '.' + j,
    seen: (l, i) => pre(l) + 'seen.' + i,
    exdone: (l, i) => pre(l) + 'exdone.' + i,
    pos: 'cr.pos',
    xp: 'cr.xp',
    level: 'cr.activeLevel'
  };

  let li = Math.min(store.get(K.level, 0) || 0, LEVELS.length - 1);
  let S = LEVELS[li].sections;
  const pos = store.get(K.pos, { l: li, s: 0, step: 0 });
  let si = (pos.l === li) ? Math.min(pos.s || 0, S.length - 1) : 0;
  let step = (pos.l === li) ? (pos.step || 0) : 0;
  let done = store.get(K.done(li), []);
  let xp = store.get(K.xp, []);

  function savePos() { store.set(K.pos, { l: li, s: si, step: step }); touch(); }
  function isDone(i) { return done.indexOf(i) >= 0; }
  function levelDone(l) { return (store.get(K.done(l), []) || []).length >= LEVELS[l].sections.length; }
  function levelUnlocked(l) { return l === 0 || levelDone(l - 1); }
  function exDone(i) { return store.get(K.exdone(li, i), []) || []; }
  function isExDone(i, j) { return isDone(i) || exDone(i).indexOf(j) >= 0; }
  function allExamplesDone(i) {
    if (isDone(i)) return true;   /* progress made before examples were required still counts */
    const d = exDone(i);
    for (let j = 0; j < S[i].examples.length; j++) if (d.indexOf(j) < 0) return false;
    return true;
  }
  function sectionUnlocked(i) { return i === 0 || isDone(i - 1); }
  function stepUnlocked(i, j) {
    if (!sectionUnlocked(i)) return false;
    if (j === 0) return true;
    if (j < S[i].examples.length) return isExDone(i, j - 1);
    return allExamplesDone(i);
  }

  /* ---------------- xp ---------------- */
  function xpTotal() {
    let t = 0;
    xp.forEach(id => { t += /\.b$/.test(id) ? XP_BUILD : XP_EXAMPLE; });
    return t;
  }
  function xpLevel() { return Math.floor(xpTotal() / XP_PER_LEVEL) + 1; }
  function award(id) {
    if (xp.indexOf(id) >= 0) return 0;
    const before = xpLevel();
    xp.push(id); store.set(K.xp, xp); touch();
    const gained = /\.b$/.test(id) ? XP_BUILD : XP_EXAMPLE;
    renderXP();
    if (xpLevel() > before) levelUpToast(xpLevel());
    else xpToast('+' + gained + ' XP');
    return gained;
  }
  function dropXpFor(level) {
    const tag = 'l' + (level + 1) + '.';
    xp = xp.filter(id => id.indexOf(tag) !== 0);
    store.set(K.xp, xp);
  }

  function renderXP() {
    const total = xpTotal(), lv = xpLevel(), into = total % XP_PER_LEVEL;
    $('xpLevel').textContent = 'Level ' + lv;
    $('xpCount').textContent = total + ' XP';
    $('xpFill').style.width = (into / XP_PER_LEVEL * 100) + '%';
    $('xpNext').textContent = (XP_PER_LEVEL - into) + ' XP to Level ' + (lv + 1);
    const built = done.length, tot = S.length;
    $('sectionsBuilt').textContent = built + ' / ' + tot + ' sections built';
  }

  let toastTimer = null;
  function toast(html, cls) {
    const t = $('toast');
    t.className = 'toast show' + (cls ? ' ' + cls : '');
    t.innerHTML = html;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
  }
  function xpToast(txt) { toast('<strong>' + txt + '</strong>'); }
  function levelUpToast(lv) {
    toast('<strong>Level ' + lv + '</strong><span>New tier unlocked on your level pass</span>' +
      '<button class="ghost small" id="toastPass">Open pass</button>', 'big');
    const b = $('toastPass'); if (b) b.onclick = () => { openPass(); toast('', ''); };
  }

  /* ---------------- level pass ---------------- */
const PASS = [
  'New title screen colours',
  'Extra hero name ideas',
  'Bonus example: dice rolls',
  'Code theme: parchment',
  'Java cheat sheet download',

  'Coming soon: boss health bar snippet',
  'Coming soon: code theme midnight',
  'Coming soon: bonus example save files',
  'Coming soon: sound effect ideas',
  'Coming soon: extra weapon blueprint',
  'Coming soon: Level 3 preview',
  'Coming soon: code theme arcade',
  'Coming soon: bonus example 2D map',
  'Coming soon: certificate of completion',
  'Coming soon: sandbox mode'
];
  function openPass() {
    const lv = xpLevel();
  const total = xpTotal();

  $('passSub').textContent =
    'You are Level ' + lv + ' with ' + total + ' XP. Every ' +
    XP_PER_LEVEL + ' XP is one level. Examples give ' +
    XP_EXAMPLE + ' XP, build tasks give ' + XP_BUILD + ' XP.';

  $('passGrid').innerHTML = PASS.map((name, k) => {
    const tier = k + 1;
    const need = (tier - 1) * XP_PER_LEVEL;
    const open = lv >= tier;

    return '<div class="tier' + (open ? ' open' : '') + '">' +
      '<div class="tn">Level ' + tier + '</div>' +
      '<div class="tneed">' + (need === 0 ? 'Start' : need + ' XP') + '</div>' +
      '<div class="treward">' + (open ? 'Unlocked' : 'Locked') + '</div>' +
      '<div class="tslot">' +
        esc(name) +
        (open
          ? '<button class="ghost small pass-reward" data-reward="' + k + '">Claim reward</button>'
          : '<span class="soon">Reach Level ' + tier + '</span>') +
      '</div>' +
    '</div>';
  }).join('');

  $('passGrid').querySelectorAll('.pass-reward').forEach(button => {
    button.onclick = () => {
      claimPassReward(Number(button.dataset.reward));
    };
  });

  $('passModal').hidden = false;
  }

function claimPassReward(index) {
  if (index === 0) {
    setStyle('title-colours');

  } else if (index === 1) {
    alert(
      'Hero name ideas unlocked!\n\n' +
      '• Crystal Knight\n' +
      '• Nova Runner\n' +
      '• Rune Walker\n' +
      '• Pixel Mage\n' +
      '• Echo'
    );

  } else if (index === 2) {
  toast(
    '<strong>Dice Roll example unlocked!</strong>' +
    '<span>Open Inventory → Bonus rewards to view and copy it.</span>',
    'big'
  );

  } else if (index === 3) {
    } else if (index === 3) {
  setStyle('parchment');

  } else if (index === 4) {
  toast(
    '<strong>Java Cheat Sheet unlocked!</strong>' +
    '<span>Open Inventory → Bonus rewards to read and copy it.</span>',
    'big'
  );
  }else if (index === 6) {
  setStyle('midnight');

  } else if (index === 11) {
  setStyle('arcade');
  }
  else {
    toast(
      '<strong>Coming soon</strong>' +
      '<span>This Level Pass reward is planned for a future Crystal Run update.</span>',
      'big'
    );
  }
}

 
function setTheme(theme) {
  document.body.classList.remove(
    'theme-parchment',
    'theme-midnight',
    'theme-arcade'
  );

  document.body.classList.add('theme-' + theme);

  store.set('cr.theme', theme);

  toast(
    '<strong>' + theme.charAt(0).toUpperCase() + theme.slice(1) +
    ' theme equipped!</strong><span>You can change it again from the Level Pass.</span>',
    'big'
  );
}

/* ---------------- styles ---------------- */

const STYLES = [
  {
    id: 'default',
    name: 'Crystal',
    description: 'The original Crystal Run blue and violet style.',
    unlockLevel: 1,
    colours: ['#05070f', '#5fe3ff', '#9b8cff']
  },
  {
    id: 'title-colours',
    name: 'Title Colours',
    description: 'A pink and gold colour palette unlocked at Pass Level 1.',
    unlockLevel: 1,
    colours: ['#12071a', '#ff6bb5', '#ffd166']
  },
  {
    id: 'parchment',
    name: 'Parchment',
    description: 'A warm fantasy style unlocked at Pass Level 4.',
    unlockLevel: 4,
    colours: ['#2e2118', '#ffd166', '#ff9f68']
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'A deeper night-time style unlocked at Pass Level 7.',
    unlockLevel: 7,
    colours: ['#02030c', '#5fe3ff', '#9b8cff']
  },
  {
    id: 'arcade',
    name: 'Arcade',
    description: 'A bright neon arcade style unlocked at Pass Level 12.',
    unlockLevel: 12,
    colours: ['#12041d', '#00ffe1', '#ff4fd8']
  }
];

function selectedStyle() {
  return store.get('cr.theme', 'default');
}

function setStyle(styleId) {
  const style = STYLES.find(item => item.id === styleId);

  if (!style) return;

  document.body.classList.remove(
    'theme-title-colours',
    'theme-parchment',
    'theme-midnight',
    'theme-arcade'
  );

  /* Removes the old Level 1 inline colour override */
  document.documentElement.style.removeProperty('--cyan');
  document.documentElement.style.removeProperty('--violet');

  if (styleId !== 'default') {
    document.body.classList.add('theme-' + styleId);
  }

  store.set('cr.theme', styleId);

  toast(
    '<strong>' + esc(style.name) + ' style equipped!</strong>' +
    '<span>You can change it again from Styles.</span>',
    'big'
  );

  renderStyles();
}

function renderStyles() {
  const current = selectedStyle();
  const level = xpLevel();

  $('styleGrid').innerHTML = STYLES.map(style => {
    const unlocked = level >= style.unlockLevel;
    const selected = current === style.id;

    return '<div class="style-card' +
      (unlocked ? ' unlocked' : ' locked') +
      (selected ? ' selected' : '') +
      '">' +

      '<div class="style-preview" style="' +
        '--style-bg:' + style.colours[0] + ';' +
        '--style-main:' + style.colours[1] + ';' +
        '--style-accent:' + style.colours[2] + ';' +
      '">' +
        '<span></span><span></span><span></span>' +
      '</div>' +

      '<h3>' + esc(style.name) + '</h3>' +
      '<p>' + esc(style.description) + '</p>' +

      (unlocked
        ? '<button class="ghost small style-select" data-style="' + style.id + '">' +
            (selected ? 'Selected' : 'Use style') +
          '</button>'
        : '<span class="style-lock">Unlock at Pass Level ' +
            style.unlockLevel +
          '</span>') +

      '</div>';
  }).join('');

  $('styleGrid').querySelectorAll('.style-select').forEach(button => {
    button.onclick = () => {
      setStyle(button.dataset.style);
    };
  });
}

function openStyles() {
  renderStyles();
  $('stylesModal').hidden = false;
}


/* ---------------- inventory ---------------- */

let inventoryTab = 'course';

const BONUS_ITEMS = [
  {
    id: 'dice',
    level: 3,
    name: 'Dice roll example',
    description: 'A Java example that rolls a number from 1 to 6.',
    code:
`public class DiceRoll {
  public static void main(String[] args) {
    int roll = (int)(Math.random() * 6) + 1;
    System.out.println("You rolled: " + roll);
  }
}`
  },
  {
    id: 'cheat-sheet',
    level: 5,
    name: 'Java cheat sheet',
    description: 'Quick Java reminders for your next Crystal Run build.',
    code:
`PRINT TEXT
System.out.println("Hello!");

VARIABLES
int score = 0;
String playerName = "Alex";
boolean gameOver = false;

IF STATEMENTS
if (score >= 10) {
  System.out.println("Level up!");
} else {
  System.out.println("Keep going!");
}

LOOPS
for (int i = 0; i < 5; i++) {
  System.out.println(i);
}`
  }
];

function inventoryCodeCard(title, description, code, status) {
  return '<article class="inventory-card">' +
    '<div class="inventory-card-head">' +
      '<div>' +
        '<h3>' + esc(title) + '</h3>' +
        '<p>' + esc(description) + '</p>' +
      '</div>' +
      '<span class="inventory-status ' + (status === 'Complete' ? 'complete' : '') + '">' +
        esc(status) +
      '</span>' +
    '</div>' +
    '<pre class="console inventory-code"><code>' + esc(code) + '</code></pre>' +
    '<button class="ghost small inventory-copy" data-copy="' +
      encodeURIComponent(code) +
    '">Copy code</button>' +
  '</article>';
}

function renderInventoryCourse() {
  const cards = [];

  LEVELS.forEach((level, levelIndex) => {
    level.sections.forEach((section, sectionIndex) => {
      const savedBuild = store.get(K.build(levelIndex, sectionIndex), null);
      const finished = (store.get(K.done(levelIndex), []) || []).indexOf(sectionIndex) >= 0;

      if (!savedBuild && !finished) return;

      const code = savedBuild || section.build.reference;
      const status = finished ? 'Complete' : 'Saved draft';

      cards.push(
        inventoryCodeCard(
          'Level ' + level.id + ' · ' + section.title,
          section.goal,
          code,
          status
        )
      );
    });
  });

  if (!cards.length) {
    return '<div class="inventory-empty">' +
      '<strong>Your inventory is empty.</strong>' +
      '<span>Write code in a build task and it will appear here automatically.</span>' +
    '</div>';
  }

  return '<div class="inventory-list">' + cards.join('') + '</div>';
}

function renderInventoryBonus() {
  const playerLevel = xpLevel();

  return '<div class="inventory-list">' + BONUS_ITEMS.map(item => {
    const unlocked = playerLevel >= item.level;

    if (!unlocked) {
      return '<article class="inventory-card locked">' +
        '<div class="inventory-card-head">' +
          '<div>' +
            '<h3>' + esc(item.name) + '</h3>' +
            '<p>' + esc(item.description) + '</p>' +
          '</div>' +
          '<span class="inventory-status">Locked</span>' +
        '</div>' +
        '<p class="inventory-lock">Unlock at XP Pass Level ' + item.level + '.</p>' +
      '</article>';
    }

    return inventoryCodeCard(
      item.name,
      item.description,
      item.code,
      'Unlocked'
    );
  }).join('') + '</div>';
}

function renderInventory() {
  const content = $('inventoryContent');

  if (!content) return;

  content.innerHTML = inventoryTab === 'course'
    ? renderInventoryCourse()
    : renderInventoryBonus();

  $('inventoryModal').querySelectorAll('.inventory-tab').forEach(button => {
    const active = button.dataset.invTab === inventoryTab;
    button.classList.toggle('active', active);

    button.onclick = () => {
      inventoryTab = button.dataset.invTab;
      renderInventory();
    };
  });

  content.querySelectorAll('.inventory-copy').forEach(button => {
    button.onclick = () => {
      const code = decodeURIComponent(button.dataset.copy);

      const copied = () => {
        toast(
          '<strong>Code copied!</strong>' +
          '<span>Paste it into a Java file or editor.</span>',
          'big'
        );
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(copied, copied);
      } else {
        copied();
      }
    };
  });
}

function openInventory() {
  inventoryTab = 'course';
  renderInventory();
  $('inventoryModal').hidden = false;
}

  /* ---- code helpers ---- */
  function exCode(i, j) { return store.get(K.ex(li, i, j), null) || S[i].examples[j].code; }
  function buildCode(i) { return store.get(K.build(li, i), null) || S[i].build.starter; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function runJava(src) {
    const t0 = Date.now();
    const r = MiniJava.run(src, { maxSteps: 900000, maxOutput: 900 });
    return { r: r, ms: Date.now() - t0 };
  }

  function showRun(consoleEl, res) {
    const r = res.r;
    const help = $('errHelp');
    if (help) {
      if (!r.ok) {
        help.innerHTML = '<button class="ghost small" id="whyBtn">Why did this break?</button>';
        $('whyBtn').onclick = () => window.TUTOR && TUTOR.explainError(r.error, currentCode());
      } else help.innerHTML = '';
    }
    let html = '';
    if (r.output) html += esc(r.output);
    if (!r.ok) {
      html += (r.output ? '\n' : '') + '<span class="err">' + esc('✕ ' + r.error + (r.line ? '  (near line ' + r.line + ')' : '')) + '</span>';
    } else if (!r.output) {
      html += '<span class="dim">(the program ran but printed nothing yet)</span>';
    } else {
      html += '<span class="dim">\n— finished in ' + res.ms + 'ms —</span>';
    }
    consoleEl.innerHTML = html;
  }

  /* ---------------- editor: line numbers, tab, auto indent ---------------- */
  function editorBlock(label, code, id) {
    return '<div class="editor-wrap"><div class="editor-bar"><span>' + esc(label) + '</span><div class="dots"><i class="dot"></i><i class="dot c"></i><i class="dot"></i></div></div>' +
      '<div class="ed-body"><div class="gutter" id="' + id + '-g" aria-hidden="true"><div class="gnums"></div></div>' +
      '<textarea class="code" id="' + id + '" spellcheck="false" wrap="off" autocapitalize="off" autocorrect="off">' + esc(code) + '</textarea></div></div>';
  }

  function wireEditor(ta) {
    const gut = $(ta.id + '-g');
    const nums = gut ? gut.firstChild : null;
    let lineCount = -1;

    function paint() {
      if (!nums) return;
      const lines = ta.value.split('\n').length;
      if (lines !== lineCount) {
        lineCount = lines;
        let h = '';
        for (let i = 1; i <= lines; i++) h += '<i>' + i + '</i>';
        nums.innerHTML = h;
        gut.style.width = (String(lines).length * 8 + 18) + 'px';
      }
      const cur = ta.value.slice(0, ta.selectionStart).split('\n').length;
      const kids = nums.children;
      for (let i = 0; i < kids.length; i++) {
        const on = (i + 1 === cur);
        if (on !== (kids[i].className === 'cur')) kids[i].className = on ? 'cur' : '';
      }
      nums.style.transform = 'translateY(' + (-ta.scrollTop) + 'px)';
    }
    ta.__paint = paint;

    ta.addEventListener('scroll', paint);
    ta.addEventListener('input', paint);
    ta.addEventListener('keyup', paint);
    ta.addEventListener('click', paint);
    ta.addEventListener('focus', paint);

    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
        ta.dispatchEvent(new Event('input'));
      } else if (e.key === 'Enter') {
        const s = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
        const line = ta.value.slice(lineStart, s);
        const indent = (line.match(/^[ \t]*/) || [''])[0] + (/[{(]\s*$/.test(line) ? '    ' : '');
        e.preventDefault();
        ta.value = ta.value.slice(0, s) + '\n' + indent + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + 1 + indent.length;
        ta.dispatchEvent(new Event('input'));
      }
    });
    paint();
  }
  function setCode(ta, text) { ta.value = text; ta.dispatchEvent(new Event('input')); }

  /* ---- every Java word used in this code, as tappable chips ---- */
  function wordStrip(code) {
    if (!window.EXPLAIN || !window.GLOSSARY) return '';
    const seen = [];
    EXPLAIN.source(code).forEach(r => r.terms.forEach(t => { if (seen.indexOf(t) < 0) seen.push(t); }));
    if (!seen.length) return '';
    return '<div class="wordstrip"><span class="wslabel">Words in this code</span>' +
      seen.map(t => '<button class="qlink" data-def="' + esc(t) + '">' + esc(t) + '</button>').join('') +
      '<span class="wshint">tap any one for a plain-English meaning</span></div>';
  }

  /* ---- what the help panel is looking at ---- */
  function currentCode() { const ta = $('ed'); return ta ? ta.value : ''; }
  function whereLabel() {
    const s = S[si];
    return 'Level ' + LEVELS[li].id + ' (' + LEVELS[li].title + '), Section ' + (si + 1) + ' "' + s.title + '" — ' +
      (step < s.examples.length ? 'Example ' + (step + 1) + ': ' + s.examples[step].title : 'the build task: ' + s.goal) +
      '. Concepts here: ' + s.concepts.join(', ') + '.';
  }

  /* ---------------- render ---------------- */
  function renderLevelTabs() {
    $('levelTabs').innerHTML = LEVELS.map((L, l) => {
      const open = levelUnlocked(l), full = levelDone(l);
      return '<button class="ltab' + (l === li ? ' active' : '') + (open ? '' : ' locked') + (full ? ' full' : '') + '" data-lv="' + l + '">' +
        '<span class="lnum">Level ' + L.id + '</span><span class="ltitle">' + esc(L.title) + '</span>' +
        '<span class="lstate">' + (full ? 'complete' : open ? (store.get(K.done(l), []) || []).length + '/' + L.sections.length : 'locked') + '</span></button>';
    }).join('');
    $('levelTabs').querySelectorAll('[data-lv]').forEach(b => b.onclick = () => {
      const l = +b.dataset.lv;
      if (!levelUnlocked(l)) {
        toast('<strong>Level ' + LEVELS[l].id + ' is locked</strong><span>Finish every section of Level ' + LEVELS[l - 1].id + ' first.</span>', 'big');
        return;
      }
      gotoLevel(l);
    });
  }

  function gotoLevel(l) {
    li = l; store.set(K.level, l);
    S = LEVELS[li].sections;
    done = store.get(K.done(li), []);
    si = 0; step = 0;
    for (let i = 0; i < S.length; i++) if (!isDone(i)) { si = i; break; }
    render();
  }

  function renderNav() {
    $('levelName').textContent = 'Level ' + LEVELS[li].id + ' · ' + LEVELS[li].title;
    $('levelBlurb').textContent = LEVELS[li].blurb;
    $('navList').innerHTML = S.map((s, i) => {
      const open = sectionUnlocked(i);
      return '<button class="navitem' + (i === si ? ' active' : '') + (isDone(i) ? ' done' : '') + (open ? '' : ' locked') + '" data-go="' + i + '">' +
        '<span class="n">' + (isDone(i) ? '✓' : open ? (i + 1) : '🔒') + '</span><span class="t">' + esc(s.title) + '</span></button>';
    }).join('');
    $('navList').querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
      const i = +b.dataset.go;
      if (!sectionUnlocked(i)) {
        toast('<strong>Section ' + (i + 1) + ' is locked</strong><span>Build section ' + i + ' first — each part needs the one before it.</span>', 'big');
        return;
      }
      si = i; step = 0; render();
    });
    renderLevelTabs();
    renderXP();
  }

  function render() {
    const s = S[si];
    const total = s.examples.length + 1;
    if (step > total - 1) step = total - 1;
    while (step > 0 && !stepUnlocked(si, step)) step--;
    savePos();
    renderNav();

    $('sectNum').textContent = 'Level ' + LEVELS[li].id + ' · Section ' + (si + 1);
    $('sectGoal').textContent = s.goal;
    $('sectTitle').textContent = s.title;
    $('sectBrief').innerHTML = s.brief;
    $('sectChips').innerHTML = s.concepts.map(c => '<span class="chip">' + esc(c) + '</span>').join('');

    const seen = store.get(K.seen(li, si), []);
    $('stepTabs').innerHTML = s.examples.map((ex, j) => {
      const open = stepUnlocked(si, j), fin = isExDone(si, j);
      return '<button class="step' + (step === j ? ' active' : '') + (fin ? ' seen' : '') + (open ? '' : ' locked') + '" data-step="' + j + '">' +
        (fin ? '✓ ' : open ? '' : '🔒 ') + 'Example ' + (j + 1) + '</button>';
    }).join('') +
      '<button class="step build' + (step === total - 1 ? ' active' : '') + (isDone(si) ? ' built' : '') + (allExamplesDone(si) ? '' : ' locked') + '" data-step="' + (total - 1) + '">' +
      (allExamplesDone(si) ? '' : '🔒 ') + 'Build the ' + esc(s.build.label || 'game part') + '</button>';
    $('stepTabs').querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
      const j = +b.dataset.step;
      if (!stepUnlocked(si, j)) {
        toast(j >= s.examples.length
          ? '<strong>Build task locked</strong><span>Run all ' + s.examples.length + ' examples first — they teach what the build needs.</span>'
          : '<strong>Example ' + (j + 1) + ' is locked</strong><span>Run example ' + j + ' first.</span>', 'big');
        return;
      }
      step = j; render();
    });

    if (step < s.examples.length) renderExample(s, step, seen);
    else renderBuild(s);

    $('prevBtn').disabled = (si === 0 && step === 0);
    $('nextBtn').textContent = (step === total - 1) ? (si === S.length - 1 ? 'Play my game →' : 'Next section →') : 'Next →';
    $('pagerHint').textContent = step < s.examples.length
      ? (isExDone(si, step) ? 'Example ' + (step + 1) + ' complete. Move on when you are ready.' : 'Run this example to complete it — every example is required')
      : (isDone(si) ? 'Section built. On to the next part of the game.' : 'Write this part yourself, then press Check my build');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderExample(s, j, seen) {
    const ex = s.examples[j];
    if (seen.indexOf(j) < 0) { seen.push(j); store.set(K.seen(li, si), seen); }
    const fin = isExDone(si, j);
    $('stepPanel').innerHTML =
      '<h2>Example ' + (j + 1) + ' — ' + esc(ex.title) + '</h2>' +
      '<p class="teach">' + ex.teach + '</p>' +
      wordStrip(ex.code) +
      editorBlock('Example.java', exCode(si, j), 'ed') +
      '<div class="row"><button class="primary" id="runBtn">▶ Run</button><button class="ghost" id="resetBtn">Reset example</button><span class="spacer"></span>' +
      '<button class="ghost small" id="explainBtn">Explain every line</button></div>' +
      '<pre class="console" id="out"><span class="dim">Press Run to see what Java prints.</span></pre>' +
      '<div id="errHelp"></div>' +
      '<p class="task' + (fin ? ' ok' : '') + '" id="exTask">' + (fin
        ? '<strong>Example complete</strong> — +' + XP_EXAMPLE + ' XP earned. Keep playing with the code as much as you like.'
        : '<strong>Required:</strong> run this example so it works, and you earn ' + XP_EXAMPLE + ' XP and unlock the next step.') + '</p>' +
      '<p class="tip"><strong>Your turn:</strong> ' + ex.tryThis + '</p>';

    const ta = $('ed');
    wireEditor(ta);
    ta.addEventListener('input', () => { store.set(K.ex(li, si, j), ta.value); refreshHelp(); touch(); });
    $('runBtn').onclick = () => {
      const res = runJava(ta.value);
      showRun($('out'), res);
      if (res.r.ok && (res.r.output || '').trim()) completeExample(si, j);
    };
    $('resetBtn').onclick = () => { store.del(K.ex(li, si, j)); setCode(ta, ex.code); refreshHelp(); };
    $('explainBtn').onclick = () => window.TUTOR && TUTOR.open('explain');
    decorate();
  }

  function completeExample(i, j) {
    const d = exDone(i);
    const fresh = d.indexOf(j) < 0;
    if (fresh) { d.push(j); d.sort((a, b) => a - b); store.set(K.exdone(li, i), d); }
    if (fresh) {
      award('l' + (li + 1) + '.s' + i + '.e' + j);
      const t = $('exTask');
      if (t) { t.className = 'task ok'; t.innerHTML = '<strong>Example complete</strong> — +' + XP_EXAMPLE + ' XP earned. Keep playing with the code as much as you like.'; }
      const tabs = $('stepTabs');
      if (tabs) render();
    }
  }

  let helpTimer = null;
  function refreshHelp() { clearTimeout(helpTimer); helpTimer = setTimeout(() => { if (window.TUTOR) TUTOR.refresh(); }, 400); }
  function decorate() {
    if (!window.TUTOR) return;
    TUTOR.decorate($('stepPanel'));
    TUTOR.decorate($('sectBrief'));
    $('stepPanel').querySelectorAll('[data-def]').forEach(b => b.onclick = () => TUTOR.showTerm(b.dataset.def));
  }

  function assemble(b, code) {
    return [b.context, code, b.harness].filter(x => x && x.trim()).join('\n\n');
  }

  function renderBuild(s) {
    const b = s.build;
    $('stepPanel').innerHTML =
      '<h2>Build it — ' + esc(s.goal) + '</h2>' +
      '<p class="brief">' + b.brief + '</p>' +
      wordStrip(b.starter) +
      editorBlock(fileNameFor(s), buildCode(si), 'ed') +
      '<div class="row"><button class="primary" id="checkBtn">✔ Check my build</button><button class="ghost" id="runBtn">▶ Run</button><button class="ghost" id="resetBtn">Reset</button><span class="spacer"></span>' +
      '<button class="ghost small" id="explainBtn">Explain every line</button>' +
      '<button class="ghost small" id="peekBtn">Peek at one solution</button></div>' +
      '<pre class="console" id="out"><span class="dim">Run your code to test it. Check my build marks the section complete.</span></pre>' +
      '<div id="errHelp"></div>' +
      '<p class="verdict" id="verdict"></p>' +
      '<ul class="checks" id="checks">' + b.checks.map(c => '<li>' + c[1] + '</li>').join('') + '</ul>' +
      (b.context ? '<details class="src"><summary>See the code from earlier sections that runs with this</summary><pre class="console">' + esc(b.context) + (b.harness ? '\n\n' + esc(b.harness) : '') + '</pre></details>'
        : (b.harness ? '<details class="src"><summary>See the test code that runs your class</summary><pre class="console">' + esc(b.harness) + '</pre></details>' : ''));

    const ta = $('ed');
    wireEditor(ta);
    ta.addEventListener('input', () => { store.set(K.build(li, si), ta.value); refreshHelp(); touch(); });
    $('runBtn').onclick = () => showRun($('out'), runJava(assemble(b, ta.value)));
    $('resetBtn').onclick = () => { store.del(K.build(li, si)); setCode(ta, b.starter); refreshHelp(); };
    $('explainBtn').onclick = () => window.TUTOR && TUTOR.open('explain');
    $('peekBtn').onclick = () => {
      if (!confirm('Show a working version of this section? Try your own first — you can still edit it afterwards.')) return;
      setCode(ta, b.reference); store.set(K.build(li, si), ta.value);
    };
    $('checkBtn').onclick = () => checkBuild(s, ta.value);
    decorate();
  }

  function fileNameFor(s) {
    const m = /class\s+(\w+)/.exec(s.build.starter);
    return (m ? m[1] : 'Section') + '.java';
  }

  function markDone(i) { if (!isDone(i)) { done.push(i); done.sort((a, b) => a - b); store.set(K.done(li), done); touch(); } }

  function checkBuild(s, code) {
    const b = s.build;
    const items = $('checks').children;
    let missing = 0;
    b.checks.forEach((c, i) => {
      const ok = code.indexOf(c[0]) >= 0;
      items[i].className = ok ? 'pass' : 'fail';
      if (!ok) missing++;
    });
    const v = $('verdict');
    if (missing) {
      v.className = 'verdict bad';
      v.textContent = missing === 1 ? 'One thing is still missing — see the highlighted item below.' : missing + ' things are still missing — see the highlighted items below.';
      $('out').innerHTML = '<span class="dim">Fix the items below, then check again.</span>';
      return;
    }
    const res = runJava(assemble(b, code));
    showRun($('out'), res);
    if (!res.r.ok) {
      v.className = 'verdict bad';
      v.textContent = 'Your code has all the right pieces but it crashed when it ran. Read the red message in the output.';
      return;
    }
    const out = res.r.output || '';
    if (b.minPrints) {
      const n = (code.match(/System\.out\.print/g) || []).length;
      if (n < b.minPrints) { v.className = 'verdict bad'; v.textContent = 'Print at least ' + b.minPrints + ' lines so the screen looks like a real title screen.'; return; }
    }
    if (b.expect) {
      const miss = b.expect.filter(x => out.indexOf(x) < 0);
      if (miss.length) { v.className = 'verdict bad'; v.textContent = b.expectMsg || 'The output is not quite right yet.'; return; }
    }
    if (b.expectLines) {
      const lines = out.split('\n').filter(x => x.trim());
      const uniq = {}; lines.forEach(l => uniq[l] = 1);
      if (lines.length < b.expectLines || Object.keys(uniq).length < 2) { v.className = 'verdict bad'; v.textContent = b.expectMsg || 'Each case should print its own message.'; return; }
    }
    const fresh = !isDone(si);
    markDone(si);
    if (fresh) award('l' + (li + 1) + '.s' + si + '.b');
    const last = si === S.length - 1;
    render();
    const v2 = $('verdict');
    v2.className = 'verdict good';
    v2.textContent = last
      ? 'Section built. Level ' + LEVELS[li].id + ' is complete — press "Play my game" to run the whole thing.'
      : 'Section built and added to your game. ' + (S.length - done.length) + ' part' + (S.length - done.length === 1 ? '' : 's') + ' to go in this level.';
    if (last && li + 1 < LEVELS.length) {
      toast('<strong>Level ' + LEVELS[li + 1].id + ' unlocked</strong><span>' + esc(LEVELS[li + 1].title) + ' — a bigger game awaits.</span>', 'big');
    }
  }

  /* ---- assemble + play the whole game ---- */
  function fullSource() {
    const L = LEVELS[li];
    const slotOf = L.slotOf || {};
    const slots = {}, mineKeys = [];
    S.forEach((s, i) => {
      const key = slotOf[s.id] || s.slot || s.id;
      let code = s.build.reference, mine = false;
      if (isDone(i)) {
        const c = store.get(K.build(li, i), null);
        if (c && c.trim()) { code = c; mine = true; }
      }
      slots[key] = { code: code, mine: mine, section: i };
    });
    const keys = (L.assemble || Object.keys(slots));
    let src = keys.map(k => slots[k] ? slots[k].code : '').filter(x => x).join('\n\n');
    let test = MiniJava.run(src, { maxSteps: 1200000, maxOutput: 900 });
    if (!test.ok) {
      src = keys.map(k => slots[k] ? S[slots[k].section].build.reference : '').filter(x => x).join('\n\n');
      test = MiniJava.run(src, { maxSteps: 1200000, maxOutput: 900 });
      return { src: src, res: test, fallback: true };
    }
    keys.forEach(k => { if (slots[k] && slots[k].mine) mineKeys.push(k); });
    return { src: src, res: test, fallback: false, mine: mineKeys.length };
  }

  function playGame() {
    const g = fullSource();
    $('gameModal').hidden = false;
    $('gameTitle').textContent = LEVELS[li].title + ' — full playthrough';
    $('gameSrc').textContent = g.src;
    const parts = done.length;
    $('modalSub').innerHTML = g.fallback
      ? 'Something in your own code stopped the full game from running, so this playthrough uses the reference version. Run your sections one by one to find it.'
      : (parts === 0 ? 'You have not built any sections yet, so this is the reference version of the finished game — the exact program you are working towards.'
        : parts < S.length ? 'Running your ' + parts + ' finished section' + (parts === 1 ? '' : 's') + ', with reference code filling the ' + (S.length - parts) + ' you have not built yet.'
          : 'This is your game, running entirely on the code you wrote. Every class here came from your keyboard.');
    showRun($('gameOut'), { r: g.res, ms: 0 });
  }


  /* ---------------- saves ---------------- */
  const SLOTS = ['auto', '1', '2', '3'];
  const SLOT_NAME = { auto: 'Autosave', '1': 'Slot 1', '2': 'Slot 2', '3': 'Slot 3' };
  const slotKey = n => 'cr.save.' + n;

  function progressKeys() {
    const out = {};
    const keep = k => k && k.indexOf('cr.') === 0 && k.indexOf('cr.save.') !== 0 && k !== 'cr.savedAt';
    Object.keys(mem).forEach(k => { if (keep(k)) out[k] = 1; });
    if (PERSIST) {
      try { for (let i = 0; i < PERSIST.length; i++) { const k = PERSIST.key(i); if (keep(k)) out[k] = 1; } } catch (e) {}
    }
    return Object.keys(out);
  }

  function snapshot() {
    const data = {};
    progressKeys().forEach(k => { const v = store.get(k, null); if (v !== null) data[k] = v; });
    return {
      app: 'crystal-run', v: 1, at: Date.now(),
      xp: xpTotal(), lv: xpLevel(),
      built: LEVELS.map((L, l) => (store.get(K.done(l), []) || []).length),
      data: data
    };
  }

  function applySnapshot(snap) {
    if (!snap || snap.app !== 'crystal-run' || !snap.data) throw new Error('That is not a Crystal Run save.');
    progressKeys().forEach(k => store.del(k));
    Object.keys(snap.data).forEach(k => store.set(k, snap.data[k]));
    reloadState();
  }

  function reloadState() {
    li = Math.min(store.get(K.level, 0) || 0, LEVELS.length - 1);
    S = LEVELS[li].sections;
    const p = store.get(K.pos, { l: li, s: 0, step: 0 });
    si = (p.l === li) ? Math.min(p.s || 0, S.length - 1) : 0;
    step = (p.l === li) ? (p.step || 0) : 0;
    done = store.get(K.done(li), []) || [];
    xp = store.get(K.xp, []) || [];
    render();
  }

  let autoTimer = null;
  function touch() { clearTimeout(autoTimer); autoTimer = setTimeout(autosave, 900); }
  function autosave() {
    try { store.set(slotKey('auto'), snapshot()); store.set('cr.savedAt', Date.now()); } catch (e) {}
    if (!$('saveModal').hidden) renderSlots();
  }

  function when(ms) {
    if (!ms) return 'empty';
    const d = Math.round((Date.now() - ms) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + ' min ago';
    if (d < 86400) return Math.floor(d / 3600) + ' hr ago';
    return new Date(ms).toLocaleDateString();
  }

  function slotLine(snap) {
    if (!snap) return 'Empty — nothing saved here yet';
    const bits = snap.built.map((n, l) => 'L' + LEVELS[l].id + ' ' + n + '/' + LEVELS[l].sections.length);
    return 'Level ' + snap.lv + ' · ' + snap.xp + ' XP · ' + bits.join(' · ') + ' · saved ' + when(snap.at);
  }

  function renderSlots() {
    $('saveState').textContent = PERSIST
      ? 'Your progress saves by itself in this browser as you work. Use a slot to keep a copy you can come back to, or a save file to move it somewhere else.'
      : 'This window cannot store progress in the browser, so nothing survives a refresh here. Download a save file (or copy the save code) before you close it, and open it again next time.';
    $('slotList').innerHTML = SLOTS.map(n => {
      const snap = store.get(slotKey(n), null);
      return '<div class="slot' + (snap ? '' : ' blank') + '">' +
        '<div class="sinfo"><strong>' + SLOT_NAME[n] + (n === 'auto' ? '<span class="auto">automatic</span>' : '') + '</strong>' +
        '<span>' + esc(slotLine(snap)) + '</span></div>' +
        '<div class="sacts">' +
        (n === 'auto' ? '' : '<button class="ghost small" data-save="' + n + '">Save here</button>') +
        '<button class="primary small" data-load="' + n + '"' + (snap ? '' : ' disabled') + '>Load</button>' +
        (n === 'auto' ? '' : '<button class="ghost small danger" data-wipe="' + n + '"' + (snap ? '' : ' disabled') + '>Delete</button>') +
        '</div></div>';
    }).join('');
    $('slotList').querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
      store.set(slotKey(b.dataset.save), snapshot());
      renderSlots(); saveMsg('Saved into ' + SLOT_NAME[b.dataset.save] + '.');
      toast('<strong>Progress saved</strong><span>' + SLOT_NAME[b.dataset.save] + ' updated</span>', 'big');
    });
    $('slotList').querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
      const snap = store.get(slotKey(b.dataset.load), null);
      if (!snap) return;
      if (!confirm('Load ' + SLOT_NAME[b.dataset.load] + '? Your current progress is replaced by that save.')) return;
      try { applySnapshot(snap); $('saveModal').hidden = true; toast('<strong>Save loaded</strong><span>' + SLOT_NAME[b.dataset.load] + ' restored</span>', 'big'); }
      catch (e) { saveMsg(e.message, true); }
    });
    $('slotList').querySelectorAll('[data-wipe]').forEach(b => b.onclick = () => {
      if (!confirm('Delete ' + SLOT_NAME[b.dataset.wipe] + '? Your current progress is not touched.')) return;
      store.del(slotKey(b.dataset.wipe)); renderSlots(); saveMsg(SLOT_NAME[b.dataset.wipe] + ' deleted.');
    });
  }

  let msgTimer = null;
  function saveMsg(txt, bad) {
    const m = $('saveMsg');
    m.className = 'save-msg' + (bad ? ' bad' : ' ok');
    m.textContent = txt;
    clearTimeout(msgTimer); msgTimer = setTimeout(() => { m.textContent = ''; m.className = 'save-msg'; }, 6000);
  }

  function saveText() { return JSON.stringify(snapshot()); }

  function downloadSave() {
    const name = 'crystal-run-save-' + new Date().toISOString().slice(0, 10) + '.json';
    try {
      const blob = new Blob([JSON.stringify(snapshot(), null, 1)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      saveMsg('Save file created: ' + name + '. If your browser blocked the download, use Copy save code instead.');
    } catch (e) { saveMsg('This window blocked the download. Use Copy save code instead.', true); }
  }

  function openSaves() { $('saveModal').hidden = false; renderSlots(); }

  $('savesBtn').onclick = openSaves;
  $('closeSaves').onclick = () => { $('saveModal').hidden = true; };
  $('saveModal').addEventListener('click', e => { if (e.target === $('saveModal')) $('saveModal').hidden = true; });
  $('dlSave').onclick = downloadSave;
  $('copySave').onclick = () => {
    const txt = saveText();
    const fin = ok => saveMsg(ok ? 'Save code copied. Paste it somewhere safe — a note, an email to yourself, anywhere.' : 'Could not copy. Use Paste a save code to see and copy it by hand.', !ok);
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => fin(true), () => { showPaste(txt); fin(false); });
    else { showPaste(txt); fin(false); }
  };
  function showPaste(val) { $('pasteWrap').hidden = false; $('pasteBox').value = val || ''; $('pasteBox').focus(); }
  $('pasteSaveBtn').onclick = () => showPaste('');
  $('pasteCancel').onclick = () => { $('pasteWrap').hidden = true; $('pasteBox').value = ''; };
  $('pasteGo').onclick = () => {
    let snap = null;
    try { snap = JSON.parse($('pasteBox').value); } catch (e) { saveMsg('That code is not complete — copy the whole thing, from { to }.', true); return; }
    try {
      applySnapshot(snap);
      $('pasteWrap').hidden = true; $('saveModal').hidden = true;
      toast('<strong>Save restored</strong><span>Your progress is back</span>', 'big');
    } catch (e) { saveMsg(e.message, true); }
  };
  $('upSaveBtn').onclick = () => $('upSave').click();
  $('upSave').onchange = () => {
    const f = $('upSave').files && $('upSave').files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let snap = null;
      try { snap = JSON.parse(String(r.result)); } catch (e) { saveMsg('That file is not readable as a save.', true); return; }
      try {
        applySnapshot(snap); $('saveModal').hidden = true;
        toast('<strong>Save loaded</strong><span>' + esc(f.name) + '</span>', 'big');
      } catch (e) { saveMsg(e.message, true); }
    };
    r.onerror = () => saveMsg('That file could not be read.', true);
    r.readAsText(f);
    $('upSave').value = '';
  };

  /* ---------------- wiring ---------------- */
  $('passBtn').onclick = openPass;
  $('xpMeter').onclick = openPass;
  $('closePass').onclick = () => { 
    $('passModal').hidden = true; 
  };
  $('passModal').addEventListener('click', e => { 
    if (e.target === $('passModal')) {
      $('passModal').hidden = true; 
    }
  });

  /* Styles page buttons */
  $('stylesBtn').onclick = openStyles;

  $('closeStyles').onclick = () => {
    $('stylesModal').hidden = true;
  };

  $('stylesModal').addEventListener('click', e => {
    if (e.target === $('stylesModal')) {
      $('stylesModal').hidden = true;
    }
  });

  $('inventoryBtn').onclick = openInventory;

  $('closeInventory').onclick = () => {
    $('inventoryModal').hidden = true;
  };

  $('inventoryModal').addEventListener('click', e => {
    if (e.target === $('inventoryModal')) {
      $('inventoryModal').hidden = true;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('gameModal').hidden = true; $('passModal').hidden = true; $('saveModal').hidden = true; $('stylesModal').hidden = true; $('inventoryModal').hidden = true; }
  });
  $('copyGame').onclick = () => {
    const txt = $('gameSrc').textContent;
    const fin = () => { $('copyMsg').textContent = 'Copied — paste into Game.java and run it with real Java.'; setTimeout(() => $('copyMsg').textContent = '', 4000); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(fin, fin); else fin();
  };

  $('nextBtn').onclick = () => {
    const total = S[si].examples.length + 1;
    if (step < total - 1) {
      if (!stepUnlocked(si, step + 1)) {
        toast(step + 1 >= S[si].examples.length
          ? '<strong>Run every example first</strong><span>The build task opens once all examples have run.</span>'
          : '<strong>Run this example first</strong><span>Press Run so it works — that is how examples count.</span>', 'big');
        return;
      }
      step++; render();
    } else if (si < S.length - 1) {
      if (!sectionUnlocked(si + 1)) { toast('<strong>Build this section first</strong><span>Press Check my build to unlock the next section.</span>', 'big'); return; }
      si++; step = 0; render();
    } else playGame();
  };
  $('prevBtn').onclick = () => {
    if (step > 0) { step--; render(); }
    else if (si > 0) { si--; step = 0; render(); }
  };
  $('resetAll').onclick = () => {
    if (!confirm('Clear your progress, code and XP for Level ' + LEVELS[li].id + '?')) return;
    S.forEach((s, i) => {
      store.del(K.build(li, i)); store.del(K.seen(li, i)); store.del(K.exdone(li, i));
      s.examples.forEach((e, j) => store.del(K.ex(li, i, j)));
    });
    store.del(K.done(li)); store.del(K.pos);
    dropXpFor(li);
    done = []; si = 0; step = 0; render(); autosave();
  };

  if (window.TUTOR) {
    TUTOR.init({ context: () => ({ where: whereLabel(), code: currentCode() }) });
    $('primerBtn').onclick = () => { TUTOR.open('ask'); TUTOR.ask('I have never written code before, start here'); };
  }

  const savedTheme = store.get('cr.theme', '');
  if (savedTheme) {
    document.body.classList.add('theme-' + savedTheme);
  }

  function setupOnboarding() {
  const tutorialKey = 'cr.onboarding.complete';

  const steps = [
    {
      title: 'Welcome to Crystal Run',
      text: 'Crystal Run teaches Java by helping you build one real game, piece by piece. You will read examples, run code, write your own game features, and collect XP as you progress.'
    },
    {
      title: 'Choose your learning path',
      text: 'The sidebar contains your Java course levels. If you have never learned coding concepts before, use the Intro to Coding button in the top bar first, then return here when you are ready for Java.'
    },
    {
      title: 'Run every example',
      text: 'Each section starts with examples. Press Run and make sure the program works. A completed example earns XP and unlocks the next step, so you learn each idea before using it yourself.'
    },
    {
      title: 'Build your game',
      text: 'After the examples, you reach a build task. Edit the code, press Run to test it, then use Check my build. You should experiment first; the Peek at one solution button is there when you truly need help.'
    },
    {
      title: 'Save progress and ask for help',
      text: 'Your XP meter opens the Level Pass, Saves protects your work, and Ask opens the Java helper. Your progress is saved in this browser, but downloading a save file is the safest way to keep a copy.'
    }
  ];

  const overlay = $('onboarding');
  const title = $('onboardingTitle');
  const text = $('onboardingText');
  const label = $('onboardingStep');
  const dots = $('onboardingDots');
  const back = $('onboardingBack');
  const next = $('onboardingNext');
  const skip = $('onboardingSkip');

  if (!overlay || !title || !text || !label || !dots || !back || !next || !skip) return;
  if (store.get(tutorialKey, false)) return;

  let current = 0;

  function finishTutorial() {
    store.set(tutorialKey, true);
    overlay.hidden = true;
  }

  function renderTutorial() {
      const item = steps[current];
  
      label.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
      title.textContent = item.title;
      text.textContent = item.text;
  
      dots.innerHTML = steps.map((_, index) =>
        '<span class="onboarding-dot' + (index === current ? ' active' : '') + '"></span>'
      ).join('');
  
      back.disabled = current === 0;
      next.textContent = current === steps.length - 1 ? 'Start learning →' : 'Next →';
    }
  
    back.onclick = () => {
      if (current > 0) {
        current--;
        renderTutorial();
      }
    };
  
    next.onclick = () => {
      if (current === steps.length - 1) {
        finishTutorial();
        return;
      }
  
      current++;
      renderTutorial();
    };
  
    skip.onclick = finishTutorial;
  
    overlay.hidden = false;
    renderTutorial();
  }
  
  setupOnboarding();
  render();
  autosave();
})();
