//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { shortcuts: [] };

    /** @type {Array<{ value: string }>} */
    let shortcuts = oldState.shortcuts;

    updateShortcutList(shortcuts);

    document.querySelector('.add-shortcut-button').addEventListener('click', () => {
        addShortcut(document.getElementById('custom-value').value);
    });
    

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addShortcut':
                {
                    addShortcut();
                    break;
                }
            case 'clearShortcuts':
                {
                    shortcuts = [];
                    updateShortcutList(shortcuts);
                    break;
                }

        }
    });

    /**
     * @param {Array<{ value: string }>} shortcuts
     */
    function updateShortcutList(shortcuts) {
        const ul = document.querySelector('.shortcut-list');
        ul.textContent = '';
        for (const shortcut of shortcuts) {
            const li = document.createElement('li');
            li.className = 'shortcut-entry';


            const insertBtn = document.createElement('button');
            insertBtn.style.width = `50px`;
            insertBtn.innerHTML = "Insert";  
            insertBtn.addEventListener('click', (e) => {
                onShortcutClicked(shortcut.value);            
            });

            li.appendChild(insertBtn);


            const input = document.createElement('input');
            input.className = 'shortcut-input';
            input.type = 'text';
            input.value = shortcut.value;
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    shortcuts.splice(shortcuts.indexOf(shortcut), 1);
                } else {
                    shortcut.value = value;
                }
                updateShortcutList(shortcuts);
            });
            li.appendChild(input);
            
            const removeBtn = document.createElement('button');
            removeBtn.style.width = `25px`;
            removeBtn.style.backgroundColor = `gray`;

            removeBtn.innerHTML = "X";  

            removeBtn.addEventListener('click', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    shortcuts.splice(shortcuts.indexOf(shortcut), 1);
                } else {
                    shortcut.value = value;
                }
                updateShortcutList(shortcuts);
            });
            li.appendChild(removeBtn);


            ul.appendChild(li);
        }

        // Update the saved state
        vscode.setState({ shortcuts: shortcuts });
    }

    /** 
     * @param {string} shortcut 
     */
    function onShortcutClicked(shortcut) {
        vscode.postMessage({ type: 'shortcutSelected', value: shortcut });
    }

    function addShortcut(value) {
        if(value){
            shortcuts.push({ value: value});
            updateShortcutList(shortcuts);
        }
    }
}());


