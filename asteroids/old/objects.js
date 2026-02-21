Global_Ship = new function() {
	this.initialize = function() {
		this.points = shapes("arrow", 6, 0, 0);
		this.rot = 0;
		this.sine = 0;
		this.cosine = 1;
		this.acceleration = [];
		this.count = 0;

		this.turnSpeed = 0.08;
		this.accel = 0.15;
	}
}
function Ship(x=game_width/2, y=game_height/2, velocityX=0, velocityY=0, rad=6) {
	Entity.call(this, x, y, undefined, rad,  1, ["Asteroid"]);
	Global_Ship.count++;
	const deaccel = .997;
	const terminal = 8;
	const immunity = 60;
	var color = [orange,blue,pink][Math.floor(Math.random() * 3)];
	var lifetime = 0;
	this.on_hit = function() {
		if (lifetime > immunity) {
			this.lives--;
			let death = new Audio("sounds/help.wav");
			death.play();
			if (this.lives <= 0) {
				this.expire = true;
				Global_Ship.count--;
			}
			else {
				this.points[0].x = game_width/2;
				this.points[0].y = game_height/2;
				velocityX = 0;
				velocityY = 0;
				lifetime = 0;
			}
		}
	}
	this.dupe = function() {
		let gulp = new Audio("sounds/eat.wav");
		gulp.play();
		new Ship(this.points[0].x, this.points[0].y, velocityX*.87, velocityY*.87, this.rad);
	}
	this.update = function() {
		if (key['KeyX']) {
			velocityX += Global_Ship.acceleration['x'];
			velocityY += Global_Ship.acceleration['y'];
			let velocity = Math.sqrt(velocityX*velocityX + velocityY*velocityY);
			if (velocity >= terminal) {
				velocityX *= terminal / velocity;
				velocityY *= terminal / velocity;
			}
		}
		else {
			if (Math.abs(velocityX) + Math.abs(velocityY) > 0) {
				velocityX *= deaccel;
				velocityY *= deaccel;
				if (Math.abs(velocityX) < 0.02) {
					velocityX = 0;
				}
				if (Math.abs(velocityY) < 0.02) {
					velocityY = 0;
				}
			}
		}
		if (key['KeyZ']) {
			new Bullet(this.points[0], Global_Ship.rot, Global_Ship.sine, Global_Ship.cosine, this.rad*1.25, color);
		}
		lifetime++;
		this.points[0].x += velocityX;
		this.points[0].y += velocityY;
		if (lifetime > immunity || lifetime % 4 == 0) {
			drawCopy.call(this, Global_Ship.points, this.rad, color);
		}
	}
}
function Asteroid(x, y, rad, lives=4, velocity=1, rot=0, sine=0, cosine=1) {
	if (asteroids_can_collide == true) {
		Entity.call(this, x, y, Math.floor(Math.random() * 3), rad, lives, ["Bullet", "Asteroid"]);
	}
	else {
		Entity.call(this, x, y, Math.floor(Math.random() * 3), rad, lives, ["Bullet"]);
	}
	asteroids++;
	const velocityX = sine * velocity; 
	const velocityY = -cosine * velocity;
	const spin = Math.random()*0.2-0.1;
	const color = green;//[orange,green,red][Math.floor(Math.random() * 3)];
	this.rot = rot;
	this.on_hit = function(actor) {
		this.expire = true;
		asteroids--;
		let explosion = new Audio();
		switch(this.lives) {
			case 4:
				explosion.src = "sounds/explosions/basslong.wav";
				break;
			case 3:
				explosion.src = "sounds/explosions/bass.wav";
				break;
			case 2:
				explosion.src = "sounds/explosions/bass.wav";
				break;
			case 1:
				explosion.src = "sounds/explosions/tinny.wav";
				explosion.volume = 0.7;
				explosion.play();
				return;
		}
		if (actor.constructor.name == "Bullet") {
			score += 50 - rad;
			stats.innerHTML = score;
			let rot1 = actor.rot+3*Math.PI/4;
			let sine1 = Math.sin(rot1);
			let cosine1 = Math.cos(rot1);
			let rot2 = actor.rot-3*Math.PI/4
			let sine2 = Math.sin(rot2);
			let cosine2 = Math.cos(rot2);
			new Asteroid(this.points[0].x+sine1*this.rad/2*1.5, this.points[0].y-cosine1*this.rad/2*1.5, this.rad/2, this.lives-1, velocity*1.3, rot1, sine1, cosine1);
			new Asteroid(this.points[0].x+sine2*this.rad/2*1.5, this.points[0].y-cosine2*this.rad/2*1.5, this.rad/2, this.lives-1, velocity*1.3, rot2, sine2, cosine2);
		}
		else {
			let rot1 = actor.rot+Math.PI/2;
			let sine1 = Math.sin(rot1);
			let cosine1 = Math.cos(rot1);
			let rot2 = actor.rot-Math.PI/2;
			let sine2 = Math.sin(rot2);
			let cosine2 = Math.cos(rot2);
			new Asteroid(this.points[0].x+sine1*this.rad/2, this.points[0].y-cosine1*this.rad/2, this.rad/2, this.lives-1, velocity*1.3, rot1, sine1, cosine1);
			new Asteroid(this.points[0].x+sine2*this.rad/2, this.points[0].y-cosine2*this.rad/2, this.rad/2, this.lives-1, velocity*1.3, rot2, sine2, cosine2);
		}
		explosion.play();
	}
	this.dupe = function() {
		let warn = new Audio("sounds/mysterious.wav");
		warn.play();
		let rot1 = rot+Math.PI/6;
		let sine1 = Math.sin(rot1);
		let cosine1 = Math.cos(rot1);
		let rot2 = rot-Math.PI/6;
		let sine2 = Math.sin(rot2);
		let cosine2 = Math.cos(rot2);
		new Asteroid(this.points[0].x+sine1*this.rad*2, this.points[0].y-cosine1*this.rad*2, this.rad, this.lives, velocity, rot1, sine1, cosine1);
		new Asteroid(this.points[0].x+sine2*this.rad*2, this.points[0].y-cosine2*this.rad*2, this.rad, this.lives, velocity, rot2, sine2, cosine2);
		this.expire = true;
		asteroids--;
	}
	this.update = function() {
		this.points[0].x += velocityX;
		this.points[0].y += velocityY;
		rotate.call(this,spin);
		draw.call(this,color);
	}
}
function Bullet(loc, rot, sine, cosine, rad, color) {
	let x = loc.x + sine*15;
	let y = loc.y - cosine*15;
	Entity.call(this, x, y, "bullet", rad, 1, ["Asteroid"]);
	this.velocityX = 10 * sine;
	this.velocityY = -10 * cosine;
	this.rot = rot;
	var lifetime = 0;
	var lifespan = 21;
	rotate.call(this, this.rot, sine, cosine);
	this.dupe = function() {
		new Bullet(this.points[0], rot, sine, cosine, this.rad, color);
	}
	this.update = function() {
		lifetime++;
		if (lifetime > lifespan) {
			this.expire = true;
		}
		this.points[0].x += this.velocityX;
		this.points[0].y += this.velocityY;
		draw.call(this, color);
	}
}
function Cherry(x, y) {
	Entity.call(this, x, y, "cherry", 14, 1, ["Ship", "Bullet", "Asteroid"]);
	cherries++;
	lifetime = 0;
	immunity = 32;
	this.update = function() {
		rotate.call(this,.01);
		edge.call(this);
		if (lifetime > immunity || lifetime % 4 == 0) {
			let old_color = bg.strokeStyle;
			bg.strokeStyle = bg.fillStyle = red;
			bg.beginPath();
			// first points are set in relation to the moving origin
			bg.moveTo(this.points[1].x+this.points[0].x, this.points[1].y+this.points[0].y);
			for (let i = 2; i <= 4; i++) {
				bg.lineTo(this.points[i].x+this.points[0].x,this.points[i].y+this.points[0].y);
			}
			bg.stroke();
			bg.beginPath();
			for (let i = 5; i <= 8; i++) {
				bg.lineTo(this.points[i].x+this.points[0].x,this.points[i].y+this.points[0].y);
			}
			bg.closePath();
			bg.fill();
			bg.beginPath();
			for (let i = 9; i < this.points.length; i++) {
				bg.lineTo(this.points[i].x+this.points[0].x,this.points[i].y+this.points[0].y);
			}
			bg.closePath();
			bg.fill();
			bg.strokeStyle = bg.fillStyle = old_color;
		}
		lifetime++;
	}
	this.on_hit = function(actor) {
		actor.dupe();
		if (actor.constructor.name != "Bullet") {
			this.expire = true;
			cherries--;
		}
	}
}
function Super(x, y) {
	Entity.call(this, x, y, "cherry", 14, 1, ["Ship", "Bullet", "Asteroid"]);
	supers++;
	this.update = function() {
		rotate.call(this,.01);
		draw.call(this, orange);
	}
	this.on_hit = function(actor) {
		actor.resize(1.2);
		if (actor.constructor.name != "Bullet") {
			this.expire = true;
			supers--;
		}
	}
}