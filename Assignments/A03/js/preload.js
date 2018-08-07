var preload = {
  preload: function() {
    console.log("preload.js");
    game.stage.backgroundColor = BG_COLOR;

    var loading_border = this.add.image(
      game.width / 2,
      game.height / 2,
      "loading_border"
    );
    loading_border.anchor.setTo(0.5, 0.5);
    var loading = this.add.sprite(game.width / 2, game.height / 2, "loading");
    loading.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(loading);

    // game entities/world
    //this.load.image('player', 'images/player_x1.png')
    this.load.image("player", "images/parachute.png");
    this.load.image("obstacle1", "images/hand.png");
    this.load.image("obstacle2", "images/toilet.png");
    this.load.image("obstacle3", "images/paper.png");
    this.load.image("pause", "images/pause.png");
    this.load.image("bg", "images/cream.png");
    this.load.image("bullet", "images/bullet.png");
    this.load.spritesheet("explosion", "images/explode.png", 128, 128);

    // audio
    this.load.audio("bg_spin", "sounds/spin_bg_music.mp3");
    this.load.audio("bg_edm", "sounds/edm_bg_music.mp3");
    this.load.audio("score", "sounds/score.wav");
    this.load.audio("kill", "sounds/Ouch.ogg");
    this.load.audio("music", "sounds/abstractionRapidAcrobatics.wav");

    // font
    game.load.bitmapFont(
      "fontUsed",
      "font/ganonwhite/font.png",
      "font/ganonwhite/font.xml"
    );
  },

  create: function() {
    game.state.start("mainMenu");
  }
};
