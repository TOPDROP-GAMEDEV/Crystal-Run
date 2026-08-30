/* Level 5 course content for CRYSTAL RUN — Vault of Relics. */
(function (global) {
  const REF = {
    item: `class Item {
    String name;
    String type;
    int value;

    Item(String name, String type, int value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }

    void describe() {
        System.out.println(name + " [" + type + "] value " + value);
    }
}`,
    inventory: `import java.util.ArrayList;

class Inventory {
    ArrayList<Item> items = new ArrayList<>();

    void add(Item item) {
        items.add(item);
        System.out.println("Collected: " + item.name);
    }

    void show() {
        System.out.println("=== RELIC INVENTORY ===");
        if (items.size() == 0) {
            System.out.println("The pack is empty.");
        }
        for (Item item : items) {
            item.describe();
        }
    }

    Item find(String name) {
        for (Item item : items) {
            if (item.name.equals(name)) {
                return item;
            }
        }
        return null;
    }

    boolean remove(String name) {
        Item found = find(name);
        if (found == null) {
            return false;
        }
        items.remove(found);
        System.out.println("Used: " + found.name);
        return true;
    }
}`,
    hero: `class Hero {
    String name;
    int health;
    int relicPower;
    Inventory inventory;

    Hero(String name) {
        this.name = name;
        this.health = 75;
        this.relicPower = 0;
        this.inventory = new Inventory();
    }

    void collect(Item item) {
        inventory.add(item);
    }

    void equip(String name) {
        Item item = inventory.find(name);
        if (item == null) {
            System.out.println("Nova cannot equip " + name + ".");
            return;
        }
        if (item.type.equals("relic")) {
            relicPower = item.value;
            System.out.println(name + " is now equipped. Relic power: " + relicPower);
        } else {
            System.out.println(name + " is not an equippable relic.");
        }
    }

    void usePotion(String name) {
        Item item = inventory.find(name);
        if (item != null && item.type.equals("potion")) {
            health = health + item.value;
            inventory.remove(name);
            System.out.println(name + " restores " + item.value + " HP. Health: " + health);
        } else {
            System.out.println("No usable potion named " + name + ".");
        }
    }

    int attack() {
        return 10 + relicPower;
    }
}`,
    vault: `class Vault {
    Item[] chambers = {
        new Item("Glimmer Shard", "relic", 8),
        new Item("Moon Tonic", "potion", 20),
        new Item("Rift Key", "key", 1),
        new Item("Solar Core", "relic", 14)
    };

    void explore(Hero hero) {
        System.out.println("=== VAULT OF RELICS ===");
        for (Item item : chambers) {
            System.out.println("Nova finds " + item.name + ".");
            hero.collect(item);
        }
    }

    boolean unlock(Hero hero) {
        Item key = hero.inventory.find("Rift Key");
        if (key == null) {
            System.out.println("The vault gate needs the Rift Key.");
            return false;
        }
        hero.inventory.remove("Rift Key");
        System.out.println("The Rift Key opens the vault gate.");
        return true;
    }
}`,
    game: `public class Game {
    static void fight(Hero hero, String foe, int foeHealth) {
        System.out.println("Battle: " + foe + " guards the relic chamber.");
        while (hero.health > 0 && foeHealth > 0) {
            int damage = hero.attack();
            foeHealth = foeHealth - damage;
            System.out.println(hero.name + " attacks for " + damage + ". Foe HP: " + foeHealth);
            if (foeHealth > 0) {
                hero.health = hero.health - 9;
                System.out.println(foe + " strikes. Nova HP: " + hero.health);
            }
        }
        if (hero.health > 0) {
            System.out.println(foe + " fades into the vault mist.");
        }
    }

    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        Vault vault = new Vault();
        vault.explore(nova);
        nova.inventory.show();
        nova.equip("Solar Core");
        nova.usePotion("Moon Tonic");
        if (vault.unlock(nova)) {
            fight(nova, "Relic Wraith", 44);
        }
        System.out.println("");
        nova.inventory.show();
        System.out.println("VAULT OF RELICS COMPLETE");
    }
}`
  };

  const SECTIONS = [
    {
      id: 'item', title: 'Create a relic item', goal: 'Represent one collectible object',
      concepts: ['class', 'object', 'String', 'int', 'constructor'],
      brief: 'The vault contains many collectible objects. An <b>Item</b> class gives every relic a name, type and value.',
      examples: [
        { title: 'Objects hold related data', teach: 'Fields group details that belong to one thing. This item has a name, a category and a value.', code: `class Item {
    String name;
    String type;
    int value;
}

public class Game {
    public static void main(String[] args) {
        Item relic = new Item();
        relic.name = "Glimmer Shard";
        relic.type = "relic";
        relic.value = 8;
        System.out.println(relic.name);
    }
}`, tryThis: 'Create a second Item object for a potion.' },
        { title: 'Use a constructor', teach: 'A constructor makes it quicker and safer to create a fully set-up item.', code: `class Item {
    String name;
    int value;
    Item(String name, int value) {
        this.name = name;
        this.value = value;
    }
}

public class Game {
    public static void main(String[] args) {
        Item relic = new Item("Glimmer Shard", 8);
        System.out.println(relic.name + ": " + relic.value);
    }
}`, tryThis: 'Make an item worth 20 and print it.' },
        { title: 'Describe an item', teach: 'A method can turn an item’s field values into a readable game message.', code: `class Item {
    String name;
    String type;
    Item(String name, String type) {
        this.name = name;
        this.type = type;
    }
    void describe() {
        System.out.println(name + " is a " + type);
    }
}

public class Game {
    public static void main(String[] args) {
        new Item("Moon Tonic", "potion").describe();
    }
}`, tryThis: 'Use describe on a relic and a key.' }
      ],
      build: { label: 'Item class', brief: 'Write <code>Item</code> with name, type and value fields. Add a constructor and a <code>describe()</code> method.', checks: [['class Item', 'An Item class.'], ['String name', 'A name field.'], ['String type', 'A type field.'], ['int value', 'A value field.'], ['Item(String name', 'A constructor.'], ['void describe', 'A description method.']], starter: `class Item {
    String name;
    String type;
    int value;

    Item(String name, String type, int value) {
        // TODO: store fields
    }

    void describe() {
        // TODO: print item details
    }
}` , context: '', harness: `public class Game {
    public static void main(String[] args) {
        Item relic = new Item("Glimmer Shard", "relic", 8);
        relic.describe();
    }
}`, expect: ['Glimmer Shard', 'relic', '8'], expectMsg: 'The item description should include its name, type and value.', reference: REF.item }
    },
    {
      id: 'list', title: 'Grow an inventory', goal: 'Store a changing number of items with ArrayList',
      concepts: ['ArrayList', 'add', 'size', 'import', 'collection'],
      brief: 'An array has a fixed length, but an <b>ArrayList</b> can grow as Nova finds more items. It is ideal for a game inventory.',
      examples: [
        { title: 'Import ArrayList', teach: 'Java keeps ArrayList in the util library, so add an import line before classes that use it.', code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> bag = new ArrayList<>();
        bag.add("Key");
        System.out.println(bag.size());
    }
}`, tryThis: 'Add two more Strings and check the new size.' },
        { title: 'Add object items', teach: 'The type inside angle brackets tells Java what the list may store. <code>ArrayList&lt;Item&gt;</code> stores Item objects.', code: `import java.util.ArrayList;

class Item {
    String name;
    Item(String name) { this.name = name; }
}

public class Game {
    public static void main(String[] args) {
        ArrayList<Item> bag = new ArrayList<>();
        bag.add(new Item("Glimmer Shard"));
        System.out.println(bag.get(0).name);
    }
}`, tryThis: 'Add Moon Tonic and print the item at index 1.' },
        { title: 'Lists can keep growing', teach: '<code>add</code> puts an object at the end of the list. <code>size</code> changes automatically as items are collected.', code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> inventory = new ArrayList<>();
        inventory.add("Shard");
        inventory.add("Potion");
        inventory.add("Key");
        System.out.println("Items: " + inventory.size());
    }
}`, tryThis: 'Add a fourth item and print the list size again.' }
      ],
      build: { label: 'inventory list', brief: 'Start an Inventory class with <code>ArrayList&lt;Item&gt; items</code>. Add an item method and report the current size.', checks: [['import java.util.ArrayList', 'The ArrayList import.'], ['class Inventory', 'An Inventory class.'], ['ArrayList<Item>', 'A list that stores Item objects.'], ['new ArrayList<>', 'Create an empty list.'], ['items.add', 'Add collected items.'], ['items.size()', 'Read the list size.']], starter: `import java.util.ArrayList;

class Inventory {
    ArrayList<Item> items = new ArrayList<>();

    void add(Item item) {
        // TODO: add item to list
    }
}` , context: REF.item, harness: `public class Game {
    public static void main(String[] args) {
        Inventory inventory = new Inventory();
        inventory.add(new Item("Glimmer Shard", "relic", 8));
        System.out.println("Items: " + inventory.items.size());
    }
}`, expect: ['Collected: Glimmer Shard', 'Items: 1'], expectMsg: 'The inventory should collect one item and report a size of 1.', reference: REF.inventory }
    },
    {
      id: 'show', title: 'Show every relic', goal: 'Loop through an ArrayList of objects',
      concepts: ['for-each loop', 'ArrayList', 'object method', 'empty list', 'size'],
      brief: 'A for-each loop visits every item already in the inventory. This makes a clear list without needing to know how many relics Nova has.',
      examples: [
        { title: 'Loop through a list', teach: 'Use <code>for (Type name : list)</code> to take one object from the list at a time.', code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> items = new ArrayList<>();
        items.add("Shard");
        items.add("Potion");
        for (String item : items) {
            System.out.println(item);
        }
    }
}`, tryThis: 'Add Key and check that the loop prints all three names.' },
        { title: 'Call each object method', teach: 'When a list holds objects, the loop variable is one object. You can call its methods directly.', code: `import java.util.ArrayList;

class Item {
    String name;
    Item(String name) { this.name = name; }
    void describe() { System.out.println("Found " + name); }
}

public class Game {
    public static void main(String[] args) {
        ArrayList<Item> items = new ArrayList<>();
        items.add(new Item("Shard"));
        items.add(new Item("Potion"));
        for (Item item : items) {
            item.describe();
        }
    }
}`, tryThis: 'Change the describe message to include an exclamation mark.' },
        { title: 'Report an empty pack', teach: 'Before looping, a condition can give useful feedback if no items have been collected yet.', code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> items = new ArrayList<>();
        if (items.size() == 0) {
            System.out.println("The pack is empty.");
        }
    }
}`, tryThis: 'Add an item and add an else block that prints the size.' }
      ],
      build: { label: 'inventory display', brief: 'Add <code>show()</code> to Inventory. Print a heading, handle an empty list and describe every item in the ArrayList.', checks: [['void show', 'A show method.'], ['items.size() == 0', 'An empty inventory check.'], ['for (Item item : items)', 'A loop through items.'], ['item.describe()', 'Describe each object.'], ['RELIC INVENTORY', 'A readable heading.']], starter: `class Inventory {
    ArrayList<Item> items = new ArrayList<>();

    void show() {
        // TODO: print heading
        // TODO: report empty pack when needed
        // TODO: loop and describe items
    }
}` , context: REF.item, harness: `public class Game {
    public static void main(String[] args) {
        Inventory inventory = new Inventory();
        inventory.add(new Item("Glimmer Shard", "relic", 8));
        inventory.add(new Item("Moon Tonic", "potion", 20));
        inventory.show();
    }
}`, expect: ['RELIC INVENTORY', 'Glimmer Shard', 'Moon Tonic'], expectMsg: 'The inventory should list each collected item.', reference: REF.inventory }
    },
    {
      id: 'find', title: 'Find and use relics', goal: 'Search for a named object and remove used items',
      concepts: ['search', 'equals', 'null', 'remove', 'boolean'],
      brief: 'The game needs to find an exact item by name. Strings should use <code>equals</code> for text comparison, not <code>==</code>.',
      examples: [
        { title: 'Compare String text', teach: '<code>equals</code> asks whether two Strings contain the same characters.', code: `public class Game {
    public static void main(String[] args) {
        String item = "Moon Tonic";
        if (item.equals("Moon Tonic")) {
            System.out.println("Potion found.");
        }
    }
}`, tryThis: 'Change the compared text to Glimmer Shard and observe what changes.' },
        { title: 'Search one item at a time', teach: 'A search loop checks each object. Return the object immediately when its name matches.', code: `import java.util.ArrayList;

class Item { String name; Item(String name) { this.name = name; } }
class Inventory {
    ArrayList<Item> items = new ArrayList<>();
    Item find(String name) {
        for (Item item : items) {
            if (item.name.equals(name)) return item;
        }
        return null;
    }
}

public class Game {
    public static void main(String[] args) {
        Inventory bag = new Inventory();
        bag.items.add(new Item("Key"));
        System.out.println(bag.find("Key").name);
    }
}`, tryThis: 'Search for an item that does not exist and check for null before using it.' },
        { title: 'Remove a used item', teach: 'After finding the object, <code>remove(found)</code> removes that exact object from the ArrayList.', code: `import java.util.ArrayList;

public class Game {
    public static void main(String[] args) {
        ArrayList<String> bag = new ArrayList<>();
        bag.add("Potion");
        bag.remove("Potion");
        System.out.println("Items left: " + bag.size());
    }
}`, tryThis: 'Add two items, remove only one, and check the remaining size.' }
      ],
      build: { label: 'item search', brief: 'Add <code>find</code> and <code>remove</code> methods to Inventory. Find by exact name, return null when absent, and remove items safely.', checks: [['Item find(String name)', 'A method that returns an Item.'], ['item.name.equals(name)', 'Compare String names with equals.'], ['return null', 'Return null when no match exists.'], ['boolean remove', 'A removal method.'], ['items.remove', 'Remove the found object.']], starter: `class Inventory {
    ArrayList<Item> items = new ArrayList<>();

    Item find(String name) {
        // TODO: search for matching name
        return null;
    }

    boolean remove(String name) {
        // TODO: find then safely remove item
        return false;
    }
}` , context: [REF.item, REF.inventory].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Inventory inventory = new Inventory();
        inventory.add(new Item("Moon Tonic", "potion", 20));
        System.out.println("Found: " + inventory.find("Moon Tonic").name);
        inventory.remove("Moon Tonic");
        System.out.println("Items: " + inventory.items.size());
    }
}`, expect: ['Found: Moon Tonic', 'Used: Moon Tonic', 'Items: 0'], expectMsg: 'The potion should be found, used and removed from the list.', reference: REF.inventory }
    },
    {
      id: 'hero', title: 'Equip relics and potions', goal: 'Connect the inventory to Nova’s game stats',
      concepts: ['composition', 'object field', 'condition', 'String equals', 'state'],
      brief: 'A Hero owns an Inventory object. This relationship is called <b>composition</b>: the hero has an inventory rather than being an inventory.',
      examples: [
        { title: 'One object can own another', teach: 'A Hero field can store an Inventory object created in the Hero constructor.', code: `class Inventory { }
class Hero {
    Inventory inventory;
    Hero() {
        inventory = new Inventory();
    }
}

public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero();
        System.out.println(hero.inventory != null);
    }
}`, tryThis: 'Add a name field to Hero and print it.' },
        { title: 'Equip only relics', teach: 'An item’s type decides its use. Use equals to compare the type text before changing relic power.', code: `class Item {
    String type;
    int value;
    Item(String type, int value) { this.type = type; this.value = value; }
}

public class Game {
    public static void main(String[] args) {
        Item item = new Item("relic", 14);
        if (item.type.equals("relic")) {
            System.out.println("Power gained: " + item.value);
        }
    }
}`, tryThis: 'Try type potion and add an else message.' },
        { title: 'Use a potion once', teach: 'A potion increases health and should then be removed from the inventory so it cannot be used endlessly.', code: `public class Game {
    public static void main(String[] args) {
        int health = 50;
        int potionValue = 20;
        health = health + potionValue;
        System.out.println("Health: " + health);
        System.out.println("Potion removed.");
    }
}`, tryThis: 'Start health at 75 and use a 10 point potion.' }
      ],
      build: { label: 'relic hero', brief: 'Build Hero with health, relic power and an Inventory. Collect items, equip relics by name and consume potions by name.', checks: [['class Hero', 'A Hero class.'], ['Inventory inventory', 'An Inventory field.'], ['new Inventory()', 'Create the inventory.'], ['void collect', 'Collect an Item.'], ['void equip', 'Equip a named relic.'], ['void usePotion', 'Consume a potion.'], ['item.type.equals', 'Check item types.']], starter: `class Hero {
    String name;
    int health;
    int relicPower;
    Inventory inventory;

    Hero(String name) {
        // TODO: set starting fields and create inventory
    }

    void collect(Item item) {
        // TODO: add item to inventory
    }

    void equip(String name) {
        // TODO: find and equip a relic
    }

    void usePotion(String name) {
        // TODO: use and remove a potion
    }
}` , context: [REF.item, REF.inventory].join('\n\n'), harness: `public class Game {
    public static void main(String[] args) {
        Hero nova = new Hero("Nova");
        nova.collect(new Item("Solar Core", "relic", 14));
        nova.collect(new Item("Moon Tonic", "potion", 20));
        nova.equip("Solar Core");
        nova.usePotion("Moon Tonic");
        System.out.println("Attack: " + nova.attack());
    }
}`, expect: ['Solar Core is now equipped', 'Moon Tonic restores 20 HP', 'Attack: 24'], expectMsg: 'Nova should gain relic power and use the potion once.', reference: REF.hero }
    },
    {
      id: 'vaultgame', title: 'Assemble Vault of Relics', goal: 'Explore the vault and defeat its guardian',
      concepts: ['integration', 'ArrayList', 'objects', 'search', 'battle loop'],
      brief: 'The complete vault adventure uses objects and a changing inventory. Collect relics, choose one to equip, use a potion, unlock the gate and face the guardian.',
      examples: [
        { title: 'A fixed vault can feed a growing bag', teach: 'The vault may use an array for fixed chamber rewards, while the hero’s ArrayList grows as each reward is collected.', code: `public class Game {
    public static void main(String[] args) {
        String[] chambers = {"Shard", "Potion", "Key"};
        for (String item : chambers) {
            System.out.println("Collected " + item);
        }
    }
}`, tryThis: 'Add a fourth chamber reward.' },
        { title: 'A key unlocks a condition', teach: 'Find the key first. Only open the gate when the search result is not null.', code: `public class Game {
    public static void main(String[] args) {
        boolean hasKey = true;
        if (hasKey) {
            System.out.println("The gate opens.");
        } else {
            System.out.println("Find the key first.");
        }
    }
}`, tryThis: 'Set hasKey to false and check the other path.' },
        { title: 'Finish with an inventory report', teach: 'After the battle, showing the inventory proves that used keys and potions were removed while relics remain.', code: `public class Game {
    public static void main(String[] args) {
        System.out.println("=== RELIC INVENTORY ===");
        System.out.println("Solar Core [relic] value 14");
        System.out.println("VAULT OF RELICS COMPLETE");
    }
}`, tryThis: 'Add a second remaining relic line.' }
      ],
      build: { label: 'Vault of Relics game', brief: 'Create Hero and Vault, collect every chamber item, equip a relic, use the potion, unlock the gate, battle the Relic Wraith and print the final inventory.', checks: [['public class Game', 'The final Game class.'], ['Hero nova', 'Nova object.'], ['Vault vault', 'Vault object.'], ['vault.explore', 'Collect chamber items.'], ['nova.equip', 'Equip a relic.'], ['nova.usePotion', 'Use a potion.'], ['vault.unlock', 'Open with the key.'], ['VAULT OF RELICS COMPLETE', 'A completion line.']], starter: `public class Game {
    static void fight(Hero hero, String foe, int foeHealth) {
        // TODO: repeat battle rounds
    }

    public static void main(String[] args) {
        // TODO: create Nova and Vault
        // TODO: explore and show inventory
        // TODO: equip relic and use potion
        // TODO: unlock gate, fight guardian and report
    }
}` , context: [REF.item, REF.inventory, REF.hero, REF.vault].join('\n\n'), harness: '', expect: ['VAULT OF RELICS', 'Rift Key opens', 'Relic Wraith', 'VAULT OF RELICS COMPLETE'], expectMsg: 'The final game should collect relics, unlock the gate, battle the guardian and finish.', reference: REF.game }
    }
  ];

  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 5,
    title: 'Vault of Relics',
    tagline: 'Every relic has a purpose',
    blurb: 'Nova enters a sealed vault full of collectible relics. Learn ArrayLists, object collections, searching, removing and inventory systems while preparing for a vault guardian.',
    sections: SECTIONS, REF: REF,
    slotOf: { item: 'item', list: 'inventory', show: 'inventory', find: 'inventory', hero: 'hero', vaultgame: 'game' },
    assemble: ['item', 'inventory', 'hero', 'vault', 'game']
  });
})(typeof window !== 'undefined' ? window : globalThis);
