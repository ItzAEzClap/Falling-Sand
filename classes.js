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
        this.hasUpdatedFrameBuffer = false

        this.particles = Array(CHUNKSIZE * CHUNKSIZE)

        this.updateNextFrame = true
    }
    
    buildFrameBuffer() {
        for (let y = 0; y < CHUNKSIZE; y++) {
            for (let x = 0; x < CHUNKSIZE; x++) {
                let i = (y * CHUNKSIZE + x) * 4
                let pixel = this.particles[x + y * CHUNKSIZE]
                this.frameBuffer.data[i] = pixel?.colData[0] ?? 255
                this.frameBuffer.data[i + 1] = pixel?.colData[1] ?? 255
                this.frameBuffer.data[i + 2] = pixel?.colData[2] ?? 255
                this.frameBuffer.data[i + 3] = 255
            }
        }
        this.hasUpdatedFrameBuffer = true
    }

    tempFix() {
        this.hasUpdatedFrameBuffer = false
        this.updateNextFrame = true
        if (chunks[`${this.x + 1},${this.y}`]) chunks[`${this.x + 1},${this.y}`].updateNextFrame = true
        if (chunks[`${this.x - 1},${this.y}`]) chunks[`${this.x - 1},${this.y}`].updateNextFrame = true
        if (chunks[`${this.x},${this.y + 1}`]) chunks[`${this.x},${this.y + 1}`].updateNextFrame = true
        if (chunks[`${this.x},${this.y - 1}`]) chunks[`${this.x},${this.y - 1}`].updateNextFrame = true
    }


    update() {
        if (!this.updateNextFrame) return

        this.drawBorder = true

        this.updateNextFrame = false
        let updateParticals = this.particles.filter(partical => partical && partical.constructor.name !== "ImmovableSolid")

        let start = Math.random() > 0.5 ? 1 : 0

        for (let i = start; i < updateParticals.length; i += 2) {
            let result = updateParticals[updateParticals.length - i - 1].step()
            if (result) this.tempFix()
        }
        for (let i = 1 - start; i < updateParticals.length; i += 2) {
            let result = updateParticals[updateParticals.length - i - 1].step()
            if (result) this.tempFix()
        }


    }

    draw() {
        if (!this.hasUpdatedFrameBuffer) this.buildFrameBuffer()

        let x = ~~(this.x * CHUNKSIZE - player.x)
        let y = ~~(this.y * CHUNKSIZE - player.y)
        c.putImageData(this.frameBuffer, x, y)
        c.drawText(`${this.x}, ${this.y}`, x + CHUNKSIZE / 2, y + CHUNKSIZE / 2, 14, "center")
        c.beginPath()
        c.strokeStyle = "lightgrey"
        c.lineWidth = 1
        c.rect(x, y, CHUNKSIZE, CHUNKSIZE)
        c.stroke()
        if (!this.drawBorder) return

        this.drawBorder = false

        
    }
}