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
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('livePreview.showPreview', () => {
        const panel = vscode.window.createWebviewPanel('livePreview', 'Live Preview', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        if (vscode.window.activeTextEditor) {
            updatePreview(panel, vscode.window.activeTextEditor.document);
        }
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updatePreview(panel, editor.document);
            }
        });
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                updatePreview(panel, event.document);
            }
        });
    }));
}
exports.activate = activate;
function updatePreview(panel, document) {
    const filePath = document.uri.fsPath;
    if (!filePath.endsWith('.html')) {
        return;
    }
    const htmlContent = document.getText();
    const cssContent = compileSCSS(filePath.replace('.html', '.scss'));
    const bootstrapCSS = getBootstrapCSS();
    const tailwindCSS = getTailwindCSS();
    panel.webview.html = getWebviewContent(htmlContent, cssContent, bootstrapCSS, tailwindCSS);
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
function getBootstrapCSS() {
    // Cargar Bootstrap desde un CDN
    return `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEJ+M6QJ6JbR6F3b0p3p7p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6" crossorigin="anonymous">
  `;
}
function getTailwindCSS() {
    // Cargar Tailwind CSS desde un CDN
    return `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  `;
}
function getWebviewContent(html, css, bootstrapCSS, tailwindCSS) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${bootstrapCSS}
      ${tailwindCSS}
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        ${css}
      </style>
    </head>
    <body>
      <div class="preview-container">
        ${html}
      </div>
    </body>
    </html>`;
}
function deactivate() { }
exports.deactivate = deactivate;
