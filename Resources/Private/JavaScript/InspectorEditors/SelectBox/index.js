import React, {PropTypes} from 'react';
import {SelectBox} from 'Components';

const SelectBoxEditor = props => {
    const options = Object.keys(props.options.values).map(k => Object.assign({value: k}, props.options.values[k]));

    return (<SelectBox options={options} value={props.value}/>);
};
SelectBoxEditor.propTypes = {
    value: PropTypes.any.isRequired,
    options: PropTypes.any.isRequired
};

export default SelectBoxEditor;
