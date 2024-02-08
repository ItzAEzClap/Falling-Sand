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
        this.maxSurviveRange = 10
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

        // Just remove it
        particles.splice(particles.indexOf(this), 1)
        getChunk(this.drawX, this.drawY).hasUpdatedFrameBuffer = false
        console.log("Hi")

        // Old space is taken
        

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
