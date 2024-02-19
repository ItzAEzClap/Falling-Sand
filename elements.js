class Element {
    constructor(x, y, col) {
        this.x = x
        this.y = y
        this.velY = 1
        this.hasUpdated = false
        this.colData = col || [255, 255, 255]

        this.relativeX = mod(this.x, CHUNKSIZE)
        this.relativeY = mod(this.y, CHUNKSIZE)
        this.chunk = getChunkWithRelCoord(this.x, this.y, this.relativeX, this.relativeY)
    }

    step() {}

    updateRelativePos() {
        this.relativeX = mod(this.x, CHUNKSIZE)
        this.relativeY = mod(this.y, CHUNKSIZE)
    }

    moveTo(newX, newY) {
        let newRelX = mod(newX, CHUNKSIZE)
        let newRelY = mod(newY, CHUNKSIZE)
        let newChunk = getChunkWithRelCoord(newX, newY, newRelX, newRelY)
        
        let newPos = newRelX + newRelY * CHUNKSIZE
        let particle = newChunk.elements[newPos]
        this.chunk.elements[this.relativeX + this.relativeY * CHUNKSIZE] = particle
        newChunk.elements[newPos] = this
        newChunk.updateNextFrame = true

        /* Update chunks close */

        // Diagonally
        if (this.relativeX === 0 && this.relativeY === 0) {
            let chunk = chunks[`${this.chunk.x - 1},${this.chunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (this.relativeX === CHUNKSIZE - 1 && this.relativeY === 0) {
            let chunk = chunks[`${this.chunk.x + 1},${this.chunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        }

        // Adjacent
        if (this.relativeX === 0) {
            let chunk = chunks[`${this.chunk.x - 1},${this.chunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (this.relativeX === CHUNKSIZE - 1) {
            let chunk = chunks[`${this.chunk.x + 1},${this.chunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        }

        if (this.relativeY === 0) {
            let chunk = chunks[`${this.chunk.x},${this.chunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (this.relativeY === CHUNKSIZE - 1) {
            let chunk = chunks[`${this.chunk.x},${this.chunk.y + 1}`]
            if (chunk) chunk.updateNextFrame = true
        }

        if (newRelX === 0) {
            let chunk = chunks[`${newChunk.x - 1},${newChunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (newRelX === CHUNKSIZE - 1) {
            let chunk = chunks[`${newChunk.x + 1},${newChunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        }
        
        if (newRelY === 0) {
            let chunk = chunks[`${newChunk.x},${newChunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (newRelY === CHUNKSIZE - 1) {
            let chunk = chunks[`${newChunk.x},${newChunk.y + 1}`]
            if (chunk) chunk.updateNextFrame = true
        }

        /* Switch position values */
        if (particle) {
            particle.x = this.x
            particle.y = this.y
            particle.chunk = this.chunk
            particle.relativeX = this.relativeX
            particle.relativeY = this.relativeY
        }

        this.x = newX
        this.y = newY
        this.relativeX = newRelX
        this.relativeY = newRelY
        this.chunk.updateNextFrame = true
        this.chunk = newChunk
    }

    convertToPartical(vel) {
        particles.push(new Particle(this.x, this.y, this.colData, vel, this.constructor))
        this.chunk.elements[this.relativeX + this.relativeY * CHUNKSIZE] = undefined
    }
}

/* Solids */
class Solid extends Element {
    
}

// Movable solids
// maxY = 0, should add this.velY = 0
class MovableSolid extends Solid {
    constructor(x, y) {
        super(x, y)
    }

    moveDown() {
        this.velY += GRAVITY
        let maxY = 0

        for (let i = 1; i <= ~~this.velY; i++) {
            let nextCell = getElementAtCell(this.x, this.y + i)
            if (!nextCell || nextCell instanceof Liquid) maxY = i
            else break
        }

        if (maxY === 0) {
            this.velY = 1
            return false
        }

        this.moveTo(this.x, this.y + maxY)
        return true
    }

    moveDownSide() {
        let left = getElementAtCell(this.x - 1, this.y + 1)
        let right = getElementAtCell(this.x + 1, this.y + 1)
        let emptyLeft = !left || left instanceof Liquid
        let emptyRight = !right || right instanceof Liquid

        if (emptyLeft && emptyRight) {
            emptyLeft = Math.random() < 0.5
            emptyRight = !emptyLeft
        }        
        
        if (emptyLeft) this.moveTo(this.x - 1, this.y + 1)   
        else if (emptyRight) this.moveTo(this.x + 1, this.y + 1)
        
        return emptyLeft || emptyRight
    }
}

class Sand extends MovableSolid {
    constructor(x, y) {
        super(x, y)
        this.colData = randomizeColor([194, 178, 129], 15)
    }

    step() {
        if (this.moveDown()) return
        if (this.moveDownSide()) return
    }
}


// Immovable solids
class ImmovableSolid extends Solid {
    constructor(x, y) {
        super(x, y)
    }
}

class Stone extends ImmovableSolid {
    constructor(x, y) {
        super(x, y)
        this.colData = [30, 30, 30]
    }
}

class Border extends ImmovableSolid {}

/* Liquids */
class Liquid extends Element {
    constructor(x, y, dispertionRate) {
        super(x, y)
        this.dispertionRate = dispertionRate
    }

    moveDown() {
        this.velY += GRAVITY
        let maxY = 0

        for (let i = 1; i <= ~~this.velY; i++) {
            if (getElementAtCell(this.x, this.y + i)) break
            maxY = i
        }

        if (maxY === 0) {
            this.velY = 1
            return false
        }

        this.moveTo(this.x, this.y + maxY)
        return true
    }

    moveSide() {
        let dir = Math.random() > 0.5 ? 1 : -1
        let maxA = 0
        let maxB = 0
        let blockedA = false
        let blockedB = false
        let maxMovement = ~~(1 + Math.random() * this.dispertionRate)

        for (let x = 1; x <= maxMovement; x++) {
            if (!blockedA && !getElementAtCell(this.x + x * dir, this.y)) {
                maxA++
            } else blockedA = 2
            if (!blockedB && !getElementAtCell(this.x - x * dir, this.y)) {
                maxB++
            } else blockedB = true
        }

        if (maxA === 0 && maxB === 0) return false

        this.moveTo(this.x + maxA * dir, this.y)
        return true
    }
}

class Water extends Liquid {
    constructor(x, y) {
        super(x, y, 10)
        this.colData = [20, 20, 230]
    }

    step() {
        if (this.moveDown()) {}
        else if (this.moveSide()) {}
    }
}






/* Functions */
function spawnCluster() {
    let offX = ~~(mouse.x + player.x)
    let offY = ~~(mouse.y + player.y)

    for (let y = ~~(offY - MOUSESIZE / 2); y < offY + MOUSESIZE / 2; y++) {
        for (let x = ~~(offX - MOUSESIZE / 2); x < offX + MOUSESIZE / 2; x++) {
            let chunk = getChunk(x, y)
            if (!chunk) continue

            let pos = getElementPos(x, y)
            let element = chunk.elements[pos]
            if (element) continue
            let partical = false

            switch (elementType) {
                case 0:
                    element = new Stone(x, y)
                    break
                case 1:
                    element = new Sand(x, y)
                    break
                case 2:
                    element = new Water(x, y)
                    break
                case 3:
                    partical = true
                    element = new Water(x, y)
                    break
                default:
                    return
                    break
            }


            chunk.elements[pos] = element
            if (partical) {
                element.convertToPartical({ x: randomFloatFromRange(-1.5, 1.5), y: randomFloatFromRange(-1, 1) })
            } else chunk.updateNextFrame = true
        }
    }
}

function getElementAtCell(x, y) {
    let chunk = getChunk(x, y)
    if (!chunk) return new Border()
    return chunk.elements[getElementPos(x, y)]
}

function getChunkWithRelCoord(x, y, relX, relY) {
    return chunks[`${(x - relX) / CHUNKSIZE},${(y - relY) / CHUNKSIZE}`]
}

function getChunk(x, y) {
    let cx = ~~(x / CHUNKSIZE)
    let cy = ~~(y / CHUNKSIZE)
    if (x < 0 && x % CHUNKSIZE !== 0) cx--
    if (y < 0 && y % CHUNKSIZE !== 0) cy--
    return chunks[`${cx},${cy}`]
}

function getElementPos(x, y) {
    return mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE
}

function mod(n, base) {
    return ((n % base) + base) % base
}

function randomizeColor(colData, range, useSameOffset = false) {
    const CONSTANTOFFSET = range * Math.random() - 0.5
    return colData.map(colorComponent => colorComponent + ~~(useSameOffset ? CONSTANTOFFSET : range * (Math.random() - 0.5)))
}