/* Focused MiniJava v2 feature checks.  Every assertion compares exact output. */
global.window = global;
const MiniJava = require('../js/minijava.js');
let total = 0, failed = 0;

function expect(name, source, output) {
  total++;
  const r = MiniJava.run(source);
  if (!r.ok || r.output !== output) {
    failed++;
    console.log('FAIL ' + name + ': ' + (r.error || ('expected ' + JSON.stringify(output) + ', got ' + JSON.stringify(r.output))));
  }
}
function error(name, source, text) {
  total++;
  const r = MiniJava.run(source);
  if (r.ok || r.error.indexOf(text) < 0) {
    failed++;
    console.log('FAIL ' + name + ': expected error containing ' + JSON.stringify(text) + ', got ' + JSON.stringify(r.error));
  }
}

/* 1. Inheritance, overriding, and super. */
expect('inherit fields', 'class A { int x; A(int n){x=n;} int get(){return x;} } class B extends A { B(){super(7);} public static void main(String[] a){System.out.println(new B().get());} }', '7\n');
expect('dynamic override', 'class A { String f(){return "A";} } class B extends A { String f(){return "B";} public static void main(String[] a){A x=new B();System.out.println(x.f());} }', 'B\n');
expect('super method', 'class A { String f(){return "A";} } class B extends A { String f(){return super.f()+"B";} public static void main(String[] a){System.out.println(new B().f());} }', 'AB\n');
expect('protected inherited member', 'class A { protected int hp=9; } class B extends A { public static void main(String[] a){System.out.println(new B().hp);}}', '9\n');

/* 2. Abstract classes. */
expect('abstract implementation', 'abstract class A { abstract int n(); } class B extends A { int n(){return 3;} public static void main(String[] a){System.out.println(new B().n());} }', '3\n');
error('abstract cannot instantiate', 'abstract class A { abstract int n(); } class X { public static void main(String[] a){new A();} }', 'Cannot create an object from abstract class A');
error('missing abstract override', 'abstract class A { abstract int n(); } class B extends A {} class X { public static void main(String[] a){new B();} }', 'Cannot create an object from abstract class B');

/* 3. Interfaces and implements. */
expect('interface dispatch', 'interface I { int hit(); } class A implements I { public int hit(){return 4;} public static void main(String[] a){I x=new A();System.out.println(x.hit());} }', '4\n');
expect('two interfaces', 'interface A { String a(); } interface B { String b(); } class X implements A,B { public String a(){return "a";} public String b(){return "b";} public static void main(String[] z){System.out.println(new X().a()+new X().b());} }', 'ab\n');
expect('interface array', 'interface I { String v(); } class X implements I { public String v(){return "ok";} public static void main(String[] a){I[] x={new X()};System.out.println(x[0].v());} }', 'ok\n');

/* 4. instanceof. */
expect('instanceof parent', 'class A{} class B extends A { public static void main(String[] x){System.out.println(new B() instanceof A);} }', 'true\n');
expect('instanceof interface', 'interface I{} class A implements I { public static void main(String[] x){System.out.println(new A() instanceof I);} }', 'true\n');
expect('instanceof false', 'class A{} class B{} class X { public static void main(String[] x){System.out.println(new A() instanceof B);} }', 'false\n');

/* 5. switch. */
expect('switch integer fallthrough', 'class X { public static void main(String[] a){int x=1;switch(x){case 1:System.out.print("a");case 2:System.out.println("b");break;default:System.out.println("c");}}}', 'ab\n');
expect('switch string', 'class X { public static void main(String[] a){String x="gem";switch(x){case "gem":System.out.println("yes");break;default:System.out.println("no");}}}', 'yes\n');
expect('switch default anywhere', 'class X { public static void main(String[] a){char x=\'z\';switch(x){default:System.out.println("d");break;case \'a\':System.out.println("a");}}}', 'd\n');

/* 6. HashMap and Map. */
expect('map basic', 'class X { public static void main(String[] a){Map<String,Integer> m=new HashMap<>();m.put("a",2);m.put("b",3);System.out.println(m.get("a")+":"+m.size()+":"+m);}}', '2:2:{a=2, b=3}\n');
expect('map defaults removal', 'class X { public static void main(String[] a){HashMap<String,Integer> m=new HashMap<>();m.put("a",1);System.out.println(m.getOrDefault("x",9));System.out.println(m.containsKey("a")+":"+m.containsValue(1));m.remove("a");System.out.println(m.isEmpty());}}', '9\ntrue:true\ntrue\n');
expect('map key iteration', 'class X { public static void main(String[] a){HashMap<String,Integer> m=new HashMap<>();m.put("x",1);m.put("y",2);for(String k:m.keySet())System.out.print(k);m.clear();System.out.println(":"+m.size());}}', 'xy:0\n');
expect('map values order', 'class X { public static void main(String[] a){HashMap<String,Integer> m=new HashMap<>();m.put("x",1);m.put("y",2);for(Integer v:m.values())System.out.print(v);}}', '12');

/* 7. Two-dimensional arrays. */
expect('2d dimensions', 'class X { public static void main(String[] a){char[][] g=new char[2][3];g[1][2]=\'Q\';System.out.println(g.length+":"+g[0].length+":"+g[1][2]);}}', '2:3:Q\n');
expect('2d literal', 'class X { public static void main(String[] a){int[][] t={{1,2},{3,4}};System.out.println(t[1][0]+t[0][1]);}}', '5\n');
expect('2d nested loop', 'class X { public static void main(String[] a){int[][] t={{1,2},{3,4}};int s=0;for(int[] r:t)for(int n:r)s+=n;System.out.println(s);}}', '10\n');
expect('2d default values', 'class X { public static void main(String[] a){int[][] t=new int[1][2];System.out.println(t[0][0]+":"+t[0][1]);}}', '0:0\n');

/* 8. StringBuilder. */
expect('builder append', 'class X { public static void main(String[] a){StringBuilder b=new StringBuilder();b.append("x").append(2).append(true);System.out.println(b.toString());}}', 'x2true\n');
expect('builder reverse', 'class X { public static void main(String[] a){StringBuilder b=new StringBuilder("abc");System.out.println(b.reverse());}}', 'cba\n');
expect('builder insert charat', 'class X { public static void main(String[] a){StringBuilder b=new StringBuilder("ac");b.insert(1,"b");System.out.println(b.length()+":"+b.charAt(1));}}', '3:b\n');

/* 9. Seeded deterministic Random. */
expect('random same seed', 'class X { public static void main(String[] a){Random x=new Random(42);Random y=new Random(42);System.out.println(x.nextInt(100)==y.nextInt(100));}}', 'true\n');
expect('random bounded range', 'class X { public static void main(String[] a){Random r=new Random(4);int n=r.nextInt(5,6);System.out.println(n);}}', '5\n');
expect('random default repeatable', 'class X { public static void main(String[] a){Random x=new Random();Random y=new Random();System.out.println(x.nextBoolean()==y.nextBoolean());System.out.println(x.nextDouble()==y.nextDouble());}}', 'true\ntrue\n');

/* 10. Exceptions. */
expect('catch exception', 'class X { public static void main(String[] a){try{throw new IllegalArgumentException("bad");}catch(Exception e){System.out.println(e.getMessage());}}}', 'bad\n');
expect('specific catch finally', 'class X { public static void main(String[] a){try{throw new IllegalArgumentException("x");}catch(IllegalArgumentException e){System.out.print("c");}finally{System.out.println("f");}}}', 'cf\n');
error('uncaught exception', 'class X { public static void main(String[] a){throw new RuntimeException("oops");}}', 'Uncaught RuntimeException: oops');

/* 11. enum. */
expect('enum value name', 'enum State { IDLE, FIGHT, WIN } class X { public static void main(String[] a){System.out.println(State.FIGHT.name()+":"+State.FIGHT.ordinal());}}', 'FIGHT:1\n');
expect('enum identity', 'enum State { IDLE, WIN } class X { public static void main(String[] a){System.out.println(State.IDLE==State.IDLE);}}', 'true\n');
expect('enum switch', 'enum State { IDLE, WIN } class X { public static void main(String[] a){State s=State.WIN;switch(s){case IDLE:System.out.println("i");break;case WIN:System.out.println("w");break;}}}', 'w\n');

/* 12. Math and miscellaneous standard-library gaps. */
expect('math methods', 'class X { public static void main(String[] a){System.out.println(Math.max(2,5)+":"+Math.min(2,5)+":"+Math.abs(-3));System.out.println(Math.pow(2,3)+":"+Math.sqrt(9));}}', '5:2:3\n8.0:3.0\n');
expect('math rounding', 'class X { public static void main(String[] a){System.out.println(Math.floor(2.9)+":"+Math.ceil(2.1)+":"+Math.round(2.6));}}', '2:3:3\n');
expect('integer double string', 'class X { public static void main(String[] a){System.out.println(Integer.valueOf("12")+Integer.parseInt("3"));System.out.println(Double.parseDouble("2.5"));System.out.println(String.valueOf(7));System.out.println(Integer.MAX_VALUE);}}', '15\n2.5\n7\n2147483647\n');
expect('join and object equals', 'class X { public static void main(String[] a){System.out.println(String.join("-", "a", "b"));Object x=new Object();Object y=x;System.out.println(x.equals(y));}}', 'a-b\ntrue\n');
expect('math random range', 'class X { public static void main(String[] a){double n=Math.random();System.out.println(n>=0.0&&n<1.0);}}', 'true\n');

console.log('Features: ' + (total - failed) + '/' + total + ' passed, ' + failed + ' failed.');
process.exitCode = failed ? 1 : 0;
