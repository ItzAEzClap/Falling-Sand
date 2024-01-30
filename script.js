const FPS = 60
const CHUNKSIZE = 16
const TILESIZE = 10
let keys_pressed = {}
let chunks = {}

const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
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

    draw() {
        c.fillStyle = "black"
        c.beginPath()
        c.arc(canvas.width / 2 - 5, canvas.height / 2 - 5, 10, 0, 2*Math.PI)
        c.fill()
    }
}

class Chunk {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.particles = {}
        this.updateNextFrame = true
    }

    update() {
        for (let particle of Object.values(this.particles)) {
            particle.update()
        }
    }

    draw() {
        let x = this.x * CHUNKSIZE * TILESIZE - player.x + canvas.width / 2
        let y = this.y * CHUNKSIZE * TILESIZE - player.y + canvas.height / 2
        c.beginPath()
        c.strokeStyle = "lightgrey"
        c.lineWidth = 5
        c.rect(x, y, CHUNKSIZE * TILESIZE, CHUNKSIZE * TILESIZE)
        c.stroke()

        c.lineWidth = 1
        c.strokeText(`${this.x}, ${this.y}`, x + CHUNKSIZE * TILESIZE / 2, y + CHUNKSIZE * TILESIZE / 2)
        c.stroke()

        for (let particle of Object.values(this.particles)) {
            particle.draw(x, y)
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    getNext(chunkX, chunkY, dx, dy) {
        let x = this.x + dx
        let y = this.y + dy

        return chunks[`${chunkX},${chunkY}`].particles[`${x},${y}`] ||
                chunks[`${chunkX + x % CHUNKSIZE},${chunkY + y % CHUNKSIZE}`]
                    .particles[`${(x + CHUNKSIZE) % CHUNKSIZE},${(y + CHUNKSIZE) % CHUNKSIZE}`]
    }

    move(dx, dy) {

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

class ImmovableSolid {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    update() {}

    draw(x, y) {
        c.fillStyle = "black"
        c.fillRect(this.x * TILESIZE + x, this.y * TILESIZE + y, TILESIZE, TILESIZE)
    }
}


let a = 0
let player = new Player(40, 20)
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
        if (!chunk.updateNextFrame) continue
        chunk.update()
    }
}

function draw() {
    c.fillStyle = "white"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    let drawingChunks = Object.values(chunks).filter(e => e)

    for (let chunk of drawingChunks) if (chunk.updateNextFrame) chunk.draw()
    console.log(`Currently drawing ${drawingChunks.length} chunks`)
}

function init() {
    prev = performance.now()
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    let width = 5
    let height = 5
    for (let i = -height; i <= height; i++) {
        for (let j = -width; j <= width; j++) {
            let chunk = new Chunk(i, j)
            chunks[`${i},${j}`] = chunk
            
            for (let y = 0; y < CHUNKSIZE; y++) {
                for (let x = 0; x < CHUNKSIZE; x++) {
                    let value = advancedPerlinNoise((chunk.x * CHUNKSIZE + x),
                    (chunk.y * CHUNKSIZE + y), 100, .7, 40, 2)
                    if (value > 0.5) chunk.particles[`${x},${y}`] = new ImmovableSolid(x, y)
                }
            }
        }
    }
    
    
    
    
    animate()
}; init()


window.onkeydown = (e) => keys_pressed[e.key.toLowerCase()] = true
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false