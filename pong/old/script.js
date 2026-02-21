canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
fps = 60;
scale = 1;
canvas.width = 600*scale;
canvas.height = canvas.width*0.6;
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1.7;
win = 10;
paused = false;
player_sound = new Audio("sounds/focus.wav");
cpu_sound = new Audio("sounds/revenge.wav");
bounce = new Audio("sounds/routine.wav");
success = new Audio("sounds/provoke.wav");
fail = new Audio("sounds/resolve.wav");

key = [];
window.addEventListener("keydown", function(event) {
	key[event.keyCode] = true;
	if (key[27] || key[80]) {
		pause();
	}
	else if (key[82]) {
		replay();
	}
	else if (key[38] || key[40]) {
		event.preventDefault();
	}
});
window.addEventListener("keyup", function() {
      key[event.keyCode] = null;
});

player = new Paddle('l');
cpu = new Paddle('r', 15);
ball.set(true);
loop = setInterval(refresh,1000/fps);

function refresh() {
	if (player.points > win) {
		document.getElementById("score").innerHTML = "VICTORY";
		pause();
	}
	else if (cpu.points > win) {
		document.getElementById("score").innerHTML = "DEFEAT";
		pause();
	}
	else {
		document.getElementById("score").innerHTML = player.points+" - "+cpu.points;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if ((Math.abs(ball.velocityY) > ball.maxY-0.75 && ball.velocityX > 0)
			|| (player.points >= 8 && player.points > cpu.points)
			|| ball.left > cpu.back) {
			ctx.strokeStyle = "#f7612a"
			cpu.follow_margin = 29;
		}
		else {
			ctx.strokeStyle = "#2af76b";
			cpu.follow_margin = 15;
		}

		player.listen(38,40,87,83);
		cpu.think();

		if (ball.wait == true) {
			setTimeout(function() {ball.wait = false;}, 700);
		}
		else {
			ball.update();
		}
		ball.draw();
		cpu.draw();
		player.draw();
	}
}
function replay() {
	player.y = 0;
	player.velocity = 0;
	player.points = 0;
	cpu.y = 0;
	cpu.velocity = 0;
	cpu.points = 0;
	ball.wait = false;
	ball.set(true);
	if (paused) {
		pause();
	}
}
function pause() {
	paused =! paused;
	if (paused) {
		clearInterval(loop);
	}
	else {
		loop = setInterval(refresh,1000/fps);
	}
}