// Base
class Element {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.colData = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    }

    move(newX, newY) {
        let newChunk = getChunk(newX, newY)
        let oldChunk = getChunk(this.x, this.y)
        if (newChunk !== oldChunk) newChunk.hasUpdatedFrameBuffer = false

        newChunk.elements[getElementPos(newX, newY)] = this
        oldChunk.elements[getElementPos(this.x, this.y)] = undefined
        this.x = newX
        this.y = newY
    }

    switch(newX, newY) {
        let newChunk = getChunk(newX, newY)
        let oldChunk = getChunk(this.x, this.y)
        let pOff = getElementPos(newX, newY)
        let thisOff = getElementPos(this.x, this.y)

        newChunk.elements[pOff].x = this.x
        newChunk.elements[pOff].y = this.y
        this.x = newX
        this.y = newY
        oldChunk.elements[thisOff] = newChunk.elements[pOff]
        newChunk.elements[pOff] = this
    }

    convertToParticle(vel) {
        particles.push(new Particle(this, vel))
        getChunk(this.x, this.y).elements[getElementPos(this.x, this.y)] = undefined
    }
}

// Solid
class Solid extends Element {
    constructor(x, y) {
        super(x, y)
    }

    diagonalMove(dir, recur) {
        let p = getPartical(this.x + dir, this.y + 1)

        if (!p) {
            this.move(this.x + dir, this.y + 1)
            return true
        } else if (p instanceof Liquid) {
            this.switch(this.x + dir, this.y + 1)
            return true
        }

        return recur && this.diagonalMove(-dir, false)
    }

    step() {
        let down = getPartical(this.x, this.y + 1)
        if (!down) {
            this.move(this.x, this.y + 1)
            return true
        } else if (down instanceof Liquid) {
            this.switch(this.x, this.y + 1)
            return true
        }

        return this.diagonalMove(Math.random() > 0.5 ? 1 : -1, true)
    }
}

class ImmovableSolid extends Solid {
    constructor(x, y) {
        super(x, y)
        this.colData = [30, 30, 30]
    }
}

class Sand extends Solid {
    constructor(x, y) {
        super(x, y)
        this.colData = [194, 178, 128]
    }
}

// Liquid
// When it cant move down chance to become particle with positive y velocity
class Liquid extends Element {
    constructor(x, y, dispertionRate) {
        super(x, y)
        this.dispertionRate = dispertionRate
    }
    sideMove(dir, recur) {
        let lastX
        let maxMove = ~~(Math.random() * this.dispertionRate + 1)
        for (let i = 1; i <= maxMove; i++) {
            let newX = this.x + dir * i
            let p = getElementAtCell(newX, this.y)
            if (!p) lastX = newX
        }

        if (lastX === undefined) return recur && this.sideMove(-dir, false)

        this.move(lastX, this.y)
        return true
    }

    step() {
        let down = getElementAtCell(this.x, this.y + 1)

        if (!down) {
            this.move(this.x, this.y + 1)
            return true
        }

        return this.sideMove(Math.random() > 0.5 ? 1 : -1, true)
    }
}

class Water extends Liquid {
    constructor(x, y) {
        super(x, y, 5)
        this.colData = [20, 20, 230]
    }
}

// Gas
class Gas extends Element {
    constructor(x, y) {
        super(x, y)
    }
}














// Functions
function getElementAtCell(x, y) {
    let chunk = getChunk(x, y)
    if (!chunk) return new ImmovableSolid()
    return chunk.elements[getElementPos(x, y)]
}

function getChunk(x, y) {
    let cx = x / CHUNKSIZE
    let cy = y / CHUNKSIZE
    if (x < 0) {
        cx = Math.floor(cx)
    }
    else cx = ~~cx
    if (y < 0) cy = Math.floor(cy)
    else cy = ~~cy
    return chunks[`${cx},${cy}`]
}

function getElementPos(x, y) {
    return mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE
}

function mod(n, base) {
    return ((n % base) + base) % base // Only positive
}

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
                case 1:
                    partical = new Sand()
                    break
                case 2:
                    partical = new Water()
                    break
            }
            partical.x = x
            partical.y = y

            chunk.elements[pos] = partical
            chunk.hasUpdatedFrameBuffer = false
            chunk.updateNextFrame = true
        }
    }    
}

setTimeout(console.clear, 500)