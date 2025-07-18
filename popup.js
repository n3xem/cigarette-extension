document.addEventListener('DOMContentLoaded', function() {
    const angleSlider = document.getElementById('angleSlider');
    const angleDisplay = document.getElementById('angleDisplay');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const resetBtn = document.getElementById('resetBtn');
    
    // 現在の角度を取得して表示
    chrome.storage.sync.get(['cigaretteAngle'], function(result) {
        const currentAngle = result.cigaretteAngle !== undefined ? result.cigaretteAngle : 270;
        angleSlider.value = currentAngle;
        updateAngleDisplay(currentAngle);
    });
    
    // スライダーの値が変更されたときの処理
    angleSlider.addEventListener('input', function() {
        const angle = parseInt(this.value);
        updateAngleDisplay(angle);
        updateCigaretteAngle(angle);
    });
    
    // プリセットボタンの処理
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const angle = parseInt(this.dataset.angle);
            angleSlider.value = angle;
            updateAngleDisplay(angle);
            updateCigaretteAngle(angle);
        });
    });
    
    // リセットボタンの処理
    resetBtn.addEventListener('click', function() {
        const angle = 270;
        angleSlider.value = angle;
        updateAngleDisplay(angle);
        updateCigaretteAngle(angle);
    });
    
    // 角度表示を更新
    function updateAngleDisplay(angle) {
        angleDisplay.textContent = angle + '°';
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
});