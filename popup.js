document.getElementById('saveKeyButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey: apiKey }, () => {
        alert('APIキーが保存されました！');
    });
});

// 既に保存されているAPIキーを表示
chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
    }
});