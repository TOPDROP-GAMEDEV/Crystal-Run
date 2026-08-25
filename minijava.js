/* MiniJava — a small Java-subset interpreter for the JavaQuest course.
   Supports: classes, fields, constructors, methods (incl. static), objects,
   int/double/boolean/String/char/var types, arithmetic, string concat,
   if/else, while, for, do-while, break/continue, return, ++/--, compound
   assignment, ArrayList<T>, Math.*, String methods, System.out.print(ln),
   Integer.parseInt, String.valueOf, and a simulated Scanner. */
(function (global) {
  'use strict';

  /* ---------------- Lexer ---------------- */
  const KEYWORDS = new Set(['class', 'interface', 'enum', 'abstract', 'public', 'private', 'protected', 'static', 'final', 'void', 'int', 'double', 'float', 'long', 'boolean', 'char', 'String', 'Object', 'new', 'return', 'if', 'else', 'while', 'for', 'do', 'break', 'continue', 'this', 'super', 'true', 'false', 'null', 'import', 'package', 'extends', 'implements', 'instanceof', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'var', 'ArrayList', 'List', 'HashMap', 'Map', 'StringBuilder', 'Random', 'Scanner']);

  function lex(src) {
    const toks = [];
    let i = 0, line = 1;
    const isD = c => c >= '0' && c <= '9';
    const isA = c => /[A-Za-z_$]/.test(c);
    while (i < src.length) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
      if (c === '"') {
        let s = ''; i++;
        while (i < src.length && src[i] !== '"') {
          if (src[i] === '\\') { const n = src[i + 1]; s += n === 'n' ? '\n' : n === 't' ? '\t' : n === '\\' ? '\\' : n === '"' ? '"' : n === "'" ? "'" : n; i += 2; }
          else s += src[i++];
        }
        if (src[i] !== '"') throw new JErr('Unclosed string literal', line);
        i++; toks.push({ t: 'str', v: s, line }); continue;
      }
      if (c === "'") {
        let s = ''; i++;
        if (src[i] === '\\') { const n = src[i + 1]; s = n === 'n' ? '\n' : n === 't' ? '\t' : n === '\\' ? '\\' : n; i += 2; } else s = src[i++];
        if (src[i] !== "'") throw new JErr('Unclosed character literal', line);
        i++; toks.push({ t: 'char', v: s, line }); continue;
      }
      if (isD(c)) {
        let n = ''; while (i < src.length && (isD(src[i]) || src[i] === '.')) n += src[i++];
        if (/[dDfFlL]/.test(src[i] || '')) i++;
        toks.push({ t: 'num', v: parseFloat(n), isInt: !n.includes('.'), line }); continue;
      }
      if (isA(c)) {
        let n = ''; while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) n += src[i++];
        toks.push({ t: KEYWORDS.has(n) ? n : 'id', v: n, line }); continue;
      }
      const three = src.substr(i, 3), two = src.substr(i, 2);
      const OPS3 = ['>>>'], OPS2 = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '->'];
      if (OPS3.includes(three)) { toks.push({ t: three, line }); i += 3; continue; }
      if (OPS2.includes(two)) { toks.push({ t: two, line }); i += 2; continue; }
      if ('+-*/%=<>!(){}[];,.?:&|'.includes(c)) { toks.push({ t: c, line }); i++; continue; }
      throw new JErr('Unexpected character "' + c + '"', line);
    }
    toks.push({ t: 'eof', line });
    return toks;
  }

  function JErr(msg, line) { this.message = msg; this.line = line; this.javaError = true; }
  JErr.prototype.toString = function () { return this.message; };

  /* ---------------- Parser ---------------- */
  const TYPE_TOKENS = new Set(['int', 'double', 'float', 'long', 'boolean', 'char', 'String', 'Object', 'void', 'var', 'ArrayList', 'List', 'HashMap', 'Map', 'StringBuilder', 'Random', 'Scanner']);

  function Parser(toks) { this.toks = toks; this.p = 0; }
  Parser.prototype = {
    peek(k) { return this.toks[this.p + (k || 0)]; },
    at(t) { return this.peek().t === t; },
    next() { return this.toks[this.p++]; },
    eat(t) {
      if (!this.at(t)) throw new JErr('Expected "' + t + '" but found "' + (this.peek().v || this.peek().t) + '"', this.peek().line);
      return this.next();
    },
    opt(t) { if (this.at(t)) { this.next(); return true; } return false; },

    parseProgram() {
      const classes = [];
      while (!this.at('eof')) {
        if (this.at('import') || this.at('package')) { while (!this.at(';') && !this.at('eof')) this.next(); this.opt(';'); continue; }
        const mods = this.modifiers();
        if (this.at('class')) classes.push(this.classDecl());
        else if (this.at('interface')) classes.push(this.interfaceDecl());
        else if (this.at('enum')) classes.push(this.enumDecl());
        else throw new JErr('Only classes are allowed at the top level. Found "' + (this.peek().v || this.peek().t) + '".', this.peek().line);
        classes[classes.length - 1].abstract = !!mods.abstract;
      }
      return classes;
    },
    modifiers() { const m = {}; while (['public', 'private', 'protected', 'static', 'final', 'abstract'].includes(this.peek().t)) { m[this.next().t] = true; } return m; },
    classDecl() {
      this.eat('class');
      const name = this.eat('id').v;
      let parent = null, interfaces = [];
      if (this.opt('extends')) parent = this.eat('id').v;
      if (this.opt('implements')) do { interfaces.push(this.eat('id').v); } while (this.opt(','));
      this.eat('{');
      const cls = { name, fields: [], methods: {}, ctors: [], parent, interfaces, kind: 'class', abstract: false };
      while (!this.at('}')) {
        if (this.at('eof')) throw new JErr('Missing closing } for class ' + name, this.peek().line);
        if (this.opt(';')) continue;
        const m = this.modifiers();
        if (this.at('class')) { this.classDecl(); continue; }
        // constructor?
        if (this.at('id') && this.peek().v === name && this.peek(1).t === '(') {
          this.next();
          const params = this.params(); const body = this.block();
          cls.ctors.push({ params, body }); continue;
        }
        const type = this.typeRef();
        const mname = this.at('id') ? this.eat('id').v : this.eat(this.peek().t).v;
        if (this.at('(')) {
          const params = this.params();
          const body = this.at(';') ? (this.next(), null) : this.block();
          cls.methods[mname] = { name: mname, params, body, static: !!m.static, retType: type, abstract: !!m.abstract || body === null };
        } else {
          let init = null;
          if (this.opt('=')) init = this.expr();
          this.opt(';');
          cls.fields.push({ name: mname, type, init, static: !!m.static });
          while (this.at(',')) { this.next(); const n2 = this.eat('id').v; let i2 = null; if (this.opt('=')) i2 = this.expr(); cls.fields.push({ name: n2, type, init: i2, static: !!m.static }); this.opt(';'); }
        }
      }
      this.eat('}');
      return cls;
    },
    interfaceDecl() {
      this.eat('interface');
      const name = this.eat('id').v, parents = [];
      if (this.opt('extends')) do { parents.push(this.eat('id').v); } while (this.opt(','));
      this.eat('{');
      const cls = { name, fields: [], methods: {}, ctors: [], parent: null, interfaces: parents, kind: 'interface', abstract: true };
      while (!this.at('}')) {
        if (this.at('eof')) throw new JErr('Missing closing } for interface ' + name, this.peek().line);
        if (this.opt(';')) continue;
        const m = this.modifiers(), type = this.typeRef(), mname = this.at('id') ? this.next().v : this.next().t, params = this.params();
        if (!this.opt(';')) throw new JErr('Interface methods need to end with a semicolon.', this.peek().line);
        cls.methods[mname] = { name: mname, params, body: null, static: !!m.static, retType: type, abstract: true };
      }
      this.eat('}');
      return cls;
    },
    enumDecl() {
      this.eat('enum');
      const name = this.eat('id').v, values = [];
      this.eat('{');
      while (!this.at('}') && !this.at(';')) { values.push(this.eat('id').v); if (!this.opt(',')) break; }
      if (this.at(';')) while (!this.at('}') && !this.at('eof')) this.next();
      this.eat('}');
      return { name, fields: [], methods: {}, ctors: [], parent: null, interfaces: [], kind: 'enum', values, abstract: false };
    },
    typeRef() {
      let name;
      if (TYPE_TOKENS.has(this.peek().t)) name = this.next().v || this.toks[this.p - 1].t;
      else if (this.at('id')) name = this.next().v;
      else throw new JErr('Expected a type but found "' + (this.peek().v || this.peek().t) + '"', this.peek().line);
      let generic = null;
      if (this.at('<')) { let depth = 0; const parts = []; do { const t = this.next(); if (t.t === '<') depth++; else if (t.t === '>') depth--; else parts.push(t.v || t.t); } while (depth > 0 && !this.at('eof')); generic = parts.join(''); }
      let arr = 0;
      while (this.at('[') && this.peek(1).t === ']') { this.next(); this.next(); arr++; }
      return { name, generic, arr };
    },
    params() {
      this.eat('('); const out = [];
      while (!this.at(')')) {
        this.modifiers();
        const type = this.typeRef();
        const name = this.eat('id').v;
        out.push({ name, type });
        if (!this.at(')')) this.eat(',');
      }
      this.eat(')');
      return out;
    },
    block() {
      this.eat('{'); const body = [];
      while (!this.at('}')) { if (this.at('eof')) throw new JErr('Missing closing }', this.peek().line); body.push(this.statement()); }
      this.eat('}');
      return { type: 'Block', body };
    },
    isDeclStart() {
      const t = this.peek();
      if (TYPE_TOKENS.has(t.t)) return true;
      if (t.t === 'id') {
        // Name name  |  Name<...> name  |  Name[] name
        const n1 = this.peek(1);
        if (n1.t === 'id') return true;
        if (n1.t === '[' && this.peek(2).t === ']') return true;
        if (n1.t === '<') { let k = 1, depth = 0; while (this.peek(k) && this.peek(k).t !== 'eof') { const tt = this.peek(k).t; if (tt === '<') depth++; else if (tt === '>') { depth--; if (depth === 0) return this.peek(k + 1) && this.peek(k + 1).t === 'id'; } else if (tt === ';' || tt === '{') return false; k++; } }
      }
      return false;
    },
    statement() {
      const line = this.peek().line;
      if (this.at('{')) return this.block();
      if (this.opt(';')) return { type: 'Empty' };
      if (this.at('if')) { this.next(); this.eat('('); const c = this.expr(); this.eat(')'); const t = this.statement(); let e = null; if (this.at('else')) { this.next(); e = this.statement(); } return { type: 'If', c, t, e, line }; }
      if (this.at('while')) { this.next(); this.eat('('); const c = this.expr(); this.eat(')'); const b = this.statement(); return { type: 'While', c, b, line }; }
      if (this.at('do')) { this.next(); const b = this.statement(); this.eat('while'); this.eat('('); const c = this.expr(); this.eat(')'); this.opt(';'); return { type: 'DoWhile', c, b, line }; }
      if (this.at('for')) {
        this.next(); this.eat('(');
        // for-each: Type name : expr
        const save = this.p;
        if (this.isDeclStart()) {
          this.typeRef(); const nm = this.at('id') ? this.next().v : null;
          if (nm && this.at(':')) { this.next(); const it = this.expr(); this.eat(')'); const b = this.statement(); return { type: 'ForEach', name: nm, iter: it, b, line }; }
          this.p = save;
        }
        let init = null;
        if (!this.at(';')) init = this.isDeclStart() ? this.localDecl(false) : { type: 'ExprStmt', e: this.expr() };
        this.eat(';');
        const c = this.at(';') ? null : this.expr(); this.eat(';');
        const upd = this.at(')') ? null : this.expr(); this.eat(')');
        const b = this.statement();
        return { type: 'For', init, c, upd, b, line };
      }
      if (this.at('return')) { this.next(); const v = this.at(';') ? null : this.expr(); this.opt(';'); return { type: 'Return', v, line }; }
      if (this.at('break')) { this.next(); this.opt(';'); return { type: 'Break', line }; }
      if (this.at('continue')) { this.next(); this.opt(';'); return { type: 'Continue', line }; }
      if (this.at('switch')) return this.switchStmt();
      if (this.at('throw')) { this.next(); const e = this.expr(); this.opt(';'); return { type: 'Throw', e, line }; }
      if (this.at('try')) return this.tryStmt();
      this.modifiers();
      if (this.isDeclStart()) return this.localDecl(true);
      const e = this.expr(); this.opt(';');
      return { type: 'ExprStmt', e, line };
    },
    switchStmt() {
      const line = this.next().line; this.eat('('); const e = this.expr(); this.eat(')'); this.eat('{');
      const cases = [], body = [];
      while (!this.at('}')) {
        if (this.at('eof')) throw new JErr('Missing closing } for switch.', this.peek().line);
        if (this.at('case') || this.at('default')) {
          const isDefault = this.next().t === 'default';
          let value = null;
          if (!isDefault) value = this.expr();
          if (this.at('->')) throw new JErr('Arrow-style switch cases are not supported yet; use "case value:" instead.', this.peek().line);
          this.eat(':');
          cases.push({ value, start: body.length });
        } else body.push(this.statement());
      }
      this.eat('}');
      return { type: 'Switch', e, cases, body, line };
    },
    tryStmt() {
      const line = this.next().line, body = this.block(), catches = [];
      while (this.at('catch')) {
        this.next(); this.eat('('); const etype = this.typeRef(), name = this.eat('id').v; this.eat(')');
        catches.push({ etype, name, body: this.block() });
      }
      let fin = null; if (this.at('finally')) { this.next(); fin = this.block(); }
      if (!catches.length && !fin) throw new JErr('A try statement needs catch or finally.', line);
      return { type: 'Try', body, catches, fin, line };
    },
    localDecl(semi) {
      const line = this.peek().line;
      const type = this.typeRef();
      const decls = [];
      do {
        const name = this.eat('id').v;
        let init = null;
        if (this.opt('=')) init = this.expr();
        decls.push({ name, init });
      } while (this.opt(','));
      if (semi) this.opt(';');
      return { type: 'VarDecl', vtype: type, decls, line };
    },

    /* expressions */
    expr() { return this.assign(); },
    assign() {
      const left = this.ternary();
      const t = this.peek().t;
      if (['=', '+=', '-=', '*=', '/=', '%='].includes(t)) {
        this.next(); const right = this.assign();
        return { type: 'Assign', op: t, target: left, value: right, line: left.line };
      }
      return left;
    },
    ternary() { const c = this.or(); if (this.opt('?')) { const a = this.assign(); this.eat(':'); const b = this.assign(); return { type: 'Ternary', c, a, b }; } return c; },
    or() { let l = this.and(); while (this.at('||')) { this.next(); l = { type: 'Logic', op: '||', l, r: this.and() }; } return l; },
    and() { let l = this.eq(); while (this.at('&&')) { this.next(); l = { type: 'Logic', op: '&&', l, r: this.eq() }; } return l; },
    eq() { let l = this.rel(); while (this.at('==') || this.at('!=')) { const op = this.next().t; l = { type: 'Bin', op, l, r: this.rel() }; } return l; },
    rel() { let l = this.add(); while (['<', '>', '<=', '>=', 'instanceof'].includes(this.peek().t)) { const op = this.next().t; if (op === 'instanceof') l = { type: 'InstanceOf', l, rtype: this.typeRef() }; else l = { type: 'Bin', op, l, r: this.add() }; } return l; },
    add() { let l = this.mul(); while (this.at('+') || this.at('-')) { const op = this.next().t; l = { type: 'Bin', op, l, r: this.mul() }; } return l; },
    mul() { let l = this.unary(); while (this.at('*') || this.at('/') || this.at('%')) { const op = this.next().t; l = { type: 'Bin', op, l, r: this.unary() }; } return l; },
    unary() {
      if (this.at('!')) { this.next(); return { type: 'Not', e: this.unary() }; }
      if (this.at('-')) { this.next(); return { type: 'Neg', e: this.unary() }; }
      if (this.at('+')) { this.next(); return this.unary(); }
      if (this.at('++') || this.at('--')) { const op = this.next().t; const e = this.unary(); return { type: 'PreIncr', op, e }; }
      if (this.at('(') && TYPE_TOKENS.has(this.peek(1).t) && this.peek(2).t === ')') { this.next(); const ct = this.next().t; this.next(); return { type: 'Cast', ct, e: this.unary() }; }
      return this.postfix();
    },
    postfix() {
      let e = this.primary();
      for (;;) {
        if (this.at('.')) {
          this.next();
          const name = this.at('id') ? this.next().v : this.next().t;
          if (this.at('(')) e = { type: 'Call', target: e, name, args: this.args(), line: this.peek().line };
          else e = { type: 'Field', target: e, name };
        } else if (this.at('(') && e.type === 'Super') {
          e = { type: 'SuperCtor', args: this.args(), line: e.line };
        } else if (this.at('(') && e.type === 'Name') {
          e = { type: 'BareCall', name: e.name, args: this.args(), line: e.line };
        } else if (this.at('[')) { this.next(); const idx = this.expr(); this.eat(']'); e = { type: 'Index', target: e, idx }; }
        else if (this.at('++') || this.at('--')) { const op = this.next().t; e = { type: 'PostIncr', op, e }; }
        else break;
      }
      return e;
    },
    args() { this.eat('('); const out = []; while (!this.at(')')) { out.push(this.expr()); if (!this.at(')')) this.eat(','); } this.eat(')'); return out; },
    primary() {
      const t = this.peek();
      if (t.t === 'num') { this.next(); return { type: 'Lit', v: t.v, isInt: t.isInt, line: t.line }; }
      if (t.t === 'str') { this.next(); return { type: 'Lit', v: t.v, str: true, line: t.line }; }
      if (t.t === 'char') { this.next(); return { type: 'Lit', v: t.v, str: true, line: t.line }; }
      if (t.t === 'true') { this.next(); return { type: 'Lit', v: true, line: t.line }; }
      if (t.t === 'false') { this.next(); return { type: 'Lit', v: false, line: t.line }; }
      if (t.t === 'null') { this.next(); return { type: 'Lit', v: null, line: t.line }; }
      if (t.t === 'this') { this.next(); return { type: 'This', line: t.line }; }
      if (t.t === 'super') { this.next(); return { type: 'Super', line: t.line }; }
      if (t.t === 'new') {
        this.next();
        const type = this.typeRef();
        if (this.at('{')) { // array initialiser
          this.next(); const items = []; while (!this.at('}')) { items.push(this.expr()); if (!this.at('}')) this.eat(','); } this.eat('}');
          return { type: 'NewArray', items, line: t.line };
        }
        if (this.at('[')) {
          const sizes = [];
          while (this.at('[')) { this.next(); sizes.push(this.at(']') ? null : this.expr()); this.eat(']'); }
          if (this.at('{')) return { type: 'NewArray', items: this.arrayItems(), line: t.line, atype: type };
          return { type: 'NewArray', sizes, line: t.line, atype: type };
        }
        const args = this.at('(') ? this.args() : [];
        return { type: 'New', cname: type.name, generic: type.generic, args, line: t.line };
      }
      if (t.t === '(') { this.next(); const e = this.expr(); this.eat(')'); return e; }
      if (t.t === '{') return { type: 'NewArray', items: this.arrayItems(), line: t.line };
      if (t.t === 'id' || TYPE_TOKENS.has(t.t)) { this.next(); return { type: 'Name', name: t.v || t.t, line: t.line }; }
      throw new JErr('Unexpected "' + (t.v || t.t) + '"', t.line);
    },
    arrayItems() {
      this.eat('{'); const items = [];
      while (!this.at('}')) { items.push(this.at('{') ? { type: 'NewArray', items: this.arrayItems() } : this.expr()); if (!this.at('}')) this.eat(','); }
      this.eat('}'); return items;
    }
  };

  /* ---------------- Runtime values ---------------- */
  const BREAK = { sig: 'break' }, CONTINUE = { sig: 'continue' };
  function Ret(v) { this.sig = 'return'; this.v = v; }
  function Thrown(v) { this.sig = 'throw'; this.v = v; }
  function JObject(cls) { this.cls = cls; this.f = Object.create(null); }
  function JList(items) { this.list = items || []; }
  function JMap() { this.entries = []; }
  function JBuilder(s) { this.s = s || ''; }
  function JRandom(seed) { this.seed = (seed === undefined ? 123456789 : (num(seed) >>> 0)) || 1; }
  JRandom.prototype.next = function () { this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0; return this.seed / 4294967296; };
  function JEnum(cls, name, ordinal) { this.cls = cls; this.name0 = name; this.ordinal0 = ordinal; }
  function JException(name, message) { this.__exception = true; this.name0 = name; this.message = message || ''; }
  function JDouble(v) { this.v = v; }
  function D(v) { return new JDouble(v); }
  function isNumV(v) { return typeof v === 'number' || v instanceof JDouble; }
  function JArray(items) { this.arr = items || []; }

  function isInt(v) { return typeof v === 'number' && Number.isInteger(v); }

  function jstr(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    if (v instanceof JDouble) return Number.isInteger(v.v) ? v.v + '.0' : String(v.v);
    if (v instanceof JList) return '[' + v.list.map(jstr).join(', ') + ']';
    if (v instanceof JMap) return '{' + v.entries.map(e => jstr(e[0]) + '=' + jstr(e[1])).join(', ') + '}';
    if (v instanceof JArray) return '[' + v.arr.map(jstr).join(', ') + ']';
    if (v instanceof JBuilder) return v.s;
    if (v instanceof JEnum) return v.name0;
    if (v instanceof JException) return v.name0 + (v.message ? ': ' + v.message : '');
    if (v && v.__plainObject) return 'Object@1b6d';
    if (v instanceof JObject) {
      const ts = findMethod(v.cls, 'toString');
      if (ts) return jstr(v.__interp.invoke(v, ts, []));
      return v.cls.name + '@1b6d';
    }
    return String(v);
  }

  /* ---------------- Interpreter ---------------- */
  function Interp(opts) {
    opts = opts || {};
    this.out = [];
    this.limit = opts.maxSteps || 400000;
    this.steps = 0;
    this.maxOut = opts.maxOutput || 1200;
    this.inputs = (opts.inputs || []).slice();
    this.classes = Object.create(null);
    this.statics = Object.create(null);
  }
  Interp.prototype = {
    print(s, nl) {
      if (this.out.length >= this.maxOut) throw new JErr('Too much output — you may have an endless loop.', 0);
      this.out.push(nl ? s + '\n' : s);
    },
    tick() { if (++this.steps > this.limit) throw new JErr('Your program ran too long — check for a loop that never ends.', 0); },

    run(src, entry) {
      const classes = new Parser(lex(src)).parseProgram();
      classes.forEach(c => {
        this.classes[c.name] = c; c.__interpClasses = this.classes; this.statics[c.name] = Object.create(null);
        Object.keys(c.methods).forEach(k => { c.methods[k].owner = c; });
        if (c.kind === 'enum') c.values.forEach((v, i) => { this.statics[c.name][v] = new JEnum(c, v, i); });
      });
      classes.forEach(c => c.fields.filter(f => f.static).forEach(f => { this.statics[c.name][f.name] = f.init ? this.eval(f.init, { vars: Object.create(null), cls: c }) : defaultOf(f.type); }));
      let main = null, cls = null;
      if (entry && this.classes[entry] && this.classes[entry].methods.main) { cls = this.classes[entry]; main = cls.methods.main; }
      if (!main) for (const c of classes) if (c.methods.main) { cls = c; main = c.methods.main; break; }
      if (!main) throw new JErr('No main method found. Add: public static void main(String[] args)', 0);
      const mainResult = this.exec(main.body, { vars: mkVars(main.params, [new JArray([])]), cls, self: null });
      if (mainResult && mainResult.sig === 'throw') throw this.unhandled(mainResult.v);
      return this.out.join('');
    },

    exec(node, env) {
      this.tick();
      switch (node.type) {
        case 'Block': {
          const e = { vars: Object.create(env.vars), cls: env.cls, self: env.self };
          for (const s of node.body) { const r = this.exec(s, e); if (r) return r; }
          return null;
        }
        case 'Empty': return null;
        case 'VarDecl':
          for (const d of node.decls) env.vars[d.name] = d.init ? coerce(this.eval(d.init, env), node.vtype) : defaultOf(node.vtype);
          return null;
        case 'ExprStmt': { const r = this.eval(node.e, env); return r && r.sig === 'throw' ? r : null; }
        case 'If': return truthy(this.eval(node.c, env)) ? this.exec(node.t, env) : (node.e ? this.exec(node.e, env) : null);
        case 'While':
          while (truthy(this.eval(node.c, env))) { this.tick(); const r = this.exec(node.b, env); if (r === BREAK) break; if (r && r !== CONTINUE) return r; }
          return null;
        case 'DoWhile':
          do { this.tick(); const r = this.exec(node.b, env); if (r === BREAK) break; if (r && r !== CONTINUE) return r; } while (truthy(this.eval(node.c, env)));
          return null;
        case 'For': {
          const e = { vars: Object.create(env.vars), cls: env.cls, self: env.self };
          if (node.init) this.exec(node.init, e);
          while (node.c === null || truthy(this.eval(node.c, e))) {
            this.tick();
            const r = this.exec(node.b, e);
            if (r === BREAK) break;
            if (r && r !== CONTINUE) return r;
            if (node.upd) this.eval(node.upd, e);
          }
          return null;
        }
        case 'ForEach': {
          const it = this.eval(node.iter, env);
          const items = it instanceof JList ? it.list : it instanceof JMap ? it.entries.map(x => x[0]) : it instanceof JArray ? it.arr : typeof it === 'string' ? it.split('') : null;
          if (!items) throw new JErr('You can only loop over a list or array.', node.line);
          for (const v of items.slice()) {
            this.tick();
            const e = { vars: Object.create(env.vars), cls: env.cls, self: env.self };
            e.vars[node.name] = v;
            const r = this.exec(node.b, e);
            if (r === BREAK) break;
            if (r && r !== CONTINUE) return r;
          }
          return null;
        }
        case 'Return': return new Ret(node.v ? this.eval(node.v, env) : undefined);
        case 'Break': return BREAK;
        case 'Continue': return CONTINUE;
        case 'Throw': return new Thrown(this.eval(node.e, env));
        case 'Switch': {
          const sv = this.eval(node.e, env); let chosen = -1, def = -1;
          for (let i = 0; i < node.cases.length; i++) {
            const c = node.cases[i]; if (c.value === null) { def = c.start; continue; }
            if (eqv(sv, this.switchValue(c.value, sv, env))) { chosen = c.start; break; }
          }
          if (chosen < 0) chosen = def;
          if (chosen < 0) return null;
          for (let i = chosen; i < node.body.length; i++) { const r = this.exec(node.body[i], env); if (r === BREAK) return null; if (r) return r; }
          return null;
        }
        case 'Try': {
          let r = this.exec(node.body, env);
          if (r && r.sig === 'throw') {
            let caught = false;
            for (const c of node.catches) if (this.catches(c.etype.name, r.v)) {
              const e = { vars: Object.create(env.vars), cls: env.cls, self: env.self }; e.vars[c.name] = r.v;
              r = this.exec(c.body, e); caught = true; break;
            }
            if (!caught) r = r;
          }
          if (node.fin) { const fr = this.exec(node.fin, env); if (fr) r = fr; }
          return r;
        }
        default: throw new JErr('Unsupported statement: ' + node.type, node.line);
      }
    },

    eval(n, env) {
      this.tick();
      switch (n.type) {
        case 'Lit': return (!n.str && typeof n.v === 'number' && n.isInt === false) ? D(n.v) : n.v;
        case 'This': if (!env.self) throw new JErr('"this" can only be used inside an object method.', n.line); return env.self;
        case 'Super': {
          if (!env.self || !env.cls || !env.cls.parent) throw new JErr('"super" can only be used inside a subclass.', n.line);
          return { __super: true, self: env.self, cls: this.classes[env.cls.parent] };
        }
        case 'Name': {
          if (n.name in env.vars) return env.vars[n.name];
          if (env.self && n.name in env.self.f) return env.self.f[n.name];
          if (env.cls && this.statics[env.cls.name] && n.name in this.statics[env.cls.name]) return this.statics[env.cls.name][n.name];
          if (n.name === 'System' || n.name === 'Math' || n.name === 'Integer' || n.name === 'Double' || n.name === 'String' || this.classes[n.name]) return { __static: n.name };
          throw new JErr('Cannot find the variable "' + n.name + '". Did you declare it (and spell it the same way)?', n.line);
        }
        case 'Field': {
          if (n.target.type === 'Name' && n.target.name === 'System' && n.name === 'out') return { __static: 'System.out' };
          const t = this.eval(n.target, env);
          if (t && t.__static) {
            const sc = this.statics[t.__static];
            if (sc && n.name in sc) return sc[n.name];
            if (t.__static === 'Math' && n.name === 'PI') return Math.PI;
            if (t.__static === 'Integer' && n.name === 'MAX_VALUE') return 2147483647;
            throw new JErr('No static field "' + n.name + '" on ' + t.__static, n.line);
          }
          if (t && t.__super) return { __superMethod: true, self: t.self, cls: t.cls, name: n.name };
          if (t instanceof JObject) { if (n.name in t.f) return t.f[n.name]; throw new JErr('The ' + t.cls.name + ' object has no field called "' + n.name + '".', n.line); }
          if (typeof t === 'string' && n.name === 'length') return t.length;
          if (t instanceof JArray && n.name === 'length') return t.arr.length;
          if (t === null) throw new JErr('Tried to use a field on a null value.', n.line);
          throw new JErr('Cannot read "' + n.name + '" from that value.', n.line);
        }
        case 'Index': {
          const t = this.eval(n.target, env), i = this.eval(n.idx, env);
          const arr = t instanceof JArray ? t.arr : t instanceof JList ? t.list : null;
          if (!arr) throw new JErr('That value is not an array.', n.line);
          if (num(i) < 0 || num(i) >= arr.length) throw new JErr('Index ' + jstr(i) + ' is out of bounds (size ' + arr.length + ').', n.line);
          return arr[num(i)];
        }
        case 'Not': return !truthy(this.eval(n.e, env));
        case 'InstanceOf': return this.isInstance(this.eval(n.l, env), n.rtype.name);
        case 'Neg': { const v = this.eval(n.e, env); return v instanceof JDouble ? D(-v.v) : -num(v); }
        case 'Cast': { const v = this.eval(n.e, env); if (n.ct === 'int' || n.ct === 'long') return Math.trunc(num(v)); if (n.ct === 'double' || n.ct === 'float') return D(num(v)); return v; }
        case 'Ternary': return truthy(this.eval(n.c, env)) ? this.eval(n.a, env) : this.eval(n.b, env);
        case 'Logic': {
          const l = truthy(this.eval(n.l, env));
          if (n.op === '&&') return l ? truthy(this.eval(n.r, env)) : false;
          return l ? true : truthy(this.eval(n.r, env));
        }
        case 'Bin': {
          const a = this.eval(n.l, env), b = this.eval(n.r, env);
          return binop(n.op, a, b, n.line);
        }
        case 'Assign': {
          let v;
          if (n.op === '=') v = this.eval(n.value, env);
          else v = binop(n.op[0], this.eval(n.target, env), this.eval(n.value, env), n.line);
          this.store(n.target, v, env);
          return v;
        }
        case 'PreIncr': { const v = binop(n.op === '++' ? '+' : '-', this.eval(n.e, env), 1, n.line); this.store(n.e, v, env); return v; }
        case 'PostIncr': { const old = this.eval(n.e, env); this.store(n.e, binop(n.op === '++' ? '+' : '-', old, 1, n.line), env); return old; }
        case 'NewArray': {
          if (n.items) return new JArray(n.items.map(x => this.eval(x, env)));
          const sizes = n.sizes || [n.size];
          return this.makeArray(sizes, env, n.atype);
        }
        case 'New': {
          const cn = n.cname;
          if (cn === 'ArrayList' || cn === 'List') return new JList([]);
          if (cn === 'HashMap' || cn === 'Map') return new JMap();
          if (cn === 'StringBuilder') return new JBuilder(n.args.length ? jstr(this.eval(n.args[0], env)) : '');
          if (cn === 'Random') return new JRandom(n.args.length ? this.eval(n.args[0], env) : undefined);
          if (cn === 'Scanner') return { __scanner: true };
          if (cn === 'Object') return { __plainObject: true };
          if (cn === 'IllegalArgumentException' || cn === 'RuntimeException' || cn === 'Exception') return new JException(cn, n.args.length ? jstr(this.eval(n.args[0], env)) : '');
          const cls = this.classes[cn];
          if (!cls) throw new JErr('There is no class called "' + cn + '". Check the spelling, or write the class first.', n.line);
          return this.instantiate(cls, n.args.map(a => this.eval(a, env)), n.line);
        }
        case 'Call': return this.call(n, env);
        case 'BareCall': {
          const args = n.args.map(a => this.eval(a, env));
          const cls = env.cls;
          const m = cls && cls.methods[n.name];
          if (m) { m.__cls = cls; return this.invoke(m.static ? null : env.self, m, args, n.line); }
          if (env.self && env.self.cls.methods[n.name]) return this.invoke(env.self, env.self.cls.methods[n.name], args, n.line);
          throw new JErr('There is no method called "' + n.name + '" in this class. Check the spelling, or write the method first.', n.line);
        }
        case 'SuperCtor': {
          if (!env.self || !env.cls || !env.cls.parent) throw new JErr('"super(...)" can only be used in a subclass constructor.', n.line);
          this.invokeCtor(this.classes[env.cls.parent], env.self, n.args.map(a => this.eval(a, env)), n.line);
          return undefined;
        }
        default: throw new JErr('Unsupported expression: ' + n.type, n.line);
      }
    },

    store(target, v, env) {
      if (target.type === 'Name') {
        let e = env.vars;
        while (e) { if (Object.prototype.hasOwnProperty.call(e, target.name)) { e[target.name] = v; return; } e = Object.getPrototypeOf(e); }
        if (env.self && target.name in env.self.f) { env.self.f[target.name] = v; return; }
        if (env.cls && this.statics[env.cls.name] && target.name in this.statics[env.cls.name]) { this.statics[env.cls.name][target.name] = v; return; }
        throw new JErr('Cannot assign to "' + target.name + '" because it has not been declared.', target.line);
      }
      if (target.type === 'Field') {
        const t = this.eval(target.target, env);
        if (t instanceof JObject) { t.f[target.name] = v; return; }
        if (t && t.__static) { this.statics[t.__static][target.name] = v; return; }
        throw new JErr('Cannot assign to that field.', target.line);
      }
      if (target.type === 'Index') {
        const t = this.eval(target.target, env), i = num(this.eval(target.idx, env));
        const arr = t instanceof JArray ? t.arr : t instanceof JList ? t.list : null;
        if (!arr) throw new JErr('That value is not an array.', target.line);
        arr[i] = v; return;
      }
      throw new JErr('That is not something you can assign to.', target.line);
    },

    instantiate(cls, args, line) {
      if (cls.kind === 'interface' || cls.kind === 'enum' || cls.abstract || this.hasAbstractMethod(cls)) throw new JErr('Cannot create an object from abstract class ' + cls.name + '. Create a class that implements all its methods first.', line);
      const o = new JObject(cls);
      o.__interp = this;
      this.initFields(cls, o);
      const ctor = this.getCtor(cls, args.length, line);
      const explicit = ctor && ctor.body.body[0] && ctor.body.body[0].type === 'ExprStmt' && ctor.body.body[0].e.type === 'SuperCtor';
      if (cls.parent && !explicit) this.invokeCtor(this.classes[cls.parent], o, [], line);
      if (ctor) {
        if (ctor.params.length !== args.length) throw new JErr('The ' + cls.name + ' constructor needs ' + ctor.params.length + ' argument(s) but got ' + args.length + '.', line);
        this.exec(ctor.body, { vars: mkVars(ctor.params, args), cls, self: o });
      }
      return o;
    },
    initFields(cls, o) {
      if (cls.parent) this.initFields(this.classes[cls.parent], o);
      cls.fields.filter(f => !f.static).forEach(f => { o.f[f.name] = f.init ? this.eval(f.init, { vars: Object.create(null), cls, self: o }) : defaultOf(f.type); });
    },
    getCtor(cls, count, line) {
      const ctor = cls.ctors.find(c => c.params.length === count) || (cls.ctors.length && count === 0 ? null : cls.ctors[0]);
      if (cls.ctors.length && !ctor) throw new JErr('No constructor of ' + cls.name + ' takes ' + count + ' argument(s).', line);
      return ctor;
    },
    invokeCtor(cls, o, args, line) {
      if (!cls) return;
      const ctor = this.getCtor(cls, args.length, line);
      if (ctor) {
        if (ctor.params.length !== args.length) throw new JErr('The ' + cls.name + ' constructor needs ' + ctor.params.length + ' argument(s) but got ' + args.length + '.', line);
        this.exec(ctor.body, { vars: mkVars(ctor.params, args), cls, self: o });
      }
    },

    invoke(self, m, args, line) {
      if (m.params.length !== args.length) throw new JErr('Method ' + m.name + ' expects ' + m.params.length + ' argument(s) but got ' + args.length + '.', line);
      if (!m || m.abstract || !m.body) throw new JErr('This class still needs to implement method "' + (m && m.name ? m.name : '?') + '".', line);
      const r = this.exec(m.body, { vars: mkVars(m.params, args), cls: m.owner || (self ? self.cls : m.__cls), self });
      return r && r.sig === 'return' ? r.v : (r && r.sig === 'throw' ? r : undefined);
    },

    call(n, env) {
      const line = n.line;
      const args = n.args.map(a => this.eval(a, env));
      const tgt = n.target;

      // System.out.println / print
      if (tgt.type === 'Field' && tgt.name === 'out' && tgt.target.type === 'Name' && tgt.target.name === 'System') {
        if (n.name === 'println') { this.print(args.length ? jstr(args[0]) : '', true); return undefined; }
        if (n.name === 'print') { this.print(args.length ? jstr(args[0]) : '', false); return undefined; }
        if (n.name === 'printf') { this.print(fmt(args[0], args.slice(1)), false); return undefined; }
        throw new JErr('System.out has no method "' + n.name + '".', line);
      }
      if (tgt.type === 'Super' || (tgt.type === 'Field' && tgt.target.type === 'Super')) {
        if (!env.cls || !env.cls.parent) throw new JErr('"super" can only be used inside a subclass.', line);
        const parent = this.classes[env.cls.parent], pm = findMethod(parent, n.name);
        if (!pm) throw new JErr('The parent class has no method called "' + n.name + '".', line);
        return this.invoke(env.self, pm, args, line);
      }
      // bare call: this.method() or static in same class
      if (tgt.type === 'Name' && !(tgt.name in env.vars) && !(env.self && tgt.name in env.self.f)) {
        const sname = tgt.name;
        if (sname === 'Math') return mathCall(n.name, args, line);
        if (sname === 'Integer') { if (n.name === 'parseInt' || n.name === 'valueOf') { const v = typeof args[0] === 'number' ? args[0] : parseInt(String(args[0]), 10); if (isNaN(v)) throw new JErr('Cannot turn "' + args[0] + '" into a number.', line); return v; } if (n.name === 'toString') return jstr(args[0]); }
        if (sname === 'Double' && n.name === 'parseDouble') return parseFloat(String(args[0]));
        if (sname === 'String' && n.name === 'valueOf') return jstr(args[0]);
        if (sname === 'String' && n.name === 'join') {
          const a = args[1] instanceof JArray ? args[1].arr : args[1] instanceof JList ? args[1].list : args.slice(1);
          return a.map(jstr).join(jstr(args[0]));
        }
        const cls = this.classes[sname];
        if (cls) {
          const m = cls.methods[n.name];
          if (!m) throw new JErr('Class ' + sname + ' has no method "' + n.name + '".', line);
          m.__cls = cls;
          return this.invoke(null, m, args, line);
        }
      }
      // method on a value
      const recv = tgt.type === 'Name' && !this.isValueName(tgt, env) ? null : this.eval(tgt, env);
      if (recv === null || recv === undefined) {
        // implicit this / same-class call: foo(...)
        const cls = env.cls;
        const m = cls && findMethod(cls, n.name);
        if (m) { m.__cls = cls; return this.invoke(m.static ? null : env.self, m, args, line); }
        throw new JErr('Cannot find a method called "' + n.name + '".', line);
      }
      return this.member(recv, n.name, args, line);
    },
    isValueName(tgt, env) {
      return (tgt.name in env.vars) || (env.self && tgt.name in env.self.f) || (env.cls && this.statics[env.cls.name] && tgt.name in this.statics[env.cls.name]);
    },
    makeArray(sizes, env, type) {
      const size = num(this.eval(sizes[0], env));
      const a = new Array(size);
      if (sizes.length > 1) for (let i = 0; i < size; i++) a[i] = this.makeArray(sizes.slice(1), env, type);
      else for (let i = 0; i < size; i++) a[i] = defaultOf(type);
      return new JArray(a);
    },
    isInstance(v, name) {
      if (v === null || v === undefined) return false;
      if (v instanceof JException) return name === 'Exception' || name === 'RuntimeException' || name === v.name0;
      if (v instanceof JEnum) return v.cls.name === name || name === 'Object';
      if (!(v instanceof JObject)) return name === 'Object';
      let c = v.cls;
      while (c) { if (c.name === name || this.hasInterface(c, name)) return true; c = c.parent ? this.classes[c.parent] : null; }
      return name === 'Object';
    },
    hasInterface(cls, name) {
      if (!cls) return false;
      for (const i of cls.interfaces || []) { if (i === name || this.hasInterface(this.classes[i], name)) return true; }
      return cls.parent ? this.hasInterface(this.classes[cls.parent], name) : false;
    },
    hasAbstractMethod(cls) {
      const seen = Object.create(null), all = this.collectMethods(cls, Object.create(null));
      for (const k in all) if (all[k].abstract) return true;
      return false;
    },
    collectMethods(cls, out) {
      if (!cls) return out;
      if (cls.parent) this.collectMethods(this.classes[cls.parent], out);
      for (const i of cls.interfaces || []) this.collectMethods(this.classes[i], out);
      Object.keys(cls.methods).forEach(k => { out[k] = cls.methods[k]; });
      return out;
    },
    catches(name, value) { return this.isInstance(value, name); },
    switchValue(ast, actual, env) {
      if (actual instanceof JEnum && ast.type === 'Name') return this.statics[actual.cls.name][ast.name];
      return this.eval(ast, env);
    },
    unhandled(value) {
      const m = value instanceof JException ? ('Uncaught ' + value.name0 + (value.message ? ': ' + value.message : '')) : ('Uncaught exception: ' + jstr(value));
      return new JErr(m, 0);
    },

    member(recv, name, args, line) {
      if (recv instanceof JObject) {
        if (name === 'equals') return recv === args[0];
        const m = findMethod(recv.cls, name);
        if (!m) throw new JErr('The ' + recv.cls.name + ' class has no method called "' + name + '".', line);
        return this.invoke(recv, m, args, line);
      }
      if (recv instanceof JList) {
        const L = recv.list;
        switch (name) {
          case 'add': if (args.length === 2) { L.splice(num(args[0]), 0, args[1]); return undefined; } L.push(args[0]); return true;
          case 'get': if (num(args[0]) < 0 || num(args[0]) >= L.length) throw new JErr('Index ' + args[0] + ' is out of bounds (size ' + L.length + ').', line); return L[num(args[0])];
          case 'set': { const old = L[num(args[0])]; L[num(args[0])] = args[1]; return old; }
          case 'size': return L.length;
          case 'isEmpty': return L.length === 0;
          case 'clear': L.length = 0; return undefined;
          case 'contains': return L.some(x => eqv(x, args[0]));
          case 'indexOf': return L.findIndex(x => eqv(x, args[0]));
          case 'remove': {
            if (typeof args[0] === 'number' && isInt(args[0])) { if (args[0] < 0 || args[0] >= L.length) throw new JErr('Index ' + args[0] + ' is out of bounds (size ' + L.length + ').', line); return L.splice(args[0], 1)[0]; }
            const i = L.findIndex(x => eqv(x, args[0])); if (i < 0) return false; L.splice(i, 1); return true;
          }
          case 'toString': return jstr(recv);
          default: throw new JErr('ArrayList has no method "' + name + '" in this course.', line);
        }
      }
      if (recv instanceof JMap) {
        const E = recv.entries, key = args[0], pos = () => E.findIndex(e => eqv(e[0], key));
        switch (name) {
          case 'put': { const i = pos(), old = i < 0 ? null : E[i][1]; if (i < 0) E.push([key, args[1]]); else E[i][1] = args[1]; return old; }
          case 'get': { const i = pos(); return i < 0 ? null : E[i][1]; }
          case 'getOrDefault': { const i = pos(); return i < 0 ? args[1] : E[i][1]; }
          case 'containsKey': return pos() >= 0;
          case 'containsValue': return E.some(e => eqv(e[1], args[0]));
          case 'remove': { const i = pos(); return i < 0 ? null : E.splice(i, 1)[0][1]; }
          case 'size': return E.length;
          case 'isEmpty': return E.length === 0;
          case 'clear': E.length = 0; return undefined;
          case 'keySet': return new JList(E.map(e => e[0]));
          case 'values': return new JList(E.map(e => e[1]));
          case 'toString': return jstr(recv);
          default: throw new JErr('HashMap has no method "' + name + '" in this course.', line);
        }
      }
      if (recv instanceof JBuilder) {
        switch (name) {
          case 'append': recv.s += jstr(args[0]); return recv;
          case 'toString': return recv.s;
          case 'length': return recv.s.length;
          case 'reverse': recv.s = recv.s.split('').reverse().join(''); return recv;
          case 'insert': recv.s = recv.s.slice(0, num(args[0])) + jstr(args[1]) + recv.s.slice(num(args[0])); return recv;
          case 'charAt': return recv.s.charAt(num(args[0]));
          default: throw new JErr('StringBuilder has no method "' + name + '".', line);
        }
      }
      if (recv instanceof JRandom) {
        if (name === 'nextDouble') return D(recv.next());
        if (name === 'nextBoolean') return recv.next() >= 0.5;
        if (name === 'nextInt') { const lo = args.length > 1 ? num(args[0]) : 0, hi = args.length > 1 ? num(args[1]) : num(args[0]); if (hi <= lo) throw new JErr('Random nextInt needs a positive range.', line); return lo + Math.floor(recv.next() * (hi - lo)); }
      }
      if (recv instanceof JEnum) { if (name === 'name') return recv.name0; if (name === 'ordinal') return recv.ordinal0; if (name === 'equals') return recv === args[0]; }
      if (recv instanceof JException) { if (name === 'getMessage') return recv.message; if (name === 'toString') return jstr(recv); }
      if (recv && recv.__plainObject && name === 'equals') return recv === args[0];
      if (typeof recv === 'string') {
        switch (name) {
          case 'length': return recv.length;
          case 'equals': return recv === jstr(args[0]);
          case 'equalsIgnoreCase': return recv.toLowerCase() === jstr(args[0]).toLowerCase();
          case 'toUpperCase': return recv.toUpperCase();
          case 'toLowerCase': return recv.toLowerCase();
          case 'trim': case 'strip': return recv.trim();
          case 'charAt': if (num(args[0]) < 0 || num(args[0]) >= recv.length) throw new JErr('charAt(' + args[0] + ') is out of bounds.', line); return recv[num(args[0])];
          case 'substring': return args.length > 1 ? recv.substring(num(args[0]), num(args[1])) : recv.substring(num(args[0]));
          case 'contains': return recv.includes(jstr(args[0]));
          case 'indexOf': return recv.indexOf(jstr(args[0]));
          case 'startsWith': return recv.startsWith(jstr(args[0]));
          case 'endsWith': return recv.endsWith(jstr(args[0]));
          case 'replace': return recv.split(jstr(args[0])).join(jstr(args[1]));
          case 'isEmpty': return recv.length === 0;
          case 'repeat': return recv.repeat(num(args[0]));
          case 'split': return new JArray(recv.split(jstr(args[0])));
          case 'toString': return recv;
          default: throw new JErr('String has no method "' + name + '" in this course.', line);
        }
      }
      if (isNumV(recv) || typeof recv === 'boolean') {
        if (name === 'toString') return jstr(recv);
        throw new JErr('Numbers do not have a method called "' + name + '".', line);
      }
      if (recv && recv.__scanner) {
        if (this.inputs.length === 0) throw new JErr('This course runs without keyboard input — use fixed values instead of Scanner.', line);
        const v = this.inputs.shift();
        if (name === 'nextInt') return parseInt(v, 10);
        if (name === 'nextDouble') return parseFloat(v);
        return v;
      }
      if (recv && recv.__static) {
        if (recv.__static === 'Math') return mathCall(name, args, line);
        const cls = this.classes[recv.__static];
        if (cls && cls.methods[name]) { const m = cls.methods[name]; m.__cls = cls; return this.invoke(null, m, args, line); }
      }
      throw new JErr('Cannot call "' + name + '" on that value.', line);
    }
  };

  function mkVars(params, args) {
    const v = Object.create(null);
    params.forEach((p, i) => { v[p.name] = coerce(args[i], p.type); });
    return v;
  }
  function defaultOf(t) {
    if (!t) return null;
    switch (t.name) {
      case 'int': case 'long': return 0;
      case 'double': case 'float': return D(0);
      case 'boolean': return false;
      case 'char': return '\u0000';
      case 'ArrayList': case 'List': return null;
      default: return null;
    }
  }
  function coerce(v, t) {
    if (!t || v === undefined || v === null) return v === undefined ? null : v;
    if ((t.name === 'int' || t.name === 'long') && isNumV(v)) return Math.trunc(num(v));
    if ((t.name === 'double' || t.name === 'float') && isNumV(v)) return D(num(v));
    if (t.name === 'String' && typeof v !== 'string' && v !== null) return v;
    return v;
  }
  function truthy(v) {
    if (typeof v === 'boolean') return v;
    if (v === null || v === undefined) return false;
    throw new JErr('A condition must be true or false (a boolean). Use ==, <, >, && or ||.', 0);
  }
  function num(v) {
    if (typeof v === 'number') return v;
    if (v instanceof JDouble) return v.v;
    if (typeof v === 'boolean') throw new JErr('Cannot do maths with a boolean.', 0);
    if (typeof v === 'string') throw new JErr('Cannot do maths with text ("' + v + '").', 0);
    if (v === null) throw new JErr('Cannot do maths with null.', 0);
    throw new JErr('Cannot do maths with that value.', 0);
  }
  function eqv(a, b) { if (isNumV(a) && isNumV(b)) return num(a) === num(b); return a === b; }
  function findMethod(cls, name) {
    while (cls) {
      if (cls.methods && cls.methods[name]) return cls.methods[name];
      cls = cls.parent && cls.__interpClasses ? cls.__interpClasses[cls.parent] : null;
    }
    return null;
  }
  function binop(op, a, b, line) {
    const dbl = a instanceof JDouble || b instanceof JDouble;
    const w = r => dbl ? D(r) : r;
    if (op === '+') {
      if (typeof a === 'string' || typeof b === 'string') return jstr(a) + jstr(b);
      return w(num(a) + num(b));
    }
    if (op === '==') { if (typeof a === 'string' && typeof b === 'string') return a === b; return eqv(a, b); }
    if (op === '!=') { if (typeof a === 'string' && typeof b === 'string') return a !== b; return !eqv(a, b); }
    if (op === '-') return w(num(a) - num(b));
    if (op === '*') return w(num(a) * num(b));
    if (op === '/') {
      const d = num(b); if (d === 0) throw new JErr('Cannot divide by zero.', line);
      const r = num(a) / d;
      return dbl ? D(r) : Math.trunc(r);
    }
    if (op === '%') { if (num(b) === 0) throw new JErr('Cannot divide by zero.', line); return w(num(a) % num(b)); }
    if (op === '<') return num(a) < num(b);
    if (op === '>') return num(a) > num(b);
    if (op === '<=') return num(a) <= num(b);
    if (op === '>=') return num(a) >= num(b);
    throw new JErr('Unsupported operator ' + op, line);
  }
  function mathCall(name, args, line) {
    const a = args.map(x => num(x));
    const dbl = args.some(x => x instanceof JDouble);
    const w = r => dbl ? D(r) : r;
    switch (name) {
      case 'random': return D(Math.random());
      case 'max': return w(Math.max(a[0], a[1]));
      case 'min': return w(Math.min(a[0], a[1]));
      case 'abs': return w(Math.abs(a[0]));
      case 'floor': return Math.floor(a[0]);
      case 'ceil': return Math.ceil(a[0]);
      case 'round': return Math.round(a[0]);
      case 'pow': return D(Math.pow(a[0], a[1]));
      case 'sqrt': return D(Math.sqrt(a[0]));
      default: throw new JErr('Math has no method "' + name + '" in this course.', line);
    }
  }
  function fmt(f, args) {
    let i = 0;
    return String(f).replace(/%[sdf]|%\.\d+f|%n/g, m => {
      if (m === '%n') return '\n';
      const v = args[i++];
      if (m.endsWith('f')) { const p = /%\.(\d+)f/.exec(m); return Number(num(v)).toFixed(p ? +p[1] : 6); }
      return jstr(v);
    });
  }

  function runJava(src, opts) {
    const it = new Interp(opts || {});
    try {
      const out = it.run(src, (opts || {}).entry);
      return { ok: true, output: out };
    } catch (e) {
      const msg = e && e.javaError ? e.message : (e && e.message ? e.message : String(e));
      return { ok: false, output: it.out.join(''), error: msg, line: e && e.line ? e.line : null };
    }
  }

  global.MiniJava = { run: runJava, lex, Parser };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.MiniJava;
})(typeof window !== 'undefined' ? window : globalThis);
