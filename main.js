const config = {
    type: Phaser.AUTO,
    width: 6400,
    height: 6400,
    parent: 'game-container',
    scene: [GameScene],
    backgroundColor: '#1a1a2d'
};


const game = new Phaser.Game(config);

function preload() {
    this.load.spritesheet('plowed_soil', 'assets/submission_daneeklu/tilesets/plowed_soil.png', { frameWidth: 96 , frameHeight: 192 });
}


function create() {
    // Set up the game world here
}

function update() {
    // Game logic and updates go here
}
