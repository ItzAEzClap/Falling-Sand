const canvas = document.createElement("canvas")
const c = canvas.getContext("2d")
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

const renderCanvas = document.createElement("canvas")
const renderC = renderCanvas.getContext("2d")
document.body.appendChild(renderCanvas)
renderCanvas.style.zIndex = "0"


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


const FPS = 60
const CHUNKSIZE = 32
let keys_pressed = {}
let chunks = {}
let mouse = { x: 0, y: 0 }

const STANDARDX = 16
const STANDARDY = 9
const RENDERSCALE = 15
canvas.width = STANDARDX * RENDERSCALE
canvas.height = STANDARDY * RENDERSCALE

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

class Chunk {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.frameBuffer = new ImageData(CHUNKSIZE, CHUNKSIZE)
        this.particles = {}
        this.hasUpdatedFrameBuffer = false

        this.updateNextFrame = true
    }
    
    buildFrameBuffer() {
        for (let y = 0; y < CHUNKSIZE; y++) {
            for (let x = 0; x < CHUNKSIZE; x++) {
                let i = (y * CHUNKSIZE + x) * 4
                let pixel = this.particles[`${x},${y}`]
                this.frameBuffer.data[i] = pixel?.colData[0] ?? 255
                this.frameBuffer.data[i + 1] = pixel?.colData[1] ?? 255
                this.frameBuffer.data[i + 2] = pixel?.colData[2] ?? 255
                this.frameBuffer.data[i + 3] = 255
            }
        }
        this.hasUpdatedFrameBuffer = true
    }


    update() {
        this.updateNextFrame = false
        for (let particle of Object.values(this.particles)) {
            if (particle.constructor.name === "ImmovableSolid") continue
            let x = particle.x
            let y = particle.y
            particle.update()
        }

        if (!this.hasUpdatedFrameBuffer) this.buildFrameBuffer()
    }

    draw() {
        let x = ~~(this.x * CHUNKSIZE - player.x)
        let y = ~~(this.y * CHUNKSIZE - player.y)
        c.putImageData(this.frameBuffer, x, y)


        c.beginPath()
        c.strokeStyle = "lightgrey"
        c.lineWidth = 1
        c.rect(x, y, CHUNKSIZE, CHUNKSIZE)
        c.stroke()
        c.drawText(`${this.x}, ${this.y}`, x + CHUNKSIZE / 2, y + CHUNKSIZE / 2, 14, "center")
    }
}

class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    update() { }

    draw(x, y) {
        c.fillStyle = `rgb(${this.col[0]}, ${this.col[1]}, ${this.col[2]}`
        c.fillRect(this.x + x, this.y + y, 1, 1)
    }
}

class Sand extends Particle {
    constructor(x, y) {
        super(x, y)
        this.col = "rgb(194, 178, 128)"
    }

    update() {
        if (this.y + 1 >= rows) return

        let prevX = x
        let prevY = y

        
        if (!positions[`${this.x},${this.y + 1}`]) { // Down
            this.move(0, 1)
        } else { // Left Right
            let dir = Math.random() > 0.5 ? -1 : 1
            let left = positions[`${this.x - dir},${this.y + 1}`]
            let right = positions[`${this.x + dir},${this.y + 1}`]

            if (!left) this.move(-dir, 0)
            else if (!right) this.move(dir, 0)
        }
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.col
        c.fillRect(this.x * tileWidth, this.y * tileWidth, tileWidth, tileWidth)
        c.stroke()
    }
}


class ImmovableSolid extends Particle {
    constructor(x, y) {
        super(x, y)
        this.colData = [30, 30, 30]
    }
}


let a = 0
let player = new Player()
let prev = 0
function animate() {
    requestAnimationFrame(animate)
    let dt = performance.now() - prev
    a += dt
    prev += dt

    player.move()

    if (a > 1000 / 20) { // Update
        update()
        a -= 1000 / 20
    }
    draw()
}

function update() {
    for (let chunk of Object.values(chunks)) {
        if (chunk.updateNextFrame) chunk.update()
    }
}

function draw() {
    // Clear
    renderC.imageSmoothingEnabled = false
    renderC.clearRect(0, 0, renderCanvas.width, renderCanvas.height)
    c.clearRect(0, 0, canvas.width, canvas.height)

    // Draw
    let i = 0
    let offX = ~~(player.x / CHUNKSIZE)
    let offY = ~~(player.y / CHUNKSIZE)
    for (let y = -1; y < STANDARDY * RENDERSCALE / CHUNKSIZE + 1; y++) {
        for (let x = -1; x < STANDARDX * RENDERSCALE / CHUNKSIZE + 1; x++) {
            let chunk = chunks[`${x + offX},${y + offY}`];
            if (chunk) {
                chunk?.draw()
                i++
            }
        }
    }
    
    


    



    console.log(`Currently drawing ${i} chunks`)

    // Draw upscale
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)
}

function init() {
    prev = performance.now()
    fixCanvas()
    
    let width = 5
    let height = 5
    for (let i = -height; i <= height; i++) {
        for (let j = -width; j <= width; j++) {
            let chunk = new Chunk(i, j)
            chunks[`${i},${j}`] = chunk
            
            for (let y = 0; y < CHUNKSIZE; y++) {
                for (let x = 0; x < CHUNKSIZE; x++) {
                    let value = getPerlinNoise(chunk.x * CHUNKSIZE + x, chunk.y * CHUNKSIZE + y, 100, 40)
                    //let value = advancedPerlinNoise((chunk.x * CHUNKSIZE + x),
                    //(chunk.y * CHUNKSIZE + y), 100, 1, 40, 1)
                    if (value > 0.5) chunk.particles[`${x},${y}`] = new ImmovableSolid(x, y)
                }
            }
        }
    }
    
    
    
    
    animate()
}; init()

window.onmousemove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
window.onkeydown = (e) => keys_pressed[e.key.toLowerCase()] = true
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false