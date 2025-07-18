class VirtualCigarette {
  constructor() {
    this.cigarette = null;
    this.isDragging = false;
    this.isLit = false;
    this.isSmoking = false;
    this.dragOffset = { x: 0, y: 0 };
    this.smokeInterval = null;
    this.currentAngle = 0;
    this.init();
  }

  init() {
    this.createCigarette();
    this.setupEventListeners();
    this.setupMessageListener();
    this.loadSavedAngle();
  }

  createCigarette() {
    this.cigarette = document.createElement('div');
    this.cigarette.className = 'virtual-cigarette';
    this.cigarette.style.left = '50px';
    this.cigarette.style.top = '50px';
    document.body.appendChild(this.cigarette);
  }

  setupEventListeners() {
    let clickStartTime = 0;
    let dragStarted = false;

    // マウスでのドラッグ機能
    this.cigarette.addEventListener('mousedown', (e) => {
      clickStartTime = Date.now();
      dragStarted = false;
      
      this.isDragging = true;
      this.cigarette.classList.add('dragging');
      
      const rect = this.cigarette.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        if (!dragStarted) {
          dragStarted = true;
        }
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        this.cigarette.style.left = Math.max(0, Math.min(window.innerWidth - 8, x)) + 'px';
        this.cigarette.style.top = Math.max(0, Math.min(window.innerHeight - 80, y)) + 'px';
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.cigarette.classList.remove('dragging');
        
        // ドラッグではなく短時間のクリックの場合
        const clickDuration = Date.now() - clickStartTime;
        if (!dragStarted && clickDuration < 200) {
          const rect = this.cigarette.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          
          // タバコの上部（先端）をクリックした場合は火をつける
          if (clickY < 20) {
            this.toggleLight();
            console.log('火をつけました/消しました');
          }
          // タバコの下部をクリックした場合は煙を出す
          else if (clickY > 40) {
            this.toggleSmoke();
            console.log('煙を出しました/止めました');
          }
        }
      }
    });

    // キーボードイベント（念のため残しておく）
    document.addEventListener('keydown', (e) => {
      console.log('キーが押されました:', e.key);
      // Lキーで火をつける/消す
      if (e.key.toLowerCase() === 'l') {
        this.toggleLight();
        console.log('Lキーで火をつけました/消しました');
      }
      // Sキーで煙を出す/止める
      if (e.key.toLowerCase() === 's') {
        this.toggleSmoke();
        console.log('Sキーで煙を出しました/止めました');
      }
    });

    // ウィンドウリサイズ時の位置調整
    window.addEventListener('resize', () => {
      const rect = this.cigarette.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        this.cigarette.style.left = (window.innerWidth - 8) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        this.cigarette.style.top = (window.innerHeight - 80) + 'px';
      }
    });
  }

  toggleLight() {
    this.isLit = !this.isLit;
    if (this.isLit) {
      this.cigarette.classList.add('lit');
      console.log('火がつきました');
    } else {
      this.cigarette.classList.remove('lit');
      console.log('火が消えました');
      // 火が消えたら煙も止める
      if (this.isSmoking) {
        this.toggleSmoke();
      }
    }
  }

  toggleSmoke() {
    if (!this.isLit) {
      console.log('火がついていないので煙を出せません');
      return; // 火がついていない場合は煙を出さない
    }

    this.isSmoking = !this.isSmoking;
    
    if (this.isSmoking) {
      this.startSmoking();
      console.log('煙を出し始めました');
    } else {
      this.stopSmoking();
      console.log('煙を止めました');
    }
  }

  startSmoking() {
    this.smokeInterval = setInterval(() => {
      this.createSmokeParticle();
    }, 200);
  }

  stopSmoking() {
    if (this.smokeInterval) {
      clearInterval(this.smokeInterval);
      this.smokeInterval = null;
    }
  }

  createSmokeParticle() {
    const rect = this.cigarette.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = 'smoke-particle';
    
    // タバコの先端から煙を出す
    const startX = rect.left + rect.width / 2;
    const startY = rect.top - 5;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    document.body.appendChild(particle);
    
    // アニメーション開始
    setTimeout(() => {
      particle.classList.add('active');
    }, 10);
    
    // 3秒後に削除
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 3000);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateAngle') {
        this.updateAngle(request.angle);
        sendResponse({success: true});
      }
      return true;
    });
  }

  loadSavedAngle() {
    chrome.storage.sync.get(['cigaretteAngle'], (result) => {
      if (result.cigaretteAngle !== undefined) {
        this.updateAngle(result.cigaretteAngle);
      }
    });
  }

  updateAngle(angle) {
    this.currentAngle = angle;
    this.cigarette.style.transform = `rotate(${angle}deg)`;
    console.log(`タバコの角度を${angle}度に変更しました`);
  }
}

// ページが読み込まれたら初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VirtualCigarette();
  });
} else {
  new VirtualCigarette();
}