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
    }


    move() {
        this.vel.y += GRAVITY
        this.x += this.vel.x
        this.y += this.vel.y
        this.prevDrawX = this.drawX
        this.prevDrawY = this.drawY

        // Find longest side
        let shorterSide = Math.abs(this.vel.y)
        let longerSide = Math.abs(this.vel.x)
        let xLarger = longerSide > shorterSide
        if (!xLarger) {
            let t = shorterSide
            shorterSide = longerSide
            longerSide = t
        }

        let signX = this.vel.x < 0 ? -1 : 1
        let signY = this.vel.y < 0 ? -1 : 1
        let k = (shorterSide === 0 || longerSide === 0) ? 0 : shorterSide / longerSide
        for (let i = 1; i <= Math.ceil(longerSide); i++) {
            let di = k * Math.min(i, longerSide)
            let dx =  Math.min(i, longerSide)
            let dy = di

            if (!xLarger) [dx, dy] = [dy, dx]

            let newX = Math.round(this.x + dx * signX)
            let newY = Math.round(this.y + dy * signY)

            if (getElementAtCell(newX, newY)) {
                this.convertToElement()
                return
            }

            this.drawX = newX
            this.drawY = newY
        }
    }

    update() {
        if (this.vel.x === 0 && this.vel.y === 0) return // Didn't move
        this.move()
    }



    convertToElement() {
        let chunk = getChunk(this.drawX, this.drawY)
        if (!chunk) return

        chunk.elements[getElementPos(this.drawX, this.drawY)] = new this.constructor(this.drawX, this.drawY, this.colData)
        particles.splice(particles.indexOf(this))
        chunk.updateNextFrame = true
    }
}

function findPath(startX, startY, endX, endY) {
    let dx = endX - startX
    let dy = endY - startY
    let signX = dx < 0 ? -1 : 1
    let signY = dy < 0 ? -1 : 1

    let longest = Math.abs(dx)
    let shortest = Math.abs(dy)
    let xLargest = longest > shortest
    if (!xLargest) [shortest, longest] = [longest, shortest]

    k = (shortest === 0 || longest === 0) ? 0 : shortest / longest
    for (let i = 0; i <= Math.ceil(longest); i++) {
        let delta = i
        if (i > longest) delta = i

        let x = i
        let y = k * i
        if (!xLargest) [x, y] = [y, x]

        let newX = Math.round(startX + x * signX)
        let newY = Math.round(startY + y * signY)
        grid[[newX, newY]].col = "green"
        grid[[newX, newY]].draw()
    }


    grid[[startX, startY]].col = "red"
    grid[[startX, startY]].draw()
    grid[[endX, endY]].col = "red"
    grid[[endX, endY]].draw()


    c.strokeStyle = "white"
    c.beginPath()
    c.lineWidth = 3
    c.moveTo(startX * TILESIZE, startY * TILESIZE)
    c.lineTo(endX * TILESIZE, endY * TILESIZE)
    c.stroke()
}