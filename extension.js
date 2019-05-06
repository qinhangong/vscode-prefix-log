// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "vscode-prefix-log" is now active!');

    let currentEditor = vscode.window.activeTextEditor;

    vscode.window.onDidChangeActiveTextEditor(editor => (currentEditor = editor));

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('console.with.prefix', () => {
            new Promise((resolve, reject) => {
                // 获取当前选中区域
                let sel = currentEditor.selection;
                const reg = /[\S]+\.(log)$/;
                // 通过getWordRangeAtPosition方法得到单词范围对象
                let ran = currentEditor.document.getWordRangeAtPosition(sel.anchor, reg);
                if (ran == undefined) {
                    reject('please use this statements：xxx.log');
                } else {
                    let doc = currentEditor.document; // 获取当前文档对象
                    let line = ran.start.line; // 获取行数
                    let item = doc.getText(ran); // 通过getText方法获取文本
                    let prefix = item.replace('.log', '');
                    let idx = doc.lineAt(line).firstNonWhitespaceCharacterIndex; // 获取当前行的第一个非空字符的偏移量
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
                            // 将旧文本替换成新文本
                            e.replace(wrap.ran, wrap.txt);
                        })
                        .then(() => {
                            // 把光标定位到末尾
                            currentEditor.selection = new vscode.Selection(
                                new vscode.Position(wrap.line, wrap.txt.length + wrap.idx),
                                new vscode.Position(wrap.line, wrap.txt.length + wrap.idx)
                            );
                        });
                })
                .catch(message => {
                    console.log('REJECTED_PROMISE:' + message);
                });
        })
    );
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
