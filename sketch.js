//Player class
class Player
{
	constructor()
	{
		this.points = 0;
		this.paddles = new Array(maxPaddles);
		this.paddleGroup = new Group();
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

	//Applies a random effect to the player
	createEffect()
	{
		switch(Math.floor(random(0,effectCount))){
			case 0:
				console.log("Faster Paddles");
				this.setEffectText(ball.side, "Faster Paddles");
				this.paddles.forEach(element => {
					element.speed++;
				});
				break;
			case 1:
				console.log("Slower Paddles");
				this.setEffectText(ball.side, "Slower Paddles");
				this.paddles.forEach(element => {
					if(element.speed > 1)
					{
						element.speed--;
					}
				});
				break;
			case 2:
				console.log("Longer Paddles");
				this.setEffectText(ball.side, "Longer Paddles");
				this.paddles.forEach(element => {
					element.sprite.h += 10;
				});
				break;
			case 3:
				console.log("Shorter Paddles");
				this.setEffectText(ball.side, "Shorter Paddles");
				this.paddles.forEach(element => {
					if(element.h > 10)
					{
						element.sprite.h -= 10;
					}
				});
				break;
			case 4:
				console.log("Duplicate Ball");
				this.setEffectText(ball.side, "Duplicate Ball");
				balls[ballCount] = new Ball(ball.sprite.x, ball.sprite.y, ball.sprite.diameter, ballCount);
				ballCount++;
				break;
			case 5:
				if(ballCount === 1)
				{
					this.createEffect();
				}
				else
				{
					console.log("Remove Ball");
					this.setEffectText(ball.side, "Remove Ball");
					balls[ballCount - 1].sprite.remove();
					balls.splice(ballCount - 1, 1);
					
					ballCount--;
				}
				break;
			case 6:
				console.log("Stun Player");
				this.stunPaddles(5000);
				break;
			case 7:
				console.log("Faster Balls");
				this.setEffectText(ball.side, "Faster Balls");
				balls.forEach(element => {
					if(element.xSpeed > 0)
					{
						element.xSpeed++;
					}
					else
					{
						element.xSpeed--;
					}
				});
				break;
			case 8:
				console.log("Rocket Balls");
				this.setEffectText(ball.side, "Rocket Balls");
				balls.forEach(element => {
					if(element.xSpeed > 0)
					{
						element.xSpeed = 10;
					}
					else
					{
						element.xSpeed = -10;
					}
				});
				break;
			case 9:
				console.log("Reverse Trajectory");
				this.setEffectText(ball.side, "Reverse Trajectory");
				balls.forEach(element => {
					if(element.xSpeed > 0 && ball.side === "right")
					{
						element.xSpeed *= -1;
					}
					else if(element.xSpeed < 0 && ball.side === "left")
					{
						element.xSpeed *= -1;
					}
				});
				break;
			default:
				console.log("FAILED TO CREATE EFFECT! SOMETHING WENT WRONG!")
		}
	}

	//Sets the text of the effect text to the effect
	setEffectText(side, effect)
	{
		effectTimer = baseEffectTimer;
		if(side === "left")
		{
			leftEffectText = effect;
		}
		else
		{
			rightEffectText = effect;
		}
	}

	//Prevents moving paddles while active
	stunPaddles(time)
	{
		this.setEffectText(ball.side, "Stun Paddles for " + time / 1000 + " Seconds");
		
		this.paddles.forEach(element => {
			element.isStunned = true;
		});

		setTimeout(() => {
			this.removeStun();
		}, time);
	}

	//Allows moving paddles again
	removeStun()
	{
		this.paddles.forEach(element => {
			element.isStunned = false;
		});
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
		this.isStunned = false;
	}

	//Moves the paddle up and down.
	movePaddle(isUp)
	{
		if(this.isStunned) return;

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
	constructor(x,y,diameter,index)
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
		this.side = "right";
		this.isMainBall = false;
		this.index = index;
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

		//Checks what side of the play area the ball is on. Used to handle what player to act on.
		if(this.sprite.x > canvasArea / 2)
		{
			this.side = "right";
		}
		else
		{
			this.side = "left";
		}
	}

	//Sets the balls location to the origin and changes its y speed
	returnToOrigin()
	{
		this.sprite.x = canvasArea / 2;
		this.sprite.y = canvasArea / 2;
		this.ySpeed = random(-0.5,0.5);
		this.xSpeed = 1;
		this.bounces = 0;

		if(this.isMainBall === false)
		{
			removeBall(this.index);
		}
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
	bounceHandler()
	{
		//Increments bounces and increases x speed if the bounce threshold is met
		this.bounces++

		//Creates an effect for the player only if the ball is the main ball
		if(this.isMainBall === true)
		{
			if(this.side === "left")
				{
					leftPlayer.createEffect();
				}
				else
				{
					rightPlayer.createEffect();
				}
		}
		
		//Increases ball speed when the threshhold has been met
		if(this.bounces >= bounceThreshold)
		{
			//Checks which side the ball bounces last. Changes xSpeed depending on the last side.
			if(this.side === "right" && this.xSpeed > -10)
			{
				this.xSpeed--;
			}
			else if(this.side === "left" && this.xSpeed < 10)
			{
				this.xSpeed++;
			}
			this.bounces = 0;

			//Create a global modifier
			if(this.isMainBall)
			{
				createGlobalEffect();
			}
		}
	}
}

//Constant variables
const maxPaddles = 4;
const maxBalls = 100;
const winningScore = 25;
const bounceThreshold = 3;
const effectCount = 10;
const baseEffectTimer = 120;
const globalEffectCount = 5;

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

//The ball
let ball;
let ballCount = 1;

//Balls array
let balls = new Array(maxBalls);
let ballGroup;

//Players
let leftPlayer;
let rightPlayer;

//Effect Trackers
let leftEffectText = "";
let rightEffectText = "";
let centerEffectText = "";
let effectTimer = baseEffectTimer;

function setup() {
	new Canvas(canvasArea, canvasArea);
	displayMode('centered');
	rectMode('center');
	textAlign("center");

	//Players
	leftPlayer = new Player();
	rightPlayer = new Player();

	//Create Sprite Groups
	ballGroup = new Group();

	//Create the paddles and add them to their array and group
	leftPaddle = new Paddle(upperBounds + 5, canvasArea / 2, 10, 50);
	rightPaddle = new Paddle(lowerBounds - 5, canvasArea / 2, 10, 50);

	leftPlayer.paddles[0] = leftPaddle;
	leftPlayer.paddleGroup.add(leftPaddle.sprite);

	rightPlayer.paddles[0] = rightPaddle;
	rightPlayer.paddleGroup.add(rightPaddle.sprite);

	//Create the ball
	ball = new Ball(canvasArea / 2, canvasArea / 2, 5, 0);
	ball.isMainBall = true;
	balls[0] = ball;
	ball.sprite.color = 'red';
	ball.sprite.stroke = 'red';
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
	text(leftPlayer.points,100,50);
	text(rightPlayer.points,canvasArea - 100, 50);
	
	//Create the effect Trackers
	effectTimer--;
	if(effectTimer <= 0)
	{
		leftEffectText = "";
		rightEffectText = "";
	}
	text(leftEffectText, 200,100);
	text(rightEffectText,canvasArea - 200, 100);
	text(centerEffectText, canvasArea / 2, 50);


	if(gameOver)
	{
		textSize(96);
		text(winningPlayer + " Player Wins!",canvasArea / 2, 100);
	}

	//Player 1 controls
	if(keyIsDown("87"))
	{
		leftPlayer.paddles.forEach(element => {
			element.movePaddle(true);
		});
	}
	if(keyIsDown("83"))
	{
		leftPlayer.paddles.forEach(element => {
			element.movePaddle(false);
		});
	}

	//Player 2 controls
	if(keyIsDown(UP_ARROW))
	{
		rightPlayer.paddles.forEach(element => {
			element.movePaddle(true);
		});
	}
	if(keyIsDown(DOWN_ARROW))
	{
		rightPlayer.paddles.forEach(element => {
			element.movePaddle(false);
		});
	}

	//Make every ball in play move
	balls.forEach(element => {
		element.moveBall();
	});

	//Check for ball collisions
	ballGroup.overlaps(leftPlayer.paddleGroup,onPaddleCollision);
	ballGroup.overlaps(rightPlayer.paddleGroup,onPaddleCollision);
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
	balls[targetIndex].bounceHandler();
}

//Creates a global modifier
function createGlobalEffect()
{
	switch(Math.floor(random(0,globalEffectCount))){
		case 0:
			console.log("Ballsplosion");
			centerEffectText = "Ballsplosion";
			balls[ballCount] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount);
			balls[ballCount].ySpeed = 1.0;
			balls[ballCount + 1] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 1);
			balls[ballCount + 1].ySpeed = 0.0;
			balls[ballCount + 2] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 2);
			balls[ballCount + 2].ySpeed = -1.0;
			balls[ballCount + 3] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 3);
			balls[ballCount + 3].xSpeed = -1.0;
			balls[ballCount + 3].ySpeed = -1.0;
			balls[ballCount + 4] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 4);
			balls[ballCount + 4].xSpeed = -1.0;
			balls[ballCount + 4].ySpeed = 0.0;
			balls[ballCount + 5] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 5);
			balls[ballCount + 5].xSpeed = -1.0;
			balls[ballCount + 5].ySpeed = 1.0;
			ballCount += 6;
			break;
		case 1:
			if(typeof leftPlayer.paddles[3] === 'undefined')
			{
				console.log("Wii Sports");
				centerEffectText = "Wii Sports";

				leftPlayer.paddles[3] = new Paddle(canvasArea / 2 - 25, canvasArea / 2, 10, 50);
				leftPlayer.paddleGroup.add(leftPlayer.paddles[3].sprite);

				rightPlayer.paddles[3] = new Paddle(canvasArea / 2 + 25, canvasArea / 2, 10, 50);
				rightPlayer.paddleGroup.add(rightPlayer.paddles[3].sprite);

				setTimeout(() => {
					removeWiiSportsPaddles();
				}, 10000);
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 2:
			console.log("Inverted Controls");
			centerEffectText = "";
			createGlobalEffect();
			break;
		case 3:
			if(playArea < maxArea)
			{
				console.log("Bigger Area");
				centerEffectText = "Bigger Area";
				playArea += 50;
				upperBounds = (canvasArea / 2) - (playArea / 2) + 5; 
				lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; 
				leftPlayer.paddles[0].sprite.x = upperBounds + 5;
				rightPlayer.paddles[0].sprite.x = lowerBounds - 5;
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 4:
			if(playArea > 200)
			{
				console.log("Lower Area");
				centerEffectText = "Lower Area";
				playArea -= 50;
				upperBounds = (canvasArea / 2) - (playArea / 2) + 5; 
				lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; 
				leftPlayer.paddles[0].sprite.x = upperBounds + 5;
				rightPlayer.paddles[0].sprite.x = lowerBounds - 5;
			}
			else
			{
				createGlobalEffect();
			}
			break;
		default:
			console.log("FAILED TO CREATE EFFECT! SOMETHING WENT WRONG!")
	}
}

function removeBall(index)
{
	balls[index].sprite.remove();
	balls.splice(index,1);
	ballCount--;

	balls.forEach(element => {
		if(element.index > index)
		{
			element.index--;
		}
	});
}

function removeWiiSportsPaddles()
{
	leftPlayer.paddles[3].sprite.remove();
	leftPlayer.paddles.splice(3,1);

	rightPlayer.paddles[3].sprite.remove();
	rightPlayer.paddles.splice(3,1);
}
