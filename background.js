chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "proofreadText",
        title: "AIに文章を校正してもらう",
        contexts: ["selection"]
    });
});

let cssInserted = false;

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "proofreadText") {
        // CSSを挿入
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: () => hasRunProofread(),
        }).then(async function (results) {
            if (chrome.runtime.lastError || !results || !results.length) {
                return;  // Permission error, tab closed, etc.
            }
            if (results[0] !== true) {
                await chrome.scripting.insertCSS({
                    target: {tabId: tab.id},
                    files: ['proofreaderPlugin.css']
                });
            }
        });

        chrome.storage.sync.get(['apiKey', 'model', 'prompt'], async (result) => {
            if (result.apiKey && result.model && result.prompt) {
                // ローディングオーバーレイを表示
                await chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: () => showLoadingOverlay(),
                });

                // 選択文字列を改行つきで再取得
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: () => getSelectedText(),
                })
                .then(async getSelectResult => {
                    // selectedTextが空の場合はエラーメッセージを表示
                    if (!getSelectResult[0].result) {
                        await chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            func: () => displayCorrectedText("選択したテキストが見つかりませんでした。"),
                        });
                        return;
                    }
                    const selectedText = getSelectResult[0].result;

                    try {
                        const correctedText = await proofreadText(selectedText, result.prompt, result.apiKey, result.model);

                        // 差分をハイライト表示する関数を呼び出し
                        await chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            func: (model, originalText, correctedText) => displayCorrectedTextWithHighlights(model, originalText, correctedText),
                            args: [result.model, selectedText, correctedText]
                        });
                    } catch (error) {
                        console.error("エラーメッセージ:", error.message);

                        // エラーメッセージを表示
                        await chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            func: (message) => displayCorrectedText(message),
                            args: [`エラーが発生しました: ${error.message}`]
                        });
                    } finally {
                        // ローディングオーバーレイを非表示
                        await chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            func: () => hideLoadingOverlay(),
                        });
                    }
                });
            } else {
                // エラーメッセージを表示
                await chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: (message) => displayCorrectedText(message),
                    args: ['設定項目が不足しています。オプションページで設定してください。']
                });
            }
        });
    }
});

// ChatGPT APIを呼び出して校正する関数
async function proofreadText(text, prompt, apiKey, model) {
    try {
        const isStructuredOutputModel = model === "gpt-4o" || model === "gpt-4o-mini";
        const requestOptionBody = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 1000
        }
        // 特定のモデルの場合にボディに引数を追加
        if (isStructuredOutputModel) {
            requestOptionBody.response_format = responseFormat
        }
        const requestOption = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestOptionBody)
        }
        const response = await fetch("https://api.openai.com/v1/chat/completions", requestOption);

        const data = await response.json();

        // APIレスポンスをログに出力
        console.log("APIレスポンス:", data);

        // APIレスポンスにchoicesが存在するか確認
        if (data.choices && data.choices.length > 0) {
            // モデルが構造化出力の場合、proofread_messageを返す
            if (isStructuredOutputModel) {
                const content = JSON.parse(data.choices[0].message.content.trim());
                if (content.proofread_message) {
                    return content.proofread_message.join("\n");
                } else {
                    throw new Error("APIレスポンスが無効です。データが不足しています。");
                }
            }else{
                return data.choices[0].message.content.trim();
            }
        } else {
            throw new Error("APIレスポンスが無効です。データが不足しています。");
        }
    } catch (error) {
        console.error("APIエラー:", error);
        throw new Error("校正中にエラーが発生しました。: " + error.message);
    }
}

const responseFormat = {
    type: "json_schema",
    json_schema: {
        name: "reasoning_schema",
        strict: true,
        schema: {
            type: "object",
            properties: {
                proofread_message: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "The proofread message"
                },
            },
            required: ["proofread_message"],
            additionalProperties: false
        }
    }
}