# groovy-to-js
Groovy to JS simply tries to convert a Groovy code to JavaScript code.

# Features
* Check types to call methods (subtract, add, multiply, etc.) on arrays
* Supports [number].times { ... }
* Supports simple closures
* Supports ranges ([number]..[number], [identifier]..[number], etc.)

# Roadmap
* Test on advanced code
* Add support for multiline strings (""" to ``)
* Provide more functions to dictionnary

# Not supported
* map."double quote" = "ALLOWED"
* map.'single quote' = "ALLOWED"
* map.'''triple single quote''' = "ALLOWED"
* map."""triple double quote""" = "ALLOWED"
* "script ${value}"
* array[index < 0]
* array << value (-> push(value))
* array[index1][index2] (arrays of arrays)

# Using the converter
```typescript
// Import lib
import Analyser from 'groovy-to-js';

const groovy = `
    def arr = [1, 2, 3];
    arr -= 1;

    def map = [
        a: 0,
        b: [1, 2, 3]
    ];
    map.a = map.b.size();
`;

const js = Analyser.convert(groovy);
console.log(js);
// Gives:
    /*
    var arr = [1, 2, 3];
    arr = subtract(arr, 1);

    var map = {
        a: 0,
        b: [1, 2, 3]
    };
    map.a = map.b.length
    */

```

# Giving a scope to check types
Converting a groovy script would require to know the base scope.

Given this scope:

```typescript
const scope = {
    member: [1, 2, 3]
};
```

And this groovy script
```typescript
const groovy = `
    return myObject.member - 1;
`;
```

Would return:
```typescript
`return myObject.member - 1;`;
```

The problem is, `member` is an array, so the output should be:
```typescript
`return subtract(myObject.member, 1);
```

To prevent this, just build a base scope, that's all!

Example:
```typescript
// Import scope
import { Analyser, Variable } from 'groovy-to-js';

const scope = Variable.buildFrom({
    member: [1, 2, 3]
});

const groovy = `
    return myObject.member - 1;
`;

const js = Analyser.convert(groovy, scope);
console.log(js);
// Gives:
    /*
    return subtract(myObject.member, 1);
    */
```

# Requiring groovy functions
These are called augmentations that you can import like:
```typescript
import { augmentations } from 'groovy-to-js';

const a = [1, 2, 3];
const b = 2;
const c = [2];

console.log(augmentations.subtract(a, b)); // [1, 3]
console.log(augmentations.subtract(a, c)); // [1, 3]

console.log(augmentations.add(a, b)); // [1, 2, 3, 2];
console.log(augmentations.add(a, c)); // [1, 2, 3, 2];

console.log(augmentations.multiply(a, b)); // [1, 2, 3, 1, 2, 3];
console.log(augmentations.multiply(a, c)); // [1, 2, 3, 1, 2, 3];

console.log(augmentations.range(2, 5)); // [2, 3, 4, 5]

augmentations.times(3, (it) => {
    console.log(it);
}); // 3 -> 3 -> 3
```