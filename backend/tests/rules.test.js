import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { Game } from "../models/game.js";
import { Player } from "../models/player.js";

// ---------- helpers ----------

// Sets the progress of all 4 figures of a player, e.g. setFigures(red, [5, -1, -1, -1])
const setFigures = (player, progresses) => {
  progresses.forEach((progress, i) => (player.figures[i].progress = progress));
};

// Makes the next Math.random() return a value that rolls the given number
const mockDice = (value) => {
  jest.spyOn(Math, "random").mockReturnValue((value - 1) / 6 + 0.01);
};

// Puts the game into the MOVE phase with a given dice value (skips rollDice)
const prepareMove = (game, diceValue) => {
  game.diceValue = diceValue;
  game.phase = "MOVE";
};

const movableIds = (game, playerId) =>
  game.getMovableFigures(playerId).map((figure) => figure.id).sort();

// ---------- tests ----------

describe("Phase 3 – game rules", () => {
  let game;
  let red;   // start index 0
  let green; // start index 20

  // Started game, red's turn, green's figures all on B so they don't get in the way
  beforeEach(() => {
    game = new Game("ABC123");
    red = new Player("p1", "Salih", "RED", 0);
    green = new Player("p2", "Test", "GREEN", 20);
    game.addPlayer(red);
    game.addPlayer(green);
    game.start();
    game.currentPlayerIndex = 0;
    setFigures(green, [-1, -1, -1, -1]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------
  describe("start()", () => {
    test("is rejected with only one player", () => {
      const soloGame = new Game("SOLO");
      soloGame.addPlayer(new Player("p1", "Salih", "RED", 0));

      expect(() => soloGame.start()).toThrow();
      expect(soloGame.status).toBe("WAITING");
    });

    test("is rejected when the game is not WAITING", () => {
      // game from beforeEach is already PLAYING
      expect(() => game.start()).toThrow();
    });

    test("sets status PLAYING, phase ROLL and a valid currentPlayerIndex", () => {
      const newGame = new Game("NEW");
      newGame.addPlayer(new Player("p1", "Salih", "RED", 0));
      newGame.addPlayer(new Player("p2", "Test", "GREEN", 20));

      newGame.start();

      expect(newGame.status).toBe("PLAYING");
      expect(newGame.phase).toBe("ROLL");
      expect([0, 1]).toContain(newGame.currentPlayerIndex);
    });

    test.each([
      [0, 0],
      [0.99, 1],
    ])("picks the first player randomly (Math.random = %d → index %i)", (random, expected) => {
      jest.spyOn(Math, "random").mockReturnValue(random);
      const newGame = new Game("NEW");
      newGame.addPlayer(new Player("p1", "Salih", "RED", 0));
      newGame.addPlayer(new Player("p2", "Test", "GREEN", 20));

      newGame.start();

      expect(newGame.currentPlayerIndex).toBe(expected);
    });
  });

  // ---------------------------------------------------------------
  describe("rollDice()", () => {
    test("sets diceValue and phase MOVE when a figure can move", () => {
      setFigures(red, [5, -1, -1, -1]);
      mockDice(4);

      game.rollDice("p1");

      expect(game.diceValue).toBe(4);
      expect(game.phase).toBe("MOVE");
      expect(game.getCurrentPlayer()).toBe(red);
    });

    test("ends the turn when no figure can move", () => {
      setFigures(red, [-1, -1, -1, -1]); // all on B, no 6
      mockDice(3);

      game.rollDice("p1");

      expect(game.getCurrentPlayer()).toBe(green);
      expect(game.phase).toBe("ROLL");
      expect(game.diceValue).toBeNull();
    });

    test("is rejected when it is not the player's turn", () => {
      expect(() => game.rollDice("p2")).toThrow();
    });

    test("is rejected in phase MOVE", () => {
      prepareMove(game, 3);

      expect(() => game.rollDice("p1")).toThrow();
    });

    test("is rejected when the game is not PLAYING", () => {
      const waitingGame = new Game("WAIT");
      waitingGame.addPlayer(new Player("p1", "Salih", "RED", 0));

      expect(() => waitingGame.rollDice("p1")).toThrow();
    });
  });

  // ---------------------------------------------------------------
  describe("getMovableFigures() – bringing out with a 6", () => {
    test("A free → only figures on B may move", () => {
      setFigures(red, [5, -1, -1, -1]);
      prepareMove(game, 6);

      const movable = game.getMovableFigures("p1");

      expect(movable.length).toBeGreaterThan(0);
      movable.forEach((figure) => expect(figure.isHome()).toBe(true));
    });

    test("opponent on A → bringing out is still allowed (and captures)", () => {
      setFigures(red, [5, -1, -1, -1]);
      setFigures(green, [20, -1, -1, -1]); // (20 + 20) % 40 = 0 → red's A
      prepareMove(game, 6);

      const movable = game.getMovableFigures("p1");

      expect(movable.length).toBeGreaterThan(0);
      movable.forEach((figure) => expect(figure.isHome()).toBe(true));
    });

    test("own figure on A → only that figure may move", () => {
      setFigures(red, [0, -1, -1, -1]);
      prepareMove(game, 6);

      expect(movableIds(game, "p1")).toEqual([0]);
    });

    test("without a 6, figures on B cannot move", () => {
      setFigures(red, [10, -1, -1, -1]);
      prepareMove(game, 5);

      expect(movableIds(game, "p1")).toEqual([0]);
    });
  });

  describe("getMovableFigures() – clearing A", () => {
    test("figures on B and own figure on A → only the figure on A may move", () => {
      setFigures(red, [0, 10, -1, -1]);
      prepareMove(game, 3);

      expect(movableIds(game, "p1")).toEqual([0]);
    });

    test("figure on A is blocked by an own figure → other figures may move", () => {
      setFigures(red, [0, 3, -1, -1]); // 0 + 3 = 3 → own figure there
      prepareMove(game, 3);

      expect(movableIds(game, "p1")).toEqual([1]);
    });

    test("no figures on B → every figure with a valid target may move", () => {
      setFigures(red, [0, 10, 15, 25]);
      prepareMove(game, 2);

      expect(movableIds(game, "p1")).toEqual([0, 1, 2, 3]);
    });
  });

  describe("getMovableFigures() – invalid targets", () => {
    test("cannot land on an own figure", () => {
      setFigures(red, [5, 7, 20, 30]);
      prepareMove(game, 2); // 5 + 2 = 7 → own figure

      expect(movableIds(game, "p1")).toEqual([1, 2, 3]);
    });

    test("can land on an opponent figure", () => {
      setFigures(red, [5, 10, 20, 30]);
      setFigures(green, [28, -1, -1, -1]); // (20 + 28) % 40 = 8
      prepareMove(game, 3); // 5 + 3 = 8

      expect(movableIds(game, "p1")).toContain(0);
    });
  });

  // ---------------------------------------------------------------
  describe("moveFigure()", () => {
    test("moves the figure to its target", () => {
      setFigures(red, [5, 10, 20, 30]);
      prepareMove(game, 3);

      game.moveFigure("p1", 0);

      expect(red.figures[0].progress).toBe(8);
    });

    test("bringing out sets progress from HOME to 0", () => {
      setFigures(red, [5, -1, -1, -1]);
      prepareMove(game, 6);

      game.moveFigure("p1", 1);

      expect(red.figures[1].progress).toBe(0);
    });

    test("bringing out onto an opponent on A captures it", () => {
      setFigures(red, [5, -1, -1, -1]);
      setFigures(green, [20, -1, -1, -1]); // on red's A
      prepareMove(game, 6);

      game.moveFigure("p1", 1);

      expect(red.figures[1].progress).toBe(0);
      expect(green.figures[0].progress).toBe(-1);
    });

    test("landing on an opponent sends it home", () => {
      setFigures(red, [5, 10, 20, 30]);
      setFigures(green, [28, -1, -1, -1]); // board field 8
      prepareMove(game, 3);

      game.moveFigure("p1", 0);

      expect(red.figures[0].progress).toBe(8);
      expect(green.figures[0].progress).toBe(-1);
    });

    test("does not capture opponent figures in their finish (no board position)", () => {
      setFigures(red, [5, 10, 20, 30]);
      setFigures(green, [40, -1, -1, -1]); // in finish, no board field
      prepareMove(game, 3);

      game.moveFigure("p1", 0);

      expect(green.figures[0].progress).toBe(40);
    });

    test("is rejected in phase ROLL", () => {
      setFigures(red, [5, 10, 20, 30]);

      expect(() => game.moveFigure("p1", 0)).toThrow();
    });

    test("is rejected when it is not the player's turn", () => {
      setFigures(green, [5, 10, 15, 25]);
      prepareMove(game, 3);

      expect(() => game.moveFigure("p2", 0)).toThrow();
    });

    test("is rejected for a figure that is not movable", () => {
      setFigures(red, [5, 7, 20, 30]);
      prepareMove(game, 2); // figure 0 would land on figure 1

      expect(() => game.moveFigure("p1", 0)).toThrow();
      expect(red.figures[0].progress).toBe(5);
    });
  });

  // ---------------------------------------------------------------
  describe("wrap-around for startIndex = 20", () => {
    beforeEach(() => {
      game.currentPlayerIndex = 1; // green's turn
    });

    test("green moves past field 39 and continues at field 0", () => {
      setFigures(green, [17, 5, 10, 25]); // board field 37
      prepareMove(game, 5);

      game.moveFigure("p2", 0);

      expect(green.figures[0].progress).toBe(22);
      expect(green.getBoardPosition(green.figures[0])).toBe(2);
    });

    test("green captures red after wrapping around", () => {
      setFigures(green, [17, 5, 10, 25]); // board field 37
      setFigures(red, [2, -1, -1, -1]);   // board field 2
      prepareMove(game, 5);               // 37 → 2

      game.moveFigure("p2", 0);

      expect(red.figures[0].progress).toBe(-1);
    });

    test("green enters its finish after progress 39 (board field 19)", () => {
      setFigures(green, [38, 5, 10, 25]); // board field 18
      prepareMove(game, 3);

      game.moveFigure("p2", 0);

      expect(green.figures[0].progress).toBe(41);
      expect(green.getBoardPosition(green.figures[0])).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  describe("finish", () => {
    test("exact roll into the last finish field", () => {
      setFigures(red, [39, 10, 20, 30]);
      prepareMove(game, 4);

      game.moveFigure("p1", 0);

      expect(red.figures[0].progress).toBe(43);
    });

    test("too-high roll is not allowed", () => {
      setFigures(red, [39, 10, 20, 30]);
      prepareMove(game, 5); // would be 44

      expect(movableIds(game, "p1")).not.toContain(0);
    });

    test("cannot land on an own figure in the finish", () => {
      setFigures(red, [42, 38, 20, 30]);
      prepareMove(game, 4); // 38 + 4 = 42 → own figure

      expect(movableIds(game, "p1")).not.toContain(1);
    });

    test("jumping over an own figure in the finish is allowed", () => {
      setFigures(red, [42, 38, 20, 30]);
      prepareMove(game, 5); // 38 + 5 = 43, jumps over 42

      game.moveFigure("p1", 1);

      expect(red.figures[1].progress).toBe(43);
    });
  });

  // ---------------------------------------------------------------
  describe("winning", () => {
    test("last figure into the finish wins the game", () => {
      setFigures(red, [40, 41, 42, 39]);
      prepareMove(game, 4);

      game.moveFigure("p1", 3);

      expect(game.winnerId).toBe("p1");
      expect(game.status).toBe("FINISHED");
    });

    test("no extra roll on the winning 6", () => {
      setFigures(red, [40, 41, 42, 37]);
      prepareMove(game, 6);

      game.moveFigure("p1", 3);

      expect(game.status).toBe("FINISHED");
      expect(() => game.rollDice("p1")).toThrow();
    });
  });

  // ---------------------------------------------------------------
  describe("endTurn()", () => {
    test("after a 6 the same player rolls again", () => {
      setFigures(red, [5, 10, 20, 30]);
      prepareMove(game, 6);

      game.moveFigure("p1", 0);

      expect(game.getCurrentPlayer()).toBe(red);
      expect(game.phase).toBe("ROLL");
      expect(game.diceValue).toBeNull();
    });

    test("without a 6 the turn switches to the other player", () => {
      setFigures(red, [5, 10, 20, 30]);
      prepareMove(game, 3);

      game.moveFigure("p1", 0);

      expect(game.getCurrentPlayer()).toBe(green);
      expect(game.phase).toBe("ROLL");
      expect(game.diceValue).toBeNull();
    });

    test("calls touch()", () => {
      const touchSpy = jest.spyOn(game, "touch");
      game.diceValue = 3;

      game.endTurn();

      expect(touchSpy).toHaveBeenCalled();
    });
  });
});