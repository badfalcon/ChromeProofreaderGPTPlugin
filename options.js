// 保存されたAPIキーを読み込んで表示
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
            document.getElementById('apiKeyInput').value = result.apiKey;
        }
    });
});

// APIキーを保存
document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKeyInput').value;

    if (apiKey) {
        chrome.storage.sync.set({ apiKey }, () => {
            alert('APIキーが保存されました');
        });
    } else {
        alert('APIキーを入力してください');
    }
});
