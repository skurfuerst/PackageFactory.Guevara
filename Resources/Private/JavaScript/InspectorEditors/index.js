import api from '@host';

import TextField from './TextField/index';
import Boolean from './Boolean/index';
import DateTime from './DateTime/index';
import ImageEditor from './Image/index';
import TextArea from './TextArea/index';
import SelectBox from './SelectBox/index';
import NodeType from './NodeType/index';

const {createInspectorEditor} = api;

/**
 * Every editor gets passed in:
 * - value: the value to display
 * - onChange: the callback if something changed.
 */


//
// TextField
//
createInspectorEditor(
    'Neos.UI:Inspector.TextField',
    'TYPO3.Neos/Inspector/Editors/TextFieldEditor',
    TextField
);

//
// Boolean
//
createInspectorEditor(
    'Neos.UI:Inspector.Boolean',
    'TYPO3.Neos/Inspector/Editors/BooleanEditor',
    Boolean
);

//
// DateTime
//
createInspectorEditor(
    'Neos.UI:Inspector.DateTime',
    'TYPO3.Neos/Inspector/Editors/DateTimeEditor',
    DateTime
);

//
// Image
//
createInspectorEditor(
    'Neos.UI:Inspector.Image',
    'TYPO3.Neos/Inspector/Editors/ImageEditor',
    ImageEditor
);

//
// TextArea
//
createInspectorEditor(
    'Neos.UI:Inspector.TextArea',
    'TYPO3.Neos/Inspector/Editors/TextAreaEditor',
    TextArea
);

//
// SelectBox
//
createInspectorEditor(
    'Neos.UI:Inspector.SelectBox',
    'TYPO3.Neos/Inspector/Editors/SelectBoxEditor',
    SelectBox
);

//
// NodeType
//
createInspectorEditor(
    'Neos.UI:Inspector.NodeType',
    'TYPO3.Neos/Inspector/Editors/NodeTypeEditor',
    NodeType
);

createInspectorEditor(
    'Neos.UI:Inspector.NodeType',
    'Content/Inspector/Editors/NodeTypeEditor',
    NodeType
);
