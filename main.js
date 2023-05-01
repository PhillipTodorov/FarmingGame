const config = {
    type: Phaser.AUTO,
    width: 1600, // Set the canvas width
    height: 900, // Set the canvas height
    scene: [GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
