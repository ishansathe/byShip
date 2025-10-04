const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function setColor(){
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let Line = {
    start: {x: 100, y: 100},
    end: {x: 900, y: 500},
    direction: 'right',
    begun: false,
    threshold: null,
    bending: false,
    bendDirection: null,
    bendCounter: 0
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();
}

function bendLine(x1, y1, x2, y2) {
    ctx.beginPath();

    // Bending
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y2); 

    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    if (x2 == x1) {
        return "complete";
    }
    else {
        return "incomplete";
    }
}

function bendWhere() {
    
    if(Line.start.x < Line.end.x && Line.start.y < Line.end.y) {
        return Math.random() < 0.5 ? 'right' : 'down';
    }

    if(Line.start.x < Line.end.x && Line.start.y > Line.end.y) {
        return Math.random() < 0.5 ? 'right' : 'up';
    }

    if(Line.start.x > Line.end.x && Line.start.y > Line.end.y) {
        return Math.random() < 0.5 ? 'left' : 'up';
    }

    if(Line.start.x > Line.end.x && Line.start.y < Line.end.y) {
        return Math.random() < 0.5 ? 'left' : 'down';
    }
    
}

let x1, x2, y1, y2;

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setColor();

    switch (Line.direction) {
        case 'right':
            if (Line.begun == false) {
                Line.begun = true;
                x1 = Line.start.x;
                y1 = Line.start.y;
                x2 = x1 + 200;
                y2 = y1;
                drawLine(x1, y1, x2, y2);
            }

            let direction = bendWhere();
            if(direction != Line.direction) {
                Line.bending = true;
                Line.bendDirection = direction;
            }

            if(line.bending == true) {

                if( Line.bendDirection == 'down') {
                    y2 += 1;
                    x1 += 1;

                    let op = bendLine(x1, y1, x2, y2);
                    if(op == "complete") {
                        Line.bending = false;
                        Line.direction = Line.bendDirection;
                        Line.bendDirection = null;
                    }
                }

                if( Line.bendDirection == 'up') {
                    y2 -= 1;
                    x1 += 1;
                    
                    let op = bendLine(x1, y1, x2, y2);
                    if(op == "complete") {
                        Line.bending = false;
                        Line.direction = Line.bendDirection;
                        Line.bendDirection = null;
                    }
                }
                
            }

            if(Line.bending == false) {
                x1 += 1;
                x2 += 1;
                drawLine(x1, y1, x2, y2);
            }
            break;
        
        case 'down':
            if(Line.bending == false) {
                y1 += 1;
                y2 += 1;
                drawLine(x1, y1, x2, y2);
            }
            break;

        case 'up':
            if(Line.bending == false) {
                y2 -= 1;
                y1 -= 1;
                drawLine(x1, y1, x2, y2);
            }
            break;
        
        case 'left':
            if(Line.bending == false) {
                x2 -= 1;
                x1 -= 1;
                drawLine(x1, y1, x2, y2);
            }
            break;
        default:
            break;
    }
}, 10);