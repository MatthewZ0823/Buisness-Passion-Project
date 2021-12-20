const webcamVideoElement = document.getElementsByClassName('new_input_video')[0];
const outputCanvasElement = document.getElementsByClassName('output_canvas')[0];
const visionContainerElement = document.getElementsByClassName('vision-container')[0];
const rotateButtonElement = document.getElementById('rotate_button');

let isPortrait = false;
function handleRotateButton() {
    isPortrait = !isPortrait;

    if (isPortrait) {
        visionContainerElement.style.transform = "rotate(90deg)  translate(0px, -730px)";
    }
}
rotateButtonElement.addEventListener("click", handleRotateButton);
