/* Level 4 course content for CRYSTAL RUN — Crystal Forge. */
(function (global) {
  const REF = {
    gear: `class Gear {
    String name;
    int power;

    Gear(String name, int power) {
        this.name = name;
        this.power = power;
    }

    void inspect() {
        System.out.println(name + " has power " + power + ".");
    }
}`,
    weapon: `class Weapon extends Gear {
    int strikes;

    Weapon(String name, int power, int strikes) {
        super(name, power);
        this.strikes = strikes;
    }

    @Override
    void inspect() {
        System.out.println(name + " is a weapon with " + power + " attack.");
    }

    int attackDamage() {
        return power * strikes;
    }
}`,
    armour: `class Armour extends Gear {
    int guard;

    Armour(String name, int power, int guard) {
        super(name, power);
        this.guard = guard;
    }

    @Override
    void inspect() {
        System.out.println(name + " is armour with " + guard + " guard.");
    }

    int block(int damage) {
        int remaining = damage - guard;
        if (remaining < 0) {
            remaining = 0;
        }
        return remaining;
    }
}`,
    forge: `class Forge {
    Gear[] blueprints;

    Forge() {
        blueprints = new Gear[] {
            new Weapon("Ember Blade", 12, 2),
            new Armour("Quartz Plate", 5, 6),
            new Weapon("Spark Hammer", 16, 1)
        };
    }

    void showBlueprints() {
        System.out.println("=== CRYSTAL FORGE ===");
        for (Gear gear : blueprints) {
            gear.inspect();
        }
    }

    Gear craft(int index) {
        if (index < 0 || index >= blueprints.length) {
            System.out.println("That blueprint does not exist.");
            return null;
        }
        Gear chosen = blueprints[index];
        System.out.println("Forged: " + chosen.name);
        return chosen;
    }
}`,
    hero: `class Hero {
    String name;
    int health;
    Weapon weapon;
    Armour armour;

    Hero(String name) {
        this.name = name;
        this.health = 80;
    }

    void equip(Gear gear) {
        if (gear instanceof Weapon) {
            weapon = (Weapon) gear;
            System.out.println(name + " equips " + weapon.name + ".");
        } else if (gear instanceof Armour) {
            armour = (Armour) gear;
            System.out.println(name + " equips " + armour.name + ".");
        }
    }

    int strike() {
        if (weapon == null) {
            return 5;
        }
        return weapon.attackDamage();
    }

    void takeDamage(int damage) {
        int received = damage;
        if (armour != null) {
            received = armour.block(damage);
        }
        health = health - received;
        if (health < 0) {
            health = 0;
        }
        System.out.println(name + " takes " + received + " damage. HP: " + health);
    }
}`,
    game: `public class Game {
    static void battle(Hero hero, String foe, int foeHealth, int foeDamage) {
        System.out.println("The " + foe + " challenges the forge.");
        while (hero.health > 0 && foeHealth > 0) {
            int hit = hero.strike();
            foeHealth = foeHealth - hit;
            System.out.println(hero.name + " deals " + hit + " damage.");
            if (foeHealth > 0) {
                hero.takeDamage(foeDamage);
            }
        }
        if (hero.health > 0) {
            System.out.println(foe + " defeated. The forge is safe.");
        }
    }

    public static void main(String[] args) {
        Forge forge = new Forge();
        Hero nova = new Hero("Nova");
        forge.showBlueprints();
        nova.equip(forge.craft(0));
        nova.equip(forge.craft(1));
        battle(nova, "Molten Sentinel", 42, 11);
        System.out.println("CRYSTAL FORGE COMPLETE");
    }
}`
  };

  const SECTIONS = [
    {
      id: 'base', title: 'Build a gear blueprint', goal: 'Store information shared by every piece of gear',
      concepts: ['class', 'fields', 'constructor', 'object', 'shared data'],
      brief: 'The forge makes different items, but every item has a name and power. A <b>base class</b> stores the details that all gear shares.',
      examples: [
        { title: 'One class makes many objects', teach: 'A class is a blueprint. Each object made from it gets its own field values.', code: `class Gear {
    String name;
    int power;

    Gear(String name, int power) {
        this.name = name;
        this.power = power;
    }
}

public class Game {
    public static void main(String[] args) {
        Gear sword = new Gear("Crystal Sword", 12);
        Gear shield = new Gear("Moon Shield", 6);
        System.out.println(sword.name);
        System.out.println(shield.power);
    }
}` , tryThis: 'Create a third <code>Gear</code> object with your own name and power.' },
        { title: 'Constructors set up objects', teach: 'A constructor runs when <code>new</code> creates an object. <code>this.name</code> means the field belonging to this object.', code: `class Gear {
    String name;
    int power;

    Gear(String name, int power) {
        this.name = name;
        this.power = power;
    }
}

public class Game {
    public static void main(String[] args) {
        Gear relic = new Gear("Sun Crystal", 20);
        System.out.println(relic.name + " power: " + relic.power);
    }
}` , tryThis: 'Change the power argument from 20 to 30 and run it again.' },
        { title: 'Methods use object fields', teach: 'A method in a class can read that object’s fields. This lets each gear object describe itself.', code: `class Gear {
    String name;
    int power;

    Gear(String name, int power) {
        this.name = name;
        this.power = power;
    }

    void inspect() {
        System.out.println(name + " has power " + power);
    }
}

public class Game {
    public static void main(String[] args) {
        Gear relic = new Gear("Sun Crystal", 20);
        relic.inspect();
    }
}` , tryThis: 'Make a second object and call <code>inspect()</code> on it.' }
      ],
      build: { label: 'gear blueprint', brief: 'Create a <code>Gear</code> class with <code>name</code> and <code>power</code> fields, a constructor, and an <code>inspect()</code> method.', checks: [['class Gear', 'A Gear class.'], ['String name', 'A name field.'], ['int power', 'A power field.'], ['Gear(String name, int power)', 'A constructor.'], ['this.name', 'Store the name field.'], ['void inspect', 'A method that reports the gear.']], starter: `class Gear {
    String name;
    int power;

    Gear(String name, int power) {
        // TODO: store both values
    }

    void inspect() {
        // TODO: describe this gear
    }
}` , context: '', harness: `public class Game {
    public static void main(String[] args) {
        Gear gear = new Gear("Ember Blade", 12);
        gear.inspect();
    }
}`, expect: ['Ember Blade', '12'], expectMsg: 'The gear should print its name and power.', reference: REF.gear }
    },
    {
      id: 'weapon', title: 'Forge a weapon subclass', goal: 'Create a specialised class using inheritance',
      concepts: ['inheritance', 'extends', 'super', 'subclass', 'parent class'],
      brief: 'A <b>subclass</b> starts with everything in its parent class, then adds details of its own. A weapon is gear, so it can <code>extend</code> Gear.',
      examples: [
        { title: 'Extend the parent class', teach: '<code>extends Gear</code> means Weapon inherits the name and power fields from Gear.', code: `class Gear {
    String name;
    Gear(String name) { this.name = name; }
}

class Weapon extends Gear {
    Weapon(String name) {
        super(name);
    }
}

public class Game {
    public static void main(String[] args) {
        Weapon blade = new Weapon("Ember Blade");
        System.out.println(blade.name);
    }
}`, tryThis: 'Create another Weapon with a different name.' },
        { title: 'Super calls the parent constructor', teach: 'The first job of a subclass constructor is often calling <code>super(...)</code>. It sends shared values to the parent constructor.', code: `class Gear {
    String name;
    int power;
    Gear(String name, int power) {
        this.name = name;
        this.power = power;
    }
}

class Weapon extends Gear {
    int strikes;
    Weapon(String name, int power, int strikes) {
        super(name, power);
        this.strikes = strikes;
    }
}

public class Game {
    public static void main(String[] args) {
        Weapon blade = new Weapon("Ember Blade", 12, 2);
        System.out.println(blade.power + " / " + blade.strikes);
    }
}`, tryThis: 'Change strikes to 3 and check the printed result.' },
        { title: 'Add weapon behaviour', teach: 'A subclass can add methods that do not belong on every Gear object. Here only weapons calculate attack damage.', code: `class Weapon {
    int power;
    int strikes;
    Weapon(int power, int strikes) {
        this.power = power;
        this.strikes = strikes;
    }
    int attackDamage() {
        return power * strikes;
    }
}

public class Game {
    public static void main(String[] args) {
        Weapon blade = new Weapon(12, 2);
        System.out.println("Damage: " + blade.attackDamage());
    }
}`, tryThis: 'Try a weapon with power 9 and strikes 3.' }
      ],
      build: { label: 'weapon class', brief: 'Make <code>Weapon extends Gear</code>. Use <code>super</code> for inherited fields, add a strikes field, and return attack damage.', checks: [['class Weapon extends Gear', 'A Weapon subclass.'], ['super(name, power)', 'Call the Gear constructor.'], ['int strikes', 'A strikes field.'], ['Weapon(String name', 'A Weapon constructor.'], ['int attackDamage', 'A method that returns damage.'], ['return power * strikes', 'Multiply weapon power and strikes.']], starter: `class Weapon extends Gear {
    int strikes;

    Weapon(String name, int power, int strikes) {
        // TODO: call super and store strikes
    }

    int attackDamage() {
        return 0;
    }
}` , context: REF.gear, harness: `public class Game {
    public static void main(String[] args) {
        Weapon blade = new Weapon("Ember Blade", 12, 2);
        System.out.println("Damage: " + blade.attackDamage());
    }
}`, expect: ['Damage: 24'], expectMsg: 'Power 12 with two strikes should deal 24 damage.', reference: REF.weapon }
    },
    {
      id: 'armour', title: 'Protect with armour', goal: 'Create another specialised gear type',
      concepts: ['inheritance', 'subclass', 'condition', 'return', 'damage'],
      brief: 'Armour is also Gear, but its special job is reducing incoming damage. Different subclasses can reuse the same parent while behaving differently.',
      examples: [
        { title: 'A second subclass', teach: 'More than one class can extend the same parent. Weapon and Armour both inherit shared gear fields.', code: `class Gear {
    String name;
    Gear(String name) { this.name = name; }
}
class Weapon extends Gear { Weapon(String name) { super(name); } }
class Armour extends Gear { Armour(String name) { super(name); } }

public class Game {
    public static void main(String[] args) {
        Weapon weapon = new Weapon("Blade");
        Armour armour = new Armour("Plate");
        System.out.println(weapon.name + " and " + armour.name);
    }
}`, tryThis: 'Add a third Gear subclass called Potion.' },
        { title: 'Reduce damage safely', teach: 'After subtracting guard from damage, check whether the answer became negative. Damage received should never be below zero.', code: `public class Game {
    public static void main(String[] args) {
        int damage = 5;
        int guard = 8;
        int remaining = damage - guard;
        if (remaining < 0) {
            remaining = 0;
        }
        System.out.println("Damage received: " + remaining);
    }
}`, tryThis: 'Set damage to 14. The result should now be 6.' },
        { title: 'Give armour a method', teach: 'A method can accept a value, calculate a result, then return it. The hero can use the returned number to update health.', code: `class Armour {
    int guard;
    Armour(int guard) { this.guard = guard; }
    int block(int damage) {
        int remaining = damage - guard;
        if (remaining < 0) remaining = 0;
        return remaining;
    }
}

public class Game {
    public static void main(String[] args) {
        Armour plate = new Armour(6);
        System.out.println(plate.block(11));
    }
}`, tryThis: 'Test an attack smaller than the guard value.' }
      ],
      build: { label: 'armour class', brief: 'Create <code>Armour extends Gear</code>. Give it a guard field and a <code>block</code> method that never returns negative damage.', checks: [['class Armour extends Gear', 'An Armour subclass.'], ['super(name, power)', 'Use the parent constructor.'], ['int guard', 'A guard field.'], ['int block', 'A block method.'], ['damage - guard', 'Subtract guard from damage.'], ['if (remaining < 0)', 'Prevent negative damage.']], starter: `class Armour extends Gear {
    int guard;

    Armour(String name, int power, int guard) {
        // TODO: call super and store guard
    }

    int block(int damage) {
        // TODO: reduce damage but never below zero
        return 0;
    }
}` , context: REF.gear, harness: `public class Game {
    public static void main(String[] args) {
        Armour plate = new Armour("Quartz Plate", 5, 6);
        System.out.println("Received: " + plate.block(11));
        System.out.println("Received: " + plate.block(4));
    }
}`, expect: ['Received: 5', 'Received: 0'], expectMsg: 'The armour should reduce 11 damage to 5 and fully block 4 damage.', reference: REF.armour }
    },
    {
      id: 'override', title: 'Override gear reports', goal: 'Give subclasses their own version of a shared method',
      concepts: ['overriding', '@Override', 'polymorphism', 'method', 'parent reference'],
      brief: 'An inherited method can be replaced with a version that suits the subclass. This is called <b>method overriding</b>.',
      examples: [
        { title: 'Replace an inherited method', teach: 'The child class can write a method with the same name and parameters as the parent method.', code: `class Gear {
    void inspect() { System.out.println("A piece of gear."); }
}
class Weapon extends Gear {
    void inspect() { System.out.println("A weapon."); }
}

public class Game {
    public static void main(String[] args) {
        Weapon blade = new Weapon();
        blade.inspect();
    }
}`, tryThis: 'Change the weapon message to name a fantasy weapon.' },
        { title: 'Use the Override label', teach: '<code>@Override</code> asks Java to check that you really are replacing a parent method. It helps spot spelling mistakes.', code: `class Gear {
    void inspect() { System.out.println("Gear"); }
}
class Armour extends Gear {
    @Override
    void inspect() { System.out.println("Protective armour"); }
}

public class Game {
    public static void main(String[] args) {
        new Armour().inspect();
    }
}`, tryThis: 'Remove the annotation, then add it back. The output does not change, but the check is useful.' },
        { title: 'One Gear array, different results', teach: 'A variable of type Gear can hold any subclass object. When <code>inspect()</code> runs, Java uses the object’s own version.', code: `class Gear { void inspect() { System.out.println("Gear"); } }
class Weapon extends Gear { void inspect() { System.out.println("Weapon"); } }
class Armour extends Gear { void inspect() { System.out.println("Armour"); } }

public class Game {
    public static void main(String[] args) {
        Gear[] gear = {new Weapon(), new Armour()};
        for (Gear item : gear) {
            item.inspect();
        }
    }
}`, tryThis: 'Add another subclass object to the array.' }
      ],
      build: { label: 'gear inspection', brief: 'Override <code>inspect()</code> in both Weapon and Armour, then loop through a Gear array so each item gives its own report.', checks: [['@Override', 'Override annotations.'], ['void inspect()', 'An inspect method in each subclass.'], ['Gear[]', 'An array with Gear references.'], ['new Weapon', 'A Weapon object.'], ['new Armour', 'An Armour object.'], ['for (Gear', 'A loop through every item.']], starter: `class Weapon extends Gear {
    Weapon(String name, int power, int strikes) { super(name, power); }
    // TODO: override inspect
}

class Armour extends Gear {
    Armour(String name, int power, int guard) { super(name, power); }
    // TODO: override inspect
}` , context: REF.gear, harness: `public class Game {
    public static void main(String[] args) {
        Gear[] gear = {
            new Weapon("Ember Blade", 12, 2),
            new Armour("Quartz Plate", 5, 6)
        };
        for (Gear item : gear) {
            item.inspect();
        }
    }
}`, expect: ['Ember Blade', 'Quartz Plate'], expectMsg: 'Each subclass should describe its own gear item.', reference: [REF.weapon, REF.armour].join('\n\n') }
    },
    {
      id: 'forge', title: 'Choose a forge blueprint', goal: 'Store and craft multiple gear objects',
      concepts: ['array', 'polymorphism', 'index', 'bounds check', 'null'],
      brief: 'The forge keeps many blueprints in one array. Because each object is Gear or a Gear subclass, one array can hold weapons and armour together.',
      examples: [
        { title: 'Store gear in an array', teach: 'Arrays can store object references. A Gear array can contain objects from subclasses because they are all types of Gear.', code: `class Gear { String name; Gear(String name) { this.name = name; } }
class Weapon extends Gear { Weapon(String name) { super(name); } }
class Armour extends Gear { Armour(String name) { super(name); } }

public class Game {
    public static void main(String[] args) {
        Gear[] blueprints = {new Weapon("Blade"), new Armour("Plate")};
        System.out.println(blueprints[0].name);
        System.out.println(blueprints[1].name);
    }
}`, tryThis: 'Add one more gear object to the array.' },
        { title: 'Loop through blueprints', teach: 'A for-each loop gives a clear name to each object in an array without manually writing an index.', code: `class Gear {
    String name;
    Gear(String name) { this.name = name; }
}

public class Game {
    public static void main(String[] args) {
        Gear[] blueprints = {new Gear("Blade"), new Gear("Plate")};
        for (Gear item : blueprints) {
            System.out.println("Blueprint: " + item.name);
        }
    }
}`, tryThis: 'Print a number before each blueprint using a normal indexed loop.' },
        { title: 'Check an index first', teach: 'Before using an array position, check that it is at least zero and smaller than the array length.', code: `public class Game {
    public static void main(String[] args) {
        String[] names = {"Blade", "Plate"};
        int choice = 2;
        if (choice >= 0 && choice < names.length) {
            System.out.println(names[choice]);
        } else {
            System.out.println("No blueprint at that number.");
        }
    }
}`, tryThis: 'Set choice to 1 to select Plate.' }
      ],
      build: { label: 'forge system', brief: 'Build <code>Forge</code> with a Gear array, a method to display blueprints, and a safe method that returns the selected gear.', checks: [['class Forge', 'A Forge class.'], ['Gear[] blueprints', 'A gear blueprint array.'], ['new Weapon', 'A weapon blueprint.'], ['new Armour', 'An armour blueprint.'], ['void showBlueprints', 'A method that lists blueprints.'], ['Gear craft', 'A method that returns selected gear.']], starter: `class Forge {
    Gear[] blueprints;

    Forge() {
        // TODO: create Weapon and Armour blueprints
    }

    void showBlueprints() {
        // TODO: inspect every blueprint
    }

    Gear craft(int index) {
        // TODO: safely return one blueprint
        return null;
    }
}` , context: [REF.gear, REF.weapon, REF.armour].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Forge forge = new Forge();
        forge.showBlueprints();
        Gear chosen = forge.craft(0);
        System.out.println("Chosen: " + chosen.name);
    }
}`, expect: ['CRYSTAL FORGE', 'Chosen: Ember Blade'], expectMsg: 'The forge should list blueprints and return the first one.', reference: REF.forge }
    },
    {
      id: 'forgegame', title: 'Assemble Crystal Forge', goal: 'Equip Nova and defeat the forge guardian',
      concepts: ['instanceof', 'casting', 'battle loop', 'integration', 'inheritance'],
      brief: 'Now Nova can equip specialised Gear objects. The final game combines inheritance, overriding, gear selection and a battle loop.',
      examples: [
        { title: 'Check an object type', teach: '<code>instanceof</code> checks whether an object belongs to a class. After the check, a cast lets you use subclass methods.', code: `class Gear { }
class Weapon extends Gear { int damage() { return 12; } }

public class Game {
    public static void main(String[] args) {
        Gear item = new Weapon();
        if (item instanceof Weapon) {
            Weapon weapon = (Weapon) item;
            System.out.println(weapon.damage());
        }
    }
}`, tryThis: 'Make an Armour class and add a second instanceof check.' },
        { title: 'Repeat battle rounds', teach: 'A <code>while</code> loop is useful when a fight has no fixed number of turns. Continue while both fighters have health left.', code: `public class Game {
    public static void main(String[] args) {
        int heroHealth = 20;
        int foeHealth = 15;
        while (heroHealth > 0 && foeHealth > 0) {
            foeHealth = foeHealth - 8;
            System.out.println("Foe HP: " + foeHealth);
            if (foeHealth > 0) heroHealth = heroHealth - 5;
        }
        System.out.println("Battle finished.");
    }
}`, tryThis: 'Change hero damage from 8 to 5 and watch how many rounds occur.' },
        { title: 'Put systems in order', teach: 'The main method reads like the game story: show forge, choose gear, equip it, battle, then print a final result.', code: `public class Game {
    public static void main(String[] args) {
        System.out.println("Open the forge.");
        System.out.println("Choose a weapon.");
        System.out.println("Defeat the guardian.");
        System.out.println("CRYSTAL FORGE COMPLETE");
    }
}`, tryThis: 'Add a line describing the armour selection.' }
      ],
      build: { label: 'Crystal Forge game', brief: 'Use Forge, Hero, Weapon and Armour together. Equip Nova, battle the Molten Sentinel, and end with the Crystal Forge completion line.', checks: [['public class Game', 'The final Game class.'], ['Forge forge', 'A forge object.'], ['Hero nova', 'A hero object.'], ['nova.equip', 'Gear equipped by Nova.'], ['while (hero.health > 0', 'A battle loop.'], ['hero.strike()', 'Weapon damage in battle.'], ['CRYSTAL FORGE COMPLETE', 'A victory line.']], starter: `public class Game {
    static void battle(Hero hero, String foe, int foeHealth, int foeDamage) {
        // TODO: repeat turns while both fighters are alive
    }

    public static void main(String[] args) {
        // TODO: create forge and hero
        // TODO: craft and equip a weapon and armour
        // TODO: battle the guardian
        // TODO: print completion message
    }
}` , context: [REF.gear, REF.weapon, REF.armour, REF.forge, REF.hero].join('\n\n'), harness: '', expect: ['CRYSTAL FORGE', 'Molten Sentinel', 'CRYSTAL FORGE COMPLETE'], expectMsg: 'The game should show the forge, battle the guardian and finish successfully.', reference: REF.game }
    }
  ];

  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 4,
    title: 'Crystal Forge',
    tagline: 'Gear has a legacy',
    blurb: 'Nova enters the Crystal Forge to build weapons and armour. Learn inheritance, subclasses, super constructors and method overriding while preparing for a guardian battle.',
    sections: SECTIONS, REF: REF,
    slotOf: { base: 'gear', weapon: 'weapon', armour: 'armour', override: 'weapon', forge: 'forge', forgegame: 'game' },
    assemble: ['gear', 'weapon', 'armour', 'forge', 'hero', 'game']
  });
})(typeof window !== 'undefined' ? window : globalThis);
