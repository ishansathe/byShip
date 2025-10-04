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

    if(y1 == y2) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }

    if (y1 != y2) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y2);
    }

    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();
}

let x1 = 100;
let y1 = 100;
let x2 = 300;
let y2 = 100;

drawLine(x1, y1, x2, y2);

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setColor();



    // Setting a sample for conversion of horizontal line to vertical line.
    if(x2 > canvas.width/2){
        if(y2-y1 < 200) {
            // Gradual increase of y2 to make the line vertical.
            y2 += 1;

            x1 += 1;
            // Only increasing x1 such that x1 and x2 become same.
        }
        else {
            moveDown();
        }
    } 
    else {
        moveAhead();
    }

    switch (move) {

    }

    drawLine(x1, y1, x2, y2);
}, 5);

function moveAhead() {
    x1 += 1;
    x2 += 1;
}

function moveDown() {
    y1 += 1;
    y2 += 1;
}

function moveUp() {
    y1 -= 1;
    y2 -= 1;
}

function moveBack() {
    x1 -= 1;
    x2 -= 1;
}