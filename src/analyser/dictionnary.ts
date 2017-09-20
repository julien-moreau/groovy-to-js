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
        'add': 'push',
        'each': {
            name: 'forEach',
            parameters: ['it']
        },
        'eachWithIndex': {
            name: 'forEach',
            parameters: 'custom'
        }
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
