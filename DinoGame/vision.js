const webcamEl = document.getElementById('webcam');
const getPosesButtonEl = document.getElementById('get-poses');
const poseRendererEl = document.getElementById('pose-renderer');
const ctx = poseRendererEl.getContext('2d');
const bgCanvasEl = document.getElementsByClassName('bg')[0];
const bgCanvasCtx = bgCanvasEl.getContext('2d');

const videoCopy = document.getElementById('video-copy');
const videoCopyCtx = videoCopy.getContext('2d');

const dinoGame = new DinoGame();

// Gets the webcam footage and streams it on screen
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      webcamEl.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
      console.log(err0r);
    });
}

let detector;
let poses;

function computeFrame() {
  videoCopyCtx.drawImage(webcamEl, 0, 0);
  requestAnimationFrame(computeFrame);
};

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    minPoseScore: 0.30,
    enableTracking: false,
    multiPoseMaxDimension: 128,
  };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  getPoses();

  videoCopyCtx.rotate(90 * Math.PI / 180);
  videoCopyCtx.translate(0, videoCopy.width * -1);
  computeFrame();
}

async function getPoses() {
  poses = await detector.estimatePoses(videoCopy);
  ctx.clearRect(0, 0, poseRendererEl.offsetWidth, poseRendererEl.offsetHeight);
  renderAllKeypoints(ctx, poses);
  renderAllConnections(ctx, poses);

  // Code to run dinogame
  bgCanvasCtx.clearRect(0, 0, bgCanvasEl.width, bgCanvasEl.height);
  updateCalibration();
  dinoGame.getLandmarks(poses.length != 0 ? poses[0].keypoints : null);
  dinoGame.drawFloor(bgCanvasCtx);

  dinoGame.updateObstacleGenerator();
  dinoGame.drawAllScaledObstacles(bgCanvasCtx);
  console.log(dinoGame.isPlayerTouchingObstacle() || dinoGame.isLineTouchingObstacles());

  // Queue up getPoses again
  requestAnimationFrame(await getPoses);
}

function renderAllKeypoints(ctx, poses) {
  if (poses.length == 0) {
    return;
  }

  for (let i = 0; i < poses[0].keypoints.length; i++) {
    if (poses[0].keypoints[i].score >= 0.2) {
      ctx.fillStyle = "red";
      ctx.fillRect(poses[0].keypoints[i].x - 5, poses[0].keypoints[i].y - 5, 10, 10);
    } 
  }
}

function renderAllConnections(ctx, poses) {
  if (poses.length == 0) {
    return;
  }
  
  for (let i = 0; i < keypointNeighbors.length; i++) {
    const nodes = keypointNeighbors[i];

    if (poses[0].keypoints[nodes[0]].score < 0.2 || poses[0].keypoints[nodes[1]].score < 0.2) {
      continue;
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(poses[0].keypoints[nodes[0]].x, poses[0].keypoints[nodes[0]].y);
    ctx.lineTo(poses[0].keypoints[nodes[1]].x, poses[0].keypoints[nodes[1]].y);
    ctx.stroke();
  }
}

webcamEl.addEventListener('loadeddata', () => {
  init();
});
