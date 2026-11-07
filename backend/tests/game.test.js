import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { Game } from "../models/game.js";
import { Player } from "../models/player.js";

describe("Game", () => {
  let game;
  let red;   // start index 0
  let green; // start index 20

  beforeEach(() => {
    game = new Game("ABC123");
    red = new Player("p1", "Salih", "RED", 0);
    green = new Player("p2", "Test", "GREEN", 20);
  });

  describe("constructor", () => {
    test("sets the initial state", () => {
      expect(game.roomCode).toBe("ABC123");
      expect(game.players).toEqual([]);
      expect(game.status).toBe("WAITING");
      expect(game.phase).toBe("ROLL");
      expect(game.diceValue).toBeNull();
      expect(game.winnerId).toBeNull();
    });

    test("sets createdAt and updatedAt", () => {
      expect(game.createdAt).toBeDefined();
      expect(game.updatedAt).toBeDefined();
    });
  });

  describe("addPlayer()", () => {
    test("adds players in order", () => {
      game.addPlayer(red);
      game.addPlayer(green);

      expect(game.players).toEqual([red, green]);
    });

    test("throws when the game already has 2 players", () => {
      game.addPlayer(red);
      game.addPlayer(green);
      const third = new Player("p3", "Max", "BLUE", 10);

      expect(() => game.addPlayer(third)).toThrow();
      expect(game.players).toHaveLength(2);
    });
  });

  describe("player lookups", () => {
    beforeEach(() => {
      game.addPlayer(red);
      game.addPlayer(green);
    });

    test("getPlayerById() returns the matching player", () => {
      expect(game.getPlayerById("p2")).toBe(green);
    });

    test("getPlayerById() returns nothing for an unknown id", () => {
      expect(game.getPlayerById("nope")).toBeFalsy();
    });

    test("getOpponent() returns the other player", () => {
      expect(game.getOpponent("p1")).toBe(green);
      expect(game.getOpponent("p2")).toBe(red);
    });

    test("getCurrentPlayer() is the first player by default", () => {
      expect(game.getCurrentPlayer()).toBe(red);
    });
  });

  describe("findFigureAt()", () => {
    beforeEach(() => {
      game.addPlayer(red);
      game.addPlayer(green);
    });

    test("finds a figure on its own start field", () => {
      expect(game.findFigureAt(0)).toEqual({ player: red, figure: red.figures[0] });
      expect(game.findFigureAt(20)).toEqual({ player: green, figure: green.figures[0] });
    });

    test("finds a figure after the track wraps around", () => {
      green.figures[0].progress = 25; // (20 + 25) % 40 = 5

      expect(game.findFigureAt(5)).toEqual({ player: green, figure: green.figures[0] });
    });

    test("returns null for an empty field", () => {
      expect(game.findFigureAt(7)).toBeNull();
    });

    test("ignores figures in the finish", () => {
      red.figures[0].progress = 40; // would be field 0 if not ignored

      expect(game.findFigureAt(0)).toBeNull();
    });
  });

  describe("touch()", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("updates updatedAt to now", () => {
      jest.setSystemTime(new Date("2026-11-05T10:00:00Z"));
      const timedGame = new Game("ROOM1");

      jest.setSystemTime(new Date("2026-11-05T10:05:00Z"));
      timedGame.touch();

      expect(new Date(timedGame.updatedAt).getTime()).toBe(
        new Date("2026-11-05T10:05:00Z").getTime()
      );
      expect(new Date(timedGame.createdAt).getTime()).toBe(
        new Date("2026-11-05T10:00:00Z").getTime()
      );
    });
  });

  describe("Phase 3 stubs", () => {
    test.each(["start", "rollDice", "getMovableFigures", "moveFigure", "endTurn"])(
      "%s() exists",
      (method) => {
        expect(typeof game[method]).toBe("function");
      }
    );
  });
});