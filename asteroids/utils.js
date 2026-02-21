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