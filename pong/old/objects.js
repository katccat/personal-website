function Paddle(side = 'l', follow_margin = 10) {
	this.length = 50;
	this.depth = 8;
	this.offset = 70*scale;
	this.back = (side == 'l') ? -(canvas.width/2-this.offset):canvas.width/2-this.offset;
	this.front = (side == 'l') ? -(canvas.width/2-this.offset-this.depth):canvas.width/2-this.offset-this.depth;
	this.y = 0;

	this.initial = 1;
	this.accel = 1.3;//1.5
	this.friction = 0.75;//0.7
	this.terminal = 8;
	this.velocity = 0;
	this.points = 0;

	this.upward = false;
	this.downward = false;
	this.follow_margin = follow_margin;

	this.listen = function(up1=38, down1=40, up2=null, down2=null) {
		if (key[up1] || key[up2]) {
			this.upward = true;
		}
		else {
			this.upward = false;
		}
		if (key[down1] || key[down2]) {
			this.downward = true;
		}
		else {
			this.downward = false;
		}
	}
	this.think = function() {
		if (ball.y > this.y && Math.abs(ball.y-this.y) >= this.follow_margin) {
			this.upward = true;
			this.downward = false;
		}
		else if (ball.y < this.y && Math.abs(ball.y-this.y) >= this.follow_margin) {
			this.downward = true;
			this.upward = false;
		}
		
		else {
			this.upward = false;
			this.downward = false;
		}
	}
	this.draw = function() {
		if (this.upward) {
			if (this.velocity <= this.terminal) {
				this.velocity += this.initial * this.accel;
			}
		}
		// checks for downward intention. this is not an if else so that up doesn't
		// necessarily take precedence over it
		if (this.downward) {
			if (this.velocity >= -this.terminal) {
				this.velocity -= this.initial * this.accel;
			}
		}
		// when there is no input it deaccelerates
		// also when there is both inputs it just coasts
		else if (this.velocity != 0 && !(this.upward)) {
			this.velocity *= this.friction;
			if (Math.abs(this.velocity) < 0.01) {
				this.velocity = 0;
			}
		}
		this.y += this.velocity;
		// if the paddle goes past the edge of the screen it will come out
		// the other side
		if (Math.abs(this.y) > canvas.height/2+this.length/2) {
			this.y = -this.y;
		}
		this.top = this.y+this.length/2;
		this.bottom = this.y-this.length/2;
		// drawing
		if (side == 'l') {
			ctx.beginPath();
			ctx.rect(this.offset, canvas.height/2-this.length/2-this.y, this.depth, this.length);
			ctx.fill();
		}
		else if (side == 'r') {
			ctx.beginPath();
			ctx.rect(canvas.width-this.offset, canvas.height/2-this.length/2-this.y, -this.depth, this.length);
			ctx.stroke();
		}
	}
}

ball = {
	size: 10,
	x: 0,
	y: 0,
	maxY: 7.25,
	wait: false,
	set: function(restart = false) {
		this.x = 0;
		this.y = 0;
		this.velocityX = (restart) ? [6.25,-6.25][Math.round(Math.random())]:this.velocityX;
		this.velocityY = (restart) ? 0:Math.random()*2-1; // -1 >= x > 1
	},	// velocityX 6.25, -6.25 maxY 7.25
	update: function() {
		this.top = this.y + this.size/2;
		this.bottom = this.y - this.size/2;
		this.left = this.x - this.size/2;
		this.right = this.x + this.size/2;
		// L or R paddle collision here
		// the first if determines whether it collides on the X 
		if (this.left <= player.front && this.right >= player.back) {
			// checks if it lines up with the paddle
			if (this.bottom <= player.top && this.top >= player.bottom) {
				// vollies the ball rightward
				player_sound.play();
				this.velocityX = Math.abs(this.velocityX);
				// spin
				this.velocityY = -((player.y - this.y)/(player.length/2)) * this.maxY;
			}
		}
		// R
		else if (this.right >= cpu.front && this.left <= cpu.back) {
			if (this.bottom <= cpu.top && this.top >= cpu.bottom) {
				// vollies the ball leftward
				cpu_sound.play();
				this.velocityX = -Math.abs(this.velocityX);
				// spin
				this.velocityY = -((cpu.y - this.y)/(cpu.length/2)) * this.maxY;
			}
		}
		// scoring and placing the ball back
		if (Math.abs(this.x) >= canvas.width/2+this.size/2) {
			if (this.x > 0) {
				success.play();
				player.points++;
			}
			else if (this.x < 0) {
				fail.play();
				cpu.points++;
				this.wait = true;
			}
			if (player.points <= win && cpu.points <= win) {
				this.set();
			}
		}
		// top and bottom bounce
		else {
			if (this.top >= canvas.height/2) {
				this.velocityY = -Math.abs(this.velocityY);
				bounce.play();
			}
			else if (this.bottom <= -canvas.height/2) {
				this.velocityY = Math.abs(this.velocityY);
				bounce.play();
			}
		}
		this.x += this.velocityX;
		this.y += this.velocityY;
	},
	draw: function() {
		ctx.beginPath();
		ctx.rect(canvas.width/2-this.size/2+this.x,canvas.height/2-this.size/2-this.y,this.size,this.size);
		ctx.stroke();
	}
}
