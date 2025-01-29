const htmlBoilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`




let codeMirrorEnabled = true; // Toggle state
let codeMirrorInstances = {}; // To store all CodeMirror instances

document.getElementById('toggleCodeMirror').addEventListener('click', () => {
    const button = document.getElementById('toggleCodeMirror');
    const textareas = document.querySelectorAll('textarea[data-editor]');

    if (codeMirrorEnabled) {
        // Turn off CodeMirror
        button.textContent = 'CodeMirror: OFF';
        codeMirrorEnabled = false;

        textareas.forEach((textarea) => {
            const editor = codeMirrorInstances[textarea.id];
            if (editor) {
                textarea.value = editor.getValue(); // Sync CodeMirror content to textarea
                editor.toTextArea(); // Destroy CodeMirror
                delete codeMirrorInstances[textarea.id]; // Remove instance
            }
        });
    } else {
        // Turn on CodeMirror
        button.textContent = 'CodeMirror: ON';
        codeMirrorEnabled = true;

        textareas.forEach((textarea) => {
            const mode = textarea.dataset.editor; // Get mode from data attribute
            codeMirrorInstances[textarea.id] = CodeMirror.fromTextArea(textarea, {
                mode: mode,
                theme: 'base16-light',
                lineNumbers: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
                tabSize: 4,
                indentUnit: 4,
                lineWrapping: false,
            });
        });
    }
});
