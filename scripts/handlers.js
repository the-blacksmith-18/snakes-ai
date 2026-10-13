function init() {
    console.log("loaded");
    
    canvasHelper.Init(gameCanvas, { _tileWidth: tileWidth, _scale: scale });
    canvasHelper.DrawGrids(tileWidth);

    let _snake = snake({
        grid: canvasHelper.GetGridDimensions(), 
        startCoordinates: null, 
        snakeSpeed
    });

    _snake.Events.RegisterOnError((reason)=> {
        canvasHelper.OnError(_snake.Position, "GAME OVER: " + reason);
    });

    const btnStart = document.getElementById("startButton");
    const btnPause = document.getElementById("pauseButton");
    const btnHealth = document.getElementById("sizeButton");
    const btnSlower = document.getElementById("slowerButton");
    const btnFaster = document.getElementById("fasterButton");
    const speedLabel = document.getElementById("speedLabel");

    const showSpeed = (speed) => {
        speedLabel.textContent = `Speed ${speed}`;
    }
    showSpeed(_snake.Speed());

    btnStart.addEventListener("click", (event) => {
        _snake.Actions.Start(canvasHelper.RenderSnake); 
    });

    btnPause.addEventListener("click", (event) => {
        _snake.Actions.PauseOrPlay();
    });
    btnHealth.addEventListener("click", (event) => {
        _snake.Actions.IncreaseHealth();
    });
    btnSlower.addEventListener("click", (event) => {
        showSpeed(_snake.Actions.ChangeSpeed(-1));
    });
    btnFaster.addEventListener("click", (event) => {
        showSpeed(_snake.Actions.ChangeSpeed(1));
    });

    document.addEventListener("keydown", (e) => {
        if (e.key == "ArrowUp") {
            _snake.Actions.ChangeDirection(DIRECTIONS.TOP);
        }
        else if (e.key == "ArrowDown") {
            _snake.Actions.ChangeDirection(DIRECTIONS.BOTTOM);
        }
        else if (e.key == "ArrowLeft") {
            _snake.Actions.ChangeDirection(DIRECTIONS.LEFT);
        }
        else if (e.key == "ArrowRight") {
            _snake.Actions.ChangeDirection(DIRECTIONS.RIGHT);
        }
    })

}



document.addEventListener("DOMContentLoaded", init);
