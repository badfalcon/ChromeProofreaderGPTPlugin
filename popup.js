document.getElementById('saveSettingsButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;
    chrome.storage.sync.set({ apiKey: apiKey, model: model }, () => {
        alert('設定が保存されました！');
    });
});

// 既に保存されているAPIキーを表示
chrome.storage.sync.get(['apiKey','model'], (result) => {
    if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
    }
    if (result.model) {
        document.getElementById('model').value = result.model;
    }
});