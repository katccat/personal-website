//public facing variables: rad, expiry, lives, location, 
const bg = document.getElementById("back").getContext("2d", {alpha: false});
const stats = document.getElementById("stats");
stats.innerHTML = 0;
const game_width = 480;
const game_height = 442;//15:13 aspect
const orange = "#fcc921";
const green = "#00be00";
const red = "#ed070b";
const blue = "#16d9f2";
const pink = "#ff6bb0";
{//make game scale up to fill canvas
	let canvas = document.getElementById("back");
	bg.scale(canvas.width/game_width,canvas.height/game_height);
}
bg.strokeStyle = bg.fillStyle = green;
bg.lineWidth = .8;

const frame_interval = 1000/60;
paused = true;
key = [];
asteroids_can_collide = true;

addEventListener("keydown", function(event) {
	switch(event.code) {
		case 'Escape':
		case 'KeyP':
			toggle_pause();
			return;
		case 'KeyR':
			play();
			return;
		case 'KeyN':
			if (paused) {advance()}
			return;
		case 'KeyZ':
			if (key[event.code] == false) {
				return;//no repeat allowed
			}
			break;
		case 'ArrowUp':
		case 'ArrowDown':
		case 'ArrowLeft':
		case 'ArrowRight':
			event.preventDefault();//prevents page from moving around due to arrow keys
	}
	key[event.code] = true;
});
addEventListener("keyup", function(event) {
	delete key[event.code];
});
play();
/*
If your ships have mostly uniform behavior, 
you can store their movement data in an array of objects. 
Each object could have properties like rotation, acceleration, and a flag for firing. 
Then, iterate through this array and update each ship's properties based on the data:
*/
function advance() {
	bg.clearRect(0, 0, game_width, game_height);
	spawner(time);
	// UPDATE
	if (key['ArrowRight'] & !key['ArrowLeft']) {
		Global_Ship.rot += Global_Ship.turnSpeed;
		Global_Ship.sine = Math.sin(Global_Ship.rot);
		Global_Ship.cosine = Math.cos(Global_Ship.rot);
		rotate.call(Global_Ship, Global_Ship.turnSpeed);
	}
	else if (key['ArrowLeft']  & !key['ArrowRight']) {
		Global_Ship.rot -= Global_Ship.turnSpeed;
		Global_Ship.sine = Math.sin(Global_Ship.rot);
		Global_Ship.cosine = Math.cos(Global_Ship.rot);
		rotate.call(Global_Ship, -Global_Ship.turnSpeed);
	}
	if (key['KeyX']) {
		Global_Ship.acceleration['x'] = Global_Ship.accel * Global_Ship.sine;
		Global_Ship.acceleration['y'] = -Global_Ship.accel * Global_Ship.cosine;
	}
	else {
		Global_Ship.acceleration['x'] = 0;
		Global_Ship.acceleration['y'] = 0;

	}
	for (let i = 0; i < entities.length; i++) {entities[i].update()}
	if (key['KeyZ']) {
		key['KeyZ'] = false;
		if (Global_Ship.count > 0) {
			let shoot = new Audio("sounds/droplet.wav");
			shoot.play();
		}
	}
	// COLLISION
	collision_loop();
	// REMOVAL
	for (let i = entities.length-1; i >= 0; i--) {
		if (entities[i].expire) {
			delete entities[i];
			entities.splice(i,1);
		}
	}
	time++;
}

let then = -17;
function refresh(now) {
	// potential optimization: allow calculations to happen before refresh
	let elapsed = now - then;
	// prevents the framerate from exceeding the limit
	if (elapsed >= frame_interval) {
		
		advance();
		then = now - (elapsed % frame_interval);
	}
	frame = requestAnimationFrame(refresh);
}


// sets everything up and clears everything
function play() {
	console.clear();
	time = 0;
	stats.innerHTML = score = 0;
	Global_Ship.initialize();
	entities = [];
	asteroids = 0;
	cherries = 0;
	player = new Ship();
	if (paused) toggle_pause();
}


function toggle_pause() {
	let display = document.getElementById("paused");
	paused =! paused;
	if (paused) {
		cancelAnimationFrame(frame);
		display.innerHTML = "paused";
	}
	else {
		frame = requestAnimationFrame(refresh);
		display.innerHTML = "";
	}
}