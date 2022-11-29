console.log("Online Billiards");
console.log("\n");

const myBilliardTable = {
  canvas: document.createElement("canvas"),
  frames: 0,

  start: function () {
    var c = document.getElementById("myCanvas");
    this.context = this.canvas.getContext("2d");

    this.canvas.width = c.width;
    this.canvas.height = c.height;

    document.body.insertBefore(this.canvas, document.body.childNodes[0]); // call updateGameArea() every 20 milliseconds
    this.interval = setInterval(tableUpdate, 2000); 

    const scoreCard = 100;
  },

  stop: function () {

    clearInterval(newBall.interval);
  },

  clear: function () {
    const ctx = myBilliardTable.context;

    ctx.clearRect(0, scoreCard, canvasWidth, canvasHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(tableXLeft, tableYTop, tableWidth, tableHeight);

    ctx.strokeStyle = "brown";
    ctx.lineWidth = borderLineWidth;
    ctx.strokeRect(tableXLeft, tableYTop, tableWidth, tableHeight);

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(tableXLeft, tableYBaulk);
    ctx.lineTo(tableXLeft, tableYBaulk);
    ctx.stroke();
    ctx.closePath();

    myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYTop - borderLineWidth, "rgb(153, 157, 160)", Math.PI, 2 * Math.PI, true, 0.5 * Math.PI, Math.PI);
    myBilliardTable.pocket(tableXRight + borderLineWidth, tableYTop - borderLineWidth, "rgb(153, 157, 160)", Math.PI, 2 * Math.PI, true, 0, 0.5 * Math.PI);
    myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYBottom + borderLineWidth, "rgb(153, 157, 160)", 0, Math.PI, true, Math.PI, 1.5 * Math.PI);
    myBilliardTable.pocket(tableXRight + borderLineWidth, tableYBottom + borderLineWidth, "rgb(153, 157, 160)", 0, Math.PI, true, 1.5 * Math.PI, 0);
    myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYMiddle, "rgb(153, 157, 160)", 0.5 * Math.PI, 1.5 * Math.PI, false, 0, 0);
    myBilliardTable.pocket(tableXRight + borderLineWidth, tableYMiddle, "rgb(153, 157, 160)", 1.5 * Math.PI, 0.5 * Math.PI, false, 0, 0);
  },

  pocket: function (x, y, fill, startAngle1, endAngle1, isCorner, startAngle2, endAngle2) {
    const ctx = myBilliardTable.context;
    ctx.fillStyle = fill;

    ctx.beginPath();
    ctx.arc(x, y, pocketRadius, startAngle1, endAngle1);
    ctx.fill();
    ctx.closePath();

    if (isCorner) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, pocketRadius, startAngle2, endAngle2);

      ctx.fill();
      ctx.closePath();
    }
  },

  score: function () {
    const ctx = myBilliardTable.context;
    ctx.font = "18px serif";
    ctx.fillStyle = "black";
    Score = Score - 1;
    ctx.clearRect(tableXLeft, 0, tableWidth, scoreCard);
    ctx.fillText(`Score: ${Score}`, tableXMiddle, 50);
  },

  gameOver: function (won, middlePocket) {
    if (won) {
      const ctx = myBilliardTable.context;

      let string3 = " ";

      if (middlePocket){
        ctx.clearRect(tableXLeft, 0, tableWidth, scoreCard);
        Score = Score + 10;
        string3 = "including 10 points bonus for middle pocket"
      EndGame("Congratulations, you have won", `with ${Score} points`, string3);
      }

      gameOn = false;
      myBilliardTable.stop();
    } else {
      EndGame("Sorry, you lost", " ", " ")
      myBilliardTable.stop();
    }
  },
};

class billiardBall {
  constructor(color) {
    this.color = color;
    this.x = tableXMiddle;
    this.y = tableYBaulk + ballRadius;
    this.Newx = this.x;
    this.Newy = this.y;
    this.interval = null;
  }

  update(angle) {
    const ctx = myBilliardTable.context;
    ctx.linewidth = 10;

    this.angle = angle;
    this.angleRadians = (this.angle * Math.PI) / 180;

    this.interval = setInterval(() => {
      this.Newx = this.x + Math.sin(this.angleRadians);
      this.Newy = this.y - Math.cos(this.angleRadians);
      let intervalX = this.Newx - this.x;
      let intervalY = this.Newy - this.y;

      myBilliardTable.clear();
      ctx.fillStyle = this.color;

      if (
        this.Newx - ballRadius <= tableXLeft && this.Newy - ballRadius <= tableYTop
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYTop - borderLineWidth, "red", Math.PI, 2 * Math.PI, true, 0.5 * Math.PI, Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (
        this.Newx + ballRadius >= tableXRight && this.Newy - ballRadius <= tableYTop
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYTop - borderLineWidth, "red", Math.PI, 2 * Math.PI, true, 0, 0.5 * Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (
        this.Newx - ballRadius <= tableXLeft && this.Newy + ballRadius >= tableYBottom
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYBottom + borderLineWidth, "red", 0, Math.PI, true, Math.PI, 1.5 * Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (
        this.Newx + ballRadius >= tableXRight && this.Newy + ballRadius >= tableYBottom
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYBottom + borderLineWidth, "red", 0, Math.PI, true, 1.5 * Math.PI, 0);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (
        this.Newx - ballRadius <= tableXLeft && Math.abs(this.Newy - tableYMiddle) < pocketRadius
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYMiddle, "red", 0.5 * Math.PI, 1.5 * Math.PI, false, 0, 0);
        myBilliardTable.gameOver(true, true);
        return;
      } else if (
        this.Newx + ballRadius >= tableXRight && Math.abs(this.Newy - tableYMiddle) < pocketRadius
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYMiddle, "red", 1.5 * Math.PI, 0.5 * Math.PI, false, 0, 0);
        myBilliardTable.gameOver(true, true);
        return;
      } else if (
        this.Newx - ballRadius <= tableXLeft || this.Newx + ballRadius >= tableXRight
      ) {
        this.angleRadians = 2 * Math.PI - this.angleRadians;
        this.angle = (180 * this.angleRadians) / Math.PI;
        myBilliardTable.score();
      } else if (
        this.Newy - ballRadius <= tableYTop || this.Newy + ballRadius >= tableYBottom
      ) {
        this.angleRadians = Math.PI - this.angleRadians;
        myBilliardTable.score();
      } else {
        this.x = this.Newx;
        this.y = this.Newy;
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, ballRadius, 0, 2 * Math.PI);
      ctx.fillstyle = this.color;
      ctx.fill();
      ctx.closePath();
    }, 1);
  }
}

const scoreCard = 100;

const canvas = document.getElementById("myCanvas");
const pocketRadius = 40;
const borderLineWidth = 5;

var c = document.getElementById("myCanvas");
const canvasWidth = c.width;
const canvasHeight = c.height;

const tableWidth = 500;
const tableHeight = 1000;

const tableXLeft = pocketRadius + borderLineWidth;
const tableXRight = pocketRadius + borderLineWidth + tableWidth;
const tableXMiddle = pocketRadius + borderLineWidth + tableWidth / 2;

const tableYTop = pocketRadius + scoreCard;
const tableYBottom = pocketRadius + tableHeight + scoreCard;
const tableYMiddle = pocketRadius + scoreCard + tableHeight / 2;
const tableYBaulk = pocketRadius + scoreCard + tableHeight * (4 / 5);

const ballRadius = 20;
const MaxSpeed = 10;

const messageLeft = 700;
const messageTop = 700;
const messageWidth = 400;
const speedMessageHeight = 400;
const winMessageHeight = 300;
const messageBorderWidth = 10;
const messageCentre = messageLeft + messageWidth / 2;
const messageBorder = 20;

const ScoreCardTop = 200;
gameOn = true;

let Score = 100;
let Speed = 1;

myBilliardTable.start();
myBilliardTable.clear();
Intro();
tableUpdate();

const newBall = new billiardBall("white");

function strikeBall(angle) {
  document.addEventListener("click", (event) => {
    if (gameOn) {
      myBilliardTable.clear();
    
      if (Score <= 0) {
        myBilliardTable.gameOver(false, false);
      } else {
          newBall.update(angle);
         }
    }

  });
}

function tableUpdate() {
  const ctx = myBilliardTable.context;
  ctx.font = "18px serif";
  ctx.fillStyle = "black";
  ctx.fillText(`Score: ${Score}`, tableXMiddle, 50);
}

function Intro() {
  const ctx = myBilliardTable.context;
  ctx.strokeStyle = "red";
  ctx.lineWidth = messageBorderWidth;
  roundRect(messageLeft, messageTop, messageWidth, speedMessageHeight, 20);

  ctx.font = "18px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(`Use the Left and Right Arrows`, messageCentre, messageTop + 50);
  ctx.fillText(`to select a Speed between 1 and 10`, messageCentre, messageTop + 80);

  ctx.fillText(`Press <RETURN> to continue`, messageCentre, messageTop + 150);

  speedBlock(true);

  document.addEventListener("keydown", (event) => {
    switch (event.keyCode) {
      case 37: // left arrow
        if (Speed > 1) {
          Speed -= 1;
          speedBlock(false);
        } else {   //  hit left barrier - no change
        }
        break;
      case 39: // right arrow
        if (Speed < MaxSpeed) {
          Speed += 1;
          speedBlock(true);
        } else {  //hit right barrier - no change
        }
        break;
      case 13: // return
        getAngle();
        strikeBall(10);
    }
  });
}

function roundRect(x, y, w, h, radius) {
  const ctx = myBilliardTable.context;

  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(r - radius, y);
  ctx.quadraticCurveTo(r, y, r, y + radius);
  ctx.lineTo(r, y + h - radius);
  ctx.quadraticCurveTo(r, b, r - radius, b);
  ctx.lineTo(x + radius, b);
  ctx.quadraticCurveTo(x, b, x, b - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.stroke();
}

function speedBlock(Right) {
  const ctx = myBilliardTable.context;

  ctx.fillStyle = "red";
  ctx.clearRect(
    messageLeft + messageBorder,
    messageTop + 225,
    messageWidth - 2 * messageBorder,
    50
  );
  ctx.fillText(`Current Speed: ${Speed}`, messageCentre, messageTop + 250);

  const speedWidth = 30;
  const speedHeight = 80;
  ctx.globalAlpha = Speed * 0.1;


  if (Right) {
    let speedLeft = messageLeft + (Speed * speedWidth);
    ctx.fillRect(speedLeft, messageTop + 300, speedWidth, speedHeight);
  } else {
    let speedLeft = messageLeft + ((Speed+1) * speedWidth);
    ctx.clearRect(speedLeft, messageTop + 300, speedWidth, speedHeight);
  }

  ctx.globalAlpha = 1.0;
}

function EndGame(string1, string2, string3){
  const ctx = myBilliardTable.context;
  ctx.strokeStyle = "blue";
  ctx.lineWidth = messageBorderWidth;
  roundRect(messageLeft, ScoreCardTop, messageWidth, winMessageHeight, 20); 

  ctx.font = "24px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(string1, messageCentre, ScoreCardTop + 50);
  ctx.fillText(string2, messageCentre, ScoreCardTop + 100);

  ctx.font = "18px Arial";
  ctx.fillStyle = "blue";
  ctx.fillText(string3, messageCentre, ScoreCardTop + 200);


}


function getAngle(){
  const ctx = myBilliardTable.context;
  ctx.clearRect(messageLeft, messageTop, messageWidth, speedMessageHeight);

  ctx.strokeStyle = "green";
  ctx.lineWidth = messageBorderWidth;
  roundRect(messageLeft, messageTop, messageWidth, speedMessageHeight, 20);

  ctx.font = "18px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(`Hover over the yellow area to find an angle`, messageCentre, messageTop + 50);

  const x1 = messageCentre;
  const y1 = messageTop + 100;
  const r1 = 150;
  const angleStart =  (-1 * Math.PI) / 180;
  const angleEnd = (181 * Math.PI) / 180;

  ctx.fillStyle = "yellow";

  ctx.beginPath();
  ctx.moveTo(x1, y1);

  ctx.arc(x1, y1, r1, angleStart, angleEnd);
  
  ctx.fill();
  ctx.closePath();

  document.addEventListener("mousemove", (event) => {

    // console.log(MouseEvent.clientX)
    // console.log(MouseEvent.clientY)
  });



}