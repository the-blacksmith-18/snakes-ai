/**
 * 
 * @param {{grid:{rows: number, cols: number}, startCoordinates: {row: number, col: number},snakeSpeed:number, hurdles: Set<string>}} config 
 * @returns 
 */
const snake = (config) => ((config) => {
    let { grid, startCoordinates, snakeSpeed, hurdles } = config
    let isDead = false;
    let health = 1; //minimum start length of snake before eating any food
    let currentPosition = [];
    let currentDirection = DIRECTIONS.RIGHT;// default right
    let currentState = STATES.STOPPED;
    let events = {
        onError: null,
        onMove: null
    }

    const die = (reason) => {
        isDead = true;
        currentState = STATES.STOPPED;
        if (events.onError)
            events.onError(reason);
    }

    /**
     * @param {{row: number, col: number}} startCoordinates 
     */
    const start = (startCoordinates) => {
        currentPosition.length = 0;
        let initialCoordinates = startCoordinates && Object.keys(startCoordinates).length > 0 ? startCoordinates : { row: 0, col: 0 } 
        currentPosition.push(initialCoordinates);
        currentState = STATES.RUNNING;
        Move();
    }

    let interval = null;
    let onTick = null;
    const Move = () => {
        if (!Number.isNaN(interval))
            clearInterval(interval);

        interval = setInterval(() => {
            if (currentState == STATES.RUNNING) {
                const lastPositionOfHead = currentPosition[currentPosition.length - 1];
                if (currentPosition.length > 4 && currentPosition.slice(0, -1).some(position => position.row == lastPositionOfHead.row && position.col == lastPositionOfHead.col))
                { 
                    die("Snake hits itself"); 
                    clearInterval(interval);
                    return;
                }

                if (!isValidMove(lastPositionOfHead)) {
                    die("Snake hits wall");
                    clearInterval(interval);
                    return;
                }

                switch (currentDirection) {
                    case DIRECTIONS.TOP:
                        currentPosition.push({
                            row: lastPositionOfHead.row - 1,
                            col: lastPositionOfHead.col
                        });
                        break;
                    case DIRECTIONS.RIGHT:
                        currentPosition.push({
                            row: lastPositionOfHead.row,
                            col: lastPositionOfHead.col + 1
                        });
                        break;
                    case DIRECTIONS.BOTTOM:
                        currentPosition.push({
                            row: lastPositionOfHead.row + 1,
                            col: lastPositionOfHead.col
                        });
                        break;
                    case DIRECTIONS.LEFT:
                        currentPosition.push({
                            row: lastPositionOfHead.row,
                            col: lastPositionOfHead.col - 1
                        });
                        break;
                }
                let computedHeadPosition = currentPosition[currentPosition.length - 1];
                if (computedHeadPosition.row < 0) {
                    computedHeadPosition.row = grid.rows;
                }
                else if (computedHeadPosition.row == grid.rows + 1) {
                    computedHeadPosition.row = 0;
                }

                if (computedHeadPosition.col < 0) {
                    computedHeadPosition.col = grid.cols;
                }
                else if (computedHeadPosition.col == grid.cols + 1) {
                    computedHeadPosition.col = 0;
                }
                let lastLeftPosition = null;
                if(currentPosition.length > health)
                    lastLeftPosition = currentPosition.shift();

                events.onMove && events.onMove(currentPosition, lastLeftPosition);
                if(!events.onMove){
                    console.warn("Snake rendering is not registerd. Please use snake.Events.onMove= to set on move event")
                }
            }
        }, 1000 / snakeSpeed);
    }

    const isValidMove = (snakeHead) => {
        return !hurdles.has(`${snakeHead["row"]},${snakeHead["col"]}`);
    }

    const ChangeDirection = (direction) => {
        if (currentPosition.length == 1 || direction != Math.abs(currentDirection))
            currentDirection = direction;
    }

    const Stop = () => {
        currentState = STATES.STOPPED;
        if (interval)
            clearInterval(interval);
    }

    const PauseOrPlay = () => {
        currentState = currentState == STATES.PAUSE ? STATES.RUNNING : STATES.PAUSE;
    }

    /**
     * change speed by amount (e.g. 1 or -1), kept between minSnakeSpeed and maxSnakeSpeed
     * setInterval only reads its delay once, so a running snake gets a new interval with the new delay
     * @returns the new speed
     */
    const ChangeSpeed = (amount) => {
        snakeSpeed = Math.min(maxSnakeSpeed, Math.max(minSnakeSpeed, snakeSpeed + amount));
        if (currentState != STATES.STOPPED)
            Move(onTick);
        return snakeSpeed;
    }

    return {
        IsDead: ()=> isDead,
        Health: ()=> health,
        Speed: () => snakeSpeed,
        Position: () => currentPosition,
        IsRenderingEnabled: () =>  events.onMove != null,
        Events: {
            RegisterOnError: (callback)=> {
                events.onError = callback;
            },
            /**
             * 
             * @param {function(Array<{row: number, col: number}>, {row: number, col: number})} callback 
             */
            RegisterOnMove: (callback) => {
                events.onMove = callback
            }
        },
        Actions: {
            Start: start,
            Stop,
            ChangeDirection,
            PauseOrPlay,
            ChangeSpeed,
            IncreaseHealth: () => health++
        }
    }
})(config);