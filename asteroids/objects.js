'use strict';
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