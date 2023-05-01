class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.pickupText = null;
        this.placingGreenhouse = false;
        this.lastDirection = 'south';
        this.leftKeyPressCount = 0;
        this.rightKeyPressCount = 0;
        this.inventory = {
            seeds: 0,
            water: 0,
        };
        this.tileSize = 256; // Update the tileSize to 256
        this.greenhouses = [];
        this.toolbarItems = [
            {
                key: 'greenhouse',
                thumbnail: 'greenhouse', // Use 'greenhouse' instead of 'greenhouse_thumbnail'
                quantity: 5,
            },
        ];
    }

    preload() {
        this.load.image('greenhouse', 'assets/greenhouse.png');
        this.load.image('watering_can', 'assets/watering_can.png');
        this.load.image('tile', 'assets/tile.png');


    
        this.load.spritesheet('walk_north', 'assets/Farmer/npc0.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('walk_east', 'assets/Farmer/npc1.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('walk_south', 'assets/Farmer/npc2.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('walk_west', 'assets/Farmer/npc3.png', { frameWidth: 32, frameHeight: 64 });
    
        this.load.spritesheet('stand', 'assets/Farmer/stand.png', { frameWidth: 32, frameHeight: 64 });
    }

    create() {
        const tileBackground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'tile');
        tileBackground.setOrigin(0, 0).setScale(0.25);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'tile').setOrigin(0, 0).setScale(0.25);
        this.createToolbar(); // Add this line to create the toolbar
        this.createWalkingAnimation('walk_north', 'walk_north');
        this.createWalkingAnimation('walk_east', 'walk_east');
        this.createWalkingAnimation('walk_south', 'walk_south');
        this.createWalkingAnimation('walk_west', 'walk_west');
        this.farmerOrientation = 'S';


        // Create a dummy greenhouse object
        this.greenhouse = this.add.sprite(-100, -100, 'greenhouse');

        this.pickupText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 30, 'Q: Remove', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
    
        this.anims.create({
            key: 'stand-north',
            frames: [{ key: 'stand', frame: 0 }],
            frameRate: 10,
        });
        
        this.anims.create({
            key: 'stand-east',
            frames: [{ key: 'stand', frame: 1 }],
            frameRate: 10,
        });
        
        this.anims.create({
            key: 'stand-south',
            frames: [{ key: 'stand', frame: 2 }],
            frameRate: 10,
        });
        
        this.anims.create({
            key: 'stand-west',
            frames: [{ key: 'stand', frame: 3 }],
            frameRate: 10,
        });
        
    
        this.farmer = this.physics.add.sprite(400, 300, 'stand', 2);
        this.farmer.setScale(1.5);
    
        this.wateringCan = this.physics.add.sprite(100, 300, 'watering_can');
        this.wateringCan.setScale(0.0125);
        this.wateringCan.setCollideWorldBounds(true);

        // Create the score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Create the inventory text
        this.inventoryText = this.add.text(16, 64, 'Inventory:', { fontSize: '24px', fill: '#000' });
        this.inventoryTextSeeds = this.add.text(16, 96, `Seeds: ${this.inventory.seeds}`, { fontSize: '18px', fill: '#000' });
        this.inventoryTextWater = this.add.text(16, 128, `Water: ${this.inventory.water}`, { fontSize: '18px', fill: '#000' });

        // Add this line to create a greenhouse on the grid at position (1, 1)
        this.placeGreenhouse(1, 1);

        // Implement interaction with the greenhouses using the 'E' key
        this.input.keyboard.on('keydown-E', (event) => {
            if (this.placingGreenhouse) {
                const x = Math.round(this.greenhousePreview.x / this.tileSize);
                const y = Math.round(this.greenhousePreview.y / this.tileSize);
        
                if (this.canPlaceGreenhouse(x, y)) {
                    this.placeGreenhouse(x, y);
                    const greenhouseToolbarIndex = this.toolbarItems.findIndex(item => item.key === 'greenhouse');
                    this.updateToolbarItemQuantity(greenhouseToolbarIndex, this.toolbarItems[greenhouseToolbarIndex].quantity - 1);
                } else {
                    this.greenhousePreview.setTint(0xff0000);
                }
            } else {
                this.greenhouses.forEach((greenhouse) => {
                    if (Phaser.Geom.Intersects.RectangleToRectangle(this.farmer.getBounds(), greenhouse.getBounds())) {
                        // Open the crop selection UI for the interacted greenhouse
                        this.showCropSelectionUI(greenhouse);
                    }
                });
            }
        });
        

        this.input.keyboard.on('keydown-Q', (event) => {
            this.pickUpGreenhouse();
        });

        this.input.keyboard.on('keydown-ONE', (event) => {
            this.toggleGreenhousePlacement();
        });        



        
    }

    update() {
        this.farmer.body.setVelocity(0);
        
        if (this.cursors.up.isDown) {
            this.farmer.body.setVelocityY(-250);
            this.farmer.anims.play('walk_north', true);
            this.lastDirection = 'north';
        } else if (this.cursors.down.isDown) {
            this.farmer.body.setVelocityY(250);
            this.farmer.anims.play('walk_south', true);
            this.lastDirection = 'south';
        } else if (this.cursors.left.isDown) {
            this.farmer.body.setVelocityX(-250);
            this.farmer.anims.play('walk_west', true);
            this.lastDirection = 'west';
        } else if (this.cursors.right.isDown) {
            this.farmer.body.setVelocityX(250);
            this.farmer.anims.play('walk_east', true);
            this.lastDirection = 'east';
        } else {
            this.farmer.anims.stop();
            if (this.lastDirection === 'north') {
                this.farmer.setTexture('stand', 0);
            } else if (this.lastDirection === 'east') {
                this.farmer.setTexture('stand', 1);
            } else if (this.lastDirection === 'south') {
                this.farmer.setTexture('stand', 2);
            } else if (this.lastDirection === 'west') {
                this.farmer.setTexture('stand', 3);
            }
        }

        if (this.cursors.left.isDown) {
            this.farmer.setVelocityX(-160);
            this.farmerOrientation = 'W';
        } else if (this.cursors.right.isDown) {
            this.farmer.setVelocityX(160);
            this.farmerOrientation = 'E';
        } else {
            this.farmer.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.farmer.setVelocityY(-160);
            this.farmerOrientation = 'N';
        } else if (this.cursors.down.isDown) {
            this.farmer.setVelocityY(160);
            this.farmerOrientation = 'S';
        } else {
            this.farmer.setVelocityY(0);
        }
        
            // Update farmer's velocity and orientation
    if (this.cursors.left.isDown) {
        this.farmer.setVelocityX(-160);
        this.farmerOrientation = 'W';
    } else if (this.cursors.right.isDown) {
        this.farmer.setVelocityX(160);
        this.farmerOrientation = 'E';
    } else {
        this.farmer.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
        this.farmer.setVelocityY(-160);
        this.farmerOrientation = 'N';
    } else if (this.cursors.down.isDown) {
        this.farmer.setVelocityY(160);
        this.farmerOrientation = 'S';
    } else {
        this.farmer.setVelocityY(0);
    }

    // Calculate the position of the tile the farmer is facing (snippet 3)
    let tileX, tileY;
    const tileSize = 32; // Adjust this to match your tile size

    switch (this.farmerOrientation) {
        case 'N':
            tileX = this.farmer.x;
            tileY = this.farmer.y - tileSize;
            break;
        case 'S':
            tileX = this.farmer.x;
            tileY = this.farmer.y + tileSize;
            break;
        case 'W':
            tileX = this.farmer.x - tileSize;
            tileY = this.farmer.y;
            break;
        case 'E':
            tileX = this.farmer.x + tileSize;
            tileY = this.farmer.y;
            break;
    }

    // Update the visibility of the pickup text (snippet 4)
    if (this.greenhouse) {
        const distanceToGreenhouse = Phaser.Math.Distance.Between(
            tileX, tileY, this.greenhouse.x, this.greenhouse.y
        );

        const pickupRange = 5; // Adjust this value as needed

        if (distanceToGreenhouse <= pickupRange) {
            this.pickupText.setVisible(true);
        } else {
            this.pickupText.setVisible(false);
        }
    }
    
        if (this.placingGreenhouse) {
            this.updateGreenhousePreviewPosition(this.lastDirection);
        }
    
        // Replace `this.player` with `this.farmer` in the next few lines
        const distanceToGreenhouse = Phaser.Math.Distance.Between(
            this.farmer.x, this.farmer.y, this.greenhouse.x, this.greenhouse.y
        );
    
        const pickupRange = 100; // Adjust this value as needed
    
        if (distanceToGreenhouse <= pickupRange) {
            this.pickupText.setVisible(true);
        } else {
            this.pickupText.setVisible(false);
        }

        if (this.greenhouse) {
            const distanceToGreenhouse = Phaser.Math.Distance.Between(
                this.farmer.x, this.farmer.y, this.greenhouse.x, this.greenhouse.y
            );
        
            const pickupRange = 100; // Adjust this value as needed
        
            if (distanceToGreenhouse <= pickupRange) {
                this.pickupText.setVisible(true);
            } else {
                this.pickupText.setVisible(false);
            }
        }
        
    }
    

    updateToolbarItemQuantity(index, newQuantity) {
        this.toolbarItems[index].quantity = newQuantity;
        this.toolbar[index].quantityText.setText(newQuantity);
    }

    createToolbar() {
        const toolbarX = 16;
        const toolbarY = this.scale.height - 84; // Move the toolbar up by 20 pixels
        const toolbarWidth = this.tileSize / 4; // Update toolbarWidth to a quarter of the tileSize
        const toolbarHeight = this.tileSize / 4; // Update toolbarHeight to a quarter of the tileSize
        const toolbarSpacing = 8;
    
        this.toolbar = [];
    
        for (let i = 0; i < this.toolbarItems.length; i++) {
            const item = this.toolbarItems[i];
            const x = toolbarX + (toolbarWidth + toolbarSpacing) * i;
            const y = toolbarY;
    
            // Draw the item background
            const background = this.add.rectangle(x, y, toolbarWidth, toolbarHeight, 0xCCCCCC).setOrigin(0, 0);
            background.setStrokeStyle(2, 0x000000);
    
            // Add the item thumbnail
            const thumbnail = this.add.image(x + toolbarWidth / 2, y + toolbarHeight / 2, item.thumbnail);
            thumbnail.setScale(0.25); // Make the thumbnail half its current size
    
            // Add the item quantity text
            const quantityText = this.add.text(x + 4, y + toolbarHeight - 20, item.quantity, {
                fontSize: '14px',
                fill: '#000',
                stroke: '#FFF', // Add a white stroke
                strokeThickness: 2 // Set the stroke thickness to 2px
            });
    
            // Add the item to the toolbar
            this.toolbar.push({
                background,
                thumbnail,
                quantityText,
            });
        }
    }
    

    

    createWalkingAnimation(key, spriteKey) {
        this.anims.create({
            key: key,
            frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    placeGreenhouse(x, y) {
        const greenhouse = this.physics.add.sprite(x * this.tileSize, y * this.tileSize, 'greenhouse');
        greenhouse.setScale(1); // Set the scale to 1 to match the size of the preview image
        greenhouse.setCollideWorldBounds(true);
        this.greenhouses.push(greenhouse);
    }
    
    

    showCropSelectionUI(greenhouse) {
        // Open the crop selection UI and enable the user to interact with it.
        // This method needs to be implemented according to the specifics of your game.
    }

    updateInventory() {
        this.inventoryTextSeeds.setText(`Seeds: ${this.inventory.seeds}`);
        this.inventoryTextWater.setText(`Water: ${this.inventory.water}`);
    }

    toggleGreenhousePlacement() {
        this.placingGreenhouse = !this.placingGreenhouse;
        if (this.placingGreenhouse) {
            this.greenhousePreview = this.add.sprite(0, 0, 'greenhouse').setAlpha(0.5);
            this.updateGreenhousePreviewPosition(this.lastDirection);
        } else {
            this.greenhousePreview.destroy();
        }
    }
    
    
    
    

    updateGreenhousePreviewPosition(direction) {
        if (!this.greenhousePreview) return;
        const tileSize = this.tileSize;
        const offsetX = direction === 'west' ? -tileSize : direction === 'east' ? tileSize : 0;
        const offsetY = direction === 'north' ? -tileSize : direction === 'south' ? tileSize : 0;
        const xPos = Math.round((this.farmer.x + offsetX) / tileSize) * tileSize;
        const yPos = Math.round((this.farmer.y + offsetY) / tileSize) * tileSize;
        this.greenhousePreview.setPosition(xPos, yPos);
    
        const isOutsideCanvas = xPos < this.tileSize / 2 ||
            yPos < this.tileSize / 2 ||
            xPos > this.scale.width - this.tileSize / 2 ||
            yPos > this.scale.height - this.tileSize / 2;
    
        const greenhouseToolbarIndex = this.toolbarItems.findIndex(item => item.key === 'greenhouse');
        const noMoreGreenhouses = this.toolbarItems[greenhouseToolbarIndex].quantity === 0;
    
        if (isOutsideCanvas || noMoreGreenhouses) {
            this.greenhousePreview.setTint(0xFF0000);
        } else {
            this.greenhousePreview.clearTint();
        }
    }
    
    
    canPlaceGreenhouse(x, y) {
        const greenhouseToolbarItem = this.toolbarItems.find(item => item.key === 'greenhouse');
        if (greenhouseToolbarItem.quantity === 0) {
            return false;
        }
        
        // Check if there's already a greenhouse on this tile
        const existingGreenhouse = this.greenhouses.find(greenhouse => greenhouse.x === x * this.tileSize && greenhouse.y === y * this.tileSize);
        if (existingGreenhouse) {
            return false;
        }
    
        return true;
    }
    
    pickUpGreenhouse() {
        const x = Math.floor((this.farmer.x + this.tileSize / 2) / this.tileSize) * this.tileSize;
        const y = Math.floor((this.farmer.y + this.tileSize / 2) / this.tileSize) * this.tileSize;
        console.log('Farmer coordinates:', this.farmer.x, this.farmer.y);
        console.log('Checking for greenhouse at:', x, y);
    
        const greenhouseToRemoveIndex = this.greenhouses.findIndex(greenhouse =>
            Math.abs(greenhouse.x - x) < this.tileSize / 2 && Math.abs(greenhouse.y - y) < this.tileSize / 2
        );
    
        if (greenhouseToRemoveIndex !== -1) {
            console.log('Greenhouse found:', this.greenhouses[greenhouseToRemoveIndex]);
            this.greenhouses[greenhouseToRemoveIndex].destroy();
            this.greenhouses.splice(greenhouseToRemoveIndex, 1);
    
            const greenhouseToolbarIndex = this.toolbarItems.findIndex(item => item.key === 'greenhouse');
            this.updateToolbarItemQuantity(greenhouseToolbarIndex, this.toolbarItems[greenhouseToolbarIndex].quantity + 1);
        } else {
            console.log('No greenhouse found');
        }
    }
    
    
    
    
}



