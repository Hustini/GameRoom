import { describe, test, expect } from "@jest/globals";
import { Figure } from "../models/figure.js";

describe("Figure", () => {
  describe("constructor", () => {
    test("defaults progress to HOME (-1)", () => {
      const figure = new Figure(2);

      expect(figure.id).toBe(2);
      expect(figure.progress).toBe(-1);
    });

    test("uses the given progress", () => {
      const figure = new Figure(0, 0);

      expect(figure.id).toBe(0);
      expect(figure.progress).toBe(0);
    });
  });

  describe("isHome()", () => {
    test.each([
      [-1, true],
      [0, false],
      [39, false],
      [40, false],
    ])("progress %i → %s", (progress, expected) => {
      expect(new Figure(0, progress).isHome()).toBe(expected);
    });
  });

  describe("isOnTrack()", () => {
    test.each([
      [-1, false],
      [0, true],
      [20, true],
      [39, true],
      [40, false],
      [43, false],
    ])("progress %i → %s", (progress, expected) => {
      expect(new Figure(0, progress).isOnTrack()).toBe(expected);
    });
  });

  describe("isInFinish()", () => {
    test.each([
      [-1, false],
      [0, false],
      [39, false],
      [40, true],
      [43, true],
    ])("progress %i → %s", (progress, expected) => {
      expect(new Figure(0, progress).isInFinish()).toBe(expected);
    });
  });

  describe("getTarget()", () => {
    test.each([
      // [start progress, dice, expected target]
      [0, 6, 6],      // normal move on the track
      [10, 3, 13],
      [36, 4, 40],    // exactly into the first finish field
      [39, 1, 40],
      [39, 4, 43],    // exactly into the last finish field
      [40, 3, 43],    // moving inside the finish lane
      [41, 2, 43],
    ])("progress %i + dice %i → %i", (progress, dice, expected) => {
      expect(new Figure(0, progress).getTarget(dice)).toBe(expected);
    });

    test.each([
      [39, 5],        // one past the last finish field
      [38, 6],
      [41, 3],
      [43, 1],        // already on the last field
    ])("progress %i + dice %i → null (past 43)", (progress, dice) => {
      expect(new Figure(0, progress).getTarget(dice)).toBeNull();
    });

    test("does not change the figure's progress", () => {
      const figure = new Figure(0, 10);

      figure.getTarget(5);

      expect(figure.progress).toBe(10);
    });
  });
});