
/*
******************************************************************************************

Note to self.
    The 'obstacles' constant is necessary for the code to work.
    Claude created this in it's version 28 or something.
    I edited the number of lines and now it's more like the way I wanted it to work.
    Claude v29 was incorrect and v30 onwards it started getting stuck and would not load the GUI
    It became inconvenient so I took things in my own hand.

******************************************************************************************
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Simple gradient background
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#4a9eff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

drawBackground();

// Define 2 obstacles (like buildings)
const obstacles = [
    { x: 400, y: 200, size: 120 },
    { x: 650, y: 380, size: 100 }
];

// Line with bends
class Line {
    constructor() {
        // Random start and end points with minimum distance requirement
        const margin = 100;
        const minDistance = 400; // Minimum distance between start and end
        
        let startX, startY, endX, endY, distance;
        
        // Keep generating random points until we get a pair with sufficient distance
        do {
            startX = margin + Math.random() * (canvas.width - margin * 2);
            startY = margin + Math.random() * (canvas.height - margin * 2);
            endX = margin + Math.random() * (canvas.width - margin * 2);
            endY = margin + Math.random() * (canvas.height - margin * 2);
            
            // Calculate Manhattan distance (since we move in rectangular paths)
            distance = Math.abs(endX - startX) + Math.abs(endY - startY);
        } while (distance < minDistance);
        
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        
        // Calculate path that bends AT obstacles
        this.path = this.calculatePathAlongObstacles(this.startX, this.startY, this.endX, this.endY);
        
        this.totalPathLength = 0;
        this.segmentLengths = [];
        
        // Calculate segment lengths
        for (let i = 0; i < this.path.length - 1; i++) {
            const dx = this.path[i + 1].x - this.path[i].x;
            const dy = this.path[i + 1].y - this.path[i].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            this.segmentLengths.push(len);
            this.totalPathLength += len;
        }
        
        this.maxLineLength = 200;
        this.currentDistanceAlongPath = 0;
        this.speed = 2;
        
        this.phase = 'growing';
        
        // Start circle
        this.startCircleAlpha = 0;
        this.startCirclePhase = 'fadein';
        
        // End circle
        this.endCircleAlpha = 0;
        this.endCirclePhase = 'hidden';
        
        this.circleFadeSpeed = 0.03;
    }

    calculatePathAlongObstacles(startX, startY, endX, endY) {
        const path = [{x: startX, y: startY}];
        let currentX = startX;
        let currentY = startY;
        
        let iterations = 0;
        const maxIterations = 100;
        const buffer = 5;
        
        while (iterations < maxIterations) {
            iterations++;
            
            const dx = endX - currentX;
            const dy = endY - currentY;
            
            // If very close to destination, add final point and stop
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                if (currentX !== endX || currentY !== endY) {
                    path.push({x: endX, y: endY});
                }
                break;
            }
            
            // Try directions in order of priority
            let directions = [];
            
            // Prioritize the direction that reduces distance most
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal is more important
                if (dx > 0) directions.push('right');
                else if (dx < 0) directions.push('left');
                
                if (dy > 0) directions.push('down');
                else if (dy < 0) directions.push('up');
            } else {
                // Vertical is more important
                if (dy > 0) directions.push('down');
                else if (dy < 0) directions.push('up');
                
                if (dx > 0) directions.push('right');
                else if (dx < 0) directions.push('left');
            }
            
            // Add remaining directions as backup
            const allDirs = ['right', 'left', 'down', 'up'];
            for (let dir of allDirs) {
                if (!directions.includes(dir)) {
                    directions.push(dir);
                }
            }
            
            // Try each direction
            let moved = false;
            const stepSize = 50;
            
            for (let dir of directions) {
                let nextX = currentX;
                let nextY = currentY;
                
                // Calculate next position based on direction
                switch(dir) {
                    case 'right':
                        nextX = currentX + Math.min(stepSize, Math.max(0, dx));
                        break;
                    case 'left':
                        nextX = currentX - Math.min(stepSize, Math.max(0, -dx));
                        break;
                    case 'down':
                        nextY = currentY + Math.min(stepSize, Math.max(0, dy));
                        break;
                    case 'up':
                        nextY = currentY - Math.min(stepSize, Math.max(0, -dy));
                        break;
                }
                
                // Make sure we actually moved
                if (nextX === currentX && nextY === currentY) {
                    continue;
                }
                
                // Check if this move would hit ANY obstacle
                const hitObstacle = this.findObstacleInPath(currentX, currentY, nextX, nextY);
                
                if (!hitObstacle) {
                    // Clear path - move in this direction
                    path.push({x: nextX, y: nextY});
                    currentX = nextX;
                    currentY = nextY;
                    moved = true;
                    break;
                }
            }
            
            if (!moved) {
                // All directions blocked - try to navigate around closest obstacle
                // Find the obstacle blocking us
                let closestObstacle = null;
                let minObsDist = Infinity;
                
                for (let obs of obstacles) {
                    const obsDistX = Math.max(obs.x - currentX, 0, currentX - (obs.x + obs.size));
                    const obsDistY = Math.max(obs.y - currentY, 0, currentY - (obs.y + obs.size));
                    const obsDist = obsDistX + obsDistY;
                    
                    if (obsDist < minObsDist) {
                        minObsDist = obsDist;
                        closestObstacle = obs;
                    }
                }
                
                if (closestObstacle) {
                    // Find best corner of this obstacle
                    const corners = [
                        {x: closestObstacle.x - buffer, y: closestObstacle.y - buffer},
                        {x: closestObstacle.x + closestObstacle.size + buffer, y: closestObstacle.y - buffer},
                        {x: closestObstacle.x - buffer, y: closestObstacle.y + closestObstacle.size + buffer},
                        {x: closestObstacle.x + closestObstacle.size + buffer, y: closestObstacle.y + closestObstacle.size + buffer}
                    ];
                    
                    let bestCorner = null;
                    let minDist = Infinity;
                    
                    for (let corner of corners) {
                        const distToCorner = Math.abs(corner.x - currentX) + Math.abs(corner.y - currentY);
                        const distCornerToEnd = Math.abs(endX - corner.x) + Math.abs(endY - corner.y);
                        const totalDist = distToCorner + distCornerToEnd;
                        
                        if (totalDist < minDist) {
                            minDist = totalDist;
                            bestCorner = corner;
                        }
                    }
                    
                    if (bestCorner) {
                        // Move toward corner using only horizontal/vertical moves
                        if (Math.abs(bestCorner.x - currentX) > 1) {
                            path.push({x: bestCorner.x, y: currentY});
                            currentX = bestCorner.x;
                        }
                        
                        if (Math.abs(bestCorner.y - currentY) > 1) {
                            path.push({x: currentX, y: bestCorner.y});
                            currentY = bestCorner.y;
                        }
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        
        // Ensure we reach destination with only horizontal/vertical moves
        const lastPoint = path[path.length - 1];
        
        // If we're not at the destination yet, add final moves
        if (lastPoint.x !== endX || lastPoint.y !== endY) {
            // Add horizontal move if needed
            if (lastPoint.x !== endX) {
                path.push({x: endX, y: lastPoint.y});
            }
            // Add vertical move if needed
            if (lastPoint.y !== endY) {
                path.push({x: endX, y: endY});
            }
        }
        
        return path;
    }

    findObstacleInPath(x1, y1, x2, y2) {
        for (let obs of obstacles) {
            if (this.lineIntersectsRect(x1, y1, x2, y2, obs.x, obs.y, obs.size, obs.size)) {
                return obs;
            }
        }
        return null;
    }

    lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        const buffer = 5;
        
        const left = rx - buffer;
        const right = rx + rw + buffer;
        const top = ry - buffer;
        const bottom = ry + rh + buffer;
        
        // Check if either endpoint is inside rectangle
        if ((x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) ||
            (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom)) {
            return true;
        }
        
        // Check if line intersects any edges
        return this.lineSegmentsIntersect(x1, y1, x2, y2, left, top, right, top) ||
                this.lineSegmentsIntersect(x1, y1, x2, y2, right, top, right, bottom) ||
                this.lineSegmentsIntersect(x1, y1, x2, y2, right, bottom, left, bottom) ||
                this.lineSegmentsIntersect(x1, y1, x2, y2, left, bottom, left, top);
    }

    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) return false;
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }

    // Get position along path given distance from start
    getPositionAtDistance(distance) {
        let remainingDist = distance;
        
        for (let i = 0; i < this.segmentLengths.length; i++) {
            if (remainingDist <= this.segmentLengths[i]) {
                // Position is in this segment
                const t = remainingDist / this.segmentLengths[i];
                const p1 = this.path[i];
                const p2 = this.path[i + 1];
                
                return {
                    x: p1.x + (p2.x - p1.x) * t,
                    y: p1.y + (p2.y - p1.y) * t
                };
            }
            remainingDist -= this.segmentLengths[i];
        }
        
        // If we've gone past the end, return end point
        return {x: this.endX, y: this.endY};
    }

    update() {
        // === START CIRCLE ===
        if (this.startCirclePhase === 'fadein') {
            this.startCircleAlpha += this.circleFadeSpeed;
            if (this.startCircleAlpha >= 1) {
                this.startCircleAlpha = 1;
                this.startCirclePhase = 'visible';
            }
        }
        
        if (this.startCirclePhase === 'fadeout') {
            this.startCircleAlpha -= this.circleFadeSpeed;
            if (this.startCircleAlpha <= 0) {
                this.startCircleAlpha = 0;
                this.startCirclePhase = 'done';
            }
        }
        
        // === PHASES ===
        
        // PHASE 1: Growing (0 to 200px)
        if (this.phase === 'growing') {
            this.currentDistanceAlongPath += this.speed;
            
            if (this.currentDistanceAlongPath >= this.maxLineLength) {
                this.currentDistanceAlongPath = this.maxLineLength;
                this.phase = 'moving';
                this.startCirclePhase = 'fadeout';
            }
        }
        
        // PHASE 2: Moving (maintaining 200px length)
        else if (this.phase === 'moving') {
            this.currentDistanceAlongPath += this.speed;
            
            // Check if head reached end
            if (this.currentDistanceAlongPath >= this.totalPathLength) {
                this.currentDistanceAlongPath = this.totalPathLength;
                this.phase = 'shrinking';
            }
            
            // Fade in end circle when close
            const distToEnd = this.totalPathLength - this.currentDistanceAlongPath;
            if (distToEnd < 80 && this.endCirclePhase === 'hidden') {
                this.endCirclePhase = 'fadein';
            }
        }
        
        // PHASE 3: Shrinking
        else if (this.phase === 'shrinking') {
            this.currentDistanceAlongPath += this.speed;
            
            // When tail reaches end
            if (this.currentDistanceAlongPath >= this.totalPathLength + this.maxLineLength) {
                this.phase = 'done';
                this.endCirclePhase = 'fadeout';
            }
        }
        
        // === END CIRCLE ===
        if (this.endCirclePhase === 'fadein') {
            this.endCircleAlpha += this.circleFadeSpeed;
            if (this.endCircleAlpha >= 1) {
                this.endCircleAlpha = 1;
                this.endCirclePhase = 'visible';
            }
        }
        
        if (this.endCirclePhase === 'fadeout') {
            this.endCircleAlpha -= this.circleFadeSpeed;
            if (this.endCircleAlpha <= 0) {
                this.endCircleAlpha = 0;
                this.endCirclePhase = 'done';
            }
        }
    }

    draw() {
        // Draw start circle
        if (this.startCircleAlpha > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.startX, this.startY, 30, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.startCircleAlpha * 0.3})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.startX, this.startY, 25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.startCircleAlpha * 0.6})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.startX, this.startY, 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.startCircleAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // Draw end circle
        if (this.endCircleAlpha > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.endX, this.endY, 30, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.endCircleAlpha * 0.3})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.endX, this.endY, 25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.endCircleAlpha * 0.6})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.endX, this.endY, 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.endCircleAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // Draw the line segments
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 13;
        
        // Calculate head and tail positions
        const headDist = Math.min(this.currentDistanceAlongPath, this.totalPathLength);
        const tailDist = Math.max(0, this.currentDistanceAlongPath - this.maxLineLength);
        
        const headPos = this.getPositionAtDistance(headDist);
        const tailPos = this.getPositionAtDistance(tailDist);
        
        // Draw line by tracing the path from tail to head
        ctx.beginPath();
        
        let currentDist = tailDist;
        let started = false;
        
        // Find which segment tail is in and start from there
        let accumulatedDist = 0;
        for (let i = 0; i < this.segmentLengths.length; i++) {
            const segmentStart = accumulatedDist;
            const segmentEnd = accumulatedDist + this.segmentLengths[i];
            
            // If this segment is relevant to our line
            if (segmentEnd >= tailDist && segmentStart <= headDist) {
                const p1 = this.path[i];
                const p2 = this.path[i + 1];
                
                // Determine start point of this segment for drawing
                let drawStart;
                if (segmentStart < tailDist) {
                    drawStart = tailPos;
                } else {
                    drawStart = p1;
                }
                
                // Determine end point of this segment for drawing
                let drawEnd;
                if (segmentEnd > headDist) {
                    drawEnd = headPos;
                } else {
                    drawEnd = p2;
                }
                
                if (!started) {
                    ctx.moveTo(drawStart.x, drawStart.y);
                    started = true;
                }
                
                ctx.lineTo(drawEnd.x, drawEnd.y);
                
                if (segmentEnd > headDist) break;
            }
            
            accumulatedDist += this.segmentLengths[i];
        }
        
        ctx.stroke();
        ctx.restore();
    }
}

// Create multiple lines with random start/end points
const lines = [];
const numLines = 5;

for (let i = 0; i < numLines; i++) {
    // Stagger the start times
    setTimeout(() => {
        lines.push(new Line());
        lines.push(new Line());
        lines.push(new Line());
    }, i * 3000); // 3 seconds delay between each line
}

function animate() {
    drawBackground();
    
    // Update and draw all lines
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        line.update();
        line.draw();
        
        // Remove completed lines and create new ones
        if (line.phase === 'done' && line.endCirclePhase === 'done') {
            lines.splice(i, 1);
            lines.push(new Line()); // Add a new line to replace it
        }
    }
    
    requestAnimationFrame(animate);
}

animate();