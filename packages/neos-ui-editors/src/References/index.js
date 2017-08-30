import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get, $transform} from 'plow-js';
import MultiSelectBox from '@neos-project/react-ui-components/src/MultiSelectBox/';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n'),
    nodeLookupDataLoader: globalRegistry.get('dataLoaders').get('NodeLookup')
}))
@connect($transform({
    contextForNodeLinking: selectors.UI.NodeLinking.contextForNodeLinking
}))
export default class ReferencesEditor extends PureComponent {
    static propTypes = {
        value: PropTypes.arrayOf(PropTypes.string),
        commit: PropTypes.func.isRequired,
        options: PropTypes.shape({
            nodeTypes: PropTypes.arrayOf(PropTypes.string),
            placeholder: PropTypes.string,
            threshold: PropTypes.number
        }),

        i18nRegistry: PropTypes.object.isRequired,
        nodeLookupDataLoader: PropTypes.shape({
            resolveValues: PropTypes.func.isRequired,
            search: PropTypes.func.isRequired
        }).isRequired,

        contextForNodeLinking: PropTypes.shape({
            toJS: PropTypes.func.isRequired
        }).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            searchTerm: '',
            isLoading: false,
            searchResults: [],
            results: []
        };
    }

    getDataLoaderOptions() {
        return {
            nodeTypes: $get('options.nodeTypes', this.props) || ['Neos.Neos:Document'],
            contextForNodeLinking: this.props.contextForNodeLinking.toJS()
        };
    }

    componentDidMount() {
        if (this.props.value && this.props.value.length) {
            this.setState({isLoading: true});
            this.props.nodeLookupDataLoader.resolveValues(this.getDataLoaderOptions(), this.props.value)
                .then(options => {
                    this.setState({
                        isLoading: false,
                        options
                    });
                });
        }
        this.setState({
            searchTerm: '',
            searchOptions: []
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.componentDidMount();
        }
    }

    handleSearchTermChange = searchTerm => {
        this.setState({searchTerm});
        if (searchTerm) {
            this.setState({isLoading: true, searchOptions: []});
            this.props.nodeLookupDataLoader.search(this.getDataLoaderOptions(), searchTerm)
                .then(searchOptions => {
                    this.setState({
                        isLoading: false,
                        searchOptions
                    });
                });
        }
    }

    handleValuesChange = value => {
        this.props.commit(value);
    }

    render() {
        return (<MultiSelectBox
            options={this.state.options}
            optionValueField="identifier"
            values={this.props.value}
            onValuesChange={this.handleValuesChange}
            placeholder={this.props.i18nRegistry.translate(this.props.options.placeholder)}
            displayLoadingIndicator={this.state.isLoading}
            displaySearchBox={true}
            searchTerm={this.state.searchTerm}
            searchOptions={this.state.searchOptions}
            onSearchTermChange={this.handleSearchTermChange}
            />);
    }
}
