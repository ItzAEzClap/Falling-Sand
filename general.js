class Player {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
        this.vel = 5
    }

    move() {
        if (keys_pressed["a"]) {
            this.x -= this.vel
        }
        if (keys_pressed["d"]) {
            this.x += this.vel
        }
        if (keys_pressed["w"]) {
            this.y -= this.vel
        }
        if (keys_pressed["s"]) {
            this.y += this.vel
        }
    }
}

function fixCanvas() {
    if (window.innerWidth * STANDARDY > window.innerHeight * STANDARDX) {
        renderCanvas.width = window.innerHeight * STANDARDX / STANDARDY;
        renderCanvas.height = window.innerHeight;
        scale = renderCanvas.width / canvas.width;
    } else {
        renderCanvas.width = window.innerWidth;
        renderCanvas.height = window.innerWidth * STANDARDY / STANDARDX;
        scale = renderCanvas.height / canvas.height;
    }
}

function randomFloatFromRange(min, max) {
    return min + Math.random() * (max - min)
}

CanvasRenderingContext2D.prototype.drawText = function (text, x, y, fontSize, align, color, shadow) {
    this.font = fontSize + "px verdanai";
    this.fillStyle = "gray";
    this.shadowBlur = (shadow?.blur == undefined ? 0 : shadow?.blur);
    this.shadowColor = (shadow?.color == undefined ? "white" : shadow?.color);
    this.textAlign = (align != undefined) ? align : "left";
    this.fillText(text, x, y)
    this.shadowBlur = 0;
    this.fillStyle = (color !== undefined ? color : "black");
    this.fillText(text, x - 1, y - 1)
}