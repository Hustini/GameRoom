import { Color } from "./enums.js";
 
// Board
export const TRACK_LENGTH = 40;       
export const FIGURES_PER_PLAYER = 4;
export const FINISH_LENGTH = 4;      

// Players and starting positions
// Colors used in a 2-player game, in join order (index 0 = first player).
export const PLAYER_COLORS = Object.freeze([Color.RED, Color.GREEN]);
 
// Absolute track index of each color's start field.
// RED and GREEN sit on opposite sides (0 and 20).
export const START_INDEX = Object.freeze({
  [Color.RED]: 0,
  [Color.BLUE]: 10,
  [Color.GREEN]: 20,
  [Color.YELLOW]: 30,
});
 
// Progress values for a figure's position on the board:
// HOME        = figure is still in the house
// 0 – 39      = on the track (0 = own start field)
// 40 – 43     = in the finish lane
export const HOME = -1;
export const TRACK_START = 0;
export const TRACK_END = TRACK_LENGTH - 1;                  // 39
export const FINISH_START = TRACK_LENGTH;                   // 40
export const FINISH_END = TRACK_LENGTH + FINISH_LENGTH - 1; // 43
 
