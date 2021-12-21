const videoElement = document.getElementsByClassName('input_video')[0];
const newVideoElement = document.getElementsByClassName('new_input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const targetYogaPoseImageElement = document.getElementsByClassName('target-yoga-image')[0];

const yogaRecognisor = new YogaRecognition();

let visionResults;

function onResults(results) {
  if (!results.poseLandmarks) {
    return;
  }

  visionResults = results;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#fff6d4', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#fff6d4', lineWidth: 2});
  
  canvasCtx.restore();

  // grid.updateLandmarks(results.poseWorldLandmarks);

  // The code underneath runs the yoga pose recognisor thing
  yogaRecognisor.runYogaGame(visionResults.poseLandmarks, canvasCtx, targetYogaPoseImageElement);
  // yogaRecognisor.printIncorrectAngles();
}

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

// Gets the webcam footage and streams it on screen
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      newVideoElement.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
      console.log(err0r);
    });
}

// Not completely sure what this does, but it updates the vision every frame looks like
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: newVideoElement});
  },
  width: 640,
  height: 480
});
camera.start();
