"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const sass = __importStar(require("sass"));
const ts = __importStar(require("typescript"));
let panel = null;
function activate(context) {
    // Registramos un WebviewViewProvider para la vista con id "livePreviewComponent.view"
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('livePreviewComponent.view', {
        resolveWebviewView(webviewView) {
            panel = webviewView;
            panel.webview.options = { enableScripts: true };
            // Si ya hay un editor activo, actualizamos la vista
            if (vscode.window.activeTextEditor) {
                updatePreview(vscode.window.activeTextEditor.document);
            }
        }
    }));
    // Cuando se cambie de editor, actualizamos la vista
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && panel) {
            updatePreview(editor.document);
        }
    });
    // Cuando se modifique un documento, actualizamos la vista
    vscode.workspace.onDidChangeTextDocument(event => {
        if (panel) {
            updatePreview(event.document);
        }
    });
}
exports.activate = activate;
function updatePreview(document) {
    if (!panel) {
        return;
    }
    const filePath = document.uri.fsPath;
    if (!filePath.endsWith('.html')) {
        return;
    }
    const htmlContent = document.getText();
    const cssContent = compileSCSS(filePath.replace('.html', '.scss'));
    const tsComponent = parseComponentTS(filePath);
    panel.webview.html = getWebviewContent(htmlContent, cssContent, tsComponent);
}
function compileSCSS(scssFilePath) {
    if (!fs.existsSync(scssFilePath)) {
        return '';
    }
    try {
        return sass.compileString(fs.readFileSync(scssFilePath, 'utf8')).css;
    }
    catch (err) {
        console.error('Error compilando SCSS:', err);
        return '';
    }
}
function parseComponentTS(htmlFilePath) {
    const tsFilePath = htmlFilePath.replace('.html', '.ts');
    if (!fs.existsSync(tsFilePath)) {
        return '';
    }
    const tsContent = fs.readFileSync(tsFilePath, 'utf8');
    const sourceFile = ts.createSourceFile(tsFilePath, tsContent, ts.ScriptTarget.Latest, true);
    let selector = '';
    ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node)) {
            const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
            if (decorators) {
                decorators.forEach(decorator => {
                    if (ts.isCallExpression(decorator.expression) &&
                        decorator.expression.expression.getText() === 'Component') {
                        const componentObj = decorator.expression.arguments[0];
                        componentObj.properties.forEach(prop => {
                            if (ts.isPropertyAssignment(prop) && prop.name.getText() === 'selector') {
                                selector = prop.initializer.getText().replace(/['\"]/g, '');
                            }
                        });
                    }
                });
            }
        }
    });
    return selector ? `<${selector}></${selector}>` : '';
}
function getWebviewContent(html, css, tsComponent) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>${css}</style>
    </head>
    <body>
      ${html}
      ${tsComponent}
    </body>
    </html>`;
}
function deactivate() {
    panel = null;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map