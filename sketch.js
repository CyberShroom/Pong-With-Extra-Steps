//Player class
class Player
{
	constructor()
	{
		this.points = 0;
		this.paddles = new Array(maxPaddles);
		this.paddleGroup = new Group();
		this.shieldCount = 0;
		this.paddleCount = 1;
	}

	//Increments the players points. Ends the game upon reaching 10.
	addPoints(player, deathBall)
	{
		if(deathBall)
		{
			this.points = 999;
		}
		else
		{
			this.points++;
		}

		if(this.points >= winningScore)
		{
			winningPlayer = player;
			gameOver = true;
			soundVictory.play();
		}
	}

	//Applies a random effect to the player
	createEffect()
	{
		switch(Math.floor(random(0,effectCount))){
			case 0:
				console.log("Faster Paddles");
				this.setEffectText(ball.side, "Faster Paddles", "green");
				soundGood.play();
				this.paddles.forEach(element => {
					element.speed++;
				});
				break;
			case 1:
				console.log("Slower Paddles");
				this.setEffectText(ball.side, "Slower Paddles", "red");
				soundBad.play();
				this.paddles.forEach(element => {
					if(element.speed > 1)
					{
						element.speed--;
					}
				});
				break;
			case 2:
				console.log("Longer Paddles");
				this.setEffectText(ball.side, "Longer Paddles", "green");
				soundGood.play();
				this.paddles.forEach(element => {
					element.sprite.h += 10;
				});
				break;
			case 3:
				console.log("Shorter Paddles");
				this.setEffectText(ball.side, "Shorter Paddles", "red");
				soundBad.play();
				this.paddles.forEach(element => {
					if(element.h > 10)
					{
						element.sprite.h -= 10;
					}
				});
				break;
			case 4:
				console.log("Duplicate Ball");
				this.setEffectText(ball.side, "Duplicate Ball", "green");
				soundGood.play();
				balls[ballCount] = new Ball(ball.sprite.x, ball.sprite.y, ball.sprite.diameter, ballCount);
				ballCount++;
				break;
			case 5:
				if(this.shieldCount === 0)
				{
					console.log("Shield");
					this.setEffectText(ball.side, "Shield", "green");
					soundGood.play();
					this.addShield(5);
				}
				else
				{
					this.createEffect();
				}
				break;
			case 6:
				console.log("Stun Player");
				this.stunPaddles(5000);
				break;
			case 7:
				break;
			case 8:
				break;
			case 9:
				console.log("Reverse Trajectory");
				this.setEffectText(ball.side, "Reverse Trajectory", "green");
				soundGood.play();
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
	setEffectText(side, effect, color)
	{
		effectTimer = baseEffectTimer;
		if(side === "left")
		{
			leftEffectText = effect;
			leftTextColor = color;
		}
		else
		{
			rightEffectText = effect;
			rightTextColor = color;
		}
	}

	//Prevents moving paddles while active
	stunPaddles(time)
	{
		this.setEffectText(ball.side, "Stun Paddles for " + time / 1000 + " Seconds", "red");
		soundStun.play();
		
		this.paddles.forEach(element => {
			element.isStunned = true;
			element.sprite.color = 'yellow';
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

		this.resetPaddleColor();
	}

	resetPaddleColor()
	{
		this.paddles.forEach(element => {
			element.sprite.color = 'white';
		});

		if(this.shieldCount !== 0)
		{
			this.paddles[0].sprite.color = 'blue';
		}
	}

	addShield(amount)
	{
		this.shieldCount += amount;
		this.paddles[0].sprite.color = "blue";
		soundShield.play();
	}

	adjustPaddleLocations(player)
	{
		if(player === "left")
		{
			this.paddles[0].sprite.x = upperBounds + 5;
		}
		else
		{
			this.paddles[0].sprite.x = lowerBounds - 5;
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
		this.soundHit = loadSound("Sounds/Hit.mp3");
		this.soundHit.volume = this.soundHit.volume / 2;
		this.soundScore = loadSound("Sounds/score.mp3");
		this.soundScore.volume = this.soundScore.volume / 2;
		this.soundParry = loadSound("Sounds/parry.mp3");
		this.startRight = true;
		this.isImmortal = false;
		this.isDeath = false;
		this.deathsToll = 0;
	}

	//Moves the ball every frame
	moveBall()
	{
		//Stops the ball from moving if the game is over
		if(gameOver)
		{
			return;
		}
		if(this.isDeath)
		{
			if(this.xSpeed < 0)
			{
				this.xSpeed = -0.1 - (0.1 * this.deathsToll);
			}
			else
			{
				this.xSpeed = 0.1 + (0.1 * this.deathsToll);
			}

			if(this.ySpeed > 0.1 + (0.1 * this.deathsToll))
			{
				this.ySpeed = 0.1 + (0.1 * this.deathsToll);
			}
			else if(this.ySpeed < -0.1 - (0.1 * this.deathsToll))
			{
				this.ySpeed = -0.1 - (0.1 * this.deathsToll);
			}	

			soundClose.volume = ((1 / sq(playArea / 2)) * sq(this.sprite.x - (canvasArea / 2)));
		}
		//Checks if the ball is about to move out of the play area and reverses its y speed.
		if(this.sprite.y >= lowerBounds || this.sprite.y <= upperBounds)
		{
			this.ySpeed *= -1;
		}

		//Checks if the ball has scored, grants a point to the player, and resets the balls location.
		if(this.sprite.x >= lowerBounds)
		{
			if(rightPlayer.shieldCount === 0)
			{
				leftPlayer.addPoints("left", this.isDeath);
				this.returnToOrigin();
			}
			else
			{
				this.soundParry.play();
				rightPlayer.shieldCount--;
				this.xSpeed *= -1;

				if(rightPlayer.shieldCount === 0)
				{
					rightPlayer.paddles[0].sprite.color = 'white';
				}
			}
			
		}
		else if(this.sprite.x <= upperBounds)
		{
			if(leftPlayer.shieldCount === 0)
			{
				rightPlayer.addPoints("right", this.isDeath);
				this.returnToOrigin();
			}
			else
			{
				this.soundParry.play();
				leftPlayer.shieldCount--;
				this.xSpeed *= -1;

				if(leftPlayer.shieldCount === 0)
				{
					leftPlayer.paddles[0].sprite.color = 'white';
				}
			}
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
		this.soundScore.play();
		this.sprite.x = canvasArea / 2;
		this.sprite.y = canvasArea / 2;
		this.ySpeed = random(-0.5,0.5);
		if(this.startRight)
		{
			this.xSpeed = 1;
			this.startRight = false;
		}
		else
		{
			this.xSpeed = -1;
			this.startRight = true;
		}
		
		this.bounces = 0;

		if(this.isMainBall === false && this.isImmortal === false)
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
		this.soundHit.play();

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
const globalEffectCount = 10;

//Other variables
let gameOver = false;
let winningPlayer;
let jumpscare = false;
let partyModeState = -1;
let deathHasBeenChosen = false;

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
let leftTextColor = "white";
let rightTextColor = "white";

//Sounds
let soundGood;
let soundBad;
let soundBackground;
let soundVictory;
let soundJumpscare;
let soundShield;
let soundParty;
let soundStun;
let soundDeath;
let soundClose;
let hasInteracted = false;

//Images
let jumpscareAnimation;

function setup() {
	new Canvas(canvasArea, canvasArea);
	displayMode('centered');
	rectMode('center');
	textAlign("center");

	
	//Sounds
	soundGood = loadSound("Sounds/good.mp3");
	soundBad = loadSound("Sounds/bad.mp3");
	soundBackground = loadSound("Sounds/background.mp3");
	soundVictory = loadSound("Sounds/victory.mp3");
	soundJumpscare = loadSound("Sounds/jumpscare.mp3");
	soundShield = loadSound("Sounds/shield.mp3");
	soundParty = loadSound("Sounds/party.mp3");
	soundStun = loadSound("Sounds/stun.mp3");
	soundDeath = loadSound("Sounds/death.mp3");
	soundClose = loadSound("Sounds/closer.mp3");
	soundClose.volume = 0;

	//images
	jumpscareAnimation = loadAni("Pictures/jumpscare_animation_folder/frame0.jpg", 19);

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
	ball.isImmortal = true;
	balls[0] = ball;
	ball.sprite.color = 'red';
	ball.sprite.stroke = 'red';

	soundBackground.volume = soundBackground.volume / 2;
}

function draw() {
	//Create the backdrop
	background('black');
	fill('black');
	stroke('white');
	rect(canvasArea / 2, canvasArea / 2, playArea, playArea);

	//Creates the score trackers
	textSize(24);
	fill('blue');
	stroke('blue');
	text(leftPlayer.shieldCount,150,50);
	text(rightPlayer.shieldCount,canvasArea - 150,50);

	textSize(48);
	fill('white');
	stroke('white');
	text(leftPlayer.points,100,50);
	text(rightPlayer.points,canvasArea - 100, 50);
	
	//Create the effect Trackers
	effectTimer--;
	if(effectTimer <= 0)
	{
		leftEffectText = "";
		rightEffectText = "";
		centerEffectText = "";
		leftTextColor = "white";
		rightTextColor = "white";
	}
	fill(leftTextColor);
	stroke(leftTextColor);
	text(leftEffectText, 200,100);
	fill(rightTextColor);
	stroke(rightTextColor);
	text(rightEffectText,canvasArea - 200, 100);
	fill('white');
	stroke('white');
	text(centerEffectText, canvasArea / 2, 50);

	if(gameOver)
	{
		textSize(96);
		text(winningPlayer + " Player Wins!",canvasArea / 2, 100);
	}

	//Player 1 controls
	if(keyIsDown("87"))
	{
		hasInteracted = true;
		leftPlayer.paddles.forEach(element => {
			element.movePaddle(true);
		});
	}
	if(keyIsDown("83"))
	{
		hasInteracted = true;
		leftPlayer.paddles.forEach(element => {
			element.movePaddle(false);
		});
	}

	//Player 2 controls
	if(keyIsDown(UP_ARROW))
	{
		hasInteracted = true;
		rightPlayer.paddles.forEach(element => {
			element.movePaddle(true);
		});
	}
	if(keyIsDown(DOWN_ARROW))
	{
		hasInteracted = true;
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

	if(soundBackground.isPlaying() === false && hasInteracted === true)
	{
		soundBackground.play();
	}

	if(jumpscare)
	{
		animation(jumpscareAnimation, canvasArea / 2, canvasArea / 2, 0, 8, 8);
	}

	if(deathHasBeenChosen)
	{
		soundClose.play();
	}
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
			balls[ballCount + 1].xSpeed *= 2;
			balls[ballCount + 2] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 2);
			balls[ballCount + 2].ySpeed = -1.0;
			balls[ballCount + 3] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 3);
			balls[ballCount + 3].xSpeed = -1.0;
			balls[ballCount + 3].ySpeed = -1.0;
			balls[ballCount + 4] = new Ball(canvasArea / 2, canvasArea / 2, 5, ballCount + 4);
			balls[ballCount + 4].xSpeed = -2.0;
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
			console.log("JUMPSCARE!");
			jumpscare = true;
			soundJumpscare.play();
			leftPlayer.stunPaddles(1500);
			rightPlayer.stunPaddles(1500);
			setTimeout(() => {
				jumpscareTimer();
			}, 1500);
			break;
		case 3:
			if(playArea < maxArea)
			{
				console.log("Bigger Area");
				centerEffectText = "Bigger Area";
				playArea += 50;
				upperBounds = (canvasArea / 2) - (playArea / 2) + 5; 
				lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; 
				leftPlayer.adjustPaddleLocations("left");
				rightPlayer.adjustPaddleLocations("right");
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
				leftPlayer.adjustPaddleLocations("left");
				rightPlayer.adjustPaddleLocations("right");
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 5:
			console.log("Faster Balls");
			centerEffectText = "Faster Balls";
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
		case 6:
			console.log("Rocket Balls");
			centerEffectText = "Rocket Balls";
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
		case 7:
			if(partyModeState === -1)
			{
				console.log("Party Mode")
				centerEffectText = "Party Mode";
				soundParty.play();
				partyModeState = 0;
				partyMode();
				setTimeout(() => {
					removePartyMode();
				}, 10000);
				leftPlayer.shieldCount *= 2;
				rightPlayer.shieldCount *= 2;
				leftPlayer.addShield(1);
				rightPlayer.addShield(1);
				leftPlayer.paddles.forEach(element => {
					element.speed++;
					element.sprite.h += 50;
				});
				rightPlayer.paddles.forEach(element => {
					element.speed++;
					element.sprite.h += 50;
				});
			}
			else
			{
				createGlobalEffect();
			}
			
			break;
		case 8:
			if(ballCount > 1)
			{
				console.log("Immortal Balls")
				centerEffectText = "Immortal Balls";
				balls.forEach(element => {
					if(element.isDeath === false)
					{
						element.isImmortal = true;
						element.sprite.color = "purple";
						element.sprite.stroke = "purple";
					}
				});
				balls[0].sprite.color = 'red';
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 9:
			soundDeath.play();
			console.log("Death Ball");

			if(deathHasBeenChosen !== true)
			{
				centerEffectText = "Death Has Arrived";
				balls[ballCount] = new Ball(canvasArea / 2, canvasArea / 2, ball.sprite.diameter, ballCount);
				balls[ballCount].isDeath = true;
				balls[ballCount].isImmortal = true;
				balls[ballCount].sprite.color = 'yellow';
				balls[ballCount].sprite.stroke = 'yellow';
				balls[ballCount].xSpeed = 0.1;
				ballCount++;
				deathHasBeenChosen = true;
			}
			else
			{
				balls.forEach(element => {
					if(element.isDeath)
					{
						element.deathsToll++;
					}
				});
				centerEffectText = "Death Grows Near";
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

function jumpscareTimer()
{
	jumpscare = false;
}

function partyMode()
{
	if(partyModeState === 0)
	{
		balls.forEach(element => {
			element.sprite.color = "orange";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "blue";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "blue";
		});

		partyModeState = 1;
	}
	else if(partyModeState === 1)
	{
		balls.forEach(element => {
			element.sprite.color = "yellow";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "green";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "green";
		});

		partyModeState = 2;
	}
	else if(partyModeState === 2)
	{
		balls.forEach(element => {
			element.sprite.color = "green";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "yellow";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "yellow";
		});

		partyModeState = 3;
	}
	else if(partyModeState === 3)
	{
		balls.forEach(element => {
			element.sprite.color = "blue";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "orange";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "orange";
		});

		partyModeState = 4;
	}
	else if(partyModeState === 4)
	{
		balls.forEach(element => {
			element.sprite.color = "purple";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "red";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "red";
		});

		partyModeState = 5;
	}
	else if(partyModeState === 5)
	{
		balls.forEach(element => {
			element.sprite.color = "red";
		});
		leftPlayer.paddles.forEach(element => {
			element.sprite.color = "purple";
		});
		rightPlayer.paddles.forEach(element => {
			element.sprite.color = "purple";
		});

		partyModeState = 0;
	}

	if(partyModeState !== -1)
	{
		setTimeout(() => {
			partyMode();
		}, 100);
	}
	else
	{
		balls.forEach(element => {
			if(element.isImmortal)
			{
				element.sprite.color = "purple";
			}
			else if(element.isDeath)
			{
				element.sprite.color = "yellow";
			}
			else
			{
				element.sprite.color = "white";
			}

		});
		balls[0].sprite.color = "red";
		leftPlayer.resetPaddleColor();
		rightPlayer.resetPaddleColor();
	}
}

function removePartyMode()
{
	partyModeState = -1;
}
