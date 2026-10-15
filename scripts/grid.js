const gridHelper = (rows, cols) => ((rows, cols) => {

    const hurdles = new Set();

    // const eightAround = [
    //     { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    //     { row: 0, col: -1 },                       { row: 0, col: 1 },
    //     { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
    // ];

    // /**
    //  * hurdle tiles touching a coordinates 
    //  * @returns {{row: number, col: number}[]}
    //  */
    // const touchingHurdles = (board, row, col) => {
    //     let touching = [];
    //     for (const offset of around) {
    //         const neighbour = { row: row + offset.row, col: col + offset.col };
    //         if (board.GetCell(neighbour.row, neighbour.col) == CELLS.WALL)
    //             touching.push(neighbour);
    //     }
    //     return touching;
    // }

    const getRndInteger = (min, max)=> {
        return Math.floor(Math.random() * (max - min)) + min;
    }        

    /**
     * 
     * @param {{row: number, col: number}} obj 
     * @returns {string}
     */
    const CoordinatesToKey = (obj) => {
        if (obj && "row" in obj && "col" in obj)
            return `${obj["row"]},${obj["col"]}`;
        
        throw new Error("Keys 'rows' and 'cols' dont exists in object.");
    }

    /**
     * 
     * @param {String} key 
     * @returns {{row: number, col: number}}
     */
    const CoordinatesFromKey = (key) => {
        if(/[\d]+,[\d]+/.test(key) === false) {
            throw new Error("Invalid key "+ key);
        }
        let arr = key.split(",");
        return {
            row: arr[0],
            col: arr[1]
        }
    }

    const getRandomPosition = (r, c) => {
        return {
            row: getRndInteger(0, r),
            col: getRndInteger(0, c),
        }
    }

    /**
     * @param {{rows: number, cols: number}} gridDimensions
     * @param {Set<String>} excludedList 
     * @param {number} count
     * @returns {Set<String>}
     */
    const getExcludedCoordinated = (gridDimensions, excludedList, count) => {
        let generatedPositions = new Set();
        while (generatedPositions.length < count) {
            let randomPositioKey = CoordinatesToKey(getRandomPosition(gridDimensions.rows, gridDimensions.cols));
            if (excludedList.has(randomPositioKey)) {
                continue;
            }
            generatedPositions.add(randomPositioKey);
        }
        return generatedPositions;
    }

    /**
     * 
     * @param {Set<String>} excludedCoordinatesList 
     * @returns 
     */
    const GenerateFood = (excludedCoordinatesList) => {
        excludedCoordinatesList = excludedCoordinatesList.union(hurdles);
        let generatedPosition = getRandomPosition(rows, cols);

        while (excludedCoordinatesList.has(CoordinatesToKey(generatedPosition))) {
            generatedPosition = getRandomPosition(rows, cols);
        }

        return generatedPosition;
    }

    const isNearCorners = (coordinates) => {
        // const gap = {row: 3, col: 5}
        return coordinates.row <= 3 && coordinates.col <= 5;
    }

    /**
     * 
     * @param {Set<String>} excludedCoordinatesList 
     * @returns 
     */
    const GenerateHurdles = (excludedCoordinatesList) => {
        const totalPositions = (rows * cols) - excludedCoordinatesList.size;

        const hurdlesCount = Math.ceil(totalPositions * (0.03));// only 30percent of the grids can be hurdles;
        for (let index = 0; index < hurdlesCount; index++) {
            const coordinate = getRandomPosition(rows, cols);
            if (isNearCorners(coordinate))
                continue;

            hurdles.add(CoordinatesToKey(coordinate));
        }
        return hurdles;
    }

    return {
        GenerateFood,
        GenerateHurdles,
        Encoder: {
            CoordinatesFromKey,
            CoordinatesToKey
        }
    }
})(rows, cols);