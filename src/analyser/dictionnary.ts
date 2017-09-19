const operators = {
    '-': 'subtract',
    '-=': 'subtract',
    '+': 'add',
    '+=': 'add',
    '*': 'multiply'
};

const keywords = {
    'def': 'var'
};

const functions = {
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
