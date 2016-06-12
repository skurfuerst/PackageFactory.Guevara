import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

import ImageResource from 'Libraries/Media/src/models/imageresource/index';

@component({
    original: PropTypes.shape(ImageResource.shape).isRequired,
    preview: PropTypes.shape(ImageResource.shape).isRequired
})
export default class Image {
    get original () {
        return this.props.original;
    }

    get preview () {
        return this.props.preview;
    }

    get previewScalingFactor() {
        return this.preview.dimensions.width / this.original.dimensions.width;
    }
}

Image.shape = {
    original: PropTypes.shape(ImageResource.shape).isRequired,
    preview: PropTypes.shape(ImageResource.shape).isRequired,
    previewScalingFactor: PropTypes.number.isRequired
};

Image.fromJSON = ({original, preview}) => {
    return new Image({
        original: ImageResource.fromJSON(original),
        preview: ImageResource.fromJSON(preview)
    });
};
