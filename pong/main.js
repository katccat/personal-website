const fg = document.getElementById("front").getContext("2d");
const bg = document.getElementById("back").getContext("2d", {alpha: false});
const width = 725;
const height = 500;
{
	let canvas = document.getElementById("back");
	fg.scale(canvas.width/width,canvas.height/height);
	bg.scale(canvas.width/width,canvas.height/height);
}
fg.lineWidth = 5;
fg.setLineDash([5,15]);
fg.font = "75px pongscore";
fg.textAlign = "right";
const player_sound = new Audio("sounds/focus.wav");
const cpu_sound = new Audio("sounds/revenge.wav");
const bounce = new Audio("sounds/routine.wav");
const success = new Audio("sounds/provoke.wav");
const fail = new Audio("sounds/resolve.wav");
{
	let volume = .2;
	player_sound.volume = volume;
	cpu_sound.volume = volume;
	bounce.volume = volume;
	success.volume = volume;
	fail.volume = volume;
}
const frame_interval = 1000/60;
win = 11;
paused = true;
key = [];
window.addEventListener("keydown", function(event) {
	key[event.keyCode] = true;
	player.listen();
	if (key[38] || key[40]) {
		event.preventDefault();
	}
	if (key[80] || key[27]) {
		pause();
	}
	else if (key[82]) {
		play();
	}
});
window.addEventListener("keyup", function() {
      key[event.keyCode] = undefined;
      player.listen();
});
player = new Paddle('l');
cpu = new Paddle('r');
font = new FontFace("pongscore", "url(pongscore.otf)");
font.load().then(() => play());
let then = -17;
function refresh(now) {
	if (player.points < win && cpu.points < win) {
		let elapsed = now - then;
		if (elapsed >= frame_interval) {
			cpu.think(Math.random()*21+5);
			if (ball.wait) {
				setTimeout(() => ball.wait = false, 375);
			}
			else {
				ball.update();
			}
			bg.clearRect(0, 0, width, height);
			ball.draw();
			cpu.draw();
			player.draw();
			then = now - (elapsed % frame_interval);
		}
		frame = requestAnimationFrame(refresh);
	}
	else pause();
}
function draw_ui() {
	fg.clearRect(0, 0, width, height);
	fg.beginPath();
	fg.moveTo(width/2,height);
	fg.lineTo(width/2,0);
	fg.stroke();
	fg.fillText(player.points, 256, 126);
	fg.fillText(cpu.points, 618, 126);
}
function recolor(current) {
	const colors = ["#ffffff","#00be00","#e3b612"];
	let color = current;
	while (color == current) {
		color = colors[Math.floor(Math.random()*colors.length)];
	}
	return color;
}
function play() {
	fg.strokeStyle = fg.fillStyle = bg.fillStyle = recolor(bg.fillStyle);
	player.y = cpu.y = 0;
	player.velocity = cpu.velocity = 0;
	player.points = cpu.points = 0;
	ball.wait = false;
	ball.set(true);
	if (paused) pause();
}
function pause() {
	paused =! paused;
	if (paused) {
		cancelAnimationFrame(frame);
	}
	else {
		frame = requestAnimationFrame(refresh);
	}
}
