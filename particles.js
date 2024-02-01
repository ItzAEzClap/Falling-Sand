class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
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

    switch(newChunk, newX, newY) {
        chunks[`${this.chunkX},${this.chunkY}`].particles[this.x + this.y * CHUNKSIZE] = newChunk.particles[newX + newY * CHUNKSIZE]
        newChunk.particles[newX + newY * CHUNKSIZE] = this
        this.x = newX
        this.y = newY
    }

}

class Solid extends Particle {
    constructor(x, y) {
        super(x, y)
    }

    step() {
        
        // Down
        let down = getPartical(this.x, this.y + 1)
        if (!down) {
            this.move(this.x, this.y + 1)
            return true
        } else if (down instanceof Liquid) {
            //this.switch(this.x, this.y + 1)
            return true
        }
        let dir = Math.random() > 0.5 ? 1 : -1
        let A = getPartical(this.x + dir, this.y + 1)
        let B = getPartical(this.x - dir, this.y + 1)

        if (!A) {
            this.move(this.x + dir, this.y + 1)
            return true
        } else if (A instanceof Liquid) {
            //this.switch(A.x, A.y)
            return true
        } else if (!B) {
            this.move(this.x - dir, this.y + 1)
            return true
        } else if (B instanceof Liquid) {
            return true
        }
        return false
    }
}

class Liquid extends Particle {
    constructor(x, y) {
        super(x, y)
    }
}











class Sand extends Solid {
    constructor(x, y) {
        super(x, y)
        this.colData = [194, 178, 128]
    }
}


class ImmovableSolid extends Solid {
    constructor(x, y) {
        super(x, y)
        this.colData = [30, 30, 30]
    }
}

function getPartical(x, y) {
    let chunk = getChunk(x, y)
    if (!chunk) return new ImmovableSolid()
    return chunk.particles[mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE]
}

function getChunk(x, y) {
    let cx = x < 0 ? Math.ceil(y / CHUNKSIZE) : ~~(x / CHUNKSIZE)
    let cy = y < 0 ? Math.ceil(y / CHUNKSIZE) - 1 : ~~(y / CHUNKSIZE)
    return chunks[`${cx},${cy}`]
}

function sign(n) {
    return n < 0 ? -1 : 1
}

function mod(n, base) {
    return ((n % base) + base) % base // Only positive
}



/*
Positive & 0:
let cx = ~~(x / CHUNKSIZE)
let cy = ~~(y / CHUNKSIZE)
let ix = x % CHUNKSIZE
let iy = y % CHUNKSIZE

Negative:
let cx = ~~(x / CHUNKSIZE) - 1
let cy = ~~(y / CHUNKSIZE) - 1
let ix = x % CHUNKSIZE
let iy = y % CHUNKSIZE
*/

setTimeout(console.clear, 500)