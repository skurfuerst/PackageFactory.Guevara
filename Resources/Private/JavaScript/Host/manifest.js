import IconButton from '@neos-project/react-ui-components/lib/IconButton/';
import StyleSelect from 'Host/Containers/SecondaryToolbar/EditorToolbar/StyleSelect';
import uuid from 'uuid';
import {actions} from 'Host/Redux';

const {manifest} = window['@Neos:HostPluginAPI'];

manifest('main', registry => {
    registry.ckEditor.formattingAndStyling.add('p', {style: {element: 'p'}});

    registry.ckEditor.formattingAndStyling.add('h1', {style: {element: 'h1'}, allowedContent: {h1: true}});
    registry.ckEditor.formattingAndStyling.add('h2', {style: {element: 'h2'}, allowedContent: {h2: true}});
    registry.ckEditor.formattingAndStyling.add('h3', {style: {element: 'h3'}, allowedContent: {h3: true}});
    registry.ckEditor.formattingAndStyling.add('h4', {style: {element: 'h4'}, allowedContent: {h4: true}});
    registry.ckEditor.formattingAndStyling.add('h5', {style: {element: 'h5'}, allowedContent: {h5: true}});
    registry.ckEditor.formattingAndStyling.add('h6', {style: {element: 'h6'}, allowedContent: {h6: true}});
    registry.ckEditor.formattingAndStyling.add('pre', {style: {element: 'pre'}, allowedContent: {pre: true}});
    registry.ckEditor.formattingAndStyling.add('removeFormat', {command: 'removeFormat'});

    registry.ckEditor.formattingAndStyling.add('strong', {command: 'bold', allowedContent: {strong: true}});
    registry.ckEditor.toolbar.add('strong', {
        formatting: 'strong',
        component: IconButton,
        callbackPropName: 'onClick',

        icon: 'bold',
        hoverStyle: 'brand'
    });

    registry.ckEditor.formattingAndStyling.add('italic', {command: 'italic'});
    registry.ckEditor.toolbar.add('italic', {
        formatting: 'italic',
        component: IconButton,
        callbackPropName: 'onClick',

        icon: 'italic',
        hoverStyle: 'brand'
    });

    registry.ckEditor.toolbar.add('style', {
        component: StyleSelect,
        callbackPropName: 'onSelect'
    });

    registry.ckEditor.toolbar.add('style/p', {
        formatting: 'p',
        label: 'Paragraph'
    });
    registry.ckEditor.toolbar.add('style/h1', {
        formatting: 'h1',
        label: 'Headline 1'
    });
    registry.ckEditor.toolbar.add('style/h2', {
        formatting: 'h2',
        label: 'Headline 2'
    });
    registry.ckEditor.toolbar.add('style/h3', {
        formatting: 'h3',
        label: 'Headline 3'
    });
    registry.ckEditor.toolbar.add('style/h4', {
        formatting: 'h4',
        label: 'Headline 4'
    });
    registry.ckEditor.toolbar.add('style/h5', {
        formatting: 'h5',
        label: 'Headline 5'
    });
    registry.ckEditor.toolbar.add('style/h6', {
        formatting: 'h6',
        label: 'Headline 6'
    });

    /**
     * Feedback Handlers
     */
    const flashMessageFeedbackHandler = (feedbackPayload, store) => {
        const {message, severity} = feedbackPayload;
        const timeout = severity.toLowerCase() === 'success' ? 5000 : 0;
        const id = uuid.v4();

        store.dispatch(actions.UI.FlashMessages.add(id, message, severity, timeout));
    };
    registry.serverFeedbackHandlers.add('Neos.Neos.Ui:Success', flashMessageFeedbackHandler);
    registry.serverFeedbackHandlers.add('Neos.Neos.Ui:Error', flashMessageFeedbackHandler);
    registry.serverFeedbackHandlers.add('Neos.Neos.Ui:Info', feedbackPayload => {
        switch (feedbackPayload.severity) {
            case 'ERROR':
                console.error(feedbackPayload.message);
                break;

            default:
                console.info(feedbackPayload.message);
                break;
        }
    });
    registry.serverFeedbackHandlers.add('Neos.Neos.Ui:UpdateWorkspaceInfo', (feedbackPayload, store) => {
        const {workspaceName, workspaceInfo} = feedbackPayload;
        store.dispatch(actions.CR.Workspaces.update(workspaceName, workspaceInfo));
    });
    registry.serverFeedbackHandlers.add('Neos.Neos.Ui:ReloadDocument', () => {
        [].slice.call(document.querySelectorAll(`iframe[name=neos-content-main]`)).forEach(iframe => {
            const iframeWindow = iframe.contentWindow || iframe;

            iframeWindow.location.href = iframeWindow.location.href;
        });
    });
});
