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
  },

  stop: function () {
    // ***   STOP  ****
    clearInterval(newBall.interval);
  },

  clear: function () {
    const ctx = myBilliardTable.context;

    ctx.clearRect(0, scoreCard, canvasWidth, canvasHeight);

    ctx.fillStyle = "green";                                           // draw green billiard table
    ctx.fillRect(tableXLeft, tableYTop, tableWidth, tableHeight); 

    ctx.strokeStyle = "brown";                                         // draw brown border
    ctx.lineWidth = borderLineWidth;
    ctx.strokeRect(tableXLeft, tableYTop, tableWidth, tableHeight); 

    ctx.beginPath();                                                   // draw black Baulk line (ball must be behind this)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(tableXLeft, tableYBaulk);
    ctx.lineTo(tableXRight, tableYBaulk);
    ctx.stroke();
    ctx.closePath();   

    // draw 4 corner pockets and 2 side pockets
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
    ctx.arc(x, y, pocketRadius, startAngle1, endAngle1);      // use colour fill to draw a semi-circle between the suggested angles
    ctx.fill();
    ctx.closePath();

    if (isCorner) {      // for corner pockets you need 3/4 of a circle, not just a semi-circle. Add the other quarter here
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, pocketRadius, startAngle2, endAngle2);

      ctx.fill();
      ctx.closePath();
    }
  },

  score: function () {          // write the score in purple above the table
    const ctx = myBilliardTable.context;
    ctx.font = "24px Arial";
    ctx.fillStyle = "purple";
    ctx.clearRect(tableXLeft, 0, tableWidth, scoreCard);
    ctx.fillText(`Score: ${Score * scoreMultiplicator}`, tableXMiddle, 50);
    if (Score <= 0){      // score has gone down to 0, you have lost
      myBilliardTable.gameOver(false, false); 
    } 
  },

  gameOver: function (won, middlePocket) {
    const ctx = myBilliardTable.context;
    if (won) {       // the game is over because someone potted the ball
      ctx.font = "18px Arial";
      ctx.fillStyle = "purple";

      if (middlePocket){     // bonus points for potting in the middle pocket
        Score = Score + 10;
        ctx.clearRect(tableXLeft, 0, tableWidth, scoreCard);
        ctx.font = "18px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(`including ${10 * scoreMultiplicator} points bonus for middle pocket`, messageCentre, scoreCard + 180);
      }

      EndGame("Congratulations, you have won", `with a score of ${Score * scoreMultiplicator} points`);    // the score is multiplied by the multiplicator which id dependent on the pocket size
      } 
      else {    // the game is over because the score went down to 0
      EndGame("Sorry, you lost", " ")
    }
    myBilliardTable.stop();

  },
};

class billiardBall {
  constructor(color) {      // basic properties of the billiard ball
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
    this.angleRadians = (this.angle * Math.PI) / 180;    // the maths functions use radians so we need to convert the angle

    this.interval = setInterval(() => {
      this.Newx = this.x + Math.sin(this.angleRadians);    // calculate Newx and Newy, the next coordinates if the ball carries in the same directio
      this.Newy = this.y - Math.cos(this.angleRadians);    // use Newx and Newy to check that the ball hasn't hit a border or pocket
      // let intervalX = this.Newx - this.x;
      // let intervalY = this.Newy - this.y;

      myBilliardTable.clear();
      ctx.fillStyle = this.color;

      if (        // the ball has hit the top left pocket
        (this.Newx <= tableXLeft + pocketRadius) && (this.Newy <= tableYTop + pocketRadius)
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYTop - borderLineWidth, "red", Math.PI, 2 * Math.PI, true, 0.5 * Math.PI, Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (  // the ball has hit the top right pocket
        (this.Newx >= tableXRight - pocketRadius) && (this.Newy <= tableYTop + pocketRadius)
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYTop - borderLineWidth, "red", Math.PI, 2 * Math.PI, true, 0, 0.5 * Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (   // the ball has hit the bottom left pocket
        (this.Newx <= tableXLeft + pocketRadius) && (this.Newy >= tableYBottom - pocketRadius)
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYBottom + borderLineWidth, "red", 0, Math.PI, true, Math.PI, 1.5 * Math.PI);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (   // the ball has hit the bottom right pocket 
        (this.Newx >= tableXRight - pocketRadius) && (this.Newy >= tableYBottom - pocketRadius)
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYBottom + borderLineWidth, "red", 0, Math.PI, true, 1.5 * Math.PI, 0);
        myBilliardTable.gameOver(true, false);
        return;
      } else if (   // the ball has hit the left centre pocket
        (this.Newx <= (tableXLeft + ballRadius)) && (Math.abs(this.Newy - tableYMiddle) < pocketRadius)
      ) {
        myBilliardTable.pocket(tableXLeft - borderLineWidth, tableYMiddle, "red", 0.5 * Math.PI, 1.5 * Math.PI, false, 0, 0);
        myBilliardTable.gameOver(true, true);
        return;
      } else if (   // the ball has hit the right centre pocket
        (this.Newx >= (tableXRight - ballRadius)) && (Math.abs(this.Newy - tableYMiddle) < pocketRadius)
      ) {
        myBilliardTable.pocket(tableXRight + borderLineWidth, tableYMiddle, "red", 1.5 * Math.PI, 0.5 * Math.PI, false, 0, 0);
        myBilliardTable.gameOver(true, true);
        return;
      } else if (   // the ball has hit the left or right-hand border - the direction of the ball must change
        (this.Newx - ballRadius) <= tableXLeft || (this.Newx + ballRadius) >= tableXRight
      ) {
        this.angleRadians = 2 * Math.PI - this.angleRadians;
        this.angle = (180 * this.angleRadians) / Math.PI;
        Score = Score -1
        myBilliardTable.score();
      } else if (  // the ball has hit the top or bottom border - the direction of the ball must change
        (this.Newy - ballRadius <= tableYTop) || (this.Newy + ballRadius >= tableYBottom)
      ) {
        this.angleRadians = Math.PI - this.angleRadians;
        Score = Score - 1;
        myBilliardTable.score();
      } else {   // only if none of the above conditions apply can we update to the new (x.y) coordinates
        this.x = this.Newx;
        this.y = this.Newy;
      }

      ctx.beginPath();           // draw the ball in the new position
      ctx.arc(this.x, this.y, ballRadius, 0, 2 * Math.PI);
      ctx.fillstyle = this.color;
      ctx.fill();
      ctx.closePath();
     }, (11-Speed)/10);      // rate of screen refreshment affects the speed of the ball
  }
}

const scoreCard = 100;              // vertical position of the message giving the score

const canvas = document.getElementById("myCanvas");
const borderLineWidth = 5;          // width of the table border

var c = document.getElementById("myCanvas");
const canvasWidth = c.width;        // width and height of the canvas
const canvasHeight = c.height;

const tableWidth = 300;             // width and height of the billiard table
const tableHeight = 600;

const tableXLeft = 50 + borderLineWidth;      // horizontal left, right and middle of the table
const tableXRight = 50 + borderLineWidth + tableWidth;
const tableXMiddle = 50 + borderLineWidth + tableWidth / 2;

const tableYTop = 50 + scoreCard;         // vertical left, right and middle plus the position of the Baulk line
const tableYBottom = 50 + tableHeight + scoreCard;
const tableYMiddle = 50 + scoreCard + tableHeight / 2;
const tableYBaulk = 50 + scoreCard + tableHeight * (4 / 5);

const ballRadius = 15;        // radius of the ball
const MaxSpeed = 10;          // maximum posisble speed

const messageLeft = 600;      // position of all messages on the right of the picture
const messageWidth = 400;
const messageCentre = messageLeft + messageWidth / 2;
const messageBorder = 20;   

const speedMessageTop = 400;       // position of the messages at the beginning of the game, asking you to set variables
const speedMessageHeight = 380;

const winMessageHeight = 200;      // position of the message telling you have won / lost

const newBall = new billiardBall("white");     // set up a white billiard ball


let Score = 50;     // declare variables which will be used later
let Speed = 0;
let angleDegrees = 0;
let pocketRadius = 30;
let scoreMultiplicator = 1;

restart();

function restart() {
  
  Speed = 1;
  angleDegrees = 0;       // angle showing the direction the ball is traveling in
  
  myBilliardTable.start();
  myBilliardTable.clear();
  
  const ctx = myBilliardTable.context;
  ctx.fillStyle = "white";
  
  ctx.beginPath();            // draw an initial ball in the centre just behind the bault linke
  ctx.arc(tableXMiddle, tableYBaulk + ballRadius, ballRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  
  Intro();             // messages telling the player how to start the game
  tableUpdate();       // display the score above the table
}
    
  function tableUpdate() {       // show the score above the title
    const ctx = myBilliardTable.context;
    ctx.font = "24px serif";
    ctx.fillStyle = "purple";
    ctx.fillText(`Score: ${Score}`, tableXMiddle, 50);
  }
  
  function Intro() {
    const ctx = myBilliardTable.context;

    ctx.strokeStyle = "red";
    ctx.lineWidth = messageBorder;
    roundRect(messageLeft, speedMessageTop, messageWidth, speedMessageHeight, 20);   // draw a message window with curved borders
  
    ctx.font = "18px Arial";     // initial instructions
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(`Activate Num Lock and use the`, messageCentre, speedMessageTop + 50);
    ctx.fillText(`Up and Down Arrows on the right keypad`, messageCentre, speedMessageTop + 80);
    ctx.fillText(`to select a Speed between 1 and 10`, messageCentre, speedMessageTop + 110);

    ctx.fillStyle = "black";
    ctx.fillText(`Press <RETURN> to continue`, messageCentre, speedMessageTop + 150);
  
    speedBlock(true);    // add delete a rectangular block showing the current speed
  
    document.addEventListener("keydown", (event) => {
       switch (event.keyCode) {
         case 100: // left arrow
           if (Speed > 1) {         // speed may not decrease below 0
             Speed -= 1;
             speedBlock(false);     // remove the block at the right of the current diagram
           } 
           break;
         case 102: // right arrow
           if (Speed < MaxSpeed) {   // speed may not increase above the specified maximum
             Speed += 1;
             speedBlock(true);       // add an extra block at the right of the diagrem
           } 
           break;
         case 13: // return
           pocketSize();      // once they've pressed RETURN, move on to set the pocket size
          break;
          }
     })  
}



function roundRect(x, y, w, h, radius) {     // draw a message box with rounded edges
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

function speedBlock(Right) {       // draw one of up to 10 red blocks

  const ctx = myBilliardTable.context;
  ctx.strokeStyle = "red";
  ctx.font = "18px Arial";

  ctx.fillStyle = "red";    // write current speed above the blocks
  ctx.clearRect(messageLeft + messageBorder, speedMessageTop + 225, messageWidth - 2 * messageBorder, 50);
  ctx.fillText(`Current Speed: ${Speed}`, messageCentre, speedMessageTop + 250);
  
  const speedWidth = 30;    // define the size of the blocks
  const speedHeight = 80;
  ctx.globalAlpha = Speed * 0.1;    // set transparency to ensure each block is slightly darker than the previous one
  
  if (Right) {    // speed has increased, add an extra block
    let speedLeft = messageLeft + (Speed * speedWidth);
    ctx.fillRect(speedLeft, speedMessageTop + 280, speedWidth, speedHeight);
  } else {       // speed has decreased, remove the last block
    let speedLeft = messageLeft + ((Speed+1) * speedWidth);
    ctx.clearRect(speedLeft, speedMessageTop + 280, speedWidth, speedHeight);
  }
  
  ctx.globalAlpha = 1.0;     // make sure that future colours are solid,  
}


function EndGame(string1, string2){    // message when the game is over - passed as 2 strings
  const ctx = myBilliardTable.context;
  ctx.strokeStyle = "orange";
  ctx.lineWidth = messageBorder;
  roundRect(messageLeft, scoreCard, messageWidth, winMessageHeight, 20); 

  ctx.font = "24px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(string1, messageCentre, scoreCard + 50);
  ctx.fillText(string2, messageCentre, scoreCard + 100);
}


function getAngle() {      // set the angle
  myBilliardTable.score();    // update the scorecard before we start

  const ctx = myBilliardTable.context;
  ctx.fillStyle = "white";
  
  ctx.beginPath();     // place the ball just behind the baulk
  ctx.arc(tableXMiddle, tableYBaulk + ballRadius, ballRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();

  ctx.clearRect(messageLeft, speedMessageTop, messageWidth, speedMessageHeight);    // draw a message box with a green border
  ctx.strokeStyle = "green";
  ctx.lineWidth = messageBorder;
  roundRect(messageLeft, speedMessageTop, messageWidth, speedMessageHeight, 20);

  ctx.font = "18px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  const maxAngle=89      // set the maximum and minumum passible angles
  const minAngle=-89

  const angleMessage = speedMessageTop + 300   // set the position of messages

  ctx.fillText(`Activate Num Lock and use the`, messageCentre, speedMessageTop + 50);
  ctx.fillText(`Up and Down Arrows on the right keypad`, messageCentre, speedMessageTop + 80);
  ctx.fillText(`to select an angle between -89° and 89°`, messageCentre, speedMessageTop + 110);

  ctx.fillText("Press <RETURN> to continue", messageCentre, speedMessageTop + 150)

  ctx.font = "36px Arial";
  ctx.fillStyle = "green";
  ctx.fillText(`Angle: ${angleDegrees}`, messageCentre, angleMessage);     // write the current angle before arrows are selected

  document.addEventListener("keydown", (event) => {
    ctx.font = "36px Arial";

    switch (event.keyCode) {
      case 98: // down arrow - decrease the value of the angle
        if (angleDegrees > minAngle) {    // angle cannot go below the specified minimum
          angleDegrees -= 1;
          ctx.clearRect(messageLeft+messageBorder, angleMessage-25, messageWidth-(2*messageBorder), 50)
          ctx.fillText(`Angle: ${angleDegrees}`, messageCentre, angleMessage);   // write new angle after increase
        }
        break;
      case 104: // up arrow    increases the value of the angle
        if (angleDegrees < maxAngle) {   // angle cannot go above the specified mximum
          angleDegrees += 1;
          ctx.clearRect(messageLeft+messageBorder, angleMessage-25, messageWidth-(2*messageBorder), 50)
          ctx.fillText(`Angle: ${angleDegrees}`, messageCentre, angleMessage);    // write new angle after increase
        }
        break;
      case 13: // return
        myBilliardTable.clear();
        newBall.update(angleDegrees);    // press RETURN to start the game
    }
  });
}


function pocketSize() {   // set the pocket size
  const Button1X = messageLeft + 60      // horizontal position and width of buttons to click
  const Button2X = messageLeft + 160
  const Button3X = messageLeft + 260
  const ButtonWidth = 80

  const ButtonY = speedMessageTop + 250  // vertical position and height of buttons to click
  const ButtonHeight = 50

  const ctx = myBilliardTable.context;
  ctx.clearRect(messageLeft, speedMessageTop, messageWidth, speedMessageHeight);   // clear old text from message box

  ctx.strokeStyle = "blue";
  ctx.lineWidth = messageBorder;
  roundRect(messageLeft, speedMessageTop, messageWidth, speedMessageHeight, 20);  // draw new message box with blue border

  ctx.fillStyle = "blue";
  ctx.font = "18px Arial";
  ctx.fillText(`Click on the required pocket size`, messageCentre, speedMessageTop + 50);

  ctx.fillStyle = "black";
  ctx.fillText(`Higher scores are possible`, messageCentre, speedMessageTop + 100);
  ctx.fillText(`if you choose smaller pockets`, messageCentre, speedMessageTop + 130);

  
  ctx.fillStyle = "blue";

  ctx.fillRect(Button1X, ButtonY, ButtonWidth, ButtonHeight);    // add buttons
  ctx.fillRect(Button2X, ButtonY, ButtonWidth, ButtonHeight);
  ctx.fillRect(Button3X, ButtonY, ButtonWidth, ButtonHeight);

  ctx.font = "14px Arial";
  ctx.fillStyle = "white";

  ctx.fillText("Small", (Button1X + (ButtonWidth/2)), ButtonY + (ButtonHeight/2) + 5);    // add text inside buttons
  ctx.fillText("Normal", (Button2X + (ButtonWidth/2)), ButtonY + (ButtonHeight/2) + 5);
  ctx.fillText("Large", (Button3X + (ButtonWidth/2)), ButtonY + (ButtonHeight/2) + 5);

  document.addEventListener("click", (event) => {    // respond to a ouse click
    let xClick = event.pageX
    let yClick = event.pageY

    if ((yClick >= ButtonY) && (yClick <= ButtonY + ButtonHeight)){   // if the y coordinate is at the position of the buttons

      if ((xClick >= Button1X) && (xClick <= Button1X + ButtonWidth)){    // if the x coordinate is at the position of Button 1
        pocketRadius = 20;               // radius of pocket
        scoreMultiplicator=10;           // used to calculate the score - higher value for smaller pockets
        myBilliardTable.clear();         // clear the table
        getAngle();                      // calculate the path of the ball
      }
      else if ((xClick >= Button2X) && (xClick <= Button2X + ButtonWidth)){   // if the x coordinate is at the position of Button 2 - same logic as before
        pocketRadius = 30;
        scoreMultiplicator=4;
        myBilliardTable.clear();
        getAngle();
      }
      else if ((xClick >= Button3X) && (xClick <= Button3X + ButtonWidth)){  // if the x coordinate is at the position of Button 3 - same logic as before
        pocketRadius = 40;
        scoreMultiplicator=1;
        myBilliardTable.clear();
        getAngle();
      }
      else{
        // Out of range
      }

    }

})

}