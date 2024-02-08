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
        this.maxSurviveRadius = 5
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

    canMoveThere(x, y) {
        let tx = this.x
        let ty = this.y
        this.x = x
        this.y = y
        let result = this.bresenhamMove()
        this.x = tx
        this.y = ty
        return result
    }


    move() {
        this.vel.y += GRAVITY
        this.x += this.vel.x
        this.y += this.vel.y
        this.prevDrawX = this.drawX
        this.prevDrawY = this.drawY

        if (!getElementAtCell(~~this.x, ~~this.y)) {
            this.drawX = ~~this.x
            this.drawY = ~~this.y
            return
        }
        
        this.x -= this.vel.x
        this.y -= this.vel.y

        if (!getElementAtCell(~~this.x, ~~this.y)) {
            this.convertToElement()
            return
        }

        // Old space is taken

        // Top and bottom of square
        let startY = ~~(this.y - this.maxSurviveRadius)
        let startX = ~~(this.x - this.maxSurviveRadius)
        let endX = ~~(this.x + this.maxSurviveRadius)

        for (let x = startX; x <= endX; x++) {
            let y1 = startY
            let y2 = startY + this.maxSurviveRadius * 2

            
        }

        // Middle Part
        for (let y = start; y <= end; y++) {
            let x1 = ~~(this.x - this.maxSurviveRadius)
            let x2 = ~~(this.x + this.maxSurviveRadius)


        }


        console.log("Failed to move")

        particles.splice(particles.indexOf(this), 1)
        getChunk(this.drawX, this.drawY).hasUpdatedFrameBuffer = false
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
