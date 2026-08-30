/* Level 3 course content for CRYSTAL RUN — the Ascension dungeon crawl. */
(function (global) {
  const REF = {
    dungeon: `class Dungeon {
    char[][] map = {
        {'@', '.', 'E', '.', 'P'},
        {'#', '#', '.', '#', 'B'},
        {'.', '.', '.', '.', 'X'}
    };

    void draw() {
        System.out.println("Dungeon map:");
        for (int row = 0; row < map.length; row++) {
            for (int col = 0; col < map[0].length; col++) {
                System.out.print(map[row][col]);
            }
            System.out.println();
        }
    }

    char tileAt(int row, int col) {
        return map[row][col];
    }
}`,
    hero: `class Hero {
    String name;
    int health;
    int attack;
    int row;
    int col;

    Hero(String name) {
        this.name = name;
        this.health = 70;
        this.attack = 18;
        this.row = 0;
        this.col = 0;
    }

    boolean canMove(Dungeon dungeon, int nextRow, int nextCol) {
        if (nextRow < 0 || nextRow >= dungeon.map.length) {
            return false;
        }
        if (nextCol < 0 || nextCol >= dungeon.map[0].length) {
            return false;
        }
        return dungeon.tileAt(nextRow, nextCol) != '#';
    }

    char move(Dungeon dungeon, int rowChange, int colChange) {
        int nextRow = row + rowChange;
        int nextCol = col + colChange;
        if (!canMove(dungeon, nextRow, nextCol)) {
            System.out.println("The wall blocks " + name + ".");
            return '#';
        }
        row = nextRow;
        col = nextCol;
        char tile = dungeon.tileAt(row, col);
        System.out.println(name + " steps to (" + row + ", " + col + ") on " + tile);
        return tile;
    }

    void takeDamage(int amount) {
        health = health - amount;
        if (health < 0) {
            health = 0;
        }
    }

    void heal(int amount) {
        health = health + amount;
    }

    boolean isAlive() {
        return health > 0;
    }
}`,
    guard: `class MoveGuard {
    static char checkedMove(Hero hero, Dungeon dungeon, int rowChange, int colChange) {
        try {
            if (rowChange == 0 && colChange == 0) {
                throw new IllegalArgumentException("A move needs a direction.");
            }
            char tile = hero.move(dungeon, rowChange, colChange);
            if (tile == '#') {
                throw new IllegalArgumentException("That move reaches a wall.");
            }
            return tile;
        } catch (Exception e) {
            System.out.println("Move rejected: " + e.getMessage());
            return '#';
        } finally {
            if (rowChange == 0 && colChange == 0) {
                System.out.println("The tunnel settles.");
            }
        }
    }

    static void usePotion(Hero hero, int amount) {
        try {
            if (amount <= 0) {
                throw new IllegalArgumentException("Potion power must be positive.");
            }
            hero.heal(amount);
            System.out.println("Potion restores " + amount + " HP.");
        } catch (Exception e) {
            System.out.println("Item rejected: " + e.getMessage());
        } finally {
            System.out.println("Nova stows the pack.");
        }
    }
}`,
    quests: `import java.util.HashMap;

class QuestLog {
    HashMap<String, Integer> progress = new HashMap<>();
    HashMap<String, Integer> targets = new HashMap<>();

    QuestLog() {
        addQuest("Defeat the Ember Rat", 1);
        addQuest("Find a potion", 1);
        addQuest("Reach the exit", 1);
    }

    void addQuest(String name, int target) {
        progress.put(name, 0);
        targets.put(name, target);
    }

    void advance(String name) {
        int now = progress.get(name) + 1;
        progress.put(name, now);
        if (now >= targets.get(name)) {
            System.out.println("Quest complete: " + name);
        } else {
            System.out.println("Quest progress: " + name + " " + now + "/" + targets.get(name));
        }
    }

    boolean isComplete(String name) {
        return progress.get(name) >= targets.get(name);
    }

    void report() {
        StringBuilder lines = new StringBuilder();
        lines.append("Quest log:\\n");
        for (String name : progress.keySet()) {
            lines.append(" - ");
            lines.append(name);
            lines.append(": ");
            lines.append(progress.get(name));
            lines.append("/");
            lines.append(targets.get(name));
            if (isComplete(name)) {
                lines.append(" complete");
            }
            lines.append("\\n");
        }
        System.out.print(lines.toString());
    }
}`,
    scores: `class ScoreEntry {
    String name;
    int score;

    ScoreEntry(String name, int score) {
        this.name = name;
        this.score = score;
    }
}

class ScoreTable {
    static void sortDescending(ScoreEntry[] entries) {
        for (int pass = 0; pass < entries.length - 1; pass++) {
            for (int index = 0; index < entries.length - 1 - pass; index++) {
                if (entries[index].score < entries[index + 1].score) {
                    ScoreEntry saved = entries[index];
                    entries[index] = entries[index + 1];
                    entries[index + 1] = saved;
                }
            }
        }
    }

    static String padded(String text, int width) {
        return text + " ".repeat(width - text.length());
    }

    static void print(ScoreEntry[] entries) {
        System.out.println("Rank  Hero             Score");
        System.out.println("-----------------------------");
        for (int index = 0; index < entries.length; index++) {
            String rank = "" + (index + 1);
            String score = "" + entries[index].score;
            System.out.printf("%s%s%s%n", padded(rank, 6), padded(entries[index].name, 17), score);
        }
    }
}`,
    game: `public class Game {
    static void fight(Hero hero, String foe, int foeHealth, int foeDamage) {
        System.out.println("Battle: " + foe + " appears.");
        int round = 1;
        while (hero.isAlive() && foeHealth > 0) {
            System.out.println(" Round " + round + ": " + hero.name + " hits for " + hero.attack);
            foeHealth = foeHealth - hero.attack;
            if (foeHealth > 0) {
                hero.takeDamage(foeDamage);
                System.out.println(" " + foe + " strikes. " + hero.name + " has " + hero.health + " HP.");
            }
            round++;
        }
        System.out.println(foe + " is defeated.");
    }

    static void resolveTile(char tile, Hero hero, QuestLog quests) {
        switch (tile) {
            case 'E':
                fight(hero, "Ember Rat", 30, 6);
                quests.advance("Defeat the Ember Rat");
                break;
            case 'P':
                MoveGuard.usePotion(hero, 15);
                quests.advance("Find a potion");
                break;
            case 'B':
                fight(hero, "Crystal Warden", 36, 9);
                break;
            case 'X':
                System.out.println("The crystal gate opens.");
                quests.advance("Reach the exit");
                break;
            default:
                System.out.println("The passage is quiet.");
                break;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== CRYSTAL RUN: ASCENSION ===");
        Dungeon dungeon = new Dungeon();
        Hero hero = new Hero("Nova");
        QuestLog quests = new QuestLog();
        dungeon.draw();
        System.out.println("Nova begins with " + hero.health + " HP.\\n");

        char[] route = { 'R', 'R', 'R', 'R', 'D', 'D' };
        for (char direction : route) {
            int rowChange = 0;
            int colChange = 0;
            switch (direction) {
                case 'R': colChange = 1; break;
                case 'D': rowChange = 1; break;
                default: break;
            }
            char tile = MoveGuard.checkedMove(hero, dungeon, rowChange, colChange);
            resolveTile(tile, hero, quests);
            if (!hero.isAlive()) {
                System.out.println("Nova falls in the dungeon.");
                return;
            }
        }

        System.out.println("");
        quests.report();
        System.out.println("");
        int finalScore = hero.health + 100;
        ScoreEntry[] results = {
            new ScoreEntry("Nova", finalScore),
            new ScoreEntry("Kade", 121),
            new ScoreEntry("Mira", 109)
        };
        ScoreTable.sortDescending(results);
        ScoreTable.print(results);
        System.out.println("Nova reaches the summit crystal. ASCENSION COMPLETE.");
    }
}`
  };

  const SECTIONS = [
    {
      id: 'map',
      title: 'Draw the dungeon map',
      goal: 'Build a two-dimensional dungeon map',
      concepts: ['2D arrays', 'char', 'rows', 'columns', 'nested loops'],
      brief: 'A dungeon has both height and width. You will store its symbols in a <b>two-dimensional array</b>, then draw each row and column as a map.',
      examples: [
        {
          title: 'Rows and columns',
          teach: 'A <b>two-dimensional array</b> is an array containing other arrays. The first number is the <b>row</b> and the second is the <b>column</b>. A <code>char</code> holds one character such as <code>\'@\'</code>.',
          code: `public class Game {
    public static void main(String[] args) {
        char[][] map = {{'@', '.'}, {'#', 'X'}};
        System.out.println(map[0][0]);
        System.out.println(map[1][0]);
        System.out.println(map[1][1]);
    }
}`,
          tryThis: 'Change the character at <code>map[0][1]</code> to <code>\'E\'</code>, then print that position.'
        },
        {
          title: 'Finding map dimensions',
          teach: '<code>map.length</code> counts the rows in the outer array. <code>map[0].length</code> counts columns in the first row. These values let your program work with a map without counting symbols by hand.',
          code: `public class Game {
    public static void main(String[] args) {
        char[][] map = {{'@', '.', 'X'}, {'#', '.', '#'}};
        System.out.println("Rows: " + map.length);
        System.out.println("Columns: " + map[0].length);
        System.out.println("Last tile: " + map[1][2]);
    }
}`,
          tryThis: 'Add a third row with three characters. Run it and check which dimension changes.'
        },
        {
          title: 'Nested loops draw every tile',
          teach: 'A <b>nested loop</b> is a loop inside another loop. The outer loop chooses a row; the inner loop visits every column in that row. <code>print</code> keeps map characters together before <code>println</code> starts the next row.',
          code: `public class Game {
    public static void main(String[] args) {
        char[][] map = {{'@', '.', 'E'}, {'#', '.', 'X'}};
        for (int row = 0; row < map.length; row++) {
            for (int col = 0; col < map[0].length; col++) {
                System.out.print(map[row][col]);
            }
            System.out.println();
        }
    }
}`,
          tryThis: 'Replace one <code>\'.\'</code> with <code>\'P\'</code> for a potion and run the map again.'
        }
      ],
      build: {
        label: 'dungeon map',
        brief: 'Write a <code>Dungeon</code> class with a <code>char[][] map</code> containing at least three rows. Add <code>draw()</code>. Use one loop for rows and one loop for columns, then print each map character.',
        checks: [
          ['class Dungeon', 'A class called <code>Dungeon</code>.'],
          ['char[][] map', 'A two-dimensional <code>char</code> map.'],
          ['map.length', 'Use <code>map.length</code> to count rows.'],
          ['map[0].length', 'Use <code>map[0].length</code> to count columns.'],
          ['for (', 'Nested <code>for</code> loops to draw the map.']
        ],
        starter: `class Dungeon {
    char[][] map = {
        // TODO: add rows of map characters here
    };

    void draw() {
        // TODO: loop through each row
        // TODO: loop through each column
        // TODO: print every character
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        Dungeon dungeon = new Dungeon();
        dungeon.draw();
        System.out.println("Start tile: " + dungeon.tileAt(0, 0));
    }
}`,
        expect: ['Dungeon map:', 'Start tile: @'],
        expectMsg: 'The map should draw, then report @ as its start tile.',
        reference: REF.dungeon
      }
    },
    {
      id: 'movement',
      title: 'Walk the dungeon',
      goal: 'Move the hero across map tiles',
      concepts: ['position', 'bounds checking', 'char', 'switch', 'state'],
      brief: 'The hero now remembers a row and column. Before moving, the game checks the <b>bounds</b> so it never reads beyond the edge of the dungeon.',
      examples: [
        {
          title: 'A position needs two numbers',
          teach: 'A map position has two parts: a row and a column. When the hero moves right, the column changes while the row stays the same. Fields let one object remember both numbers.',
          code: `class Hero {
    int row = 0;
    int col = 0;
    void moveRight() { col = col + 1; }
}

public class Game {
    public static void main(String[] args) {
        Hero hero = new Hero();
        hero.moveRight();
        hero.moveRight();
        System.out.println("Position: " + hero.row + ", " + hero.col);
    }
}`,
          tryThis: 'Add a <code>moveDown()</code> method that increases row, then call it once.'
        },
        {
          title: 'Checking the map edge',
          teach: '<b>Bounds checking</b> asks whether a position is valid before the program uses it. Row zero is the first row, so a negative row is outside the map. The same rule applies to columns.',
          code: `public class Game {
    public static void main(String[] args) {
        char[][] map = {{'@', '.'}, {'.', 'X'}};
        int nextRow = 2;
        int nextCol = 1;
        if (nextRow >= 0 && nextRow < map.length && nextCol >= 0 && nextCol < map[0].length) {
            System.out.println("Safe tile: " + map[nextRow][nextCol]);
        } else {
            System.out.println("That step is outside the dungeon.");
        }
    }
}`,
          tryThis: 'Set <code>nextRow</code> to 1 and run it. The message should change to the map character.'
        },
        {
          title: 'Tiles tell the story',
          teach: 'After a valid move, read the <b>tile</b> with <code>map[row][col]</code>. A <code>switch</code> compares that character with each <code>case</code>, so each kind of tile can cause a different game event.',
          code: `public class Game {
    public static void main(String[] args) {
        char tile = 'P';
        switch (tile) {
            case 'E': System.out.println("An enemy attacks."); break;
            case 'P': System.out.println("You found a potion."); break;
            case 'X': System.out.println("You found the exit."); break;
            default: System.out.println("An empty passage."); break;
        }
    }
}`,
          tryThis: 'Change <code>tile</code> to <code>\'E\'</code> and then <code>\'X\'</code> to see the other cases.'
        }
      ],
      build: {
        label: 'hero movement',
        brief: 'Build <code>Hero</code> with <code>row</code> and <code>col</code> fields. Add <code>canMove</code> to check dungeon bounds and walls, then add <code>move</code> to update the position and return the tile reached.',
        checks: [
          ['class Hero', 'A class called <code>Hero</code>.'],
          ['int row', 'A row field.'],
          ['int col', 'A column field.'],
          ['boolean canMove', 'A method that checks whether a move is allowed.'],
          ['dungeon.map.length', 'Check the row boundary using the map length.'],
          ['char move', 'A move method that returns the tile character.']
        ],
        starter: `class Hero {
    String name;
    int row;
    int col;

    Hero(String name) {
        this.name = name;
        // TODO: start row and col at 0
    }

    boolean canMove(Dungeon dungeon, int nextRow, int nextCol) {
        // TODO: reject positions outside the map and wall tiles
        return false;
    }

    char move(Dungeon dungeon, int rowChange, int colChange) {
        // TODO: calculate a next row and column
        // TODO: move when canMove says true, then return the tile
        return '#';
    }
}`,
        context: REF.dungeon,
        harness: `public class Game {
    public static void main(String[] args) {
        Dungeon dungeon = new Dungeon();
        Hero hero = new Hero("Nova");
        char tile = hero.move(dungeon, 0, 1);
        System.out.println("Reached: " + tile);
        System.out.println("Hero column: " + hero.col);
    }
}`,
        expect: ['Reached: .', 'Hero column: 1'],
        expectMsg: 'Moving right from @ should reach a dot and put the hero in column 1.',
        reference: REF.hero
      }
    },
    {
      id: 'safety',
      title: 'Handle bad moves',
      goal: 'Validate moves and item use with exceptions',
      concepts: ['try', 'catch', 'throw', 'exception', 'finally'],
      brief: 'Some game actions are invalid. An <b>exception</b> is a message that stops a risky action, and <code>try</code> and <code>catch</code> let the game report it without ending the whole adventure.',
      examples: [
        {
          title: 'Throw a clear problem',
          teach: '<code>throw new IllegalArgumentException(...)</code> creates an exception when a value is not allowed. The String in brackets explains the problem. It is better to reject a bad potion amount than quietly change the hero in a strange way.',
          code: `public class Game {
    public static void main(String[] args) {
        int potionPower = 0;
        try {
            if (potionPower <= 0) {
                throw new IllegalArgumentException("Potion power must be positive.");
            }
            System.out.println("Potion used.");
        } catch (Exception e) {
            System.out.println("Invalid potion: " + e.getMessage());
        }
    }
}`,
          tryThis: 'Change <code>potionPower</code> to 10. The program will reach the printed line.'
        },
        {
          title: 'Catch the message',
          teach: '<code>try</code> holds code that may fail. <code>catch (Exception e)</code> receives the problem as <code>e</code>, and <code>e.getMessage()</code> reads the explanation you wrote.',
          code: `public class Game {
    public static void main(String[] args) {
        try {
            throw new IllegalArgumentException("The door is locked.");
        } catch (Exception e) {
            System.out.println("Action rejected: " + e.getMessage());
        }
        System.out.println("The game continues.");
    }
}`,
          tryThis: 'Change the exception message to describe a wall, then run the program again.'
        },
        {
          title: 'Finally always runs',
          teach: 'A <b>finally</b> block runs after the try and catch blocks, whether the action worked or failed. Use it for a report that must happen every time, such as checking the hero position after a move.',
          code: `public class Game {
    public static void main(String[] args) {
        try {
            int rowChange = 0;
            if (rowChange == 0) {
                throw new IllegalArgumentException("Choose a direction.");
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        } finally {
            System.out.println("The tunnel settles.");
        }
    }
}`,
          tryThis: 'Set <code>rowChange</code> to 1. The catch line disappears, but the final line remains.'
        }
      ],
      build: {
        label: 'move guard',
        brief: 'Write <code>MoveGuard</code>. In <code>checkedMove</code>, use <code>try</code> to validate a direction and a wall result. Throw <code>IllegalArgumentException</code> for a bad move, print its message in <code>catch</code>, and let <code>finally</code> finish the action with a game message when a move is rejected.',
        checks: [
          ['class MoveGuard', 'A class called <code>MoveGuard</code>.'],
          ['try {', 'A <code>try</code> block.'],
          ['throw new IllegalArgumentException', 'Throw an <code>IllegalArgumentException</code> for an invalid action.'],
          ['catch (Exception e)', 'Catch the exception as <code>e</code>.'],
          ['e.getMessage()', 'Print the exception message.'],
          ['finally {', 'A <code>finally</code> block.']
        ],
        starter: `class MoveGuard {
    static char checkedMove(Hero hero, Dungeon dungeon, int rowChange, int colChange) {
        // TODO: try a move
        // TODO: throw an IllegalArgumentException for no direction or a wall
        // TODO: catch Exception e and print e.getMessage()
        // TODO: finally print a game message only for a rejected move
        return '#';
    }

    static void usePotion(Hero hero, int amount) {
        // TODO: validate amount with try, catch and finally
    }
}`,
        context: [REF.dungeon, REF.hero].join('\n\n'),
        harness: `public class Game {
    public static void main(String[] args) {
        Dungeon dungeon = new Dungeon();
        Hero hero = new Hero("Nova");
        MoveGuard.checkedMove(hero, dungeon, 0, 0);
        MoveGuard.usePotion(hero, 0);
        System.out.println("Hero health: " + hero.health);
    }
}`,
        expect: ['Move rejected: A move needs a direction.', 'The tunnel settles.', 'Item rejected: Potion power must be positive.', 'Nova stows the pack.', 'Hero health: 70'],
        expectMsg: 'Invalid actions should print helpful messages and leave the hero health unchanged.',
        reference: REF.guard
      }
    },
    {
      id: 'quests',
      title: 'Track quest objectives',
      goal: 'Build a quest log that reports progress',
      concepts: ['HashMap', 'key', 'value', 'progress', 'StringBuilder'],
      brief: 'A quest log links each objective name to a number. A <b>HashMap</b> stores these pairs so the game can update one quest without mixing it up with another.',
      examples: [
        {
          title: 'A name points to progress',
          teach: 'A HashMap has a <b>key</b> and a value. Here the quest name is the key and its number is the value. <code>put</code> stores a pair, while <code>get</code> reads it back.',
          code: `import java.util.HashMap;

public class Game {
    public static void main(String[] args) {
        HashMap<String, Integer> progress = new HashMap<>();
        progress.put("Find the exit", 0);
        progress.put("Defeat the rat", 1);
        System.out.println(progress.get("Find the exit"));
        System.out.println(progress.get("Defeat the rat"));
    }
}`,
          tryThis: 'Change the exit progress to 1 with another <code>put</code>, then print it again.'
        },
        {
          title: 'Marking an objective complete',
          teach: 'Read the old value, add one, then store the new value under the same key. A target gives the program a clear rule for <b>complete</b>: progress is at least the target.',
          code: `import java.util.HashMap;

public class Game {
    public static void main(String[] args) {
        HashMap<String, Integer> progress = new HashMap<>();
        progress.put("Find a potion", 0);
        int now = progress.get("Find a potion") + 1;
        progress.put("Find a potion", now);
        if (progress.get("Find a potion") >= 1) {
            System.out.println("Quest complete: Find a potion");
        }
    }
}`,
          tryThis: 'Use a target of 2 and advance the same quest twice before checking it.'
        },
        {
          title: 'Build a tidy report',
          teach: 'A <b>StringBuilder</b> builds a longer piece of text a part at a time. <code>append</code> adds each part, then <code>toString()</code> turns the completed builder into printable text.',
          code: `public class Game {
    public static void main(String[] args) {
        StringBuilder report = new StringBuilder();
        report.append("Quest log:\\n");
        report.append(" - Find a potion: 1/1 complete\\n");
        report.append(" - Reach the exit: 0/1");
        System.out.print(report.toString());
    }
}`,
          tryThis: 'Add a third quest line using another <code>append</code> call.'
        }
      ],
      build: {
        label: 'quest log',
        brief: 'Build <code>QuestLog</code> with HashMaps for current progress and targets. Add quests, advance a named quest, decide when it is complete, and report every quest using <code>StringBuilder</code>.',
        checks: [
          ['class QuestLog', 'A class called <code>QuestLog</code>.'],
          ['HashMap<String, Integer>', 'HashMaps holding quest names and numbers.'],
          ['progress.put', 'Store changed progress with <code>put</code>.'],
          ['boolean isComplete', 'A method to test whether a quest is complete.'],
          ['StringBuilder', 'A StringBuilder report.'],
          ['void report', 'A method that prints the quest report.']
        ],
        starter: `import java.util.HashMap;

class QuestLog {
    // TODO: HashMaps named progress and targets

    void addQuest(String name, int target) {
        // TODO: add a 0 progress value and a target
    }

    void advance(String name) {
        // TODO: increase this quest and say when it is complete
    }

    boolean isComplete(String name) {
        return false;
    }

    void report() {
        // TODO: build a multi-line report with StringBuilder
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        QuestLog quests = new QuestLog();
        quests.advance("Find a potion");
        quests.report();
    }
}`,
        expect: ['Quest complete: Find a potion', 'Quest log:', 'Find a potion: 1/1 complete'],
        expectMsg: 'Advancing the potion objective should complete it and show 1/1 in the report.',
        reference: REF.quests
      }
    },
    {
      id: 'scores',
      title: 'Rank the score table',
      goal: 'Sort results and print a score table',
      concepts: ['bubble sort', 'swap', 'array', 'comparison', 'printf'],
      brief: 'A score table is more useful when the highest score is first. You will use <b>bubble sort</b>, which repeatedly compares neighbours and swaps them when they are in the wrong order.',
      examples: [
        {
          title: 'Compare neighbouring scores',
          teach: 'An array index points at one place in an array. Compare an entry with the one after it using <code>index + 1</code>. If the left score is smaller, those two entries belong in the other order.',
          code: `public class Game {
    public static void main(String[] args) {
        int[] scores = {80, 120};
        if (scores[0] < scores[1]) {
            System.out.println("They need swapping.");
        }
        System.out.println(scores[0] + ", " + scores[1]);
    }
}`,
          tryThis: 'Change the first score to 140. The comparison message should no longer print.'
        },
        {
          title: 'Swap two values',
          teach: 'A <b>swap</b> needs a temporary variable. Save the first value, copy the second into the first place, then put the saved value into the second place. Without the saved value, it would be lost.',
          code: `public class Game {
    public static void main(String[] args) {
        int[] scores = {80, 120};
        int saved = scores[0];
        scores[0] = scores[1];
        scores[1] = saved;
        System.out.println(scores[0]);
        System.out.println(scores[1]);
    }
}`,
          tryThis: 'Make an array with 10 and 20, then use the same three lines to swap them.'
        },
        {
          title: 'Bubble sort uses passes',
          teach: 'Bubble sort uses a loop of <b>passes</b>. During each pass, compare neighbouring values and swap the wrong pairs. After enough passes, the largest values have travelled to the front of this descending table.',
          code: `public class Game {
    public static void main(String[] args) {
        int[] scores = {90, 140, 110};
        for (int pass = 0; pass < scores.length - 1; pass++) {
            for (int index = 0; index < scores.length - 1; index++) {
                if (scores[index] < scores[index + 1]) {
                    int saved = scores[index];
                    scores[index] = scores[index + 1];
                    scores[index + 1] = saved;
                }
            }
        }
        for (int score : scores) {
            System.out.println(score);
        }
    }
}`,
          tryThis: 'Add score 130 to the array and run it. The greatest score should still print first.'
        },
        {
          title: 'Columns make results readable',
          teach: '<code>printf</code> prints a formatted line. This course runner uses <code>%s</code> as a String slot. <b>Padding</b> adds spaces so each column reaches a chosen width; <code>" ".repeat(...)</code> makes exactly the spaces still needed.',
          code: `public class Game {
    static String padded(String text, int width) {
        return text + " ".repeat(width - text.length());
    }

    public static void main(String[] args) {
        System.out.println("Rank  Hero             Score");
        System.out.println("-----------------------------");
        System.out.printf("%s%s%s%n", padded("1", 6), padded("Nova", 17), "170");
        System.out.printf("%s%s%s%n", padded("2", 6), padded("Kade", 17), "121");
    }
}`,
          tryThis: 'Add a third formatted row with your own hero name and score.'
        }
      ],
      build: {
        label: 'score table',
        brief: 'Write <code>ScoreEntry</code> for a hero name and score. In <code>ScoreTable.sortDescending</code>, use nested loops, compare two neighbouring scores, and swap the objects. Then use <code>printf</code> to print a ranked table.',
        checks: [
          ['class ScoreEntry', 'A class for one score entry.'],
          ['class ScoreTable', 'A class for table actions.'],
          ['sortDescending', 'A sorting method.'],
          ['if (entries[index].score < entries[index + 1].score)', 'A comparison between neighbouring scores.'],
          ['ScoreEntry saved', 'A temporary object for swapping.'],
          ['System.out.printf', 'Formatted result rows.']
        ],
        starter: `class ScoreEntry {
    String name;
    int score;

    ScoreEntry(String name, int score) {
        // TODO: store name and score
    }
}

class ScoreTable {
    static void sortDescending(ScoreEntry[] entries) {
        // TODO: nested loops that compare neighbouring scores
        // TODO: swap entries that are in the wrong order
    }

    static void print(ScoreEntry[] entries) {
        // TODO: print headings and formatted ranked rows
    }
}`,
        context: '',
        harness: `public class Game {
    public static void main(String[] args) {
        ScoreEntry[] entries = {
            new ScoreEntry("Mira", 109),
            new ScoreEntry("Nova", 170),
            new ScoreEntry("Kade", 121)
        };
        ScoreTable.sortDescending(entries);
        ScoreTable.print(entries);
    }
}`,
        expect: ['Rank  Hero', 'Nova', '170'],
        expectMsg: 'The table should show a heading and Nova with score 170 in the first ranked row.',
        reference: REF.scores
      }
    },
    {
      id: 'ascension',
      title: 'Assemble Ascension',
      goal: 'Run the full dungeon crawl',
      concepts: ['main', 'integration', 'map route', 'quests', 'ranked results'],
      brief: 'Every advanced part now has a job. Your <code>Game</code> class will walk the map, resolve what each tile contains, complete objectives, and finish with a ranked score table.',
      examples: [
        {
          title: 'A route is an array of moves',
          teach: 'A route can be an array of direction characters. A for-each loop reads one direction at a time. The <code>switch</code> turns each character into a row or column change for the hero.',
          code: `public class Game {
    public static void main(String[] args) {
        char[] route = {'R', 'R', 'D'};
        for (char direction : route) {
            switch (direction) {
                case 'R': System.out.println("Move one column right."); break;
                case 'D': System.out.println("Move one row down."); break;
                default: System.out.println("Wait."); break;
            }
        }
    }
}`,
          tryThis: 'Add another <code>\'R\'</code> to the route and watch the loop handle the extra move.'
        },
        {
          title: 'One tile calls one event',
          teach: 'A game can place all tile reactions in one method. Giving the method a <code>char tile</code> makes it reusable: each map step passes in the character it reached.',
          code: `public class Game {
    static void resolveTile(char tile) {
        switch (tile) {
            case 'E': System.out.println("Fight the enemy."); break;
            case 'P': System.out.println("Use the potion."); break;
            case 'X': System.out.println("Open the exit."); break;
            default: System.out.println("Keep walking."); break;
        }
    }

    public static void main(String[] args) {
        resolveTile('E');
        resolveTile('P');
        resolveTile('X');
    }
}`,
          tryThis: 'Call <code>resolveTile(\'.\');</code> and read the default message.'
        },
        {
          title: 'Finish after the final reports',
          teach: 'Good program order makes the story readable: adventure first, then quest report, then scores, then the ending line. The final String is only printed after the earlier systems have finished their work.',
          code: `class QuestLog {
    void report() { System.out.println("Quest log: all objectives complete"); }
}

public class Game {
    public static void main(String[] args) {
        QuestLog quests = new QuestLog();
        System.out.println("The crystal gate opens.");
        quests.report();
        System.out.println("Rank  Hero  Score");
        System.out.println("1     Nova  170");
        System.out.println("Nova reaches the summit crystal. ASCENSION COMPLETE.");
    }
}`,
          tryThis: 'Change the displayed score and run the ending again.'
        }
      ],
      build: {
        label: 'Ascension game',
        brief: 'Write the final <code>Game</code> class. In <code>main</code>, create the dungeon, hero and quest log. Follow a route across the map, use <code>MoveGuard</code>, resolve every tile, report quests, sort results, print the table and a victory line.',
        checks: [
          ['public class Game', 'The final <code>Game</code> class.'],
          ['public static void main', 'The program starting method.'],
          ['Dungeon dungeon', 'A dungeon object.'],
          ['Hero hero', 'A hero object.'],
          ['QuestLog quests', 'A quest log.'],
          ['MoveGuard.checkedMove', 'Validated hero movement.'],
          ['resolveTile', 'Tile events.'],
          ['ScoreTable.sortDescending', 'A sorted final table.'],
          ['ASCENSION COMPLETE', 'A clear victory line.']
        ],
        starter: `public class Game {
    static void fight(Hero hero, String foe, int foeHealth, int foeDamage) {
        // TODO: run a short fight loop
    }

    static void resolveTile(char tile, Hero hero, QuestLog quests) {
        // TODO: switch on E, P, B and X tiles
    }

    public static void main(String[] args) {
        // TODO: make Dungeon, Hero and QuestLog objects
        // TODO: draw the map and follow a route
        // TODO: move with MoveGuard.checkedMove and resolve each tile
        // TODO: report quests, sort scores and print the victory line
    }
}`,
        context: [REF.dungeon, REF.hero, REF.guard, REF.quests, REF.scores].join('\n\n'),
        harness: '',
        expect: ['Quest log:', 'Rank  Hero', 'ASCENSION COMPLETE'],
        expectMsg: 'The full game should show the quest log, ranked score table and Ascension victory line.',
        reference: REF.game
      }
    }
  ];

  global.CR_LEVELS = global.CR_LEVELS || [];
  global.CR_LEVELS.push({
    id: 3,
    title: 'Ascension',
    tagline: 'The dungeon crawl',
    blurb: 'Nova crosses a dungeon map, handles dangerous moves, completes objectives and earns a place on the score table. You learn two-dimensional arrays, safe error handling, quest tracking and sorting.',
    sections: SECTIONS, REF: REF,
    slotOf: { map: 'dungeon', movement: 'hero', safety: 'guard', quests: 'quests', scores: 'scores', ascension: 'game' },
    assemble: ['dungeon', 'hero', 'guard', 'quests', 'scores', 'game']
  });
})(typeof window !== 'undefined' ? window : globalThis);
