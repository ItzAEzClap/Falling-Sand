class Particle {
    constructor(x, y, col, vel, constructor) {
        this.x = x
        this.y = y
        this.drawX = x
        this.drawY = y
        this.prevDrawX
        this.prevDrawY

        this.colData = col
        this.vel = vel || { x: 0, y: 0 }
        this.constructor = constructor
        this.maxSurviveRadius = 3
    }

    /* https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm */     
    bresenhamMove() {
        let dx = endX - startX
        let dy = endY - startY
        let signX = dx < 0 ? -1 : 1
        let signY = dy < 0 ? -1 : 1

        let longest = dx * signX
        let shortest = dy * signY
        let xLargest = longest > shortest
        if (!xLargest) [shortest, longest] = [longest, shortest]
        let k = (shortest === 0 || longest === 0) ? 0 : shortest / longest


        let maxX = this.drawX
        let maxY = this.drawY
        for (let i = 0.5; i <= longest + 0.5; i++) {
            let dI = Math.min(i, longest)

            let x = dI
            let y = dI * k
            if (!xLargest) [x, y] = [y, x]

            let newX = ~~(startX + x * signX)
            let newY = ~~(startY + y * signY)
            if (!getElementAtCell(newX, newY)) continue

            maxX = newX
            maxY = newY
        }
        return [maxX, maxY]
    }

    move() {
        this.vel.y += GRAVITY
        this.prevDrawX = this.drawX
        this.prevDrawY = this.drawY
        this.x += this.vel.x
        this.y += this.vel.y

        // Instant Move
        let element = getElementAtCell(~~this.x, ~~this.y)
        if (!element) {
            this.drawX = ~~this.x
            this.drawY = ~~this.y
            return
        }
        this.x -= this.vel.x
        this.y -= this.vel.y

        // BresenhamMove - More precise but slower
        /*
        let [x, y] = this.bresenhamMove()
        if (x !== this.drawX || y !== this.drawY) {
            this.convertToElement()
            return
        }*/

        // Closest empty
        for (let dy = 0; dy <= this.maxSurviveRadius; dy++) {
            for (let dx = 0; dx <= this.maxSurviveRadius; dx++) {
                if (dy === 0 && dx === 0) continue

                let topLeft = getElementAtCell(this.drawX - dx, this.drawY - dy)
                let topRight = getElementAtCell(this.drawX + dx, this.drawY - dy)
                let bottomLeft = getElementAtCell(this.drawX - dx, this.drawY + dy)
                let bottomRight = getElementAtCell(this.drawX + dx, this.drawY + dy)

                if (!topLeft) {
                    this.drawX -= dx
                    this.drawY -= dy
                } else if (!topRight) {
                    this.drawX += dx
                    this.drawY -= dy
                } else if (!bottomLeft) {
                    this.drawX -= dx
                    this.drawY += dy
                } else if (!bottomRight) {
                    this.drawX += dx
                    this.drawY += dy
                } else continue

                this.convertToElement()
                return
            }
        }

        particles.splice(particles.indexOf(this), 1)
        getChunk(this.drawX, this.drawY).updateNextFrame = true
    }

    update() {
        if (this.vel.x === 0 && this.vel.y === 0) return // Didn't move

        this.move()
        getChunk(this.drawX, this.drawY).hasUpdatedFrameBuffer = false
        getChunk(this.prevDrawX, this.prevDrawY).hasUpdatedFrameBuffer = false
    }

    convertToElement() {
        let chunk = getChunk(this.drawX, this.drawY)
        if (!chunk) return

        chunk.elements[getElementPos(this.drawX, this.drawY)] = new this.constructor(this.drawX, this.drawY, this.colData)
        particles.splice(particles.indexOf(this), 1)
        chunk.updateNextFrame = true
    }
}
