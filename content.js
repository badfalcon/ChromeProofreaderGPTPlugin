// ローディングオーバーレイを表示する関数
function showLoadingOverlay() {
    let overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '20px';
    overlay.textContent = '校正中...';
    document.body.appendChild(overlay);
}

// ローディングオーバーレイを非表示にする関数
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// 差分を比較して、変更された部分をハイライト表示する関数
function displayCorrectedTextWithDiff(originalText, correctedText) {
    const diff = Diff.diffWords(originalText, correctedText);

    // 校正後の文章で変更された部分だけを表示
    const highlightedText = diff.map((part) => {
        // 修正された部分をハイライト
        if (part.added) {
            return `<span style="background-color: yellow;">${part.value}</span>`;
        }
        // 削除された部分は表示しない
        if (part.removed) {
            return '';
        }
        // 変更がない部分も表示しない
        return '';
    }).join('');

    // 結果をページに表示する
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = `
    <h3 style="margin-bottom: 5px; padding-bottom: 10px; font-size: 16px;">校正結果:</h3>
    <p style="margin: 0;">${highlightedText}</p>
    <button id="close-result" style="margin-top: 10px;">閉じる</button>
  `;

    // 前回の結果があれば削除して新しい結果を表示
    const existingResultDiv = document.getElementById('proofreading-result');
    if (existingResultDiv) {
        existingResultDiv.remove();
    }

    resultDiv.id = 'proofreading-result';
    document.body.appendChild(resultDiv);

    // 閉じるボタンの動作
    document.getElementById('close-result').addEventListener('click', () => {
        resultDiv.remove();
    });
}

// 差分を計算して、変更箇所のみをハイライトして表示する関数
function displayCorrectedTextWithHighlights(originalText, correctedText) {
    const diff = Diff.diffWords(originalText, correctedText);

    let resultHTML = '';

    diff.forEach(part => {
        if (part.added) { // 追加された部分をハイライト
            resultHTML += `<span style="background-color: yellow;">${part.value}</span>`;
        } else if (!part.removed) {
            // 変更されていない部分
            resultHTML += part.value;
        }
        // 削除された部分は表示しない
    });

    // 結果をページに表示
    let resultDiv = document.getElementById('proofread-result');
    // 既に結果表示用のdivがあるか確認
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'proofread-result';
        resultDiv.style.position = 'fixed';
        resultDiv.style.bottom = '20px';
        resultDiv.style.right = '20px';
        resultDiv.style.width = '300px';

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

        // 閉じるボタンをdivに追加
        document.body.appendChild(resultDiv);

        // 既存の内容をクリアして新しい校正結果を表示
        resultDiv.innerHTML = `<h3 style="margin: 0; padding-bottom: 10px; font-size: 16px;">校正結果:</h3>
                         <p style="padding: 10px;">${resultHTML}</p>`;

        // 閉じるボタンのクリックイベント
        closeButton.addEventListener('click', () => {
            resultDiv.remove();
        });

        // 閉じるボタンの追加
        resultDiv.appendChild(closeButton);
    } else {
        resultDiv.querySelector('p').innerHTML = resultHTML;
    }
}


// 校正結果を単純に表示する関数
function displayCorrectedText(message) {
    let resultDiv = document.getElementById('proofreadResult');

    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'proofreadResult';
        resultDiv.style.position = 'fixed';
        resultDiv.style.bottom = '20px';
        resultDiv.style.right = '20px';
        resultDiv.style.width = '300px';
        resultDiv.style.padding = '10px';
        resultDiv.style.backgroundColor = '#ffffff';
        resultDiv.style.color = '#000000';
        resultDiv.style.border = '1px solid #ccc';
        resultDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        resultDiv.style.zIndex = '10001';
        resultDiv.style.fontFamily = 'Arial, sans-serif';
        resultDiv.style.fontSize = '14px';

        document.body.appendChild(resultDiv);
    }

    resultDiv.innerHTML = `
    <h3 style="margin: 0; padding-bottom: 10px; font-size: 16px;">校正結果:</h3>
    <p style="margin: 0;">${message}</p>
  `;
}
