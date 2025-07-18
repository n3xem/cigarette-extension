document.addEventListener('DOMContentLoaded', function() {
    const angleSlider = document.getElementById('angleSlider');
    const angleDisplay = document.getElementById('angleDisplay');
    const smokeSlider = document.getElementById('smokeSlider');
    const smokeDisplay = document.getElementById('smokeDisplay');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const resetBtn = document.getElementById('resetBtn');
    
    // 現在の角度を取得して表示
    chrome.storage.sync.get(['cigaretteAngle'], function(result) {
        const currentAngle = result.cigaretteAngle !== undefined ? result.cigaretteAngle : 270;
        angleSlider.value = currentAngle;
        updateAngleDisplay(currentAngle);
    });
    
    // 現在の煙の量を取得して表示
    chrome.storage.sync.get(['smokeAmount'], function(result) {
        const currentSmoke = result.smokeAmount !== undefined ? result.smokeAmount : 5;
        smokeSlider.value = currentSmoke;
        updateSmokeDisplay(currentSmoke);
    });
    
    // スライダーの値が変更されたときの処理
    angleSlider.addEventListener('input', function() {
        const angle = parseInt(this.value);
        updateAngleDisplay(angle);
        updateCigaretteAngle(angle);
    });
    
    // 煙の量スライダーの値が変更されたときの処理
    smokeSlider.addEventListener('input', function() {
        const smoke = parseInt(this.value);
        updateSmokeDisplay(smoke);
        updateSmokeAmount(smoke);
    });
    
    // プリセットボタンの処理
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 角度のプリセット
            if (this.dataset.angle) {
                const angle = parseInt(this.dataset.angle);
                angleSlider.value = angle;
                updateAngleDisplay(angle);
                updateCigaretteAngle(angle);
            }
            // 煙の量のプリセット
            if (this.dataset.smoke) {
                const smoke = parseInt(this.dataset.smoke);
                smokeSlider.value = smoke;
                updateSmokeDisplay(smoke);
                updateSmokeAmount(smoke);
            }
        });
    });
    
    // リセットボタンの処理
    resetBtn.addEventListener('click', function() {
        const angle = 270;
        const smoke = 5;
        angleSlider.value = angle;
        smokeSlider.value = smoke;
        updateAngleDisplay(angle);
        updateSmokeDisplay(smoke);
        updateCigaretteAngle(angle);
        updateSmokeAmount(smoke);
    });
    
    // 角度表示を更新
    function updateAngleDisplay(angle) {
        angleDisplay.textContent = angle + '°';
    }
    
    // 煙の量表示を更新
    function updateSmokeDisplay(smoke) {
        smokeDisplay.textContent = smoke;
    }
    
    // タバコの角度を更新
    function updateCigaretteAngle(angle) {
        // ストレージに保存
        chrome.storage.sync.set({cigaretteAngle: angle});
        
        // アクティブなタブにメッセージを送信
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateAngle',
                    angle: angle
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.log('タブにメッセージを送信できませんでした:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
    }
    
    // 煙の量を更新
    function updateSmokeAmount(smoke) {
        // ストレージに保存
        chrome.storage.sync.set({smokeAmount: smoke});
        
        // アクティブなタブにメッセージを送信
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateSmokeAmount',
                    smokeAmount: smoke
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.log('タブにメッセージを送信できませんでした:', chrome.runtime.lastError.message);
                    }
                });
            }
        });
    }
});