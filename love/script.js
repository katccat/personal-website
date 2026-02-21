// https://www.spriters-resource.com/ds_dsi/supermario64ds/sheet/6851/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const text = document.getElementById("text");
const text_ctx = text.getContext("2d");
const volume = .3;
music = new Audio("sounds/lullaby.wav");
music.volume = .5;
music.loop = true;

addEventListener("keydown", function(event) {
	if (event.keyCode == 77) music_toggle();
});

onload = function() {
	start();
}

function start() {
	petals = Math.floor(Math.random() * (14+1));
	i = 0;
	clockwise = [true,false][Math.round(Math.random())];
	text_ctx.clearRect(0, 0, text.width, text.height);
	draw_flower();
}

function draw_flower(face=neutral, size=1) {
	var inset = 6 * size;
	// moves petal to the top of the bud
	var x = canvas.width/2 - 16*size;
	var y = (canvas.height/2 - 64*size/2) + inset - 49*size;
	var factor = -360 / petals;
	if (petals <= 3) {
		factor = -30;
		if (clockwise == true) {
			factor = -factor;
		}
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	for (p = 0; p < petals-i; p++) {
		// moves origin to center of canvas
		ctx.translate(canvas.width/2,canvas.height/2);
		ctx.rotate(factor * Math.PI/180);
		ctx.translate(-canvas.width/2,-canvas.height/2);
		ctx.drawImage(petal_image, x, y, 32*size, 49*size);
	}
	ctx.restore();
	ctx.drawImage(face, canvas.width/2-64*size/2, canvas.height/2-64*size/2, 64*size, 64*size);
}

function draw_text(name) {
	text_ctx.clearRect(0, 0, text.width, text.height);
	text_ctx.drawImage(name, text.width/2-name.width/2, text.height-name.height, name.width, name.height);
}

function update() {
	i++;
	if (i > petals) {
		if (petals == 0) {
			let baa = new Audio("sounds/baa.wav");
			baa.volume = volume;
			baa.play();
		}
		start();
	}
	else if (i % 2 != 0) {
		let pluck = new Audio("sounds/pluck.wav");
		pluck.volume = volume;
		pluck.play();
		if (i != petals) {
			draw_flower(yes, 1.01);
			draw_text(lovesme);
		}
		else {
			draw_flower(win, 1.1);
			draw_text(reallylovesme);
		}
	}
	else {
		let pluck2 = new Audio("sounds/pluck2.wav");
		pluck2.volume = volume;
		pluck2.play();
		if (i != petals) {
			draw_flower(no);
			draw_text(lovesmenot);
		}
		else {
			let meow = new Audio("sounds/meow.wav");
			meow.volume = volume;
			meow.play();
			draw_flower(defeat);
			draw_text(reallylovesmenot);
		}
	}
}

function music_toggle() {
	if (music.paused) {
		music.play();
	}
	else {
		music.pause();
		music.currentTime = 0;
	}
}