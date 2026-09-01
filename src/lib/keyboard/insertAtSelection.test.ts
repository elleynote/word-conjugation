import { describe, expect, it } from "vitest";
import { insertAtSelection } from "./insertAtSelection";

describe("insertAtSelection", () => {
  it("inserts a character at the caret", () => {
    expect(insertAtSelection("գել", "ր", 1, 1)).toEqual({ value: "գրել", caret: 2 });
  });

  it("replaces the active selection", () => {
    expect(insertAtSelection("գաել", "ր", 1, 2)).toEqual({ value: "գրել", caret: 2 });
  });
});

import { backspaceAtSelection } from "./insertAtSelection";

describe("backspaceAtSelection", () => {
  it("deletes the previous character at a collapsed caret", () => {
    expect(backspaceAtSelection("գրել", 2, 2)).toEqual({ value: "գել", caret: 1 });
  });

  it("deletes the active selection", () => {
    expect(backspaceAtSelection("գրել", 1, 3)).toEqual({ value: "գլ", caret: 1 });
  });
});
