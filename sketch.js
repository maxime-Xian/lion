let recursionDepth = 6; // 默认递归深度
let fractalColorMode = 1; // 默认颜色模式
let branchAngle = 25; // 默认分支角度
let branchRatio = 0.75; // 默认分支长度比例

function setup() {
  createCanvas(800, 800);
  
  // 创建递归深度滑块
  depthSlider = createSlider(1, 9, recursionDepth, 1);
  depthSlider.position(20, 20);
  depthSlider.style('width', '150px');
  depthSlider.input(updateDepth);
  
  // 添加滑块标签
  let depthLabel = createDiv('递归深度:');
  depthLabel.position(20, 5);
  depthLabel.style('color', '#333');
  depthLabel.style('font-family', 'Arial');
  
  // 添加滑块值显示
  let depthValue = createDiv(depthSlider.value());
  depthValue.position(180, 20);
  depthValue.style('color', '#333');
  depthValue.style('font-family', 'Arial');
  depthValue.id('depth-value');
  
  // 创建角度滑块
  angleSlider = createSlider(10, 45, branchAngle, 1);
  angleSlider.position(20, 60);
  angleSlider.style('width', '150px');
  angleSlider.input(updateAngle);
  
  // 添加角度滑块标签
  let angleLabel = createDiv('分支角度:');
  angleLabel.position(20, 45);
  angleLabel.style('color', '#333');
  angleLabel.style('font-family', 'Arial');
  
  // 添加角度值显示
  let angleValue = createDiv(angleSlider.value());
  angleValue.position(180, 60);
  angleValue.style('color', '#333');
  angleValue.style('font-family', 'Arial');
  angleValue.id('angle-value');
  
  // 创建颜色模式按钮
  colorButton = createButton('切换颜色模式');
  colorButton.position(20, 100);
  colorButton.mousePressed(toggleColorMode);
  
  // 创建重置按钮
  resetButton = createButton('重置');
  resetButton.position(150, 100);
  resetButton.mousePressed(resetCanvas);
}

function updateDepth() {
  recursionDepth = depthSlider.value();
  select('#depth-value').html(recursionDepth);
}

function updateAngle() {
  branchAngle = angleSlider.value();
  select('#angle-value').html(branchAngle);
}

function toggleColorMode() {
  fractalColorMode = (fractalColorMode + 1) % 3;
}

function resetCanvas() {
  recursionDepth = 6;
  branchAngle = 25;
  fractalColorMode = 1;
  depthSlider.value(recursionDepth);
  angleSlider.value(branchAngle);
  select('#depth-value').html(recursionDepth);
  select('#angle-value').html(branchAngle);
}

function draw() {
  background(255);
  
  // 绘制树干分形
  push();
  translate(width/2, height-50);
  let trunkLength = height * 0.4;
  drawTree(0, 0, -HALF_PI, trunkLength, recursionDepth);
  pop();
}

function drawTree(x, y, angle, length, depth) {
  // 设置线条粗细，随深度变化
  let strokeWeight = map(depth, 0, recursionDepth, 1, 10);
  strokeWeight(strokeWeight);
  
  // 根据当前深度和颜色模式设置颜色
  if (fractalColorMode === 0) {
    // 黄蓝绿色模式 - 树干黄色，分支蓝色和绿色
    let yellow = color(255, 204, 0);
    let blue = color(0, 102, 204);
    let green = color(0, 153, 51);
    
    if (depth > recursionDepth * 0.7) {
      // 树干 - 黄色
      stroke(yellow);
    } else if (depth > recursionDepth * 0.3) {
      // 中间分支 - 蓝色
      stroke(blue);
    } else {
      // 顶部分支 - 绿色
      stroke(green);
    }
  } else if (fractalColorMode === 1) {
    // 深度渐变模式 - 从黄色到蓝色到绿色
    let yellow = color(255, 204, 0);
    let blue = color(0, 102, 204);
    let green = color(0, 153, 51);
    
    let colorProgress = map(depth, recursionDepth, 0, 0, 1);
    
    if (colorProgress < 0.5) {
      // 从黄色到蓝色
      let interColor = lerpColor(blue, yellow, colorProgress * 2);
      stroke(interColor);
    } else {
      // 从蓝色到绿色
      let interColor = lerpColor(green, blue, (colorProgress - 0.5) * 2);
      stroke(interColor);
    }
  } else {
    // 随机颜色模式
    let r = random(100, 255);
    let g = random(100, 255);
    let b = random(100, 255);
    stroke(r, g, b, 200);
  }
  
  // 绘制当前分支
  line(0, 0, 0, -length);
  
  // 移动到分支末端
  translate(0, -length);
  
  // 基本情况：达到最小递归深度，停止递归
  if (depth <= 0) {
    return;
  }
  
  // 计算新的分支长度
  let newLength = length * branchRatio;
  
  // 左分支
  push();
  rotate(-radians(branchAngle));
  drawTree(0, 0, angle - radians(branchAngle), newLength, depth - 1);
  pop();
  
  // 右分支
  push();
  rotate(radians(branchAngle));
  drawTree(0, 0, angle + radians(branchAngle), newLength, depth - 1);
  pop();
  
  // 中间分支（更细）
  if (depth > 2) {
    push();
    drawTree(0, 0, angle, newLength * 0.8, depth - 2);
    pop();
  }
}

// 添加鼠标交互，点击画布上的位置可以生成以该点为起点的树干
function mousePressed() {
  if (mouseY > 150) { // 避免点击到UI控件
    // 清除画布
    background(255);
    
    // 在鼠标点击位置绘制树干
    push();
    translate(mouseX, mouseY);
    let trunkLength = height * 0.3;
    drawTree(0, 0, -HALF_PI, trunkLength, recursionDepth);
    pop();
  }
}