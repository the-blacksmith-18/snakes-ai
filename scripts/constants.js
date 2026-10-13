const tileWidth = 30;
const snakeTiles = 25;
const snakeLength = snakeTiles * tileWidth;
const snakeSpeed = 5; // 1x
const minSnakeSpeed = 1; // ticks per second
const maxSnakeSpeed = 30;
const gameCanvas = "gameCanvas";
const gridCanvas = "gameGrid";
const scale = 0.70;
const STATES = {
    STOPPED: -1,
    PAUSE: 0,
    RUNNING: 1
};
const DIRECTIONS = {
    TOP: -1,
    RIGHT: 2,
    BOTTOM: 1,
    LEFT: -2
};