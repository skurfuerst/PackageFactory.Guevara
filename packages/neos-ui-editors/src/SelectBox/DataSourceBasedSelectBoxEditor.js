import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {$transform} from 'plow-js';
import {connect} from 'react-redux';
import I18n from '@neos-project/neos-ui-i18n';
import SelectBox from '@neos-project/react-ui-components/src/SelectBox/';
import {selectors} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n'),
    dataSourcesDataLoader: globalRegistry.get('dataLoaders').get('DataSources')
}))
@connect($transform({
    focusedNodePath: selectors.CR.Nodes.focusedNodePathSelector
}))
export default class DataSourceBasedSelectBoxEditor extends PureComponent {
    static propTypes = {
        commit: PropTypes.func.isRequired,
        value: PropTypes.any,
        options: PropTypes.shape({
            // TODO
            allowEmpty: PropTypes.bool,
            placeholder: PropTypes.string,

            // TODO
            multiple: PropTypes.bool,

            // TODO
            dataSourceIdentifier: PropTypes.string,
            dataSourceUri: PropTypes.string,
            dataSourceAdditionalData: PropTypes.objectOf(PropTypes.any),

            // TODO
            minimumResultsForSearch: PropTypes.number,

            values: PropTypes.objectOf(
                PropTypes.shape({
                    label: PropTypes.string,
                    icon: PropTypes.string, // TODO test

                    // TODO
                    group: PropTypes.string
                })
            )

        }).isRequired,

        i18nRegistry: PropTypes.object.isRequired,
        dataSourcesDataLoader: PropTypes.shape({

        }).isRequired,

        focusedNodePath: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            //searchTerm: '',
            isLoading: false,
            //searchResults: [],
            results: []
        };
    }

    getDataLoaderOptions() {
        return {
            contextNodePath: this.props.focusedNodePath
        };
    }

    componentDidMount() {
        if (this.props.value) {
            this.setState({isLoading: true});
            this.props.dataSourcesDataLoader.resolveValue(this.getDataLoaderOptions(), this.props.value)
                .then(options => {
                    this.setState({
                        isLoading: false,
                        options
                    });
                });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.componentDidMount();
        }
    }

    render() {
        const {commit, value, options, i18nRegistry} = this.props;

        // Placeholder text must be unescaped in case html entities were used
        const placeholder = options && options.placeholder && i18nRegistry.translate(unescape(options.placeholder));

        return (<SelectBox
            options={this.state.options}
            value={value}
            onValueChange={commit}
            displayLoadingIndicator={this.state.isLoading}
            placeholder={placeholder}
            />);
    }
}
