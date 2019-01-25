import * as assert from "assert";
import { convert } from "../../src/converter/converter";

describe("Converter", () => {
    it("should convert self post operations", () => {
        assert(convert("a--") === "a--".replace(/n/g, ""));
        assert(convert("a++") === "a++".replace(/n/g, ""));
        assert(convert("--a") === "--a".replace(/n/g, ""));
    });

    it("should convert unary", () => {
        assert(convert("-1") === "-(1)".replace(/n/g, ""));
        assert(convert("- -1") === "-(-(1))".replace(/n/g, ""));
        assert(convert("!1") === "!(1)".replace(/n/g, ""));
        assert(convert("!!1") === "!(!(1))".replace(/n/g, ""));
    });

    it("should convert terms with mult", () => {
        assert(convert("1 * 2") === "(1 * 2)".replace(/n/g, ""));
    });

    it("should convert terms with div", () => {
        assert(convert("1 / 2") === "(1 / 2)".replace(/n/g, ""));
    });

    it("should convert an assignation", () => {
        assert(convert("a = a + 1") === "a = add(a, 1)".replace(/n/g, ""));
    });

    it("should convert spaceship operator", () => {
        assert(convert("1 <=> 2") === "spaceship(1, 2)".replace(/n/g, ""));
    });

    it("should convert an array", () => {
        assert(convert("[1, 2]") === "[1, 2]".replace(/n/g, ""));
    });

    it("should convert an array with ternary", () => {
        assert(convert("[(1 ? 2 : 3), 2]") === "[1 ? 2 : 3, 2]".replace(/n/g, ""));
    });

    it("should convert array and binary operator", () => {
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

    it("should compare values", () => {
        assert(convert("1 < 0") === "1 < 0".replace(/n/g, ""));
        assert(convert("1 <= 0") === "1 <= 0".replace(/n/g, ""));
        assert(convert("1 > 0") === "1 > 0".replace(/n/g, ""));
        assert(convert("1 >= 0") === "1 >= 0".replace(/n/g, ""));
    });

    it("should use bitwise operators", () => {
        assert(convert("1 << 0") === "(1 << 0)".replace(/n/g, ""));
        assert(convert("1 >> 0") === "(1 >> 0)".replace(/n/g, ""));
    });
});
