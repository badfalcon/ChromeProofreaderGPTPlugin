const defaultPrompt = `取引先に送る文章を校正してください。

以下の詳細を確認してください。
- 誤字脱字がないか
- 文法的な誤りがないか
- 丁寧な敬語が使われているか
- 分かりやすく簡潔な表現が使われているか
- 取引先に適切なトーンで書かれているか

# Steps

1. テキスト全体を読み、文法、表現、敬語などに問題がないか確認する。
2. 誤字脱字があれば修正する。
3. 日本語の文法や構成に問題があれば修正する。
4. 敬語の使い方に問題があれば修正する。
5. 全体を再度確認し、簡潔かつ適切な表現になっているかチェックする。

# Output Format

校正後の文章のみを提供してください。

# Examples

**Original:**
この度無事に商品をお受け取りし、心から感謝しております。追加の注文についてお伺いしたいと考えておりますが、お時間のある時にお知らせ下さい。

**校正後:**
この度、無事に商品を受け取ることができ、心より感謝申し上げます。追加のご注文につきまして、お伺いしたく存じますので、お時間がございます際にお知らせくださいませ。

(Note: 実際の例はより長くなるかもしれません。実際の文書を使用してください。)

# Notes

- 敬語は取引関係に相応しいものを使用してください。
- 内容が正確であることを確認してください。`
// 既に保存されているAPIキーを表示
chrome.storage.sync.get(['apiKey', 'model', 'prompt'], (result) => {
    if (result.apiKey) {
        document.getElementById('apiKey').innerText = "入力済み";
    } else{
        document.getElementById('apiKey').innerText = "未入力";
    }
    if (result.model) {
        document.getElementById('model').innerText = result.model;
    }else {
        document.getElementById('model').innerText = "未設定"
    }
    if (result.customPrompt) {
        document.getElementById('prompt').value = result.prompt;
    } else {
        document.getElementById('prompt').value = defaultPrompt;
    }
});

// オプションページを開く
document.getElementById('openOptionsLink').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});