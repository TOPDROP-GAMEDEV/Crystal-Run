/* Level 6 course content for CRYSTAL RUN — The Final Rift. */
(function (global) {
  const REF = {
    direction: `enum Direction {
    NORTH, SOUTH, EAST, WEST, WAIT
}`,
    interactable: `interface Interactable {
    void interact(Hero hero);
    String label();
}`,
    hero: `class Hero {
    String name;
    int health;
    int score;
    int crystals;
    Direction facing;

    Hero(String name) {
        this.name = name;
        this.health = 90;
        this.score = 0;
        this.crystals = 0;
        this.facing = Direction.NORTH;
    }

    void move(Direction direction) {
        facing = direction;
        switch (direction) {
            case NORTH:
                System.out.println(name + " moves north into the rift.");
                break;
            case SOUTH:
                System.out.println(name + " moves south through the echo gate.");
                break;
            case EAST:
                System.out.println(name + " moves east toward a crystal flare.");
                break;
            case WEST:
                System.out.println(name + " moves west into the shadow path.");
                break;
            default:
                System.out.println(name + " waits and listens to the rift.");
                break;
        }
    }

    void gainCrystal(int amount) {
        crystals = crystals + amount;
        score = score + amount * 25;
        System.out.println("Crystals: " + crystals + ", score: " + score);
    }

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
        System.out.println(name + " has " + health + " HP.");
    }

    boolean isAlive() {
        return health > 0;
    }
}`,
    zones: `class CrystalCache implements Interactable {
    int crystals;

    CrystalCache(int crystals) {
        this.crystals = crystals;
    }

    public String label() {
        return "Crystal Cache";
    }

    public void interact(Hero hero) {
        System.out.println("Nova opens a " + label() + ".");
        hero.gainCrystal(crystals);
    }
}

class EchoTrap implements Interactable {
    int damage;

    EchoTrap(int damage) {
        this.damage = damage;
    }

    public String label() {
        return "Echo Trap";
    }

    public void interact(Hero hero) {
        System.out.println(label() + " releases a shockwave.");
        hero.takeDamage(damage);
    }
}

class RiftGate implements Interactable {
    public String label() {
        return "Final Rift Gate";
    }

    public void interact(Hero hero) {
        if (hero.crystals >= 3) {
            System.out.println("The Final Rift Gate opens for " + hero.name + ".");
            hero.score = hero.score + 100;
        } else {
            System.out.println("The gate needs 3 crystals. Nova has " + hero.crystals + ".");
        }
    }
}`,
    save: `class SaveData {
    String heroName;
    int health;
    int score;
    int crystals;
    boolean completed;

    SaveData(Hero hero, boolean completed) {
        this.heroName = hero.name;
        this.health = hero.health;
        this.score = hero.score;
        this.crystals = hero.crystals;
        this.completed = completed;
    }

    String encode() {
        return heroName + "|" + health + "|" + score + "|" + crystals + "|" + completed;
    }

    void report() {
        System.out.println("=== SAVE SUMMARY ===");
        System.out.println("Hero: " + heroName);
        System.out.println("Health: " + health);
        System.out.println("Score: " + score);
        System.out.println("Crystals: " + crystals);
        System.out.println("Completed: " + completed);
    }
}`,
    game: `public class Game {
    static void runZone(Hero hero, Interactable zone) {
        System.out.println("Entering: " + zone.label());
        zone.interact(hero);
        System.out.println("");
    }

    static void finalBattle(Hero hero) {
        int guardianHealth = 55;
        System.out.println("The Eclipse Guardian rises from the Final Rift.");
        while (hero.isAlive() && guardianHealth > 0) {
            int hit = 14 + hero.crystals * 2;
            guardianHealth = guardianHealth - hit;
            System.out.println("Nova channels the crystals for " + hit + " damage.");
            if (guardianHealth > 0) {
                hero.takeDamage(12);
            }
        }
        if (hero.isAlive()) {
            hero.score = hero.score + 250;
            System.out.println("The Eclipse Guardian is defeated.");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== CRYSTAL RUN: THE FINAL RIFT ===");
        Hero nova = new Hero("Nova");
        nova.move(Direction.EAST);

        Interactable[] zones = {
            new CrystalCache(2),
            new EchoTrap(10),
            new CrystalCache(2),
            new RiftGate()
        };

        for (Interactable zone : zones) {
            runZone(nova, zone);
            if (!nova.isAlive()) {
                System.out.println("The rift closes around Nova.");
                return;
            }
        }

        finalBattle(nova);
        SaveData save = new SaveData(nova, nova.isAlive());
        save.report();
        System.out.println("Save code: " + save.encode());
        if (nova.isAlive()) {
            System.out.println("CRYSTAL RUN COMPLETE");
        }
    }
}`
  };

  const SECTIONS = [
    {
      id: 'direction', title: 'Choose fixed directions', goal: 'Use an enum for a safe set of choices',
      concepts: ['enum', 'constant', 'switch', 'choice', 'type'],
      brief: 'A rift route should only use known directions. An <b>enum</b> creates one named type containing a fixed set of allowed values.',
      examples: [
        { title: 'Make an enum', teach: 'An enum lists named constants. Java writes enum values in capitals by convention.', code: `enum Direction {
    NORTH, SOUTH, EAST, WEST
}

public class Game {
    public static void main(String[] args) {
        Direction direction = Direction.NORTH;
        System.out.println(direction);
    }
}`, tryThis: 'Set direction to EAST and run it again.' },
        { title: 'Enums prevent unclear text', teach: 'Using <code>Direction.EAST</code> is safer than writing a String such as "east" because Java checks that the choice exists.', code: `enum Direction { NORTH, SOUTH, EAST, WEST }

public class Game {
    public static void main(String[] args) {
        Direction move = Direction.WEST;
        if (move == Direction.WEST) {
            System.out.println("Shadow path chosen.");
        }
    }
}`, tryThis: 'Change WEST to NORTH in both places.' },
        { title: 'Switch on an enum', teach: 'A switch works cleanly with enum values. Each case describes one allowed direction.', code: `enum Direction { NORTH, SOUTH, EAST, WEST, WAIT }

public class Game {
    public static void main(String[] args) {
        Direction move = Direction.WAIT;
        switch (move) {
            case NORTH: System.out.println("Go north."); break;
            case EAST: System.out.println("Go east."); break;
            default: System.out.println("Wait or choose another route."); break;
        }
    }
}`, tryThis: 'Add a case for SOUTH.' }
      ],
      build: { label: 'Direction enum', brief: 'Create a Direction enum with NORTH, SOUTH, EAST, WEST and WAIT. Use one enum value in a switch.', checks: [['enum Direction', 'A Direction enum.'], ['NORTH', 'A north option.'], ['SOUTH', 'A south option.'], ['EAST', 'An east option.'], ['WEST', 'A west option.'], ['WAIT', 'A wait option.'], ['switch (', 'A switch using the direction.']], starter: `enum Direction {
    // TODO: list NORTH, SOUTH, EAST, WEST and WAIT
}` , context: '', harness: `public class Game {
    public static void main(String[] args) {
        Direction move = Direction.EAST;
        System.out.println("Move: " + move);
    }
}`, expect: ['Move: EAST'], expectMsg: 'The enum should provide the EAST direction value.', reference: REF.direction }
    },
    {
      id: 'hero', title: 'Guide Nova through the rift', goal: 'Use enum values to update hero actions',
      concepts: ['enum field', 'method parameter', 'switch', 'state', 'class'],
      brief: 'Nova’s move method accepts a Direction instead of unreliable text. The enum makes every movement option clear and checked.',
      examples: [
        { title: 'Accept an enum parameter', teach: 'A method parameter can use an enum type. Only values from that enum can be passed in.', code: `enum Direction { NORTH, SOUTH }
class Hero {
    void move(Direction direction) {
        System.out.println("Moving " + direction);
    }
}

public class Game {
    public static void main(String[] args) {
        new Hero().move(Direction.NORTH);
    }
}`, tryThis: 'Add EAST to the enum and call move with it.' },
        { title: 'Store the current facing', teach: 'A field can remember the hero’s latest direction. Assign the parameter to the field with <code>facing = direction</code>.', code: `enum Direction { NORTH, EAST }
class Hero {
    Direction facing = Direction.NORTH;
    void move(Direction direction) {
        facing = direction;
    }
}

public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero();
        hero.move(Direction.EAST);
        System.out.println(hero.facing);
    }
}`, tryThis: 'Start facing EAST, then move NORTH.' },
        { title: 'Use crystals for score', teach: 'Fields can track several parts of game state. Collecting crystals can also add points to the score.', code: `public class Game {
    public static void main(String[] args) {
        int crystals = 0;
        int score = 0;
        crystals = crystals + 2;
        score = score + 2 * 25;
        System.out.println(crystals + " crystals, score " + score);
    }
}`, tryThis: 'Collect three crystals instead of two.' }
      ],
      build: { label: 'rift hero', brief: 'Build Hero with name, health, score, crystals and facing. Add a <code>move(Direction)</code> method and a <code>gainCrystal</code> method.', checks: [['class Hero', 'A Hero class.'], ['Direction facing', 'A direction field.'], ['void move(Direction direction)', 'A typed movement method.'], ['switch (direction)', 'A direction switch.'], ['int crystals', 'Crystal count.'], ['void gainCrystal', 'A method to collect crystals.'], ['score = score +', 'Score increases.']], starter: `class Hero {
    String name;
    int health;
    int score;
    int crystals;
    Direction facing;

    Hero(String name) {
        // TODO: set starting hero state
    }

    void move(Direction direction) {
        // TODO: remember direction and switch on it
    }

    void gainCrystal(int amount) {
        // TODO: increase crystals and score
    }
}` , context: REF.direction, harness: `public class Game {
    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        nova.move(Direction.EAST);
        nova.gainCrystal(2);
    }
}`, expect: ['moves east', 'Crystals: 2', 'score: 50'], expectMsg: 'Nova should move east and gain two crystals worth 50 score.', reference: REF.hero }
    },
    {
      id: 'interface', title: 'Set a rule for rift zones', goal: 'Create an interface implemented by different classes',
      concepts: ['interface', 'implements', 'method contract', 'public', 'polymorphism'],
      brief: 'An <b>interface</b> is a promise: every class that implements it must provide the listed methods. This lets very different rift zones work through the same game system.',
      examples: [
        { title: 'Define a shared rule', teach: 'An interface lists method headers without their code. Classes that implement it must write the method bodies.', code: `interface Interactable {
    void interact();
}

class CrystalCache implements Interactable {
    public void interact() {
        System.out.println("Crystal collected.");
    }
}

public class Game {
    public static void main(String[] args) {
        new CrystalCache().interact();
    }
}`, tryThis: 'Create a Trap class that also implements Interactable.' },
        { title: 'Methods must be public', teach: 'Interface methods are public, so the implementing method must also be declared <code>public</code>.', code: `interface Interactable {
    String label();
}

class Gate implements Interactable {
    public String label() {
        return "Rift Gate";
    }
}

public class Game {
    public static void main(String[] args) {
        System.out.println(new Gate().label());
    }
}`, tryThis: 'Return a different label from the method.' },
        { title: 'One type, many zone objects', teach: 'An Interactable variable can refer to any class that implements the interface. Calling the shared method uses that object’s version.', code: `interface Interactable { void interact(); }
class Cache implements Interactable { public void interact() { System.out.println("Cache"); } }
class Trap implements Interactable { public void interact() { System.out.println("Trap"); } }

public class Game {
    public static void main(String[] args) {
        Interactable[] zones = {new Cache(), new Trap()};
        for (Interactable zone : zones) zone.interact();
    }
}`, tryThis: 'Add a Gate implementation to the zones array.' }
      ],
      build: { label: 'Interactable rule', brief: 'Create the Interactable interface with <code>interact(Hero)</code> and <code>label()</code>. Make a CrystalCache class implement both methods.', checks: [['interface Interactable', 'An interface.'], ['void interact(Hero hero)', 'An interact method rule.'], ['String label()', 'A label method rule.'], ['implements Interactable', 'A class implementing it.'], ['public void interact', 'A public interaction method.'], ['public String label', 'A public label method.']], starter: `interface Interactable {
    // TODO: require interact(Hero hero)
    // TODO: require label()
}

class CrystalCache implements Interactable {
    // TODO: implement both required methods
}` , context: [REF.direction, REF.hero].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        Interactable cache = new CrystalCache(2);
        System.out.println(cache.label());
        cache.interact(nova);
    }
}`, expect: ['Crystal Cache', 'Crystals: 2'], expectMsg: 'The cache should have a label and award two crystals.', reference: [REF.interactable, REF.zones].join('\n\n') }
    },
    {
      id: 'zones', title: 'Build the rift zones', goal: 'Make several classes follow one interface',
      concepts: ['implements', 'polymorphism', 'array', 'condition', 'game state'],
      brief: 'A cache rewards Nova, a trap causes damage and a gate checks crystal progress. They are different classes, but all share the Interactable rule.',
      examples: [
        { title: 'A cache changes score', teach: 'The cache calls a Hero method instead of changing fields directly. This keeps the scoring rule inside Hero.', code: `class Hero {
    void gainCrystal(int amount) { System.out.println("Gained " + amount); }
}
class Cache {
    void open(Hero hero) { hero.gainCrystal(2); }
}

public class Game {
    public static void main(String[] args) {
        new Cache().open(new Hero());
    }
}`, tryThis: 'Change the cache reward to 3.' },
        { title: 'A trap changes health', teach: 'Different zone classes can use different Hero methods while still sharing the same interface design.', code: `class Hero {
    int health = 90;
    void takeDamage(int damage) {
        health = health - damage;
        System.out.println("HP: " + health);
    }
}

public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero();
        hero.takeDamage(10);
    }
}`, tryThis: 'Use a damage amount of 15.' },
        { title: 'A gate checks a requirement', teach: 'The gate uses a condition to decide whether the required number of crystals has been collected.', code: `public class Game {
    public static void main(String[] args) {
        int crystals = 2;
        if (crystals >= 3) {
            System.out.println("Gate opens.");
        } else {
            System.out.println("Need more crystals.");
        }
    }
}`, tryThis: 'Change crystals to 3 and test the open path.' }
      ],
      build: { label: 'rift zones', brief: 'Create CrystalCache, EchoTrap and RiftGate classes that implement Interactable. Each must have a label and change Hero state when interacted with.', checks: [['class CrystalCache implements Interactable', 'A cache implementation.'], ['class EchoTrap implements Interactable', 'A trap implementation.'], ['class RiftGate implements Interactable', 'A gate implementation.'], ['hero.gainCrystal', 'The cache rewards crystals.'], ['hero.takeDamage', 'The trap causes damage.'], ['hero.crystals >= 3', 'The gate checks progress.']], starter: `class CrystalCache implements Interactable {
    // TODO: give crystals to hero
}

class EchoTrap implements Interactable {
    // TODO: damage hero
}

class RiftGate implements Interactable {
    // TODO: open only with enough crystals
}` , context: [REF.direction, REF.interactable, REF.hero].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        new CrystalCache(3).interact(nova);
        new EchoTrap(10).interact(nova);
        new RiftGate().interact(nova);
    }
}`, expect: ['Crystals: 3', 'Nova has 80 HP', 'Final Rift Gate opens'], expectMsg: 'The cache, trap and gate should each produce their own effect.', reference: REF.zones }
    },
    {
      id: 'save', title: 'Create a save summary', goal: 'Store key game information as a text record',
      concepts: ['data class', 'constructor', 'boolean', 'String', 'encoding'],
      brief: 'A full save system normally writes to a file, but first you can design the data it needs. A <b>save summary</b> stores Nova’s final state and turns it into a readable text code.',
      examples: [
        { title: 'Store a completed state', teach: 'A boolean has only two states: true or false. It is useful for whether a level was completed.', code: `public class Game {
    public static void main(String[] args) {
        boolean completed = true;
        System.out.println("Completed: " + completed);
    }
}`, tryThis: 'Change completed to false.' },
        { title: 'Build a compact text record', teach: 'Join values with a separator such as <code>|</code>. This makes a simple record that another program could split later.', code: `public class Game {
    public static void main(String[] args) {
        String name = "Nova";
        int score = 350;
        String saveCode = name + "|" + score + "|" + true;
        System.out.println(saveCode);
    }
}`, tryThis: 'Add a health value between name and score.' },
        { title: 'Report each saved value', teach: 'A report method makes save information clear for the player and helps test that fields were copied correctly.', code: `class SaveData {
    String heroName;
    int score;
    SaveData(String heroName, int score) {
        this.heroName = heroName;
        this.score = score;
    }
    void report() {
        System.out.println("Hero: " + heroName);
        System.out.println("Score: " + score);
    }
}

public class Game {
    public static void main(String[] args) {
        new SaveData("Nova", 350).report();
    }
}`, tryThis: 'Add a crystals field and report it.' }
      ],
      build: { label: 'save summary', brief: 'Write SaveData. Copy Nova’s name, health, score and crystals into fields, store whether the run completed, then print a report and encoded save code.', checks: [['class SaveData', 'A SaveData class.'], ['boolean completed', 'A completion field.'], ['SaveData(Hero hero', 'A constructor accepting Hero.'], ['String encode()', 'A method that makes text.'], ['"|"', 'A separator in the save code.'], ['void report()', 'A summary report method.']], starter: `class SaveData {
    String heroName;
    int health;
    int score;
    int crystals;
    boolean completed;

    SaveData(Hero hero, boolean completed) {
        // TODO: copy hero values
    }

    String encode() {
        return "";
    }

    void report() {
        // TODO: print save summary
    }
}` , context: [REF.direction, REF.hero].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        nova.gainCrystal(3);
        SaveData save = new SaveData(nova, true);
        save.report();
        System.out.println(save.encode());
    }
}`, expect: ['SAVE SUMMARY', 'Hero: Nova', 'Completed: true', 'Nova|90|75|3|true'], expectMsg: 'The save summary should report Nova’s state and encode it with separators.', reference: REF.save }
    },
    {
      id: 'finalrift', title: 'Assemble The Final Rift', goal: 'Finish Crystal Run with organised systems',
      concepts: ['integration', 'interface array', 'enum', 'battle loop', 'save summary'],
      brief: 'The final course combines safely chosen directions, interfaces, multiple zone types, the guardian battle and a save summary into the ending of Crystal Run.',
      examples: [
        { title: 'Run any Interactable zone', teach: 'A method that accepts Interactable can handle any zone class implementing the interface.', code: `interface Interactable { String label(); }
class Gate implements Interactable { public String label() { return "Gate"; } }

public class Game {
    static void enter(Interactable zone) {
        System.out.println("Entering " + zone.label());
    }
    public static void main(String[] args) {
        enter(new Gate());
    }
}`, tryThis: 'Add another implementation and pass it to enter.' },
        { title: 'Stop if health reaches zero', teach: 'After a dangerous zone, test <code>isAlive()</code>. Returning from main prevents later game events from running after defeat.', code: `public class Game {
    public static void main(String[] args) {
        int health = 0;
        if (health <= 0) {
            System.out.println("The rift closes.");
            return;
        }
        System.out.println("Continue.");
    }
}`, tryThis: 'Set health to 10 to continue past the check.' },
        { title: 'Write the ending last', teach: 'Only print the completion line after the final battle succeeds and the SaveData summary has been created.', code: `public class Game {
    public static void main(String[] args) {
        System.out.println("Guardian defeated.");
        System.out.println("=== SAVE SUMMARY ===");
        System.out.println("CRYSTAL RUN COMPLETE");
    }
}`, tryThis: 'Add a final score line before the completion message.' }
      ],
      build: { label: 'Final Rift game', brief: 'Create the final Game. Move Nova, run an Interactable array of rift zones, battle the Eclipse Guardian, make a SaveData summary and print the final completion line.', checks: [['public class Game', 'The final Game class.'], ['Hero nova', 'Nova object.'], ['nova.move(Direction.EAST)', 'An enum movement.'], ['Interactable[] zones', 'An interface array of zones.'], ['for (Interactable zone', 'A loop through zones.'], ['finalBattle', 'A guardian battle method.'], ['SaveData save', 'A final save summary.'], ['CRYSTAL RUN COMPLETE', 'The game completion line.']], starter: `public class Game {
    static void runZone(Hero hero, Interactable zone) {
        // TODO: label and interact with a zone
    }

    static void finalBattle(Hero hero) {
        // TODO: battle the Eclipse Guardian
    }

    public static void main(String[] args) {
        // TODO: create Nova and move using Direction
        // TODO: create and loop through rift zones
        // TODO: battle, save and print completion line
    }
}` , context: [REF.direction, REF.interactable, REF.hero, REF.zones, REF.save].join('\n\n'), harness: '', expect: ['THE FINAL RIFT', 'Final Rift Gate opens', 'Eclipse Guardian', 'SAVE SUMMARY', 'CRYSTAL RUN COMPLETE'], expectMsg: 'The final run should open the gate, defeat the guardian, show a save summary and complete Crystal Run.', reference: REF.game }
    }
  ];

  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 6,
    title: 'The Final Rift',
    tagline: 'Choose the path that ends the run',
    blurb: 'Nova enters the Final Rift and brings every system together. Learn enums, interfaces, organised game zones and save summaries before defeating the Eclipse Guardian.',
    sections: SECTIONS, REF: REF,
    slotOf: { direction: 'direction', hero: 'hero', interface: 'interactable', zones: 'zones', save: 'save', finalrift: 'game' },
    assemble: ['direction', 'interactable', 'hero', 'zones', 'save', 'game']
  });
})(typeof window !== 'undefined' ? window : globalThis);
