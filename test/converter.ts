import * as assert from "assert";
import { convert } from "../src/converter/converter";

describe("Converter", () => {
    it("should convert a single line", () => {
        assert(convert("def a = 0;") === "var a = 0;".replace(/\n/g, ""));
    });
});
