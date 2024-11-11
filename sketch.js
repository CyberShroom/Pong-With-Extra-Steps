//Player class
class Player
{
	constructor()
	{
		this.points = 0;
	}

	//Increments the players points. Ends the game upon reaching 10.
	addPoints(player)
	{
		this.points++;

		if(this.points >= winningScore)
		{
			winningPlayer = player;
			gameOver = true;
		}
	}
}

//Paddle class
class Paddle
{
	constructor(x,y,w,h)
	{
		this.sprite = new Sprite();
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.w = w;
		this.sprite.h = h;
		this.sprite.color = 'white';
		this.speed = 1;
	}

	//Moves the paddle up and down.
	movePaddle(isUp)
	{
		if(isUp && this.sprite.y > upperBounds + this.sprite.halfHeight)
		{
			this.sprite.y -= this.speed;
		}
		else if(!isUp && this.sprite.y < lowerBounds - this.sprite.halfHeight)
		{
			this.sprite.y += this.speed;
		}
	}
}

//Ball class
class Ball
{
	constructor(x,y,diameter)
	{
		this.sprite = new Sprite()
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.diameter = diameter;
		this.sprite.color = 'white';
		this.xSpeed = 1;
		this.ySpeed = random(-0.5,0.5);
		ballGroup.add(this.sprite);
		this.bounces = 0;
		this.lastBounce = "left";
	}

	//Moves the ball every frame
	moveBall()
	{
		//Stops the ball from moving if the game is over
		if(gameOver)
		{
			return;
		}
		//Checks if the ball is about to move out of the play area and reverses its y speed.
		if(this.sprite.y >= lowerBounds || this.sprite.y <= upperBounds)
		{
			this.ySpeed *= -1;
		}

		//Checks if the ball has scored, grants a point to the player, and resets the balls location.
		if(this.sprite.x >= lowerBounds)
		{
			leftPlayer.addPoints("left");
			this.returnToOrigin();
		}
		else if(this.sprite.x <= upperBounds)
		{
			rightPlayer.addPoints("right");
			this.returnToOrigin();
		}

		//Moves the ball forward based on its speed.
		this.sprite.x += this.xSpeed;
		this.sprite.y += this.ySpeed;
	}

	//Sets the balls location to the origin and changes its y speed
	returnToOrigin()
	{
		this.sprite.x = canvasArea / 2;
		this.sprite.y = canvasArea / 2;
		this.ySpeed = random(-0.5,0.5);
		this.xSpeed = 1;
		this.bounces = 0;
	}

	//Changes the y speed of the ball
	changeYSpeed(paddleY, paddleHeight)
	{
		//Change the y speed of the ball if it hits the edges of the paddles
		if(this.sprite.y > paddleY && this.sprite.y - paddleY > paddleHeight * 0.2)
		{
			this.ySpeed = (this.sprite.y - paddleY) / 10;
		}
		else if(this.sprite.y < paddleY && paddleY - this.sprite.y > paddleHeight * 0.2)
		{
			this.ySpeed = (this.sprite.y - paddleY) / 10;
		}
	}

	//increments bounces
	incrementBounces()
	{
		//Increments bounces and increases x speed if the bounce threshold is met
		this.bounces++;
		if(this.bounces >= bounceThreshold)
		{
			//Checks which side the ball bounces last. Changes xSpeed depending on the last side.
			if(this.lastBounce === "left")
			{
				this.lastBounce = "right";
				this.xSpeed--;
			}
			else if(this.lastBounce === "right")
			{
				this.lastBounce = "left";
				this.xSpeed++;
			}
			this.bounces = 0;
		}
	}
}

//Constant variables
const maxPaddles = 1;
const maxBalls = 100;
const winningScore = 10;
const bounceThreshold = 3;

//Other variables
let gameOver = false;
let winningPlayer;

//Canvas variables
let playArea = 400;
const maxArea = 800;
const canvasArea = 1000;
let upperBounds = (canvasArea / 2) - (playArea / 2) + 5; //The upper and left border
let lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; //The lower and right border

//The paddles
let leftPaddle;
let rightPaddle;

//Paddle arrays
let leftPlayerPaddles = new Array(maxPaddles);
let rightPlayerPaddles = new Array(maxPaddles);
let leftPaddleGroup;
let rightPaddleGroup;

//The ball
let ball;

//Balls array
let balls = new Array(maxBalls);
let ballGroup;

//Players
const leftPlayer = new Player();
const rightPlayer = new Player();

function setup() {
	new Canvas(canvasArea, canvasArea);
	displayMode('centered');
	rectMode('center');
	textAlign("center");

	//Create Sprite Groups
	leftPaddleGroup = new Group();
	rightPaddleGroup = new Group();
	ballGroup = new Group();

	//Create the paddles and add them to their array and group
	leftPaddle = new Paddle(upperBounds + 5, canvasArea / 2, 10, 50);
	rightPaddle = new Paddle(lowerBounds - 5, canvasArea / 2, 10, 50);

	leftPlayerPaddles[0] = leftPaddle;
	leftPaddleGroup.add(leftPaddle.sprite);

	rightPlayerPaddles[0] = rightPaddle;
	rightPaddleGroup.add(rightPaddle.sprite);

	//Create the ball
	ball = new Ball(canvasArea / 2, canvasArea / 2, 5);
	balls[0] = ball;
}

function draw() {
	//Create the backdrop
	background('black');
	fill('black');
	stroke('white');
	rect(canvasArea / 2, canvasArea / 2, playArea, playArea);

	//Creates the score trackers
	textSize(48);
	fill('white');
	text(leftPlayer.points,100,100);
	text(rightPlayer.points,canvasArea - 100, 100);

	if(gameOver)
	{
		textSize(96);
		text(winningPlayer + " Player Wins!",canvasArea / 2, 100);
	}

	//Player 1 controls
	if(keyIsDown("87"))
	{
		leftPaddle.movePaddle(true);
	}
	if(keyIsDown("83"))
	{
		leftPaddle.movePaddle(false);
	}

	//Player 2 controls
	if(keyIsDown(UP_ARROW))
	{
		rightPaddle.movePaddle(true);
	}
	if(keyIsDown(DOWN_ARROW))
	{
		rightPaddle.movePaddle(false);
	}

	//Make every ball in play move
	balls.forEach(element => {
		element.moveBall();
	});

	//Check for ball collisions
	ballGroup.overlaps(leftPaddleGroup,onPaddleCollision);
	ballGroup.overlaps(rightPaddleGroup,onPaddleCollision);
}

//Reverse the trajectory of a ball that collides with a paddle
function onPaddleCollision(targetBall, targetPaddle)
{
	//Gets the Ball from the target sprite
	let targetIndex = ballGroup.indexOf(targetBall);

	//Change the y speed of the ball if it hits the edges of the paddles
	balls[targetIndex].changeYSpeed(targetPaddle.y,targetPaddle.h);

	balls[targetIndex].xSpeed *= -1;
	
	//Increments bounces and increases x speed if the bounce threshold is met
	balls[targetIndex].incrementBounces();
}
