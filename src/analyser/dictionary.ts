export const naviveTypes: string[] = [
    "def",
    "byte",
    "String",
    "short", "Short",
    "int", "Integer",
    "long", "Long",
    "float", "Float",
    "double", "Double",
    "char", "Character",
    "boolean", "Boolean"
];

export const keywords: string[] = [
    "if", "else",
    "return",
    "break", "while", "for", "do"
];

export const translation = {
    array: {
        methodToproperty: {
            "size": "length",
        },
        methods: {
            "each": "forEach",
            "eachWithIndex": "forEach",
            "add": "push"
        }
    },
    map: {
        methodToproperty: { },
        methods: {
            "containsKey": "hasOwnProperty"
        }
    }
}
