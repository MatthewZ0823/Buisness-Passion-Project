class DinoGame {
    constructor() {
        this.landmarks;
        // Height of player in pixels
        this.photoHeight;
        // IRL height of player in cm
        this.realHeight;
        // Scale in px/cm
        this.scale;
        // Where the floor is at in terms of pixels below the cieling
        this.floorYLevel;

        this.obstacles = [];
    }

    getLandmarks(landmarks) {
        this.landmarks = landmarks;
    }

    calibratePlayerHeight(realHeight) {
        this.realHeight = realHeight;
        this.photoHeight = Math.abs((this.landmarks[0].x - this.landmarks[30].x) * 640);
        this.scale = this.photoHeight / this.realHeight;
        this.floorYLevel = this.landmarks[30].x * 640;
    }

    /**
     * Create a new obstacle to be rendered and collidered
     * @param {int} x x position of obstacle, in cm
     * @param {int} y y position of obstacle, in cm
     * @param {int} width width of obstacle, in cm
     * @param {int} height height of obstacle, in cm
     * @param {int} speed speed of obstacle, in cm/frame
     */
    createNewObstacle(x, y, width, height, speed) {
        this.obstacles.push({
            x: x,
            y: y,
            width: width,
            height: height,
            speed: speed
        });
    }

    drawObstacle(canvasCtx, x, y, width, height) {
        canvasCtx.fillStyle = 'red';
        canvasCtx.fillRect(x, y, width, height);
    }

    /**
     * Uses scale to make an obstacle of accurate size
     * @param {canvasCtx} canvasCtx Canvas to draw on
     * @param {int} x x position of obstacle, in cm
     * @param {int} y y position of obstacle, in cm
     * @param {int} width width of obstacle, in cm
     * @param {int} height height of obstacle, in cm
     */
    drawScaledObstacle(canvasCtx, x, y, width, height) {
        this.drawObstacle(canvasCtx, x * this.scale, y * this.scale, width * this.scale, height * this.scale);
    }

    drawAllScaledObstacles(canvasCtx) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const currObstacle = this.obstacles[i];

            this.drawScaledObstacle(canvasCtx, currObstacle.x, currObstacle.y, currObstacle.width, currObstacle.height);
            currObstacle.x += currObstacle.speed;

            // Deletes Obstacles if they fly too far off screen
            if (currObstacle.x >= 1000) {
                this.obstacles.splice(i ,1);   
            }    
        }
    }

    createDefaultBox() {
        const defaultBoxCopy = Object.assign({}, defaultBox);
        this.obstacles.push(defaultBoxCopy); 
    }

    isPlayerTouchingObstacle() {
        for (let i = 0; i < this.landmarks.length; i++) {
            const xPos = (1000 - (this.landmarks[i].y * 480 + 260)) * (1/this.scale);
            const yPos = (this.landmarks[i].x * 640) * (1/this.scale);

            for (let j = 0; j < this.obstacles.length; j++) {
                if ((this.obstacles[j].x + this.obstacles[j].width) >= xPos && this.obstacles[j].x <= xPos) {
                    if ((this.obstacles[j].y + this.obstacles[j].height) >= yPos && this.obstacles[j].y <= yPos) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    drawFloor(canvasCtx) {
        this.drawObstacle(canvasCtx, 0, dinoGame.floorYLevel + 10, 1000, 100)
    }
}