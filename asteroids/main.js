'use strict';
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
const score_display = document.getElementById('score');
const paused_display = document.getElementById('paused');
const highscore = document.getElementById('highscore');
if (!localStorage.highscore) localStorage.highscore = 0;
highscore.innerHTML = "Highscore: " + localStorage.highscore;
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
			if (paused) advance();
			break;*/
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
	paused_display.innerHTML = "Checking refresh rate...";
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
		paused_display.innerHTML = "";
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
	score = score_display.innerHTML = 0;
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
		paused_display.innerHTML = "paused";
		window.cancelAnimationFrame(requestID);
	}
	else {
		paused_display.innerHTML = "";
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
			paused_display.innerHTML = frame - frames_at_last_second;
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
		paused_display.innerHTML = frame - frames_at_last_second;
		frames_at_last_second = frame;
		last_second = now;
	}
	requestID = window.requestAnimationFrame(refresh);
}

// when asteroids reaches 0, increment level by 1, spawn asteroids at a step until it reaches level
function advance() {
	bg.clearRect(0, 0, game_width, game_height);
	/*
		bg.fillStyle = `rgba(0, 0, 0, 0.52)`;
		bg.fillRect(0, 0, game_width, game_height);
		bg.fillStyle = bg.strokeStyle;
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
	score_display.innerHTML = score;
	if (score > localStorage.highscore && disable_highscore === false) {
		localStorage.highscore = score;
		highscore.innerHTML = "Highscore: " + score;
	}
}

function fireworks() {
	for (let i = 0; i < 14; i++) {
		explode(Math.random() * game_width, Math.random() * game_height, random_color(), 7, undefined, true);
	}
}