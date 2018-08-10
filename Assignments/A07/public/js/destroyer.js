var destroyer = {
  create: function() {
    console.log("play.js");

    //Client.sendNewPlayerRequest();

    //this.player = new Ufo(game);

    this.rplayer = new Ufo(game);

    this.lplayer = new Ufo(game);

    w = game.width; // Game width and height for convenience
    h = game.height;
    frame_counter = 0; // variable to help with the creation of obstacles

    //used for points right now
    this.item_destroyed = false;

    //  The scrolling starfield background
    this.starfield = game.add.tileSprite(0, 0, w, h, "starfield");

    this.earth = game.add.sprite(0, 0, "earth");

    this.earth.animations.add("spin", 0, 48);
    this.earth.animations.play("spin", 10, true);

    // Fire buttons
    this.button = game.add.button(
      w - 75,
      h - 75,
      "button",
      this.actionOnClick,
      this
    );
    this.button.scale.setTo(0.2);

    this.button2 = game.add.button(
      25,
      h - 75,
      "button",
      this.actionOnClick2,
      this
    );
    this.button2.scale.setTo(0.2);

    // Score sound
    this.sound.score = game.add.audio("score");
    this.sound.score.volume = 0.4;

    // Death sound
    this.sound.kill = game.add.audio("kill");

    // Music
    this.music = game.add.audio("music");
    this.music.play("", 0, 0.5, true);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    // Obstacles (little icons of food)
    this.obstacles = game.add.group();

    //  An explosion pool that gets attached to each icon
    this.explosions = game.add.group();
    this.explosions.createMultiple(10, "kaboom");
    this.explosions.forEach(this.setupObstacles, this);

    // Player
    //calls the create method of the ufo object
    //this.player.create(randomInt(0,game.width), randomInt(0,game.height/2), 0.75, 0.75);
    this.lplayer.create(
      randomInt(0, game.width),
      randomInt(0, game.height / 2),
      0.75,
      0.75
    );
    this.rplayer.create(
      randomInt(0, game.width),
      randomInt(0, game.height / 2),
      0.75,
      0.75
    );

    // Score label
    this.bmpText = game.add.bitmapText(
      game.width / 4,
      100,
      "fontUsed",
      "Player",
      150
    );
    this.bmpText.anchor.setTo(0.5, 0.5);
    this.bmpText.scale.setTo(0.3, 0.3);

    this.bmpText2 = game.add.bitmapText(
      game.width / 2 + 200,
      100,
      "fontUsed",
      "",
      150
    );
    this.bmpText2.anchor.setTo(0.5, 0.5);
    this.bmpText2.scale.setTo(0.3, 0.3);

    ///// Tracking keyboard inputs /////////////

    // Fire the ufo big laser when the 'X' key is pressed
    // laserFire = this.input.keyboard.addKey(Phaser.Keyboard.X);
    // laserFire.onDown.add(this.player.startLaser, this.player);

    // Assigns arrow keys for movement
    //this.player.assignMovementKeys(38, 40, 37, 39);

    // Assigns W,S,A,D keys for movement
    this.lplayer.assignMovementKeys(
      Phaser.Keyboard.W,
      Phaser.Keyboard.S,
      Phaser.Keyboard.A,
      Phaser.Keyboard.D
    );
    this.rplayer.assignMovementKeys(
      Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN,
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT
    );

    this.rplayer.assignFireKeys(Phaser.KeyCode.SPACEBAR);
    this.lplayer.assignFireKeys(Phaser.KeyCode.SHIFT);

    this.pauseAndUnpause(game);
  },

  update: function() {
    //if (game.num_other_player > 0) {

    // Place health on game screen
    this.bmpText.text = game.globals.health;
    this.bmpText2.text = game.globals.health2;

    // Move background to look like space is moving
    this.starfield.tilePosition.y -= 2;

    // Check for overlap between game ship and obstacles
    game.physics.arcade.overlap(
      this.lplayer.ship,
      this.obstacles,
      this.killPlayer,
      null,
      this
    );

    game.physics.arcade.overlap(
      this.rplayer.ship,
      this.obstacles,
      this.killPlayer2,
      null,
      this
    );

    // Check for overlap between bullets and obstacles
    game.physics.arcade.overlap(
      this.lplayer.bullets,
      this.obstacles,
      this.destroyItem,
      null,
      this
    );

    game.physics.arcade.overlap(
      this.rplayer.bullets,
      this.obstacles,
      this.destroyItem,
      null,
      this
    );

    game.physics.arcade.collide(
      this.lplayer.ship,
      this.rplayer.ship,
      this.bounceAway,
      null,
      this
    );

    if (this.item_destroyed) {
      // Check to see if we score any points
      // needs changed since we added bullets
      game.globals.score++;
      this.item_destroyed = false;
    }

    spawn_rate = 100 - game.globals.score; // how fast to add new obstacles to screen (smaller value = more obstacles)
    obstacle_speed = game.globals.score * 1.5 + 200; // how fast should each obstacle move

    // Spawn rate continuously shrinks so stop it at 5
    if (spawn_rate < 5) {
      spawn_rate = 5;
    }

    // Spawn obstacles
    if (frame_counter % spawn_rate == 0) {
      //console.log(spawn_rate);
      //console.log(obstacle_speed);
      this.spawnObstacle(
        game.rnd.integerInRange(32, game.width - 32),
        game.height,
        (speed = obstacle_speed),
        0.5,
        0.5
      );
    }

    this.lplayer.move();
    this.rplayer.move();

    // if you need to access the player "sprite" use this.player['side'].ship..

    frame_counter++;
    //}
  },

  /**
   * Spawn New Player
   */
  //   spawnNewPlayer: function(player) {
  //     this.player.push(new Ufo(game));
  //     this.player[game.player.length - 1].create(
  //       player.x,
  //       player.y,
  //       0.75,
  //       0.75
  //     );
  //   },

  actionOnClick: function() {
    this.rplayer.buttonClick();
  },

  actionOnClick2: function() {
    this.lplayer.buttonClick();
  },

  /**
   * spawn a new obstacle
   *
   * @param x : x coord
   * @param y : y coord
   * @param speed : speed to move across game board
   */
  spawnObstacle: function(x, y, speed, x_scale, y_scale) {
    // randomly choose an icon from an array of icon names
    var choice = game.rnd.integerInRange(1, 7);
    //var name = game.globals.obstacle_icons[choice];

    //create the obstacle with its randomly chosen name
    var obstacle = this.obstacles.create(x, y, "planet" + choice);
    obstacle.animations.add("spin", 0, 48);
    obstacle.animations.play("spin", 10, true);

    game.physics.enable(obstacle, Phaser.Physics.ARCADE);

    obstacle.enableBody = true;
    obstacle.body.colliderWorldBounds = true;
    obstacle.body.immovable = true;
    obstacle.anchor.setTo(0.5, 0.5);
    obstacle.scale.setTo(x_scale, y_scale);
    obstacle.body.setSize(obstacle.width + 20, obstacle.height - 20);
    obstacle.body.velocity.y = -speed;

    obstacle.checkWorldBounds = true;

    // Kill obstacle/enemy if vertically out of bounds
    obstacle.events.onOutOfBounds.add(this.killObstacle, this);

    obstacle.outOfBoundsKill = true;
  },

  /**
   * removes an obstacle from its group
   */
  killObstacle: function(obstacle) {
    this.obstacles.remove(obstacle);
  },

  /**
   * Adds an explosion animation to each obstacle when created
   */
  setupObstacles: function(obstacle) {
    obstacle.anchor.x = 0.5;
    obstacle.anchor.y = 0.5;
    obstacle.animations.add("kaboom");
  },

  /**
   * Determines score. Needs changed
   */
  scorePoint: function() {
    // silly but wanted a function in case points started
    // to change based on logic.
    return 1;
  },

  /**
   * Kills player. Things commented out for debugging.
   */
  killPlayer: function(lplayer) {
    //issues with this
    //game.plugins.screenShake.shake(20);
    this.sound.kill.play("", 0, 0.5, false);

    if (game.globals.health != 0) {
      game.globals.health -= 2;
    } else {
      lplayer.kill();
      game.state.start("gameOver");
    }
  },

  killPlayer2: function(rplayer) {
    this.sound.kill.play("", 0, 0.5, false);

    if (game.globals.health2 != 0) {
      game.globals.health2 -= 2;
    } else {
      rplayer.kill();
      game.state.start("gameOver");
    }
  },
  /**
   * Source: https://phaser.io/examples/v2/games/invaders
   *
   * Collision handler for a bullet and obstacle
   */
  destroyItem: function(bullet, obstacle) {
    bullet.kill();
    obstacle.kill();
    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(obstacle.body.x, obstacle.body.y);
    explosion.play("kaboom", 30, false, true);
    this.item_destroyed = true;
  },

  //   damageShip: function(lplayer,rplayer){
  // 	  if (lplayer.y > rplayer.y){

  // 	  }
  // 	  else if (rplayer.y > lplayer.y){

  // 	  }

  //   }

  /**
   * Tap on touchscreen or click with mouse
   * not used for this game
   * (fire bullets?)
   */
  onDown: function(pointer) {
    //console.log(pointer);
  },

  bounceAway: function(lBounce, rBounce) {
    var lBounce = game.add.tween(this.lplayer.ship);
    var rBounce = game.add.tween(this.rplayer.ship);

    lBounce.to({ x: 200, y: 50 }, 200, Phaser.Easing.Bounce.Out, true, 100);

    rBounce.to({ x: -200, y: -50 }, -200, Phaser.Easing.Bounce.Out, true, -100);
  },

  /**
   * This method lets a user pause the game by pushing the pause button in
   * the top right of the screen.
   */
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
  }
};
