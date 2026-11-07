import { describe, test, expect, beforeEach } from "@jest/globals";
import { Game } from "../models/game.js";
import { Player } from "../models/player.js";

// Sends the object through JSON exactly like Socket.IO does,
// so the tests check what the frontend will actually receive.
const send = (value) => JSON.parse(JSON.stringify(value));

describe("Wiring Game → Player → Figure", () => {
  let game;
  let red;   // start index 0
  let green; // start index 20

  beforeEach(() => {
    game = new Game("ABC123");
    red = new Player("p1", "Salih", "RED", 0);
    green = new Player("p2", "Test", "GREEN", 20);
    game.addPlayer(red);
    game.addPlayer(green);
  });

  describe("setup", () => {
    test("game has 2 players with 8 figures in total", () => {
      expect(game.players).toHaveLength(2);
      expect(game.players.flatMap((player) => player.figures)).toHaveLength(8);
    });

    test.each([
      ["red", 0],
      ["green", 1],
    ])("%s: figure 0 on A (progress 0), figures 1–3 on B (HOME)", (_name, index) => {
      const progresses = game.players[index].figures.map((figure) => figure.progress);

      expect(progresses).toEqual([0, -1, -1, -1]);
    });

    test("a third addPlayer throws", () => {
      const third = new Player("p3", "Max", "BLUE", 10);

      expect(() => game.addPlayer(third)).toThrow();
      expect(game.players).toHaveLength(2);
    });
  });

  describe("findFigureAt()", () => {
    test("finds each player's figure on their start field", () => {
      expect(game.findFigureAt(0)).toEqual({ player: red, figure: red.figures[0] });
      expect(game.findFigureAt(20)).toEqual({ player: green, figure: green.figures[0] });
    });

    test("finds red's figure further along the track", () => {
      red.figures[0].progress = 15; // (0 + 15) % 40 = 15

      expect(game.findFigureAt(15)).toEqual({ player: red, figure: red.figures[0] });
    });

    test("finds green's figure after wrapping around (startIndex 20)", () => {
      green.figures[0].progress = 25; // (20 + 25) % 40 = 5

      expect(game.findFigureAt(5)).toEqual({ player: green, figure: green.figures[0] });
    });

    test("finds green's figure on field 39 just before the wrap", () => {
      green.figures[0].progress = 19; // (20 + 19) % 40 = 39

      expect(game.findFigureAt(39)).toEqual({ player: green, figure: green.figures[0] });
    });

    test("returns the original objects, not copies", () => {
      const hit = game.findFigureAt(20);

      expect(hit.player).toBe(green);
      expect(hit.figure).toBe(green.figures[0]);
    });
  });

  describe("state sent to the clients", () => {
    beforeEach(() => {
      red.socketId = "socket-red";
      green.socketId = "socket-green";
    });

    test("Player is sent without socketId and with plain figure data", () => {
      expect(send(red)).toEqual({
        id: "p1",
        name: "Salih",
        color: "RED",
        startIndex: 0,
        connected: true,
        figures: [
          { id: 0, progress: 0 },
          { id: 1, progress: -1 },
          { id: 2, progress: -1 },
          { id: 3, progress: -1 },
        ],
      });
    });

    test("Game has the expected shape", () => {
      const state = send(game);

      expect(state).toEqual(
        expect.objectContaining({
          roomCode: "ABC123",
          status: "WAITING",
          phase: "ROLL",
          diceValue: null,
          winnerId: null,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
          players: [send(red), send(green)],
        })
      );
    });

    test("Game contains movableFigureIds as an array", () => {
      const state = send(game);

      expect(Array.isArray(state.movableFigureIds)).toBe(true);
    });

    test("no socketId anywhere in the sent state", () => {
      const json = JSON.stringify(game);

      expect(json).not.toContain("socketId");
      expect(json).not.toContain("socket-red");
      expect(json).not.toContain("socket-green");
    });

    test("methods are not sent", () => {
      const state = send(game);

      expect(state.addPlayer).toBeUndefined();
      expect(state.players[0].hasWon).toBeUndefined();
      expect(state.players[0].figures[0].isHome).toBeUndefined();
    });

    test("serializing does not remove socketId from the real object", () => {
      JSON.stringify(game);

      expect(red.socketId).toBe("socket-red");
    });
  });
});