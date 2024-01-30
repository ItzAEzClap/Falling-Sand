const FPS = 60
let keys_pressed = {}

const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.vel = { x: 0, y: 0 }
        this.acc = { x: 0, y: 0 }
        this.maxLimit = 30
    }

    move() {
        this.acc.x = 0
        this.acc.y = 0

        if (keys_pressed["a"]) {
            this.acc.x -= 1
        }
        if (keys_pressed["d"]) {
            this.acc.x += 1
        }
        if (keys_pressed["w"]) {
            this.acc.y -= 1
        }
        if (keys_pressed["s"]) {
            this.acc.y += 1
        }

        this.vel.x += this.acc.x
        this.vel.y += this.acc.y
        if (this.acc.x === 0 && this.acc.y === 0) {
            this.vel.x *= .9
            this.vel.y *= .9
            
        }

        let d = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2)
        if (d > 10) {
            this.vel.x /= d
            this.vel.y /= d
        }

        this.x += this.vel.x
        this.y += this.vel.y
    }

    draw() {
        c.fillStyle = "black"
        c.fillRect(canvas.width / 2 - 10, canvas.height / 2 - 25, 20, 50)
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

}

function draw() {
    c.fillStyle = "white"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
}

function init() {
    prev = performance.now()
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    for (let i = -10; i < 10; i++) {
        for (let j = -10; j < 10; j++) {
            chunks[`${i},${j}`] = new Chunk(i, j)
        }
    }
    
    
    
    
    animate()
}; init()



let chunks = {}
class Chunk {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.particles = {}
    }

    update() {

    }

    drawBorder() {
        c.strokeStyle = "lightgrey"
        c.lineWidth = 5
    }
}





window.onkeydown = (e) => keys_pressed[e.key.toLowerCase()] = true
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false