// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let currentEditor;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "prefix-log" is now active!');

    currentEditor = vscode.window.activeTextEditor;

    vscode.window.onDidChangeActiveTextEditor(editor => (currentEditor = editor));

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('console.with.prefix', (editor, edit) => {
            new Promise((resolve, reject) => {
                let sel = currentEditor.selection;
                // const str = currentEditor._documentData._lines[0];
                let len = sel.end.character - sel.start.character;
                const reg = /[a-zA-Z0-9]+\.(log)/;
                let ran =
                    len == 0
                        ? currentEditor.document.getWordRangeAtPosition(sel.anchor, reg)
                        : new vscode.Range(sel.start, sel.end);
                if (ran == undefined) {
                    reject('NO_WORD');
                } else {
                    let doc = currentEditor.document;
                    let lineNumber = ran.start.line;
                    let item = doc.getText(ran);
                    let prefix = item.replace('.log', '');
                    let idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
                    let ind = doc.lineAt(lineNumber).text.substring(0, idx);
                    let wrapData = {
                        txt: `console.log('${prefix}===>>>>>',${prefix});`,
                        item: item,
                        doc: doc,
                        ran: ran,
                        idx: idx,
                        ind: ind,
                        line: lineNumber,
                        sel: sel,
                        lastLine: doc.lineCount - 1 == lineNumber
                    };
                    if (reg.test(item)) {
                        resolve(wrapData);
                    } else {
                        reject('please use this statements：xxx.log');
                    }
                }
            })
                .then(wrap => {
                    currentEditor
                        .edit(e => {
                            e.replace(wrap.ran, wrap.txt);
                        })
                        .then(() => {
                            currentEditor.selection = new vscode.Selection(
                                new vscode.Position(
                                    wrap.ran.start.line,
                                    wrap.txt.length + wrap.ran.start.character
                                ),
                                new vscode.Position(
                                    wrap.ran.start.line,
                                    wrap.txt.length + wrap.ran.start.character
                                )
                            );
                        });
                })
                .catch(message => {
                    console.log('vscode-prefix-console REJECTED_PROMISE : ' + message);
                });
        })
    );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
