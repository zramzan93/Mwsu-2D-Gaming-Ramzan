var play = {
  create: function() {
    console.log("play.js");
    // Game width and height for convenience
    w = game.width;
    h = game.height;
    leftRate = 0		// how fast to move left when pressing left arrow key
  		rightRate = 0		// how fast to move right when pressing left arrow key
    frame_counter = 0;

    // Bg color
    game.stage.backgroundColor = BG_COLOR;
    // Bg image
    this.bg = game.add.image(0, 0, "bg");


    // Score sound
    this.sound.score = game.add.audio("score");
    this.sound.score.volume = 0.4;

    // Death sound
    this.sound.kill = game.add.audio("kill");

    // Music
    this.music = game.add.audio("music");
    this.music.play("", 0, 0.5, true);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    // Obstacles
    this.obstacles = game.add.group();

    //  An explosion pool that gets attached to each icon
		this.explosions = game.add.group();
		this.explosions.createMultiple(10, 'kaboom');
		this.explosions.forEach(this.setupObstacles, this);

    // Player
    this.player = game.add.sprite(game.width / 2, 250, "player");
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.enableBody = true;
    this.player.body.collideWorldBounds = true;
    this.player.scale.setTo(0.5, 0.5);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.body.setSize(this.player.width - 10, this.player.height);

    //add bullets
    //https://www.codecaptain.io/blog/game-development/shooting-bullets-using-phaser-groups/518
this.bullets = game.add.group();
// To move the sprites later on, we have to enable the body
this.bullets.enableBody = true;
// We're going to set the body type to the ARCADE physics, since we don't need any advanced physics
this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

this.bullets.createMultiple(10, "bullet");
this.bullets.callAll(
  "events.onOutOfBounds.add",
  "events.onOutOfBounds",
  this.resetBullets
);
this.bullets.callAll("anchor.setTo", "anchor", 0.5, 1);
this.bullets.callAll("scale.setTo", "scale", 0.3, 0.3);
this.bullets.callAll("body.setSize", "body", 4, 4);
this.bullets.setAll("checkWorldBounds", true);

this.fireBullets = function() {
  // Get the first laser that's inactive, by passing 'false' as a parameter
  var bullet = this.bullets.getFirstExists(false);
  if (bullet) {
    // If we have a laser, set it to the starting position
    bullet.reset(this.player.x, this.player.y + 20);
    // Give it a velocity of -500 so it starts shooting
    bullet.body.velocity.y = 1000;
  }
};

this.resetBullets = function(bullet) {
  // Destroy the laser
  bullet.kill();
};

    // Score label
    this.bmpText = game.add.bitmapText(
      game.width / 2,
      100,
      "fontUsed",
      "",
      150
    );
    this.bmpText.anchor.setTo(0.5, 0.5);
    this.bmpText.scale.setTo(0.3, 0.3);

    // Support for mouse click and touchscreen input
    game.input.onDown.add(this.onDown, this);

    // Another way to get input from keyboard (arrow keys)
this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

// Adding a reference to the space bar
this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this.pauseAndUnpause(game);
  },

  update: function() {
    this.bmpText.text = game.global.score;

    // Collision
    game.physics.arcade.overlap(
      this.player,
      this.obstacles,
      this.killPlayer,
      null,
      this
    );

    // Check for overlap between bullets and obstacles
		game.physics.arcade.overlap(game.player.bullets, this.obstacles, this.destroyItem, null, this);

    spawn_rate = 100-game.global.score;				// how fast to add new obstacles to screen (smaller value = more obstacles)
		obstacle_speed = game.global.score * 1.5 + 200; // how fast should each obstacle move

		// Spawn rate continuously shrinks so stop it at 5
		if(spawn_rate < 5){
			spawn_rate = 5;
		}

		// Spawn enemies
		if (frame_counter % spawn_rate == 0) {
			//console.log(spawn_rate);
			//console.log(obstacle_speed);
			this.spawnObstacle(game.rnd.integerInRange(32,game.width-32), game.height, speed = obstacle_speed)
		}



    this.move();

    frame_counter++;
    game.global.score += this.scorePoint();


  },
  //entity (unique identifier)
  spawnObstacle: function(entity, x, y, speed, has_given_point) {
  var badguys = ["obstacle1", "obstacle2", "obstacle3"];
    var choice = game.rnd.integerInRange(0, 2);

    var obstacle = this.obstacles.create(x, y, badguys[choice], entity);

    game.physics.enable(obstacle, Phaser.Physics.ARCADE);

    obstacle.enableBody = true;
    obstacle.body.colliderWorldBounds = true;
    obstacle.body.immovable = true;
    obstacle.anchor.setTo(0.5, 0.5);
    obstacle.scale.setTo(0.75, 0.75);
    obstacle.body.setSize(obstacle.width-5, obstacle.height -20)
    obstacle.body.velocity.y = -speed;
  //  obstacle.has_given_point = has_given_point;

    obstacle.checkWorldBounds = true;
    // Kill obstacle/enemy if vertically out of bounds
    obstacle.events.onOutOfBounds.add(this.killObstacle, this);

    obstacle.outOfBoundsKill = true;
    console.log(this.obstacles);
  },

  killObstacle: function(obstacle) {
    console.log(obstacle);
    this.obstacles.remove(obstacle);

  },

  /**
 * Adds an explosion animation to each obstacle when created
 */
setupObstacles: function (obstacle) {

  obstacle.anchor.x = 0.5;
  obstacle.anchor.y = 0.5;
  obstacle.animations.add('kaboom');

},

  scorePoint: function() {
    //console.log(this.obstacles)
    var point = 0;
    var obstacles = this.obstacles.children;

    for (var i = 0; i < obstacles.length; i++) {
      if (obstacles[i].visible) {
        // console.log("vis: ")
        // console.log(obstacles[i].y,this.player.y);
        let py = this.player.y;
        let oy = obstacles[i].y;
        //	let ox = obstacles[i].x;

        //if player is below obstacle and within 5 pixels and choose only one of the pair
        if (py > oy && Math.abs(py - oy) < 5) {
          /*&& ox < game.width / 2)*/ point++;
          this.sound.score.play("", 0, 0.5, false);
        }
      }
    }
    return point;
  },

  killPlayer: function(player) {
    //issues with this
    //game.plugins.screenShake.shake(20);
    this.sound.kill.play("", 0, 0.5, false);
    player.kill();
    game.state.start("gameOver");
  },

  /**
  	 * Source: https://phaser.io/examples/v2/games/invaders
  	 *
  	 * Collision handler for a bullet and obstacle
  	 */
  	destroyItem: function(bullet, obstacle){
  		bullet.kill();
  		obstacle.kill();
  		var explosion = this.explosions.getFirstExists(false);
  		explosion.reset(obstacle.body.x, obstacle.body.y);
  		explosion.play('kaboom', 30, false, true);
  	},

  // Tap on touchscreen or click with mouse
  onDown: function(pointer) {},

  // Move player
  move: function() {
    if (game.input.activePointer.isDown) {
      //console.log(game.input.x);
      let rate = this.moveSpeed(game.input.x, game.width);
      let angle = this.moveAngle(rate, 3);
      //console.log("rate: " + rate);
      this.player.x += rate;
      this.player.angle = angle;
    } else {
      this.player.angle = 0;
    }
  },
  moveAngle: function(rate, factor) {
    return rate * factor;
  },

  moveSpeed: function(x, width, skill = 2) {
    var ratio = 0;

    if (x < width / 2) {
      ratio = x / (width / 2);
      ratio *= 10;
      ratio = Math.ceil(ratio);
      ratio /= 2;
      rate = (5 - ratio) * -1;
    } else {
      ratio = x / width;
      ratio *= 10;
      ratio = Math.ceil(ratio);
      ratio /= 2;
      rate = ratio;
    }
    console.log(rate * skill);
    return rate * skill;
  },

  pauseAndUnpause: function(game) {
    var pause_button = game.add.sprite(game.width - 40, 40, "pause");
    pause_button.anchor.setTo(0.5, 0.5);
    pause_button.inputEnabled = true;
    // pause:
    pause_button.events.onInputUp.add(function() {
      if (!game.paused) {
        game.paused = true;
      }
      pause_watermark = game.add.sprite(
        game.width / 2,
        game.height / 2,
        "pause"
      );
      pause_watermark.anchor.setTo(0.5, 0.5);
      pause_watermark.alpha = 0.1;
    }, this);
    // Unpause:
    game.input.onDown.add(function() {
      if (game.paused) {
        game.paused = false;
        pause_watermark.destroy();
      }
    }, self);
  },

  render: function() {
    debug = false;
    if (debug) {
      // Show hitbox
      game.debug.body(this.player);

      for (var i = 0; i < obstacles.length; i++) {
        game.debug.body(obstacles[i]);
      }
    }
  }
};
