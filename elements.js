class Element {
    constructor(x, y, col) {
        this.x = x
        this.y = y
        this.velY = 1
        this.hasUpdated = false
        this.colData = col || [255, 255, 255]
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

        
        // Diagonally
        if (oldRelX === 0 && oldRelY === 0) {
            let chunk = chunks[`${oldChunk.x - 1},${oldChunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        } else if (oldRelX === CHUNKSIZE - 1 && oldRelY === 0) {
            let chunk = chunks[`${oldChunk.x + 1},${oldChunk.y - 1}`]
            if (chunk) chunk.updateNextFrame = true
        }

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

    convertToPartical(vel) {
        particles.push(new Particle(this.x, this.y, this.colData, vel, this.constructor))
        getChunk(this.x, this.y).elements[getElementPos(this.x, this.y)] = undefined
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

        for (let i = 1; i <= 1 + ~~this.velY; i++) {
            let nextCell = getElementAtCell(this.x, this.y + i)
            if (!nextCell || nextCell instanceof Liquid) maxY = i
            else break
        }

        if (maxY === 0) {
            this.velY = 0
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
        this.colData = [194, 178, 128]
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
        let maxY = 0

        for (let i = 1; i < 1 + ~~this.velY; i++) {
            if (getElementAtCell(this.x, this.y + i)) break
            maxY = i
        }

        if (maxY === 0) return false

        this.velY += GRAVITY
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
