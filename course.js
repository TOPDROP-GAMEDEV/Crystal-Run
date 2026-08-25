/* Course content for CRYSTAL RUN — learn Java by building one game.
   Each section: 3-4 worked examples (read → run → tweak), then a Build task
   that writes one real part of the finished game. */
(function (global) {

  /* ---- reference code for each section (used as context + fallback) ---- */
  const REF = {
    screen: `class Screen {
    static void showTitle() {
        System.out.println("==============================");
        System.out.println("      C R Y S T A L   R U N   ");
        System.out.println("==============================");
        System.out.println("Reach the Crystal. Survive the caves.");
        System.out.println("");
    }
}`,
    player: `class Player {
    String name;
    int health;
    int attackPower;

    Player(String name) {
        this.name = name;
        this.health = 100;
        this.attackPower = 14;
    }

    int attack() {
        return attackPower;
    }

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
    }

    boolean isAlive() {
        return health > 0;
    }

    String status() {
        return name + " [" + health + " HP]";
    }
}`,
    enemy: `class Enemy {
    String name;
    int health;
    int damage;

    Enemy(String name, int health, int damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
    }

    boolean isAlive() {
        return health > 0;
    }
}`,
    backpack: `import java.util.ArrayList;

class Backpack {
    ArrayList<String> items = new ArrayList<>();

    void add(String item) {
        items.add(item);
        System.out.println("Picked up: " + item);
    }

    void show() {
        System.out.println("Backpack (" + items.size() + " items):");
        for (String item : items) {
            System.out.println(" - " + item);
        }
    }
}`,
    battle: `class Battle {
    static void reportRound(Player hero, Enemy foe) {
        if (foe.health <= 0) {
            System.out.println(">> " + foe.name + " is defeated!");
        } else if (foe.health <= 10) {
            System.out.println(">> " + foe.name + " is badly hurt (" + foe.health + " HP)");
        } else {
            System.out.println(">> " + foe.name + " has " + foe.health + " HP left");
        }
    }

    static void fight(Player hero, Enemy foe) {
        System.out.println("A wild " + foe.name + " blocks the path!");
        int round = 1;
        while (hero.isAlive() && foe.isAlive()) {
            System.out.println("-- Round " + round + " --");
            foe.takeDamage(hero.attack());
            reportRound(hero, foe);
            if (foe.isAlive()) {
                hero.takeDamage(foe.damage);
                System.out.println("   " + hero.status());
            }
            round++;
        }
        System.out.println("");
    }
}`,
    game: `public class Game {
    public static void main(String[] args) {
        Screen.showTitle();

        Player hero = new Player("Nova");
        Backpack bag = new Backpack();
        bag.add("Rusty Sword");

        Enemy[] caves = { new Enemy("Cave Slime", 30, 6), new Enemy("Stone Bat", 45, 9), new Enemy("Crystal Guardian", 70, 14) };

        for (Enemy foe : caves) {
            Battle.fight(hero, foe);
            if (!hero.isAlive()) {
                System.out.println("You fell in the caves. Game over.");
                return;
            }
            bag.add(foe.name + " Shard");
        }

        bag.show();
        System.out.println("");
        System.out.println(hero.status() + " reached the Crystal. YOU WIN!");
    }
}`
  };

  /* a cut-down Player used as context before section 3 adds methods */
  const PLAYER_BASIC = `class Player {
    String name;
    int health;
    int attackPower;

    Player(String name) {
        this.name = name;
        this.health = 100;
        this.attackPower = 14;
    }
}`;

  const SECTIONS = [
    /* ============ 1 ============ */
    {
      id: 'screen',
      title: 'The title screen',
      goal: 'Print the opening screen of Crystal Run',
      concepts: ['class', 'main method', 'System.out.println', 'String', 'static method'],
      brief: 'Every Java program starts in one place: <code>main</code>. In this section you learn how Java prints text, then you write the title screen your game opens with.',
      examples: [
        {
          title: 'Every program needs main',
          teach: 'A <b>class</b> is a container for code. Inside it, <code>main</code> is the starting line — Java runs the statements between its braces, top to bottom. <code>System.out.println(...)</code> prints one line.',
          code: `public class Game {
    public static void main(String[] args) {
        System.out.println("Loading Crystal Run...");
        System.out.println("Ready.");
    }
}`,
          tryThis: 'Add a third println with your own message, then run it again. Notice each println starts a new line.'
        },
        {
          title: 'Text, symbols and blank lines',
          teach: 'Anything inside double quotes is a <b>String</b> — Java prints it exactly. An empty string <code>""</code> prints a blank line, which is how you space out a screen.',
          code: `public class Game {
    public static void main(String[] args) {
        System.out.println("==============================");
        System.out.println("      C R Y S T A L   R U N   ");
        System.out.println("==============================");
        System.out.println("");
        System.out.println("Press start (in your imagination).");
    }
}`,
          tryThis: 'Design your own banner: change the symbols and the game name. Keep the line lengths matching so the box looks straight.'
        },
        {
          title: 'print vs println',
          teach: '<code>print</code> stays on the same line, <code>println</code> ends the line. Use <code>+</code> to join Strings together — that is called <b>concatenation</b>.',
          code: `public class Game {
    public static void main(String[] args) {
        System.out.print("Loading");
        System.out.print("...");
        System.out.println(" done!");
        System.out.println("Made by " + "you" + " in Java");
    }
}`,
          tryThis: 'Make the loading dots longer, and put your own name in the last line.'
        },
        {
          title: 'Wrapping code in a method',
          teach: 'A <b>method</b> is a named block of code you can call whenever you want. <code>static void showTitle()</code> means: belongs to the class, returns nothing, takes no information. <code>Screen.showTitle();</code> runs it.',
          code: `class Screen {
    static void showTitle() {
        System.out.println("=== CRYSTAL RUN ===");
    }
}

public class Game {
    public static void main(String[] args) {
        Screen.showTitle();
        System.out.println("The caves are quiet...");
        Screen.showTitle();
    }
}`,
          tryThis: 'Call <code>Screen.showTitle();</code> three times in a row. One method, reused — that is why methods exist.'
        }
      ],
      build: {
        label: 'title screen',
        brief: 'Write the real title screen for Crystal Run. Fill in <code>showTitle()</code> so it prints a banner, the game name, and a one-line tagline.',
        checks: [
          ['class Screen', 'Keep the <code>Screen</code> class.'],
          ['static void showTitle', 'Keep the <code>showTitle()</code> method.'],
          ['System.out.println', 'Print at least one line with <code>System.out.println</code>.']
        ],
        minPrints: 3,
        starter: `class Screen {
    static void showTitle() {
        // TODO: print a banner line of = signs
        // TODO: print the game name
        // TODO: print another banner line
        // TODO: print a tagline, then a blank line
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Screen.showTitle();
    }
}`,
        reference: REF.screen
      }
    },

    /* ============ 2 ============ */
    {
      id: 'player',
      title: 'Create the hero',
      goal: 'Build the Player class with fields and a constructor',
      concepts: ['variables', 'int / String', 'fields', 'objects', 'constructor', 'this'],
      brief: 'A game needs a hero that remembers things: a name, health, attack power. In Java, a value with a name is a <b>variable</b>, and an object is a bundle of variables that belong together.',
      examples: [
        {
          title: 'Variables hold game values',
          teach: 'Declare a variable with a <b>type</b> then a name: <code>int</code> for whole numbers, <code>String</code> for text, <code>boolean</code> for true/false. You can change a variable later.',
          code: `public class Game {
    public static void main(String[] args) {
        String name = "Nova";
        int health = 100;
        boolean alive = true;

        System.out.println(name + " starts with " + health + " HP");

        health = health - 25;
        System.out.println("After a trap: " + health + " HP");
        System.out.println("Still alive? " + alive);
    }
}`,
          tryThis: 'Add <code>int attackPower = 14;</code> and print a line like <code>Nova hits for 14</code>.'
        },
        {
          title: 'A class as a blueprint',
          teach: 'A class can describe a <i>thing</i>, not just a program. Variables that live inside a class are called <b>fields</b>. <code>new Player()</code> builds one object from the blueprint.',
          code: `class Player {
    String name;
    int health;
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        hero.name = "Nova";
        hero.health = 100;

        System.out.println(hero.name + " has " + hero.health + " HP");
    }
}`,
          tryThis: 'Create a second player object called <code>rival</code> with a different name and health, and print both.'
        },
        {
          title: 'Constructors set an object up',
          teach: 'Setting fields by hand is slow and easy to forget. A <b>constructor</b> runs the moment an object is created. It has the same name as the class and no return type. <code>this.name</code> means "this object\'s name field".',
          code: `class Player {
    String name;
    int health;

    Player(String name) {
        this.name = name;
        this.health = 100;
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player("Nova");
        Player rival = new Player("Kade");

        System.out.println(hero.name + ": " + hero.health + " HP");
        System.out.println(rival.name + ": " + rival.health + " HP");
    }
}`,
          tryThis: 'Change the constructor to <code>Player(String name, int health)</code> and set <code>this.health = health;</code>. Then create a hero with 60 HP.'
        }
      ],
      build: {
        label: 'Player class',
        brief: 'Build the real hero of Crystal Run. <code>Player</code> needs three fields — <code>name</code>, <code>health</code>, <code>attackPower</code> — and a constructor that takes a name, sets health to 100 and attackPower to 14.',
        checks: [
          ['class Player', 'Keep the <code>Player</code> class.'],
          ['String name', 'Add a <code>String name</code> field.'],
          ['int health', 'Add an <code>int health</code> field.'],
          ['int attackPower', 'Add an <code>int attackPower</code> field.'],
          ['Player(', 'Write a constructor called <code>Player(String name)</code>.'],
          ['this.', 'Use <code>this.</code> inside the constructor to set the fields.']
        ],
        starter: `class Player {
    // TODO: name field (String)
    // TODO: health field (int)
    // TODO: attackPower field (int)

    Player(String name) {
        // TODO: set this.name from the name given
        // TODO: set this.health to 100
        // TODO: set this.attackPower to 14
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Player hero = new Player("Nova");
        System.out.println("name        = " + hero.name);
        System.out.println("health      = " + hero.health);
        System.out.println("attackPower = " + hero.attackPower);
    }
}`,
        expect: ['name        = Nova', 'health      = 100', 'attackPower = 14'],
        expectMsg: 'The hero should print name Nova, health 100 and attackPower 14. Check the values you set in the constructor.',
        reference: REF.player
      }
    },

    /* ============ 3 ============ */
    {
      id: 'actions',
      title: 'Give the hero actions',
      goal: 'Add attack(), takeDamage() and isAlive() to Player',
      concepts: ['methods', 'parameters', 'return', 'void', 'boolean'],
      brief: 'Fields are what an object <i>is</i>. Methods are what it <i>does</i>. Now you give the hero the three actions every fight needs: deal damage, take damage, and check if they are still standing.',
      examples: [
        {
          title: 'Methods that return a value',
          teach: 'A method\'s <b>return type</b> comes before its name. <code>int attack()</code> promises to hand back a whole number. <code>return</code> sends the value out and ends the method.',
          code: `class Player {
    int attackPower = 14;

    int attack() {
        return attackPower;
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        int damage = hero.attack();
        System.out.println("Hero hits for " + damage);
        System.out.println("Twice would be " + (hero.attack() + hero.attack()));
    }
}`,
          tryThis: 'Change <code>attack()</code> to <code>return attackPower * 2;</code> for a critical hit, and watch both printed numbers change.'
        },
        {
          title: 'Parameters pass information in',
          teach: 'A <b>parameter</b> is a value you hand to a method. <code>void</code> means the method returns nothing — it just changes something. Here the object changes its own field.',
          code: `class Player {
    int health = 100;

    void takeDamage(int amount) {
        health = health - amount;
        System.out.println("Took " + amount + " damage, now " + health + " HP");
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        hero.takeDamage(12);
        hero.takeDamage(30);
        hero.takeDamage(9);
    }
}`,
          tryThis: 'Add a <code>void heal(int amount)</code> method and use it between two hits.'
        },
        {
          title: 'Returning true or false',
          teach: 'A <code>boolean</code> method answers a yes/no question. <code>health > 0</code> is a comparison that already produces true or false, so you can return it directly.',
          code: `class Player {
    int health = 100;

    boolean isAlive() {
        return health > 0;
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        System.out.println("Alive at start? " + hero.isAlive());
        hero.health = 0;
        System.out.println("Alive at 0 HP?  " + hero.isAlive());
    }
}`,
          tryThis: 'Add <code>boolean isHurt()</code> that returns <code>health &lt; 50</code>, and test it at a few health values.'
        },
        {
          title: 'Methods calling methods',
          teach: 'Objects get powerful when methods work together. A method can build a String out of the object\'s own fields, so printing stays tidy everywhere else.',
          code: `class Player {
    String name = "Nova";
    int health = 100;

    void takeDamage(int amount) {
        health = health - amount;
    }

    String status() {
        return name + " [" + health + " HP]";
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        System.out.println(hero.status());
        hero.takeDamage(35);
        System.out.println(hero.status());
    }
}`,
          tryThis: 'Change <code>status()</code> to add a warning when health is low, for example ending with <code>" -- LOW!"</code>.'
        }
      ],
      build: {
        label: 'hero actions',
        brief: 'Add four methods to your hero: <code>attack()</code> returns the attack power, <code>takeDamage(int amount)</code> subtracts health and never drops below 0, <code>isAlive()</code> returns whether health is above 0, and <code>status()</code> returns a text summary.',
        checks: [
          ['int attack()', 'Write <code>int attack()</code>.'],
          ['return', 'Use <code>return</code> to send values back.'],
          ['takeDamage', 'Write <code>void takeDamage(int amount)</code>.'],
          ['boolean isAlive', 'Write <code>boolean isAlive()</code>.'],
          ['String status', 'Write <code>String status()</code>.']
        ],
        starter: PLAYER_BASIC.replace(/\n}$/, `
    int attack() {
        // TODO: return attackPower
        return 0;
    }

    void takeDamage(int amount) {
        // TODO: subtract amount from health
        // TODO: if health went below 0, set it to 0
    }

    boolean isAlive() {
        // TODO: return true while health is above 0
        return false;
    }

    String status() {
        // TODO: return something like "Nova [100 HP]"
        return "";
    }
}`),
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Player hero = new Player("Nova");
        System.out.println("attack   = " + hero.attack());
        hero.takeDamage(30);
        System.out.println("status   = " + hero.status());
        hero.takeDamage(500);
        System.out.println("health   = " + hero.health);
        System.out.println("isAlive  = " + hero.isAlive());
    }
}`,
        expect: ['attack   = 14', 'health   = 0', 'isAlive  = false'],
        expectMsg: 'Expected attack 14, health clamped to 0 after a huge hit, and isAlive false at 0 HP.',
        reference: REF.player
      }
    },

    /* ============ 4 ============ */
    {
      id: 'enemy',
      title: 'Fill the caves with enemies',
      goal: 'Build the Enemy class with a multi-parameter constructor',
      concepts: ['reuse', 'multiple parameters', 'objects interacting'],
      brief: 'One blueprint, many monsters. An <code>Enemy</code> class with a constructor that takes name, health and damage lets you create a slime, a bat and a boss from the same code.',
      examples: [
        {
          title: 'A constructor with three parameters',
          teach: 'Parameters are separated by commas and must be given in the same order when you create the object. Every object keeps its own copy of the fields.',
          code: `class Enemy {
    String name;
    int health;
    int damage;

    Enemy(String name, int health, int damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }
}

public class Game {
    public static void main(String[] args) {
        Enemy slime = new Enemy("Cave Slime", 30, 6);
        Enemy boss = new Enemy("Crystal Guardian", 70, 14);

        System.out.println(slime.name + ": " + slime.health + " HP, hits " + slime.damage);
        System.out.println(boss.name + ": " + boss.health + " HP, hits " + boss.damage);
    }
}`,
          tryThis: 'Invent a third enemy of your own and print it. Try swapping two arguments around and notice how wrong the output looks — order matters.'
        },
        {
          title: 'Two objects affecting each other',
          teach: 'This is where a game appears: one object\'s method result is passed into another object\'s method. The hero\'s <code>attack()</code> feeds the enemy\'s <code>takeDamage()</code>.',
          code: `class Player {
    int attackPower = 14;
    int attack() { return attackPower; }
}

class Enemy {
    String name = "Cave Slime";
    int health = 30;

    void takeDamage(int amount) {
        health = health - amount;
        System.out.println(name + " drops to " + health + " HP");
    }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        Enemy slime = new Enemy();

        slime.takeDamage(hero.attack());
        slime.takeDamage(hero.attack());
        slime.takeDamage(hero.attack());
    }
}`,
          tryThis: 'Give the enemy a <code>boolean isAlive()</code> method and print <code>slime.isAlive()</code> after each hit.'
        },
        {
          title: 'Guarding against silly values',
          teach: 'Health below zero looks broken in a HUD. A quick <code>if</code> inside <code>takeDamage</code> keeps the number sensible — the same guard you wrote for the hero.',
          code: `class Enemy {
    String name = "Stone Bat";
    int health = 12;

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
    }
}

public class Game {
    public static void main(String[] args) {
        Enemy bat = new Enemy();
        bat.takeDamage(200);
        System.out.println(bat.name + " health = " + bat.health);
    }
}`,
          tryThis: 'Remove the <code>if</code> block and run it again to see the bug it prevents (health going negative).'
        }
      ],
      build: {
        label: 'Enemy class',
        brief: 'Build the enemy blueprint for the caves: fields <code>name</code>, <code>health</code>, <code>damage</code>, a constructor taking all three, plus <code>takeDamage(int amount)</code> (clamped at 0) and <code>isAlive()</code>.',
        checks: [
          ['class Enemy', 'Keep the <code>Enemy</code> class.'],
          ['int damage', 'Add an <code>int damage</code> field.'],
          ['Enemy(', 'Write the constructor <code>Enemy(String name, int health, int damage)</code>.'],
          ['takeDamage', 'Write <code>void takeDamage(int amount)</code>.'],
          ['boolean isAlive', 'Write <code>boolean isAlive()</code>.']
        ],
        starter: `class Enemy {
    // TODO: name, health and damage fields

    Enemy(String name, int health, int damage) {
        // TODO: set all three fields with this.
    }

    void takeDamage(int amount) {
        // TODO: subtract amount, and never let health go below 0
    }

    boolean isAlive() {
        // TODO: return true while health is above 0
        return false;
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Enemy slime = new Enemy("Cave Slime", 30, 6);
        System.out.println("name    = " + slime.name);
        System.out.println("damage  = " + slime.damage);
        slime.takeDamage(12);
        System.out.println("health  = " + slime.health);
        slime.takeDamage(999);
        System.out.println("floor   = " + slime.health);
        System.out.println("isAlive = " + slime.isAlive());
    }
}`,
        expect: ['name    = Cave Slime', 'damage  = 6', 'health  = 18', 'floor   = 0', 'isAlive = false'],
        expectMsg: 'Expected: name Cave Slime, damage 6, health 18 after a 12 hit, floor 0, isAlive false.',
        reference: REF.enemy
      }
    },

    /* ============ 5 ============ */
    {
      id: 'report',
      title: 'Decisions in battle',
      goal: 'Write reportRound() using if / else if / else',
      concepts: ['if', 'else if', 'else', 'comparisons', '&& and ||'],
      brief: 'A game is a chain of decisions. <code>if</code> statements let your code pick different messages depending on the state of the fight.',
      examples: [
        {
          title: 'if and else',
          teach: 'The condition inside the brackets must be true or false. <code>&lt;=</code> means "less than or equal to". If it is true the first block runs, otherwise the <code>else</code> block runs.',
          code: `public class Game {
    public static void main(String[] args) {
        int enemyHealth = 0;

        if (enemyHealth <= 0) {
            System.out.println("Enemy defeated!");
        } else {
            System.out.println("The enemy fights on with " + enemyHealth + " HP");
        }
    }
}`,
          tryThis: 'Change <code>enemyHealth</code> to 25 and run again. Then try 1 and 0.'
        },
        {
          title: 'Three or more outcomes',
          teach: '<code>else if</code> adds extra branches. Java checks them top to bottom and runs the first true one — so put the most specific condition first.',
          code: `public class Game {
    public static void main(String[] args) {
        int health = 8;

        if (health <= 0) {
            System.out.println("Defeated");
        } else if (health <= 10) {
            System.out.println("Badly hurt (" + health + " HP)");
        } else if (health <= 40) {
            System.out.println("Wounded (" + health + " HP)");
        } else {
            System.out.println("Healthy (" + health + " HP)");
        }
    }
}`,
          tryThis: 'Run it with health 0, 8, 30 and 90 by editing the number. Then swap the first two branches and see why order matters.'
        },
        {
          title: 'Deciding from objects',
          teach: 'Conditions usually read an object\'s fields or call its methods. That keeps decision code short and readable.',
          code: `class Enemy {
    String name;
    int health;
    Enemy(String name, int health) { this.name = name; this.health = health; }
    boolean isAlive() { return health > 0; }
}

public class Game {
    public static void main(String[] args) {
        Enemy bat = new Enemy("Stone Bat", 3);

        if (bat.isAlive()) {
            System.out.println(bat.name + " is still flying (" + bat.health + " HP)");
        } else {
            System.out.println(bat.name + " has fallen");
        }
    }
}`,
          tryThis: 'Set the bat\'s health to 0 in the constructor call and run it again.'
        },
        {
          title: 'Combining conditions',
          teach: '<code>&&</code> means both must be true, <code>||</code> means either will do, and <code>!</code> flips true and false. This is how a battle knows it should continue.',
          code: `public class Game {
    public static void main(String[] args) {
        int heroHealth = 40;
        int foeHealth = 0;

        boolean bothStanding = heroHealth > 0 && foeHealth > 0;
        System.out.println("Fight continues? " + bothStanding);

        if (heroHealth > 0 && foeHealth <= 0) {
            System.out.println("Cave cleared!");
        }
        if (!bothStanding) {
            System.out.println("The battle is over.");
        }
    }
}`,
          tryThis: 'Give both fighters health above 0 and run it. Then try <code>||</code> instead of <code>&&</code> and compare.'
        }
      ],
      build: {
        label: 'round report',
        brief: 'Write the round report for Crystal Run. Inside <code>reportRound</code>, print <code>">> " + foe.name + " is defeated!"</code> when the enemy has 0 or less health, a "badly hurt" line when health is 10 or less, otherwise how many HP are left.',
        checks: [
          ['static void reportRound', 'Keep the <code>reportRound</code> method.'],
          ['if', 'Use an <code>if</code> statement.'],
          ['else', 'Use <code>else if</code> and <code>else</code> for the other outcomes.'],
          ['<= 0', 'Check for defeat with <code>foe.health &lt;= 0</code>.'],
          ['System.out.println', 'Print a message in every branch.']
        ],
        starter: `class Battle {
    static void reportRound(Player hero, Enemy foe) {
        // TODO: if foe.health <= 0        -> ">> Cave Slime is defeated!"
        // TODO: else if foe.health <= 10  -> ">> Cave Slime is badly hurt (7 HP)"
        // TODO: else                      -> ">> Cave Slime has 22 HP left"
    }
}`,
        context: [REF.player, REF.enemy].join('\n\n'),
        harness: `public class Game {
    public static void main(String[] args) {
        Player hero = new Player("Nova");
        Enemy a = new Enemy("Cave Slime", 22, 6);
        Enemy b = new Enemy("Cave Slime", 7, 6);
        Enemy c = new Enemy("Cave Slime", 0, 6);
        Battle.reportRound(hero, a);
        Battle.reportRound(hero, b);
        Battle.reportRound(hero, c);
    }
}`,
        expectLines: 3,
        expectMsg: 'All three test enemies should produce a different message — one healthy, one badly hurt, one defeated.',
        reference: REF.battle
      }
    },

    /* ============ 6 ============ */
    {
      id: 'loop',
      title: 'The battle loop',
      goal: 'Write fight() with a while loop that runs a whole battle',
      concepts: ['while', 'loop conditions', 'counters', '++', 'game loop'],
      brief: 'This is the heart of every game: repeat until something changes. A <code>while</code> loop keeps swinging until the hero or the enemy falls.',
      examples: [
        {
          title: 'while repeats while true',
          teach: 'The condition is checked before every pass. Something inside the loop must move towards making it false, or the loop never ends.',
          code: `public class Game {
    public static void main(String[] args) {
        int enemyHealth = 30;

        while (enemyHealth > 0) {
            enemyHealth = enemyHealth - 14;
            System.out.println("Hit! Enemy at " + enemyHealth + " HP");
        }
        System.out.println("Enemy down.");
    }
}`,
          tryThis: 'Change the damage from 14 to 7 and count the extra rounds. Then try 0 — the run will stop itself and warn you about an endless loop.'
        },
        {
          title: 'Counting rounds',
          teach: 'A <b>counter</b> variable declared before the loop and increased inside it lets you number turns. <code>round++</code> is shorthand for <code>round = round + 1</code>.',
          code: `public class Game {
    public static void main(String[] args) {
        int foeHealth = 45;
        int round = 1;

        while (foeHealth > 0) {
            System.out.println("-- Round " + round + " --");
            foeHealth = foeHealth - 14;
            round++;
        }
        System.out.println("Won in " + (round - 1) + " rounds");
    }
}`,
          tryThis: 'Print the enemy health inside each round as well, so the log reads like a real battle.'
        },
        {
          title: 'Both fighters swing',
          teach: 'With <code>&&</code> the loop stops as soon as either side falls. The inner <code>if</code> stops a defeated enemy from getting a free hit back.',
          code: `class Player {
    int health = 40;
    int attack() { return 14; }
    void takeDamage(int n) { health = health - n; }
    boolean isAlive() { return health > 0; }
}

class Enemy {
    int health = 45;
    int damage = 12;
    void takeDamage(int n) { health = health - n; }
    boolean isAlive() { return health > 0; }
}

public class Game {
    public static void main(String[] args) {
        Player hero = new Player();
        Enemy foe = new Enemy();

        while (hero.isAlive() && foe.isAlive()) {
            foe.takeDamage(hero.attack());
            System.out.println("Foe: " + foe.health + " HP");
            if (foe.isAlive()) {
                hero.takeDamage(foe.damage);
                System.out.println("Hero: " + hero.health + " HP");
            }
        }
        System.out.println(hero.isAlive() ? "Hero wins" : "Hero falls");
    }
}`,
          tryThis: 'Give the enemy 25 damage so the hero loses, and check the last line changes.'
        }
      ],
      build: {
        label: 'battle loop',
        brief: 'Write the full battle. <code>fight()</code> announces the enemy, then loops while both are alive: the hero hits, <code>reportRound</code> prints the result, and if the enemy survives it strikes back. Count the rounds with a counter.',
        checks: [
          ['static void fight', 'Keep the <code>fight</code> method.'],
          ['while', 'Use a <code>while</code> loop.'],
          ['isAlive()', 'Loop while <code>hero.isAlive() && foe.isAlive()</code>.'],
          ['&&', 'Combine both conditions with <code>&&</code>.'],
          ['foe.takeDamage', 'Damage the enemy with <code>foe.takeDamage(hero.attack())</code>.'],
          ['hero.takeDamage', 'Let the enemy strike back with <code>hero.takeDamage(foe.damage)</code>.'],
          ['reportRound', 'Call <code>reportRound(hero, foe)</code> each round.']
        ],
        starter: `class Battle {
    static void reportRound(Player hero, Enemy foe) {
        if (foe.health <= 0) {
            System.out.println(">> " + foe.name + " is defeated!");
        } else if (foe.health <= 10) {
            System.out.println(">> " + foe.name + " is badly hurt (" + foe.health + " HP)");
        } else {
            System.out.println(">> " + foe.name + " has " + foe.health + " HP left");
        }
    }

    static void fight(Player hero, Enemy foe) {
        // TODO: print "A wild <name> blocks the path!"
        // TODO: make an int round counter starting at 1

        // TODO: while both hero and foe are alive:
        //         print "-- Round <round> --"
        //         foe takes damage equal to hero.attack()
        //         call reportRound(hero, foe)
        //         if the foe is still alive, hero takes foe.damage
        //           and print "   " + hero.status()
        //         add 1 to round
    }
}`,
        context: [REF.player, REF.enemy].join('\n\n'),
        harness: `public class Game {
    public static void main(String[] args) {
        Player hero = new Player("Nova");
        Enemy slime = new Enemy("Cave Slime", 30, 6);
        Battle.fight(hero, slime);
        System.out.println("After the fight: " + hero.status());
        System.out.println("Slime alive? " + slime.isAlive());
    }
}`,
        expect: ['Slime alive? false'],
        expectMsg: 'After the loop the Cave Slime should be defeated (alive false) and the hero should have lost some health.',
        reference: REF.battle
      }
    },

    /* ============ 7 ============ */
    {
      id: 'backpack',
      title: 'Loot and the backpack',
      goal: 'Build the Backpack class using an ArrayList',
      concepts: ['ArrayList', 'import', 'add / size / get', 'for-each loop'],
      brief: 'Inventories grow and shrink, so a fixed set of variables will not do. An <b>ArrayList</b> is a list that resizes itself as the game runs.',
      examples: [
        {
          title: 'Creating a list',
          teach: '<code>import java.util.ArrayList;</code> makes the class available. <code>ArrayList&lt;String&gt;</code> means "a list of Strings". <code>add</code> puts items in, <code>size</code> counts them, <code>get(0)</code> reads the first.',
          code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> items = new ArrayList<>();

        items.add("Rusty Sword");
        items.add("Cave Slime Shard");

        System.out.println("Items: " + items.size());
        System.out.println("First: " + items.get(0));
        System.out.println(items);
    }
}`,
          tryThis: 'Add two more items and print <code>items.get(2)</code>. Lists start counting at 0.'
        },
        {
          title: 'Looping over every item',
          teach: 'A <b>for-each</b> loop reads <code>for (String item : items)</code> — "for each String called item in items". It runs once per element, in order.',
          code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> items = new ArrayList<>();
        items.add("Rusty Sword");
        items.add("Torch");
        items.add("Crystal Shard");

        System.out.println("Backpack (" + items.size() + " items):");
        for (String item : items) {
            System.out.println(" - " + item);
        }
    }
}`,
          tryThis: 'Print the items in UPPERCASE using <code>item.toUpperCase()</code>.'
        },
        {
          title: 'Checking and removing',
          teach: '<code>contains</code> asks whether something is in the list, <code>remove</code> takes it out, and <code>isEmpty</code> tells you when the bag is bare. Perfect for keys, potions and quest items.',
          code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> items = new ArrayList<>();
        items.add("Crystal Key");
        items.add("Potion");

        if (items.contains("Crystal Key")) {
            System.out.println("The gate opens...");
        }

        items.remove("Potion");
        System.out.println("Left: " + items + " (" + items.size() + ")");
        System.out.println("Empty? " + items.isEmpty());
    }
}`,
          tryThis: 'Remove "Crystal Key" too, then print <code>items.isEmpty()</code> again.'
        },
        {
          title: 'Wrapping a list in a class',
          teach: 'Putting the list inside its own class hides the details. The rest of the game just says <code>bag.add("Torch")</code> and never touches the ArrayList directly.',
          code: `import java.util.ArrayList;

class Backpack {
    ArrayList<String> items = new ArrayList<>();

    void add(String item) {
        items.add(item);
        System.out.println("Picked up: " + item);
    }
}

public class Game {
    public static void main(String[] args) {
        Backpack bag = new Backpack();
        bag.add("Rusty Sword");
        bag.add("Torch");
        System.out.println("Carrying " + bag.items.size() + " things");
    }
}`,
          tryThis: 'Add a <code>boolean has(String item)</code> method to Backpack that returns <code>items.contains(item)</code>, then test it.'
        }
      ],
      build: {
        label: 'Backpack',
        brief: 'Build the backpack for Crystal Run: an <code>ArrayList&lt;String&gt;</code> field called <code>items</code>, an <code>add(String item)</code> method that stores the item and prints <code>"Picked up: ..."</code>, and a <code>show()</code> method that prints the count then every item on its own line.',
        checks: [
          ['import java.util.ArrayList', 'Import ArrayList at the top.'],
          ['class Backpack', 'Keep the <code>Backpack</code> class.'],
          ['ArrayList<String>', 'Create an <code>ArrayList&lt;String&gt;</code> field called items.'],
          ['items.add', 'Store the item with <code>items.add(item)</code>.'],
          ['void show', 'Keep the <code>show()</code> method.'],
          ['for (', 'Use a for-each loop in <code>show()</code>.']
        ],
        starter: `import java.util.ArrayList;

class Backpack {
    // TODO: an ArrayList<String> field called items

    void add(String item) {
        // TODO: add the item to the list
        // TODO: print "Picked up: " + item
    }

    void show() {
        // TODO: print "Backpack (2 items):" using items.size()
        // TODO: for each item, print " - " + item
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Backpack bag = new Backpack();
        bag.add("Rusty Sword");
        bag.add("Crystal Shard");
        bag.show();
    }
}`,
        expect: ['Picked up: Rusty Sword', 'Rusty Sword'],
        expectMsg: 'Expected a "Picked up:" line per item, then a listing that includes both items.',
        reference: REF.backpack
      }
    },

    /* ============ 8 ============ */
    {
      id: 'game',
      title: 'Assemble the game',
      goal: 'Write main() and run Crystal Run end to end',
      concepts: ['program design', 'arrays', 'for-each', 'return', 'integration'],
      brief: 'Every part exists. Now <code>main</code> becomes the director: show the title, create the hero, walk through three caves, and decide how the story ends.',
      examples: [
        {
          title: 'Many enemies in one array',
          teach: 'An <b>array</b> holds a fixed group of objects. Written with <code>{ ... }</code> it is perfect for a level list, and a for-each loop visits each one in order.',
          code: `class Enemy {
    String name; int health;
    Enemy(String name, int health) { this.name = name; this.health = health; }
}

public class Game {
    public static void main(String[] args) {
        Enemy[] caves = { new Enemy("Cave Slime", 30), new Enemy("Stone Bat", 45), new Enemy("Crystal Guardian", 70) };

        System.out.println("Caves ahead: " + caves.length);
        for (Enemy foe : caves) {
            System.out.println("You hear a " + foe.name + " (" + foe.health + " HP)");
        }
    }
}`,
          tryThis: 'Add a fourth cave enemy and run it — the loop handles it with no other changes.'
        },
        {
          title: 'Ending the game early',
          teach: '<code>return</code> inside <code>main</code> stops the program immediately. That is how a game over screen skips the rest of the adventure.',
          code: `public class Game {
    public static void main(String[] args) {
        int heroHealth = 0;

        System.out.println("Entering cave 2...");
        if (heroHealth <= 0) {
            System.out.println("You fell in the caves. Game over.");
            return;
        }
        System.out.println("This line only runs if you survived.");
    }
}`,
          tryThis: 'Set heroHealth to 50 and run again to see the last line appear.'
        },
        {
          title: 'The whole shape of main',
          teach: 'Read the order: set up, loop through content, check for failure, then finish. Almost every game main method looks like this, no matter the size.',
          code: `class Screen {
    static void showTitle() { System.out.println("=== CRYSTAL RUN ==="); }
}

public class Game {
    public static void main(String[] args) {
        Screen.showTitle();

        String[] caves = { "Cave Slime", "Stone Bat", "Crystal Guardian" };
        int health = 100;

        for (String foe : caves) {
            System.out.println("Fighting " + foe + "...");
            health = health - 30;
            if (health <= 0) {
                System.out.println("You fell in the caves. Game over.");
                return;
            }
            System.out.println("   survived with " + health + " HP");
        }

        System.out.println("You reached the Crystal. YOU WIN!");
    }
}`,
          tryThis: 'Change the damage per cave to 40 and watch the game end early.'
        }
      ],
      build: {
        label: 'main method',
        brief: 'Write the final <code>main</code>. Show the title, create the hero and backpack, put three enemies in an array, then for each one: fight, stop the game if the hero died, and collect a shard. At the end show the backpack and a victory line.',
        checks: [
          ['public static void main', 'Keep the <code>main</code> method.'],
          ['Screen.showTitle', 'Show the title screen first.'],
          ['new Player', 'Create your hero with <code>new Player("...")</code>.'],
          ['new Backpack', 'Create the backpack.'],
          ['new Enemy', 'Create the cave enemies.'],
          ['Battle.fight', 'Fight each enemy with <code>Battle.fight(hero, foe)</code>.'],
          ['for (', 'Loop over the enemies with a for-each loop.'],
          ['bag.show', 'Show the backpack at the end.']
        ],
        starter: `public class Game {
    public static void main(String[] args) {
        // TODO: Screen.showTitle();

        // TODO: Player hero = new Player("Nova");
        // TODO: Backpack bag = new Backpack();
        // TODO: bag.add("Rusty Sword");

        // TODO: Enemy[] caves = { new Enemy("Cave Slime", 30, 6), new Enemy("Stone Bat", 45, 9), new Enemy("Crystal Guardian", 70, 14) };

        // TODO: for (Enemy foe : caves) {
        //           Battle.fight(hero, foe);
        //           if (!hero.isAlive()) { print a game over line; return; }
        //           bag.add(foe.name + " Shard");
        //       }

        // TODO: bag.show();
        // TODO: print hero.status() + " reached the Crystal. YOU WIN!"
    }
}`,
        context: [REF.screen, REF.player, REF.enemy, REF.backpack, REF.battle].join('\n\n'),
        harness: '',
        expect: ['Backpack', 'Rusty Sword'],
        expectMsg: 'The game should print the title screen, three fights, the backpack contents and an ending line.',
        reference: REF.game
      }
    }
  ];

  const ORDER = ['screen', 'player', 'actions', 'enemy', 'report', 'loop', 'backpack', 'game'];

  global.COURSE = { sections: SECTIONS, REF, order: ORDER };
  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 1,
    title: 'Crystal Run',
    tagline: 'Your first Java game',
    blurb: 'A hero walks into three caves, fights what lives there, and collects crystal shards. You learn the building blocks of Java: classes, objects, methods, decisions, loops and lists.',
    sections: SECTIONS, REF: REF, order: ORDER,
    slotOf: { screen: 'screen', player: 'player', actions: 'player', enemy: 'enemy', report: 'battle', loop: 'battle', backpack: 'backpack', game: 'game' },
    assemble: ['screen', 'player', 'enemy', 'backpack', 'battle', 'game']
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = global.COURSE;
})(typeof window !== 'undefined' ? window : globalThis);
