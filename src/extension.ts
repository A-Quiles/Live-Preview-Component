import * as vscode from 'vscode';
import * as fs from 'fs';
import * as sass from 'sass';

export function activate(context: vscode.ExtensionContext) {
  // Registrar el comando 'livePreview.showPreview' en el que se inicializa el webview
  context.subscriptions.push(
    vscode.commands.registerCommand('livePreview.showPreview', () => {
      // Crear un panel de webview para mostrar la vista previa en la segunda columna de VSCode
      const panel = vscode.window.createWebviewPanel(
        'livePreview',
        'Live Preview',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // Si existe un editor activo, se actualiza inmediatamente la vista previa con el contenido del documento
      if (vscode.window.activeTextEditor) {
        updatePreview(panel, vscode.window.activeTextEditor.document);
      }

      // Listener para detectar cuando se cambia el editor activo y actualizar la vista previa con el nuevo documento
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          updatePreview(panel, editor.document);
        }
      });

      // Listener para detectar cambios en el contenido del documento y actualizar la vista previa en tiempo real
      vscode.workspace.onDidChangeTextDocument(event => {
        // Solo actualizar si el documento modificado es el que está activo actualmente en el editor
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
          updatePreview(panel, event.document);
        }
      });
    })
  );
}

/**
 * Actualiza el contenido del panel webview.
 * Solo se procesa si el documento es un archivo HTML.
 */
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

/**
 * Compila un archivo SCSS y devuelve el CSS resultante.
 * Si el archivo SCSS no existe o ocurre un error en la compilación, se retorna una cadena vacía.
 */
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
  return `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEJ+M6QJ6JbR6F3b0p3p7p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6" crossorigin="anonymous">
  `;
}


function getTailwindCSS(): string {
  return `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  `;
}

/**
 * Genera el contenido HTML completo que se mostrará en el webview.
 * Combina el contenido HTML del documento, el CSS compilado, y los enlaces a las librerías externas.
 */
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
        /* Estilos base para centrar el contenido y eliminar márgenes y rellenos */
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        /* Estilos personalizados compilados desde el archivo SCSS */
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
