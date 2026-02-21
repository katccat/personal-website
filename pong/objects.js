function Paddle(side) {
	this.length = 40;
	this.depth = 7;
	this.offset = 70;
	this.front = (side == 'l') ? -(width/2-this.offset-this.depth):width/2-this.offset-this.depth;
	this.back = (side == 'l') ? -(width/2-this.offset):width/2-this.offset;
	this.y = 0;

	var accel = 1.3;
	var deaccel = 0.75;
	var terminal = 9.5;
	this.velocity = 0;
	
	this.points = 0;
	this.upward;
	this.downward;

	this.listen = function(up1=38, down1=40, up2=87, down2=83) {
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
	this.think = function(follow_margin = 25) {
		if (ball.y > this.y && Math.abs(ball.y-this.y) >= follow_margin) {
			this.upward = true;
			this.downward = false;
		}
		else if (ball.y < this.y && Math.abs(ball.y-this.y) >= follow_margin) {
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
			this.velocity += accel;
			if (this.velocity > terminal) {
				this.velocity = terminal;
			}
		}
		// checks for downward intention. this is not an if else so that up doesn't
		// necessarily take precedence over it
		if (this.downward) {
			this.velocity -= accel;
			if (this.velocity < -terminal) {
				this.velocity = -terminal;
			}
		}
		// when there is no input it deaccelerates
		// also when there is both inputs it just coasts
		else if (this.velocity != 0 && !(this.upward)) {
			this.velocity *= deaccel;
			if (Math.abs(this.velocity) < 0.02) {
				this.velocity = 0;
			}
		}
		this.y += this.velocity;
		// if the paddle goes past the edge of the screen it will come out
		// the other side
		if (Math.abs(this.y) > height/2+this.length/2) {
			this.y = -this.y;
		}
		// drawing
		if (side == 'l') {
			bg.fillRect(this.offset, height/2-this.length/2-this.y, this.depth, this.length);
		}
		else if (side == 'r') {
			bg.fillRect(width-this.offset, height/2-this.length/2-this.y, -this.depth, this.length);
		}
	}
}

const ball = {
	size: 10,
	maxY: 7.25,
	wait: false,
	set: function(restart = false) {
		draw_ui();
		if (player.points < win && cpu.points < win) {
			this.x = 0;
			this.y = 0;
			this.velocityX = (restart) ? [6.25,-6.25][Math.round(Math.random())]:this.velocityX;
			this.velocityY = (restart) ? 0:(Math.random()*2-1); // -1 >= x > 1
		}
	},
	update: function() {
		this.top = this.y + this.size/2;
		this.bottom = this.y - this.size/2;
		this.left = this.x - this.size/2;
		this.right = this.x + this.size/2;
		// Left side paddle collision/scoring 
		if (this.left <= player.front) {
			let player_top = player.y+player.length/2;
			let player_bottom = player.y-player.length/2;
			// checks if it lines up with the paddle
			if (this.right >= player.back && this.bottom <= player_top && this.top >= player_bottom) {
				// vollies the ball rightward
				player_sound.play();
				this.velocityX = Math.abs(this.velocityX);
				// spin
				this.velocityY = -((player.y - this.y)/(player.length/2)) * this.maxY;
			}
			else if (this.right <= -width/2) {
				fail.play();
				cpu.points++;
				this.wait = true;
				this.set();
			}
		}
		// Right side paddle collision/scoring
		else if (this.right >= cpu.front) {
			let cpu_top = cpu.y+cpu.length/2;
			let cpu_bottom = cpu.y-cpu.length/2;
			// checks if it lines up with the paddle
			if (this.left <= cpu.back && this.bottom <= cpu_top && this.top >= cpu_bottom) {
				// vollies the ball leftward
				cpu_sound.play();
				this.velocityX = -Math.abs(this.velocityX);
				// spin
				this.velocityY = -((cpu.y - this.y)/(cpu.length/2)) * this.maxY;
			}
			else if (this.left >= width/2) {
				success.play();
				player.points++;
				this.wait = true;
				this.set();
			}
		}
		// top and bottom bounce
		if (this.top >= height/2) {
			this.velocityY = -Math.abs(this.velocityY);
			bounce.play();
		}
		else if (this.bottom <= -height/2) {
			this.velocityY = Math.abs(this.velocityY);
			bounce.play();
		}

		if (this.wait == false) {
			this.x += this.velocityX;
			this.y += this.velocityY;
		}
	},
	draw: function() {
		bg.fillRect(width/2-this.size/2+this.x,height/2-this.size/2-this.y,this.size,this.size);
	}
}