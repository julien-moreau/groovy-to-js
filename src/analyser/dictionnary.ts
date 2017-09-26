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
