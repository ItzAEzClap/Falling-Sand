class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    move(newX, newY) {
        chunks[`${~~(newX / CHUNKSIZE)},${~~(newY / CHUNKSIZE)}`].particles[mod(newX, CHUNKSIZE) + mod(newY, CHUNKSIZE) * CHUNKSIZE] = this
        chunks[`${~~(this.x / CHUNKSIZE)},${~~(this.y / CHUNKSIZE)}`].particles[mod(this.x, CHUNKSIZE) + mod(this.y, CHUNKSIZE) * CHUNKSIZE] = undefined
        this.x = newX
        this.y = newY
    }

    switch(newChunk, newX, newY) {
        chunks[`${this.chunkX},${this.chunkY}`].particles[this.x + this.y * CHUNKSIZE] = newChunk.particles[newX + newY * CHUNKSIZE]
        newChunk.particles[newX + newY * CHUNKSIZE] = this
    }

}

class Solid extends Particle {
    constructor(x, y) {
        super(x, y)
    }

    step() {
        // Down
        let down = getPartical(this.x, this.y + 1)
        //console.log(down)
        if (!down) {
            this.move(this.x, this.y + 1)
            return true
        } else if (down instanceof Liquid) {
            this.switch(this.x, this.y + 1)
            return true
        }

        return false
        console.trace(this.y, coords[2])
        down = coords[0].particles[coords[1] + coords[2] * CHUNKSIZE]

        if (!down) {
            this.move(coords[0], coords[1], coords[2])
            return true
        } else if (down instanceof Liquid) {
            this.switch(coords[0], 0, 1)
            return true
        }
        
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
    let cx = ~~(x / CHUNKSIZE) + (x < 0 ? -1 : 0)
    let cy = ~~(y / CHUNKSIZE) + (y < 0 ? -1 : 0)
    return chunks[`${cx},${cy}`].particles[mod(x, CHUNKSIZE) + mod(y, CHUNKSIZE) * CHUNKSIZE]
}