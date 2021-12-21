class YogaRecognition {
    /**
     * Class to recognise yoga poses
     */
    constructor() {
        this.angles = {};
        this.comparePoseData = {
            leftShoulder: false,
            rightShoulder: false,
            leftElbow: false,
            rightElbow: false, 
            leftWaist: false,
            rightWaist: false,
            leftKnee: false,
            rightKnee: false,
        }

        this.poseLandmarks;
        this.isPoseCorrect;
        this.currYogaPoseGoal;
        this.currYogaPoseGoalName;
        this.shouldReroll = true;
    }

    /**
     * Compute the angle between the three landmarks
     * @param {Landmark} firstPoint first landmark
     * @param {Landmark} midPoint vertex point of angle
     * @param {Landmark} lastPoint final landmark
     */
    getAngle(firstPoint, midPoint, lastPoint) {    
        // Use trig to get the angle between three points, result is in radians
        let result = Math.atan2(lastPoint.y - midPoint.y, lastPoint.x - midPoint.x) - Math.atan2(firstPoint.y - midPoint.y, firstPoint.x - midPoint.x);
    
        // Convert radians to degrees
        result *= 180 / Math.PI;
    
        // Angle should never be negative
        result = Math.abs(result);
    
        // Always get the acute representation of the angle
        if (result > 180) {
            result = (360.0 - result); 
        }
    
        return result;
    }    

    /**
     * Computes all the important angles in a pose and stores them inside the angles object
     * @param {array} poseLandmarks Array of all pose landmarks given by the vision system
     */
    computeAllAngles(poseLandmarks) {
        this.poseLandmarks = poseLandmarks;

        this.angles.leftShoulder = this.getAngle(poseLandmarks[23], poseLandmarks[11], poseLandmarks[13]);
        this.angles.rightShoulder = this.getAngle(poseLandmarks[24], poseLandmarks[12], poseLandmarks[14]);
        this.angles.leftElbow = this.getAngle(poseLandmarks[11], poseLandmarks[13], poseLandmarks[15]);
        this.angles.rightElbow = this.getAngle(poseLandmarks[12], poseLandmarks[14], poseLandmarks[16]);
        this.angles.leftWaist = this.getAngle(poseLandmarks[11], poseLandmarks[23], poseLandmarks[25]);
        this.angles.rightWaist = this.getAngle(poseLandmarks[12], poseLandmarks[24], poseLandmarks[26]);
        this.angles.leftKnee = this.getAngle(poseLandmarks[23], poseLandmarks[25], poseLandmarks[27]);
        this.angles.rightKnee = this.getAngle(poseLandmarks[24], poseLandmarks[26], poseLandmarks[28]);
    }

    /**
     * Compares the last computed pose to a yoga pose
     * @param targetPose The pose to compare current pose to
     * @param tolerance How close an angle can be in degrees, such that the pose still gets recognised
     */
    comparePose(targetPose, tolerance) {
        let isPoseCorrect = true;

        for(const jointName in targetPose) {
            if ((targetPose[jointName] - tolerance < this.angles[jointName]) && (targetPose[jointName] + tolerance > this.angles[jointName])) {
                // Angle is in bounds of tolerance
                this.comparePoseData[jointName] = true;
            } else {
                // Angle is out of bounds of tolerance
                this.comparePoseData[jointName] = false;
                isPoseCorrect = false;
            }
        }
        
        return isPoseCorrect;
    }

    printIncorrectAngles() {
        for (const jointName in this.comparePoseData) {
            if (!this.comparePoseData[jointName]) {
                console.log(jointName);
            }
        }
    }

    drawIncorrectJoint(canvasCtx, jointName) {
        canvasCtx.fillStyle = 'red';
        canvasCtx.fillRect(this.poseLandmarks[jointLandmarkNumbers[jointName]].x * 640 - 10, this.poseLandmarks[jointLandmarkNumbers[jointName]].y * 480 - 10, 20, 20);
    }

    drawIncorrectJoints(canvasCtx) {
        for (const angleName in this.comparePoseData) {
            if (!this.comparePoseData[angleName]) {
                this.drawIncorrectJoint(canvasCtx, angleName);
            }
        }
    }

    rerollRandomYogaPose() {
        const keys = Object.keys(yogaPoseAngles);
        const randomKey = keys[ keys.length * Math.random() << 0]

        this.currYogaPoseGoal = yogaPoseAngles[randomKey];
        this.currYogaPoseGoalName = randomKey;
    };

    runYogaGame(landmarks, canvas) {
        if (this.shouldReroll) {
            this.rerollRandomYogaPose();
            this.shouldReroll = false;
        }

        yogaRecognisor.computeAllAngles(landmarks);
        yogaRecognisor.comparePose(this.currYogaPoseGoal, 30);
        yogaRecognisor.drawIncorrectJoints(canvas);

        console.log(this.currYogaPoseGoalName);
    }
}
