let capture;

function setup() {
  // 第一步驟：產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像內容
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設產生的 HTML 影片元素
  
  // 設定影像繪製模式為中心點
  imageMode(CENTER);
}

function draw() {
  // 繪製背景顏色為淺藍色加淡粉色漸層
  let c1 = color(173, 216, 230); // 淺藍色 (Light Blue)
  let c2 = color(255, 182, 193); // 淡粉色 (Light Pink)
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }

  // 將座標系移至中心並做水平翻轉，讓畫面左右顛倒
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  image(capture, 0, 0, width * 0.5, height * 0.5);
  pop();
}

// 當瀏覽器視窗大小改變時，維持全螢幕狀態
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
