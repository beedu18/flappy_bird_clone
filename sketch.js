var pipes = [];
var grav, ball, upforce, _background;
var score = 0;      
var imgsize = 40;  //dogeSize
var die, hit, up, _point;  //sounds
var play = false, mute = false, once = true;    //booleans for program control

function preload() {
    die = loadSound('assets/sfx_die.wav');
    hit = loadSound('assets/sfx_hit.wav');
    _point = loadSound('assets/sfx_point.wav');
    up = loadSound('assets/sfx_wing.wav');
    _background = createImg('assets/canvas2.gif');
}

function setup() {
    var canvas = createCanvas(720, 600);
    grav = createVector(0,0.2);
    upforce = createVector(0,-2);
    ball = new Ball();
    ellipseMode(RADIUS);
    imageMode(CENTER);
    // frameRate(2000);
    _background.size(width,height);
    _background.position(0,0);
    _background.style('z-index: -1');
}

function draw(){
    clear();    
    if(play) {
        if(ball.alive)
            if(frameCount % 150==0)
                pipes.unshift(new Pipe());
        for(var pipe of pipes) {
            pipe.show();
            pipe.move();
            pipe.check(ball);
            if(pipe.x < - pipe.breadth)
                pipes.pop();
        }
        if(ball.alive) {
            ball.move();
            ball.show();
        }
        else {
            ball.dead();
            ball.moveDown();
        }
    }
}

function _play() {
    document.getElementById('container3').style.visibility = 'hidden';  //hide the play button
    play = true;
}

function reset () {
    // document.getElementById('score').innerHTML = "SCORE: 0";
    // document.getElementById('container2').style.visibility = 'hidden';
    // ball.vel.mult(0);
    // ball.alive = true;
    // ball.flag = true;
    // ball.pos.y = height/2;
    // ball.show();
    // score = 0;
    // document.getElementById('score').innerHTML = "SCORE: 0";
    // pipes.length = 0;
    // once = true;
    document.location.reload()
}

function mousePressed() {
    if(ball.alive && play)
        if(mouseButton == LEFT)
            ball.moveUp();
}

//volume ON: &#x1f50a;   volumeOFF: &#x1f507;
var i=1;
function _mute() {
    i++;
    i %= 2;
    var x = ['&#x1f50a;', '&#x1f507;'];
    var y = [true, false];
    document.getElementById('mute').innerHTML = x[i];
    mute = y[i];
}

class Ball {
    constructor() {
        this.pos = createVector(width/2,height/2);
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        this.rad = 15;
        this.alive = true;
        this.flag = true;
        // this.doge = loadImage('assets/doge.gif');       //only loads 1st gif frame, so, no animation
        this.doge = createImg('assets/doge.gif');   
        this.doge.size(imgsize,imgsize);    //resize doge
        this.doge.position(-100,-100);      //intially, have it off the screen
        this._dead = loadImage('assets/deaddoge.png')
    }

    moveUp() {
        this.vel.mult(0);
        this.acc.mult(0);
        var _y = this.pos.y;
        this.acc.add(upforce);
        while(Math.abs(_y - this.pos.y) < 4) {
            this.vel.add(this.acc);
            this.pos.add(this.vel);
        }
        this.acc.mult(0);
        if(!mute)
            up.play();
    }

    moveDown() {
        if (this.pos.y+this.rad < width && this.flag) {
            this.vel.y += 1;
            this.pos.add(this.vel);
        }
        else {
            if(this.flag && !mute)
                hit.play();
            this.flag = false;
            this.acc.mult(0);
            this.vel.mult(0);
            this.pos.y = height-this.rad;
        }
    }

    move() {
        this.acc.add(grav);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    dead() {
        this.doge.position(-100,-100);     //remove doge from screen if dead
        stroke(255);        
        strokeWeight(1.5);
        fill(255,0,0);
        image(this._dead,this.pos.x-3, this.pos.y-3,imgsize,imgsize);
    }

    show() {
        stroke(255);
        strokeWeight(1.5);
        fill(255,255,0);
        this.doge.position(this.pos.x-3-(imgsize/2), this.pos.y-3-(imgsize/2));
    }
}

class Pipe {
    constructor(x=width, y=random(height*0.25,height*0.75-50)) {
        this.x=x;
        this.y=y;
        this.length=120;    // gap between pipes
        this.breadth=40;
        this.count = true;
        this.score = document.getElementById('score');
    }

    move() {
        this.x-=2;
    }

    show() {
        stroke(255);
        strokeWeight(1.5);
        fill( 14, 158, 172 );
        rect(this.x,0,this.breadth,this.y);
        rect(this.x,(this.y+this.length),this.breadth,height);
        fill(10, 99, 108);
        rect(this.x,0,this.breadth*.3,this.y);
        rect(this.x,(this.y+this.length),this.breadth*.3,height);
    }

    check(_ball) {
        console.log(pipes.length);
        if(_ball.pos.y-_ball.rad <= 0)
            _ball.pos.y = 5;
        if((_ball.pos.x+_ball.rad > this.x) && (_ball.pos.x-_ball.rad < this.x+this.breadth))   //ball within pipe length
            if((_ball.pos.y+_ball.rad > this.y+this.length) || (_ball.pos.y-_ball.rad < this.y)) {    //ball touches pipe
                _ball.alive = false;
                if (!mute && !_ball.alive && once)
                    die.play();
                    once = false;
            }
        if(_ball.pos.y+_ball.rad >= height)     //ball touches bottom
            _ball.alive = false;
        if((_ball.pos.x-_ball.rad > this.x+this.breadth) && (_ball.alive) && (this.count)) {    //ball crossed pipe successfully
            this.count = false;
             if(!mute)
                _point.play()
            score++;
            this.score.innerHTML = "SCORE: "+score;
        }
        if(!_ball.alive)
            document.getElementById('container2').style.visibility = 'visible';            
    }
}