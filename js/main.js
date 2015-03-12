var SCREEN_WIDTH = 680;              // スクリーン幅
var SCREEN_HEIGHT = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分
var FPS = 120;
var SPACE_HIGHT = 1500;
var STAR_NUM = 2;
var BOSS_NUM = 10;
var ASSETS = {
    "player": "image/player.png",
    "player--dead": "image/player--dead.png",
    "player--powerup": "image/player--powerup.png",
    "bg": "image/bg.jpg",
    "boss": "image/boss.png"
}
tm.main(function() {
    // キャンバスアプリケーションを生成
    var app = tm.display.CanvasApp("#world");
    // リサイズ
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // ウィンドウにフィットさせる
    app.fitWindow();

    // ローダーで画像を読み込む
    var loading = tm.ui.LoadingScene({
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

// シーンを定義
tm.define("MainScene", {
    superClass: "tm.app.Scene",
    starConter: 0,    
    lives: true,
    move: false,
    
    init: function() {
        this.superInit();

        // assets で指定したキーを指定することで画像を表示
        // 背景
        this.bg = tm.display.Sprite("bg").addChildTo(this);
        this.bg.origin.set(0, 0);

        this.star = new Array(STAR_NUM);
        for (var i = 0; i < STAR_NUM; i++) {
            this.star[i] = tm.display.StarShape().addChildTo(this);
            this.star[i].setPosition(Math.rand(0, SCREEN_WIDTH), Math.rand(0, 600));
        }

        // assets で指定したキーを指定することで画像を表示
        this.player = player("player").addChildTo(this);
        this.player.setPosition(SCREEN_CENTER_X, 900).setScale(2, 2);
        
        this.lives = true;
        
    },

    // 更新処理
    update :function(app) {
        if (this.lives) {
            // キーボード
            var key = app.keyboard;
            var pointing = app.pointing;

            // ☆を設置する
            for (var m = 0; m < STAR_NUM; m++) {
                if (m % 2 == 0) {
                    this.star[m].x += 6;
                    this.star[m].y += 30;
                } else {
                    this.star[m].x = this.star[m].x - 6;
                    this.star[m].y += 10;
                }
                // クルクル回す
                this.star[m].rotation += 16;
                // 星が画面外に出たら、おしまい
                if (this.star[m].x >= SCREEN_WIDTH || this.star[m].y >= SCREEN_HEIGHT) {
                    this.star[m] = tm.display.StarShape().addChildTo(this);
                    this.star[m].setPosition(Math.rand(0, SCREEN_WIDTH), Math.rand(0, 600));
                    this.starConter += 1;
                }
                // 当り判定
                if (this.player.isHitElementRect(this.star[m])) {
                    this.stop();
                    this.lives = false;
                }
            }

            if (pointing.getPointing()) {
                this.player.x += (pointing.x-this.player.x)*0.2;
                this.player.y += (pointing.y-this.player.y)*0.2;
            }
            // 左矢印キーを押しているかを判定
            if (key.getKey("left")) {
                // 移動
                if(this.player.x >= 0) {
                    this.player.x-=8;
                    // 向き調整
                    this.player.scaleX = -2;                    
                }
            }
            // 右矢印キーを押しているかを判定
            if (key.getKey("right")) {
                // 移動
                if(this.player.x <= SCREEN_WIDTH) {
                    this.player.x+=8;
                    // 向き調整
                    this.player.scaleX = 2;
                }
            }
        }
    },
    stop :function(app) {
        this.move = false;
        this.player.stop();
        //リトライ
        this.btnRetry = tm.ui.FlatButton({
            width: 150,
            height: 50,
            text: "リトライ",
            bgColor: "red",
            fontSize: 35
        }).addChildTo(this).on("pointingend", function (e) {
            SCORE = 0;
            e.app.fps = FPS;
            e.app.replaceScene(MainScene());
        });
        this.btnRetry.setPosition(125, 110);

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