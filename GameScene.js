class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
        this.load.image('greenhouse', 'assets/greenhouse.png');
        this.load.image('market', 'assets/market.png');
        this.load.image('tile', 'assets/tile.png');
        this.load.image('cropA', 'assets/cropA.png');
        this.load.image('cropB', 'assets/cropB.png');
        this.load.spritesheet('farmer_north', 'assets/Farmer/npc0.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('farmer_east', 'assets/Farmer/npc1.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('farmer_south', 'assets/Farmer/npc2.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('farmer_west', 'assets/Farmer/npc3.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('farmer_stand', 'assets/Farmer/stand.png', { frameWidth: 32, frameHeight: 64 });


    }

    create() {
        console.log("GameScene create() function called");

        // Set up the greenhouse area
        this.add.image(256, 256, 'greenhouse');

        // Set up the market area
        this.add.image(768, 256, 'market');

        // Set up the greenhouse grid
        this.createGreenhouseGrid(25, 25, 32, 32, 256, 256);

        // Create a simple UI for selecting crops
        this.selectedCrop = 'crop A';
        this.add.text(10, 10, 'Selected Crop:', { fontSize: '16px', fill: '#ffffff' });
        this.add.text(10, 30, this.selectedCrop, { fontSize: '16px', fill: '#ffffff' });

        // Create a simple UI for selecting the watering tool
        this.currentTool = 'wateringCan';
        this.add.text(10, 60, 'Current Tool:', { fontSize: '16px', fill: '#ffffff' });
        this.add.text(10, 80, this.currentTool, { fontSize: '16px', fill: '#ffffff' });

        // Create a variable to store the player's currency
        this.currency = 0;
        this.currencyText = this.add.text(10, 110, `Currency: ${this.currency}`, { fontSize: '16px', fill: '#ffffff' });

        // Create farmer sprite and set initial position
        console.log('Checking farmer_north texture');
        this.farmer = this.physics.add.sprite(256, 256, 'farmer_stand', 0);
        this.debugText.setText(`Debug: ${JSON.stringify(this.textures.get('farmer_north'))}`);

        

        // Create animations for the farmer character
        const directions = ['north', 'east', 'south', 'west'];
        for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];
        this.anims.create({
            key: `walk_${direction}`,
            frames: this.anims.generateFrameNumbers(`farmer_${direction}`, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `stand_${direction}`,
            frames: [{ key: 'farmer_stand', frame: i }],
            frameRate: 1
        });
        }
        
        this.debugText = this.add.text(10, 140, 'Debug:', { fontSize: '16px', fill: '#ffffff' });

        this.cursorKeys = this.input.keyboard.createCursorKeys();
    
    }

    createGreenhouseGrid(columns, rows, offsetX, offsetY, tileWidth, tileHeight) {
        this.grid = [];
        this.tileStates = [];

        for (let y = 0; y < rows; y++) {
            let row = [];
            let tileStatesRow = [];
            for (let x = 0; x < columns; x++) {
                let tile = this.add.image(offsetX + x * tileWidth, offsetY + y * tileHeight, 'tile').setInteractive();
                row.push(tile);

                // Initialize the tile state as empty
                tileStatesRow.push({
                    state: 'empty',
                    cropType: null,
                    growthProgress: 0,
                    cropImage: null
                });
                

                // Add a click event listener for each tile
                tile.on('pointerdown', () => {
                    const tileState = this.tileStates[y][x];

                    if (tileState.state === 'empty') {
                        tileState.state = 'planted';
                        tileState.cropType = this.selectedCrop;
                        tileState.growthProgress = 0;
                        tileState.cropImage = this.add.image(tile.x, tile.y, tileState.cropType).setVisible(false);
                        console.log(`Planted ${this.selectedCrop} at (${x}, ${y})`);
                    }
                    else if (tileState.state === 'planted' && this.currentTool === 'wateringCan') {
                        tileState.growthProgress++;
                        console.log(`Watered ${tileState.cropType} at (${x}, ${y}), growth progress: ${tileState.growthProgress}`);
                        if (tileState.growthProgress === 3) {
                            tileState.cropImage.setVisible(true);
                        }
                    }
                    else if (tileState.state === 'readyToHarvest') {
                        console.log(`Harvested ${tileState.cropType} at (${x}, ${y})`);
                    
                        // Update the player's currency based on the harvested crop type
                        this.currency += 10; // Add a value based on the harvested crop type
                        this.currencyText.setText(`Currency: ${this.currency}`);
                    
                        // Reset the tile state to 'empty'
                        tileState.state = 'empty';
                        tileState.cropType = null;
                        tileState.growthProgress = 0;
                        tileState.cropImage.setVisible(false);
                    }                    

                    // Update the tile state to 'readyToHarvest' when the growth progress reaches a certain value
                    if (tileState.growthProgress >= 5) {
                        tileState.state = 'readyToHarvest';
                        console.log(`${tileState.cropType} at (${x}, ${y}) is ready to harvest`);
                    }
                });
            }
            this.grid.push(row);
            this.tileStates.push(tileStatesRow);
        }
    }

    update() {
        // Game logic and updates go here
        const speed = 100;
        let moving = false;

        if (this.cursorKeys.left.isDown) {
            this.farmer.setVelocityX(-speed);
            this.farmer.anims.play('walk_west', true);
            moving = true;
        } else if (this.cursorKeys.right.isDown) {
            this.farmer.setVelocityX(speed);
            this.farmer.anims.play('walk_east', true);
            moving = true;
        } else {
            this.farmer.setVelocityX(0);
        }

        if (this.cursorKeys.up.isDown) {
            this.farmer.setVelocityY(-speed);
            this.farmer.anims.play('walk_north', true);
            moving = true;
        } else if (this.cursorKeys.down.isDown) {
            this.farmer.setVelocityY(speed);
            this.farmer.anims.play('walk_south', true);
            moving = true;
        } else {
            this.farmer.setVelocityY(0);
        }

        if (!moving) {
            const currentAnimKey = this.farmer.anims.currentAnim.key;
            const direction = currentAnimKey.split('_')[1];
            this.farmer.anims.play(`stand_${direction}`, true);
        }

    }
}
