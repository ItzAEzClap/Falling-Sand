const canvas = document.createElement("canvas")
const c = canvas.getContext("2d")
const renderCanvas = document.createElement("canvas")
const renderC = renderCanvas.getContext("2d")
document.body.appendChild(renderCanvas)
renderCanvas.style.zIndex = "0"

const STANDARDX = 16
const STANDARDY = 9
const RENDERSCALE = 15
let scale = 1

const FPS = 60
const MOUSESIZE = 5
const mouse = { x: 0, y: 0, down: false }

let particleType = 1
const player = new Player()
const keys_pressed = {}
const chunks = {}
const updatedElements = []
const particles = []
const CHUNKSIZE = 32
const GRIDWITDH = 5
const GRIDHEIGHT = 5
const GRAVITY = 1 / 20

let prevTime = 0
let currentFPS = 144
function animate() {
    let dt = performance.now() - prevTime
    prevTime += dt
    currentFPS = 1000 / dt

    update()
    draw()
    requestAnimationFrame(animate)
}

function update() {
    player.move()
    if (mouse.down) spawnCluster()

    let updateChunks = Object.values(chunks).filter(e => e.updateThisFrame)
        .sort((a, b) => Math.sqrt((player.x - a.x * CHUNKSIZE) ** 2 + (player.y - a.y * CHUNKSIZE) ** 2) 
                        - Math.sqrt((player.x - b.x * CHUNKSIZE) ** 2 + (player.y - b.y * CHUNKSIZE) ** 2))

    for (let i = 0; i < updateChunks.length; i += 2) updateChunks[i].update()
    for (let i = 1; i < updateChunks.length; i += 2) updateChunks[i].update()
    Object.values(chunks).forEach(chunk => {
        chunk.shiftUpdateSchedule()
    })
    
    for (let i = updatedElements.length - 1; i >= 0; i--) {
        updatedElements[i].hasUpdated = false
        updatedElements.pop()
    }
}

function draw() {
    renderC.imageSmoothingEnabled = false
    renderC.clearRect(0, 0, renderCanvas.width, renderCanvas.height)
    c.clearRect(0, 0, canvas.width, canvas.height)
    
    c.beginPath()
    let offX = ~~(player.x / CHUNKSIZE)
    let offY = ~~(player.y / CHUNKSIZE)
    for (let y = -1; y < STANDARDY * RENDERSCALE / CHUNKSIZE + 1; y++) {
        for (let x = -1; x < STANDARDX * RENDERSCALE / CHUNKSIZE + 1; x++) {
            let chunk = chunks[`${x + offX},${y + offY}`]
            if (chunk) chunk.draw()
        }
    }
    
    c.beginPath()
    c.lineWidth = 1
    c.strokeStyle = "black"
    c.rect(mouse.x - MOUSESIZE / 2, mouse.y - MOUSESIZE / 2, MOUSESIZE, MOUSESIZE)
    c.stroke()
    
    // Draw upscale
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)
    renderC.drawText(`${~~currentFPS}`, 50, 50, "60px Arial")
}

function init() {
    canvas.width = STANDARDX * RENDERSCALE
    canvas.height = STANDARDY * RENDERSCALE
    fixCanvas()

    for (let i = -GRIDHEIGHT; i <= GRIDHEIGHT; i++) {
        for (let j = -GRIDWITDH; j <= GRIDWITDH; j++) {
            let chunk = new Chunk(i, j)
            chunks[`${i},${j}`] = chunk

            for (let y = 0; y < CHUNKSIZE; y++) {
                for (let x = 0; x < CHUNKSIZE; x++) {
                    if (j < 3 || j >= GRIDHEIGHT - 1 || i < 1 || i >= GRIDWITDH) continue
                    chunk.elements[x + y * CHUNKSIZE] = new Stone(x + j * CHUNKSIZE, y + i * CHUNKSIZE)
                }
            }
        }
    }
    
    prevTime = performance.now() - 1000 / 144
    window.onmousemove = (e) => { mouse.x = e.clientX / scale; mouse.y = e.clientY / scale }
    animate()
}



window.onkeydown = (e) => {
    if (e.code.search(/Digit/) !== -1) {
        particleType = parseInt(e.key)
    }
    keys_pressed[e.key.toLowerCase()] = true
}
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false
window.onresize = fixCanvas
window.onload = init
window.onmousedown = () => mouse.down = true
window.onmouseup = () => mouse.down = false