// 2D chunk
class Chunk {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.updating = true
        this.particles = []
    }

    update() {
        this.particles.forEach(particle => {
            let prevX = particle.x
            let prevY = particle.y
            particle.update()

            if (particle.y > this.y + this.size || particle.y < this.y ||
                particle.x > this.x + this.size || particle.x < this.x) this.particles.splice(this.particles.indexOf(particle))
        })
    }

    draw() {
        this.particles.forEach(particle => particle.draw())

        c.beginPath()
        c.strokeStyle = "red"
        c.lineWidth = 3
        c.rect(this.x * tileWidth, this.y * tileWidth, this.size * tileWidth, this.size * tileWidth)
        c.stroke()
    }
}