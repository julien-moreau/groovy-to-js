import { VariableType } from './scope-variable';

const operators = {
    '-': 'subtract',
    '-=': 'subtract',
    '+': 'add',
    '+=': 'add',
    '*': 'multiply',
    '*=': 'multiply',
    '<<': 'insert'
};

const keywords = {
    'def': 'var'
};

const types = [
    'void',
    'String',
    'byte',
    'char',
    'short',
    'int',
    'long',
    'BigInteger'
];

const accessors = [
    'public',
    'private',
    'protected',
    'static',
    'final'
];

const functions = {
    global: {
        'println': 'console.log',
        'assert': 'assert'
    },
    array: {
        'add': 'push',
        'each': {
            name: 'forEach',
            parameters: ['it']
        },
        'eachWithIndex': {
            name: 'forEach',
            parameters: 'custom'
        },
        'sort': {
            name: 'sort',
            parameters: 'custom'
        },
        'unique': {
            name: 'unique',
            returns: VariableType.ARRAY
        },
        'intersect': {
            name: 'intersect',
            returns: VariableType.ARRAY
        },
        'take': {
            name: 'take',
            returns: VariableType.ARRAY
        },
        'indexOf': {
            name: 'indexOf',
            returns: VariableType.NUMBER
        }
    },
    map: {
        'containsKey': 'hasOwnProperty'
    },
    number: {
        'times': {
            name: 'times',
            parameters: ['it']
        }
    },
    class: {
        // To be populated by analyser
    }
};

const properties = {
    array: {
        'size': {
            name: 'length',
            returns: VariableType.NUMBER
        }
    }
};

export {
    operators,
    keywords,
    functions,
    properties,
    types
}
