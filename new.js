const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function setColor(){
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    if(y1 == y2) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    else {
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
    
    x1 += 1;
    x2 += 1;
    if(x2 > canvas.width){
        x1 = 0;
        x2 = 200;
    }

    if(x2 > canvas.width/2){

        // Transfer of line length from horizontal to vertical.
        if(x1 <= x2 ) {
            x1 += 1; 
        }
        
        // Initially y2-y1 is 0 because both are 100
        if (y2-y1 < 200) {
            // Increase y2 until the difference between y2 and y1 is 200 (length of line)
            y2 += 1;

            x1 -= 1;
            x2 -= 1;
            // Pause the increment of x1 and x2 till line is vertical
        }
            // Line drawing is handled by the drawLine function

        

        // x1 -= 1;
        // x2 -= 1;
        // y1 += 1;
        // y2 += 1;
    }
    drawLine(x1, y1, x2, y2);
}, 2);


