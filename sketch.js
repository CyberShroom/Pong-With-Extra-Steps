/*
	This program was made with P5-Play. P5-Play provides tools that make development easier. The tool provides a class called groups, which are dynamic arrays that store sprites.
	Groups can be used in conjunction with colliders to allow objects to run functions when they touch. However, groups only store sprites and cannot store anything else.
	This was problematic since I'm using custom objects, but a parallel array can be used to circumvent this issue since groups are just arrays. The tool also makes it easier to handle
	sprites. Instead of having to define shapes or carefully define fills and strokes, sprites come with their own functions and variable that do the same thing but easier.
	Sprites contain a color and stroke variable that act as fill and stroke respectively. These variable don't impact other sprites or objects. I used constants to define variables that shouldn't be changed,
	max size, and configuration options. I used conditionals to check the status of variables. Iteration is heavily used in conjunction with the array of balls to either find balls with specific
	properties or to apply something to all of them. Functions are used throughout to condense and reuse code. The paddles, players, and balls are all their own classes with extensive construtors, properties, and methods.
*/



//Player class
class Player
{
	constructor(playerPaddle, side)
	{
		this.points = 0; //The points the player has
		this.paddle = playerPaddle;
		this.paddleGroup = new Group();
		this.paddleGroup.add(this.paddle.sprite);
		this.middlePaddle;
		this.shieldCount = 0; //The amount of shielding the player has
		this.paddleCount = 1; 
		this.side = side;
	}

	//Increments the players points. Ends the game upon reaching 10.
	addPoints(deathBall)
	{
		//Checks if the deathball scored
		if(deathBall)
		{
			this.points = 999;
		}
		else
		{
			this.points++;
		}

		//Checks if the player has enough points to win
		if(this.points >= winningScore)
		{
			winningPlayer = this.side;
			gameOver = true;

			//Play victory sound depending on how the player won
			if(this.points === 999)
			{
				soundLaugh.play()
			}
			else
			{
				soundVictory.play();
			}
		}
	}

	//Applies a random effect to the player
	createEffect()
	{
		switch(Math.floor(random(0,effectCount))){
			case 0: //Increases the speed of the players paddle
				this.setEffectText("Faster Paddles", "green");
				soundGood.play();
				this.paddle.speed++;
				break;
			case 1: //Decreases the speed of the players paddle
				this.setEffectText("Slower Paddles", "red");
				soundBad.play();
				if(this.paddle.speed > 1)
				{
					this.paddle.speed--;
				}
				break;
			case 2: //Increase the height of the players paddle
				this.setEffectText("Longer Paddles", "green");
				soundGood.play();
				this.paddle.sprite.h += 10;
				break;
			case 3: //Decreases the height of the players paddle
				this.setEffectText("Shorter Paddles", "red");
				soundBad.play();
				if(this.paddle.sprite.h > 10)
				{
					this.paddle.sprite.h -= 10;
				}
				break;
			case 4: //Create a ball with the opposite y trajectory of the main ball
				this.setEffectText("Richochet", "green");
				soundGood.play();
				this.ballRef = createBall(ball.sprite.x, ball.sprite.y, ball.sprite.diameter);
				this.ballRef.ySpeed = ball.ySpeed * -1;
				break;
			case 5: //Grant the player a shield, but only if they currently don't have one
				if(this.shieldCount === 0)
				{
					this.setEffectText("Shield", "green");
					this.addShield(5);
				}
				else
				{
					this.createEffect();
				}
				break;
			case 6: //Stun the player for 5 seconds
				this.stunPaddles(5000);
				break;
			case 7: //Fire 2 additional balls at opposite diagonals
				this.setEffectText("Shotgun", "green");
				soundGood.play();

				//First ball
				this.ballRef = createBall(ball.sprite.x, ball.sprite.y, ball.sprite.diameter);
				this.ballRef.ySpeed = 1;

				//Check what side of the field the player is on and change speed accordingly
				if(this.side === "left")
				{
					this.ballRef.sprite.x += 1;
					this.ballRef.xSpeed = 0.75;
				}
				else
				{
					this.ballRef.sprite.x -= 1;
					this.ballRef.xSpeed = -0.75;
				}

				//2nd ball
				this.ballRef = createBall(ball.sprite.x, ball.sprite.y, ball.sprite.diameter);
				this.ballRef.ySpeed = -1;

				//Check what side of the field the player is on and change speed accordingly
				if(this.side === "left")
				{
					this.ballRef.sprite.x += 1;
					this.ballRef.xSpeed = 0.75;
				}
				else
				{
					this.ballRef.sprite.x -= 1;
					this.ballRef.xSpeed = -0.75;
				}

				break;
			case 8: //Same as richochet but the ball is indisguingishable from the main ball
				this.setEffectText("False Positive", "green");
				soundGood.play();
				this.ballRef = createBall(ball.sprite.x, ball.sprite.y, ball.sprite.diameter);
				this.ballRef.ySpeed = ball.ySpeed * -1;
				this.ballRef.xSpeed = ball.xSpeed;
				this.ballRef.setBallColor("red");
				this.ballRef.isFake = true;
				break;
			case 9: //Invert the trajectory of all balls that are coming toward you
				this.setEffectText("Reverse Trajectory", "green");
				soundGood.play();

				//For each ball, invert its speed if its heading towards the player.
				balls.forEach(element => {
					if(element.xSpeed > 0 && this.side === "right")
					{
						element.xSpeed *= -1;
					}
					else if(element.xSpeed < 0 && this.side === "left")
					{
						element.xSpeed *= -1;
					}
				});
				break;
			default: //This should never run
				console.log("FAILED TO CREATE EFFECT! SOMETHING WENT WRONG!")
		}
	}

	//Sets the text of the effect text to the effect
	setEffectText(effect, color)
	{
		effectTimer = baseEffectTimer; //How long before the text gets reset
		if(this.side === "left")
		{
			//Left players text
			leftEffectText = effect;
			leftTextColor = color;
		}
		else
		{
			//Right players text
			rightEffectText = effect;
			rightTextColor = color;
		}
	}

	//Prevents moving paddles while active
	stunPaddles(time)
	{
		this.setEffectText("Stun Paddles for " + time / 1000 + " Seconds", "red");
		soundStun.play();
		
		this.paddle.isStunned = true;
		this.setPaddleColor('yellow');

		setTimeout(() => {
			this.removeStun();
		}, time);
	}

	//Allows moving paddles again
	removeStun()
	{
		this.paddle.isStunned = false;
		if(typeof this.middlePaddle !== 'undefined')
		{
			this.middlePaddle.isStunned = false;
		}

		this.resetPaddleColor();
	}

	//Sets paddle color back to whatever color it should be
	resetPaddleColor()
	{
		//If the paddle is stunned, it should be yellow
		if(this.paddle.isStunned) //If player is stunned, the paddle should be yellow
		{
			this.setPaddleColor("yellow");
		}
		else if(this.shieldCount !== 0) //If the player has a shield, the paddle should be blue
		{
			this.setPaddleColor("blue");
		}
		else
		{
			this.setPaddleColor("white");
		}
	}

	//Adds to the players shield amount
	addShield(amount)
	{
		this.shieldCount += amount;
		this.setPaddleColor("blue");
		soundShield.play();
	}

	//Moves the paddle to the edge of the player area whenever its size changes
	adjustPaddleLocations()
	{
		if(this.side === "left")
		{
			this.paddle.sprite.x = upperBounds + 5;
		}
		else
		{
			this.paddle.sprite.x = lowerBounds - 5;
		}
	}

	//Checks if middle paddle exists and moves it if it does
	moveMiddlePaddle(isUp)
	{
		if(typeof this.middlePaddle !== 'undefined')
		{
			this.middlePaddle.movePaddle(isUp);
		}
	}

	//Changes all paddle color to the given color
	setPaddleColor(color)
	{
		this.paddle.sprite.color = color;
		this.paddle.sprite.stroke = color;
		if(typeof this.middlePaddle !== 'undefined')
		{
			this.middlePaddle.sprite.color = color;
			this.middlePaddle.sprite.stroke = color;
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
		this.speed = 1; //Speed of the paddle
		this.isStunned = false; //Whether its allowed to move
	}

	//Moves the paddle up and down.
	movePaddle(isUp)
	{
		if(this.isStunned) return; //Cant move when stunned lol

		//Checks the input direction and whether the paddle is at the edge of the area
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
		this.xSpeed = 1; //The speed the ball moves in the x direction
		this.ySpeed = random(-0.5,0.5); //The speed the ball moves in the y direction. Initializes to a random speed.
		ballGroup.add(this.sprite); //Adds the balls sprite to the group
		this.bounces = 0; //The number of times this ball has bounced since the last global effect / score. Only needed by the main ball.
		this.side = "right"; //The side of the area the ball is on. Used to identify the player.
		this.isMainBall = false; //Whether this ball is allowed to cause effects.
		this.index = index; //Index referemce of the ball
		this.soundHit = loadSound("Sounds/Hit.mp3");
		this.soundHit.volume = this.soundHit.volume / 2;
		this.soundScore = loadSound("Sounds/score.mp3");
		this.soundScore.volume = this.soundScore.volume / 2;
		this.soundParry = loadSound("Sounds/parry.mp3");
		this.startRight = true; //What player should be targeted when this ball spawns in?
		this.isImmortal = false; //Whether this ball is destroyed upon scoring
		this.isDeath = false; //Whether this ball instantly ends the game when it scores
		this.deathsToll = 0; //Multiplier that increases the speed of the ball, but only if isDeath is true.
		this.isFake = false; //Changes the color of the ball upon being bounced by a paddle
	}

	//Moves the ball every frame
	moveBall()
	{
		//Stops the ball from moving if the game is over
		if(gameOver)
		{
			return;
		}

		//Sets the balls speed if it is death.
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
			//Checks if the player has a shield
			if(rightPlayer.shieldCount === 0)
			{
				leftPlayer.addPoints(this.isDeath);
				this.returnToOrigin();
			}
			else
			{
				this.soundParry.play();
				rightPlayer.shieldCount--;
				this.xSpeed *= -1;
				rightPlayer.resetPaddleColor();
			}
			
		}
		else if(this.sprite.x <= upperBounds)
		{
			//Checks if the player has a shield
			if(leftPlayer.shieldCount === 0)
			{
				rightPlayer.addPoints(this.isDeath);
				this.returnToOrigin();
			}
			else
			{
				this.soundParry.play();
				leftPlayer.shieldCount--;
				this.xSpeed *= -1;
				leftPlayer.resetPaddleColor();
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

		//Checks to make sure the ball isn't softlocked. Forces a speed on the ball if it is.
		balls.forEach(element => {
			if(element.xSpeed === 0)
			{
				element.xSpeed = 1;
				console.log("A ball was caught with no speed. Fixing the problem.")
			}
		});
	}

	//Sets the balls location to the origin and changes its y speed
	returnToOrigin()
	{
		this.soundScore.play();
		this.sprite.x = canvasArea / 2;
		this.sprite.y = canvasArea / 2;
		this.ySpeed = random(-0.5,0.5);

		//Checks what player to fling at
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

		//If the ball isn't the main ball or an immortal ball, destroy it
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

		//Reveals to the player if this ball is fake
		if(this.isFake)
		{
			this.setBallColor('white');
			this.isFake = false;
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

	//Sets the color and stroke of the ball
	setBallColor(color)
	{
		this.sprite.color = color;
		this.sprite.stroke = color;
	}

	//Resets the ball color to default
	resetBallColor()
	{
		if(this.isMainBall)
		{
			this.setBallColor("red");
		}
		else if(this.isDeath)
		{
			this.setBallColor("yellow");
		}
		else if(this.isImmortal)
		{
			this.setBallColor("purple");
		}
		else
		{
			this.setBallColor("white");
		}
	}
}

//Constant variables
const maxPaddles = 4; //Maximum number of paddles the player may have at a time
const maxBalls = 100; //Maximum number of balls that may be on the field at once.
const winningScore = 25; //The score required to win
const bounceThreshold = 3; //Number of times the main ball must bounce to cause a global effect
const effectCount = 10; //The number of player effects in the game
const baseEffectTimer = 120; //How long should effect text be displayed before being reset?
const globalEffectCount = 10; //The number of global effects in the game

//Other variables
let gameOver = false; //Whether the game has ended
let winningPlayer; //The player that won
let jumpscare = false; //Whether the jumpscare effect is playing
let partyModeState = -1; //Determines what should happen while party mode is active
let deathHasBeenChosen = false; //Prevents more than one death ball from being created

//Canvas variables
let playArea = 400; //Size of the play area
const maxArea = 800; //Max size of the play area
const canvasArea = 1000;
let upperBounds = (canvasArea / 2) - (playArea / 2) + 5; //The upper and left border
let lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; //The lower and right border

//The ball
let ball;
let ballCount = 0;

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
let soundWii;
let soundLaugh;
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
	soundWii = loadSound("Sounds/sports.mp3");
	soundLaugh = loadSound("Sounds/laugh.mp3");
	soundClose.volume = 0;

	//images
	jumpscareAnimation = loadAni("Pictures/jumpscare_animation_folder/frame0.jpg", 19);

	//Players
	leftPlayer = new Player(new Paddle(upperBounds + 5, canvasArea / 2, 10, 50), "left");
	rightPlayer = new Player(new Paddle(lowerBounds - 5, canvasArea / 2, 10, 50), "right");

	//Create Sprite Groups
	ballGroup = new Group();

	//Create the ball
	ball = createBall(canvasArea / 2, canvasArea / 2, 5);
	ball.isMainBall = true;
	ball.isImmortal = true;
	ball.setBallColor("red");

	soundBackground.volume = soundBackground.volume / 2;
}

function draw() {
	//Create the backdrop
	background('black');
	fill('black');
	stroke('white');
	rect(canvasArea / 2, canvasArea / 2, playArea, playArea);

	//Creates the shield trackers
	textSize(24);
	fill('blue');
	stroke('blue');
	text(leftPlayer.shieldCount,150,50);
	text(rightPlayer.shieldCount,canvasArea - 150,50);

	//Creates the score trackers
	textSize(48);
	fill('white');
	stroke('white');
	text(leftPlayer.points,100,50);
	text(rightPlayer.points,canvasArea - 100, 50);
	
	//Create the effect Trackers
	effectTimer--;
	if(effectTimer <= 0) //Reset all trackers when timer runs out
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

	//Displays the victor when the game has ended
	if(gameOver)
	{
		textSize(96);
		text(winningPlayer + " Player Wins!",canvasArea / 2, 100);
	}

	//Player 1 controls
	if(keyIsDown("87"))
	{
		hasInteracted = true;
		leftPlayer.paddle.movePaddle(true);
		leftPlayer.moveMiddlePaddle(true);
	}
	if(keyIsDown("83"))
	{
		hasInteracted = true;
		leftPlayer.paddle.movePaddle(false);
		leftPlayer.moveMiddlePaddle(false);
	}

	//Player 2 controls
	if(keyIsDown(UP_ARROW))
	{
		hasInteracted = true;
		rightPlayer.paddle.movePaddle(true);
		rightPlayer.moveMiddlePaddle(true);
	}
	if(keyIsDown(DOWN_ARROW))
	{
		hasInteracted = true;
		rightPlayer.paddle.movePaddle(false);
		rightPlayer.moveMiddlePaddle(false);
	}

	//Runs once a player has interacted with the controls
	if(hasInteracted === true)
	{
		//Make every ball in play move
		balls.forEach(element => {
			element.moveBall();
		});

		//Check for ball collisions
		ballGroup.overlaps(leftPlayer.paddleGroup,onPaddleCollision);
		ballGroup.overlaps(rightPlayer.paddleGroup,onPaddleCollision);

		soundBackground.play();
	}

	//if a jumpscare is playing, animate it.
	if(jumpscare)
	{
		animation(jumpscareAnimation, canvasArea / 2, canvasArea / 2, 0, 8, 8);
	}

	//Play deaths theme when its in play
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
		case 0: //Create 6 balls with trajectories that look like explosions
			centerEffectText = "Ballsplosion";

			let ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.ySpeed = 1.0;

			ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.xSpeed = 2.0;
			ballRef.ySpeed = 0.0;

			ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.ySpeed = -1.0;

			ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.xSpeed = -1.0;
			ballRef.ySpeed = -1.0;

			ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.xSpeed = -2.0;
			ballRef.ySpeed = 0.0;

			ballRef = createBall(canvasArea / 2, canvasArea / 2, 5);
			ballRef.xSpeed = -1.0;
			ballRef.ySpeed = 1.0;

			break;
		case 1: //Create 2 paddles in the middle of the area that last for 10 seconds
			if(typeof leftPlayer.middlePaddle === 'undefined')
			{
				centerEffectText = "Wii Sports";
				soundWii.play();

				leftPlayer.middlePaddle = new Paddle(canvasArea / 2 - 25, canvasArea / 2, 10, 50);
				leftPlayer.paddleGroup.add(leftPlayer.middlePaddle.sprite);

				rightPlayer.middlePaddle = new Paddle(canvasArea / 2 + 25, canvasArea / 2, 10, 50);
				rightPlayer.paddleGroup.add(rightPlayer.middlePaddle.sprite);

				setTimeout(() => {
					removeWiiSportsPaddles();
				}, 10000);
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 2: //Jumpscare and stun both players
			jumpscare = true;
			soundJumpscare.play();
			leftPlayer.stunPaddles(1500);
			rightPlayer.stunPaddles(1500);
			setTimeout(() => {
				jumpscareTimer();
			}, 1500);
			break;
		case 3: //Increase the size of the play area
			if(playArea < maxArea)
			{
				centerEffectText = "Bigger Area";
				playArea += 50;
				upperBounds = (canvasArea / 2) - (playArea / 2) + 5; 
				lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; 
				leftPlayer.adjustPaddleLocations();
				rightPlayer.adjustPaddleLocations();
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 4: //Decrease the size of the play area
			if(playArea > 200)
			{
				centerEffectText = "Smaller Area";
				playArea -= 50;
				upperBounds = (canvasArea / 2) - (playArea / 2) + 5; 
				lowerBounds = (canvasArea / 2) + (playArea / 2) - 5; 
				leftPlayer.adjustPaddleLocations();
				rightPlayer.adjustPaddleLocations();

				//Make sure balls don't end up oob
				balls.forEach(element => {
					//Checks if a ball is horizontally oob
					if(element.side === "left")
					{
						element.sprite.x += 50;
					}
					else
					{
						element.sprite.x -= 50;
					}

					//Checks if a ball is vertically oob
					if(element.sprite.y > lowerBounds)
					{
						element.sprite.y -= 50;
					}
					else if(element.sprite.y < upperBounds)
					{
						element.sprite.y += 50;
					}
				});
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 5: //Increment the speed of all balls
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
		case 6: //Set the speed of all balls to the MAX
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
		case 7: //Activate party mode
			//Only run if party mode is not currently active
			if(partyModeState === -1)
			{
				centerEffectText = "Party Mode";
				soundParty.play();
				partyModeState = 0;
				partyMode();
				setTimeout(() => {
					removePartyMode();
				}, 10000);

				//Double the shield of both players and add 1
				leftPlayer.shieldCount *= 2;
				rightPlayer.shieldCount *= 2;
				leftPlayer.addShield(1);
				rightPlayer.addShield(1);

				//Increment paddle speed and greatly increase paddle height
				leftPlayer.paddle.speed++;
				leftPlayer.paddle.sprite.h += 50;
				rightPlayer.paddle.speed++;
				rightPlayer.paddle.sprite.h += 50;
			}
			else
			{
				createGlobalEffect();
			}
			
			break;
		case 8: //Make all non-immortal balls in play immortal
			if(ballCount > 1)
			{
				centerEffectText = "Immortal Balls";
				balls.forEach(element => {
					//Ignore if the ball is death or main ball
					if(element.isDeath === false && element.isMainBall === false)
					{
						element.isImmortal = true;
						element.setBallColor("purple");
					}
				});
			}
			else
			{
				createGlobalEffect();
			}
			break;
		case 9: //Create the death ball. If death ball already exists, increase its speed multiplier
			soundDeath.play();

			//Create the death ball if it doesn't exist
			if(deathHasBeenChosen !== true)
			{
				centerEffectText = "Death Has Arrived";
				let ballRef = createBall(canvasArea / 2, canvasArea / 2, ball.sprite.diameter);
				ballRef.isDeath = true;
				ballRef.isImmortal = true;
				ballRef.setBallColor("yellow");
				ballRef.xSpeed = 0.1;
				deathHasBeenChosen = true;
			}
			else //Increase its speed multiplier
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
		default: //This should never run
			console.log("FAILED TO CREATE EFFECT! SOMETHING WENT WRONG!")
	}
}

//Removes a ball with the given index
function removeBall(index)
{
	balls[index].sprite.remove();
	balls.splice(index,1);
	ballCount--;

	//Decrease the index of all balls that had a higher index than this ball
	balls.forEach(element => {
		if(element.index > index)
		{
			element.index--;
		}
	});
}

//Removes the paddles that were created by wii sports effect
function removeWiiSportsPaddles()
{
	leftPlayer.middlePaddle.sprite.remove();
	delete leftPlayer.middlePaddle;

	rightPlayer.middlePaddle.sprite.remove();
	delete rightPlayer.middlePaddle;
}

//Remove the jumpscare
function jumpscareTimer()
{
	jumpscare = false;
}

//Makes everything a party
function partyMode()
{
	//Party state determines what color everything should become
	if(partyModeState === 0)
	{
		balls.forEach(element => {
			element.setBallColor("orange");
		});
		leftPlayer.setPaddleColor('blue');
		rightPlayer.setPaddleColor('blue');

		partyModeState = 1;
	}
	else if(partyModeState === 1)
	{
		balls.forEach(element => {
			element.setBallColor("yellow");
		});
		leftPlayer.setPaddleColor('green');
		rightPlayer.setPaddleColor('green');

		partyModeState = 2;
	}
	else if(partyModeState === 2)
	{
		balls.forEach(element => {
			element.setBallColor("green");
		});
		leftPlayer.setPaddleColor('yellow');
		rightPlayer.setPaddleColor('yellow');

		partyModeState = 3;
	}
	else if(partyModeState === 3)
	{
		balls.forEach(element => {
			element.setBallColor("blue");
		});
		leftPlayer.setPaddleColor('orange');
		rightPlayer.setPaddleColor('orange');

		partyModeState = 4;
	}
	else if(partyModeState === 4)
	{
		balls.forEach(element => {
			element.setBallColor("purple");
		});
		leftPlayer.setPaddleColor('red');
		rightPlayer.setPaddleColor('red');

		partyModeState = 5;
	}
	else if(partyModeState === 5)
	{
		balls.forEach(element => {
			element.setBallColor("red");
		});
		leftPlayer.setPaddleColor('purple');
		rightPlayer.setPaddleColor('purple');

		partyModeState = 0;
	}

	//Runs 10 times per second while active.
	if(partyModeState !== -1)
	{
		setTimeout(() => {
			partyMode();
		}, 100);
	}
	else //Time to end the party
	{
		//Reset the color of every ball
		balls.forEach(element => {
			element.resetBallColor();
		});

		//Reset the color of the paddles
		leftPlayer.resetPaddleColor();
		rightPlayer.resetPaddleColor();
	}
}

//Ends party mode
function removePartyMode()
{
	partyModeState = -1;
}

//Creates a new ball and adds it to the list
function createBall(x, y, d)
{
	balls[ballCount] = new Ball(x, y, d, ballCount);
	ballCount++;
	return balls[ballCount - 1];
}
