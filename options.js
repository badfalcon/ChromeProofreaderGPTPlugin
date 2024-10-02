// 設定を保存する
document.getElementById('options-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;

    chrome.storage.sync.set({ apiKey: apiKey, model: model }, function() {
        alert('設定が保存されました');
    });
});

// 設定ページを開いた時に保存済みの設定を読み込む
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['apiKey', 'model'], function(result) {
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
        if (result.model) {
            document.getElementById('model').value = result.model;
        }
    });
});
