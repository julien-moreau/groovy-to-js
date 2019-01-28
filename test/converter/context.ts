import * as assert from "assert";
import * as vm from 'vm';

import { Context } from "../../src/converter/context";

describe("Context", () => {
    it("should return a context map", () => {
        const ctx = {
            a: "hello",
            b: 0,
            c: true,
            d: [],
            e: {
                a: 0
            }
        };

        const context = Context.BuildFrom(ctx);
        assert(context["a"] === "string");
        assert(context["b"] === "number");
        assert(context["c"] === "boolean");
        assert(context["d"] === "array");
        assert(context["e.a"] === "number");
    });
});
