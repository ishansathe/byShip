const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'lightblue';

ctx.fillRect(0, 0, canvas.width, canvas.height);

// ctx.beginPath();
// ctx.moveTo(100, 100);
// ctx.lineTo(300, 100);
// ctx.stroke();

// ctx.clearRect(0, 0, canvas.width, canvas.height);

// function drawLine(x1, y1, x2, y2) {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.fillStyle = 'lightblue';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     ctx.beginPath();
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.stroke();
//     ctx.closePath();
    
//     setInterval(
//         drawLine (
//             x1+10,
//             y1, 
//             x2+10, 
//             y2
//         ), 1000);
// }

// drawLine(100, 100, 300, 100);


// Initial line position
let x1 = 100;
let y1 = 100;
let x2 = 300;
let y2 = 100;

function drawLine() {
    // Clear canvas
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    
    // Update positions for next frame
    x1 += 10;
    x2 += 10;
}

// Draw initial line
drawLine();

// Move the line every 1 second
setInterval(drawLine, 1000);