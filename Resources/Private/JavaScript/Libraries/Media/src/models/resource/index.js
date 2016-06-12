import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

@component({
    uri: PropTypes.string.isRequired,
    mediaType: PropTypes.string.isRequired
})
export default class Resource {
    get uri () {
        return this.props.uri;
    }

    get mediaType () {
        return this.props.mediaType;
    }

    get fileExtension () {
        return this.uri.split('.').pop();
    }
}

Resource.shape = {
    uri: PropTypes.string.isRequired,
    mediaType: PropTypes.string.isRequired,
    fileExtension: PropTypes.string.isRequired
};

Resource.fromJSON = ({uri, mediaType}) => new Resource({uri, mediaType});
