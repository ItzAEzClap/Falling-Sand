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



let b = 60
let a = 0
let player = new Player()
let prev = 0

async function animate() {
    requestAnimationFrame(animate)
    let dt = performance.now() - prev
    a += dt
    prev += dt

    player.move()

    update()
    draw()

    b = 1000 / dt
}

function update() {
    let i = 0
    for (let chunk of Object.values(chunks)) {
        if (!chunk.updateNextFrame) continue
        chunk.update()
        i++
    }
    //console.log(`Currently updating ${i} chunks`)
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
    
    c.beginPath()
    c.lineWidth = 1
    c.strokeStyle = "black"
    c.rect(mouse.x - 5, mouse.y - 5, 10, 10)
    c.stroke()

    
    


    //console.log(`Currently drawing ${i} chunks`)

    // Draw upscale
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)
    renderC.drawText(`${~~b}`, 200, 200, "60px Arial")

    //renderC.beginPath()
    //renderC.lineWidth = 4
    //renderC.strokeStyle = "black"
    //renderC.rect((mouse.x - 20), (mouse.y - 20), 40, 40)
    //renderC.stroke()
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
                    if (value > 0.5) chunk.particles[x + y * CHUNKSIZE] = new ImmovableSolid(x + j * CHUNKSIZE, y + i * CHUNKSIZE)
                }
            }
        }
    }
    
    window.onmousemove = (e) => { mouse.x = e.clientX / scale; mouse.y = e.clientY / scale }
    animate()
}



window.onmousedown = () => {
    let offX = ~~(mouse.x + player.x)
    let offY = ~~(mouse.y + player.y)


    for (let y = offY - 5; y < offY + 5; y++) {
        for (let x = offX - 5; x < offX + 5; x++) {
            let chunkX = ~~(x / CHUNKSIZE) + (x < 0 ? - 1 : 0)
            let chunkY = ~~(y / CHUNKSIZE) + (y < 0 ? - 1 : 0)
            let chunk = chunks[`${chunkX},${chunkY}`]

            let partical = chunk.particles[mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE]
            if (!partical) chunk.particles[mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE] = new Sand(x , y)

            chunk.hasUpdatedFrameBuffer = false
            chunk.updateNextFrame = true
        }
    }
    
    return
}

window.onkeydown = (e) => keys_pressed[e.key.toLowerCase()] = true
window.onkeyup = (e) => keys_pressed[e.key.toLowerCase()] = false
window.onresize = fixCanvas
window.onload = init
