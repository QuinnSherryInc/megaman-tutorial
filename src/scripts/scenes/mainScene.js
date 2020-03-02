import _ from 'underscore';

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'MainScene'
        })
    }

    preload() {
		
		//Preload level assets
		
        this.load.tilemapTiledJSON('level-template', '../../assets/maps/level1.json');
        this.load.image('stage_image', '../../assets/img/level-template.png');
		
		this.load.multiatlas('mm', '../../assets/sprites/mm.json', '../../assets/sprites');
    }

    create() {
		
		this.createStage();
		
		this.createMM();
		
		this.setupCollisions();
		
		this.setupCamera();
		
		this.setupKeyboard();
		
    }
	
	createMM(){
		
		//Load MM sprite
        this.mm = this.add.sprite(100, 100, 'mm');
		
		//Load all frames
		this.getAllFrames("mm");
		
		//Add MM to Phaser physics engine
        this.physics.add.existing(this.mm);
		
		//Add and define the hit box
        this.mm.body.setCollideWorldBounds(true);
        this.mm.body.setSize(14, 32);
        this.mm.body.setOffset(10, 9);
		
		//Set initial animation
        this.mm.anims.play('jump');
		
		//Initial state is jumping as he is falling when added to scene
        this.mm.state = {
            jumping: true
        };
		
	}
	
	getAllFrames(spriteKey){
		
		var allFrames = this.anims.textureManager.list[spriteKey].frames;
		
		var animationStates = {};
		
		Object.keys(allFrames).forEach((frameKey, frameIndex)=>{
			
			var keyParts = frameKey.split("/");
			var folder = "unassigned";
			
			if(keyParts.length > 1){
				folder = keyParts[0]
			}
			
			if(!animationStates[folder])
				animationStates[folder] = [];
			
			animationStates[folder].push(
				{key: spriteKey, frame: frameKey}
			);
			
			animationStates[folder] = _.sortBy(animationStates[folder], "frame");
		});
		
		Object.keys(animationStates).forEach((animStateKey)=>{
			
			this.anims.create({
				key: animStateKey, 
				frames: animationStates[animStateKey], 
				frameRate: 15, 
				repeat: -1 
			});
		});
		
	}

	createStage(){
		
		//Setup level map
        this.stage = this.make.tilemap({
            key: 'level-template',
            tileWidth: 16,
            tileHeight: 16,
            width: 200,
            height: 20
        });
		
		//Map tileset image
        this.tileSet = this.stage.addTilesetImage('level-template', 'stage_image');

		//Create separate layers
        this.mainLayer = this.stage.createStaticLayer('Main', this.tileSet, 0, 0);
        this.groundLayer = this.stage.createStaticLayer('Decoration', this.tileSet, 0, 0);
        this.foregroundLayer = this.stage.createStaticLayer('Foreground', this.tileSet, 0, 0);
        this.foregroundLayer.setDepth(10);
		
		//Set physics boundaries based on map extremities
        this.physics.world.setBounds(0, 0, this.stage.widthInPixels, this.stage.heightInPixels);
		
		//TODO: This is not working
        this.animatedTiles.init(this.stage);
	}

	setupCollisions(){
		
		//Collide with blocks based on custom property set in tiled
        this.mainLayer.setCollisionByProperty({
            collides: true
        });
		
		//Stop MM if he collides with any collidable block
        this.physics.add.collider(this.mm, this.mainLayer);
		
	}

	setupCamera(){
		
        this.cameras.main.startFollow(this.mm, true);
        this.cameras.main.setBounds(0, 0, this.stage.widthInPixels, this.stage.heightInPixels);
		
	}

	setupKeyboard(){

		//Map keyboard keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.firKey = this.input.keyboard.addKey('SPACE'); // Get key object
		
	}

    update() {

        if (this.mm.body.onFloor()) {

            var keyDown = false;
            if (this.cursors.left.isDown) {
                keyDown = true;
                this.mm.setFlipX(true);

                this.setMMAnimation('running');

                this.mm.body.setVelocityX(-150);
            } else if (this.cursors.right.isDown) {
                keyDown = true;
                this.mm.setFlipX(false);

                this.setMMAnimation('running');

                this.mm.body.setVelocityX(150);
            }

            if (this.cursors.up.isDown && !this.mm.state.jumping) {
                keyDown = true;
                this.mm.state.jumping = true;
                this.setMMAnimation('jump');
                this.mm.body.setVelocityY(-400);

            }

            if (!this.cursors.up.isDown) {
                this.mm.state.jumping = false;
            }

            if (!keyDown) {

                this.setMMAnimation('idle');

                this.mm.body.setVelocityX(0);

            }

        } else {

            this.setMMAnimation('jump');

            if (this.cursors.left.isDown) {
                this.mm.setFlipX(true);
                this.mm.body.setVelocityX(-150);
            } else if (this.cursors.right.isDown) {
                this.mm.setFlipX(false);
                this.mm.body.setVelocityX(150);
            } else {

                this.mm.body.setVelocityX(0);

            }

        }

    }

    setMMAnimation(anim) {

        if (this.firKey.isDown) {
            anim = anim + "_fire";
        }

        if (this.mm.anims.currentAnim.key != anim) {

            this.mm.anims.play(anim);

        }

    }
}