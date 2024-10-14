// 処理が実行されたかどうかを判定する変数
function hasRunProofread() {
    if (window.hasRun === true)
        return true;  // Will ultimately be passed back to executeScript
    window.hasRun = true;
}

// 選択されたテキストを改行ありで取得する関数
function getSelectedText() {
    return document.getSelection().toString();
}

// ローディングオーバーレイを表示する関数
function showLoadingOverlay() {
    let overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.textContent = '校正中...';

    // スピナーを追加
    let spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';

    spinner.animate({
        transform: 'rotate(360deg)'
    }, {duration: 1000, easing: "ease-in-out", iterations: Infinity});

    overlay.appendChild(spinner);

    document.body.appendChild(overlay);
}

// ローディングオーバーレイを非表示にする関数
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
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

    const header = document.createElement('div');
    header.id = 'proofread-header';

    const title = document.createElement('h3');
    title.id = 'proofread-title';
    title.textContent = '校正結果:';
    header.appendChild(title);

    const closeButton = document.createElement('span');
    closeButton.id = 'proofread-close';
    closeButton.textContent = '×';

    closeButton.addEventListener('click', () => {
        proofreadWindow.remove();
    });

    header.appendChild(closeButton);

    const result = document.createElement('p');
    result.id = 'proofread-result';

    proofreadWindow.appendChild(header);
    proofreadWindow.appendChild(result);

    document.body.appendChild(proofreadWindow);

    return proofreadWindow;
}

// 差分を計算して、変更箇所のみをハイライトして表示する関数
function displayCorrectedTextWithHighlights(model, originalText, correctedText) {
    originalText = originalText.replace(/\n/g, '<br>');
    correctedText = correctedText.replace(/\n/g, '<br>');

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
    let proofreadWindow = getProofreadWindow();
    proofreadWindow.querySelector('p').textContent = message;
}
