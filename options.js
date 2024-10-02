document.getElementById('saveKeyButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;

    // APIキーをChromeストレージに保存
    chrome.storage.sync.set({ apiKey: apiKey }, () => {
        alert('APIキーが保存されました！');
    });
});

// 保存されたAPIキーがある場合、フォームに表示
chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
    }
});
