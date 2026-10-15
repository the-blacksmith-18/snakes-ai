const InitActionHandlers = (snakeCtx) => {
    const btnStart = document.getElementById("startButton");
    const btnPause = document.getElementById("pauseButton");
    const btnHealth = document.getElementById("sizeButton");
    const btnSlower = document.getElementById("slowerButton");
    const btnFaster = document.getElementById("fasterButton");
    const speedLabel = document.getElementById("speedLabel");

    const showSpeed = (speed) => {
        speedLabel.textContent = `Speed ${speed}`;
    }
    showSpeed(snakeCtx.Speed());

    btnStart.addEventListener("click", (event) => {
        //Important: remeber to set on move callback to enable snake rendering on canvas
        if (!snakeCtx.IsRenderingEnabled())
            alert("Snake movement rendering is not enabled.");
        else 
            snakeCtx.Actions.Start(); 
    });

    btnPause.addEventListener("click", (event) => {
        snakeCtx.Actions.PauseOrPlay();
    });
    btnHealth.addEventListener("click", (event) => {
        snakeCtx.Actions.IncreaseHealth();
    });
    btnSlower.addEventListener("click", (event) => {
        showSpeed(snakeCtx.Actions.ChangeSpeed(-1));
    });
    btnFaster.addEventListener("click", (event) => {
        showSpeed(snakeCtx.Actions.ChangeSpeed(1));
    });

    document.addEventListener("keydown", (e) => {
        if (e.key == "ArrowUp") {
            snakeCtx.Actions.ChangeDirection(DIRECTIONS.TOP);
        }
        else if (e.key == "ArrowDown") {
            snakeCtx.Actions.ChangeDirection(DIRECTIONS.BOTTOM);
        }
        else if (e.key == "ArrowLeft") {
            snakeCtx.Actions.ChangeDirection(DIRECTIONS.LEFT);
        }
        else if (e.key == "ArrowRight") {
            snakeCtx.Actions.ChangeDirection(DIRECTIONS.RIGHT);
        }
    });
}

function Init() {

    canvasHelper.Init(gameCanvas, { _tileWidth: tileWidth, _scale: scale });
    canvasHelper.DrawGrids(tileWidth);

    const gridDim = canvasHelper.GetGridDimensions();
    const gridCtx = gridHelper(gridDim["rows"], gridDim["cols"]);
    const hurdles = gridCtx.GenerateHurdles(new Set());

    let _snake = snake({
        grid: gridDim, 
        startCoordinates: null, 
        snakeSpeed,
        hurdles
    });

    let foodPosition = null;

    const foodMechanism = (snakePosition) => {
        const snakePositionSet = new Set(snakePosition.map(x => gridCtx.Encoder.CoordinatesToKey(x)));
        if (foodPosition == null)
            foodPosition = gridCtx.GenerateFood(snakePositionSet);

        const snakeAteFood = gridCtx.Encoder.CoordinatesToKey(snakePosition[snakePosition.length - 1]) == gridCtx.Encoder.CoordinatesToKey(foodPosition);
        if (snakeAteFood) {
            _snake.Actions.IncreaseHealth();
            foodPosition = gridCtx.GenerateFood(snakePositionSet);
        }
        canvasHelper.RenderBlinkingItem(foodPosition, "yellow");
    }

    _snake.Events.RegisterOnMove((snakePosition, lastLeftPosition) => {
        foodMechanism(snakePosition);
        canvasHelper.RenderSnake(snakePosition, lastLeftPosition);
    });
    
    
    canvasHelper.RenderObjects(Array.from(hurdles).map(x => gridCtx.Encoder.CoordinatesFromKey(x)));

    _snake.Events.RegisterOnError((reason)=> {
        canvasHelper.OnError(_snake.Position(), reason);
    });

    InitActionHandlers(_snake);
}


document.addEventListener("DOMContentLoaded", Init);
