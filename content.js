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
    overlay.style.zIndex = '10001';
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

// 校正結果を表示する関数
function getProofreadWindow() {
    let proofreadWindow = document.getElementById('proofread-window');

    if (!proofreadWindow) {
        proofreadWindow = createProofreadWindow();
    }

    return proofreadWindow;
}

// 校正結果を表示するウィンドウを作成する関数
function createProofreadWindow() {
    const proofreadWindow = document.createElement('div');
    proofreadWindow.id = 'proofread-window';
    proofreadWindow.style.position = 'fixed';
    proofreadWindow.style.bottom = '20px';
    proofreadWindow.style.right = '20px';
    proofreadWindow.style.maxWidth = '80%';
    proofreadWindow.style.minWidth = '100px';
    proofreadWindow.style.minHeight = '100px';
    proofreadWindow.style.padding = '10px';
    proofreadWindow.style.backgroundColor = '#ffffff';
    proofreadWindow.style.color = '#000000';
    proofreadWindow.style.border = '1px solid #ccc';
    proofreadWindow.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    proofreadWindow.style.zIndex = '10000';
    proofreadWindow.style.maxHeight = '300px';
    proofreadWindow.style.fontFamily = 'Arial, sans-serif';
    proofreadWindow.style.fontSize = '14px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '5px';
    header.style.borderBottom = '1px solid lightgray';

    const title = document.createElement('h3');
    title.style.fontWeight = 'bold';
    title.style.fontSize = '16px';
    title.textContent = '校正結果:';
    header.appendChild(title);

    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.style.fontWeight = 'bold';

    closeButton.addEventListener('click', () => {
        proofreadWindow.remove();
    });

    header.appendChild(closeButton);

    const result = document.createElement('p');
    result.style.paddingTop = '10px';
    result.style.maxHeight = '250px';
    result.style.overflowY = 'auto';

    proofreadWindow.appendChild(header);
    proofreadWindow.appendChild(result);

    document.body.appendChild(proofreadWindow);

    return proofreadWindow;
}

// 差分を計算して、変更箇所のみをハイライトして表示する関数
function displayCorrectedTextWithHighlights(model, originalText, correctedText) {
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
    let proofreadWindow = getProofreadWindow();
    proofreadWindow.querySelector('p').innerHTML = resultHTML;
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
