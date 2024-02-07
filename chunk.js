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

                for (let j = 0; j < 4; j++) {
                    this.frameBuffer.data[i + j] = pixel?.colData[j] ?? 255
                }
            }
        }

        let particlesInChunk = particles.filter(particle => particle.drawX >= this.x * CHUNKSIZE &&
                    particle.drawX < CHUNKSIZE * (this.x + 1) &&
                    particle.drawY >= this.y * CHUNKSIZE &&
                    particle.drawY < CHUNKSIZE * (this.y + 1))

        for (let particle of particlesInChunk) {
            let i = getElementPos(particle.drawX, particle.drawY) * 4
            for (let j = 0; j < 4; j++) {
                this.frameBuffer.data[i + j] = particle?.colData[j] ?? 255
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

        let elementsToUpdate = this.elements.filter(element => element && !(element instanceof ImmovableSolid))
        for (let i = 0; i < elementsToUpdate.length; i += 2) {
            let element = elementsToUpdate[i]
            if (element.hasUpdated) continue
            element.step()
            element.hasUpdated = true
            updatedElements.push(element)
        }

        for (let i = 1; i < elementsToUpdate.length; i += 2) {
            let element = elementsToUpdate[i]
            if (element.hasUpdated) continue
            element.step()
            element.hasUpdated = true
            updatedElements.push(element)
        }
    }

    draw() {
        if (!this.hasUpdatedFrameBuffer) this.buildFrameBuffer()

        let x = ~~(this.x * CHUNKSIZE - player.x)
        let y = ~~(this.y * CHUNKSIZE - player.y)
        c.putImageData(this.frameBuffer, x, y)
        c.drawText(`${this.x}, ${this.y}`, x + CHUNKSIZE / 2, y + CHUNKSIZE / 2, 14, "center")

        if (this.updateThisFrame) {
            c.beginPath()
            c.strokeStyle = "lightgrey"
            c.strokeRect(x, y, CHUNKSIZE, CHUNKSIZE)
            c.stroke()
        }
    }
}