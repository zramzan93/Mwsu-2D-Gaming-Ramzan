var play = {
  create: function() {
    console.log("play.js");
    // Game width and height for convenience
    w = game.width;
    h = game.height;

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
    // this.music.play("", 0, 0.5, true);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    // Obstacles
    this.obstacles = game.add.group();

    // Player
    this.player = game.add.sprite(game.width / 2, 250, "player");
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.enableBody = true;
    this.player.body.collideWorldBounds = true;
    this.player.scale.setTo(0.5, 0.5);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.body.setSize(this.player.width - 10, this.player.height);

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
    //Keyboard functionality
    this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    //Add bullets!
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bulletsphysicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, "bullet");
    this.bullets.setAll("anchor.x", 0.5);
    this.bullets.setAll("anchor.y", 1);
    this.bullets.setAll("outOfBoundsKill", true);
    this.bullets.setAll("checkWorldBounds", true);

    this.explosions = game.add.group();
    this.explosions.enable = true;
    this.explosions.physicsBodytype = Phaser.Physics.ARCADE;
    this.explosions.createMultiple(10, "explosion");
    this.explosions.forEach(this.setupObstacles, this);

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

    this.killPoint = game.physics.arcade.overlap(
      this.obstacles,
      this.bullets,
      this.destroyItem,
      null,
      this
    );

    // Spawn enemies
    if (frame_counter % 90 == 0) {
      var gap = 120;
      var offset = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 150;

      if (game.global.score > 4) {
        /* var gap = 120;
        var offset = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 150; */

        this.spawnObstacle(
          game.global.obstacle_id++,
          game.rnd.integerInRange(50, game.width),
          game.height,
          (speed = 200 * game.global.score * 0.5),
          (has_given_point = false)
        );
        this.spawnObstacle(
          game.global.obstacle_id++,
          game.rnd.integerInRange(100, game.width),
          game.height,
          (speed = 400),
          (has_given_point = false)
        );
        // game.global.score++;
      } else {
        this.spawnObstacle(
          game.global.obstacle_id++,
          game.rnd.integerInRange(100, 200),
          game.height,
          (speed = 200),
          (has_given_point = false)
        );
      }
    }

    this.move();

    //  Fire bullet
    if (this.fireButton.isDown) {
      this.fireBullet();
      console.log(this.fireButton.isDown);
    }
    frame_counter++;
    //game.global.score++;
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
    obstacle.scale.setTo(1, 1);
    obstacle.body.velocity.y = -speed;
    obstacle.has_given_point = has_given_point;

    obstacle.checkWorldBounds = true;
    // Kill obstacle/enemy if vertically out of bounds
    obstacle.events.onOutOfBounds.add(this.killObstacle, this);

    obstacle.outOfBoundsKill = true;
    // console.log(this.obstacles);
  },

  killObstacle: function(obstacle) {
    // console.log(obstacle);
    this.obstacles.remove(obstacle);
    //  console.log(this.obstacles.children.length);
  },

  setupObstacles: function(obstacle) {
    obstacle.anchor.x = 0.5;
    obstacle.anchor.y = 0.5;
    obstacle.animations.add("explosion");
  },

  killPlayer: function(player) {
    //issues with this
    //game.plugins.screenShake.shake(20);
    this.sound.kill.play("", 0, 0.5, false);
    // player.kill();
    // game.state.start("gameOver");
  },
  /**
   * Source: https://phaser.io/examples/v2/games/invaders
   *
   * Collision handler for a bullet and obstacle
   */
  destroyItem: function(bullet, obstacle) {
    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(obstacle.body.x, obstacle.body.y);
    explosion.play("explosion", 30, false, true);
    bullet.kill();
    obstacle.kill();
    game.global.score++;
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
    // console.log(rate * skill);
    return rate * skill;
  },

  fireBullet: function() {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTimer) {
      var BULLET_SPEED = 400;
      var BULLET_SPACING = 250;
      //  Grab the first bullet we can from the pool
      bullet = this.bullets.getFirstExists(false);

      if (bullet) {
        //  And fire it
        var bulletOffset = 20 * Math.sin(game.math.degToRad(this.player.angle));
        bullet.reset(this.player.x, this.player.y + 8);
        bullet.angle = this.player.angle;
        game.physics.arcade.velocityFromAngle(
          bullet.angle + 90,
          BULLET_SPEED,
          bullet.body.velocity
        );
        bullet.body.velocity.x += this.player.body.velocity.x;

        bulletTimer = game.time.now + BULLET_SPACING;
      }
    }
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
