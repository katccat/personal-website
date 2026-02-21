// bird highway game
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
scale = 1;
fps = 60;
canvas.width = 600*scale
canvas.height = canvas.width*0.6*scale;

ctx.fillStyle = "white";
/*ctx.strokeStyle = "white";
ctx.lineWidth = 4;
ctx.setLineDash([5, 15]);*/

stop = false;
up_key = 38;//39;//87;
down_key = 40;//37;//83;
blip = new Audio("sounds/blip.wav");
fail = new Audio("sounds/fail.wav");

function Paddle(side = "l", auto = false) {
	this.length = 50;
	this.depth = 8;
	this.offset = canvas.width/4-canvas.width/6;
	this.side = side;
	this.y = 0;
	this.initial = 1;
	this.accel = 1.5;
	this.terminal = 10;
	this.deaccel = 0.75;
	this.velocity = 0;
	this.points = 0;
	this.follow_margin = 5;
	this.render = function() {

		this.top = this.y+this.length/2;
		this.bottom = this.y-this.length/2;
		// AI
		if (auto == true) {
			if ((ball.y - this.y) > this.follow_margin) {
				this.key = up_key;
			}
			else if ((ball.y - this.y) < -this.follow_margin) {
				this.key = down_key;
			}
			else {
				this.key = null;
			}
		}
		// controls & physics
		if (this.key == up_key) {
			if (this.velocity <= this.terminal) {
				this.velocity += this.initial * this.accel;
			}
		}
		if (this.key == down_key) {
			if (Math.abs(this.velocity) <= this.terminal) {
				this.velocity -= (this.initial * this.accel);
			}
		}
		if (this.key != up_key && this.key != down_key && this.velocity != 0) {
			if (Math.abs(this.velocity) >= 0.01) {
				this.velocity *= this.deaccel;
			}
			else {
				this.velocity = 0;
			}
		}
		this.y += this.velocity;
		// if the paddle goes past the edge of the screen it will come out
		// the other side
		if (Math.abs(this.y) > canvas.height/2+this.length/2) {
			this.y = -this.y;
		}

		if (this.side == "l") {
			this.surface = -(canvas.width/2-this.depth-this.offset);
			ctx.fillRect(0+this.offset, canvas.height/2-this.length/2-this.y, this.depth, this.length);
		}
		else if (this.side == "r") {
			this.surface = canvas.width/2-this.depth-this.offset;
			ctx.fillRect(canvas.width-this.offset, canvas.height/2-this.length/2-this.y, -this.depth, this.length);
		}
	}
}

const ball = {
	size: 10,
	x: 0,
	y: 0,
	velocityX: 5,
	velocityY: Math.random()*9 - 4,
	maxY: 7,
	set: function() {
		this.x = 0;
		this.y = 0;
		this.velocityY = Math.random()*9 - 4;
	},
	render: function() {
		this.x+=this.velocityX;
		this.y+=this.velocityY;
		// L or R paddle collision here
		// the first if determines whether it collides vertically 
		if (this.x <= player.surface && this.x >= player.surface-player.depth) {
			// checks if it lines up with the paddle
			if (this.y-this.size/2 <= player.top && this.y+this.size/2 >= player.bottom) {
				// vollies the ball rightward
				this.velocityX = Math.abs(this.velocityX);
				blip.play();
				// deals with orientation
				spin = -((player.y - this.y)/(player.length/2)) * this.maxY;
				this.velocityY = spin;
			}
		}

		else if (this.x >= cpu.surface && this.x <= cpu.surface+cpu.depth) {
			if (this.y-this.size/2 <= cpu.top && this.y+this.size/2 >= cpu.bottom) {
				blip.play();
				this.velocityX = -Math.abs(this.velocityX);
				// deals with orientation
				spin = -((cpu.y - this.y)/(cpu.length/2)) * this.maxY;
				this.velocityY = spin;
			}
		}
		// out of bounds and scoring and placing the ball back
		// needs to be more procedural
		if (Math.abs(this.x) > canvas.width/2+this.size/2) {
			fail.play();
			if (this.x > 0) {
				player.points++;
			}
			else {
				cpu.points++;
			}
			this.set();
		}
		// top and bottom bounce
		if (Math.abs(this.y) >= canvas.height/2-this.size/2) {
			this.velocityY = -this.velocityY;
		}
		ctx.fillRect(canvas.width/2-this.size/2+this.x,canvas.height/2-this.size/2-this.y,this.size,this.size);
	},
}

player = new Paddle("l", false);
cpu = new Paddle("r", true);
cpu.follow_margin = 5;

window.addEventListener('keydown', function(event) {
	player.key = event.keyCode;
	if (event.keyCode == 87) {window.alert("")};
});
window.addEventListener('keyup', function() {
      player.key = null;
})

function refresh() {
	if (stop == false) {
		//setTimeout(function() {
			window.requestAnimationFrame(render);
		//}, 1000/fps);
	}
}
refresh();

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	/*ctx.beginPath();
	ctx.moveTo(canvas.width/2,canvas.height);
	ctx.lineTo(canvas.width/2,0);
	ctx.stroke();*/
	player.render();
	cpu.render();
	ball.render();
	document.getElementById("score").innerHTML = player.points+" - "+cpu.points;
	refresh();
}

function reset() {
	player.y = 0;
	player.velocity = 0;
	player.points = 0;
	cpu.y = 0;
	cpu.velocity = 0;
	cpu.points = 0;
	ball.set();
	ball.velocityX = 5;
}
function pause() {
	stop=!stop;
	refresh();
}