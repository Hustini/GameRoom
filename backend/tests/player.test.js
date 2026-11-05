import { describe, test, expect, beforeEach } from "@jest/globals";
import { Player } from "./Player.js";
import { Figure } from "./Figure.js";

describe("Player", () => {
  let red;   // start index 0
  let green; // start index 20

  beforeEach(() => {
    red = new Player("p1", "Salih", "RED", 0);
    green = new Player("p2", "TestPlayer", "GREEN", 20);
  });

  describe("constructor", () => {
    test("sets the given fields", () => {
      expect(red.id).toBe("p1");
      expect(red.name).toBe("Salih");
      expect(red.color).toBe("RED");
      expect(red.startIndex).toBe(0);
    });

    test("sets socketId to null and connected to true", () => {
      expect(red.socketId).toBeNull();
      expect(red.connected).toBe(true);
    });

    test("creates 4 figures with ids 0–3", () => {
      expect(red.figures).toHaveLength(4);
      red.figures.forEach((figure, index) => {
        expect(figure).toBeInstanceOf(Figure);
        expect(figure.id).toBe(index);
      });
    });

    test("puts figure 0 on the start field (A) and the rest in the house (B)", () => {
      expect(red.figures[0].progress).toBe(0);
      expect(red.figures[1].progress).toBe(-1);
      expect(red.figures[2].progress).toBe(-1);
      expect(red.figures[3].progress).toBe(-1);
    });

    test("each player gets their own figure objects", () => {
      red.figures[1].progress = 5;

      expect(green.figures[1].progress).toBe(-1);
    });
  });

  describe("getFigure()", () => {
    test("returns the figure with that id", () => {
      expect(red.getFigure(2)).toBe(red.figures[2]);
    });

    test("returns nothing for an unknown id", () => {
      expect(red.getFigure(99)).toBeFalsy();
    });
  });

  describe("getBoardPosition()", () => {
    test.each([
      // [startIndex, progress, expected]
      [0, 0, 0],
      [0, 5, 5],
      [0, 39, 39],
      [20, 0, 20],
      [20, 5, 25],
      [20, 19, 39],
      [20, 20, 0],    // wraps around past field 39
      [20, 39, 19],
    ])("start %i + progress %i → field %i", (startIndex, progress, expected) => {
      const player = new Player("p", "Test", "RED", startIndex);
      const figure = player.figures[0];
      figure.progress = progress;

      expect(player.getBoardPosition(figure)).toBe(expected);
    });

    test("returns null for a figure in the house", () => {
      expect(green.getBoardPosition(green.figures[1])).toBeNull();
    });

    test.each([40, 43])("returns null for a figure in the finish (progress %i)", (progress) => {
      const figure = green.figures[0];
      figure.progress = progress;

      expect(green.getBoardPosition(figure)).toBeNull();
    });
  });

  describe("getFiguresAtHome()", () => {
    test("returns the 3 figures in the house at the start", () => {
      const ids = red.getFiguresAtHome().map((figure) => figure.id);

      expect(ids).toEqual([1, 2, 3]);
    });

    test("returns an empty array when no figure is home", () => {
      red.figures.forEach((figure, i) => (figure.progress = i));

      expect(red.getFiguresAtHome()).toEqual([]);
    });
  });

  describe("getFigureOnStartField()", () => {
    test("returns the figure standing on the start field", () => {
      expect(red.getFigureOnStartField()).toBe(red.figures[0]);
    });

    test("returns nothing when the start field is free", () => {
      red.figures[0].progress = 5;

      expect(red.getFigureOnStartField()).toBeFalsy();
    });
  });

  describe("hasWon()", () => {
    test("is false at the start", () => {
      expect(red.hasWon()).toBe(false);
    });

    test("is false when only 3 figures are in the finish", () => {
      red.figures[0].progress = 40;
      red.figures[1].progress = 41;
      red.figures[2].progress = 42;
      red.figures[3].progress = 39;

      expect(red.hasWon()).toBe(false);
    });

    test("is true when all 4 figures are in the finish", () => {
      red.figures.forEach((figure, i) => (figure.progress = 40 + i));

      expect(red.hasWon()).toBe(true);
    });
  });
});