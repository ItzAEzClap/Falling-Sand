class Element {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.hasUpdated = false
        this.colData = [255, 255, 255]
    }

    step() {}

    moveTo(newX, newY) {
        let newChunk = getChunk(newX, newY)
        let oldChunk = getChunk(this.x, this.y)

        let oldRelX = mod(this.x, CHUNKSIZE)
        let oldRelY = mod(this.y, CHUNKSIZE)
        let newRelX = mod(newX, CHUNKSIZE)
        let newRelY = mod(newY, CHUNKSIZE)

        let newPos = newRelX + newRelY * CHUNKSIZE
        let p = newChunk.elements[newPos]

        oldChunk.elements[oldRelX + oldRelY * CHUNKSIZE] = p
        newChunk.elements[newPos] = this

        
        // Update adjacent
        if (oldRelX === 0) {
            let chunk = chunks[`${oldChunk.x - 1},${oldChunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (oldRelX === CHUNKSIZE - 1) {
            let chunk = chunks[`${oldChunk.x + 1},${oldChunk.y}`]
            if (chunk) chunk.updateNextFrame = true
        }

        if (oldRelY === 0) {
            let chunk = chunks[`${oldChunk.x},${oldChunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (oldRelY === CHUNKSIZE - 1) {
            let chunk = chunks[`${oldChunk.x},${oldChunk.y + 1}`]
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

        if (p) {
            p.x = this.x
            p.y = this.y
        }

        this.x = newX
        this.y = newY

        oldChunk.updateNextFrame = true
        newChunk.updateNextFrame = true

    }
}

/* Solids */
class Solid extends Element {
    
}

// Movable solids
class MovableSolid extends Solid {
    constructor(x, y) {
        super(x, y)
    }

    moveDown() {
        let down = getElementAtCell(this.x, this.y + 1)
        if (!down || down instanceof Liquid) { this.moveTo(this.x, this.y + 1) }
        return !down
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
        this.colData = [194, 178, 128]
    }

    step() {
        if (this.moveDown()) {}
        else if (this.moveDownSide()) {}
        this.hasUpdated = true
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

/* Liquids */
class Liquid extends Element {
    constructor(x, y, dispertionRate) {
        super(x, y)
        this.dispertionRate = dispertionRate
    }

    moveDown() {
        let down = getElementAtCell(this.x, this.y + 1)
        if (!down) { this.moveTo(this.x, this.y + 1) }
        return !down
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
        this.hasUpdated = true
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
            let partical = chunk.elements[pos]
            if (partical) continue

            switch (particleType) {
                case 0:
                    partical = new Stone()
                    break
                case 1:
                    partical = new Sand()
                    break
                case 2:
                    partical = new Water()
                    break
                default:
                    return
                    break
            }

            partical.x = x
            partical.y = y
            chunk.elements[pos] = partical
            chunk.updateNextFrame = true
            chunk.hasUpdatedFrameBuffer = false
        }
    }
}

function getElementAtCell(x, y) {
    let chunk = getChunk(x, y)
    if (!chunk) return new ImmovableSolid()
    return chunk.elements[getElementPos(x, y)]
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
