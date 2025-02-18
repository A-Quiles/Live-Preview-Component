# Live Component Preview Angular

## Description

The **Live Component Preview Angular** extension for Visual Studio Code allows real-time preview of Angular components directly in the editor. When opening an HTML file that references a SCSS file, the extension compiles the SCSS and displays a preview of the HTML with the applied styles.

## Features

- **Live Component:** Provides a real-time preview of the Angular component, reflecting changes made in the code.
- **SCSS Support:** Compiles SCSS files associated with the HTML and applies the corresponding styles in the preview.
- **Integration with Bootstrap and Tailwind CSS:** Includes links to the latest versions of Bootstrap and Tailwind CSS from CDNs, allowing their classes to be used in the HTML.
- **Automatic Updates:** The preview automatically updates when changing the active editor or modifying the current document.

## Usage

1. Open an HTML file in Visual Studio Code.
2. Ensure that the HTML file references a SCSS file.
3. Run the command `Live Preview: Show Preview` from the command palette (`Ctrl+Shift+P`).
4. A preview panel will open in the second column of the editor, displaying the component with the applied styles.

## Contributing

Contributions are welcome. If you want to improve this extension, please follow these steps:

1. Fork this repository.
2. Create a branch for your feature (`git checkout -b feature/new-feature`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Create a new Pull Request.

## License

This project is open-source.
