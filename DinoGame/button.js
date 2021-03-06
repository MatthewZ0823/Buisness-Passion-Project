const calibrateButtonElement = document.getElementById("calibrate-button");
const calibrationTimerElement = document.getElementById("calibration-timer");
const heightInputElement = document.getElementById("height-input");
const startGameButtonElement = document.getElementById("start-game-button");

const cameraSFX = new Audio('SoundEffects/CameraSFX.mp3')

let clickStartTime = null;
function handleCalibrateButton() {
    clickStartTime = Date.now();
}
calibrateButtonElement.addEventListener("click", handleCalibrateButton);

function updateCalibration() {
    if ((clickStartTime + 5000) <= Date.now() && clickStartTime != null) {
        clickStartTime = null;
        cameraSFX.play();
        dinoGame.calibratePlayerHeight(heightInputElement.value);
    }

    if (clickStartTime != null) {
        calibrationTimerElement.innerHTML = Date.now() - clickStartTime;
    } 
}

function handleStartGameButton() {
    dinoGame.isAlive = true;
    dinoGame.startTime = Date.now();
}
startGameButtonElement.addEventListener("click", handleStartGameButton);