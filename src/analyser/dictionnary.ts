const operators = {
    '-': 'subtract',
    '-=': 'subtract',
    '+': 'add',
    '+=': 'add',
    '*': 'multiply',
    '*=': 'multiply'
};

const keywords = {
    'def': 'var'
};

const functions = {
    global: {
        'println': 'console.log'
    },
    array: {
        'add': 'push'
    },
    map: {
        'containsKey': 'hasOwnProperty'
    }
}

const properties = {
    array: {
        'size': 'length'
    }
}

export {
    operators,
    keywords,
    functions,
    properties
}
