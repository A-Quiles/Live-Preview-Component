import * as vscode from 'vscode';
import * as fs from 'fs';
import * as sass from 'sass';


export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('livePreview.showPreview', () => {
      const panel = vscode.window.createWebviewPanel(
        'livePreview',
        'Live Preview',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

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
    })
  );
}

function updatePreview(panel: vscode.WebviewPanel, document: vscode.TextDocument) {
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

function compileSCSS(scssFilePath: string): string {
  if (!fs.existsSync(scssFilePath)) {
    return '';
  }
  try {
    return sass.compileString(fs.readFileSync(scssFilePath, 'utf8')).css;
  } catch (err) {
    console.error('Error compilando SCSS:', err);
    return '';
  }
}

function getBootstrapCSS(): string {
  // Cargar Bootstrap desde un CDN
  return `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEJ+M6QJ6JbR6F3b0p3p7p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6" crossorigin="anonymous">
  `;
}

function getTailwindCSS(): string {
  // Cargar Tailwind CSS desde un CDN
  return `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  `;
}

function getWebviewContent(html: string, css: string, bootstrapCSS: string, tailwindCSS: string): string {
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

export function deactivate() {}
