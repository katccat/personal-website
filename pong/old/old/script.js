// sprites ripped by TJ the Kid
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
game_scale = 1;
// the width and height are
// the length of the bud
// plus two petals
canvas.width = 500;
canvas.height = canvas.width * (3/4);
ctx.fillStyle = "white";
ctx.lineWidth = "4";
ctx.strokeStyle = ctx.fillStyle;
framerate = 1/60 * 1000;
y=0;
pause = false;
window.onload = function start() {
		setInterval(update, framerate);
}

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	
	ctx.moveTo(canvas.width/2,canvas.height);
	ctx.lineTo(canvas.width/2,0);
	ctx.stroke();
	paddle_length = 70;
	paddle_depth = 25;
	paddle_offset = 5;
	ctx.fillRect(0+paddle_offset, canvas.height/2-paddle_length/2+y, paddle_depth-paddle_offset, paddle_length);
	if (pause == false) {
		y++;
	}
}











