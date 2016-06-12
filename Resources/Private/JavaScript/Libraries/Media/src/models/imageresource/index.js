import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

import Resource from 'Libraries/Media/src/models/resource/index';
import Dimensions from 'Libraries/Media/src/models/dimensions/index';

@component({
    resource: PropTypes.shape(Resource.shape).isRequired,
    dimensions: PropTypes.shape(Dimensions.shape).isRequired
})
export default class ImageResource {
    get uri () {
        return this.props.resource.uri;
    }

    get mediaType () {
        return this.props.resource.mediaType;
    }

    get fileExtension () {
        return this.props.resource.fileExtension;
    }

    get dimensions () {
        return this.props.dimensions;
    }
}

ImageResource.shape = Object.assign({
    dimensions: PropTypes.shape(Dimensions.shape).isRequired
}, Resource.shape);

ImageResource.fromJSON = ({resource, dimensions}) => {
    return new ImageResource({
        resource: Resource.fromJSON(resource),
        dimensions: Dimensions.fromJSON(dimensions)
    });
};
