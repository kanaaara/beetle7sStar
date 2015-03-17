var SCREEN_WIDTH = 680;              // スクリーン幅
var SCREEN_HEIGHT = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分
var FPS = 60;
var SPACE_HIGHT = 1500;
var ENEMY_NUM =10;
var SCORE = 0;
var ASSETS = {
    "player": "image/player.png",
    "player--dead": "image/player--dead.png",
    "player--powerup": "image/player--powerup.png",
    "bg": "image/bg.jpg",
    "boss": "image/boss.png"
};
var UI_DATA = {
    LABELS: {
        children: [
            {
                type: "Label",
                name: "limitTimeLabel",
                x: 50,
                y: 50,
                fillStyle: "white",
                text: " ",
                fontSize: 40,
                align: "left"
            }
        ]
    }
};
tm.main(function() {
    // キャンバスアプリケーションを生成
    var app = tm.display.CanvasApp("#world");
    // リサイズ
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // ウィンドウにフィットさせる
    app.fitWindow();

    // ローダーで画像を読み込む
    var loading = LoadingScene({
        assets: ASSETS,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    // 読み込み完了後に呼ばれるメソッドを登録
    loading.onload = function() {
        // メインシーンに入れ替える
        var scene = MainScene();
        app.replaceScene(scene);
    };
    // ローディングシーンに入れ替える
    app.replaceScene(loading);

    // 実行
    app.run();
});
tm.define("LoadingScene", {
    superClass: "tm.app.Scene",

    init: function (param) {
        this.superInit();

        param = {}.$extend({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT
        }, param);

        this.bg = tm.display.Shape(param.width, param.height).addChildTo(this);
        this.bg.canvas.clearColor("#000000");
        this.bg.setOrigin(0, 0);

        var loadLabel = tm.display.Label("Loading");
        loadLabel.x = param.width / 2;
        loadLabel.y = param.height / 2;
        loadLabel.width = param.width;
        loadLabel.align = "center";
        loadLabel.baseline = "middle";
        loadLabel.fontSize = 32;
        loadLabel.setFillStyle("#FFFFFF");
        loadLabel.counter = 0;
        loadLabel.update = function (app) {
            if (app.frame % 30 === 0) {
                this.text += ".";
                this.counter += 1;
                if (this.counter > 3) {
                    this.counter = 0;
                    this.text = "Star is Genchan Num UP!";
                }
            }
        };
        loadLabel.addChildTo(this.bg);
        var touchMeLabel = tm.display.Label("touch me, and Move Beetle!").addChildTo(this);
        touchMeLabel.setPosition(SCREEN_CENTER_X, 180);

        this.bg.tweener.clear().fadeIn(100).call(function () {
            if (param.assets) {
                var loader = tm.asset.Loader();

                loader.onload = function () {

                    this.bg.tweener.clear().wait(5000).fadeOut(300).call(function () {
                        if (param.nextScene) {
                            this.app.replaceScene(param.nextScene());
                        }
                        var e = tm.event.Event("load");
                        this.fire(e);
                    }.bind(this));

                }.bind(this);

                loader.onprogress = function (e) {
                    var event = tm.event.Event("progress");
                    event.progress = e.progress;
                    this.fire(event);
                }.bind(this);

                loader.load(param.assets);
            }
        }.bind(this));
    }
});    
// シーンを定義
tm.define("MainScene", {
    superClass: "tm.app.Scene",
    enemyMaxConter: 1,
    enemyConter: 0,
    lives: true,
    move: false,
        
    init: function() {
        this.superInit();

        // assets で指定したキーを指定することで画像を表示
        // 背景
        this.bg = tm.display.Sprite("bg").addChildTo(this);
        this.bg.origin.set(0, 0);

        // 初期設定Genchan数
        this.star = new Array(ENEMY_NUM);
        for (var i = 0; i < ENEMY_NUM; i++) {
        this.star[i] =  tm.display.Sprite("boss").addChildTo(this);
        this.star[i].setPosition(-120,-120);
        }
        this.star[0].setPosition(Math.rand(120, SCREEN_WIDTH - 120), Math.rand(120, 240)).setScale(2,2);
        // assets で指定したキーを指定することで画像を表示
        this.player = player("player").addChildTo(this);
        this.player.setPosition(SCREEN_CENTER_X, 900);

        // ラベル表示
        this.fromJSON(UI_DATA.LABELS);

        this.lives = true;
        
    },

    // 更新処理
    update :function(app) {
        if (this.lives) {
            // キーボード
            var key = app.keyboard;
            var pointing = app.pointing;
			      SCORE++;
            this.limitTimeLabel.text = "SCORE:" + SCORE;
            // ☆を設置する
            for (var m = 0; m < this.enemyMaxConter; m++) {
                if (this.enemyConter % 20 <= 20 && this.enemyConter % 20 > 16) {
                    this.star[m].x += 15;
                    this.star[m].y = this.star[m].y - 3;
                } else if (this.enemyConter % 20 <= 16 && this.enemyConter % 20 > 12) {
                    this.star[m].y += 10;
                } else if (this.enemyConter % 20 <= 12 && this.enemyConter % 20 > 8) {
                    this.star[m].x = this.star[m].x - 15;
                    this.star[m].y += 5;
                } else if (this.enemyConter % 20 <= 8 && this.enemyConter % 20 > 4) {
                    this.star[m].x += 15;
                    this.star[m].y += 15;
                } else {
                    this.star[m].x = this.star[m].x - 5;
                    this.star[m].y += 10;
                }
                // クルクル回す
                this.star[m].rotation += 16;
                // 当り判定
                if (this.player.isHitPointRect(this.star[m].x,this.star[m].y)) {
                    this.stop();
                    this.lives = false;
                }

                // 星が画面外に出たら、おしまい
                if ( this.star[m].x <= -120 || this.star[m].x >= SCREEN_WIDTH + 120 || this.star[m].y >= SCREEN_HEIGHT + 120 || this.star[m].y <= -120) {
                    if (this.enemyConter % 30 == 0) {
                        this.star[m] = tm.display.StarShape().addChildTo(this);
                        this.star[m].setPosition(Math.rand(0, SCREEN_WIDTH), Math.rand(0, 200)).setScale(2,2);
                        if (this.enemyMaxConter !== 10) {
                            this.enemyMaxConter++;
                        }
                    } else {
                        this.star[m] = tm.display.Sprite("boss").addChildTo(this);
                        this.star[m].setPosition(Math.rand(0, SCREEN_WIDTH), Math.rand(0, 300));
                    }
                    this.enemyConter++;
                }
            }

            if (pointing.getPointing()) {
console.log(pointing.x);
console.log(this.player.x);
				var movementX =this.player.x + (pointing.x-this.player.x)*0.2
                if (movementX >= 60 && movementX <= SCREEN_WIDTH - 60) {
                    this.player.x = movementX;
                } else if (pointing.x < 60){
                    this.player.x = 60;
                } else if (pointing.x > SCREEN_WIDTH - 60){
                    this.player.x = SCREEN_WIDTH - 60;
                }
                this.player.y += (pointing.y-this.player.y)*0.2;
            }
            // 左矢印キーを押しているかを判定
            if (key.getKey("left")) {
                // 移動
                if(this.player.x >= 60) {
                    this.player.x-=18;
                    // 向き調整
                    this.player.scaleX = -1;
                }
            }
            // 右矢印キーを押しているかを判定
            if (key.getKey("right")) {
                // 移動
                if(this.player.x <= SCREEN_WIDTH - 60) {
                    this.player.x+=18;
                    // 向き調整
                    this.player.scaleX = 1;
                }
            }
        }
    },
    stop :function(app) {
        this.move = false;
        this.player.stop();
        //リトライ
        this.btnHardRetry = tm.ui.FlatButton({
            width: 200,
            height: 50,
            text: "Hard Retry",
            bgColor: "red",
            fontSize: 35
        }).addChildTo(this).on("pointingend", function (e) {
            SCORE = 0;
            e.app.fps = FPS;
            e.app.replaceScene(MainScene());
        });
        this.btnEasyRetry = tm.ui.FlatButton({
            width: 200,
            height: 50,
            text: "Easy Retry",
            bgColor: "red",
            fontSize: 35
        }).addChildTo(this).on("pointingend", function (e) {
            SCORE = 0;
            e.app.fps = 15;
            e.app.replaceScene(MainScene());
        });
        this.btnEasyRetry.setPosition(125, 110);
        this.btnHardRetry.setPosition(125, 160);

    }
});
/*
 * player box
 */
tm.define("player", {
    superClass: "tm.display.Sprite",
    powerup: false,
    live: true,
    counter: 0,

    init: function (image) {
        this.superInit(image);
        this.fitImage();
        this.setBoundingType("rect");
    },

    update: function (app) {
        this.counter++;

        if (this.live) {
            var f = this.counter % 8;

            switch (f) {
                case 0:
                    this.rotation += this.rotation < 0 ? 5 : -5;
                    break;
                case 1:
                    app.fps += 0.01;
                    break;
                default:
                    break;
            }
        } else {
            this.rotation = 80;

            if (760 < this.y) {
                this.y = 760;
            }
        }
    },

    play: function () {
        this.live = true;
        return this;
    },
    
    powerup: function() {
        if (this.powerup === false) {
            this.setImage('player--powerup');
        }
        return this;
    },
    
    powerdown: function() {
       if (this.powerup) {
            this.setImage('player');
       }
        return this;
    },

    stop: function () {
        if (this.live === true|| this.powerup !== true) {
            this.setImage('player--dead');
        }
        this.live = false;
        return this;
    }
});