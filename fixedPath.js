

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function setColor() {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

}


let x1 = 100;
let y1 = 100;
let x2 = 300;
let y2 = 100;  

setInterval(() => {

    x1 += 1;
    x2 += 1;

    setColor();
    drawLine(x1, y1, x2, y2);   
}, 10);

const bendingPoints = [
    { x: 450, y: 50 },
]

function reachedPoint() {
    if(
        // x1 == bendingPoints[0].x ||
        x2 == bendingPoints[0].x
    ) {
        return true;
    }

    if(
        // y1 == bendingPoints[0].y ||
        y2 == bendingPoints[0].y
    ) {
        return true;
    }   
}