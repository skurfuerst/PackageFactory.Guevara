const noop = {
    initialize() {},
    toggleFormat() {},
    createEditor() {}
};

const createCKEditorAPI = CKEDITOR => {
    if (!CKEDITOR) {
        console.error('CKEditor not found!');

        //
        // Return noop to not break things
        //
        return noop;
    }

    // an object with the following keys:
    // - formattingAndStyling
    // - setFormattingUnderCursor
    // - setCurrentlyEditedPropertyName
    let editorConfig = null;
    let currentEditor = null;

    const handleUserInteractionCallbackFactory = editor => event => {
        if (!event || event.name !== 'keyup' || event.data.$.keyCode !== 27) {
            // TODO: why was the previous code all inside here? weirdo...
        }

        const formattingUnderCursor = {};
        Object.keys(editorConfig.formattingAndStyling).forEach(key => {
            const description = editorConfig.formattingAndStyling[key];

            if (description.command !== undefined) {
                if (!editor.getCommand(description.command)) {
                    formattingUnderCursor[key] = false;
                    return;
                }

                formattingUnderCursor[key] = editor.getCommand(description.command).state === CKEDITOR.TRISTATE_ON;
                return;
            }

            if (description.style !== undefined) {
                if (!editor.elementPath()) {
                    formattingUnderCursor[key] = false;
                    return;
                }

                const style = new CKEDITOR.style(description.style); // eslint-disable-line babel/new-cap

                formattingUnderCursor[key] = style.checkActive(editor.elementPath(), editor);
                return;
            }

            throw new Error(`
                An error occured while checking a format in CK Editor.
                The description parameter needs to either have a key "command" or
                a key "style" - none of which could be found.
            `);
        });

        editorConfig.setFormattingUnderCursor(formattingUnderCursor);
    };

    //
    // Perform global initialization tasks
    //
    CKEDITOR.disableAutoInline = true;

    // Public (singleton) API for CK editor
    return {
        initialize(_editorConfig) {
            editorConfig = _editorConfig;
        },

        toggleFormat(formatting) {
            const description = editorConfig.formattingAndStyling[formatting];
            if (!description) {
                console.warn(`Formatting instruction ${formatting} not found.`);
                return;
            }
            if (!currentEditor) {
                console.warn('Current editor not found!');
                return;
            }
            if (description.command !== undefined) {
                if (!currentEditor.getCommand(description.command)) {
                    console.warn(`Command ${currentEditor} not found.`);
                    return;
                }

                currentEditor.execCommand(description.command);
                currentEditor.fire('change');
                handleUserInteractionCallbackFactory(currentEditor)();
                return;
            }

            if (description.style !== undefined) {
                if (!currentEditor.elementPath()) {
                    return;
                }

                const style = new CKEDITOR.style(description.style); // eslint-disable-line babel/new-cap
                const operation = style.checkActive(currentEditor.elementPath(), currentEditor) ?
                    'removeStyle' : 'applyStyle';

                currentEditor[operation](style);
                currentEditor.fire('change');
                handleUserInteractionCallbackFactory(currentEditor)();
                return;
            }

            throw new Error(`
                An error occured while applying a format in CK Editor.
                The description parameter needs to either have a key "command" or
                a key "style" - none of which could be found.
            `);
        },

        createEditor(dom, propertyName, allowedContent, onChange) {
            const finalOptions = Object.assign(
                {
                    removePlugins: 'toolbar,contextmenu,liststyle,tabletools',
                    allowedContent: allowedContent,
                    extraPlugins: 'removeformat'
                }
            );

            dom.contentEditable = 'true';

            const editor = CKEDITOR.inline(dom, finalOptions);
            const handleUserInteraction = handleUserInteractionCallbackFactory(editor);

            editor.once('contentDom', () => {
                const editable = editor.editable();

                editable.attachListener(editable, 'focus', event => {
                    currentEditor = editor;
                    editorConfig.setCurrentlyEditedPropertyName(propertyName);

                    editable.attachListener(editable, 'keyup', handleUserInteraction);
                    editable.attachListener(editable, 'mouseup', handleUserInteraction);
                    handleUserInteraction(event);
                });

                editor.on('change', () => {
                    onChange(editor.getData());
                });
            });
        }
    };
};

export default createCKEditorAPI(window.CKEDITOR);
