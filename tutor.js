/* Side panel: ask questions, look up every word, explain code line by line. */
(function (global) {
  'use strict';
  const G = global.GLOSSARY, EX = global.EXPLAIN;
  const $ = id => document.getElementById(id);
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  let tab = 'ask';
  let history = [];          /* {q, html} newest first */
  let ai = { available: false, checked: false, running: null, convo: null, maxLen: 4000 };
  let getContext = () => ({ where: '', code: '' });

  /* ---------------- viewer Computer bridge (optional live tutor) ---------------- */
  function discoverViewerComputer(onAvailable, onUnavailable) {
    if (global.parent === global) { onUnavailable('no-host'); return; }
    const requestId = (global.crypto && global.crypto.randomUUID) ? global.crypto.randomUUID() : String(Math.random());
    let timeoutId;
    function cleanup() { global.removeEventListener('message', handleMessage); global.clearTimeout(timeoutId); }
    function handleMessage(event) {
      if (event.source !== global.parent || !event.data || event.data.type !== 'PPLX_ARTIFACT_COMPUTER_CAPABILITY_RESPONSE' || event.data.requestId !== requestId) return;
      cleanup();
      if (event.data.protocolVersion === 1 && event.data.available === true) onAvailable(event.data);
      else onUnavailable('viewer_computer_bridge_unavailable');
    }
    global.addEventListener('message', handleMessage);
    timeoutId = global.setTimeout(() => { cleanup(); onUnavailable('viewer_computer_bridge_unavailable'); }, 8000);
    global.parent.postMessage({ type: 'PPLX_ARTIFACT_COMPUTER_CAPABILITY_REQUEST', requestId }, '*');
  }

  function runViewerComputer(prompt, opts) {
    opts = opts || {};
    const requestId = (global.crypto && global.crypto.randomUUID) ? global.crypto.randomUUID() : String(Math.random());
    let cancelled = false;
    const dispose = () => global.removeEventListener('message', handleMessage);
    function handleMessage(event) {
      if (event.source !== global.parent || !event.data || event.data.type !== 'PPLX_ARTIFACT_COMPUTER_RUN_EVENT' || event.data.requestId !== requestId) return;
      const ev = event.data.event;
      if (ev.kind === 'started') ai.convo = ev.conversationId;
      if (opts.onEvent) opts.onEvent(ev);
      if (ev.kind === 'completed' || ev.kind === 'error' || ev.kind === 'computer_stopped') dispose();
    }
    global.addEventListener('message', handleMessage);
    const msg = { type: 'PPLX_ARTIFACT_COMPUTER_RUN_REQUEST', requestId, prompt };
    if (opts.conversationId) msg.conversationId = opts.conversationId;
    global.parent.postMessage(msg, '*');
    return {
      cancel() { if (cancelled) return; cancelled = true; global.parent.postMessage({ type: 'PPLX_ARTIFACT_COMPUTER_RUN_CANCEL', requestId }, '*'); },
      dispose
    };
  }

  /* ---------------- rendering ---------------- */
  const SUGGEST = [
    'What is a class?', 'What does static mean?', 'Why does every line end in a semicolon?',
    'What is the difference between = and ==?', 'What is an object?', 'What does void mean?',
    'Why is my loop running forever?', 'How do I add random dice rolls?',
    'How do I run this game on my own computer?', 'What should I learn after this course?'
  ];

  function termCard(key) {
    const e = G.terms[key];
    if (!e) return '';
    return '<div class="tcard">' +
      '<div class="tcard-head"><code class="tname">' + esc(key) + '</code><span class="tkind">' + esc(e.kind) + '</span></div>' +
      '<p class="tshort">' + e.short + '</p>' +
      '<p class="tlong">' + e.long + '</p>' +
      (e.ex ? '<pre class="tex">' + esc(e.ex) + '</pre>' : '') +
      '</div>';
  }

  function answerHtml(qtext) {
    const a = G.answer(qtext);
    if (!a) {
      return '<div class="ans none"><p>I do not have a stored answer for that one. Try naming a Java word — <button class="qlink" data-ask="What is a class?">class</button>, ' +
        '<button class="qlink" data-ask="What does static mean?">static</button>, ' +
        '<button class="qlink" data-ask="What is an ArrayList?">ArrayList</button> — or open the <button class="qlink" data-tab="words">Words</button> tab, ' +
        'which defines every word used in the course.' + (ai.available ? ' You can also send it to the AI tutor with the button below.' : '') + '</p></div>';
    }
    if (a.type === 'term') {
      return '<div class="ans">' + (a.weak ? '' : '') + termCard(a.term) +
        '<p class="rel">Related: ' + related(a.term) + '</p></div>';
    }
    return '<div class="ans"><p class="afaq">' + a.title + '</p><p>' + a.body + '</p></div>';
  }

  function related(key) {
    const e = G.terms[key];
    const pool = Object.keys(G.terms).filter(k => k !== key && G.terms[k].kind === e.kind).slice(0, 4);
    return pool.map(k => '<button class="qlink" data-term="' + esc(k) + '">' + esc(k) + '</button>').join(' ');
  }

  function renderAsk() {
    const body = $('tutorBody');
    body.innerHTML =
      '<div class="askbox">' +
      '<textarea id="askInput" rows="2" placeholder="Ask anything about Java — &quot;what is a constructor?&quot;, &quot;why won\'t my loop stop?&quot;"></textarea>' +
      '<div class="askrow"><button class="primary small" id="askBtn">Answer</button>' +
      '<button class="ghost small" id="aiBtn" hidden>Ask the AI tutor</button>' +
      '<span class="aihint" id="aiHint"></span></div>' +
      '</div>' +
      '<div id="askOut">' + (history.length ? '' :
        '<p class="dim small">Answers appear here instantly — no internet needed. Or start with one of these.</p>') + '</div>' +
      '<div class="sugg">' + SUGGEST.map(q => '<button class="qlink" data-ask="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>';

    renderHistory();
    $('askBtn').onclick = () => ask($('askInput').value);
    $('askInput').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask($('askInput').value); });
    const aiBtn = $('aiBtn');
    if (ai.available) { aiBtn.hidden = false; aiBtn.onclick = () => askAI($('askInput').value); }
    else if (ai.checked) $('aiHint').textContent = '';
    wireLinks(body);
  }

  function renderHistory() {
    const out = $('askOut');
    if (!out) return;
    if (!history.length) return;
    out.innerHTML = history.map((h, i) =>
      '<div class="qa"><p class="qtext">' + esc(h.q) + '</p>' + h.html + '</div>').join('');
    wireLinks(out);
  }

  function ask(text) {
    const q = String(text || '').trim();
    if (!q) return;
    history.unshift({ q: q, html: answerHtml(q) });
    history = history.slice(0, 12);
    const inp = $('askInput'); if (inp) inp.value = q;
    renderHistory();
  }

  function askAI(text) {
    const q = String(text || '').trim();
    if (!q) return;
    if (!ai.available) return;
    if (ai.running) { ai.running.cancel(); ai.running = null; }
    const ctx = getContext();
    const prompt = [
      'You are a patient Java tutor inside a beginner course called Crystal Run, where the learner builds a small text adventure game in Java.',
      'The learner has never written Java before. Explain in plain English, define every technical word you use, keep it under 200 words, and use a short Java snippet only if it helps.',
      'Do not use emoji. Do not search the web.',
      '',
      'Where they are in the course: ' + (ctx.where || 'unknown'),
      ctx.code ? 'The code currently in their editor:\n```java\n' + ctx.code.slice(0, 1500) + '\n```' : '',
      '',
      'Their question: ' + q
    ].filter(Boolean).join('\n');

    const entry = { q: q, html: '<div class="ans ai"><p class="dim small">Asking the AI tutor…</p></div>' };
    history.unshift(entry); renderHistory();

    ai.running = runViewerComputer(prompt.slice(0, ai.maxLen), {
      conversationId: ai.convo || undefined,
      onEvent: ev => {
        if (ev.kind === 'progress') entry.html = '<div class="ans ai"><p class="dim small">' + esc(ev.text || 'Working…') + '</p></div>';
        else if (ev.kind === 'completed') entry.html = '<div class="ans ai"><p class="tag">AI tutor</p>' + md(ev.text || '') + (ev.taskUrl ? '<p class="dim small"><a href="' + esc(ev.taskUrl) + '" target="_blank" rel="noopener">Open the full answer</a></p>' : '') + '</div>';
        else if (ev.kind === 'computer_stopped') entry.html = '<div class="ans ai"><p class="dim small">Stopped.</p></div>';
        else if (ev.kind === 'error') entry.html = '<div class="ans ai"><p class="dim small">The AI tutor could not answer that (' + esc(ev.code || 'error') + '). The stored answers and the Words tab still work.</p></div>';
        renderHistory();
      }
    });
  }

  /* tiny markdown: paragraphs, code, bold, lists */
  function md(t) {
    let s = esc(String(t).trim());
    s = s.replace(/```(?:java)?\n([\s\S]*?)```/g, (m, c) => '<pre class="tex">' + c.replace(/\n$/, '') + '</pre>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s.split(/\n{2,}/).map(p => /^<pre/.test(p) ? p : '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
  }

  /* ---------------- words tab ---------------- */
  function renderWords(filter, openTerm) {
    const body = $('tutorBody');
    const keys = Object.keys(G.terms);
    const f = String(filter || '').toLowerCase();
    const hits = keys.filter(k => !f || k.toLowerCase().indexOf(f) >= 0 || G.terms[k].short.toLowerCase().indexOf(f) >= 0 || (G.alias[f] === k));
    const groups = {};
    hits.forEach(k => { const g = G.terms[k].kind; (groups[g] = groups[g] || []).push(k); });
    const order = ['keyword', 'type', 'idea', 'method', 'symbol', 'class', 'field', 'value', 'syntax'];
    body.innerHTML =
      '<div class="askbox"><input id="wordSearch" type="search" placeholder="Search every word — void, semicolon, ArrayList…" value="' + esc(filter || '') + '" /></div>' +
      '<p class="dim small">' + hits.length + ' of ' + keys.length + ' entries. Tap a word for the full explanation.</p>' +
      '<div id="wordDetail">' + (openTerm ? termCard(openTerm) : '') + '</div>' +
      order.filter(g => groups[g]).map(g =>
        '<div class="wgroup"><p class="wglabel">' + esc(g === 'idea' ? 'ideas' : g + 's') + '</p><div class="wlist">' +
        groups[g].sort().map(k => '<button class="wpill' + (k === openTerm ? ' on' : '') + '" data-term="' + esc(k) + '"><code>' + esc(k) + '</code><span>' + esc(G.terms[k].short) + '</span></button>').join('') +
        '</div></div>').join('');
    const inp = $('wordSearch');
    inp.oninput = () => renderWords(inp.value, openTerm);
    wireLinks(body);
  }

  /* ---------------- explain tab ---------------- */
  function renderExplain() {
    const body = $('tutorBody');
    const ctx = getContext();
    const code = ctx.code || '';
    if (!code.trim()) {
      body.innerHTML = '<p class="dim small">Open an example or a build task, then come back here — this tab breaks the code in your editor into lines and explains each one in plain English.</p>';
      return;
    }
    const rows = EX.source(code);
    body.innerHTML = '<p class="dim small">Every line of the code in your editor, in plain English. Tap any highlighted word for its dictionary entry.</p>' +
      '<div class="xlist">' + rows.map(r => {
        if (!r.code.trim()) return '';
        return '<div class="xrow"><div class="xcode"><span class="xn">' + r.n + '</span><code>' + esc(r.code.replace(/\t/g, '    ')) + '</code></div>' +
          '<p class="xtext">' + (r.text || '<span class="dim">(nothing to explain on this line)</span>') + '</p>' +
          (r.terms.length ? '<div class="xterms">' + r.terms.map(t => '<button class="qlink" data-term="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' : '') +
          '</div>';
      }).join('') + '</div>' +
      '<div id="wordDetail"></div>';
    wireLinks(body);
  }

  /* ---------------- shared wiring ---------------- */
  function wireLinks(root) {
    root.querySelectorAll('[data-ask]').forEach(b => b.onclick = () => { open('ask'); ask(b.dataset.ask); });
    root.querySelectorAll('[data-term]').forEach(b => b.onclick = () => showTerm(b.dataset.term));
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  }

  function showTerm(term) {
    const key = G.findTerm(term) || term;
    if (!G.terms[key]) { open('ask'); ask(term); return; }
    open();
    if (tab === 'words') { renderWords($('wordSearch') ? $('wordSearch').value : '', key); const d = $('wordDetail'); if (d) d.scrollIntoView({ block: 'nearest' }); return; }
    const d = $('wordDetail');
    if (d) { d.innerHTML = termCard(key) + '<p class="rel">Related: ' + related(key) + '</p>'; wireLinks(d); d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    setTab('words', key);
  }

  function setTab(t, arg) {
    tab = t;
    document.querySelectorAll('#tutorTabs .ttab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'ask') renderAsk();
    else if (t === 'words') renderWords('', arg || null);
    else renderExplain();
  }

  function open(t) { document.body.classList.add('tutor-open'); if (t && t !== tab) setTab(t); else if (t === 'explain') renderExplain(); }
  function close() { document.body.classList.remove('tutor-open'); }
  function toggle() { document.body.classList.contains('tutor-open') ? close() : open(); }

  /* ---------------- make jargon clickable inside lesson text ---------------- */
  /* words that are also ordinary English — only linked when written as code */
  const PROSE_SKIP = ('for this new return break continue long double char add get set size remove contains index length ' +
    'type value out main loop loops list lists items print dot clamp not and or var block scope true false null do while if ' +
    'equals argument').split(' ');
  const ALPHA = Object.keys(G.terms).filter(k => /^[A-Za-z]/.test(k) && k.length > 2 && PROSE_SKIP.indexOf(k.toLowerCase()) < 0)
    .concat(Object.keys(G.alias).filter(a => a.length > 3 && PROSE_SKIP.indexOf(a) < 0))
    .sort((a, b) => b.length - a.length);
  const ALPHA_RE = new RegExp('\\b(' + ALPHA.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'g');

  function decorate(root) {
    if (!root) return;
    /* exact-match <code> chips first */
    root.querySelectorAll('code').forEach(c => {
      if (c.closest('pre') || c.closest('.term')) return;
      const key = G.findTerm(c.textContent.trim());
      if (!key) return;
      const b = document.createElement('button');
      b.className = 'term';
      b.dataset.term = key;
      b.innerHTML = '<code>' + esc(c.textContent) + '</code>';
      b.title = G.terms[key].short;
      c.replaceWith(b);
    });
    /* plain words in prose, first two hits per term */
    const used = {};
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest('pre, textarea, code, button, .xcode, .tex')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const text = n.nodeValue;
      ALPHA_RE.lastIndex = 0;
      if (!ALPHA_RE.test(text)) return;
      ALPHA_RE.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = ALPHA_RE.exec(text))) {
        const word = m[1], key = G.findTerm(word);
        if (!key) continue;
        used[key] = (used[key] || 0) + 1;
        if (used[key] > 2) continue;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const b = document.createElement('button');
        b.className = 'term word';
        b.dataset.term = key;
        b.textContent = word;
        b.title = G.terms[key].short;
        frag.appendChild(b);
        last = m.index + word.length;
      }
      if (!last) return;
      frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
    root.querySelectorAll('.term').forEach(b => b.onclick = () => showTerm(b.dataset.term));
  }

  /* ---------------- boot ---------------- */
  function init(opts) {
    getContext = (opts && opts.context) || getContext;
    $('tutorTabs').querySelectorAll('.ttab').forEach(b => b.onclick = () => setTab(b.dataset.t));
    $('tutorClose').onclick = close;
    $('helpBtn').onclick = toggle;
    $('tutorScrim').onclick = close;
    document.addEventListener('keydown', e => {
      if (e.key === '?' && !/INPUT|TEXTAREA/.test((e.target.tagName || ''))) { e.preventDefault(); open('ask'); }
      if (e.key === 'Escape' && document.body.classList.contains('tutor-open') && !/INPUT|TEXTAREA/.test((e.target.tagName || ''))) close();
    });
    setTab('ask');
    discoverViewerComputer(
      data => { ai.available = true; ai.checked = true; if (data.maxPromptLength) ai.maxLen = data.maxPromptLength; if (tab === 'ask') renderAsk(); },
      () => { ai.checked = true; ai.available = false; }
    );
  }

  global.TUTOR = {
    init, open, close, decorate, ask, showTerm,
    explainError(message, code) {
      open('ask');
      const a = G.answer(message);
      const guess = a ? answerHtml(message) : '<div class="ans"><p>Read the red message carefully — it names the line and usually the exact word Java could not understand. Check spelling and capitals, then that every ' + '<code>{</code> has a matching <code>}</code> and every statement ends in <code>;</code>.</p></div>';
      history.unshift({ q: 'Why did this break: ' + message, html: guess });
      renderHistory();
      if (ai.available) askAI('This error appeared when I ran my code: "' + message + '". Explain what it means and how to fix it.');
    },
    refresh() { if (tab === 'explain') renderExplain(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
