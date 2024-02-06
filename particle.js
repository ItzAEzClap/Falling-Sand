class Particle {
    constructor(element, vel) {
        this.element = element
        this.x = element.x
        this.y = element.y
        this.colData = element.col
        this.vel = vel || { x: 0, y: 0 }
        this.gravity = 0.1
    }

    move() {
        this.vel.y += this.gravity
        this.x += this.vel.x
        this.y += this.vel.y
    }

    update() {
        this.move()
    }


    convertToElement() {
        particles.splice(particles.indexOf(this))

        this.element.x = this.x
        this.element.y = this.y
        this.element.colData = this.colData

        getChunk(this.x, this.y).elements[getElementPos(this.x, this.y)] = this.element
    }
}

/*
Velocity, 
Affected by gravity
back to element when hit another element
drawX !== x

let drawX = ~~(this.x + 0.5)
*/
/*
Velocity, 
Affected by gravity
back to element when hit another element
drawX !== x

let drawX = ~~(this.x + 0.5)
*/