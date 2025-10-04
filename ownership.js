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
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.closePath();
}

function shouldBend() {
    return Math.random() < 0.5 ? true : false;
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


let x1, y1, x2, y2;


setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setColor();


    switch (Line.direction) {
        case 'right':

            // Setting values to initialize line drawing
            if(Line.begun == false) {
                x1 = Line.start.x;
                y1 = Line.start.y;
                x2 = Line.start.x + 200;
                y2 = Line.start.y;

                Line.begun = true;
                Line.threshold = Line.start.x + 500;
            }

            // Deciding whether line should bend or not
            if(x2 > Line.threshold && shouldBend() && !Line.bending) {
                if(Math.random() < 0.5) {
                    Line.bending = true;
                    Line.bendDirection = 'down';
                }
                else {
                    Line.bending = true;
                    Line.bendDirection = 'up';
                }
            }

            if(Line.bending == true && Line.bendDirection == 'down') {
                x1 += 1;
                y2 += 1;
                let op = bendLine(x1, y1, x2, y2);

                if(op == "complete") {
                    Line.bending = false;
                    Line.direction = 'down';
                }
            }

            if(Line.bending == true && Line.bendDirection == 'up') {
                x1 += 1;
                y2 -= 1;
                let op = bendLine(x1, y1, x2, y2);

                if(op == "complete") {
                    Line.bending = false;
                    Line.direction = 'up';
                }
            }

            // Line is not bending, keep drawing straight line to the right
            if (Line.bending == false) {
                drawLine(x1, y1, x2, y2);
                x1 += 1;
                x2 += 1;
            }
            break;

        case 'down':
            if (Line.bending == false) {
                drawLine(x1, y1, x2, y2);
                y1 += 1;
                y2 += 1;
            }

        case 'up':
            if (Line.bending == false){
                drawLine(x1, y1, x2, y2);
                y1 -= 1;
                y2 -= 1;
            }
        default:
            break;
    }
}, 10);