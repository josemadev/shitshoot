window.addEventListener('load', init, false);

//Variables de canvas
var canvas = null, ctx = null;

//Varibles de control
var lastPress = null;
var pressing = [];
var pause = true, gameover = true;

//Varibles de escenas
var scenes = [];
var currentScene = 0;
var mainScene = new Scene();
var gameScene = new Scene();

//Variables de Player
var velocity = 3;
var navePlayer = new Rectangle(10, 300, 80, 80);
var inavePlayer = new Image();
inavePlayer.src = "nave.png";
var score = 0;
var lives = 3;
var levelUp = false;
var puntFinal = 0;
var finish = false;

// Variables de Disparos 
var shots = [];
var ishot = new Image();
ishot.src = "caca2.png";
var retardo = true;
//var audioShot = new Audio();
//audioShot.src = "disparo_1.mp3";


//Variables para naves enemigas
var enemies = [];
var ienemy = new Image();
ienemy.src = "naveEnemiga2.png";
var speedEnemies = 3;
var numEnemies = 3;
var numEnemiesAppeared = 0;

//Background
var bg = new Image();
bg.src = "galaxy2.jpg";
var bgTimer = 0;
var ibackground = new Image();
ibackground.src = "space.jpg";

//Varible que almacena las claves de las teclas que nos interesan para el juego
var keyPress = {
    KEY_SPACE: 32,
    KEY_ENTER: 13,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40
};
//Lanzadera
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    var bgTimer = canvas.width;
    run();
    repaint();
    retardarPlayer();
//    for (var i = 0; i < numEnemies; i++) {
//        addEnemy();
//    }
}
//Chama a función act cada 10 milisegundos
function run() {
    setTimeout(run, 10);
    if (scenes.length) {
        scenes[currentScene].act();
    }
}
//Chama a función paint cando o procesador gráfico está libre
function repaint() {
    requestAnimationFrame(repaint);
    if (scenes.length) {
        scenes[currentScene].paint(ctx);
    }
}
//Acciones de primera escena
mainScene.act = function() {
    if (lastPress == keyPress.KEY_ENTER) {
        currentScene = 1;
        gameover = !gameover;
    }
}
//Acciones de segunda escena
gameScene.act = function() {
    if (!pause) {
        // Cambiar dirección navePlayer
        if (pressing[keyPress.KEY_UP])
            navePlayer.y -= velocity;
        if (pressing[keyPress.KEY_RIGHT])
            navePlayer.x += velocity;
        if (pressing[keyPress.KEY_DOWN])
            navePlayer.y += velocity;
        if (pressing[keyPress.KEY_LEFT])
            navePlayer.x -= velocity;

        // Evitar que navePlayer se salga de la pantalla
        if (navePlayer.x > canvas.width - 80)
            navePlayer.x = canvas.width - 80;
        if (navePlayer.y > canvas.height - 90)
            navePlayer.y = canvas.height - 90;
        if (navePlayer.x < 2)
            navePlayer.x = 2;
        if (navePlayer.y < 0)
            navePlayer.y = 0;

        //Disparando con el espacio
        if (pressing[keyPress.KEY_SPACE]) {
            if (retardo) {
//                audioShot.currentTime = 0;
//                audioShot.play();
                shots.push(new Rectangle(navePlayer.x + 80, navePlayer.y + 20, 50, 50));
            }
        }
        //Moviendo munición
        for (var i = 0, l = shots.length; i < l; i++) {
            shots[i].x += 5;
            if (shots[i].x > canvas.width) {
                shots.splice(i--, 1);
                l--;
            }
        }
    }

//Controlando movimiento de nave enemigas
    for (var i = 0, l = enemies.length; i < l; i++) {
        if (!pause && !gameover) {
            enemies[i].x -= speedEnemies;
            if (enemies[i].x < -60) {
                enemies.splice(i--, 1);
                l--;
//                addEnemy();
            }
            // Player choca Enemy una vida menos si (vidas = 0) = gameOver 
            if (navePlayer.intersects(enemies[i])) {
                enemies.splice(i--, 1);
                addEnemy();
                lives--;
                if (lives == 0) {
                    gameover = true;
                    pause = true;
                    reset();
                }
            }
        }
    }

    //Interseccion de balas y enemigos si chocan se eliminan ambos y se crea una nueva nave enemiga
    for (var i = 0, ll = enemies.length; i < ll; i++) {
        for (var j = 0, l = shots.length; j < l; j++) {
            if (shots[j].intersects(enemies[i])) {
                score++;
                enemies.splice(i--, 1);
                shots.splice(j--, 1);
                ll--;
                l--;
//                addEnemy();
            }
        }
    }
//Subir nivel de dificultad
    if (numEnemiesAppeared == 50 || numEnemiesAppeared == 100 || numEnemiesAppeared == 150 || numEnemiesAppeared == 200 || numEnemiesAppeared == 250 || numEnemiesAppeared == 300||numEnemiesAppeared==400) {
        numEnemies++;
        speedEnemies++;
        levelUp = true;
        setTimeout(desactivarLevelUp, 3000);
    }
//Terminar juego
    if (numEnemiesAppeared == 500){
        puntFinal = score;
        finish = true;
         gameover = true;
         pause = true;
         reset();
         setTimeout(desactFinish, 6000);
    }
    
    //Añadir enemigo si (enemies.length< numEnemies) 
    if (enemies.length < numEnemies) {
        addEnemy();
    }


// Pause/Unpause
    if (lastPress == keyPress.KEY_ENTER) {
        pause = !pause;
        lastPress = null;
    }
}



mainScene.paint = function(ctx) {
//    ctx.fillStyle = '#030';
//    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = "80px Impact";
    ctx.fillText('Spacecraft', 400, 150);
    ctx.font = "18px Impact";
    ctx.fillText('Press Enter', 400, 340);
    ctx.font = "12px Arial";
    ctx.fillText('Disparo ->Barra espaciadora || Mover-> teclas de Dirección', 400, 380);
    ctx.fillText('Obtén la mayor puntuación en una invasión de 500 naves ', 400, 420);
}


gameScene.paint = function(ctx) {
    ctx.drawImage(ibackground, bgTimer, 0);
    ctx.drawImage(ibackground, bgTimer - ibackground.width, 0);
//    ctx.fillStyle = "#000";
//    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = '#0f0';
    //ctx.fillRect(x, y, 10, 10);
    ctx.font = "25px Impact";
    ctx.fillText('Score:' + score, 80, 50);
    ctx.fillText('Lives:' + lives, 200, 50);
//    ctx.fillText(numEnemiesAppeared, 50, 150);
    navePlayer.drawImage(ctx, inavePlayer);
    ctx.fillStyle = '#fff';
    //ctx.fillText('Last Press: '+lastPress,0,20);
    ctx.fillStyle = '#f00';
    //Disparos
    for (var i = 0, l = shots.length; i < l; i++) {
        //shots[i].fill(ctx);
        shots[i].drawImage(ctx, ishot);
    }
    //Enemigos
    for (var i = 0, l = enemies.length; i < l; i++) {
        enemies[i].drawImage(ctx, ienemy);
    }

    ctx.fillStyle = 'white';
    if (levelUp) {
        ctx.fillText('Level UP', 500, 200);
    }

    bgTimer--;
    if (bgTimer < 0) {
        bgTimer = 1000;
    }

    if (pause) {
        ctx.textAlign = 'center';
        if (numEnemiesAppeared == 3) {
            ctx.fillText('GAME OVER', 500, 200);
        } else {
            ctx.fillText('PAUSE', 500, 200);
        }
        if (finish){
            ctx.fillText('JUEGO TERMINADO ¡FELICIDADES!', 500, 300); 
            ctx.fillText('PUNTUACIÓN FINAL:'+puntFinal, 500, 300);  
            desactFinish();
        }
    }
}

//Reiniciar juego
function reset() {
    lives = 3;
    score = 0;
    numEnemiesAppeared = 0;
    speedEnemies = 3;
    navePlayer.x = 90;
    navePlayer.y = 280;
    shots.length = 0;
    enemies.length = 0;
    numEnemies = 3;
    for (var i = 0; i < numEnemies; i++) {
        addEnemy();
    }
    gameover = false;
}

//Función para que no dispare continuadamente
function retardarPlayer() {
    if (!retardo) {
        setTimeout(retardarPlayer, 10);
    } else {
        setTimeout(retardarPlayer, 350);
    }
    retardo = !retardo;
    if (!pressing[keyPress.KEY_SPACE]) {
        retardo = false;
    }

}
//Añade un nuevo enemigo
function addEnemy() {
    enemies.push(new Rectangle(randomPro(1000, 2000), random(540), 80, 80));
    numEnemiesAppeared++;
}

//Cambia a false levelUP
function desactivarLevelUp() {
    levelUp = false;
}

//Devuelve un número random de 0 a max
function random(max) {
    return ~~(Math.random() * max);
}
//Devuelve un número entre min y max
function randomPro(min, max) {
    return ~~(Math.random() * (max - min)) + min;
}


//Establece la clase Rectagulo
function Rectangle(x, y, width, height) {
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;
}

//Devuelse true si dos rectangulos chocan
Rectangle.prototype.intersects = function(rect) {
    if (rect != null) {
        return(this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
    }
}

//Dibuja un rectangulo
Rectangle.prototype.fill = function(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
}

//Dibuja una imagen en un rectagulo
Rectangle.prototype.drawImage = function(ctx, img) {
    if (img.width)
        ctx.drawImage(img, this.x, this.y);
    else
        ctx.strokeRect(this.x, this.y, this.width, this.height);
}

function Scene() {
    this.id = scenes.length;
    scenes.push(this);
}


Scene.prototype.act = function() {
};
Scene.prototype.paint = function(ctx) {
};



//Devuelve la ultima tecla pulsada
document.addEventListener('keydown', function(evt) {
    lastPress = evt.keyCode;
    pressing[evt.keyCode] = true;
}, false);


//Devuelve falso cuando levantamos una tecla  en el array pressing[]
document.addEventListener('keyup', function(evt) {
    pressing[evt.keyCode] = false;
}, false);


//Compatibilidad con requestAnimationFrame
window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 17);
            };
})();

