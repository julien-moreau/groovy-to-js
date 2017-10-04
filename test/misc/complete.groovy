// Arrays
def arr = [1, 2, 3];
arr -= 1;
arr += 4;

def each = 0;

arr.each () {
    each++;
}

arr.eachWithIndex {
    each++;
}

arr.sort { a, b ->
    a - b;
}

// Closure
def closure = { };
closure.param1 = null;
closure.param1 = 1;

// Classes
class A {
    String str = "hello";
    def String str2;

    A (String arg) {
        this.str2 = arg;
    }

    String hello () {
        return this.str;
    }

    String hello2 () {
        return this.str2;
    }

    String choose (int index) {
        if (index == 0)
            return this.str;
        else
            return this.str2;
    }
}

// Strings
def name = "GROOVY";

def multiline1 = """
    I am ${name} and,
    I am multiline
""";

def multiline2 = '''
    I am ${name} and,
    I am multiline
''';

// End (maps)
def map = [
    a: 1
];

return [
    arr: arr,
    each: each,
    closure: closure,
    A: new A("hello2"),
    
    strings1: multiline1,
    strings2: multiline2,

    map: map.containsKey("a") && map."a"
];
