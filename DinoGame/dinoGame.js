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

        this.nextObstacleSpawnTime = null;
        this.isAlive = false;
        this.startTime;
        this.timeSurvived;

        this.obstacles = [];

        this.reverbFartSFX = new Audio('SoundEffects/ReverbFartSFX.mp3');
    }

    getLandmarks(landmarks) {
        this.landmarks = landmarks;
    }

    calibratePlayerHeight(realHeight) {
        this.realHeight = realHeight;
        this.photoHeight = Math.abs(this.landmarks[0].y - this.landmarks[16].y);
        this.scale = this.photoHeight / this.realHeight;
        this.floorYLevel = this.landmarks[16].y;
    }

    /**
     * Create a new obstacle to be rendered and collidered
     * @param {int} x x position of obstacle, in cm
     * @param {int} y y position of obstacle, in cm
     * @param {int} width width of obstacle, in cm
     * @param {int} height height of obstacle, in cm
     * @param {int} speed speed of obstacle, in cm/frame
     * @param {string} color color of obstacle
     */
    createNewObstacle(x, y, width, height, speed, color) {
        this.obstacles.push({
            x: x,
            y: y,
            width: width,
            height: height,
            speed: speed,
            color: color,
        });
    }

    createTestBox() {
        const testBoxCopy = Object.assign({}, testBox);
        this.obstacles.push(testBoxCopy); 
    }

    createShortObstacle() {
        this.obstacles.push({
            x: 10,
            y: (this.floorYLevel / this.scale) - 20,
            width: 20,
            height: 20,
            speed: 10, 
            color: 'green',
        });
    }

    createTallObstacle() {
        this.obstacles.push({
            x: 10,
            y: (this.floorYLevel / this.scale) - 30,
            width: 20,
            height: 30,
            speed: 10,
            color: 'lime',
        });
    }

    createDuckObstacle() {
        this.obstacles.push({
            x: 10,
            y: 0,
            width: 30,
            height: this.floorYLevel / this.scale - this.realHeight + this.realHeight * 0.2,
            speed: 10,
            color: 'orange',
        });
    }

    drawObstacle(canvasCtx, x, y, width, height, boxColor) {
        const color = boxColor || 'black';

        canvasCtx.fillStyle = color;
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
    drawScaledObstacle(canvasCtx, x, y, width, height, color) {
        this.drawObstacle(canvasCtx, x * this.scale, y * this.scale, width * this.scale, height * this.scale, color);
    }

    drawAllScaledObstacles(canvasCtx) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const currObstacle = this.obstacles[i];

            this.drawScaledObstacle(canvasCtx, currObstacle.x, currObstacle.y, currObstacle.width, currObstacle.height, currObstacle.color);
            currObstacle.x += currObstacle.speed;

            // Deletes Obstacles if they fly too far off screen
            if (currObstacle.x >= (1000 / this.scale)) {
                this.obstacles.splice(i ,1);   
            }    
        }
    }

    // Checks if any of the landmarks of the player are in bounds of any of the obstacles
    isPlayerTouchingObstacle() {
        if (this.landmarks == null) {
            return;
        }

        if (!this.isAlive) {
            return;
        }

        for (let i = 0; i < this.landmarks.length; i++) {
            // As of this piece of code, xPos and yPos are written in terms of cm on the global scale
            const xPos = (this.landmarks[i].x + 520) * (1/this.scale);
            const yPos = (this.landmarks[i].y) * (1/this.scale);

            for (let j = 0; j < this.obstacles.length; j++) {
                if ((this.obstacles[j].x + this.obstacles[j].width) >= xPos && this.obstacles[j].x <= xPos) {
                    if ((this.obstacles[j].y + this.obstacles[j].height) >= yPos && this.obstacles[j].y <= yPos) {
                        this.reverbFartSFX.play();
                        this.onDeath();
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    intersects(a,b,c,d,p,q,r,s) {
        let det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };
    
    isLineTouchingObstacles() {
        if (this.landmarks == null) {
            return;
        }

        if (!this.isAlive) {
            return;
        }

        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            
            for (let j = 0; j < keypointNeighbors.length; j++) {
                const xPos1 = (this.landmarks[keypointNeighbors[j][0]].x + 520) * (1/this.scale);
                const yPos1 = this.landmarks[keypointNeighbors[j][0]].y * (1/this.scale);
                const xPos2 = (this.landmarks[keypointNeighbors[j][1]].x + 520) * (1/this.scale);
                const yPos2 = this.landmarks[keypointNeighbors[j][1]].y * (1/this.scale);

                // Check if intersects top line
                if(this.intersects(xPos1, yPos1, xPos2, yPos2, obstacle.x, obstacle.y, obstacle.x + obstacle.width, obstacle.y)) {
                    this.reverbFartSFX.play();
                    this.onDeath();
                    return true;
                }
                
                // Check if intersects left line
                if(this.intersects(xPos1, yPos1, xPos2, yPos2, obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height)) {
                    this.reverbFartSFX.play();
                    this.onDeath();
                    return true;
                }
                
                // Check if intersects bot line
                if(this.intersects(xPos1, yPos1, xPos2, yPos2, obstacle.x, obstacle.y + obstacle.height, obstacle.x + obstacle.width, obstacle.y + obstacle.height)) {
                    this.reverbFartSFX.play();
                    this.onDeath();
                    return true;
                }
                
                // Check if intersects right line
                if(this.intersects(xPos1, yPos1, xPos2, yPos2, obstacle.x + obstacle.width, obstacle.y, obstacle.x + obstacle.width, obstacle.y + obstacle.height)) {
                    this.reverbFartSFX.play();
                    this.onDeath();
                    return true;
                }
            }
        }
        
        return false;
    }

    drawFloor(canvasCtx) {
        this.drawObstacle(canvasCtx, 0, dinoGame.floorYLevel, 1000, 300);
    }

    updateObstacleGenerator() {
        if (!this.isAlive) {
            this.obstacles = [];
            this.nextObstacleSpawnTime = null;
            return;
        }

        if (this.nextObstacleSpawnTime === null) {
            this.nextObstacleSpawnTime = Date.now() + Math.floor(Math.random() * 2001) + 2000;
        }

        // Check if it's time to spawn an obstacle
        if (Date.now() >= this.nextObstacleSpawnTime) {
            const randNum = Math.floor(Math.random() * 10);

            if (randNum <= 5) {
                this.createShortObstacle();
            } else if (randNum <= 8) {
                this.createDuckObstacle();
            } else {
                this.createTallObstacle();
            }

            this.nextObstacleSpawnTime = null;
        }
    }

    onDeath() {
        this.timeSurvived = (Date.now() - this.startTime) / 1000;
        document.getElementById('score').innerText = `Time survived: ${this.timeSurvived} seconds`
        this.isAlive = false;
    }
}
