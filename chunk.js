class Chunk {
    constructor(x, y) {
        // Positions
        this.x = x
        this.y = y
        this.elements = Array(CHUNKSIZE * CHUNKSIZE)

        // "Frame"
        this.frameBuffer = new ImageData(CHUNKSIZE, CHUNKSIZE)
        this.hasUpdatedFrameBuffer = false

        // Update
        this.updateThisFrame = true
        this.updateNextFrame = false
        this.dir = 1
    }
    
    buildFrameBuffer() {
        // Add particals as well

        for (let y = 0; y < CHUNKSIZE; y++) {
            for (let x = 0; x < CHUNKSIZE; x++) {
                let i = (y * CHUNKSIZE + x) * 4
                let pixel = this.elements[x + y * CHUNKSIZE]
                this.frameBuffer.data[i] = pixel?.colData[0] ?? 255
                this.frameBuffer.data[i + 1] = pixel?.colData[1] ?? 255
                this.frameBuffer.data[i + 2] = pixel?.colData[2] ?? 255
                this.frameBuffer.data[i + 3] = 255
            }
        }
        this.hasUpdatedFrameBuffer = true
    }

    shift() {
        this.updateThisFrame = this.updateNextFrame
        this.updateNextFrame = false
        this.elements.forEach(element => { if (element) element.hasUpdated = false })
    }

    updateAdjacentChunks() {
        let right = chunks[`${this.x + 1},${this.y}`]
        if (right) right.updateNextFrame = true

        let left = chunks[`${this.x - 1},${this.y}`]
        if (left) left.updateNextFrame = true

        let down = chunks[`${this.x},${this.y + 1}`]
        if (down) down.updateNextFrame = true

        let up = chunks[`${this.x},${this.y - 1}`]
        if (up) up.updateNextFrame = true
    }


    update() {
        if (!this.updateThisFrame) return
        
        let oldDir = this.dir
        for (let y = CHUNKSIZE - 1; y >= 0; y--) {
            for (let x = 0; x < CHUNKSIZE; x++) {
                let p = this.elements[y * CHUNKSIZE + (this.dir === 1 ? x : CHUNKSIZE - 1 - x)]
                if (!p || p instanceof ImmovableSolid || p.hasUpdated) continue

                p.hasUpdated = true
                let result = p.step()
                if (!result) continue

                this.hasUpdatedFrameBuffer = false
                this.updateNextFrame = true
                this.updateAdjacentChunks()
            }
            this.dir *= -1
        }

        this.dir = -oldDir
    }

    draw() {
        if (!this.hasUpdatedFrameBuffer) this.buildFrameBuffer()

        let x = ~~(this.x * CHUNKSIZE - player.x)
        let y = ~~(this.y * CHUNKSIZE - player.y)
        c.putImageData(this.frameBuffer, x, y)
        c.drawText(`${this.x}, ${this.y}`, x + CHUNKSIZE / 2, y + CHUNKSIZE / 2, 14, "center")
        
        return
        c.beginPath()
        c.strokeStyle = "lightgrey"
        c.lineWidth = 1
        c.rect(x, y, CHUNKSIZE, CHUNKSIZE)
        c.stroke()
    }
}