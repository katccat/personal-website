function Entity(x=game_width/2, y=game_height/2, shape="square", rad=14, lives=1, collisions=["Bullet"]) {
	entities.push(this);
	this.points = shapes(shape, rad, x, y);
	this.rad = rad;
	this.lives = lives;
	this.expire = false;
	this.resize = function(factor) {
		this.rad *= factor;
		for (let i = 1; i < this.points.length; i++) {
			this.points[i].x *= factor;
			this.points[i].y *= factor;
		}
	}
	this.collision_legal = function(actor) {
		if (actor == this) {
			return false;
		}
		for (let i = 0; i < collisions.length; i++) {
			if (collisions[i] == actor.constructor.name) {
				return true;
			}
		}
		return false;
	}
	this.on_hit = function() {
		this.lives--;
		if (this.lives <= 0) {
			this.expire = true;
		}
	}
	this.dupe = function() {
		return;
	}
	this.update = function() {
		draw.call(this);
	}
}
function edge() {
	if (this.points[0].x > game_width + this.rad || this.points[0].x < -this.rad) {
		//355 = 350 - 2.5 * -1
		this.points[0].x = Math.min(game_width+this.rad-1, Math.max(-this.rad+1, game_width - this.points[0].x));
	}
	if (this.points[0].y > game_height + this.rad || this.points[0].y < -this.rad) {
		this.points[0].y = Math.min(game_height+this.rad-1, Math.max(-this.rad+1, game_height - this.points[0].y));
	}
}
function draw(color = bg.strokeStyle) {
	edge.call(this);
	//color is changed temporarily
	let old_color = bg.strokeStyle;
	bg.strokeStyle = bg.fillStyle = color;
	//drawing begins
	bg.beginPath();
	// first points are set in relation to the moving origin
	bg.moveTo(this.points[1].x+this.points[0].x, this.points[1].y+this.points[0].y);
	for (let i = 2; i < this.points.length; i++) {
		bg.lineTo(this.points[i].x+this.points[0].x,this.points[i].y+this.points[0].y);
	}
	bg.closePath();
	bg.stroke();
	bg.strokeStyle = bg.fillStyle = old_color;
	// old color is reset
}
function drawCopy(points, rad, color = bg.strokeStyle) {
	edge.call(this);
	//color is changed temporarily
	let old_color = bg.strokeStyle;
	bg.strokeStyle = bg.fillStyle = color;
	//drawing begins
	bg.beginPath();
	// first points are set in relation to the moving origin
	bg.moveTo(points[1].x+this.points[0].x, points[1].y+this.points[0].y);
	for (let i = 2; i < this.points.length; i++) {
		bg.lineTo(points[i].x+this.points[0].x,points[i].y+this.points[0].y);
	}
	bg.closePath();
	bg.stroke();
	bg.strokeStyle = bg.fillStyle = old_color;
	// old color is reset
}
function rotate(rot, sine=Math.sin(rot), cosine=Math.cos(rot)) {
	// rotates shape points around the moving origin
	for (let i = 1; i < this.points.length; i++) {
		let tempX = this.points[i].x;
		let tempY = this.points[i].y;
		tempX = this.points[i].x * cosine - this.points[i].y * sine;
		tempY = this.points[i].x * sine + this.points[i].y * cosine;
		this.points[i].x = tempX;
		this.points[i].y = tempY;
	}
}
function shapes(shape, rad, x, y) {
	let Point = function(x,y) {
		this.x = x;
		this.y = y;
	}
	let coords = [];
	switch(shape) {
		default:
		case "square":
			coords = [
			new Point(1,1),
			new Point(-1,1),
			new Point(-1,-1),
			new Point(1,-1)];
			break;
		case "arrow":
			coords = [
			new Point(0,1),
			new Point(-4/7,-1),
			new Point(0, -4/7),
			new Point(4/7,-1)];
			break;
		case "bullet":
			coords = [
			new Point(0, -1),
			new Point(0, 1)];
			break;
		case "cherry":
			coords = [
			// stem
			new Point(-0.5,-0.25),
			new Point(0.75,0.75),
			new Point(0.75,1),
			new Point(0.75,-0.25),
			// left cherry
			new Point(-0.75, -0.25),
			new Point(-.75, -1),
			new Point(0, -1),
			new Point(0, -0.25),
			// right cherry
			new Point(0.25, -0.25),
			new Point(0.25, -1),
			new Point(1, -1),
			new Point(1, -0.25)
			];
			break;
		case 0: //mushroom shape
			coords = [
			new Point(1,0.3), //top right
			new Point(0.4,1), //top right

			new Point(-0.3,1),
			new Point(-1,0.2),

			new Point(-0.4,0), // divot left
			new Point(-1,-0.3),
			new Point(-0.5,-1),
			new Point(0,-0.3), // divot bottom
			new Point(0,-1),
			new Point(0,-1),
			new Point(0.6,-1),
			new Point(1,-0.4)];
			break;
		case 1: //x shape
			coords = [
			new Point(-0.5,-1),
			new Point(-1,-0.6),
			new Point(-1,0.4),
			new Point(-0.5,1),
			new Point(0,0.6),
			new Point(0.5,1),
			new Point(1,0.4),
			new Point(0.7,-0.1),
			new Point(1,-0.6),
			new Point(0.4,-1)];
			break;
		case 2:
			coords = [
			new Point(-1,0.4),
			new Point(-1,-0.3),
			new Point(-0.5,-1),
			new Point(0.2,-0.8),
			new Point(0.4,-1),
			new Point(1,-0.5),
			new Point(0.3,0.1),
			new Point(1,0.3),
			new Point(1,0.6),
			new Point(0.2,1),
			new Point(-0.7,1),
			new Point(-0.3,0.4)];
			break;
	}
	coords.unshift(new Point(x,y));
	for (let i = 1; i < coords.length; i++) {
		coords[i].x *= rad;
		coords[i].y *= -rad;
	}
	return coords;
}
function toggleColor(variable) {
	if (variable == true) {
		this.style.color = "green";
	}
	else {
		this.style.color = "red";
	}
}
function spawner(time) {
	let rad = 40;
	if (time % 180 == 0 && asteroids < 4) {
		let rot = Math.random()*Math.PI*2;
		let sine = Math.sin(rot);
		let cosine = Math.cos(rot);
		let x,y;
		if (Math.random() < 0.5) {
			x = Math.random()*game_width;
			y = Math.random() < 0.5 ? game_height + rad : -rad;
		}
		else {
			y = Math.random()*game_height;
			x = Math.random() < 0.5 ? game_width + rad : -rad;
		}
		new Asteroid(x, y, rad, undefined, undefined, rot, sine, cosine);
		
	}
	if ((time + 120) % 360 == 0) {
		if (cherries < 1) {
			new Cherry(Math.random()*game_width, Math.random()*game_height);
		}
	}
}
function collision_loop() {
	let length = entities.length;
	for (let subject = 0; subject < length; subject++) {
		// checks subject against everyone
		for (let i = 0; i < length; i++) {
			// checks if subject is capable of colliding with actor
			if (entities[subject].collision_legal(entities[i])) {
				let distX = entities[subject].points[0].x - entities[i].points[0].x;
				let distY = entities[subject].points[0].y - entities[i].points[0].y;
				let distance = Math.sqrt(distX * distX + distY * distY);
				// checks if they are colliding
				if (distance < entities[subject].rad + entities[i].rad) {
					entities[subject].on_hit(entities[i]);
				}
				if (entities[subject].expire == true) {
					break;
				}
			}
		}
	}
}