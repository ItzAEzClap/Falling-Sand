// General
const FPS = 60
let updateInterval = (1 / FPS) * 1000
let lastFrame = performance.now()
let timeAccumulated = 0

// Game
const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const tileWidth = 20
const chunkSize = 16
let rows, cols
let chunks = []
let positions = {}


async function initLoop() {
    lastFrame = performance.now()
    timeAccumulated = 0
    chunks = []
    positions = {}

    // Canvas
    rows = ~~(window.innerHeight / tileWidth)
    cols = ~~(window.innerWidth / tileWidth)
    canvas.width = tileWidth * cols
    canvas.height = tileWidth * rows

    // Chunks
    for (let y = 0; y < rows / chunkSize; y++) {
        for (let x = 0; x < cols / chunkSize; x++) {
            chunks.push(new Chunk(x * chunkSize, y * chunkSize, chunkSize))
        }
    }
    console.log(chunks)
    gameLoop()
}

async function gameLoop() {
    requestAnimationFrame(gameLoop)

    let dt = performance.now() - lastFrame
    lastFrame += dt
    timeAccumulated += dt

    while (timeAccumulated > updateInterval) { // Enough lost time to update another frame
        update()
        timeAccumulated -= updateInterval
    }

    draw(timeAccumulated / updateInterval)
}

function update() {
    // Update bottom first
    let amount = 0
    chunks.sort((a, b) => b.y - a.y).forEach(chunk => {
        if (chunk.updating) {
            amount++
            chunk.update()
        }
    })
    console.log(`Amount of chunks updating: ${amount}`)
}

function draw() {
    c.fillStyle = "black"
    c.fillRect(0, 0, canvas.width, canvas.height)

    c.strokeStyle = "white"
    c.lineWidth = 1

    for (let i = 0; i < rows; i++) {
        c.moveTo(0, i * tileWidth)
        c.lineTo(canvas.width, i * tileWidth)
        c.stroke()   
    }
    for (let i = 0; i < cols; i++) {
        c.moveTo(i * tileWidth, 0)
        c.lineTo(i * tileWidth, canvas.height)
        c.stroke()
    }
    
    chunks.forEach(chunk => chunk.draw())
}

initLoop()
window.onmousedown = (e) => { spawnCluster(~~(e.clientX / tileWidth), ~~(e.clientY / tileWidth), 10, "Sand") }

function addParticle(x, y, type) {
    console.log(x, y)
    let particle
    let chunk
    for (const c of chunks) {
        if (c.x > x || c.x + c.size < x || c.y > y || c.y + c.size < y) continue
        chunk = c
        break
    }

    if (type === "Sand") {
        particle = new Sand(x, y)
    }

    positions[[x, y]] = particle
    chunk.particles.push(particle)
}

function spawnCluster(x, y, r, type) {
    for (let i = y - r; i < y + r; i++) {
        if (i < 0) continue
        if (i >= rows) break
        for (let j = x - r; j < x + r; j++) {
            if (j < 0) continue
            if (j >= cols) break
            if (positions[[j, i]] || Math.sqrt((x - j) ** 2 + (y - i) ** 2) > r) continue
            if (Math.random() > 0.2) addParticle(j, i, type) 
        }
    }
}