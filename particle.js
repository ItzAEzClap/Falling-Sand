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
        let signX = this.vel.x < 0 ? -1 : 1
        let signY = this.vel.y < 0 ? -1 : 1

        let longest = this.vel.x * signX
        let shortest = this.vel.y * signY
        let xLargest = longest > shortest
        if (!xLargest) {
            let temp = longest
            longest = shortest
            shortest = temp
        }            

        let k = (shortest === 0 || longest === 0) ? 0 : shortest / longest
        let end = ~~longest + (longest % 1 === 0 ? 0 : 1)
        for (let i = 1; i <= end; i++) {
            let delta = i
            if (i > longest) delta = i

            let x = delta
            let y = k * delta
            if (!xLargest) {
                let temp = x
                x = y
                y = temp
            }

            let newX = ~~(this.x + x * signX + 0.5)
            let newY = ~~(this.y + y * signY + 0.5)
            let element = getElementAtCell(newX, newY)
            if (element) return false

            this.drawX = newX
            this.drawY = newY
        }
        return true
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

        // BresenhamMove
        this.bresenhamMove()
        if (this.prevDrawX !== this.drawX || this.prevDrawY !== this.drawY) {
            this.convertToElement()
            return
        }

        // Closest empty
        let spacesInRange = []

        for (let dy = -this.maxSurviveRadius; dy <= this.maxSurviveRadius; dy++) {
            for (let dx = -this.maxSurviveRadius; dx <= this.maxSurviveRadius; dx++) {
                spacesInRange.push({ x: dx, y: dy, distance: dx ** 2 + dy ** 2 })
            }
        }
        spacesInRange.sort((a, b) => a.distance - b.distance)

        for (let space of spacesInRange) {
            let x = this.drawX + space.x
            let y = this.drawY + space.y
            if (getElementAtCell(x, y)) continue

            this.drawX = x
            this.drawY = y
            this.convertToElement()
            return
        }

        // Delete
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
