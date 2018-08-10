/**
 *
 * @param {object} game | phaser game object
 * @param {string} map_key | cache name
 * @param {string} map_path | path to json for tilemap
 * @param {string} mini_map_path | path to mini map image
 */
var Level = function(game, map_key, map_path, mini_map_path, collision_index) {
  this.game = game;
  this.map_key = map_key;
  this.map_path = map_path;
  this.mini_map_path = mini_map_path;
  this.mini_map_key = this.map_key + "_mini";
  this.map_collision_index = collision_index;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// PRELOAD ////////////////////////////////////////////////////////////////////////////////////////
Level.prototype.preload = function() {
  this.portalOverFlag = false;
  this.transport = false;

  this.mapjson = this.game.global.levels[this.map_key];

  this.mh = new MapHelper(
    game,
    this.map_key,
    this.map_path,
    this.map_collision_index
  );

  this.mh.preload();
  game.load.spritesheet("coin", "assets/sprites/coin.png", 32, 32);
  game.load.image(this.mini_map_key, this.mini_map_path);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE /////////////////////////////////////////////////////////////////////////////////////////
Level.prototype.create = function() {
  this.player = new Player(
    game,
    game.camera.width / 2,
    game.camera.height / 2,
    "knight_atlas"
  );

  game.physics.startSystem(Phaser.Physics.ARCADE);

  this.map = this.mh.create();

  this.mh.addCollisionLayer("layer_collision");

  this.mh.resizeWorld("layer_0_floor");

  this.hud = new Hud(game, 200, 100);
  this.hud.addTitle();
  this.hud.trackValue(this.player.alias, "health");
  this.hud.trackValue(this.player.alias, "coins", true);

  this.mini_map = new MiniMap(
    game,
    200,
    200,
    4096,
    4096,
    this.mini_map_key,
    "upper_right"
  );
  //create a group of coins
  this.coins = game.add.group();
  this.coins.enableBody = true;

  game.camera.follow(this.player.alias);

  this.portal = game.add.sprite(
    game.camera.width / 2 + 100,
    game.camera.height / 2 + 100,
    "gold_portal"
  );

  this.portal2 = game.add.sprite(453, 3756, "gold_portal");

  this.portal3 = game.add.sprite(1638, 1753, "gold_portal");

  this.portal.animations.add(
    "rotate",
    Phaser.Animation.generateFrameNames("gold_portal", 1, 3),
    60,
    true
  );

  this.portal2.animations.add(
    "rotate",
    Phaser.Animation.generateFrameNames("gold_portal", 1, 3),
    60,
    true
  );

  this.portal3.animations.add(
    "rotate",
    Phaser.Animation.generateFrameNames("gold_portal", 1, 3),
    60,
    true
  );

  this.portal.animations.play("rotate");
  this.portal2.animations.play("rotate");
  this.portal3.animations.play("rotate");
  // set the anchor for sprite to middle of the view
  this.portal.anchor.setTo(0.5);
  this.portal2.anchor.setTo(0.5);
  this.portal3.anchor.setTo(0.5);

  // turn physics on for everyone
  game.physics.enable([this.player.alias, this.portal], Phaser.Physics.ARCADE);
  game.physics.enable([this.player.alias, this.portal2], Phaser.Physics.ARCADE);
  game.physics.enable([this.player.alias, this.coins], Phaser.Physics.ARCADE);

  // Makes sure player sprite is in front of the map.
  //this.player.bringToFront();

  // Spawn 7 ghosts when level loads
  this.ghosts = new Ghosts(game, 7, this.player.x, this.player.y);

  // Track the ghosts on the mini map
  for (i = 0; i < this.ghosts.ghosts.length; i++) {
    this.mini_map.trackEnemy(this.ghosts.ghosts[i]);
  }
  this.makeCoins(this.coins);

  // Makes sure player sprite is in front of the map.
  this.player.bringToFront();

  console.log(this.player.alias);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE /////////////////////////////////////////////////////////////////////////////////////////
Level.prototype.update = function() {
  // keeps hud in upper left of the screen
  this.hud.displayHud();

  // keeps map updated in top right of the screen
  this.mini_map.updatePlayerLocation(this.player.alias);

  // lets you control your player
  this.player.move();

  this.ghosts.moveGhosts(this.player.alias);

  // checks if player intersects with a portal
  // hard coded destination. Needs improvement
  if (this.player.intersectsWith(this.portal)) {
    this.player.transportPlayer(620, 3700);
  }

  if (this.player.intersectsWith(this.portal2)) {
    this.player.transportPlayer(618, 550);
  }

  if (this.player.intersectsWith(this.portal3)) {
    if (game.global.current_level == "level_01") {
      game.global.current_level = "level_03";
    } else if (game.global.current_level == "level_03") {
      game.global.current_level = "level_04";
    } else if (game.global.current_level == "level_04") {
      game.global.current_level = "level_05";
    } else {
      game.global.current_level = "gameOver";
    }

    game.state.start(game.global.current_level);
  }

  // Necessary to make sure we always check player colliding with objects
  game.physics.arcade.collide(this.player.alias, this.mh.collisionLayer);
  game.physics.arcade.collide(this.player.alias, this.ghosts);

  game.physics.arcade.overlap(
    this.player.alias,
    this.coins,
    getCoin,
    null,
    this
  );
  console.log(this.player.alias.x, this.player.alias.y);
  // if (this.collideFlag || this.overlapFlag) {
  //   game.global.score += 1;
  //   this.coins.kill();
  // }
};

function getCoin(player, coin) {
  player.data["coins"] += 1;
  coin.kill();
}

Level.prototype.makeCoins = function(coins) {
  for (var i = 0; i < 50; i++) {
    coins.create(game.world.randomX, game.world.randomY, "coin", 0);
  }

  //  Now using the power of callAll we can add the same animation to all coins in the group:
  coins.callAll(
    "animations.add",
    "animations",
    "spin",
    [0, 1, 2, 3, 4, 5],
    10,
    true
  );

  //  And play them
  coins.callAll("animations.play", "animations", "spin");
};

// Level.prototype.getCoins = function(coin) {
//   //coin.kill();
//   game.global.score += 1;
// };
///////////////////////////////////////////////////////////////////////////////////////////////////
// RENDER /////////////////////////////////////////////////////////////////////////////////////////
Level.prototype.render = function() {
  //game.debug.bodyInfo(this.player, 16, 24);
  // Instructions:
  //game.debug.text("And here is our new level!", game.width / 2, game.height - 10);
  game.debug.body(this.player.alias);
};
