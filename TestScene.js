class TestScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }

    preload() {
        this.load.spritesheet('farmer_north', 'assets/Farmer/npc0.png', { frameWidth: 32, frameHeight: 64 });
    }

    create() {
        this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'farmer_north', 0);
    }
}

export default TestScene;
