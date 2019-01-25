import * as assert from "assert";
import { convert } from "../../src/converter/converter";

describe("Converter", () => {
    it("should convert an array", () => {
        assert(convert("[1, 2]") === "[1, 2]".replace(/n/g, ""));
    });

    it("should convert an array with ternary expressions", () => {
        assert(convert("[(1 ? 2 : 3), 2]") === "[1 ? 2 : 3, 2]".replace(/n/g, ""));
    });

    it("should convert simple expressions", () => {
        assert(convert("1 + 2") === "(1 + 2)".replace(/n/g, ""));
        assert(convert("[1] + 2") === "add([1], 2)".replace(/n/g, ""));
        assert(convert("[1] + [2]") === "add([1], [2])".replace(/n/g, ""));
        assert(convert("[1] - 2") === "subtract([1], 2)".replace(/n/g, ""));
        assert(convert("[1] * 2") === "multiply([1], 2)".replace(/n/g, ""));
    });

    it("should convert a variable declaration with no value", () => {
        assert(convert("def a;") === "var a;".replace(/\n/g, ""));
    });
    it("should convert a variable declaration", () => {
        assert(convert("def a = 0;") === "var a = 0;".replace(/\n/g, ""));
    });
});
