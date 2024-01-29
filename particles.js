class Particle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    move(dx = 0, dy = 0) {
        positions[[`${this.x},${this.y}`]] = undefined
        positions[[`${this.x + dx},${this.y + dy}`]] = this
        this.x += dx
        this.y += dy
    }
}

class Sand extends Particle {
    constructor(x, y) {
        super(x, y)
        this.col = "rgb(194, 178, 128)"
    }

    update() {
        if (this.y + 1 >= rows) return

        let prevX = x
        let prevY = y
        
        if (!positions[`${this.x},${this.y + 1}`]) { // Down
            this.move(0, 1)
        } else { // Left Right
            let dir = Math.random() > 0.5 ? -1 : 1
            let left = positions[`${this.x - dir},${this.y + 1}`]
            let right = positions[`${this.x + dir},${this.y + 1}`]

            if (!left) this.move(-dir, 0)
            else if (!right) this.move(dir, 0)
        }
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.col
        c.fillRect(this.x * tileWidth, this.y * tileWidth, tileWidth, tileWidth)
        c.stroke()
    }
}

