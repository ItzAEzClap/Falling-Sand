const canvas = document.createElement("canvas")
const c = canvas.getContext("2d")
const renderCanvas = document.createElement("canvas")
const renderC = renderCanvas.getContext("2d")
document.body.appendChild(renderCanvas)
renderCanvas.style.zIndex = "0"

const FPS = 60
const CHUNKSIZE = 32
let keys_pressed = {}
let chunks = {}
let mouse = { x: 0, y: 0 }
let tool = 0

const STANDARDX = 16
const STANDARDY = 9
const RENDERSCALE = 15
canvas.width = STANDARDX * RENDERSCALE
canvas.height = STANDARDY * RENDERSCALE




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

    renderC.beginPath()
    renderC.lineWidth = 4
    renderC.strokeStyle = "black"
    renderC.rect((mouse.x - 20), (mouse.y - 20), 40, 40)
    renderC.stroke()
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
                    if (value > 0.5) chunk.particles[x + y * CHUNKSIZE] = new ImmovableSolid(x, y)
                }
            }
        }
    }
    
    
    animate()
}


window.onmousedown = (e) => {
    switch (tool) {
        case 0:
            for (let y = 0; y < 40 / RENDERSCALE; y++) {
                for (let x = 0; x < 40 / RENDERSCALE; x++) {
                    let chunk = chunks[`${~~(x / CHUNKSIZE)},${~~(y / CHUNKSIZE)}`]
                    chunk.particles
                }
            }
            break
        default:
            break
    }
}

window.onmousemove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
window.onkeydown = (e) => keys_pressed[e.key.toLowerCase()] = true
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false
window.onresize = fixCanvas
window.onload = init