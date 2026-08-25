/* Turns any Java line into a plain-English sentence. Used by the Explain tab. */
(function (global) {

  function q(s) { return '<code>' + String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>'; }
  const TYPES = 'int|double|boolean|char|String|long|float|var';

  function readable(expr) {
    if (expr === undefined || expr === null) return '';
    let e = String(expr).trim();
    e = e.replace(/\s+/g, ' ');
    return e;
  }

  function describeCondition(c) {
    let t = readable(c);
    const map = [
      [/(.+?)\s*<=\s*(.+)/, (m) => readable(m[1]) + ' is less than or equal to ' + readable(m[2])],
      [/(.+?)\s*>=\s*(.+)/, (m) => readable(m[1]) + ' is greater than or equal to ' + readable(m[2])],
      [/(.+?)\s*==\s*(.+)/, (m) => readable(m[1]) + ' is exactly ' + readable(m[2])],
      [/(.+?)\s*!=\s*(.+)/, (m) => readable(m[1]) + ' is not ' + readable(m[2])],
      [/(.+?)\s*<\s*(.+)/, (m) => readable(m[1]) + ' is less than ' + readable(m[2])],
      [/(.+?)\s*>\s*(.+)/, (m) => readable(m[1]) + ' is greater than ' + readable(m[2])]
    ];
    if (t.indexOf('&&') >= 0) return t.split('&&').map(p => describeCondition(p)).join(' AND ');
    if (t.indexOf('||') >= 0) return t.split('||').map(p => describeCondition(p)).join(' OR ');
    for (let i = 0; i < map.length; i++) {
      const m = t.match(map[i][0]);
      if (m) return map[i][1](m);
    }
    if (/^!/.test(t)) return 'NOT ' + describeCondition(t.slice(1));
    return q(t) + ' is true';
  }

  function typeWord(t) {
    switch (t) {
      case 'int': return 'a whole number';
      case 'double': return 'a decimal number';
      case 'boolean': return 'a true/false value';
      case 'char': return 'a single character';
      case 'String': return 'a piece of text';
      case 'long': return 'a very large whole number';
      case 'var': return 'a value (Java works out the type)';
      case 'Integer': return 'a whole number';
      case 'Double': return 'a decimal number';
      case 'Character': return 'a single character';
      case 'Boolean': return 'a true/false value';
      default: return (/^[AEIOU]/i.test(t) ? 'an ' : 'a ') + t;
    }
  }

  /* returns { text, terms:[glossary keys] } */
  function explainLine(raw, ctx) {
    const line = String(raw);
    const s = line.trim();
    const terms = [];
    const add = (...t) => { t.forEach(x => { if (terms.indexOf(x) < 0) terms.push(x); }); };
    const out = (text) => ({ text: text, terms: terms });

    if (!s) return out('');
    if (/^\/\//.test(s)) { add('//'); return out('A comment. Java ignores this line completely — it is a note for you.'); }
    if (/^\/\*|^\*\/|^\*/.test(s)) { add('/* */'); return out('Part of a multi-line comment, ignored by Java.'); }

    let m;

    if ((m = s.match(/^import\s+([\w.]+)\s*;/))) {
      add('import'); if (/ArrayList/.test(m[1])) add('ArrayList');
      return out('Brings in the ready-made ' + q(m[1].split('.').pop()) + ' class that Java ships with, so you are allowed to use its name below.');
    }

    /* ---------- level 2 and 3 shapes ---------- */

    /* abstract / interface / enum headers */
    if ((m = s.match(/^(public\s+)?abstract\s+class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*\{?$/))) {
      add('abstract', 'class', 'inheritance');
      let t = 'Starts an abstract class called ' + q(m[2]) + '. Abstract means it can never be built with ' + q('new') + ' on its own — it only exists so other classes can extend it and share its fields and methods.';
      if (m[3]) { add('extends', 'superclass'); t += ' It itself builds on ' + q(m[3]) + '.'; }
      if (m[4]) { add('implements', 'interface'); t += ' It also promises to provide every method listed by ' + q(m[4].trim()) + '.'; }
      return out(t);
    }
    if ((m = s.match(/^(public\s+)?class\s+(\w+)\s+extends\s+(\w+)(?:\s+implements\s+([\w,\s]+))?\s*\{?$/))) {
      add('class', 'extends', 'inheritance', 'subclass', 'superclass');
      let t = 'Starts a class called ' + q(m[2]) + ' that extends ' + q(m[3]) + '. It begins with everything ' + q(m[3]) + ' has — the same fields and methods — and below you only write what makes a ' + m[2].toLowerCase() + ' different.';
      if (m[4]) { add('implements', 'interface'); t += ' It also implements ' + q(m[4].trim()) + ', so it promises to provide that interface\u2019s methods.'; }
      return out(t);
    }
    if ((m = s.match(/^(public\s+)?class\s+(\w+)\s+implements\s+([\w,\s]+)\s*\{?$/))) {
      add('class', 'implements', 'interface');
      return out('Starts a class called ' + q(m[2]) + ' that implements ' + q(m[3].trim()) + '. Implementing is a promise: Java will refuse to run the program unless this class writes every method the interface listed.');
    }
    if ((m = s.match(/^(public\s+)?interface\s+(\w+)\s*\{\s*(.*?)\s*\}$/)) && m[3]) {
      add('interface', 'method');
      const inner = m[3].replace(/;$/, '');
      return out('A whole interface called ' + q(m[2]) + ' written on one line. It lists the method ' + q(inner) + ' with no code inside it — any class that says ' + q('implements ' + m[2]) + ' must supply that method itself.');
    }
    if ((m = s.match(/^(public\s+)?interface\s+(\w+)\s*\{?$/))) {
      add('interface');
      return out('Starts an interface called ' + q(m[2]) + '. An interface holds no code, only a list of method names that any class implementing it promises to provide. That lets very different classes be used in the same place.');
    }
    if ((m = s.match(/^(public\s+)?enum\s+(\w+)\s*\{\s*([^}]*)\}$/))) {
      add('enum');
      const vals = m[3].split(',').map(x => x.trim()).filter(Boolean);
      return out('Creates an enum called ' + q(m[2]) + ' with exactly ' + vals.length + ' possible values: ' + vals.map(q).join(', ') + '. Refer to one as ' + q(m[2] + '.' + vals[0]) + '. Because the list is fixed, a misspelled value is an error instead of a silent bug.');
    }
    if ((m = s.match(/^(public\s+)?enum\s+(\w+)\s*\{?$/))) {
      add('enum');
      return out('Starts an enum called ' + q(m[2]) + ' — a fixed list of named values, written on the lines below and separated by commas.');
    }
    /* a bare list of enum constants */
    if (/^[A-Z][A-Z0-9_]*(\s*,\s*[A-Z][A-Z0-9_]*)*,?$/.test(s) && s.indexOf(',') >= 0) {
      add('enum');
      return out('The list of values this enum is allowed to have, separated by commas. Written in capitals by convention so they stand out as fixed names.');
    }
    /* closing an enum or array literal */
    if (/^\}\s*;$/.test(s)) { add('{}'); return out('Closes the block opened above and the semicolon ends the whole instruction — the shape used by an enum body or an array written out in full.'); }

    /* abstract method with no body */
    if ((m = s.match(/^(public\s+|protected\s+)?abstract\s+(void|[\w\[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*;$/))) {
      add('abstract', 'method', 'override');
      return out('Declares an abstract method called ' + q(m[3]) + ' with no body at all, just a semicolon. It is a rule rather than code: every class that extends this one must write its own version of ' + q(m[3]) + '.');
    }
    /* interface method signature */
    if ((m = s.match(/^(void|[A-Z]\w*|int|double|boolean|char|long)(\[\])?\s+(\w+)\s*\(([^)]*)\)\s*;$/))) {
      add('interface', 'method');
      return out('A method signature with no body: it names ' + q(m[3]) + ' and says it hands back ' + (m[1] === 'void' ? 'nothing' : typeWord(m[1])) + '. Inside an interface this is the promise; the real code lives in each class that implements it.');
    }

    /* protected field */
    if ((m = s.match(/^protected\s+(?:final\s+)?([\w\[\]<>, ]+?)\s+(\w+)\s*(?:=\s*(.+?))?\s*;$/))) {
      add('protected', 'field');
      let t = 'A field called ' + q(m[2]) + ' holding ' + typeWord(m[1].trim()) + '. ' + q('protected') + ' means this class and any class that extends it may use it, but unrelated code may not';
      t += m[3] ? ', and it starts out as ' + q(readable(m[3])) + '.' : '.';
      return out(t);
    }

    /* super calls */
    if ((m = s.match(/^super\s*\((.*)\)\s*;$/))) {
      add('super', 'constructor', 'inheritance');
      return out('Runs the parent class constructor first, passing it ' + (m[1].trim() ? q(readable(m[1])) : 'no values') + '. Java insists this is the first line of a subclass constructor, because the inherited part of the object has to be set up before your own.');
    }
    if ((m = s.match(/^(?:(?:[\w\[\]<>]+)\s+(\w+)\s*=\s*)?super\.(\w+)\s*\((.*)\)\s*;$/))) {
      add('super', 'override');
      let t = 'Calls the parent class version of ' + q(m[2]) + '. You use ' + q('super.') + ' when this class has overridden that method but still wants the original behaviour as well.';
      if (m[1]) t += ' The value it hands back is kept in ' + q(m[1]) + '.';
      return out(t);
    }

    /* switch */
    if ((m = s.match(/^switch\s*\((.+)\)\s*\{?$/))) {
      add('switch');
      return out('Starts a switch on ' + q(readable(m[1])) + '. Java compares that one value against each ' + q('case') + ' label below and jumps straight to the matching one. Clearer than a long chain of ' + q('else if') + ' when you keep testing the same value.');
    }
    if ((m = s.match(/^case\s+(.+?)\s*:\s*(.*)$/))) {
      add('case', 'switch');
      let t = 'The branch that runs when the switch value equals ' + q(readable(m[1])) + '. Remember the lines keep running into the next case unless a ' + q('break;') + ' stops them.';
      if (m[2]) { const r = explainLine(m[2]); r.terms.forEach(t2 => add(t2)); if (r.text) t += ' On the same line: ' + r.text; }
      return out(t);
    }
    if ((m = s.match(/^default\s*:\s*(.*)$/))) {
      add('default', 'switch');
      let t = 'The catch-all branch: it runs when none of the case labels matched, exactly like a final ' + q('else') + '.';
      if (m[1]) { const r = explainLine(m[1]); r.terms.forEach(t2 => add(t2)); if (r.text) t += ' On the same line: ' + r.text; }
      return out(t);
    }

    /* try / catch / finally / throw */
    if (/^try\s*\{?$/.test(s)) { add('try'); return out('Starts a try block: the risky lines go inside. If any of them fails, Java abandons the rest of this block and jumps to the ' + q('catch') + ' below instead of crashing the program.'); }
    if ((m = s.match(/^\}?\s*catch\s*\(\s*([\w.]+)\s+(\w+)\s*\)\s*\{?$/))) {
      add('catch', 'exception');
      return out('Catches a problem of type ' + q(m[1]) + ' and calls it ' + q(m[2]) + '. This block runs only when the try block failed, and inside it ' + q(m[2] + '.getMessage()') + ' gives you the message describing what went wrong.');
    }
    if (/^\}?\s*finally\s*\{?$/.test(s)) { add('finally'); return out('The finally block runs either way — whether the try succeeded or the catch had to deal with a failure. Put the line that must always happen here.'); }
    if ((m = s.match(/^throw\s+new\s+(\w+)\s*\((.*)\)\s*;$/))) {
      add('throw', 'exception', 'new');
      return out('Raises a problem on purpose: it creates ' + (/^[AEIOU]/i.test(m[1]) ? 'an ' : 'a ') + q(m[1]) + ' carrying the message ' + q(readable(m[2])) + ' and stops this method immediately. Whichever ' + q('catch') + ' matches will handle it, which is how a method refuses input that makes no sense.');
    }

    /* map declarations */
    if ((m = s.match(/^(?:(HashMap|Map)<([^>]*)>)\s+(\w+)\s*=\s*new\s+(HashMap|TreeMap)<[^>]*>\s*\(\s*\)\s*;$/))) {
      add('HashMap', 'Map', 'key', 'new');
      const kv = m[2].split(',').map(x => x.trim());
      return out('Creates an empty map called ' + q(m[3]) + ' that stores pairs: the key is ' + typeWord(kv[0]) + ' and the value it looks up is ' + typeWord(kv[1] || 'value') + '. You add pairs with ' + q('put') + ' and read them back with ' + q('get') + ' or ' + q('getOrDefault') + '.');
    }

    /* 2D array declarations */
    if ((m = s.match(/^([\w]+)\[\]\[\]\s+(\w+)\s*=\s*new\s+\w+\s*\[\s*(\w+)\s*\]\s*\[\s*(\w+)\s*\]\s*;$/))) {
      add('2D array', 'array', 'row', 'column', 'new');
      return out('Creates a grid called ' + q(m[2]) + ' with ' + q(m[3]) + ' rows and ' + q(m[4]) + ' columns, every slot holding ' + typeWord(m[1]) + '. Reach one square with two indexes: ' + q(m[2] + '[row][column]') + ', both counting from 0.');
    }
    if ((m = s.match(/^([\w]+)\[\]\[\]\s+(\w+)\s*=\s*\{(.*)$/))) {
      add('2D array', 'array', 'row', 'column');
      const closed = /\}\s*;$/.test(s);
      return out('Creates a grid called ' + q(m[2]) + ' and fills it in immediately. Each inner ' + q('{ ... }') + ' is one row of the map' + (closed ? ', all written on this single line.' : ', written on the lines below.') + ' The number of inner groups is ' + q(m[2] + '.length') + ' and the length of one row is ' + q(m[2] + '[0].length') + '.');
    }
    /* one row of a 2D literal */
    if (/^\{.*\}\s*,?$/.test(s) && /['"]/.test(s)) {
      add('2D array', 'row');
      return out('One row of the grid above, written out square by square. The comma at the end separates it from the next row.');
    }
    /* an object inside an array literal */
    if ((m = s.match(/^new\s+(\w+)\s*\((.*)\)\s*,?$/))) {
      add('new', 'object', 'array');
      return out('Builds one ' + q(m[1]) + ' object from the values ' + q(readable(m[2])) + ' as an item of the array being written out above. The trailing comma separates it from the next item.');
    }

    /* array element assignment (used by swaps) */
    if ((m = s.match(/^(\w+)\s*\[([^\]]+)\]\s*=\s*(.+?)\s*;$/))) {
      add('array', 'index', '=');
      return out('Puts ' + q(readable(m[3])) + ' into position ' + q(readable(m[2])) + ' of ' + q(m[1]) + '. Overwriting a slot loses whatever was there, which is why a swap needs a spare variable to hold one value first.');
    }

    if ((m = s.match(/^(public\s+|private\s+)?class\s+(\w+)/))) {
      add('class'); if (m[1] && m[1].trim() === 'public') add('public');
      return out('Starts a class called ' + q(m[2]) + ' — a container of code that acts as the blueprint for ' + m[2].toLowerCase() + ' things. The ' + q('{') + ' opens its block; everything up to the matching ' + q('}') + ' belongs to it.');
    }

    if (/^public\s+static\s+void\s+main\s*\(/.test(s)) {
      add('public', 'static', 'void', 'main', 'String[] args');
      return out('The starting line of the program. Java always looks for this exact spelling and runs the lines inside it, top to bottom. ' + q('public') + ' = anyone may use it, ' + q('static') + ' = no object needed, ' + q('void') + ' = hands nothing back, ' + q('String[] args') + ' = a list of words typed at launch (unused here).');
    }

    /* method header */
    if ((m = s.match(/^(public\s+|private\s+)?(static\s+)?(void|[A-Z]\w*|int|double|boolean|char|long)(\[\])?\s+(\w+)\s*\(([^)]*)\)\s*\{?$/)) && m[5] !== 'if' && m[5] !== 'while' && m[5] !== 'for') {
      const ret = m[3], name = m[5], params = m[6].trim();
      add('method'); if (m[2]) add('static');
      let t = 'Declares a method called ' + q(name) + '. ';
      if (ret === 'void') { add('void'); t += q('void') + ' means it hands nothing back — it just does its job. '; }
      else { add('return'); t += 'It promises to hand back ' + typeWord(ret) + ', so it must contain a ' + q('return') + '. '; }
      if (m[2]) t += q('static') + ' means you call it on the class itself, with no object. ';
      if (params) {
        add('parameter');
        const list = params.split(',').map(p => p.trim());
        t += 'It asks for ' + list.map(p => { const bits = p.split(/\s+/); return q(bits[1] || p) + ' (' + typeWord(bits[0]) + ')'; }).join(' and ') + ', which you can use inside like a normal variable.';
      } else {
        add('()');
        t += 'The empty brackets mean it needs no information.';
      }
      return out(t);
    }

    /* constructor */
    if ((m = s.match(/^(public\s+)?([A-Z]\w*)\s*\(([^)]*)\)\s*\{?$/))) {
      add('constructor', 'new');
      const params = m[3].trim();
      let t = 'The constructor for ' + q(m[2]) + ' — same name as the class, no return type. It runs automatically when someone writes ' + q('new ' + m[2] + '(...)') + ', and its job is to fill in the starting values.';
      if (params) { add('parameter'); t += ' It takes ' + params.split(',').map(p => q(p.trim().split(/\s+/)[1] || p)).join(' and ') + ' from whoever creates the object.'; }
      return out(t);
    }

    /* declaration with new object */
    if ((m = s.match(new RegExp('^(?:final\\s+)?(ArrayList<[^>]*>|[A-Z]\\w*|' + TYPES + ')\\s+(\\w+)\\s*=\\s*new\\s+([\\w<>]+)\\s*\\((.*)\\)\\s*;')))) {
      add('new', 'object');
      const isList = /^ArrayList/.test(m[1]);
      if (isList) { add('ArrayList', 'import'); return out('Creates an empty ' + q(m[1]) + ' called ' + q(m[2]) + ' — a list that can grow and shrink while the program runs. The ' + q('<>') + ' on the right is Java saying "same kind as the left".'); }
      let t = 'Builds one new ' + q(m[3]) + ' object and stores it in a variable called ' + q(m[2]) + '. ' + q('new') + ' runs the constructor';
      if (m[4].trim()) { add('argument'); t += ', handing it ' + q(m[4]) + ' as its starting values'; }
      return out(t + '. From now on, ' + q(m[2]) + ' is how you talk to that object.');
    }

    /* array literal */
    if ((m = s.match(/^([A-Za-z]\w*)\[\]\s+(\w+)\s*=\s*\{/))) {
      add('array', '[]');
      return out('Creates an array called ' + q(m[2]) + ' holding several ' + q(m[1]) + ' values, listed between the braces. Its size is fixed from now on, positions are counted from 0, and ' + q(m[2] + '.length') + ' tells you how many there are.');
    }

    /* plain declaration + value */
    if ((m = s.match(new RegExp('^(?:final\\s+)?(' + TYPES + '|[A-Z]\\w*)\\s+(\\w+)\\s*=\\s*(.+);$')))) {
      add('variable', 'type', '=', ';');
      if (TYPES.split('|').indexOf(m[1]) >= 0) add(m[1]);
      return out('Makes a variable called ' + q(m[2]) + ' that holds ' + typeWord(m[1]) + ', and puts ' + q(readable(m[3])) + ' in it straight away. The single ' + q('=') + ' means "becomes"; the ' + q(';') + ' ends the instruction.');
    }

    /* field declaration, no value */
    if ((m = s.match(new RegExp('^(?:public\\s+|private\\s+)?(' + TYPES + '|[A-Z]\\w*|ArrayList<[^>]*>)\\s+(\\w+)\\s*;$')))) {
      add('field', 'type');
      return out('Declares a field called ' + q(m[2]) + ' holding ' + typeWord(m[1]) + '. Because it sits directly in the class, every object built from this class gets its own copy and remembers it for as long as the object exists.');
    }

    /* this.x = y */
    if ((m = s.match(/^this\.(\w+)\s*=\s*(.+);$/))) {
      add('this', 'field', '=');
      return out('Puts ' + q(readable(m[2])) + ' into this object\'s ' + q(m[1]) + ' field. ' + q('this.') + ' is what tells Java you mean the field and not the parameter of the same name.');
    }

    /* compound / plain assignment */
    if ((m = s.match(/^([\w.]+)\s*([+\-*/]?)=\s*(.+);$/))) {
      add('=');
      if (m[2]) { add(m[2] + '='); return out('Changes ' + q(m[1]) + ' by ' + q(readable(m[3])) + '. ' + q(m[2] + '=') + ' is shorthand for ' + q(m[1] + ' = ' + m[1] + ' ' + m[2] + ' ' + readable(m[3])) + '.'); }
      let t = 'Stores ' + q(readable(m[3])) + ' in ' + q(m[1]) + ', replacing whatever was there.';
      if (new RegExp('\\b' + m[1].split('.').pop() + '\\b').test(m[3])) t += ' Because the old value appears on the right, Java works out the right-hand side first, then saves the answer — the classic way to reduce health.';
      return out(t);
    }

    if ((m = s.match(/^([\w.]+)\+\+\s*;$/))) { add('++'); return out('Adds one to ' + q(m[1]) + '. Short for ' + q(m[1] + ' = ' + m[1] + ' + 1') + ' — the usual way to count rounds or turns.'); }
    if ((m = s.match(/^([\w.]+)--\s*;$/))) { add('--'); return out('Takes one away from ' + q(m[1]) + '. Short for ' + q(m[1] + ' = ' + m[1] + ' - 1') + '.'); }

    /* printing */
    if ((m = s.match(/^System\.out\.println\s*\((.*)\)\s*;$/))) {
      add('System.out.println');
      const inner = m[1].trim();
      let t = 'Prints ' + (inner ? q(readable(inner)) : 'an empty line') + ' to the console, then moves to a new line.';
      if (inner.indexOf('+') >= 0 && /"/.test(inner)) { add('concatenation'); t += ' The ' + q('+') + ' joins text and values into one piece of text — numbers are turned into text automatically.'; }
      if (!inner) t += ' Handy for spacing out your output.';
      return out(t);
    }
    if ((m = s.match(/^System\.out\.print\s*\((.*)\)\s*;$/))) {
      add('System.out.print');
      return out('Prints ' + q(readable(m[1])) + ' but does not start a new line, so the next print carries on beside it.');
    }
    if ((m = s.match(/^System\.out\.printf\s*\((.*)\)\s*;$/))) {
      add('printf');
      return out('Prints using a pattern with placeholders — ' + q('%d') + ' for a whole number, ' + q('%s') + ' for text, ' + q('%n') + ' for a new line.');
    }

    /* control flow */
    if ((m = s.match(/^\}?\s*else\s+if\s*\((.+)\)\s*\{?$/))) {
      add('else if', 'condition');
      return out('If the test above was false, check this one instead: does ' + describeCondition(m[1]) + '? Java runs the first matching block only, so order matters — put the most specific test first.');
    }
    if (/^\}?\s*else\s*\{?$/.test(s)) { add('else'); return out('What to do when none of the tests above were true. Exactly one block in the whole if/else chain ever runs.'); }
    if ((m = s.match(/^if\s*\((.+)\)\s*\{?$/))) {
      add('if', 'condition', '()');
      return out('Asks a yes/no question: does ' + describeCondition(m[1]) + '? If yes, the block in braces runs; if no, Java skips straight past it.');
    }
    if ((m = s.match(/^while\s*\((.+)\)\s*\{?$/))) {
      add('while', 'condition', 'game loop');
      return out('Repeats the block below for as long as ' + describeCondition(m[1]) + '. The test is checked before every pass, so something inside must move it towards false or the loop never ends.');
    }
    if ((m = s.match(/^for\s*\(\s*(\w+)\s+(\w+)\s*:\s*([\w.()]+)\s*\)\s*\{?$/))) {
      add('for-each', 'index');
      return out('A for-each loop: read it as "for each ' + q(m[1]) + ', which I will call ' + q(m[2]) + ', in ' + q(m[3]) + '". The block runs once per item, in order, with no counter to get wrong.');
    }
    if ((m = s.match(/^for\s*\((.*?);(.*?);(.*?)\)\s*\{?$/))) {
      add('for');
      return out('A counting loop in three parts: start with ' + q(readable(m[1])) + ', keep going while ' + describeCondition(m[2]) + ', and after each pass do ' + q(readable(m[3])) + '.');
    }
    if (/^do\s*\{?$/.test(s)) { add('while'); return out('A do-while loop: run the block first, then check the test at the bottom — so it always runs at least once.'); }
    if ((m = s.match(/^\}\s*while\s*\((.+)\)\s*;$/))) { add('while'); return out('The bottom of a do-while loop: go round again while ' + describeCondition(m[1]) + '.'); }
    if (/^break\s*;$/.test(s)) { add('break'); return out('Leaves the loop immediately, even if its test is still true, and carries on after the loop.'); }
    if (/^continue\s*;$/.test(s)) { add('continue'); return out('Skips the rest of this pass and goes straight to the next one.'); }

    /* return */
    if ((m = s.match(/^return\s*;$/))) { add('return'); return out('Ends the method here and goes back to whoever called it, handing nothing back.'); }
    if ((m = s.match(/^return\s+(.+);$/))) {
      add('return');
      let t = 'Hands ' + q(readable(m[1])) + ' back to whoever called this method, and stops the method right there — no later line in it runs.';
      if (/[<>=!]/.test(m[1])) { add('boolean'); t += ' Because the expression is a comparison, the value handed back is simply true or false.'; }
      return out(t);
    }

    /* list / object method call */
    if ((m = s.match(/^(\w+)\.(\w+)\s*\((.*)\)\s*;$/))) {
      const obj = m[1], meth = m[2], args = m[3].trim();
      add('.', 'method');
      const known = { add: 'puts an item on the end of the list, so the list grows by one', remove: 'takes an item out of the list', clear: 'empties the list completely', set: 'replaces the item at that position' };
      if (known[meth]) { add(meth === 'add' ? 'add' : (meth === 'remove' ? 'remove' : 'ArrayList')); return out('Calls ' + q(meth) + ' on ' + q(obj) + ': it ' + known[meth] + (args ? ' — here ' + q(readable(args)) : '') + '.'); }
      const isClass = /^[A-Z]/.test(obj);
      let t = isClass
        ? 'Calls the ' + q(meth) + ' method that belongs to the class ' + q(obj) + ' itself. No object is needed because that method is ' + q('static') + '. The dot means "reach inside ' + obj + '"'
        : 'Calls the ' + q(meth) + ' method that belongs to ' + q(obj) + '. The dot means "reach inside ' + obj + '"';
      if (isClass) add('static');
      if (args) { add('argument'); t += ', and ' + q(readable(args)) + ' is the information handed over'; }
      else { add('()'); t += ', and the empty brackets mean it needs no information'; }
      return out(t + '. Nothing is stored, so this line is here for what it changes or prints.');
    }

    /* bare call */
    if ((m = s.match(/^(\w+)\s*\((.*)\)\s*;$/))) {
      add('method');
      return out('Calls the ' + q(m[1]) + ' method defined in this same class' + (m[2].trim() ? ', handing it ' + q(readable(m[2])) : ' with no information') + '.');
    }

    /* declaration from a method call */
    if ((m = s.match(new RegExp('^(' + TYPES + '|[A-Z]\\w*)\\s+(\\w+)\\s*=\\s*([\\w.]+)\\s*\\((.*)\\)\\s*;$')))) {
      add('variable', 'return');
      return out('Runs ' + q(m[3] + '(' + readable(m[4]) + ')') + ' and keeps the value it hands back in a new variable called ' + q(m[2]) + ', which holds ' + typeWord(m[1]) + '.');
    }

    /* whole member squeezed onto one line: explain the header, then the body */
    if ((m = s.match(/^(.*?\{)\s*(.+?)\s*\}$/)) && m[2]) {
      const head = explainLine(m[1]);
      const inner = m[2].split(';').map(x => x.trim()).filter(Boolean);
      if (head.text) {
        head.terms.forEach(t => add(t));
        const parts = inner.map(x => { const r = explainLine(x + ';'); r.terms.forEach(t => add(t)); return r.text; }).filter(Boolean);
        return out(head.text + (parts.length ? ' Its whole body is squeezed onto this one line to save space: ' + parts.join(' ') : ''));
      }
    }
    /* several statements on one line */
    if (s.split(';').filter(x => x.trim()).length > 1 && /;/.test(s)) {
      const parts = s.split(';').map(x => x.trim()).filter(Boolean).map(x => { const r = explainLine(x + ';'); r.terms.forEach(t => add(t)); return r.text; }).filter(Boolean);
      if (parts.length) return out('Two or more instructions on one line, separated by semicolons. ' + parts.join(' '));
    }

    if (/^\}$/.test(s)) { add('{}'); return out('Closes the block that was opened by the matching ' + q('{') + ' above. Line it up with the line that opened it and the pairs are easy to see.'); }
    if (/^\{$/.test(s)) { add('{}'); return out('Opens a block of code.'); }

    return out('');
  }

  function explainSource(src) {
    const rows = [];
    String(src).replace(/\r/g, '').split('\n').forEach((raw, i) => {
      const r = explainLine(raw);
      rows.push({ n: i + 1, code: raw, text: r.text, terms: r.terms });
    });
    return rows;
  }

  global.EXPLAIN = { line: explainLine, source: explainSource };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.EXPLAIN;
})(typeof window !== 'undefined' ? window : globalThis);
