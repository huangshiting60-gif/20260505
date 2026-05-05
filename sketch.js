let capture;
let particles = []; // 儲存背景漂浮粒子的陣列
let zzzParticles = []; // 儲存貓咪睡覺打呼的 Zzz 粒子
let aromaParticles = []; // 儲存咖啡香氣粒子
let faceMesh; // 宣告 faceMesh 模型變數
let faces = []; // 儲存辨識結果
const faceIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]; // 指定的嘴唇外輪廓特徵點
const innerFaceIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184]; // 指定的嘴唇內輪廓特徵點
const leftEye1 = [243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112]; // 左眼輪廓 1
const leftEye2 = [133, 173, 157, 158, 159, 160, 161, 246, 33, 7, 163, 144, 145, 153, 154, 155]; // 左眼輪廓 2
const rightEye1 = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255]; // 右眼輪廓 1
const rightEye2 = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]; // 右眼輪廓 2
const faceOvalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]; // 臉部最外層輪廓

function preload() {
  // 載入較新版本的 ml5.faceMesh 模型
  // 明確設定 flipped: false，避免與後續畫布的 scale(-1, 1) 產生雙重翻轉
  faceMesh = ml5.faceMesh({ flipped: false });
}

function setup() {
  // 第一步驟：產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像內容
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設產生的 HTML 影片元素
  
  // 設定影像繪製模式為中心點
  imageMode(CENTER);

  // 啟動 faceMesh 辨識，當辨識到臉部時觸發 gotFaces 函式
  faceMesh.detectStart(capture, gotFaces);

  // 初始化背景漂浮粒子
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(3, 8),
      speedX: random(-1, 1),
      speedY: random(-2, -0.5)
    });
  }
}

// 儲存辨識到的臉部資料
function gotFaces(results) {
  faces = results;
}

function draw() {
  // 繪製背景顏色：從「靜謐的暮色藍」過渡到「溫暖的拿鐵色」，更符合午夜咖啡館氛圍
  let c1 = color(105, 120, 150); // 靜謐的暮色藍 (Muted Twilight Blue)
  let c2 = color(240, 220, 200); // 溫暖的拿鐵色 (Warm Latte)
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }

  // 在背景上方繪製漂浮的動態粒子 (光點或飄落的貓毛感)
  noStroke();
  fill(255, 255, 255, 120);
  for (let p of particles) {
    ellipse(p.x, p.y, p.size);
    p.x += p.speedX;
    p.y += p.speedY;
    // 若粒子飄出畫面，則讓它從反方向重新進入
    if (p.y < 0) p.y = height;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
  }

  // 在背景上方中間加入學號
  push();
  textAlign(CENTER, TOP);
  textSize(32);
  fill(90, 60, 40); // 配合場景氛圍的深咖啡色
  noStroke();
  
  // 加入白色發光效果，讓文字更精緻明顯
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.8)';
  
  text("414730175", width / 2, 30); // 放置於上方中間，距離頂部 30 像素
  pop();

  // 取得畫布 50% 範圍與攝影機真實的解析度
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let videoW = capture.elt.videoWidth;
  let videoH = capture.elt.videoHeight;
  
  // 若攝影機影像已載入，計算維持原始比例的寬高 (以確保不變形)
  if (videoW > 0 && videoH > 0) {
    // 同步 capture 元素尺寸為真實解析度，避免 ml5 取樣時讀取到黑邊或變形的影像而導致座標錯位
    if (capture.width !== videoW || capture.height !== videoH) {
      capture.size(videoW, videoH);
    }

    let videoRatio = videoW / videoH;
    let targetRatio = imgW / imgH;
    if (videoRatio > targetRatio) {
      imgH = imgW / videoRatio; // 影像比較寬：配合寬度，縮小高度
    } else {
      imgW = imgH * videoRatio; // 影像比較高：配合高度，縮小寬度
    }
  }

  // 將座標系移至中心並做水平翻轉，讓畫面左右顛倒
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  image(capture, 0, 0, imgW, imgH);

  // 繪製臉部辨識指定的特徵點線條
  if (faces.length > 0 && videoW > 0) {
    let keypoints = faces[0].keypoints;
    let cw = capture.width;
    let ch = capture.height;
    
    // 轉換座標的輔助函式
    let getPt = (index) => {
      let p = keypoints[index];
      return {
        x: (p.x / cw - 0.5) * imgW,
        y: (p.y / ch - 0.5) * imgH
      };
    };

    // 計算臉部寬度與中心點 (利用兩側點 234, 454 與鼻尖 1)
    let faceWidth = dist(getPt(234).x, getPt(234).y, getPt(454).x, getPt(454).y);
    let faceCenter = getPt(1); 

    // 1. 畫熊貓耳朵 (在臉的後方，先畫)
    let earL = getPt(332);
    let earR = getPt(103);
    fill(0);
    noStroke();
    // 將耳朵以鼻尖為基準往外側上方稍微偏移
    ellipse(earL.x + (earL.x - faceCenter.x) * 0.2, earL.y + (earL.y - faceCenter.y) * 0.2, faceWidth * 0.35);
    ellipse(earR.x + (earR.x - faceCenter.x) * 0.2, earR.y + (earR.y - faceCenter.y) * 0.2, faceWidth * 0.35);

    // 2. 畫白色的臉部底色 (使用臉部輪廓)
    fill(255, 255, 255, 220); // 半透明白色
    stroke(0);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < faceOvalIndices.length; i++) {
      let pt = getPt(faceOvalIndices[i]);
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    // 3. 畫黑眼圈與眼裡的高光
    // 計算左右眼中心
    let leX = 0, leY = 0, reX = 0, reY = 0;
    for (let i = 0; i < leftEye1.length; i++) {
      leX += getPt(leftEye1[i]).x; leY += getPt(leftEye1[i]).y;
      reX += getPt(rightEye1[i]).x; reY += getPt(rightEye1[i]).y;
    }
    leX /= leftEye1.length; leY /= leftEye1.length;
    reX /= rightEye1.length; reY /= rightEye1.length;

    // 計算臉部的傾斜角度 (Roll)，讓熊貓五官跟著頭部一起旋轉
    let faceAngle = atan2(reY - leY, reX - leX);

    noStroke();
    // 左眼圈
    push();
    translate(leX, leY); rotate(faceAngle - PI / 8);
    fill(0, 0, 0, 230); ellipse(0, 0, faceWidth * 0.25, faceWidth * 0.32);
    fill(255); ellipse(faceWidth * 0.03, -faceWidth * 0.03, faceWidth * 0.06); // 白色高光
    pop();
    // 右眼圈
    push();
    translate(reX, reY); rotate(faceAngle + PI / 8);
    fill(0, 0, 0, 230); ellipse(0, 0, faceWidth * 0.25, faceWidth * 0.32);
    fill(255); ellipse(-faceWidth * 0.03, -faceWidth * 0.03, faceWidth * 0.06); // 白色高光
    pop();

    // 4. 畫熊貓鼻子與嘴巴 (以鼻尖為基準)
    push();
    translate(faceCenter.x, faceCenter.y);
    rotate(faceAngle); // 讓鼻子與嘴巴跟著臉部旋轉
    
    // 計算真實嘴巴的張開程度
    let pt13 = getPt(13); // 上內唇
    let pt14 = getPt(14); // 下內唇
    let mouthOpen = dist(pt13.x, pt13.y, pt14.x, pt14.y);
    // 將張開程度映射到熊貓嘴巴的高度
    let pandaMouthH = map(mouthOpen, 0, faceWidth * 0.1, 0, faceWidth * 0.25, true);
    
    if (pandaMouthH > faceWidth * 0.02) {
      fill(0);
      noStroke();
      // 畫張開的嘴巴內部 (黑色半圓)
      arc(0, faceWidth * 0.1, faceWidth * 0.2, pandaMouthH, 0, PI);
      // 加一點紅紅的舌頭增加可愛感
      fill(255, 100, 100);
      arc(0, faceWidth * 0.1 + pandaMouthH * 0.2, faceWidth * 0.12, pandaMouthH * 0.6, 0, PI);
    }

    // 鼻子
    fill(0);
    noStroke();
    ellipse(0, faceWidth * 0.02, faceWidth * 0.15, faceWidth * 0.1);
    
    // 嘴唇 (W 形狀)
    stroke(0); strokeWeight(3); noFill();
    arc(faceWidth * 0.05, faceWidth * 0.1, faceWidth * 0.1, faceWidth * 0.08, 0, PI);
    arc(-faceWidth * 0.05, faceWidth * 0.1, faceWidth * 0.1, faceWidth * 0.08, 0, PI);
    pop();
  }
  pop();

  // 在攝影機影像上方繪製窗戶邊框
  drawWindowFrame(width / 2, height / 2, imgW, imgH);

  // 調整物件位置建立空間感與故事性
  drawSofa(width * 0.82, height * 0.82);      // 沙發移至右下角落地
  drawCat(width * 0.82, height * 0.74);       // 讓貓咪剛好趴在沙發上
  handleZzzs(width * 0.82, height * 0.74);    // 產生貓咪打呼的 Zzz 動畫
  drawCoffeeCup(width * 0.18, height * 0.82); // 巨大咖啡杯放在左下角
  handleCoffeeAroma(width * 0.18, height * 0.82); // 產生咖啡香氣動畫
  drawYarn(width * 0.32, height * 0.88);      // 毛線球散落在咖啡杯旁
}

// 當瀏覽器視窗大小改變時，維持全螢幕狀態
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 以下為自訂繪圖函式，使用 p5.js 幾何圖形拼湊出物件 ---

// 繪製巨大咖啡杯
function drawCoffeeCup(x, y) {
  push();
  translate(x, y);
  
  // 咖啡熱氣 (貝茲曲線加上 sin/cos 函數產生飄動動畫)
  let wave1 = sin(frameCount * 0.05) * 10;
  let wave2 = cos(frameCount * 0.05) * 10;
  
  stroke(255, 150);
  strokeWeight(4);
  noFill();
  bezier(-10, -50, -20 + wave1, -70, 0 + wave2, -80, -10, -100);
  bezier(15, -40, 25 + wave2, -60, 5 + wave1, -70, 15, -90);
  
  // 杯耳
  stroke(220, 200, 180);
  strokeWeight(12);
  arc(35, 5, 50, 60, -HALF_PI, HALF_PI);
  
  // 杯身 (帶有圓角的矩形)
  noStroke();
  fill(250, 240, 230); // 米白色杯子
  rect(-50, -30, 100, 80, 5, 5, 40, 40);
  
  // 咖啡液面
  fill(90, 60, 40); // 深咖啡色
  ellipse(0, -30, 100, 20);
  pop();
}

// 繪製毛茸茸沙發
function drawSofa(x, y) {
  push();
  translate(x, y);
  noStroke();
  
  // 椅背
  fill(180, 80, 80); // 暗紅色
  rect(-80, -50, 160, 80, 20);
  
  // 座墊
  fill(200, 90, 90);
  rect(-80, 0, 160, 40, 10);
  
  // 坐墊縫線
  stroke(150, 60, 60);
  strokeWeight(4);
  line(0, 0, 0, 40);
  
  // 扶手
  noStroke();
  fill(160, 60, 60);
  rect(-95, -15, 30, 60, 15);
  rect(65, -15, 30, 60, 15);
  pop();
}

// 繪製貓咪
function drawCat(x, y) {
  push();
  translate(x, y);
  scale(1.5); // 將貓咪整體放大 1.5 倍
  
  // 尾巴搖擺的動態角度
  let wag = sin(frameCount * 0.1) * 0.3;
  
  // 尾巴 (加上搖擺角度)
  stroke(50);
  strokeWeight(12);
  noFill();
  arc(30, -5, 50, 60, PI + QUARTER_PI + wag, TWO_PI + wag);
  
  // 身體 (貓咪趴著的模樣)
  noStroke();
  fill(50); // 深灰色
  ellipse(0, 15, 80, 55); 
  
  // 頭部
  ellipse(-35, -5, 50, 45);
  
  // 耳朵
  triangle(-55, -20, -40, -45, -25, -20);
  triangle(-25, -20, -15, -40, -5, -20);
  
  // 眼睛
  fill(255, 200, 50); // 黃色眼睛
  ellipse(-45, -5, 10, 14);
  ellipse(-25, -5, 10, 14);
  fill(0); // 瞳孔
  ellipse(-45, -5, 4, 10);
  ellipse(-25, -5, 4, 10);
  pop();
}

// 繪製毛線球
function drawYarn(x, y) {
  push();
  translate(x, y);
  
  // 毛線球主體
  noStroke();
  fill(255, 100, 150); // 粉紅色
  ellipse(0, 0, 60, 60);
  
  // 表面毛線紋路
  stroke(220, 80, 120);
  strokeWeight(3);
  noFill();
  arc(0, 0, 50, 50, -QUARTER_PI, PI + QUARTER_PI);
  arc(-5, 5, 40, 40, HALF_PI, PI + HALF_PI);
  arc(10, -5, 30, 30, 0, PI);
  line(-20, -10, 20, 10);
  line(-15, -20, 15, 20);
  line(-25, 0, 25, 0);
  
  // 散落的線頭
  stroke(255, 100, 150);
  strokeWeight(4);
  bezier(-10, 25, -20, 50, 20, 40, 40, 50);
  pop();
}

// 繪製窗戶邊框
function drawWindowFrame(x, y, w, h) {
  push();
  translate(x, y);
  
  // 外邊框 (深木頭色)
  stroke(90, 60, 40);
  strokeWeight(20);
  noFill();
  rectMode(CENTER);
  rect(0, 0, w, h);
  
  // 窗台 (底部凸出的木板)
  noStroke();
  fill(110, 75, 50); // 稍微亮一點的木頭色
  rectMode(CENTER);
  rect(0, h / 2 + 10, w + 60, 20, 5); // 圓角窗台
  
  // 簡單的玻璃反光效果增添細節
  fill(255, 255, 255, 30); // 半透明白色
  triangle(-w / 2 + 10, -h / 2 + 10, -w / 4, -h / 2 + 10, -w / 2 + 10, -h / 4);
  triangle(w / 4, h / 2 - 10, w / 2 - 10, h / 2 - 10, w / 2 - 10, h / 4);
  
  pop();
}

// 處理與繪製貓咪睡覺的 Zzz 動畫
function handleZzzs(catX, catY) {
  // 每 60 個 frame (約 1 秒) 產生一個新的 Z 符號
  if (frameCount % 60 === 0) {
    zzzParticles.push({
      x: catX - 40, // 配合貓咪頭部位置稍微往左偏移
      y: catY - 40, // 配合貓咪頭部位置稍微往上偏移
      alpha: 255,
      size: random(15, 25)
    });
  }
  
  push();
  textAlign(CENTER, CENTER);
  noStroke();
  
  // 倒序迴圈更新與繪製粒子 (為了能安全地在迴圈中刪除陣列元素)
  for (let i = zzzParticles.length - 1; i >= 0; i--) {
    let z = zzzParticles[i];
    fill(255, 255, 255, z.alpha);
    textSize(z.size);
    
    // 利用 sin 函數讓 Z 符號往上的同時能左右微微飄動
    let xOffset = sin(frameCount * 0.05 + z.size) * 15;
    text("Z", z.x + xOffset, z.y);
    
    z.y -= 0.8;      // 慢慢往上飄
    z.alpha -= 2;    // 慢慢變透明
    z.size += 0.05;  // 慢慢變大
    
    // 完全透明時從陣列中移除，節省效能
    if (z.alpha <= 0) {
      zzzParticles.splice(i, 1);
    }
  }
  pop();
}

// 處理與繪製咖啡香氣的粒子動畫
function handleCoffeeAroma(cupX, cupY) {
  // 每 15 個 frame 產生一個新的香氣粒子
  if (frameCount % 15 === 0) {
    aromaParticles.push({
      x: cupX + random(-20, 20),
      y: cupY - 30, // 從咖啡液面附近產生
      alpha: 150,
      size: random(8, 15),
      speedY: random(-1, -2)
    });
  }
  
  push();
  noStroke();
  
  // 倒序迴圈更新與繪製粒子
  for (let i = aromaParticles.length - 1; i >= 0; i--) {
    let p = aromaParticles[i];
    fill(255, 240, 220, p.alpha); // 溫暖的乳白色香氣
    ellipse(p.x, p.y, p.size);
    
    // 讓香氣往上飄，並加上 sin 函數產生左右輕微搖擺的煙霧感
    p.x += sin(frameCount * 0.03 + p.size) * 0.5;
    p.y += p.speedY;
    p.alpha -= 1.5;   // 慢慢變透明
    p.size += 0.2;    // 慢慢擴散變大
    
    // 完全透明時從陣列中移除
    if (p.alpha <= 0) {
      aromaParticles.splice(i, 1);
    }
  }
  pop();
}
