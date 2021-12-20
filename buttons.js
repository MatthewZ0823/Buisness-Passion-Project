const elementsToRotate = document.getElementsByClassName("element-to-rotate");
const rotationWrapperElements = document.getElementsByClassName("rotation-wrapper");
const rotateButtonElement = document.getElementById('rotate_button');

let isPortrait = false;
function handleRotateButton() {
    console.log("clicked button!");

    for (let i = 0; i < elementsToRotate.length; i++) {
        const currElementToRotate = elementsToRotate[i];
        const currRotationWrapperElement = rotationWrapperElements[i];
    
        const currElementWidth = currElementToRotate.offsetWidth;
        const currElementHeight = currElementToRotate.offsetHeight;
    
        if (isPortrait) {
          currRotationWrapperElement.style.width = `${currElementWidth}px`;
          currRotationWrapperElement.style.height = `${currElementHeight}px`;
          currElementToRotate.classList.remove("rotate-me");
        } else{
          currRotationWrapperElement.style.width = `${currElementHeight}px`;
          currRotationWrapperElement.style.height = `${currElementWidth}px`;      
          currElementToRotate.classList.add("rotate-me");
        }
    
        console.log(`Box Offset Width: ${currElementToRotate.offsetWidth}`);
        console.log(`Box Offset Height: ${currElementToRotate.offsetHeight}`);
        console.log("=================");
    }
    
    isPortrait = !isPortrait;
}

rotateButtonElement.addEventListener("click", handleRotateButton);
