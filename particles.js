// Base
class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.colData = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    }

    move(newX, newY) {
        let newChunk = getChunk(newX, newY)
        let oldChunk = getChunk(this.x, this.y)
        if (newChunk !== oldChunk) newChunk.hasUpdatedFrameBuffer = false

        newChunk.particles[mod(newX, CHUNKSIZE) + mod(newY, CHUNKSIZE) * CHUNKSIZE] = this
        oldChunk.particles[mod(this.x, CHUNKSIZE) + mod(this.y, CHUNKSIZE) * CHUNKSIZE] = undefined
        this.x = newX
        this.y = newY
    }

    switch(newX, newY) {
        let newChunk = getChunk(newX, newY)
        let oldChunk = getChunk(this.x, this.y)
        let pOff = mod(newX, CHUNKSIZE) + mod(newY, CHUNKSIZE) * CHUNKSIZE

        newChunk.particles[pOff].x = this.x
        newChunk.particles[pOff].y = this.y
        this.x = newX
        this.y = newY

        oldChunk.particles[mod(this.x, CHUNKSIZE) + mod(this.y, CHUNKSIZE) * CHUNKSIZE] = newChunk.particles[pOff]
        newChunk.particles[pOff] = this
    }

}

// Solid
class Solid extends Particle {
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
class Liquid extends Particle {
    constructor(x, y, dispertionRate) {
        super(x, y)
        this.dispertionRate = dispertionRate
    }

    sideMove(dir, recur) {
        let lastX
        for (let i = 1; i <= this.dispertionRate; i++) {
            let newX = this.x + dir * i
            let p = getPartical(newX, this.y)
            if (!p) lastX = newX
        }

        if (lastX === undefined) return recur && this.sideMove(-dir, false)

        this.move(lastX, this.y)
        return true
    }

    step() {
        let down = getPartical(this.x, this.y + 1)

        if (down === undefined) {
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















function getPartical(x, y) {
    let chunk = getChunk(x, y)
    if (!chunk) return new ImmovableSolid()
    return chunk.particles[mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE]
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
function mod(n, base) {
    return ((n % base) + base) % base // Only positive
}


setTimeout(console.clear, 500)