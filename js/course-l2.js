/* Course content for Level 2 of CRYSTAL RUN — Deep Caverns. */
(function (global) {
  const REF = {
    entity: `abstract class Entity implements Lootable {
    protected String name;
    protected int health;
    protected int maxHealth;
    protected int power;

    Entity(String name, int health, int power) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.power = power;
    }

    int attack(Random random) {
        return power + random.nextInt(3);
    }

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
    }

    void heal(int amount) {
        health = health + amount;
        if (health > maxHealth) {
            health = maxHealth;
        }
    }

    boolean isAlive() {
        return health > 0;
    }

    boolean announcePhase() {
        return false;
    }

    String describe() {
        return name + " waits in the dark.";
    }
}

class Hero extends Entity {
    Hero(String name) {
        super(name, 100, 13);
    }

    public String drop() {
        return "Hero's map";
    }
}`,

    creatures: `class Slime extends Entity {
    Slime() {
        super("Moss Slime", 26, 5);
    }

    int attack(Random random) {
        return super.attack(random);
    }

    String describe() {
        return super.describe() + " It leaves a green trail.";
    }

    public String drop() {
        return "Slime gel";
    }
}

class Bat extends Entity {
    Bat() {
        super("Echo Bat", 32, 6);
    }

    int attack(Random random) {
        return super.attack(random) + 2;
    }

    String describe() {
        return super.describe() + " Its wings beat above the path.";
    }

    public String drop() {
        return "Bat wing";
    }
}

class Ghost extends Entity {
    Ghost() {
        super("Crystal Ghost", 34, 4);
    }

    int attack(Random random) {
        return super.attack(random) + 1;
    }

    String describe() {
        return super.describe() + " Its light bends through the stone.";
    }

    public String drop() {
        return "Spirit dust";
    }
}

class Boss extends Entity {
    boolean enraged;
    boolean phaseAnnounced;

    Boss() {
        super("Crystal Warden", 48, 8);
        enraged = false;
        phaseAnnounced = false;
    }

    void takeDamage(int amount) {
        super.takeDamage(amount);
        if (health <= maxHealth / 2) {
            enraged = true;
        }
    }

    int attack(Random random) {
        int hit = super.attack(random);
        if (enraged) {
            return hit + 5;
        }
        return hit;
    }

    boolean announcePhase() {
        if (enraged && !phaseAnnounced) {
            phaseAnnounced = true;
            return true;
        }
        return false;
    }

    String describe() {
        if (enraged) {
            return super.describe() + " PHASE TWO: its crystal core burns red.";
        }
        return super.describe() + " It guards the deepest chamber.";
    }

    public String drop() {
        return "Warden crystal";
    }
}`,

    loot: `interface Lootable {
    String drop();
}

class LootGuide {
    static String find(Entity foe) {
        if (foe instanceof Lootable) {
            return foe.drop();
        }
        return "Nothing";
    }
}`,

    commands: `enum Command {
    LOOK, ATTACK, REST, UNKNOWN
}

class CommandConsole {
    static void run(Command command) {
        switch (command) {
            case LOOK:
                System.out.println("Nova chooses LOOK and raises the torch.");
                break;
            case ATTACK:
                System.out.println("Nova chooses ATTACK and steps forward.");
                break;
            case REST:
                System.out.println("Nova chooses REST beside a quiet pool.");
                break;
            default:
                System.out.println("Nova chooses UNKNOWN. The cave stays silent.");
                break;
        }
    }
}`,

    inventory: `class Inventory {
    HashMap<String, Integer> items = new HashMap<>();

    void add(String item) {
        int count = items.getOrDefault(item, 0) + 1;
        items.put(item, count);
        System.out.println("Picked up " + item + " (x" + count + ")");
    }

    boolean has(String item) {
        return items.containsKey(item);
    }

    String list() {
        StringBuilder text = new StringBuilder("Inventory:");
        for (String item : items.keySet()) {
            text.append(" ").append(item).append(" x").append(items.get(item));
        }
        return text.toString();
    }

    static String healthBar(int health) {
        StringBuilder bar = new StringBuilder("[");
        int blocks = health / 10;
        for (int i = 0; i < 10; i++) {
            if (i < blocks) {
                bar.append("#");
            } else {
                bar.append("-");
            }
        }
        bar.append("] ").append(health).append(" HP");
        return bar.toString();
    }
}`,

    game: `public class Game {
    static void fight(Hero hero, Entity foe, Random random, Inventory bag) {
        System.out.println("");
        System.out.println(foe.name + " blocks the tunnel.");
        CommandConsole.run(Command.LOOK);
        System.out.println("The tunnel narrows towards " + foe.name + ".");
        System.out.println(foe.describe());
        int round = 1;

        while (hero.isAlive() && foe.isAlive()) {
            System.out.println("-- Round " + round + " --");
            CommandConsole.run(Command.ATTACK);
            int heroHit = hero.attack(random);
            foe.takeDamage(heroHit);
            System.out.println(hero.name + " deals " + heroHit + ". " + foe.name + " has " + foe.health + " HP.");

            if (foe.announcePhase()) {
                System.out.println("The Crystal Warden shatters its calm shell. PHASE TWO begins.");
            }
            if (foe.isAlive()) {
                System.out.println(foe.name + " lashes out from the shadows.");
                int foeHit = foe.attack(random);
                hero.takeDamage(foeHit);
                System.out.println(foe.name + " deals " + foeHit + ". " + Inventory.healthBar(hero.health));
            }
            round++;
        }

        if (hero.isAlive()) {
            System.out.println(foe.name + " fades from the cavern.");
            bag.add(LootGuide.find(foe));
        }
    }

    public static void main(String[] args) {
        System.out.println("================================");
        System.out.println("       C R Y S T A L  R U N");
        System.out.println("          DEEP CAVERNS");
        System.out.println("================================");

        Random random = new Random(7);
        Hero hero = new Hero("Nova");
        Inventory bag = new Inventory();
        bag.add("Glow berry");
        bag.add("Glow berry");

        Entity[] caves = { new Slime(), new Bat(), new Ghost(), new Boss() };
        for (Entity foe : caves) {
            fight(hero, foe, random, bag);
            if (!hero.isAlive()) {
                System.out.println("Nova is lost in the Deep Caverns. Game over.");
                return;
            }
            CommandConsole.run(Command.REST);
            hero.heal(6);
            System.out.println("Nova recovers 6 HP. " + Inventory.healthBar(hero.health));
        }

        System.out.println("");
        System.out.println(Inventory.healthBar(hero.health));
        System.out.println(bag.list());
        System.out.println("Glow berry available? " + bag.has("Glow berry"));
        System.out.println("Nova seals the crystal gate. DEEP CAVERNS CLEARED. YOU WIN.");
    }
}`
  };

  const LOOT_CONTEXT = `interface Lootable {
    String drop();
}`;

  const SECTIONS = [
    {
      id: 'entity',
      title: 'One base for creatures',
      goal: 'Build an abstract Entity base class',
      concepts: ['inheritance', 'abstract class', 'extends', 'super', 'protected'],
      brief: 'Deep Caverns has more creatures than Crystal Run. Rather than repeat the same fields and methods in every creature, you make one <b>abstract class</b> that holds their shared parts.',
      examples: [
        {
          title: 'A child class extends a parent',
          teach: '<b>Inheritance</b> lets one class build on another. <code>extends</code> says that <code>Bat</code> gets the fields and methods from <code>Creature</code>. The child can use the parent\'s field as if it were its own.',
          code: `class Creature {
    String name;
    Creature(String name) { this.name = name; }
}

class Bat extends Creature {
    Bat() { super("Echo Bat"); }
}

public class Game {
    public static void main(String[] args) {
        Bat bat = new Bat();
        System.out.println(bat.name + " flies from the ceiling.");
    }
}`,
          tryThis: 'Change the text given to <code>super</code>, then run the program to give the bat a new name.'
        },
        {
          title: 'super sets up the parent',
          teach: '<code>super(...)</code> calls the parent constructor. It must be the first line in a child constructor, because the parent fields need values before the child adds anything else. The comma separates the two values passed in.',
          code: `class Creature {
    String name;
    int health;
    Creature(String name, int health) {
        this.name = name;
        this.health = health;
    }
}

class Slime extends Creature {
    Slime() {
        super("Moss Slime", 26);
    }
}

public class Game {
    public static void main(String[] args) {
        Slime slime = new Slime();
        System.out.println(slime.name + " has " + slime.health + " HP.");
    }
}`,
          tryThis: 'Give the slime 40 health in its <code>super</code> call and check the printed number.'
        },
        {
          title: 'protected shares with children',
          teach: '<b>protected</b> means a field belongs to this class and its child classes. It keeps game data available where it is needed without making it part of every other class. Here <code>Ghost</code> reads the protected <code>health</code> field.',
          code: `class Creature {
    protected int health;
    Creature(int health) { this.health = health; }
}

class Ghost extends Creature {
    Ghost() { super(18); }
    void whisper() { System.out.println("Ghost health: " + health); }
}

public class Game {
    public static void main(String[] args) {
        Ghost ghost = new Ghost();
        ghost.whisper();
    }
}`,
          tryThis: 'Change the value passed to <code>super</code> and see which health the ghost reports.'
        }
      ],
      build: {
        label: 'Entity base',
        brief: 'Write the shared base for every creature. Make <code>Entity</code> abstract, give it protected <code>name</code>, <code>health</code>, <code>maxHealth</code> and <code>power</code> fields, then add a constructor, <code>attack</code>, <code>takeDamage</code>, <code>isAlive</code> and <code>describe</code>. Keep <code>Hero</code> as the player child class that calls <code>super(...)</code>.',
        checks: [
          ['abstract class Entity', 'An abstract class called <code>Entity</code>.'],
          ['protected String name', 'A protected <code>String name</code> field.'],
          ['protected int health', 'A protected <code>int health</code> field.'],
          ['void takeDamage', 'A <code>takeDamage</code> method.'],
          ['boolean isAlive', 'An <code>isAlive</code> method.'],
          ['class Hero extends Entity', 'A Hero child class that extends Entity.'],
          ['super(', 'A Hero constructor that calls <code>super(...)</code>.']
        ],
        starter: `abstract class Entity implements Lootable {
    // TODO: protected name, health, maxHealth and power fields

    Entity(String name, int health, int power) {
        // TODO: store the three values and remember maxHealth
    }

    int attack(Random random) {
        return 0;
    }

    void takeDamage(int amount) {
        // TODO: lower health without going below 0
    }

    boolean isAlive() {
        return false;
    }

    String describe() {
        return "";
    }
}

class Hero extends Entity {
    Hero(String name) {
        // TODO: call super with name, 100 health and 13 power
    }

    public String drop() {
        return "";
    }
}`,
        context: LOOT_CONTEXT,
        harness: `public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero("Nova");
        hero.takeDamage(12);
        System.out.println(hero.name + " has " + hero.health + " HP.");
        System.out.println("Alive? " + hero.isAlive());
        System.out.println(hero.describe());
    }
}`,
        expect: ['Nova has 88 HP.', 'Alive? true'],
        expectMsg: 'The Hero should begin at 100 HP, lose 12 HP, and still be alive.',
        reference: REF.entity
      }
    },

    {
      id: 'creatures',
      title: 'Creatures with different moves',
      goal: 'Override creature methods in three subclasses',
      concepts: ['overriding', 'polymorphism', 'base type', 'super.method', 'array'],
      brief: 'Every cave enemy shares the Entity shape, but each can fight and speak differently. Java can hold all of them in one array of the base type, then choose the correct overridden method at runtime.',
      examples: [
        {
          title: 'An override replaces a method',
          teach: '<b>Method overriding</b> happens when a child writes a method with the same name and inputs as its parent. Calling <code>attack()</code> on a <code>Bat</code> uses the Bat version, not the Creature version.',
          code: `class Creature {
    int attack() { return 3; }
}
class Bat extends Creature {
    int attack() { return 8; }
}

public class Game {
    public static void main(String[] args) {
        Creature foe = new Bat();
        System.out.println("The bat hits for " + foe.attack());
    }
}`,
          tryThis: 'Change the number returned by <code>Bat.attack()</code> and run it again.'
        },
        {
          title: 'super calls the old method',
          teach: '<code>super.attack()</code> runs the parent version of a method. A child can use that shared result, then add its own twist. This Bat keeps the base damage and adds two for its diving attack.',
          code: `class Creature {
    int attack() { return 4; }
}
class Bat extends Creature {
    int attack() { return super.attack() + 2; }
}

public class Game {
    public static void main(String[] args) {
        Bat bat = new Bat();
        System.out.println("Dive damage: " + bat.attack());
    }
}`,
          tryThis: 'Make the Bat add five instead of two, then run it to compare the damage.'
        },
        {
          title: 'One array, many creature types',
          teach: '<b>Polymorphism</b> means one base-type variable can point at different child objects. An array of <code>Creature</code> values can hold a slime, bat and ghost. Each call to <code>describe()</code> finds the version belonging to that object.',
          code: `class Creature {
    String describe() { return "A creature waits."; }
}
class Slime extends Creature {
    String describe() { return "A slime bubbles."; }
}
class Ghost extends Creature {
    String describe() { return "A ghost glows."; }
}

public class Game {
    public static void main(String[] args) {
        Creature[] foes = { new Slime(), new Ghost() };
        for (Creature foe : foes) {
            System.out.println(foe.describe());
        }
    }
}`,
          tryThis: 'Add a Bat child class and put a new Bat into the array. The loop does not need to change.'
        }
      ],
      build: {
        label: 'creature types',
        brief: 'Write the four Deep Caverns enemies. <code>Slime</code>, <code>Bat</code> and <code>Ghost</code> each extend Entity and each override both <code>attack(Random random)</code> and <code>describe()</code>. Use <code>super.attack(...)</code> or <code>super.describe()</code> inside them. Add the <code>Boss</code> too: when its health reaches half, its attack grows and its description says PHASE TWO.',
        checks: [
          ['class Slime extends Entity', 'A Slime class that extends Entity.'],
          ['class Bat extends Entity', 'A Bat class that extends Entity.'],
          ['class Ghost extends Entity', 'A Ghost class that extends Entity.'],
          ['class Boss extends Entity', 'A Boss class that extends Entity.'],
          ['super.attack', 'A child attack method that calls <code>super.attack</code>.'],
          ['super.describe', 'A child description that calls <code>super.describe</code>.'],
          ['PHASE TWO', 'A boss description for phase two.']
        ],
        starter: `class Slime extends Entity {
    Slime() {
        super("Moss Slime", 26, 5);
    }

    // TODO: override attack(Random random) and describe()
    public String drop() { return ""; }
}

class Bat extends Entity {
    // TODO: constructor, attack, describe and drop
}

class Ghost extends Entity {
    // TODO: constructor, attack, describe and drop
}

class Boss extends Entity {
    // TODO: enraged field, constructor, phase-changing takeDamage,
    //       attack, describe and drop
}`,
        context: [LOOT_CONTEXT, REF.entity].join('\n\n'),
        harness: `public class Game {
    public static void main(String[] args) {
        Random random = new Random(7);
        Entity[] foes = { new Slime(), new Bat(), new Ghost(), new Boss() };
        for (Entity foe : foes) {
            System.out.println(foe.name + " -> " + foe.attack(random));
            System.out.println(foe.describe());
        }
        Boss boss = new Boss();
        boss.takeDamage(30);
        System.out.println(boss.describe());
    }
}`,
        expect: ['Moss Slime', 'Echo Bat', 'Crystal Ghost', 'PHASE TWO'],
        expectMsg: 'The test should print all three ordinary creature names and the boss phase-two description.',
        reference: REF.creatures
      }
    },

    {
      id: 'loot',
      title: 'A promise for loot',
      goal: 'Use an interface to find enemy loot',
      concepts: ['interface', 'implements', 'contract', 'instanceof', 'return'],
      brief: 'An <b>interface</b> is a promise about what a class can do. Lootable promises a <code>drop()</code> method, so the game can ask an enemy for loot without caring which enemy it is.',
      examples: [
        {
          title: 'An interface names a promise',
          teach: 'An interface lists a method without writing its body. A class that says <code>implements Lootable</code> must provide that method. The <code>String</code> before <code>drop</code> says the method returns text.',
          code: `interface Lootable {
    String drop();
}

class Slime implements Lootable {
    public String drop() { return "Slime gel"; }
}

public class Game {
    public static void main(String[] args) {
        Slime slime = new Slime();
        System.out.println("Found: " + slime.drop());
    }
}`,
          tryThis: 'Change the item returned by <code>drop()</code> and run it to make your own loot.'
        },
        {
          title: 'Different classes keep the promise',
          teach: 'More than one class can implement the same interface. A <code>Lootable</code> variable can hold either object because both make the same promise. Calling <code>drop()</code> reaches the object\'s own method.',
          code: `interface Lootable {
    String drop();
}
class Bat implements Lootable {
    public String drop() { return "Bat wing"; }
}
class Ghost implements Lootable {
    public String drop() { return "Spirit dust"; }
}

public class Game {
    public static void main(String[] args) {
        Lootable[] finds = { new Bat(), new Ghost() };
        for (Lootable find : finds) {
            System.out.println(find.drop());
        }
    }
}`,
          tryThis: 'Add another Lootable class with a different drop, then put it into the array.'
        },
        {
          title: 'instanceof asks what it is',
          teach: '<code>instanceof</code> checks whether an object belongs to a class or follows an interface. It produces a boolean: true or false. This lets the game collect a drop only from objects that are Lootable.',
          code: `interface Lootable { String drop(); }
class Chest implements Lootable {
    public String drop() { return "Crystal key"; }
}
class Rock { }

public class Game {
    public static void main(String[] args) {
        Chest chest = new Chest();
        Rock rock = new Rock();
        System.out.println(chest instanceof Lootable);
        System.out.println(rock instanceof Lootable);
    }
}`,
          tryThis: 'Create another Chest and confirm that the check prints true for it too.'
        }
      ],
      build: {
        label: 'loot guide',
        brief: 'Write the <code>Lootable</code> interface with <code>String drop()</code>, then write <code>LootGuide</code>. Its <code>find(Entity foe)</code> method checks <code>foe instanceof Lootable</code>. When true it returns <code>foe.drop()</code>; otherwise it returns <code>"Nothing"</code>. The creature classes already make the Lootable promise through Entity.',
        checks: [
          ['interface Lootable', 'The Lootable interface.'],
          ['String drop()', 'The drop method promise.'],
          ['class LootGuide', 'A LootGuide class.'],
          ['instanceof Lootable', 'An <code>instanceof Lootable</code> check.'],
          ['foe.drop()', 'A call to the enemy\'s drop method.']
        ],
        starter: `interface Lootable {
    // TODO: promise a method that returns text for a dropped item
}

class LootGuide {
    static String find(Entity foe) {
        // TODO: if foe instanceof Lootable, return foe.drop()
        return "";
    }
}`,
        context: REF.entity,
        harness: `public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero("Nova");
        System.out.println("Hero: " + LootGuide.find(hero));
    }
}`,
        expect: ["Hero: Hero's map"],
        expectMsg: 'The Hero inherits the Lootable promise, so LootGuide should return the Hero map.',
        reference: REF.loot
      }
    },

    {
      id: 'commands',
      title: 'Typed cave commands',
      goal: 'Use an enum and switch for commands',
      concepts: ['enum', 'fixed choices', 'switch', 'case', 'break', 'default'],
      brief: 'Text can be misspelt, but an <b>enum</b> gives a command a fixed set of named choices. A <code>switch</code> reads one command and runs the matching case.',
      examples: [
        {
          title: 'An enum holds fixed names',
          teach: 'An <b>enum</b> is a short list of fixed values. <code>Command.LOOK</code> is one value from the Command list. The dot connects the enum name to one of its choices.',
          code: `enum Command { LOOK, ATTACK, REST }

public class Game {
    public static void main(String[] args) {
        Command next = Command.LOOK;
        System.out.println("Next command: " + next.name());
    }
}`,
          tryThis: 'Set <code>next</code> to <code>Command.REST</code> and run it to see the new name.'
        },
        {
          title: 'switch chooses a case',
          teach: '<code>switch</code> compares one value with several <code>case</code> labels. When the labels match, Java runs that case. <code>break</code> leaves the switch so it does not continue into the next case.',
          code: `enum Command { LOOK, ATTACK, REST }

public class Game {
    public static void main(String[] args) {
        Command next = Command.ATTACK;
        switch (next) {
            case LOOK:
                System.out.println("You look around.");
                break;
            case ATTACK:
                System.out.println("You swing the blade.");
                break;
            case REST:
                System.out.println("You rest.");
                break;
        }
    }
}`,
          tryThis: 'Change the chosen command to LOOK, then REST, and see which line runs each time.'
        },
        {
          title: 'default handles the spare case',
          teach: '<code>default</code> is the safety case at the end of a switch. It runs when no earlier case matches. Even with an enum, it gives the game a clear answer for <code>UNKNOWN</code>.',
          code: `enum Command { LOOK, UNKNOWN }

public class Game {
    public static void main(String[] args) {
        Command next = Command.UNKNOWN;
        switch (next) {
            case LOOK:
                System.out.println("You study the cavern.");
                break;
            default:
                System.out.println("The cave does not understand.");
                break;
        }
    }
}`,
          tryThis: 'Set <code>next</code> to LOOK and confirm that default no longer runs.'
        }
      ],
      build: {
        label: 'command console',
        brief: 'Write the <code>Command</code> enum with LOOK, ATTACK, REST and UNKNOWN. Then write <code>CommandConsole.run(Command command)</code>. Its switch needs a case and break for LOOK, ATTACK and REST, plus a default message for UNKNOWN.',
        checks: [
          ['enum Command', 'An enum named Command.'],
          ['switch (command)', 'A switch that reads command.'],
          ['case LOOK:', 'A LOOK case.'],
          ['case ATTACK:', 'An ATTACK case.'],
          ['break;', 'Break statements after cases.'],
          ['default:', 'A default case.'],
          ['class CommandConsole', 'A CommandConsole class.']
        ],
        starter: `enum Command {
    LOOK, ATTACK, REST, UNKNOWN
}

class CommandConsole {
    static void run(Command command) {
        // TODO: switch (command)
        // TODO: print a message for LOOK, ATTACK and REST
        // TODO: use break after each case
        // TODO: add a default message
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        CommandConsole.run(Command.LOOK);
        CommandConsole.run(Command.ATTACK);
        CommandConsole.run(Command.REST);
        CommandConsole.run(Command.UNKNOWN);
    }
}`,
        expectLines: 4,
        expectMsg: 'The console should print one different message for each of the four test commands.',
        reference: REF.commands
      }
    },

    {
      id: 'inventory',
      title: 'Counted treasure bag',
      goal: 'Build a counted inventory with HashMap',
      concepts: ['HashMap', 'keys and values', 'getOrDefault', 'keySet', 'StringBuilder'],
      brief: 'A bag can hold two glow berries, not only one. A <b>HashMap</b> pairs each item name with a number, while StringBuilder helps draw a neat health bar one piece at a time.',
      examples: [
        {
          title: 'A map pairs names and counts',
          teach: '<b>HashMap</b> stores a key beside a value. <code>HashMap&lt;String, Integer&gt;</code> means text keys with whole-number values. <code>put</code> stores a pair and <code>get</code> reads the value for a key.',
          code: `public class Game {
    public static void main(String[] args) {
        HashMap<String, Integer> bag = new HashMap<>();
        bag.put("Glow berry", 2);
        bag.put("Bat wing", 1);
        System.out.println("Berries: " + bag.get("Glow berry"));
        System.out.println("Items: " + bag);
    }
}`,
          tryThis: 'Use <code>put</code> to add a new item and print its count with <code>get</code>.'
        },
        {
          title: 'A safe first count',
          teach: '<code>getOrDefault(key, value)</code> gives a fallback when a key is missing. Here a new item starts at 0, then gains one. <code>containsKey</code> answers whether the bag has ever seen that item name.',
          code: `public class Game {
    public static void main(String[] args) {
        HashMap<String, Integer> bag = new HashMap<>();
        int next = bag.getOrDefault("Slime gel", 0) + 1;
        bag.put("Slime gel", next);
        System.out.println("Slime gel x" + bag.get("Slime gel"));
        System.out.println("Has gel? " + bag.containsKey("Slime gel"));
    }
}`,
          tryThis: 'Run the add code a second time so the count becomes 2.'
        },
        {
          title: 'Build text piece by piece',
          teach: '<b>StringBuilder</b> collects text that grows in a loop. <code>append</code> adds another piece and returns the builder, so calls can chain together. <code>toString()</code> turns the finished builder into ordinary text.',
          code: `public class Game {
    public static void main(String[] args) {
        StringBuilder bar = new StringBuilder("[");
        for (int i = 0; i < 5; i++) {
            bar.append("#");
        }
        bar.append("-----]");
        System.out.println(bar.toString());
    }
}`,
          tryThis: 'Change the loop to add three # marks and add two more - marks at the end.'
        }
      ],
      build: {
        label: 'counted inventory',
        brief: 'Write <code>Inventory</code> with a <code>HashMap&lt;String, Integer&gt;</code> called items. <code>add</code> uses getOrDefault, put and a count. <code>has</code> uses containsKey. <code>list</code> loops through keySet and uses get. Add <code>healthBar</code> using StringBuilder to draw ten # or - blocks.',
        checks: [
          ['HashMap<String, Integer>', 'A map from item names to counts.'],
          ['getOrDefault', 'Use getOrDefault for a missing item.'],
          ['items.put', 'Store the new count with put.'],
          ['containsKey', 'Check for an item with containsKey.'],
          ['keySet()', 'Loop through the map keys.'],
          ['StringBuilder', 'Use StringBuilder for the health bar.'],
          ['class Inventory', 'An Inventory class.']
        ],
        starter: `class Inventory {
    // TODO: HashMap<String, Integer> items = new HashMap<>();

    void add(String item) {
        // TODO: getOrDefault the old count, add 1, then put it back
    }

    boolean has(String item) {
        return false;
    }

    String list() {
        // TODO: use StringBuilder and loop through items.keySet()
        return "";
    }

    static String healthBar(int health) {
        // TODO: use StringBuilder to draw 10 # or - blocks
        return "";
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Inventory bag = new Inventory();
        bag.add("Glow berry");
        bag.add("Glow berry");
        bag.add("Bat wing");
        System.out.println(bag.list());
        System.out.println("Has berry? " + bag.has("Glow berry"));
        System.out.println(Inventory.healthBar(60));
    }
}`,
        expect: ['Glow berry', 'Has berry? true', '[######----] 60 HP'],
        expectMsg: 'The bag should count Glow berry twice, report that it has one, and draw six filled health blocks for 60 HP.',
        reference: REF.inventory
      }
    },

    {
      id: 'game',
      title: 'Run the Deep Caverns',
      goal: 'Assemble a complete Deep Caverns playthrough',
      concepts: ['main method', 'Random seed', 'game loop', 'boss phase', 'integration'],
      brief: 'All the pieces now connect. The Game directs typed commands, polymorphic enemies, random-but-repeatable damage, boss phases, loot and the final victory line.',
      examples: [
        {
          title: 'A seed repeats random choices',
          teach: '<b>Random</b> makes varied damage, but <code>new Random(7)</code> gives it a fixed seed. A seed is a starting number for the random sequence. Using the same seed makes this lesson repeat the same playthrough every run.',
          code: `public class Game {
    public static void main(String[] args) {
        Random first = new Random(7);
        Random second = new Random(7);
        System.out.println(first.nextInt(3));
        System.out.println(second.nextInt(3));
    }
}`,
          tryThis: 'Change both seeds from 7 to 9. The two printed numbers still match, but may be different from before.'
        },
        {
          title: 'A battle method joins objects',
          teach: 'A method can receive several objects as parameters. This <code>fight</code> method takes a hero, a foe and Random, then lets each side use its own attack method. The base type keeps the method ready for many kinds of foe.',
          code: `class Entity {
    String name;
    int health;
    Entity(String name, int health) { this.name = name; this.health = health; }
    int attack(Random random) { return 4 + random.nextInt(2); }
}
class Hero extends Entity {
    Hero() { super("Nova", 20); }
}
class Slime extends Entity {
    Slime() { super("Slime", 10); }
}

public class Game {
    static void fight(Hero hero, Entity foe, Random random) {
        int hit = hero.attack(random);
        foe.health = foe.health - hit;
        System.out.println(hero.name + " hits " + foe.name + " for " + hit);
    }
    public static void main(String[] args) {
        fight(new Hero(), new Slime(), new Random(7));
    }
}`,
          tryThis: 'Call fight a second time with another new Slime. The same method can run both battles.'
        },
        {
          title: 'The ending checks survival',
          teach: 'After each fight, the game tests the hero\'s state. <code>return</code> ends main early on a loss. If the loop finishes, the code after it is the clear win ending.',
          code: `public class Game {
    public static void main(String[] args) {
        int health = 12;
        String[] rooms = { "slime", "bat" };
        for (String room : rooms) {
            health = health - 4;
            System.out.println("Cleared " + room + ", health " + health);
            if (health <= 0) {
                System.out.println("Game over.");
                return;
            }
        }
        System.out.println("Deep Caverns cleared. YOU WIN!");
    }
}`,
          tryThis: 'Change the damage from 4 to 7 and see the game end early instead.'
        }
      ],
      build: {
        label: 'whole game',
        brief: 'Write the final Game. Make a seeded <code>Random(7)</code>, Hero and Inventory. Put Slime, Bat, Ghost and Boss into one <code>Entity[]</code>. For every foe, LOOK describes the tunnel, ATTACK drives each round, and REST restores a little health after a win. The fight method collects LootGuide loot and prints the health bar. Finish by printing the inventory and the clear win line.',
        checks: [
          ['public static void main', 'The main method.'],
          ['new Random(7)', 'A Random object with seed 7.'],
          ['Entity[] caves', 'One base-type array of cave enemies.'],
          ['new Slime()', 'A Slime in the game.'],
          ['new Bat()', 'A Bat in the game.'],
          ['new Ghost()', 'A Ghost in the game.'],
          ['new Boss()', 'The phase-changing Boss.'],
          ['CommandConsole.run', 'Typed command messages.'],
          ['LootGuide.find', 'Loot collected through LootGuide.'],
          ['YOU WIN', 'A clear win line.']
        ],
        starter: `public class Game {
    static void fight(Hero hero, Entity foe, Random random, Inventory bag) {
        // TODO: announce the foe, use LOOK, and describe the tunnel once
        // TODO: loop while both sides are alive; ATTACK drives every round
        // TODO: foe attacks back with a short action line and print Inventory.healthBar
        // TODO: when Nova wins, bag.add(LootGuide.find(foe))
    }

    public static void main(String[] args) {
        // TODO: print the Deep Caverns title
        // TODO: Random random = new Random(7);
        // TODO: make Hero Nova and an Inventory
        // TODO: Entity[] caves = { new Slime(), new Bat(), new Ghost(), new Boss() };
        // TODO: fight, survival check, then REST and recover health for every foe
        // TODO: show the health bar, inventory and a YOU WIN line
    }
}`,
        context: [REF.loot, REF.entity, REF.creatures, REF.commands, REF.inventory].join('\n\n'),
        harness: '',
        expect: ['DEEP CAVERNS CLEARED. YOU WIN.', 'PHASE TWO', 'Inventory:'],
        expectMsg: 'The finished playthrough should reach the boss phase, print the counted inventory, and end with the Deep Caverns win line.',
        reference: REF.game
      }
    }
  ];

  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 2,
    title: 'Deep Caverns',
    tagline: 'Objects that inherit',
    blurb: 'Nova travels below the old Crystal Run caves, where creature types share a base, loot has a promise, and the Crystal Warden changes phase. You build inheritance, polymorphism, interfaces, enums, maps and a complete battle game.',
    sections: SECTIONS,
    REF: REF,
    slotOf: { entity: 'entity', creatures: 'creatures', loot: 'loot', commands: 'commands', inventory: 'inventory', game: 'game' },
    assemble: ['loot', 'entity', 'creatures', 'commands', 'inventory', 'game']
  });
})(typeof window !== 'undefined' ? window : globalThis);
