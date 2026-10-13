const canvasHelper = (() => {
    const canvases = {};

    const Init = (elemId, props) => {
        if (Object.keys(canvases).indexOf(elemId) > 0) {
            console.warn(`Canvas with id:${elem} already exists. Exiting`);
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

    const getComputedValue = (val) => Math.max((val * tileWidth) - tileWidth, 0);

    const renderSnake = (snakePosition, lastLeftPosition) => {
        let canvasContext = canvases[gameCanvas];
        canvasContext.beginPath();
        let startingPosition = snakePosition[0];
        canvasContext.moveTo(getComputedValue(startingPosition.col), getComputedValue(startingPosition.row));
        canvasContext.fillStyle = "green";

        for (const position of snakePosition) {
            canvasContext.fillRect(getComputedValue(position.col), getComputedValue(position.row), tileWidth, tileWidth);
        }

        if (lastLeftPosition)
            canvasContext.clearRect(getComputedValue(lastLeftPosition.col), getComputedValue(lastLeftPosition.row), tileWidth, tileWidth);

        canvasContext.stroke();
    }

    const GetGridDimensions = () => {
        let element = document.getElementById(gameCanvas);
        return {
            cols: element.width / tileWidth,
            rows: element.height / tileWidth
        };
    }

    const getToggleColor = (color) => {
        if (color == "white")
            return "green";
        else 
            return "white";
    }

    const OnError = (snakePosition, message) => {
        let ctx = canvasHelper.Init(gameCanvas);
        let canv = document.getElementById(gameCanvas);
        let blinkCount = 0;
        let isClear = true;
        let color = "green";
        const maxBlinks = 12; // Adjust this to how many times you want it to flash
        let interval = setInterval(() => {
            if (isClear) {
                ctx.fillStyle = "black";
                ctx.globalAlpha = 0.7;
                ctx.fillRect(0, 0, canv.clientWidth, canv.clientHeight);
            }
            else {
                ctx.clearRect(0, 0, canv.clientWidth, canv.clientHeight);
            }
            isClear = !isClear;
            color = getToggleColor(color);
            ctx.fillStyle = color;
            ctx.globalAlpha = 1;
            for (const position of snakePosition) {
                ctx.fillRect(getComputedValue(position.col), getComputedValue(position.row), tileWidth, tileWidth);
            }
            ctx.stroke();
            blinkCount++;
            if (blinkCount >= maxBlinks) {
                clearInterval(interval);
                alert(message);
                window.location.reload();
            }
        }, 250);
    }

    return {
        Init,
        DrawGrids: drawGrids,
        RenderSnake: renderSnake,
        GetGridDimensions,
        OnError
    }
})();