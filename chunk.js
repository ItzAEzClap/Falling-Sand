class Chunk {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.elements = []

        this.frameBuffer = new ImageData(CHUNKSIZE, CHUNKSIZE)
        this.hasUpdatedFrameBuffer = false

        this.updateThisFrame = true
        this.updateNextFrame = false
    }

    buildFrameBuffer() {
        // Should add particles

        for (let y = 0; y < CHUNKSIZE; y++) {
            for (let x = 0; x < CHUNKSIZE; x++) {
                let i = (x + y * CHUNKSIZE) * 4
                let pixel = this.elements[x + y * CHUNKSIZE]
                this.frameBuffer.data[i] = pixel?.colData[0] ?? 255
                this.frameBuffer.data[i + 1] = pixel?.colData[1] ?? 255
                this.frameBuffer.data[i + 2] = pixel?.colData[2] ?? 255
                this.frameBuffer.data[i + 3] = 255
            }
        }
        this.hasUpdatedFrameBuffer = true
    }

    shiftUpdateSchedule() {
        this.updateThisFrame = this.updateNextFrame
        this.updateNextFrame = false
    }

    updateAdjacentChunks() {
        let up = chunks[`${this.x},${this.y - 1}`]
        let down = chunks[`${this.x},${this.y + 1}`]
        let left = chunks[`${this.x - 1},${this.y}`]
        let right = chunks[`${this.x + 1},${this.y}`]

        if (up) up.updateNextFrame = true
        if (down) down.updateNextFrame = true
        if (left) left.updateNextFrame = true
        if (right) right.updateNextFrame = true
    }

    update() {
        // Should add particles

        if (!this.updateThisFrame) return
        this.hasUpdatedFrameBuffer = false

        for (let i = 0; i < this.elements.length; i += 2) {
            let element = this.elements[i]
            if (!element || element.hasUpdated) continue
            element.step()
        }

        for (let i = 1; i < this.elements.length; i += 2) {
            let element = this.elements[i]
            if (!element || element.hasUpdated) continue
            element.step()
        }
    }

    draw() {
        if (!this.hasUpdatedFrameBuffer) this.buildFrameBuffer()

        let x = ~~(this.x * CHUNKSIZE - player.x)
        let y = ~~(this.y * CHUNKSIZE - player.y)
        c.putImageData(this.frameBuffer, x, y)
        c.drawText(`${this.x}, ${this.y}`, x + CHUNKSIZE / 2, y + CHUNKSIZE / 2, 14, "center")
    }
}