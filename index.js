const pointArray = [];
const scaledArray = [];
const history=[];
const radius = 3;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('userInput');
const canvasSize = 500;
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 100;
const randomMax=35;
const randomMin=-35;
let scale = 5;
let offsetX = 0;const padding=5;
let offsetY = 0;  
class A {
  constructor(pointX, pointY) {
    this.pointX = pointX;
    this.pointY = pointY;
  }
}
function reloadPage() {
  location.reload();
}
function randomiseInput(){
  const selectedInput=document.getElementById('selectedInput');
  const n=selectedInput.selectedIndex+3;
  let s="";
  
  for(let i=0;i<n;i++){
    let randomNumberX=(Math.floor(Math.random()*2*randomMax)-randomMax);
    let randomNumberY=Math.floor(Math.random()*2*randomMax)-randomMax;
    s+=(`(${randomNumberX},${randomNumberY}) `);
  }
  console.log(s.trim());
  input.value=s.trim();
}
function setDimensions() {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pointArray.forEach(p => {
    minX = Math.min(minX, p.pointX);
    maxX = Math.max(maxX, p.pointX);
    minY = Math.min(minY, p.pointY);
    maxY = Math.max(maxY, p.pointY);
  });
  const rangeX = maxX - minX + 2 * padding;
  const rangeY = maxY - minY + 2 * padding;
  scale = Math.floor(Math.min(canvas.width / rangeX, canvas.height / rangeY));
  offsetX = -minX + padding;
  offsetY = -minY + padding;
}
function setPoints() {
  scaledArray.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pointArray.forEach(p => {
    const scaledX = (p.pointX + offsetX) * scale;
    const scaledY = canvas.height - (p.pointY + offsetY) * scale;

    scaledArray.push(new A(scaledX, scaledY));
    drawPoint(scaledX, scaledY);
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`(${p.pointX},${p.pointY})`, scaledX + 2 * radius, scaledY - 2 * radius);
  });
}
function getInput() {
  let valArr = input.value.trim().match(/\(\s*-?\d+\s*,\s*-?\d+\s*\)/g);
  if (!valArr) {
    console.log("No valid coordinate pairs found.");
    return;
  }
  pointArray.length = 0;
  scaledArray.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const numberPattern = /-?\d+/g;
  valArr.forEach(pair => {
    const [x, y] = pair.match(numberPattern).map(Number);
    pointArray.push(new A(x, y));
  });
  setDimensions();
  setPoints();
  jarvisMarch();
}

function drawPoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.stroke();
}
function drawBluePoint(x){
  ctx.beginPath();
  ctx.arc(x.pointX, x.pointY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.stroke();
}
function Blank(){

}
function drawYellowPoint(x){
  ctx.beginPath();
  ctx.arc(x.pointX, x.pointY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.stroke();
}
function drawLine(x,y){
  ctx.beginPath();
  ctx.moveTo(x.pointX,x.pointY);
  ctx.lineTo(y.pointX,y.pointY);
  ctx.strokeStyle="white";
  ctx.stroke();
}
function Orientation(p1,p2,p3){
  let x1=p1.pointX,x2=p2.pointX,x3=p3.pointX,y1=p1.pointY,y2=p2.pointY,y3=p3.pointY;
  let orientation=(y3-y2)*(x2-x1)-(y2-y1)*(x3-x2);
  if(orientation>0) return 1; //anti clock
  else if(orientation<0) return -1; //clock
  else return 0; //collinear
}
function init(onHull,next){
  drawBluePoint(onHull);
  drawYellowPoint(next);
}
function drawLineHistory(hull){
  if(hull.length<=1) return;
  for(let i=0;i<hull.length-1;i++){
    drawLine(hull[i],hull[i+1]);
  }
}
function jarvisMarch() {
  if(scaledArray.length<3) return;
  let hull=[];
  let start=scaledArray.reduce((leftMost, point) =>
    point.pointX < leftMost.pointX ? point : leftMost
  );
  let current=start;
  let next;
  let i=0;
  let checking=false;
  function arePointsEqual(p1, p2) {
    return p1.pointX === p2.pointX && p1.pointY === p2.pointY;
  }
  function distance(p1, p2) {
    return (p1.pointX-p2.pointX)**2+(p1.pointY - p2.pointY)**2;
  }
  function drawComparisonLine(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.pointX,p1.pointY);
    ctx.lineTo(p2.pointX,p2.pointY);
    ctx.strokeStyle="red";
    ctx.lineWidth=1;
    ctx.stroke();
  }
  function visualizeStep(candidate) {
    setPoints();
    drawLineHistory(hull);
    drawBluePoint(current);
    drawYellowPoint(next);
    drawComparisonLine(current,candidate);
  }
  function step() {
    if(!checking){
      hull.push(current);
      next=scaledArray[0]===current?scaledArray[1]:scaledArray[0];
      i=0;
      checking=true;
    }
    if(i<scaledArray.length) {
      const candidate=scaledArray[i];
      if(arePointsEqual(candidate,current)) {
        i++;
        setTimeout(step,300);
        return;
      }
      visualizeStep(candidate);
      const o = Orientation(current, next, candidate);
      if(o === 1|| (o === 0 && distance(current, candidate) > distance(current, next))) {
        next = candidate;
      }
      i++;
      setTimeout(step, 300);
    } else {
      if (arePointsEqual(next, start)) {
        hull.push(start);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPoints();
        drawLineHistory(hull);
        console.log(hull);
        return;
      }
      drawLine(current, next);
      current = next;
      checking = false;
      setTimeout(step, 500);
    }
  }
  step();
}
