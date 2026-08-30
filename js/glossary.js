/* Plain-English dictionary for every word, symbol and idea in the course. */
(function (global) {

  const G = {
    /* ---------- structure words ---------- */
    'public': { kind: 'keyword', short: 'Anyone is allowed to use this.', long: 'An access word. It means other parts of the program (and Java itself) are allowed to see and use this class or method. Java needs <code>public</code> on <code>main</code> so it can start your program.', ex: 'public class Game {' },
    'private': { kind: 'keyword', short: 'Only this class can use this.', long: 'The opposite of public. A private field or method can only be used inside the class it belongs to. It is a way of protecting data from being changed by accident.', ex: 'private int secretCode;' },
    'class': { kind: 'keyword', short: 'A container for code, or a blueprint for a thing.', long: 'Everything in Java lives inside a class. A class can be a whole program (like <code>Game</code>) or a blueprint for a thing in your game (like <code>Player</code>). A blueprint describes what something has (fields) and what it can do (methods).', ex: 'class Player {\n    String name;\n}' },
    'static': { kind: 'keyword', short: 'Belongs to the class itself, not to one object.', long: 'A static method or field belongs to the class as a whole, so you can use it without creating an object: <code>Screen.showTitle()</code>. Without static you would need to build an object first. <code>main</code> must be static because Java runs it before any object exists.', ex: 'static void showTitle() { }' },
    'void': { kind: 'keyword', short: 'This method gives nothing back.', long: 'Where a return type normally goes. <code>void</code> means "this method does a job but hands back no value". Printing something or changing a field are void jobs.', ex: 'void takeDamage(int amount) { }' },
    'main': { kind: 'keyword', short: 'Where your program starts running.', long: 'Java always looks for a method called <code>main</code> and runs the lines inside it, top to bottom. The full spelling must be exact: <code>public static void main(String[] args)</code>.', ex: 'public static void main(String[] args) { }' },
    'String[] args': { kind: 'syntax', short: 'A list of words typed when the program starts.', long: 'A parameter Java always gives to <code>main</code>: a list of extra words someone could type when launching the program. This course never uses it, but Java insists it is there.', ex: 'public static void main(String[] args)' },
    'new': { kind: 'keyword', short: 'Build a new object from a blueprint.', long: '<code>new Player("Nova")</code> means "make me a fresh Player object and run its constructor". Every <code>new</code> gives you a separate object with its own values.', ex: 'Player hero = new Player("Nova");' },
    'this': { kind: 'keyword', short: 'The object this code is running inside.', long: 'Inside a method or constructor, <code>this</code> means "the object we are working on right now". <code>this.name = name;</code> means "put the name that was passed in into <i>my</i> name field", which is how Java tells the two apart.', ex: 'this.health = 100;' },
    'return': { kind: 'keyword', short: 'Hand a value back and stop the method.', long: 'Ends the method immediately. If the method has a type like <code>int</code>, <code>return</code> must hand back a value of that type. In a <code>void</code> method, a bare <code>return;</code> just stops early.', ex: 'return attackPower;' },
    'import': { kind: 'keyword', short: 'Bring in a ready-made class from Java.', long: 'Java ships with thousands of classes. An import line at the top of the file says which extra ones you want to use, like <code>ArrayList</code>. Without the import, Java will not know the name.', ex: 'import java.util.ArrayList;' },
    'extends': { kind: 'keyword', short: 'Build a new class on top of an existing one.', long: 'Used for inheritance: <code>class Boss extends Enemy</code> means Boss starts with everything Enemy has and can add more. Not needed in this course, but you will meet it next.', ex: 'class Boss extends Enemy { }' },

    /* ---------- types ---------- */
    'int': { kind: 'type', short: 'A whole number.', long: 'Holds numbers with no decimal point: health, damage, score, round numbers. Dividing two ints throws the remainder away, so <code>7 / 2</code> is <code>3</code>.', ex: 'int health = 100;' },
    'double': { kind: 'type', short: 'A number that can have decimals.', long: 'Used for values like 2.5 or 0.75 — damage multipliers, percentages, positions. Java prints a double with a decimal point, so 100 shows as <code>100.0</code>.', ex: 'double multiplier = 1.5;' },
    'boolean': { kind: 'type', short: 'True or false, nothing else.', long: 'A yes/no value. Perfect for questions like "is the hero alive?". Comparisons such as <code>health > 0</code> produce a boolean, so you can store or return them.', ex: 'boolean alive = true;' },
    'char': { kind: 'type', short: 'A single character in single quotes.', long: 'Holds exactly one letter or symbol, written with single quotes: <code>\'A\'</code>. Text with more than one character is a String with double quotes instead.', ex: "char grade = 'A';" },
    'String': { kind: 'type', short: 'Text, written inside double quotes.', long: 'A String holds text of any length: a name, a message, a whole title screen. Written with double quotes. Note the capital S — String is a class, not a basic number type.', ex: 'String name = "Nova";' },
    'long': { kind: 'type', short: 'A whole number that can be huge.', long: 'Like <code>int</code> but for very large numbers, past about 2.1 billion. You will rarely need it in a small game.', ex: 'long score = 9000000000L;' },
    'ArrayList': { kind: 'type', short: 'A list that grows and shrinks as the program runs.', long: 'Unlike an array, an ArrayList has no fixed size — you <code>add</code> and <code>remove</code> whenever you like. Ideal for an inventory, active enemies, or a quest log. Needs <code>import java.util.ArrayList;</code>.', ex: 'ArrayList<String> items = new ArrayList<>();' },
    'array': { kind: 'idea', short: 'A fixed-size row of values.', long: 'Written with square brackets: <code>Enemy[] caves</code>. The size is decided when you make it and never changes. Read items by position, starting at 0: <code>caves[0]</code>. Its length is <code>caves.length</code>.', ex: 'int[] rolls = { 3, 5, 7 };' },
    'var': { kind: 'keyword', short: 'Let Java work out the type for you.', long: 'A shortcut where the type is obvious from the right-hand side. This course writes types out in full because it makes the code easier to read while learning.', ex: 'var hero = new Player("Nova");' },

    /* ---------- object words ---------- */
    'object': { kind: 'idea', short: 'One actual thing built from a class blueprint.', long: 'If <code>Player</code> is the blueprint, then <code>new Player("Nova")</code> is one object — one hero with its own name and health. Ten objects from the same class each keep their own values.', ex: 'Player hero = new Player("Nova");' },
    'field': { kind: 'idea', short: 'A variable that belongs to an object.', long: 'Fields are declared straight inside the class, outside any method. They are what the object remembers for its whole life: name, health, damage.', ex: 'class Player {\n    int health;\n}' },
    'method': { kind: 'idea', short: 'A named block of code that does a job.', long: 'You write it once and call it whenever you need it. A method can take information in (parameters) and hand a result back (return). Methods are what objects <i>do</i>.', ex: 'int attack() {\n    return 14;\n}' },
    'constructor': { kind: 'idea', short: 'Special method that sets up a new object.', long: 'It has the same name as the class and no return type, and it runs the moment you write <code>new</code>. Its job is to fill in the starting values of the fields.', ex: 'Player(String name) {\n    this.name = name;\n}' },
    'parameter': { kind: 'idea', short: 'Information a method asks for.', long: 'Written inside the brackets of the method: <code>void takeDamage(int amount)</code> asks for one whole number. Inside the method, <code>amount</code> is used like a normal variable.', ex: 'void takeDamage(int amount) { }' },
    'argument': { kind: 'idea', short: 'The actual value you pass in.', long: 'The parameter is the empty slot; the argument is what you drop into it. In <code>takeDamage(12)</code>, the argument is 12. Order matters — Java matches them left to right.', ex: 'hero.takeDamage(12);' },
    'variable': { kind: 'idea', short: 'A named box that holds a value.', long: 'Give it a type and a name, then put a value in it. You can read it and change it later. Declared inside a method it is called a local variable; declared in a class it is a field.', ex: 'int score = 0;' },
    'type': { kind: 'idea', short: 'What kind of value something is.', long: 'Java insists you say what kind of value a variable holds — <code>int</code>, <code>String</code>, <code>boolean</code>, <code>Player</code>. That is how it catches mistakes before the program even runs.', ex: 'String name = "Nova";' },
    'instance': { kind: 'idea', short: 'Another word for an object.', long: '"An instance of Player" means one particular Player object. People use object and instance to mean the same thing.', ex: 'Player hero = new Player("Nova");' },
    'null': { kind: 'keyword', short: 'Nothing is there yet.', long: 'An object variable that has not been given an object yet holds <code>null</code>. Trying to use it causes an error, because there is nothing to talk to.', ex: 'Player hero = null;' },
    'toString': { kind: 'method', short: 'How an object describes itself as text.', long: 'If a class has a <code>toString()</code> method, Java uses it whenever the object is printed or joined onto a String. Handy for showing a status line.', ex: 'public String toString() { return name; }' },

    /* ---------- statements and control ---------- */
    'if': { kind: 'keyword', short: 'Run this block only when something is true.', long: 'Put a true/false test in the brackets. If it is true, the block in braces runs; if not, Java skips it. This is how a game makes decisions.', ex: 'if (health <= 0) {\n    System.out.println("Defeated");\n}' },
    'else': { kind: 'keyword', short: 'What to do when the if was false.', long: 'Attached to an <code>if</code>. Exactly one of the two blocks runs, never both.', ex: 'if (a) { } else { }' },
    'else if': { kind: 'keyword', short: 'Another test if the first one failed.', long: 'Lets you handle three or more outcomes. Java checks them top to bottom and runs the first true one, then skips the rest — so put the most specific test first.', ex: 'else if (health <= 10) { }' },
    'while': { kind: 'keyword', short: 'Repeat while something stays true.', long: 'The test is checked before every pass. Something inside the loop must move towards making the test false, or it repeats forever. This is the core of a game loop.', ex: 'while (health > 0) {\n    health = health - 10;\n}' },
    'for': { kind: 'keyword', short: 'Repeat a set number of times.', long: 'Three parts separated by semicolons: start value, test, and what to do after each pass. <code>for (int i = 1; i &lt;= 3; i++)</code> runs three times with i as 1, 2, 3.', ex: 'for (int i = 0; i < 3; i++) { }' },
    'for-each': { kind: 'idea', short: 'Do something to every item in a list.', long: 'Read <code>for (String item : items)</code> as "for each String, which I will call item, in items". Runs once per item, in order, with no counter to get wrong.', ex: 'for (String item : items) {\n    System.out.println(item);\n}' },
    'break': { kind: 'keyword', short: 'Jump out of the loop right now.', long: 'Stops the loop immediately, even if its test is still true, and carries on with the code after the loop.', ex: 'break;' },
    'continue': { kind: 'keyword', short: 'Skip to the next pass of the loop.', long: 'Abandons the rest of this pass but keeps looping. Useful for ignoring items that do not matter.', ex: 'continue;' },
    'true': { kind: 'value', short: 'The yes value of a boolean.', long: 'One of only two boolean values. <code>while (true)</code> would loop forever, which is why loops normally test something that can change.', ex: 'boolean alive = true;' },
    'false': { kind: 'value', short: 'The no value of a boolean.', long: 'The other boolean value. A comparison that does not hold produces false, for example <code>0 > 0</code>.', ex: 'boolean alive = false;' },
    'condition': { kind: 'idea', short: 'The true/false test in brackets.', long: 'The part an <code>if</code> or <code>while</code> checks. It must produce a boolean — a comparison, a boolean field, or a boolean method call.', ex: 'if (hero.isAlive()) { }' },
    'statement': { kind: 'idea', short: 'One instruction, ended with a semicolon.', long: 'A single step Java performs: declare something, change something, call a method. Statements run in order from top to bottom.', ex: 'health = health - 10;' },
    'block': { kind: 'idea', short: 'A group of statements inside braces.', long: 'Everything between <code>{</code> and <code>}</code>. Blocks group the lines that belong to a method, an if, or a loop.', ex: '{\n    doThis();\n    thenThis();\n}' },
    'scope': { kind: 'idea', short: 'Where a variable can be seen.', long: 'A variable declared inside a block only exists inside that block. Once the closing brace is passed, it is gone — which is why counters are declared before a loop if you need them afterwards.', ex: 'int round = 1;\nwhile (...) { round++; }' },

    /* ---------- printing ---------- */
    'System.out.println': { kind: 'method', short: 'Print a line of text, then start a new line.', long: 'The main way a text game talks to the player. <code>System</code> is a built-in class, <code>out</code> is the output screen, and <code>println</code> is "print line".', ex: 'System.out.println("Hello");' },
    'System.out.print': { kind: 'method', short: 'Print without starting a new line.', long: 'Same as println but the next print continues on the same line. Good for loading dots or building a row of symbols.', ex: 'System.out.print("Loading");' },
    'System': { kind: 'class', short: 'A built-in class for talking to the computer.', long: 'Java provides it automatically. You mostly use <code>System.out</code> for printing.', ex: 'System.out.println("hi");' },
    'out': { kind: 'field', short: 'The output screen inside System.', long: 'A ready-made object that represents the console window. It owns the <code>println</code> and <code>print</code> methods.', ex: 'System.out.println("hi");' },
    'printf': { kind: 'method', short: 'Print with placeholders.', long: 'Lets you insert values into a pattern: <code>%d</code> for a whole number, <code>%s</code> for text, <code>%.2f</code> for two decimals, <code>%n</code> for a new line.', ex: 'System.out.printf("HP: %d%n", 50);' },
    'concatenation': { kind: 'idea', short: 'Joining text together with +.', long: 'When either side of <code>+</code> is text, Java glues them into one String and turns numbers into text automatically. That is how <code>"HP: " + 100</code> becomes <code>HP: 100</code>.', ex: 'System.out.println("HP: " + health);' },

    /* ---------- operators and symbols ---------- */
    '=': { kind: 'symbol', short: 'Put a value into a variable.', long: 'Assignment, not equality. It takes the value on the right and stores it in the name on the left. Read it as "becomes".', ex: 'health = 80;' },
    '==': { kind: 'symbol', short: 'Are these two the same? (true/false)', long: 'A comparison, used inside conditions. Two equals signs, never one. For text, prefer <code>a.equals(b)</code>.', ex: 'if (health == 0) { }' },
    '!=': { kind: 'symbol', short: 'Are these two different?', long: 'True when the two values are not equal. The <code>!</code> means "not".', ex: 'if (name != null) { }' },
    '+': { kind: 'symbol', short: 'Add numbers, or join text.', long: 'With two numbers it adds. With text on either side it joins them into one String.', ex: '"HP: " + 100' },
    '-': { kind: 'symbol', short: 'Subtract.', long: 'Takes one number away from another. Used constantly for damage: <code>health = health - amount;</code>.', ex: 'health = health - 10;' },
    '*': { kind: 'symbol', short: 'Multiply.', long: 'Multiplies two numbers. Handy for critical hits or score multipliers.', ex: 'int crit = damage * 2;' },
    '/': { kind: 'symbol', short: 'Divide.', long: 'Divides two numbers. Careful: two whole numbers give a whole answer, so <code>7 / 2</code> is 3. Use a double if you want 3.5.', ex: 'int half = health / 2;' },
    '%': { kind: 'symbol', short: 'The remainder after dividing.', long: 'Called modulo. <code>7 % 2</code> is 1. Useful for "every third turn" style rules.', ex: 'if (round % 2 == 0) { }' },
    '<': { kind: 'symbol', short: 'Less than.', long: 'A comparison that produces true or false.', ex: 'if (health < 50) { }' },
    '>': { kind: 'symbol', short: 'Greater than.', long: 'A comparison that produces true or false.', ex: 'if (health > 0) { }' },
    '<=': { kind: 'symbol', short: 'Less than or equal to.', long: 'True when the left side is smaller than the right, or exactly the same. <code>health &lt;= 0</code> is the usual test for defeat.', ex: 'if (health <= 0) { }' },
    '>=': { kind: 'symbol', short: 'Greater than or equal to.', long: 'True when the left side is bigger than the right, or exactly the same.', ex: 'if (coins >= 10) { }' },
    '&&': { kind: 'symbol', short: 'And — both must be true.', long: 'Joins two conditions. <code>hero.isAlive() && foe.isAlive()</code> is only true while both are standing.', ex: 'if (a > 0 && b > 0) { }' },
    '||': { kind: 'symbol', short: 'Or — either one will do.', long: 'True when at least one side is true. Typed as two pipe characters.', ex: 'if (hasKey || isBoss) { }' },
    '!': { kind: 'symbol', short: 'Not — flips true and false.', long: 'Put it in front of a boolean to reverse it. <code>!hero.isAlive()</code> means "the hero is not alive".', ex: 'if (!hero.isAlive()) { }' },
    '++': { kind: 'symbol', short: 'Add one.', long: 'Shorthand for <code>x = x + 1</code>. Used to count rounds and loop steps.', ex: 'round++;' },
    '--': { kind: 'symbol', short: 'Take one away.', long: 'Shorthand for <code>x = x - 1</code>.', ex: 'lives--;' },
    '+=': { kind: 'symbol', short: 'Add to what is already there.', long: '<code>score += 10</code> is short for <code>score = score + 10</code>. There is also <code>-=</code>, <code>*=</code> and <code>/=</code>.', ex: 'score += 10;' },
    '-=': { kind: 'symbol', short: 'Subtract from what is already there.', long: '<code>health -= 10</code> is short for <code>health = health - 10</code>.', ex: 'health -= 10;' },
    ';': { kind: 'symbol', short: 'End of one instruction.', long: 'Every statement finishes with a semicolon — it is how Java knows one instruction has ended. Lines that open a block with <code>{</code> do not take one. A missing semicolon is the most common beginner error.', ex: 'int health = 100;' },
    '{}': { kind: 'symbol', short: 'Braces wrap a block of code.', long: 'They mark where a class, method, if or loop begins and ends. Every <code>{</code> needs a matching <code>}</code>, which is why code is indented — the shape shows the pairs.', ex: 'if (x) {\n    doIt();\n}' },
    '()': { kind: 'symbol', short: 'Brackets hold values or conditions.', long: 'After a method name they hold its parameters or arguments — empty brackets mean "no information needed". After <code>if</code> or <code>while</code> they hold the condition.', ex: 'attack()' },
    '[]': { kind: 'symbol', short: 'Square brackets are for arrays.', long: 'Used to declare an array type (<code>int[]</code>) and to read a position (<code>caves[0]</code>). Positions start at 0.', ex: 'Enemy[] caves;' },
    '.': { kind: 'symbol', short: 'Reach inside something.', long: 'The dot means "belonging to". <code>hero.health</code> is the hero\'s health field; <code>hero.attack()</code> calls the hero\'s attack method.', ex: 'hero.attack();' },
    ',': { kind: 'symbol', short: 'Separates items in a list.', long: 'Used between parameters, arguments and array items.', ex: 'new Enemy("Bat", 45, 9)' },
    '"': { kind: 'symbol', short: 'Double quotes mark text.', long: 'Everything between them is a String, printed exactly as written. Both quotes must be there, on the same line.', ex: '"Hello there"' },
    '//': { kind: 'symbol', short: 'A comment — Java ignores the rest of the line.', long: 'Notes for humans. Use them to explain why something is done, or to leave TODO reminders. They never affect the program.', ex: '// this is ignored' },
    '/* */': { kind: 'symbol', short: 'A comment across several lines.', long: 'Everything between <code>/*</code> and <code>*/</code> is ignored by Java, however many lines it covers.', ex: '/* long\n   note */' },

    /* ---------- list and string methods ---------- */
    'add': { kind: 'method', short: 'Put an item into a list.', long: 'An ArrayList method. <code>items.add("Potion")</code> puts the item on the end and the list grows by one.', ex: 'items.add("Potion");' },
    'get': { kind: 'method', short: 'Read the item at a position.', long: 'An ArrayList method. Positions start at 0, so <code>get(0)</code> is the first item. Asking for a position that does not exist causes an error.', ex: 'items.get(0)' },
    'size': { kind: 'method', short: 'How many items the list holds.', long: 'An ArrayList method that returns an int. Note the brackets: it is a method, unlike an array\'s <code>length</code>.', ex: 'items.size()' },
    'remove': { kind: 'method', short: 'Take an item out of the list.', long: 'Pass a position, or the item itself. The list shrinks and later items shuffle down.', ex: 'items.remove("Potion");' },
    'contains': { kind: 'method', short: 'Is this item in the list?', long: 'Returns a boolean, so it slots straight into an <code>if</code>. Great for key and quest checks.', ex: 'if (items.contains("Key")) { }' },
    'isEmpty': { kind: 'method', short: 'Is there nothing in it?', long: 'Returns true when the list (or String) has no contents. Reads better than <code>size() == 0</code>.', ex: 'if (items.isEmpty()) { }' },
    'length': { kind: 'field', short: 'How long a String or array is.', long: 'For a String it is a method: <code>name.length()</code>. For an array it is a field with no brackets: <code>caves.length</code>. That difference trips up everyone at first.', ex: 'caves.length' },
    'equals': { kind: 'method', short: 'Do these two Strings hold the same text?', long: 'The correct way to compare text. <code>name.equals("Nova")</code> returns a boolean. Use it instead of <code>==</code> for Strings in real Java.', ex: 'if (name.equals("Nova")) { }' },
    'toUpperCase': { kind: 'method', short: 'Make a String all capitals.', long: 'Returns a new upper-case String; the original is unchanged. There is also <code>toLowerCase()</code>.', ex: 'name.toUpperCase()' },
    'substring': { kind: 'method', short: 'Cut a piece out of a String.', long: '<code>substring(0, 4)</code> takes characters from position 0 up to (but not including) 4. Positions start at 0.', ex: '"Crystal".substring(0, 4)' },
    'charAt': { kind: 'method', short: 'Read one character of a String.', long: 'Returns the char at that position, counting from 0.', ex: '"Nova".charAt(0)' },
    'Math.random': { kind: 'method', short: 'A random decimal from 0 up to 1.', long: 'Multiply and cast to get a dice roll: <code>(int)(Math.random() * 6) + 1</code> gives 1 to 6. This is how you add luck to a battle.', ex: '(int)(Math.random() * 6) + 1' },
    'Math.max': { kind: 'method', short: 'The bigger of two numbers.', long: 'Handy for clamping: <code>health = Math.max(0, health - damage);</code> never lets health fall below zero. <code>Math.min</code> does the opposite.', ex: 'Math.max(0, health)' },
    'Integer.parseInt': { kind: 'method', short: 'Turn text into a whole number.', long: 'Converts <code>"42"</code> into <code>42</code>. If the text is not a number it fails with an error.', ex: 'Integer.parseInt("42")' },

    /* ---------- process words ---------- */
    'compile': { kind: 'idea', short: 'Turn your Java text into something the computer runs.', long: 'Real Java is compiled by <code>javac</code> into class files, then run with <code>java</code>. Errors caught at this stage are compile errors — usually typos or missing semicolons.', ex: 'javac Game.java' },
    'JDK': { kind: 'idea', short: 'The Java kit you install to compile and run code.', long: 'Java Development Kit. Once you finish the course, install a JDK (Temurin or Oracle) to run your game outside the browser.', ex: 'java Game' },
    'IDE': { kind: 'idea', short: 'An app for writing code.', long: 'Integrated Development Environment: an editor that understands Java and points out mistakes as you type. IntelliJ IDEA Community and VS Code are the popular free ones.', ex: '' },
    'camelCase': { kind: 'idea', short: 'The Java naming style.', long: 'Variables and methods start lower case and capitalise later words: <code>attackPower</code>, <code>takeDamage</code>. Classes start with a capital: <code>Player</code>. Java is case-sensitive, so <code>Health</code> and <code>health</code> are different names.', ex: 'int attackPower;' },
    'bug': { kind: 'idea', short: 'Code that runs but behaves wrongly.', long: 'Different from an error message. The program works, just not the way you meant — health going negative, or a loop running one time too many. Printing values as you go is the fastest way to find one.', ex: '' },
    'debug': { kind: 'idea', short: 'Hunting down why code misbehaves.', long: 'Add prints, run small pieces, and check one assumption at a time. Most bugs come from a value being different than you expected.', ex: 'System.out.println("here: " + health);' },
    'game loop': { kind: 'idea', short: 'The repeat that keeps a game running.', long: 'Every game repeats: read input, update the world, show the result. In a text game that is a <code>while</code> loop; in a graphics game the same loop runs sixty times a second.', ex: 'while (hero.isAlive()) { }' },
    /* ---------- level 2: inheritance and shapes ---------- */
    'super': { kind: 'keyword', short: 'The parent class version.', long: 'Two uses. <code>super(...)</code> inside a constructor runs the parent class constructor first, so the inherited fields get set up. <code>super.attack()</code> calls the parent version of a method you have overridden, which lets you add to its behaviour instead of replacing it.', ex: 'super(name, health);' },
    'protected': { kind: 'keyword', short: 'This class and its children can use it.', long: 'An access word that sits between public and private. A protected field can be used inside the class that declares it and inside any class that extends it, but not by unrelated code. Handy for fields a subclass needs, like health.', ex: 'protected int health;' },
    'abstract': { kind: 'keyword', short: 'Unfinished on purpose.', long: 'An abstract class cannot be built with <code>new</code> — it only exists to be extended. An abstract method has no body, just a signature and a semicolon, which forces every subclass to write its own version. Use it for a base like <code>Creature</code> that is never a real creature by itself.', ex: 'abstract class Creature {\n    abstract int attack();\n}' },
    'interface': { kind: 'keyword', short: 'A list of methods a class promises to have.', long: 'An interface names methods but writes no code for them. A class that says <code>implements Lootable</code> promises to provide every one of them. Because the promise is what matters, you can hold very different classes in one <code>Lootable[]</code> and call the same method on each.', ex: 'interface Lootable {\n    String drop();\n}' },
    'implements': { kind: 'keyword', short: 'This class keeps an interface\u2019s promise.', long: 'Written in the class header: <code>class Slime extends Creature implements Lootable</code>. Java then checks that you really did write every method the interface listed, and complains before the program runs if you missed one.', ex: 'class Slime implements Lootable { }' },
    'instanceof': { kind: 'keyword', short: 'Asks what kind of object this is.', long: 'Gives back true or false: <code>if (e instanceof Boss)</code> asks \u201cis this object a Boss?\u201d. Useful when a list holds mixed types and only some of them can do a certain thing.', ex: 'if (e instanceof Lootable) { }' },
    'inheritance': { kind: 'idea', short: 'A class getting everything another class has.', long: 'Write the shared parts once in a base class, then <code>extends</code> it. Every subclass starts with those fields and methods for free and only writes what makes it different. Less repeated code, and a fix in the base fixes every child.', ex: 'class Bat extends Creature { }' },
    'subclass': { kind: 'idea', short: 'The child class, the one that extends.', long: 'In <code>class Bat extends Creature</code>, Bat is the subclass and Creature is the superclass. A subclass may add new fields and methods and may override inherited ones.', ex: 'class Bat extends Creature { }' },
    'superclass': { kind: 'idea', short: 'The parent class, the one being extended.', long: 'The class whose fields and methods are handed down. Also called the base class or parent class. A subclass can reach its members with <code>super</code>.', ex: 'class Creature { }' },
    'override': { kind: 'idea', short: 'Replacing an inherited method with your own.', long: 'Write a method in the subclass with exactly the same name, parameters and return type as one in the superclass. Java then runs your version for that kind of object. This is how a Bat attacks differently from a Slime while both are Creatures.', ex: 'int attack() { return 15; }' },
    'polymorphism': { kind: 'idea', short: 'One name, many behaviours.', long: 'A long word for a simple trick: hold different subclasses in one variable or array of the base type, call the same method on each, and every object runs its own version. Your battle loop can then handle any creature you invent later without changing a line.', ex: 'Creature[] wave = { new Bat(), new Slime() };' },

    /* ---------- level 2: choices and maps ---------- */
    'enum': { kind: 'keyword', short: 'A fixed set of named values.', long: 'Perfect for things with a short list of options: game states, commands, phases. <code>enum State { PLAYING, WON, LOST }</code> creates exactly three values, so a typo becomes an error instead of a bug. Use <code>State.WON</code> to refer to one and <code>name()</code> to print it.', ex: 'enum State { PLAYING, WON, LOST }' },
    'switch': { kind: 'keyword', short: 'Choose one path out of many by value.', long: 'Compares one value against several <code>case</code> labels and jumps to the matching one. Clearer than a long if / else if chain when you are testing the same value over and over, such as a typed command.', ex: 'switch (cmd) {\n    case "ATTACK": fight(); break;\n}' },
    'case': { kind: 'keyword', short: 'One option inside a switch.', long: 'Marks a value to match: <code>case "REST":</code>. The lines under it run when the switch value equals that label, and keep running into the next case unless you write <code>break;</code>.', ex: 'case 1:\n    System.out.println("one");\n    break;' },
    'default': { kind: 'keyword', short: 'The catch-all case.', long: 'Runs when no <code>case</code> label matched — the switch version of a final <code>else</code>. Good for telling the player \u201cI do not know that command\u201d.', ex: 'default:\n    System.out.println("Unknown");' },
    'fall-through': { kind: 'idea', short: 'A case running into the next one.', long: 'Because a switch keeps going after a match, forgetting <code>break;</code> means the next case\u2019s lines also run. Sometimes that is exactly what you want (two commands sharing one action), but most of the time a missing break is a bug.', ex: 'case "N":\ncase "NORTH":\n    move();\n    break;' },
    'HashMap': { kind: 'type', short: 'Pairs of key and value you can look up.', long: 'A lookup table: give it a key and it hands back the value stored under that key. Ideal for a counted inventory (<code>HashMap&lt;String, Integer&gt;</code> of item name to how many) or a quest log. Needs <code>import java.util.HashMap;</code>.', ex: 'HashMap<String, Integer> bag = new HashMap<>();' },
    'Map': { kind: 'type', short: 'The general name for a key-to-value store.', long: '<code>Map</code> is the interface and <code>HashMap</code> is the common class that implements it, which is why you often see <code>Map&lt;String, Integer&gt; bag = new HashMap&lt;&gt;();</code>. Reading it as \u201ca map from name to number\u201d usually makes the line obvious.', ex: 'Map<String, Integer> bag = new HashMap<>();' },
    'key': { kind: 'idea', short: 'The label you look something up by.', long: 'In a map, the key is what you search with and the value is what comes back. Keys are unique: putting a second value under the same key replaces the first, which is why <code>put</code> doubles as \u201cupdate\u201d.', ex: 'bag.put("Potion", 2);' },
    'put': { kind: 'method', short: 'Store a value under a key.', long: 'Adds the pair to the map, or replaces the value if that key is already there. Counting something usually looks like read, add one, put back.', ex: 'bag.put("Potion", 3);' },
    'getOrDefault': { kind: 'method', short: 'Get the value, or a fallback if the key is missing.', long: 'Saves you writing an if. <code>bag.getOrDefault("Potion", 0)</code> gives the count if the item is in the bag, and 0 if it has never been picked up, so you can add one to it safely either way.', ex: 'int n = bag.getOrDefault(item, 0);' },
    'containsKey': { kind: 'method', short: 'Asks whether a key is in the map.', long: 'True or false. Use it before reading a value you are not sure exists, or to check whether the player owns an item at all.', ex: 'if (bag.containsKey("Key")) { }' },
    'keySet': { kind: 'method', short: 'All the keys, so you can loop over them.', long: 'Hands back every key in the map, which a for-each loop can walk through: for each name, look up its count and print the line. That is how you print a whole inventory.', ex: 'for (String name : bag.keySet()) { }' },
    'StringBuilder': { kind: 'type', short: 'A text box you keep adding to.', long: 'Building text in a loop with <code>+</code> makes a brand new String every time. A StringBuilder collects the pieces with <code>append</code> and hands you the finished text once with <code>toString()</code>. Perfect for drawing a health bar out of repeated characters.', ex: 'StringBuilder bar = new StringBuilder();' },
    'append': { kind: 'method', short: 'Add text to the end of a StringBuilder.', long: 'Each call sticks more on the end: characters, words, numbers. Nothing is printed until you turn the builder into a String.', ex: 'bar.append("#");' },
    'Random': { kind: 'type', short: 'A maker of random numbers.', long: 'Create one with <code>new Random()</code>, then ask it for numbers. Giving it a seed like <code>new Random(7)</code> makes it produce the same sequence every run, which is very useful while testing a game. Needs <code>import java.util.Random;</code>.', ex: 'Random rng = new Random(7);' },
    'nextInt': { kind: 'method', short: 'Ask for the next random whole number.', long: '<code>rng.nextInt(6)</code> gives a number from 0 up to 5 — the top number is never included. Add to it to shift the range, so <code>rng.nextInt(6) + 1</code> is a normal dice roll.', ex: 'int roll = rng.nextInt(6) + 1;' },

    /* ---------- level 3: safety, grids and order ---------- */
    'try': { kind: 'keyword', short: 'Attempt code that might fail.', long: 'Wraps risky lines. If something inside goes wrong, Java stops that block immediately and jumps to the matching <code>catch</code> instead of crashing the whole program.', ex: 'try {\n    move(row, col);\n}' },
    'catch': { kind: 'keyword', short: 'Deal with a failure instead of crashing.', long: 'Runs only when the try block threw a problem. The bracket names the kind of problem and gives it a variable, usually <code>e</code>, so you can print a friendly message with <code>e.getMessage()</code>.', ex: 'catch (Exception e) {\n    System.out.println(e.getMessage());\n}' },
    'finally': { kind: 'keyword', short: 'Runs either way, success or failure.', long: 'The block after try/catch that always runs, whether things went well or not. Use it for tidying up — closing something, or printing the line that should appear no matter what happened.', ex: 'finally {\n    System.out.println("Turn over.");\n}' },
    'throw': { kind: 'keyword', short: 'Report a problem on purpose.', long: 'You raise the alarm yourself: <code>throw new IllegalArgumentException("Off the map")</code>. Execution stops there and jumps to a catch. It is how a method refuses bad input rather than quietly doing the wrong thing.', ex: 'throw new IllegalArgumentException("Off the map");' },
    'exception': { kind: 'idea', short: 'An object describing something that went wrong.', long: 'When Java hits a problem it makes an exception object holding the message and where it happened, then looks for a catch that matches. Unhandled, it stops the program; caught, it becomes a message you control.', ex: 'catch (Exception e) { }' },
    'IllegalArgumentException': { kind: 'type', short: 'The problem for \u201cthat value is not allowed\u201d.', long: 'A ready-made exception type for bad input. Throwing it with a clear message is the standard way for a method to say the argument it was handed makes no sense, like a map position outside the grid.', ex: 'throw new IllegalArgumentException("row too big");' },
    'getMessage': { kind: 'method', short: 'The text inside an exception.', long: 'Reads back the message that was given when the exception was thrown, so your catch block can show the player what went wrong in plain words.', ex: 'System.out.println(e.getMessage());' },
    '2D array': { kind: 'idea', short: 'A grid of values: rows and columns.', long: 'An array whose items are themselves arrays, written with two sets of brackets: <code>char[][] map</code>. <code>map[1][3]</code> is row 1, column 3. <code>map.length</code> is the number of rows and <code>map[0].length</code> is the width of a row. Two nested loops walk the whole grid.', ex: 'char[][] map = new char[3][5];' },
    'row': { kind: 'idea', short: 'One line across a grid.', long: 'The first index of a 2D array picks the row, so <code>map[2]</code> is the third row down (counting from 0). Printing a whole row in one loop, then moving to the next line, is how you draw a map.', ex: 'char[] line = map[2];' },
    'column': { kind: 'idea', short: 'One position across a row.', long: 'The second index picks the column: <code>map[2][4]</code> is row 2, column 4. Moving left or right changes the column; moving up or down changes the row.', ex: 'char tile = map[2][4];' },
    'nested loop': { kind: 'idea', short: 'A loop inside another loop.', long: 'The outer loop runs once per row and the inner loop runs once per column, so together they visit every square of a grid. The inner loop finishes completely for each single step of the outer one.', ex: 'for (int r = 0; r < 3; r++) {\n    for (int c = 0; c < 5; c++) { }\n}' },
    'sort': { kind: 'idea', short: 'Put values in order.', long: 'A score table needs the biggest first. A simple way is a bubble sort: walk the list comparing neighbours, swap them when they are the wrong way round, and repeat until nothing needs swapping. Slow for huge lists, perfect for a leaderboard.', ex: 'if (score[i] < score[i + 1]) { }' },
    'swap': { kind: 'idea', short: 'Exchange two values.', long: 'You need a spare variable, because copying one straight over the other loses it: save a, put b into a, then put the saved value into b. This three-step move is the heart of every sorting routine.', ex: 'int t = a; a = b; b = t;' },
    'String.join': { kind: 'method', short: 'Glue text together with a separator.', long: 'Takes a joining string and some pieces, and returns one String with the separator between each piece. Neat for printing a list on one line.', ex: 'String.join(", ", "a", "b");' },
    'split': { kind: 'method', short: 'Cut a String into pieces.', long: 'Breaks text wherever the separator appears and hands back an array of the pieces. Reading a saved game line like <code>"Nova,70,3"</code> starts with a split on the comma.', ex: 'String[] parts = line.split(",");' },
    'index': { kind: 'idea', short: 'A position in a list or array, starting at 0.', long: 'The first item is at index 0, the second at 1. A list of 4 items has indexes 0 to 3, so index 4 causes an out-of-bounds error.', ex: 'items.get(0)' }
  };

  /* alias -> canonical term, so more words are clickable */
  const ALIAS = {
    'inherit': 'inheritance', 'inherits': 'inheritance', 'inheriting': 'inheritance',
    'base class': 'superclass', 'parent class': 'superclass', 'child class': 'subclass',
    'overriding': 'override', 'overrides': 'override', 'overridden': 'override',
    'interfaces': 'interface', 'enums': 'enum', 'cases': 'case', 'switches': 'switch',
    'hashmap': 'HashMap', 'maps': 'Map', 'map': 'Map', 'keys': 'key', 'values': 'key',
    'stringbuilder': 'StringBuilder', 'random': 'Random', 'randomness': 'Random',
    'seed': 'Random', 'exceptions': 'exception', 'error': 'exception',
    'throws': 'throw', 'throwing': 'throw', 'try catch': 'try', 'catching': 'catch',
    'two dimensional array': '2D array', '2d array': '2D array', 'grid': '2D array',
    'rows': 'row', 'columns': 'column', 'nested loops': 'nested loop',
    'bubble sort': 'sort', 'sorting': 'sort', 'sorted': 'sort', 'swapping': 'swap',
    'abstract class': 'abstract', 'abstract method': 'abstract',
    'super constructor': 'super', 'polymorphic': 'polymorphism',
    'println': 'System.out.println', 'print': 'System.out.print', 'system': 'System',
    'classes': 'class', 'objects': 'object', 'fields': 'field', 'methods': 'method',
    'constructors': 'constructor', 'parameters': 'parameter', 'arguments': 'argument',
    'variables': 'variable', 'strings': 'String', 'booleans': 'boolean', 'arrays': 'array',
    'integer': 'int', 'ints': 'int', 'doubles': 'double', 'loops': 'while', 'loop': 'while',
    'lists': 'ArrayList', 'list': 'ArrayList', 'semicolon': ';', 'braces': '{}', 'brace': '{}',
    'brackets': '()', 'bracket': '()', 'quotes': '"', 'comment': '//', 'comments': '//',
    'assignment': '=', 'return type': 'return', 'boolean expression': 'condition',
    'conditions': 'condition', 'statements': 'statement', 'blocks': 'block',
    'main method': 'main', 'concatenate': 'concatenation', 'joining': 'concatenation',
    'modulo': '%', 'not': '!', 'and': '&&', 'or': '||', 'items': 'ArrayList',
    'foreach': 'for-each', 'for each': 'for-each', 'clamp': 'Math.max', 'dot': '.'
  };

  /* ---------- question bank: matched on keywords, answered offline ---------- */
  const FAQ = [
    { q: 'What is inheritance and when should I use it?', k: ['inheritance', 'extends', 'what is inheritance', 'base class', 'parent class', 'subclass'],
      a: 'Inheritance means writing the shared parts once and building on them. If every creature in your game has a name, health and a takeDamage method, put those in one class such as <code>Creature</code>, then write <code>class Bat extends Creature</code>. Bat starts with all of it for free and only writes what makes a Bat different. Use it when two classes are clearly the same <i>kind</i> of thing. If they only share a little, plain fields or an interface are usually a better fit.' },
    { q: 'What does super do?', k: ['super', 'super()', 'what does super do', 'super.'],
      a: 'Two jobs. <code>super(name, health);</code> as the first line of a constructor runs the parent constructor so the inherited fields get filled in — Java insists this happens before your own setup. <code>super.describe();</code> calls the parent\u2019s version of a method you have overridden, so you can keep its behaviour and add to it instead of replacing it completely.' },
    { q: 'What is an abstract class?', k: ['abstract', 'abstract class', 'abstract method', 'why abstract'],
      a: 'A class marked <code>abstract</code> cannot be built with <code>new</code>. It exists only to be extended. That is useful for a base like <code>Creature</code>, because there is no such thing as a plain creature in your game — only slimes, bats and bosses. An <code>abstract int attack();</code> method has no body, which forces every subclass to write its own attack. Java then refuses to compile a subclass that forgot one.' },
    { q: 'What is the difference between an interface and a class?', k: ['interface', 'interface vs class', 'implements', 'what is an interface'],
      a: 'A class says what something <i>is</i> and holds real code. An interface only lists method names — a promise. A class that writes <code>implements Lootable</code> promises to provide every method the interface named, and Java checks it. The payoff is that completely unrelated classes can keep the same promise, so one <code>Lootable[]</code> can hold a slime, a chest and a boss and you can call <code>drop()</code> on all of them.' },
    { q: 'What is polymorphism, in plain words?', k: ['polymorphism', 'polymorphic', 'same method different result'],
      a: 'It means one call, many behaviours. Put a Slime, a Bat and a Boss into a <code>Creature[]</code>, loop over it and call <code>attack()</code> on each. Java looks at what each object really is and runs that class\u2019s version. Your battle loop never mentions Slime or Bat, so adding a new enemy later needs no change to the loop at all.' },
    { q: 'When should I use a switch instead of if / else?', k: ['switch', 'switch vs if', 'case', 'when to use switch'],
      a: 'Use a switch when you are testing the same single value against a list of fixed options — a typed command, a tile character, an enum state. It reads more cleanly than a long if / else if chain. Keep using <code>if</code> when the tests are ranges or different questions (<code>health &lt; 20 &amp;&amp; hasPotion</code>), which a switch cannot express. Remember <code>break;</code> at the end of each case, or the next case runs too.' },
    { q: 'What is an enum for?', k: ['enum', 'what is an enum', 'enum vs string', 'states'],
      a: 'An enum is a short fixed list of named values, like <code>enum State { PLAYING, WON, LOST }</code>. Using an enum instead of strings means a typo such as <code>State.WOM</code> is caught before the program runs, whereas <code>"wom"</code> would just silently fail to match. Enums work beautifully in a switch, and <code>name()</code> gives you the text for printing.' },
    { q: 'What is a HashMap and how is it different from an ArrayList?', k: ['hashmap', 'map', 'hashmap vs arraylist', 'key value', 'dictionary'],
      a: 'An ArrayList is a numbered row of items: you fetch by position, <code>items.get(0)</code>. A HashMap stores pairs, so you fetch by a label you chose: <code>bag.get("Potion")</code>. For a counted inventory that is exactly right, because the item name is the key and the count is the value. Counting one more usually reads <code>bag.put(item, bag.getOrDefault(item, 0) + 1);</code>.' },
    { q: 'How do try, catch and finally work?', k: ['try catch', 'try', 'catch', 'finally', 'exception', 'error handling'],
      a: 'Put risky lines inside <code>try</code>. If something goes wrong, Java abandons the rest of the try block and jumps to <code>catch</code>, where you can print <code>e.getMessage()</code> instead of letting the program crash. A <code>finally</code> block afterwards runs either way, which is where the line that must always appear belongs. You can also raise a problem yourself with <code>throw new IllegalArgumentException("...")</code> when a method is handed something impossible, like a move off the edge of the map.' },
    { q: 'How does a 2D array work?', k: ['2d array', 'two dimensional', 'grid', 'map array', 'rows and columns'],
      a: 'A 2D array is an array of arrays, so it behaves like a grid. <code>char[][] map</code> with <code>map[1][3]</code> means row 1, column 3, both counting from 0. <code>map.length</code> is the number of rows; <code>map[0].length</code> is how wide a row is. To draw it, use one loop for rows and a loop inside it for columns, printing each character, then a newline at the end of each row. Always check a move is inside the grid before you use the position, or Java will throw an out-of-bounds error.' },
    { q: 'How do I sort a leaderboard?', k: ['sort', 'sorting', 'bubble sort', 'leaderboard', 'high score order'],
      a: 'The simplest sort to write by hand is a bubble sort. Walk the array comparing each pair of neighbours; if they are in the wrong order, swap them; repeat the whole pass until you get through with no swaps. Swapping needs a spare variable: <code>int t = a[i]; a[i] = a[i+1]; a[i+1] = t;</code>. It is slow for thousands of items but perfect for a handful of scores, and writing it once makes sorting stop feeling like magic.' },
    { q: 'Why do my random numbers come out the same every run?', k: ['random', 'seed', 'nextint', 'same numbers', 'random same'],
      a: 'Because the course seeds the generator: <code>new Random(7)</code> always produces the same sequence. That is deliberate, so the example output matches what you see and a bug is repeatable. In a finished game you would write <code>new Random()</code> with no seed to get different results each time. Remember <code>nextInt(6)</code> gives 0 to 5, so a dice roll is <code>nextInt(6) + 1</code>.' },
    { q: 'Never written code before? Start here.', k: ['primer', 'never coded', 'never written code', 'start here', 'absolute beginner', 'know nothing', 'brand new'],
      a: 'A Java program is a set of written instructions the computer performs in order, top to bottom. Here is the smallest complete one, word by word:' +
         '<pre class="tex">public class Game {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}</pre>' +
         '<b>public</b> means anyone is allowed to use this. <b>class</b> starts a container for code; every single line of Java lives inside one. <b>Game</b> is the name you chose for that container. <b>{</b> opens a block and the matching <b>}</b> closes it, which is how Java knows what belongs to what. ' +
         '<b>static</b> means no object is needed to run this. <b>void</b> means this hands no value back. <b>main</b> is the special name Java looks for when it starts your program. <b>(String[] args)</b> is a list of words someone could type at launch; you never use it here, but Java insists it is written. ' +
         '<b>System.out.println("Hello")</b> prints the text Hello and then moves to a new line. <b>;</b> marks the end of one instruction. ' +
         'That is the whole shape. Everything else in this course is extra lines placed inside it, and you can tap any highlighted word on the page to get its meaning.' },
    { q: 'What is Java and why does it look so wordy?', k: ['what is java', 'why java', 'wordy', 'verbose', 'why so long'],
      a: 'Java is a language that insists you say exactly what you mean: what type every value is, what class every piece of code lives in, where every block starts and ends. That makes it wordy to write but very hard to break by accident, which is why it is used for big apps, Android and Minecraft. Once you know the shape of a class, the wordiness becomes reassuring — every Java file looks the same.' },
    { q: 'Why does every program need a class and a main method?', k: ['why class', 'why main', 'need main', 'entry point'],
      a: 'Java has a rule: all code lives inside a class. When you run a program, Java has to know where to start, so it looks for the method spelled exactly <code>public static void main(String[] args)</code>. Everything your game does starts as a line inside main, or a method that main calls.' },
    { q: 'What is the difference between = and ==?', k: ['= vs ==', 'difference between = and ==', 'one equals', 'two equals', 'double equals'],
      a: '<code>=</code> stores a value: <code>health = 80;</code> means "health becomes 80". <code>==</code> asks a question: <code>health == 80</code> is true or false. Assignment goes in normal statements; comparison goes inside <code>if</code> and <code>while</code> brackets.' },
    { q: 'Why do some lines end in a semicolon and others do not?', k: ['semicolon', 'why ;', 'missing semicolon', 'end of line'],
      a: 'A semicolon ends one instruction, so any line that <i>does</i> something takes one: declaring a variable, changing a value, calling a method. Lines that open a block instead — <code>class X {</code>, <code>if (...) {</code>, <code>while (...) {</code>, a method header — end with <code>{</code> and take no semicolon. A closing <code>}</code> never takes one either.' },
    { q: 'What is the difference between a field and a variable?', k: ['field vs variable', 'field or variable', 'local variable'],
      a: 'They are both named boxes for values. A field is declared straight inside a class, so it belongs to the object and lasts as long as the object does. A variable declared inside a method is local: it disappears the moment the method finishes.' },
    { q: 'What does static actually mean?', k: ['static', 'what is static', 'why static'],
      a: 'Static means "belongs to the class, not to one object". <code>Screen.showTitle()</code> works with no object because showTitle is static. <code>hero.attack()</code> needs an object because attack is not static — it uses that particular hero\'s attackPower. <code>main</code> must be static because Java runs it before any object exists.' },
    { q: 'What is the difference between void and int in front of a method?', k: ['void vs int', 'what is void', 'return type', 'why void'],
      a: 'That word is the return type — what the method hands back. <code>int attack()</code> promises a whole number, so it must contain a <code>return</code> with a number. <code>void takeDamage(int amount)</code> promises nothing back; it just changes something. Trying to store the result of a void method is an error.' },
    { q: 'What does this. mean and when do I need it?', k: ['this', 'what does this mean', 'this.name', 'why this'],
      a: '<code>this</code> is the object the code is currently running inside. You need it when a parameter has the same name as a field: in <code>Player(String name)</code>, plain <code>name</code> means the parameter, and <code>this.name</code> means the field. Writing <code>name = name;</code> would just assign the parameter to itself and leave the field empty.' },
    { q: 'What is the difference between a class and an object?', k: ['class vs object', 'blueprint', 'what is an object', 'instance'],
      a: 'The class is the blueprint; the object is the thing built from it. <code>class Player</code> describes that every player has a name and health. <code>new Player("Nova")</code> builds one real hero. From one class you can build as many objects as you like, each with its own values.' },
    { q: 'What is a constructor for?', k: ['constructor', 'what is a constructor', 'why constructor'],
      a: 'It runs once, automatically, when you write <code>new</code>, and its job is to fill in the starting values of an object. It has the same name as the class and no return type. Without one you would have to set every field by hand and would eventually forget one.' },
    { q: 'Why does 7 / 2 give 3 instead of 3.5?', k: ['7/2', 'division wrong', 'integer division', 'decimal', 'rounding'],
      a: 'When both sides of <code>/</code> are whole numbers, Java does whole-number division and throws the remainder away. Make one side a double to get decimals: <code>7.0 / 2</code> is 3.5. Or use <code>%</code> if what you actually wanted was the remainder.' },
    { q: 'What is the difference between a String and a char?', k: ['string vs char', 'single quotes', 'double quotes', 'char'],
      a: '<code>String</code> is text of any length in double quotes: <code>"Nova"</code>. <code>char</code> is exactly one character in single quotes: <code>\'N\'</code>. Using single quotes around a word is a common early error.' },
    { q: 'How do I compare two pieces of text?', k: ['compare string', 'string equals', 'text same', 'equals vs =='],
      a: 'Use <code>a.equals(b)</code>, which returns true or false: <code>if (name.equals("Nova"))</code>. In real Java, <code>==</code> on Strings compares whether they are the same object in memory, which is not what you usually mean. Add <code>equalsIgnoreCase</code> when capitals should not matter.' },
    { q: 'How do I stop health going below zero?', k: ['negative health', 'below zero', 'clamp', 'health negative'],
      a: 'Guard it right after you subtract: <code>if (health &lt; 0) { health = 0; }</code>. A shorter version is <code>health = Math.max(0, health);</code>. Do it inside <code>takeDamage</code> so every part of the game gets the protection for free.' },
    { q: 'Why is my loop running forever?', k: ['infinite loop', 'endless loop', 'loop forever', 'never stops', 'ran too long'],
      a: 'The condition never becomes false. Check three things: does something inside the loop change the value being tested, does it change in the right direction, and can it actually reach the stopping point? Printing the tested value inside the loop shows you instantly. This app stops runaway loops for you instead of freezing.' },
    { q: 'What is the difference between while and for?', k: ['while vs for', 'which loop', 'for or while'],
      a: 'Use <code>while</code> when you do not know how many passes you need — "keep fighting until someone falls". Use <code>for</code> when you do — "print three lines". Use a for-each loop when you want to visit every item in a list. They can all be rewritten as each other; pick the one that reads most clearly.' },
    { q: 'What does "Cannot find the variable" mean?', k: ['cannot find', 'cannot find symbol', 'not declared', 'unknown variable'],
      a: 'Java has never seen that name in this place. Usual causes: a typo or wrong capitals (<code>Health</code> is not <code>health</code>), you forgot the declaration line with its type, or the variable was declared inside a different block and its scope has ended. Declare it before you use it, in a block that surrounds the use.' },
    { q: 'What does the error about a missing closing brace mean?', k: ['missing brace', 'missing }', 'unbalanced', 'expected }'],
      a: 'Every <code>{</code> needs a matching <code>}</code>. Because braces nest, one missing brace makes the rest of the file look wrong. Indentation is your friend: line up each closing brace under the line that opened it, and the gap shows up.' },
    { q: 'What is an ArrayList and how is it different from an array?', k: ['arraylist vs array', 'what is arraylist', 'list difference'],
      a: 'An array has a fixed size decided when you create it: <code>Enemy[] caves = { ... }</code>. An ArrayList grows and shrinks with <code>add</code> and <code>remove</code>, which suits an inventory. Arrays use <code>caves.length</code> and <code>caves[0]</code>; lists use <code>items.size()</code> and <code>items.get(0)</code>.' },
    { q: 'Why do lists start counting at 0?', k: ['start at 0', 'zero index', 'index out of bounds', 'first item'],
      a: 'Positions are counted as offsets from the start, so the first item sits at offset 0. A list of 4 items therefore has valid positions 0, 1, 2 and 3, and asking for 4 is out of bounds. When looping, that is why you write <code>i &lt; items.size()</code> rather than <code>&lt;=</code>.' },
    { q: 'How do I get keyboard input from the player?', k: ['input', 'scanner', 'keyboard', 'type in', 'user input'],
      a: 'Real Java uses <code>Scanner</code>: <code>Scanner in = new Scanner(System.in);</code> then <code>String choice = in.nextLine();</code>. This app cannot read your keyboard mid-program, so the course uses fixed values instead. When you run the finished game with a real JDK, adding a Scanner is your first upgrade.' },
    { q: 'How do I add randomness, like dice rolls or critical hits?', k: ['random', 'dice', 'chance', 'critical hit', 'luck'],
      a: '<code>Math.random()</code> gives a decimal from 0 up to 1. For a 1-6 roll: <code>int roll = (int)(Math.random() * 6) + 1;</code>. For a 25% crit: <code>if (Math.random() &lt; 0.25) { damage = damage * 2; }</code>. Try it in any example editor.' },
    { q: 'How do I run this game for real, outside the browser?', k: ['run for real', 'jdk', 'install java', 'outside browser', 'compile', 'my computer'],
      a: 'Install a JDK (Temurin or Oracle) and an editor like IntelliJ IDEA Community or VS Code. Copy the full source from "Play my game", save it as <code>Game.java</code>, then run <code>javac Game.java</code> followed by <code>java Game</code> in a terminal. On a Mac, terminal commands live in the Terminal app.' },
    { q: 'Is this real Java, or a simplified version?', k: ['real java', 'is this real', 'fake java', 'simplified', 'accurate'],
      a: 'The code you write is real Java and will compile with a real JDK. The runner built into this app understands the part of Java the course uses — classes, fields, methods, if, loops, arrays and ArrayList — so it can give you instant output. A few advanced features (threads, generics beyond lists, file access, keyboard input) are not supported here.' },
    { q: 'How do I make this a game with graphics instead of text?', k: ['graphics', '2d', 'libgdx', 'window', 'sprites', 'javafx'],
      a: 'Keep this logic and put a graphics layer on top. The usual Java routes are LibGDX (2D and 3D games, used commercially), JavaFX (windows and simple shapes), or Swing for quick experiments. Your Player, Enemy and Battle classes barely change — only the drawing and input parts are new.' },
    { q: 'What should I learn after this course?', k: ['what next', 'after this', 'next steps', 'keep learning'],
      a: 'Four good next steps: Scanner input so the player makes choices, inheritance (<code>class Boss extends Enemy</code>) so enemy types share code, <code>switch</code> and enums for cleaner menus, and saving progress to a file. After that, pick LibGDX and rebuild Crystal Run with sprites.' },
    { q: 'Why is my code correct but nothing prints?', k: ['nothing prints', 'no output', 'blank output', 'nothing happens'],
      a: 'Three usual causes: there is no <code>System.out.println</code> in the path that runs, the method containing your prints is never called from <code>main</code>, or a loop or <code>if</code> condition is false so its block is skipped. Add a print as the very first line of the method to see whether it runs at all.' },
    { q: 'What is the difference between a method and a constructor?', k: ['method vs constructor', 'constructor or method'],
      a: 'A constructor has the same name as the class, has no return type, and runs only once when the object is made. A method has its own name, has a return type (or <code>void</code>), and can be called as often as you like.' },
    { q: 'Why do I write hero.attack() with brackets but hero.health without?', k: ['brackets or not', 'why brackets', 'method vs field access'],
      a: 'Brackets mean "do this job". <code>hero.attack()</code> calls a method and the brackets hold any information it needs. <code>hero.health</code> reads a field, which is just a stored value, so there is nothing to hand over and no brackets.' },
    { q: 'What does public mean, and do I always need it?', k: ['public', 'why public', 'private vs public'],
      a: '<code>public</code> means other code is allowed to use this. Java requires it on the class holding <code>main</code>. For a small game you can leave it off other classes, which quietly makes them usable inside the same file. In bigger projects fields are often <code>private</code> so only their own class can change them.' },
    { q: 'How do I explain a line I do not understand?', k: ['explain line', 'what does this line do', 'line by line', 'explain code'],
      a: 'Open the Explain tab in this panel: it breaks the code currently in your editor into lines and describes each one in plain English. Clicking any highlighted word anywhere in the course opens its dictionary entry too.' }
  ];

  /* ---------- offline answer engine ---------- */
  const STOP = ' a an the is are do does did what why how when which that this it in on of to for my me i can with does'.split(' ');

  function normalise(s) { return String(s).toLowerCase().replace(/[^a-z0-9+\-*/%<>=!.&|;{}()\[\]" ]/g, ' ').replace(/\s+/g, ' ').trim(); }

  function findTerm(word) {
    if (!word) return null;
    const w = String(word).trim();
    if (G[w]) return w;
    const lower = w.toLowerCase();
    if (ALIAS[lower]) return ALIAS[lower];
    const hit = Object.keys(G).find(k => k.toLowerCase() === lower);
    return hit || null;
  }

  function answer(question) {
    const q = normalise(question);
    if (!q) return null;
    const words = q.split(' ').filter(w => w && STOP.indexOf(w) < 0);

    /* 1. FAQ scoring */
    let best = null, bestScore = 0;
    FAQ.forEach(item => {
      let score = 0;
      item.k.forEach(key => { if (q.indexOf(key) >= 0) score += key.split(' ').length * 3 + 3; });
      const qwords = normalise(item.q).split(' ');
      words.forEach(w => { if (qwords.indexOf(w) >= 0) score += 1; if (item.k.join(' ').indexOf(w) >= 0) score += 1; });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    if (best && bestScore >= 4) return { type: 'faq', title: best.q, body: best.a, score: bestScore };

    /* 2. dictionary lookup — longest matching term wins */
    const terms = Object.keys(G).concat(Object.keys(ALIAS));
    let termHit = null;
    terms.forEach(t => {
      const tl = t.toLowerCase();
      const isWordy = /^[a-z]/i.test(tl);
      const found = isWordy ? new RegExp('(^|[^a-z0-9])' + tl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(q) : q.indexOf(tl) >= 0;
      if (found && (!termHit || tl.length > termHit.length)) termHit = tl;
    });
    if (termHit) {
      const key = findTerm(termHit);
      if (key) return { type: 'term', term: key, entry: G[key], score: 3 };
    }
    if (best) return { type: 'faq', title: best.q, body: best.a, score: bestScore, weak: true };
    return null;
  }

  global.GLOSSARY = { terms: G, alias: ALIAS, faq: FAQ, findTerm: findTerm, answer: answer };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.GLOSSARY;
})(typeof window !== 'undefined' ? window : globalThis);
