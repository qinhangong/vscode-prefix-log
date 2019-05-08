const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "vscode-prefix-log" is now active!');

    let currentEditor = vscode.window.activeTextEditor;

    vscode.window.onDidChangeActiveTextEditor(editor => (currentEditor = editor));

    const disposable = vscode.commands.registerTextEditorCommand('console.with.prefix', () => {
        new Promise((resolve, reject) => {
            let sel = currentEditor.selection;
            const reg = /[\S]+\.(log)$/;
            let ran = currentEditor.document.getWordRangeAtPosition(sel.anchor, reg);
            if (ran == undefined) {
                reject('please use this statements：xxx.log');
            } else {
                let doc = currentEditor.document;
                let line = ran.start.line;
                let item = doc.getText(ran);
                let prefix = item.replace('.log', '');
                let idx = doc.lineAt(line).firstNonWhitespaceCharacterIndex;
                let wrapData = {
                    idx,
                    ran,
                    line,
                    txt: `console.log('${prefix}========',${prefix});`
                };
                resolve(wrapData);
            }
        })
            .then(wrap => {
                currentEditor
                    .edit(e => {
                        e.replace(wrap.ran, wrap.txt);
                    })
                    .then(() => {
                        currentEditor.selection = new vscode.Selection(
                            new vscode.Position(wrap.line, wrap.txt.length + wrap.idx),
                            new vscode.Position(wrap.line, wrap.txt.length + wrap.idx)
                        );
                    });
            })
            .catch(message => {
                console.log('REJECTED_PROMISE:' + message);
            });
    });
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
