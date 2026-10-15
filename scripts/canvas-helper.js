const canvasHelper = (() => {
    const canvases = {};
    let blinkingItem = null;
    let blinkingItemInterval = null;

    const Init = (elemId, props) => {
        if (Object.keys(canvases).indexOf(elemId) > -1) {
            console.warn(`Canvas with id:${elemId} already exists. Exiting`);
            return canvases[elemId];
        }
        if (!props || Object.keys(props).length === 0) {
            props = {
                _tileWidth: tileWidth,
                _scale: scale
            }
            console.warn("No properties provided, using default values", props);
        }

        const { _tileWidth, _scale } = props;
        const canvas = document.getElementById(elemId);
        const parentElement = canvas.parentElement;
        const reducedDimensions = {
            width: parentElement.clientWidth * _scale,
            height: parentElement.clientHeight * _scale
        }
        canvas.width = Math.round(reducedDimensions.width / _tileWidth) * _tileWidth;// round to title width
        canvas.height = Math.round(reducedDimensions.height / _tileWidth) * _tileWidth; // round to title height
        canvases[elemId] = canvas.getContext("2d");
        return canvases[elemId];
    }

    const drawGrids = (tileWidth) => {
        let ctxGrid = Init(gridCanvas, { _tileWidth: tileWidth, _scale: scale });
        let element = document.getElementById(gridCanvas);
        ctxGrid.beginPath();
        for (let colLine = 0; colLine <= element.clientWidth; colLine += tileWidth) {
            ctxGrid.moveTo(colLine, 0);
            ctxGrid.lineTo(colLine, element.clientHeight);
        }

        for (let rowLine = 0; rowLine <= element.clientHeight; rowLine += tileWidth) {
            ctxGrid.moveTo(0, rowLine);
            ctxGrid.lineTo(element.clientWidth, rowLine);
        }
        ctxGrid.strokeStyle = "#ececec";
        ctxGrid.stroke();
    }

    const getComputedValue = (val) =>  val * tileWidth;

    /**
     * 
     * @param {Array<{row: number, col: number}>} itemsCoordinatesList 
     * @param {string} color
     * @param {Array<{row: number, col: number}>} cleanList
     */
    const renderObjects = (itemsCoordinatesList, color, cleanList) => {
        let canvasContext = canvases[gameCanvas];
        canvasContext.beginPath();
        let startingPosition = itemsCoordinatesList[0];
        canvasContext.moveTo(getComputedValue(startingPosition.col), getComputedValue(startingPosition.row));
        canvasContext.fillStyle = "green";

        for (const position of itemsCoordinatesList) {
            canvasContext.fillRect(getComputedValue(position.col), getComputedValue(position.row), tileWidth, tileWidth);
        }

        for (const toClearPosition of cleanList)
            canvasContext.clearRect(getComputedValue(toClearPosition.col), getComputedValue(toClearPosition.row), tileWidth, tileWidth);

        canvasContext.stroke();
    }

    const renderSnake = (snakePosition, lastLeftPosition) => {
        renderObjects(snakePosition, "green", new Array(lastLeftPosition));
    }

    /**
     * 
     * @param {Array<{row: number, col: number}>} itemsCoordinatesList 
     */
    const RenderObjects = (itemsCoordinatesList) => {
        renderObjects(itemsCoordinatesList, "black", []);
    }

    const GetGridDimensions = () => {
        let element = document.getElementById(gameCanvas);
        return {
            cols: element.width / tileWidth,
            rows: element.height / tileWidth
        };
    }

    const RenderBlinkingItem = (coordinates, mainColor) => {
        if(!(Object.keys(coordinates).includes("row") && Object.keys(coordinates).includes("col")))
            throw new Error("Invalid coordinates", coordinates);        
         
        let ctx = canvasHelper.Init(gameCanvas);
        
        if (blinkingItem) {
            if (blinkingItem.row == coordinates.row && blinkingItem.col == coordinates.col) {
                return;
            }
            else {
                ctx.clearRect(getComputedValue(blinkingItem.col), getComputedValue(blinkingItem.row), tileWidth, tileWidth);
                clearInterval(blinkingItemInterval);
            }
        }

        blinkingItem = coordinates;
        
        let canv = document.getElementById(gameCanvas);
        let blinkCount = 0;
        let isClear = true;
        const toggleList = [ `${mainColor}`, "white"];
        let color = toggleList[0];//default main color
        blinkingItemInterval = setInterval(() => {
            color = getToggleColor(color, toggleList);
            ctx.fillStyle = color;
            ctx.fillRect(getComputedValue(coordinates.col), getComputedValue(coordinates.row), tileWidth, tileWidth);
            ctx.stroke();
        }, 350);
    }

    const getToggleColor = (color, toggleList) => {
        if (color == toggleList[0])
            return toggleList[1];
        else 
            return toggleList[0];
    }

    /**
     * game over screen: dark overlay with the reason
     * click, Space or Enter restarts the game
     * @param {Array<{row: number, col: number}>} snakePosition
     * @param {string} reason why the snake died
     */
    const OnError = (snakePosition, reason) => {
        let ctx = canvases[gameCanvas];
        let canv = document.getElementById(gameCanvas);

        // the food blinks on its own interval, stop it so it does not paint over the overlay
        if (blinkingItemInterval)
            clearInterval(blinkingItemInterval);

        const centerX = canv.width / 2;
        const centerY = canv.height / 2;
        // fit narrow and wide boards alike
        const titleSize = Math.round(Math.min(canv.width / 7, canv.height / 6, 110));
        const textSize = Math.max(14, Math.round(titleSize / 3.2));

        ctx.globalAlpha = 0.78;
        ctx.fillStyle = "#101014";
        ctx.fillRect(0, 0, canv.width, canv.height);
        ctx.globalAlpha = 1;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${titleSize}px sans-serif`;
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#ff5252";
        ctx.fillText("GAME OVER", centerX, centerY - titleSize * 0.5);
        ctx.shadowBlur = 0;

        ctx.font = `${textSize}px sans-serif`;
        ctx.fillStyle = "#f5f5f5";
        ctx.fillText(reason, centerX, centerY + titleSize * 0.35);
        ctx.font = `bold ${Math.round(textSize * 0.8)}px sans-serif`;
        ctx.fillStyle = "#4CAF50";
        ctx.fillText("Click or press Space to play again", centerX, centerY + titleSize * 0.35 + textSize * 2);

        const restart = () => window.location.reload();
        canv.addEventListener("click", restart);
        document.addEventListener("keydown", (e) => {
            if (e.key == " " || e.key == "Enter") {
                e.preventDefault();
                restart();
            }
        });
    }

    return {
        Init,
        DrawGrids: drawGrids,
        RenderBlinkingItem,
        RenderSnake: renderSnake,
        RenderObjects,
        GetGridDimensions,
        OnError
    }
})();