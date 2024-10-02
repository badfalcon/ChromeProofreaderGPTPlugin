chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "proofreadText",
        title: "校正する",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "proofreadText" && info.selectionText) {
        const selectedText = info.selectionText;

        // APIキーを取得してから校正処理を行う
        chrome.storage.sync.get(['apiKey'], async (result) => {
            if (result.apiKey) {
                // ローディングアニメーションを表示
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: showLoadingOverlay
                });

                try {
                    const correctedText = await proofreadText(selectedText, result.apiKey);

                    // 校正結果をページ内に表示
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        function: displayCorrectedText,
                        args: [correctedText]
                    });
                } catch (error) {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        function: displayCorrectedText,
                        args: [`エラーが発生しました: ${error.message}`]
                    });
                } finally {
                    // ローディングアニメーションを非表示にする
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        function: hideLoadingOverlay
                    });
                }
            } else {
                alert('APIキーが設定されていません。オプションページで設定してください。');
            }
        });
    }
});

// ChatGPT APIにテキストを送信する関数
async function proofreadText(text, apiKey) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `
          取引先に送る文章を校正してください。

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
          校正後の文章を提供してください。

          # Examples
          
          **Original:**
          この度無事に商品をお受け取りし、心から感謝しております。追加の注文についてお伺いしたいと考えておりますが、お時間のある時にお知らせ下さい。

          **校正後:**
          この度、無事に商品を受け取ることができ、心より感謝申し上げます。追加のご注文につきまして、お伺いしたく存じますので、お時間がございます際にお知らせくださいませ。

          (Note: 実際の例はより長くなるかもしれません。実際の文書を使用してください。)

          # Notes
          - 敬語は取引関係に相応しいものを使用してください。
          - 内容が正確であることを確認してください。
          `
                },
                {role: 'user', content: text}
            ],
            max_tokens: 500
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}


// ローディングオーバーレイを表示する関数
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';

    const spinner = document.createElement('div');
    spinner.id = 'spinner';
    spinner.style.border = '16px solid #f3f3f3';
    spinner.style.borderTop = '16px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '120px';
    spinner.style.height = '120px';
    spinner.style.animation = 'spin 2s linear infinite';

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // スピンアニメーション用のスタイルを追加
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);
}

// ローディングオーバーレイを非表示にする関数
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// 校正結果をページ内に表示する関数
function displayCorrectedText(correctedText) {
    let resultDiv = document.getElementById('proofreadResult');

    // 既に結果表示用のdivがあるか確認
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'proofreadResult';
        resultDiv.style.position = 'fixed';
        resultDiv.style.bottom = '20px';
        resultDiv.style.right = '20px';
        resultDiv.style.width = '300px';
        resultDiv.style.padding = '10px';

        // 見やすくするためのスタイルを設定
        resultDiv.style.backgroundColor = '#ffffff';  // 背景色を白に固定
        resultDiv.style.color = '#000000';  // 文字色を黒に固定
        resultDiv.style.border = '1px solid #ccc';
        resultDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        resultDiv.style.zIndex = '10001';
        resultDiv.style.overflowY = 'auto';
        resultDiv.style.maxHeight = '300px';
        resultDiv.style.fontFamily = 'Arial, sans-serif'; // 読みやすいフォント
        resultDiv.style.fontSize = '14px'; // 適切なフォントサイズ

        // 閉じるボタンを作成
        const closeButton = document.createElement('span');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.fontWeight = 'bold';

        // 閉じるボタンのクリックイベント
        closeButton.addEventListener('click', () => {
            resultDiv.remove();
        });

        // 閉じるボタンをdivに追加
        resultDiv.appendChild(closeButton);
        document.body.appendChild(resultDiv);
    }

    // 既存の内容をクリアして新しい校正結果を表示
    resultDiv.innerHTML = `<span style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 18px; font-weight: bold;">×</span>
                         <h3 style="margin: 0; padding-bottom: 10px; font-size: 16px;">校正結果:</h3>
                         <p style="margin: 0;">${correctedText}</p>`;

    // 再度閉じるボタンのイベントを追加
    resultDiv.querySelector('span').addEventListener('click', () => {
        resultDiv.remove();
    });
}
