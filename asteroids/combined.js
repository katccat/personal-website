'use strict';
function Entity(x = game_width / 2, y = game_height / 2, shape, rad = 14, collisions = []) {
	entities.push(this);
	if (collisions.length > 0) {
		this.can_collide = true;
	}
	if (shape !== undefined) {
		this.points = shapes(shape, rad);
	}
	this.loc = {x: x, y: y};
	this.rad = rad;

	this.resize = function(factor) {
		this.rad *= factor;
		for (let i = this.points.length - 1; i >= 0; i--) {
			this.points[i].x *= factor;
			this.points[i].y *= factor;
		}
	};

	this.collision_legal = function(actor) {
		if (actor === this) {
			return false;
		}
		let name = actor.constructor.name;
		for (let i = collisions.length - 1; i >= 0; i--) {
			if (collisions[i] === name) {
				return true;
			}
		}
		return false;
	};

	this.on_hit = function() {
		this.expire = true;
	};

	this.dupe = function() {
		return;
	};

	this.update = function() {
		draw.call(this);
	};
}

function All_X() {
	this.initialize = function() {
		this.list = [];
		this.count = this.list.length;
	};
	this.add = function(instance) {
		this.list.push(instance);
		this.count++;
	};
	this.remove = function(instance) {
		this.list.splice(this.list.indexOf(instance), 1);
		this.count--;
	};
	this.first = function() {
		return this.list[0] || {loc: {x: 0, y: 0}};
	};
	this.near = function(loc) {
		let closest;
		let shortest_distance = 9999;
		for (let i = 0; i < this.count; i++) {
			let instance = this.list[i];
			let difference_x = instance.loc.x - loc.x;
			let difference_y = instance.loc.y - loc.y;
			let current_distance = Math.sqrt(difference_x * difference_x + difference_y * difference_y);
			if (current_distance < shortest_distance) {
				shortest_distance = current_distance;
				closest = instance;
			}
		}
		return closest || {loc: {x: 0, y: 0}};
	};
}

function wrap_around() {
	if (this.loc.x > game_width + this.rad) {
		this.loc.x -= game_width + this.rad * 2;
	}
	else if (this.loc.x < -this.rad) {
		this.loc.x += game_width + this.rad * 2;
	}
	if (this.loc.y > game_height + this.rad) {
		this.loc.y -= game_height + this.rad * 2;
	}
	else if (this.loc.y < -this.rad) {
		this.loc.y += game_height + this.rad * 2;
	}
}

function draw(color = bg.strokeStyle, width = bg.lineWidth, points = this.points, do_wrap_around = true) {
	if (do_wrap_around === true) wrap_around.call(this);
	// color and width are changed
	let old_weight = bg.lineWidth;
	bg.lineWidth = width;
	bg.strokeStyle = bg.fillStyle = color;
	// drawing begins
	bg.beginPath();
	// first points are set in relation to the moving origin
	bg.moveTo(points[0].x + this.loc.x, points[0].y + this.loc.y);
	for (let i = 1; i < points.length; i++) {
		bg.lineTo(points[i].x + this.loc.x, points[i].y + this.loc.y);
	}
	bg.closePath();
	bg.stroke();
	bg.lineWidth = old_weight;
}

function rotate(rot, sine = Math.sin(rot), cosine = Math.cos(rot)) {
	for (let i = this.points.length - 1; i >= 0; i--) {
		let tempX = this.points[i].x * cosine - this.points[i].y * sine;
		let tempY = this.points[i].x * sine + this.points[i].y * cosine;
		this.points[i].x = tempX;
		this.points[i].y = tempY;
	}
}

function shapes(shape = "square", rad) {
    const definitions = {
        "square": [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]],
        "arrow": [
            [0, 1],
            [-4/7, -1],
            [0, -4/7],
            [4/7, -1]],
        "triangle": [
        	[-1, -0.866],
        	[0, 0.866],
        	[1, -0.866],
        	[0, -0.5]],
        "bullet": [
            [0, -1],
            [0, 1]],
        "disc": [
        	[-1, 0],
        	[1, 0]],
        "cherry": [
            [-0.5, -0.25],
            [0.75, 0.75],
            [0.75, 1],
            [0.75, -0.25],
            [-0.75, -0.25],
            [-0.75, -1],
            [0, -1],
            [0, -0.25],
            [0.25, -0.25],
            [0.25, -1],
            [1, -1],
            [1, -0.25]],
        "ufo": [
            [-0.5, -0.7],
            [0.5, -0.7],
            [1, -0.4],
            [-1, -0.4],
            [1.2, -0.4],
            [1.2, -0.1],
            [-1.2, -0.1],
            [-1.2, -0.4],
            [1, -0.1],
            [0.5, 0.2],
            [-0.5, 0.2],
            [-1, -0.1],
            [0.5, 0.2],
            [0.25, 0.7],
            [-0.25, 0.7],
            [-0.5, 0.2]],
         "smile": [
        	[0.4, -1],
        	[1, -0.4],
        	[1, 0.4],
        	[0.4, 1],
        	[-0.4, 1],
        	[-1, 0.4],
        	[-1, -0.4],
        	[-0.4, -1],
        	[-0.5, -0.4],
        	[-0.3, -0.6],
        	[0.3, -0.6],
        	[0.5, -0.4],
        	[-0.3, 0.1],
        	[-0.3, 0.3],
        	[0.3, 0.1],
        	[0.3, 0.3],
        	[1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]],
        0: [
            [1, 0.3],
            [0.4, 1],
            [-0.3, 1],
            [-1, 0.2],
            [-0.4, 0],
            [-1, -0.3],
            [-0.5, -1],
            [0, -0.3],
            [0, -1],
            [0, -1],
            [0, -1],
            [0.6, -1],
            [1, -0.4]],
        1: [
            [-0.5, -1],
            [-1, -0.6],
            [-1, 0.4],
            [-0.5, 1],
            [0, 0.6],
            [0.5, 1],
            [1, 0.4],
            [0.7, -0.1],
            [1, -0.6],
            [0.4, -1]],
        2: [
            [-1, 0.4],
            [-1, -0.3],
            [-0.5, -1],
            [0.2, -0.8],
            [0.4, -1],
            [1, -0.5],
            [0.3, 0.1],
            [1, 0.3],
            [1, 0.6],
            [0.2, 1],
            [-0.7, 1],
            [-0.3, 0.4]]
    };

    return definitions[shape].map(coord => ({
    	x: coord[0] * rad,
    	y: coord[1] * -rad
    }));
}
// objects.js
const All_Asteroids = new function() {
    this.max = 48;
    All_X.call(this);
};

const All_Ufos = new function() {
    this.size = 12;
    All_X.call(this);
};

const All_Satellites = new function() {
    this.size = 6.5;
    All_X.call(this);
};

const All_Ships = new function() {
    All_X.call(this);
    const turn_speed = 0.065;
    const turn_speed_sine = Math.sin(turn_speed);
    const turn_speed_cosine = Math.cos(turn_speed);
    const turn_speed_sine2 = Math.sin(-turn_speed);
    const turn_speed_cosine2 = Math.cos(-turn_speed);
    const accel = 0.12;
    this.initialize = function() {
        this.points = shapes("arrow", 6, 0, 0);
        this.rot = 0;
        this.sine = 0;
        this.cosine = 1;
        this.acceleration = {};
        this.list = [];
        this.count = 0;
    };
    this.update = function() {
        if (turn_right === true && turn_left === false) {
            this.rot += turn_speed;
            this.sine = Math.sin(this.rot);
            this.cosine = Math.cos(this.rot);
            rotate.call(this, undefined, turn_speed_sine, turn_speed_cosine);
        }
        else if (turn_left === true && turn_right === false) {
            this.rot -= turn_speed;
            this.sine = Math.sin(this.rot);
            this.cosine = Math.cos(this.rot);
            rotate.call(this, undefined, turn_speed_sine2, turn_speed_cosine2);
        }
        if (thrust === true) {
            this.acceleration.x = accel * this.sine;
            this.acceleration.y = -accel * this.cosine;
        }
        else {
            this.acceleration.x = 0;
            this.acceleration.y = 0;
        }
    };
};

function Ship(x = game_width / 2, y = game_height / 2, velocityX = 0, velocityY = 0, rad = 6) {
    Entity.call(this, x, y, undefined, rad, ["Asteroid", "EnemyBullet", "Satellite", "Ufo", "Satellite_Array"]);
    All_Ships.add(this);
    const deaccel = 0.998;
    const immunity_buffer = frame + 60;
    const color = [mustard, blue, pink][~~(Math.random() * 3)];
    this.on_hit = function() {
        if (frame >= immunity_buffer) {
            this.expire = true;
            All_Ships.remove(this);
            if (All_Ships.count > 0) {
                explode(this.loc.x, this.loc.y, color, this.rad);
            }
            else {
                explode(this.loc.x, this.loc.y, color, undefined, 180);
            }
        }
    };
    this.dupe = function() {
        new Ship(this.loc.x, this.loc.y, velocityX * 0.98, velocityY * 0.98, this.rad);
        return true;
    };
    this.update = function() {
        velocityX += All_Ships.acceleration.x;
        velocityY += All_Ships.acceleration.y;
        if (thrust === false && Math.abs(velocityX) + Math.abs(velocityY) > 0) {
            velocityX *= deaccel;
            velocityY *= deaccel;
            if (Math.abs(velocityX) < 0.02) velocityX = 0;
            if (Math.abs(velocityY) < 0.02) velocityY = 0;
        }
        if (shoot === true) {
            new Bullet(this.loc.x, this.loc.y, All_Ships.rot, All_Ships.sine, All_Ships.cosine, velocityX, velocityY, undefined, 2, color, this);
        }
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        if (frame >= immunity_buffer || frame % 4 === 0) {
            if (thrust === true) {
                draw.call(this, "#ff4d0d", undefined, All_Ships.points);
            }
            else {
                draw.call(this, color, undefined, All_Ships.points);
            }
        }
    };
}

function Asteroid(x, y, rad = All_Asteroids.max, lives = 4, velocity = 1, rot, sine = Math.sin(rot), cosine = Math.cos(rot)) {
    if (asteroids_can_collide === false) {
        Entity.call(this, x, y, ~~(Math.random() * 3), rad, ["Bullet", "EnemyBullet"]);
    }
    else {
        Entity.call(this, x, y, ~~(Math.random() * 3), rad, ["Asteroid", "Bullet", "EnemyBullet"]);
    }
    All_Asteroids.add(this);
    var velocityX = velocity * sine;
    var velocityY = velocity * -cosine;
    {
        let spin = Math.random() * 0.2 - 0.1;
        var spin_sine = Math.sin(spin);
        var spin_cosine = Math.cos(spin);
    }
    const color = teal;
    const speed_up = 1.3;
    this.rot = rot;
    this.lives = lives; // do not remove
    this.on_hit = function(actor) {
        explode(this.loc.x, this.loc.y, color, this.rad);
        let actor_name = actor.constructor.name;
        if (actor_name === "Bullet") {
            actor.expire = true;
            score_points(50 - this.rad);
        }
        if (this.lives <= 1) {
            All_Asteroids.remove(this);
            this.expire = true;
            return;
        }
        this.lives--;
        this.resize(0.5);
        velocity *= speed_up;

        let rot_90 = actor.rot + Math.PI/2;
        let sine_90 = Math.sin(rot_90);
        let cosine_90 = Math.cos(rot_90);

        let rot_n90 = actor.rot - Math.PI/2;
        let sine_n90 = Math.sin(rot_n90);
        let cosine_n90 = Math.cos(rot_n90);

        if (actor_name === "Bullet") { // split asteroids move 150 and -150 degrees of actor
            let sibling_rot = actor.rot + 5 * Math.PI/6;
            let sibling_sine = Math.sin(sibling_rot);
            let sibling_cosine = Math.cos(sibling_rot);
            new Asteroid(this.loc.x + sine_90 * this.rad, this.loc.y - cosine_90 * this.rad, this.rad, this.lives, velocity, sibling_rot, sibling_sine, sibling_cosine);

            this.rot = actor.rot - 5 * Math.PI/6;
            sine = Math.sin(this.rot);
            cosine = Math.cos(this.rot);
        }
        else { // split asteroids move exactly perpendicular of actor
            new Asteroid(this.loc.x + sine_90 * this.rad, this.loc.y - cosine_90 * this.rad, this.rad, this.lives, velocity, rot_90, sine_90, cosine_90);

            this.rot = rot_n90;
            sine = sine_n90;
            cosine = cosine_n90;
        }
        this.loc.x += sine_n90 * this.rad;
        this.loc.y -= cosine_n90 * this.rad;
        velocityX = velocity * sine;
        velocityY = velocity * -cosine;
    };
    this.update = function() {
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        rotate.call(this, undefined, spin_sine, spin_cosine);
        draw.call(this, color);
    };
}

function Bullet(x, y, rot, sine = Math.sin(rot), cosine = Math.cos(rot), relativeX = 0, relativeY = 0, rad = 4, offset = 0, color = bg.strokeStyle, originator) {
    Entity.call(this, x + sine * offset, y - cosine * offset, "bullet", rad, ["Satellite_Array"]);
    const velocityX = 14 * sine + relativeX;
    const velocityY = -14 * cosine + relativeY;
    const lifespan = frame + 16;
    this.rot = rot;
    rotate.call(this, undefined, sine, cosine);
    this.dupe = function() {
        if (originator && originator.expire !== true) {
            originator.dupe();
            return true;
        }
    };
    this.update = function() {
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        draw.call(this, color, 1.5);
        if (frame >= lifespan) this.expire = true;
    };
}

function EnemyBullet(x, y, rot, sine = Math.sin(rot), cosine = Math.cos(rot), relativeX = 0, relativeY = 0, rad = 4, offset = 0, color = bg.strokeStyle) {
    Entity.call(this, x + sine * offset, y - cosine * offset, "disc", rad, ["Asteroid", "Ship"]);
    const velocityX = 11.5 * sine + relativeX;
    const velocityY = -11.5 * cosine + relativeY;
    this.rot = rot;
    const lifespan = frame + 15;
    rotate.call(this, undefined, sine, cosine);
    this.update = function() {
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        draw.call(this, color, 1.5);
        if (frame >= lifespan) this.expire = true;
    };
}

function explode(x, y, color, rad, duration, uniform, extra = false) {
    // predefined duration & scaled speed
    var particle_size;
    if (rad <= 10) {
        particle_size = 1.1;
    }
    else if (rad <= 20) {
        particle_size = 1.2;
    }
    else {
        particle_size = 1.4;
    }
    new Particle(x, y, 0, 1, color, rad, duration, uniform, particle_size); // 0 or 8pi/4
    new Particle(x, y, 0.7071067811865475, 0.7071067811865476, color, rad, duration, uniform, particle_size); // pi/4
    new Particle(x, y, 1, 6.123233995736766e-17, color, rad, duration, uniform, particle_size); // 2pi/4
    new Particle(x, y, 0.7071067811865476, -0.7071067811865475, color, rad, duration, uniform, particle_size); // 3pi/4
    new Particle(x, y, 1.2246467991473532e-16, -1, color, rad, duration, uniform, particle_size); // 4pi/4
    new Particle(x, y, -0.7071067811865475, -0.7071067811865477, color, rad, duration, uniform, particle_size); // 5pi/4
    new Particle(x, y, -1, -1.8369701987210297e-16, color, rad, duration, uniform, particle_size); // 6pi/4
    new Particle(x, y, -0.7071067811865477, 0.7071067811865474, color, rad, duration, uniform, particle_size); // 7pi/4
    if (extra === true) {
        new Particle(x, y, 0.3826834323650898, 0.9238795325112867, color, rad, duration, uniform, particle_size); // 1pi/8
        new Particle(x, y, 0.9238795325112867, 0.38268343236508984, color, rad, duration, uniform, particle_size); // 3pi/8
        new Particle(x, y, 0.9238795325112867, -0.3826834323650897, color, rad, duration, uniform, particle_size); // 5pi/8
        new Particle(x, y, 0.3826834323650899, -0.9238795325112867, color, rad, duration, uniform, particle_size); // 7pi/8
        new Particle(x, y, -0.38268343236508967, -0.9238795325112868, color, rad, duration, uniform, particle_size); // 9pi/8
        new Particle(x, y, -0.9238795325112865, -0.38268343236509034, color, rad, duration, uniform, particle_size); // 11pi/8
        new Particle(x, y, -0.9238795325112866, 0.38268343236509, color, rad, duration, uniform, particle_size); // 13pi/8
        new Particle(x, y, -0.3826834323650904, 0.9238795325112865, color, rad, duration, uniform, particle_size); // 15pi/8
    }
}

function Particle(x, y, sine, cosine, color = bg.strokeStyle, rad = 45, duration = 18, uniform = false, particle_size) {
    entities.push(this);
    this.loc = {x: x, y: y};
    const speed = (uniform === true) ? rad/8 : Math.random() * (rad/9);
    const velocityX = speed * sine;
    const velocityY = -speed * cosine;
    const lifespan = frame + duration;
    this.update = function() {
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        bg.beginPath();
        bg.strokeStyle = bg.fillStyle = color;
        bg.arc(this.loc.x, this.loc.y, particle_size, 0, 2 * Math.PI);
        bg.closePath();
        bg.fill();
        if (frame >= lifespan) this.expire = true;
    };
}

function Cherry(x, y) {
    if (shootable_cherries === false) {
        Entity.call(this, x, y, "cherry", 14, ["Ship"]);
    }
    else {
        Entity.call(this, x, y, "cherry", 14, ["Ship", "Bullet"]);
    }
    cherries++;
    const inception = frame;
    const lifespan = frame + 420;
    const strobe_buffer = 32;
    const color = red;
    const spin = 0.01;
    const spin_sine = Math.sin(spin);
    const spin_cosine = Math.cos(spin);
    this.update = function() {
        rotate.call(this, undefined, spin_sine, spin_cosine);
        wrap_around.call(this);
        if ((frame >= inception + strobe_buffer && frame <= lifespan - strobe_buffer) || frame % 4 === 0) {
            bg.strokeStyle = bg.fillStyle = color;
            bg.beginPath();
            // first points are set in relation to the moving origin
            bg.moveTo(this.points[0].x+this.loc.x, this.points[0].y+this.loc.y);
            for (let i = 1; i <= 3; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 4; i <= 7; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.closePath();
            bg.fill();
            bg.beginPath();
            for (let i = 8; i < this.points.length; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.closePath();
            bg.fill();
        }
        if (frame >= lifespan) {
            this.expire = true;
            cherries--;
        }
    };
    this.on_hit = function(actor) {
        if (actor.dupe() === true) {
            explode(this.loc.x, this.loc.y, color, this.rad, undefined, true, true);
            this.expire = true;
            cherries--;
        }
    };
}

function Ufo(x, y, velocityX=0, velocityY=0) {
    Entity.call(this, x, y, "ufo", All_Ufos.size, ["Asteroid", "Bullet", "Ship", "Ufo"]);
    All_Ufos.add(this);
    this.rot = 0;
    var sine = 0;
    var cosine = 1;
    var color;
    const accel = 0.1;
    const deaccel = 0.96;
    const terminal = 3;
    var interval = 0;
    const inception = frame;
    const seed = ~~(Math.random() * 100);
    const min_distance = 150;
    const max_distance = 280;
    const threshold = 4;
    const wait = 60;
    var target;
    this.update = function() {
        if (!target || target.expire === true || frame % 120 === 0) {
            let ships = All_Ships.count;
            if (ships > 0 && (ships >= threshold - level || aggressive_ufos === true || All_Asteroids.count < 1)) {
                target = All_Ships.first();
            }
            else {
                target = All_Asteroids.near(this.loc);
            }
        }
        if (target.constructor.name === "Ship") {
            color = random_color();
        }
        else {
            color = alien_gray;
        }

        //let distance = Math.sqrt(Math.pow(target.loc.x - this.loc.x, 2) + Math.pow(target.loc.y - this.loc.y, 2));
        let distance = Math.abs(target.loc.x - this.loc.x) + Math.abs(target.loc.y - this.loc.y);
        this.rot = Math.atan2(target.loc.y - this.loc.y, target.loc.x - this.loc.x) + Math.PI/2;

        if (frame >= inception + wait && distance < max_distance && (frame + seed) % wait === 0) {
            interval = 0;
        }

        if (interval < 20 && interval % 5 === 0) {
            sine = Math.sin(this.rot);
            cosine = Math.cos(this.rot);
            new EnemyBullet(this.loc.x, this.loc.y, this.rot, sine, cosine, velocityX, velocityY, undefined, 9, color);
        }
        else if (distance > min_distance) {
            sine = Math.sin(this.rot);
            cosine = Math.cos(this.rot);
        }
        interval += (interval < 20) ? 1 : 0;

        if (distance > min_distance) {
            velocityX += sine * accel;
            velocityY -= cosine * accel;
            let velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            if (velocity >= terminal) {
                velocityX *= terminal / velocity;
                velocityY *= terminal / velocity;
            }
        }
        else if (Math.abs(velocityX) + Math.abs(velocityY) > 0) {
            velocityX *= deaccel;
            velocityY *= deaccel;
            if (Math.abs(velocityX) < 0.02) velocityX = 0;
            if (Math.abs(velocityY) < 0.02) velocityY = 0;
        }

        this.loc.x += velocityX;
        this.loc.y += velocityY;

        wrap_around.call(this);
        bg.strokeStyle = bg.fillStyle = color;
        bg.beginPath();
        // first points are set in relation to the moving origin
        bg.moveTo(this.points[0].x+this.loc.x, this.points[0].y+this.loc.y);
        for (let i = 1; i <= 3; i++) {
            bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
        }
        bg.closePath();
        bg.stroke();
        bg.beginPath();
        for (let i = 4; i <= 7; i++) {
            bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
        }
        bg.closePath();
        bg.fill();
        bg.beginPath();
        for (let i = 8; i <= 11; i++) {
            bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
        }
        bg.closePath();
        bg.stroke();
        bg.beginPath();
        for (let i = 12; i <= 15; i++) {
            bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
        }
        bg.closePath();
        bg.stroke();
    };
    this.on_hit = function(actor) {
        explode(this.loc.x, this.loc.y, alien_gray, undefined, 180);
        if (actor.constructor.name === "Bullet") {
            actor.expire = true;
            score_points(100);
        }
        All_Ufos.remove(this);
        this.expire = true;
    };
}

function Jailed_Ally(x, y) {
    Entity.call(this, x, y, "smile", 14, ["Ship", "Bullet"]);
    allies++;
    const inception = frame;
    const lifespan = frame + 480;
    const strobe_buffer = 32;
    const color = mustard;
    this.update = function() {
        wrap_around.call(this);
        if ((frame >= inception + strobe_buffer && frame <= lifespan - strobe_buffer) || frame % 4 === 0) {
            bg.strokeStyle = bg.fillStyle = color;
            bg.beginPath();
            // first points are set in relation to the moving origin
            bg.moveTo(this.points[0].x+this.loc.x, this.points[0].y+this.loc.y);
            for (let i = 1; i <= 7; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.closePath();
            bg.stroke();
            bg.beginPath();
            for (let i = 8; i <= 11; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 12; i <= 13; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 14; i <= 15; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 16; i <= 19; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.closePath();
            bg.stroke();
        }
        if (frame >= lifespan) {
            this.expire = true;
            allies--;
        }
    };
    this.on_hit = function(actor) {
        explode(this.loc.x, this.loc.y, color, this.rad, 60, true, true);
        score_points(77);
        new Ally(this.loc.x, this.loc.y);
        this.expire = true;
        allies--;
    };
}
function Ally(x, y, velocityX=0, velocityY=0) {
    Entity.call(this, x, y, "smile", 14, ["Asteroid", "Ufo", "Satellite", "EnemyBullet"]);
    allies++;
    this.rot = 0;
    var sine = 0;
    var cosine = 1;
    var color;
    const accel = 0.1;
    const deaccel = 0.96;
    const terminal = 3;
    var interval = 0;
    const min_distance = 150;
    const max_distance = 280;
    var target;
    const lifespan = frame + 1200;
    this.update = function() {
        color = random_color();
        if (!target || target.expire === true || frame % 120 === 0) {
            if (All_Ufos.count > 0) {
                target = All_Ufos.first();
            }
            else if (All_Satellites.count > 0) {
                target = All_Satellites.near(this.loc);
            }
            else {
                target = All_Asteroids.near(this.loc);
            }
        }
        //let distance = Math.sqrt(Math.pow(target.loc.x-this.loc.x, 2) + Math.pow(target.loc.y-this.loc.y, 2));
        let distance = Math.abs(target.loc.x - this.loc.x) + Math.abs(target.loc.y - this.loc.y);
        this.rot = Math.atan2(target.loc.y - this.loc.y, target.loc.x - this.loc.x) + Math.PI/2;
        if (distance < max_distance && frame % 60 === 0) {
            interval = 0;
        }
        if (interval < 20 && interval % 5 === 0) {
            sine = Math.sin(this.rot);
            cosine = Math.cos(this.rot);
            new Bullet(this.loc.x, this.loc.y, this.rot, sine, cosine, velocityX, velocityY, 4, 9, color);
        }
        else if (distance > min_distance) {
            sine = Math.sin(this.rot);
            cosine = Math.cos(this.rot);
        }
        interval += (interval < 20) ? 1 : 0;
        if (distance > min_distance) {
            velocityX += sine * accel;
            velocityY -= cosine * accel;
            let velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            if (velocity >= terminal) {
                velocityX *= terminal / velocity;
                velocityY *= terminal / velocity;
            }
        }
        else if (Math.abs(velocityX) + Math.abs(velocityY) > 0) {
            velocityX *= deaccel;
            velocityY *= deaccel;
            if (Math.abs(velocityX) < 0.02) velocityX = 0;
            if (Math.abs(velocityY) < 0.02) velocityY = 0;
        }
        this.loc.x += velocityX;
        this.loc.y += velocityY;
        wrap_around.call(this);
        if (frame <= lifespan - 40 || frame % 4 === 0) {
            bg.strokeStyle = bg.fillStyle = color;
            bg.beginPath();
            // first points are set in relation to the moving origin
            bg.moveTo(this.points[0].x+this.loc.x, this.points[0].y+this.loc.y);
            for (let i = 1; i <= 7; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.closePath();
            bg.stroke();
            bg.beginPath();
            for (let i = 8; i <= 11; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 12; i <= 13; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
            bg.beginPath();
            for (let i = 14; i <= 15; i++) {
                bg.lineTo(this.points[i].x+this.loc.x,this.points[i].y+this.loc.y);
            }
            bg.stroke();
        }
        if (frame >= lifespan) this.on_hit();
    };
        this.on_hit = function() {
            explode(this.loc.x, this.loc.y, mustard, this.rad);
            this.expire = true;
            allies--;
        };
}

function Satellite_Array(x, y, rad = All_Satellites.size * 2) {
    Entity.call(this, x, y, undefined, rad + 5, ["Asteroid", "Bullet", "Ship", "Ufo", "EnemyBullet"]);
    satellite_arrays++;
    const speed = 1;
    {
        let rot = Math.random() * Math.PI * 2;
        var sine = Math.sin(rot);
        var cosine = Math.cos(rot);
    }
    var s1 = new Satellite(x, y, rad / 2);
    var s2 = new Satellite(x, y, rad / 2, 180 * Math.PI/180);
    var s3 = new Satellite(x, y, rad / 2, 120 * Math.PI/180);
    var s4 = new Satellite(x, y, rad / 2, 300 * Math.PI/180);
    var s5 = new Satellite(x, y, rad / 2, 240 * Math.PI/180);
    var s6 = new Satellite(x, y, rad / 2, 60 * Math.PI/180);
    this.update = function() {
        this.loc.x += speed * sine;
        this.loc.y += speed * cosine;
        wrap_around.call(this);

        s1.loc.x = this.loc.x + rad * 0.5;
        s1.loc.y = this.loc.y - rad * 0.5;

        s2.loc.x = this.loc.x + rad * 0.5;
        s2.loc.y = this.loc.y + rad * 0.5;

        s3.loc.x = this.loc.x;
        s3.loc.y = this.loc.y + rad * 0.75;

        s4.loc.x = this.loc.x - rad * 5 / 6;
        s4.loc.y = this.loc.y + rad * 0.275;

        s5.loc.x = this.loc.x - rad * 5 / 6;
        s5.loc.y = this.loc.y - rad * 0.275;

        s6.loc.x = this.loc.x;
        s6.loc.y = this.loc.y - rad * 0.75;
    };
    this.on_hit = function() {
        explode(this.loc.x, this.loc.y, alien_green, this.rad);
        s1.moving = true;
        s2.moving = true;
        s3.moving = true;
        s4.moving = true;
        s5.moving = true;
        s6.moving = true;
        this.expire = true;
        satellite_arrays--;
    };
}

function Satellite(x, y, rad, rot = 0, moving = false) {
    Entity.call(this, x, y, "triangle", rad, ["Bullet", "Ship", "Ally"]);
    All_Satellites.add(this);
    this.rot = rot;
    this.moving = moving;
    rotate.call(this, rot);
    var color = alien_green;
    const accel = 0.1;
    const terminal = 3;
    var velocityX = 0;
    var velocityY = 0;
    var target;
    const turn_speed = 0.06;
    const turn_speed_sine = Math.sin(turn_speed);
    const turn_speed_cosine = Math.cos(turn_speed);
    const turn_speed_sine2 = Math.sin(-turn_speed);
    const turn_speed_cosine2 = Math.cos(-turn_speed);
    this.update = function() {
        if (this.moving === true) {
            if (!target || target.expire) target = All_Ships.first();
            let terminal_side = Math.atan2(target.loc.y - this.loc.y, target.loc.x - this.loc.x) + Math.PI/2;
            if (satellite_accuracy === true) {
                let coterminal1 = (terminal_side - this.rot) % (2 * Math.PI);
                let coterminal2 = (coterminal1 >= 0) ? coterminal1 - 2 * Math.PI : coterminal1 + 2 * Math.PI; // if positive, subtracts 360. if negative, adds 360
                let shortest_path = (Math.abs(coterminal1) <= Math.abs(coterminal2)) ? coterminal1 : coterminal2;

                if (shortest_path > 0) {
                    this.rot += turn_speed;
                    rotate.call(this, undefined, turn_speed_sine, turn_speed_cosine);
                }
                else if (shortest_path < 0) {
                    this.rot -= turn_speed;
                    rotate.call(this, undefined, turn_speed_sine2, turn_speed_cosine2);
                }
            }
            else {
                if (this.rot < terminal_side) {
                    this.rot += turn_speed;
                    rotate.call(this, undefined, turn_speed_sine, turn_speed_cosine);
                }
                else if (this.rot > terminal_side) {
                    this.rot -= turn_speed;
                    rotate.call(this, undefined, turn_speed_sine2, turn_speed_cosine2);
                }
            }
            if (fast_satellites === false) {
                velocityX += Math.sin(this.rot) * accel;
                velocityY -= Math.cos(this.rot) * accel;
                let velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                if (velocity >= terminal) {
                    velocityX *= terminal / velocity;
                    velocityY *= terminal / velocity;
                }
            }
            else {
                velocityX = Math.sin(this.rot) * terminal;
                velocityY = -Math.cos(this.rot) * terminal;
            }
            this.loc.x += velocityX;
            this.loc.y += velocityY;
            draw.call(this, color, 1.5);
        }
        else {
            draw.call(this, color, 1.5, undefined, false);
        }
    };
    this.on_hit = function(actor) {
        if (this.moving === true) {
            explode(this.loc.x, this.loc.y, color, this.rad);
            if (actor.constructor.name === "Bullet") {
                actor.expire = true;
                score_points(50);
            }
            this.expire = true;
            All_Satellites.remove(this);
        }
    };
}
// main.js
// initialization
const bg = document.getElementById('back').getContext('2d', {alpha: false});
bg.strokeStyle = bg.fillStyle = "#ffffff";
bg.lineWidth = 1;
bg.lineJoin = bg.lineCap = "round";
const game_width = 720;
const game_height = 624;//15:13 aspect ratio
{//make game scale up to fill canvas
    let canvas = document.getElementById('back');
    bg.scale(canvas.width / game_width, canvas.height / game_height);
}
const frame_interval = 1000 / 60;
//const score_display = document.getElementById('score');
//const paused_display = document.getElementById('paused');
//const highscore = document.getElementById('highscore');
//if (!localStorage.highscore) localStorage.highscore = 0;
//highscore.innerHTML = "Highscore: " + localStorage.highscore;
// colors
const mustard = "#fcc921";
const red = "#ff0000";
const blue = "#16d9f2";
const pink = "#ff80bb";
const teal = "#a8f7e1";
const alien_gray = "#f5f5f5";
const alien_green = "#77ff75";
const random_colors = [mustard, alien_green, red, blue, pink];
function random_color() {
    return random_colors[~~(Math.random() * 5)];
}
// user settings
var throttle;
var asteroids_can_collide = false;
var shootable_cherries = false;
var aggressive_ufos = false;
var fast_satellites = false;
var damon_mode = false;
var disable_highscore = false;
// game settings
var satellite_accuracy = true;
const max_asteroids = 14;
// state variables
var requestID;
var paused = true;
const key = [];

var turn_left = false;
var turn_right = false;
var thrust = false;
var shoot = false;

window.addEventListener('keydown', function(event) {
    switch(event.code) {
        case 'Escape':
        case 'KeyP':
            toggle_pause();
            return;
        case 'KeyR':
            play();
            return;
            /*case 'KeyN':
             *		if (paused) advance();
             *		break;*/
            case 'Space':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault();//prevents page from moving around due to arrow keys
    }
    if (key[event.code] !== false) key[event.code] = true;
});
window.addEventListener('keyup', function(event) {
    delete key[event.code];
});

const entities = [];
var frames_at_last_second;
var last_second;
var frame = 0;
var score;
var level;
var asteroid_cooldown;
var large_asteroid_count;
var cherries;
var allies;
var satellite_arrays;

if (!localStorage.throttle) {
    //paused_display.innerHTML = "Checking refresh rate...";
    window.requestAnimationFrame(set_throttle);
}
else {
    throttle = localStorage.throttle;
    play();
}

var then = 0;
var total_time = 0;
function set_throttle(now) {
    const cycles = 60;
    const cut_off = 30;
    if (frame > cut_off) {
        total_time += now - then;
    }
    then = now;
    if (frame < cycles) {
        frame++;
        window.requestAnimationFrame(set_throttle);
    }
    else {
        console.log(total_time / (cycles - cut_off));
        if (total_time / (cycles - cut_off) < 16.4) {
            throttle = 'true';
            localStorage.throttle = 'true';
        }
        else {
            throttle = 'false';
            localStorage.throttle = 'false';
        }
        //paused_display.innerHTML = "";
        console.log("Throttle = " + throttle);
        then = 0;
        play();
    }
}

function play() {
    All_Ships.initialize();
    All_Asteroids.initialize();
    All_Ufos.initialize();
    All_Satellites.initialize();
    entities.length = 0;

    frames_at_last_second = 0;
    last_second = performance.now();

    frame = 0;
    score = 0;//score_display.innerHTML = 0;
    level = 0;
    asteroid_cooldown = 0;
    large_asteroid_count = 0;
    cherries = 0;
    allies = 0;
    satellite_arrays = 0;

    new Ship();

    if (paused) toggle_pause();
}

function toggle_pause() {
    paused = !paused;
    if (paused === true) {
        //paused_display.innerHTML = "paused";
        window.cancelAnimationFrame(requestID);
    }
    else {
        //paused_display.innerHTML = "";
        if (throttle !== 'true') {
            requestID = window.requestAnimationFrame(refresh);
        }
        else {
            requestID = window.requestAnimationFrame(refresh_with_throttle);
        }
    }
}

function refresh_with_throttle(now) {
    let elapsed = now - then;
    // prevents the framerate from exceeding the limit
    if (elapsed >= frame_interval) {
        advance();
        if (now - last_second >= 1000) {
            //paused_display.innerHTML = frame - frames_at_last_second;
            frames_at_last_second = frame;
            last_second = now;
        }
        then = now - (elapsed % frame_interval);
    }
    requestID = window.requestAnimationFrame(refresh_with_throttle);
}

function refresh(now) {
    advance();
    if (now - last_second >= 1000) {
        //paused_display.innerHTML = frame - frames_at_last_second;
        frames_at_last_second = frame;
        last_second = now;
    }
    requestID = window.requestAnimationFrame(refresh);
}

// when asteroids reaches 0, increment level by 1, spawn asteroids at a step until it reaches level
function advance() {
    bg.clearRect(0, 0, game_width, game_height);
    /*
     *	bg.fillStyle = `rgba(0, 0, 0, 0.52)`;
     *	bg.fillRect(0, 0, game_width, game_height);
     *	bg.fillStyle = bg.strokeStyle;
     */
    // ********************************************************* Asteroids
    if (large_asteroid_count < Math.min(level + 4, max_asteroids) && frame > asteroid_cooldown) {
        let rot = Math.random() * Math.PI * 2;
        let sine = Math.sin(rot);
        let cosine = Math.cos(rot);
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() * game_width;
            y = (Math.random() < 0.5) ? game_height + All_Asteroids.max : -All_Asteroids.max;
        }
        else {
            x = (Math.random() < 0.5) ? game_width + All_Asteroids.max : -All_Asteroids.max;
            y = Math.random() * game_height;
        }
        new Asteroid(x, y, All_Asteroids.max, undefined, Math.random() * 0.3 + 0.9, rot, sine, cosine);
        large_asteroid_count++;
    }
    if (All_Asteroids.count === 0 && large_asteroid_count > 0) {
        large_asteroid_count = 0;
        asteroid_cooldown = frame + 30;
        level++;
        fireworks();
    }
    // ********************************************************* Ufos
    if (frame % Math.max(600 - level * 60, 60) === 0 && frame > 0) {
        if (All_Ufos.count < 3) {
            let x, y;
            if (Math.random() < 0.5) {
                x = Math.random() * game_width;
                y = (Math.random() < 0.5) ? game_height + All_Ufos.size : -All_Ufos.size;
            }
            else {
                x = (Math.random() < 0.5) ? game_width + All_Ufos.size : -All_Ufos.size;
                y = Math.random() * game_height;
            }
            new Ufo(x, y);
        }
    }
    // ********************************************************* Satellites
    if (frame % Math.max(1320 - level * 60, 300) === 0 && frame > 0) {
        if (satellite_arrays < 1 && All_Ships.count > 0) {
            let x, y;
            let size = All_Satellites.size * 2;
            if (Math.random() < 0.5) {
                x = Math.random() * game_width;
                y = (Math.random() < 0.5) ? game_height + size : -size;
            }
            else {
                x = (Math.random() < 0.5) ? game_width + size : -size;
                y = Math.random() * game_height;
            }
            new Satellite_Array(x, y);
        }
    }
    // ********************************************************* Cherries
    if (cherries < 1 && frame % 915 === 0 && frame > 0) {
        new Cherry(Math.random() * game_width, Math.random() * game_height);
    }
    // ********************************************************* Powerup
    if (allies < 1 && frame % 1770 === 0 && frame > 0) {
        new Jailed_Ally(Math.random() * game_width, Math.random() * game_height);
    }
    // ********************************************************* UPDATE
    turn_left = false;
    turn_right = false;
    thrust = false;
    shoot = false;
    if (key.ArrowLeft === true || key.KeyA === true) turn_left = true;
    if (key.ArrowRight === true || key.KeyD === true) turn_right = true;
    if (key.KeyX === true || key.ArrowUp === true || key.KeyW === true) thrust = true;
    if (key.KeyZ === true) {
        shoot = true;
        if (damon_mode === false) key.KeyZ = false;
    }
    if (key.Space === true) {
        shoot = true;
        if (damon_mode === false) key.Space = false;
    }
    All_Ships.update();
    for (let i = 0; i < entities.length; i++) {
        if (entities[i].expire === true) {
            entities.splice(i, 1);
            i--;
        }
        else {
            entities[i].update();
        }
    }
    // ********************************************************* COLLISION
    let length = entities.length;
    for (let subject = length - 1; subject >= 0; subject--) {
        if (entities[subject].can_collide !== true) continue;
        // checks subject against everyone
        for (let i = length - 1; i >= 0; i--) {
            // checks if subject is capable of colliding with actor
            if (entities[subject].collision_legal(entities[i]) === true) {
                let difference_x = entities[subject].loc.x - entities[i].loc.x;
                let difference_y = entities[subject].loc.y - entities[i].loc.y;
                let distance = Math.sqrt(difference_x * difference_x + difference_y * difference_y);
                // checks if they are colliding
                if (distance < entities[subject].rad + entities[i].rad) {
                    //console.log(entities[i].constructor.name + " hits " + entities[subject].constructor.name);
                    entities[subject].on_hit(entities[i]);
                    break;
                }
            }
        }
    }
    frame++;
}

function toggle_me() {
    if (this.style.color === "red") {
        this.style.color = "#03cc00";
    }
    else {
        this.style.color = "red";
    }
}

function score_points(points) {
    score += points;
    //score_display.innerHTML = score;
    if (score > localStorage.highscore && disable_highscore === false) {
        localStorage.highscore = score;
        //highscore.innerHTML = "Highscore: " + score;
    }
}

function fireworks() {
    for (let i = 0; i < 14; i++) {
        explode(Math.random() * game_width, Math.random() * game_height, random_color(), 7, undefined, true);
    }
}
