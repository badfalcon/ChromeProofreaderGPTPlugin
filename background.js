chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "proofreadText",
        title: "ChatGPTで校正する",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "proofreadText" && info.selectionText) {
        const selectedText = info.selectionText;

        chrome.storage.sync.get(['apiKey'], async (result) => {
            if (result.apiKey) {
                // ローディングオーバーレイを表示
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => showLoadingOverlay(),
                });

                try {
                    const correctedText = await proofreadText(selectedText, result.apiKey);

                    // 差分をハイライト表示する関数を呼び出し
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (originalText, correctedText) => displayCorrectedTextWithHighlights(originalText, correctedText),
                        args: [selectedText, correctedText]
                    });
                } catch (error) {
                    console.error("エラーメッセージ:", error.message);

                    // エラーメッセージを表示
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (message) => displayCorrectedText(message),
                        args: [`エラーが発生しました: ${error.message}`]
                    });
                } finally {
                    // ローディングオーバーレイを非表示
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => hideLoadingOverlay(),
                    });
                }
            } else {
                alert('APIキーが設定されていません。オプションページで設定してください。');
            }
        });
    }
});



// ChatGPT APIを呼び出して校正する関数 (GPT-3.5用)
async function proofreadText(text, apiKey) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `
            取引先に送る文章を校正してください。

            以下の詳細を確認してください。
            - 誤字脱字がないか
            - 文法的な誤りがないか
            - 丁寧な敬語が使われているか
            - 分かりやすく簡潔な表現が使われているか
            - 取引先に適切なトーンで書かれているか

            校正するテキストを以下に記載します。
            `
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                max_tokens: 1000
            })
        });

        const data = await response.json();

        // APIレスポンスをログに出力
        console.log("APIレスポンス:", data);

        // APIレスポンスにchoicesが存在するか確認
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error("APIレスポンスが無効です。データが不足しています。");
        }
    } catch (error) {
        console.error("APIエラー:", error);
        throw new Error("校正中にエラーが発生しました。");
    }
}
