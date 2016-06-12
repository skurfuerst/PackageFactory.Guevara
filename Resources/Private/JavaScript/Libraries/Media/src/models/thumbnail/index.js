import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

import ImageVariant from 'Libraries/Media/src/models/imagevariant/index';
import Dimensions from 'Libraries/Media/src/models/dimensions/index';
import Point from 'Libraries/Media/src/models/point/index';

@component({
    imageVariant: PropTypes.shape(ImageVariant.shape).isRequired,
    dimensions: PropTypes.shape(Dimensions.shape)
})
export default class Thumbnail {
    get uri () {
        return this.props.imageVariant.preview.uri;
    }

    get scalingFactor () {
        const {width, height} = this.props.imageVariant.processed.preview.dimensions;
        const byWidth = this.props.dimensions.width / width;
        const byHeight = this.props.dimensions.height / height;

        return Math.min(byWidth, byHeight);
    }

    get outerDimensions () {
        return this.props.dimensions.next({
            width: this.props.imageVariant.preview.dimensions.width * this.scalingFactor,
            height: this.props.imageVariant.preview.dimensions.height * this.scalingFactor
        });
    }

    get innerDimensions () {
        return this.props.dimensions.next({
            width: this.props.imageVariant.processed.preview.dimensions.width * this.scalingFactor,
            height: this.props.imageVariant.processed.preview.dimensions.height * this.scalingFactor
        });
    }

    get offset () {
        return this.props.imageVariant.maybeCropAdjustment
            .map(({position}) => position.next({
                x: -position.x,
                y: -position.y
            }))
            .orSome(Point.fromJSON({x: 0, y: 0}));
    }
}

Thumbnail.shape = {
    uri: PropTypes.string.isRequired,
    scalingFactor: PropTypes.number.isRequired,
    outerDimensions: PropTypes.shape(Dimensions.shape).isRequired,
    innerDimensions: PropTypes.shape(Dimensions.shape).isRequired,
    offset: PropTypes.shape(Point.shape).isRequired
};

Thumbnail.fromParams = (imageVariant, width, height) => new Thumbnail({
    imageVariant,
    dimensions: Dimensions.fromJSON({width, height})
});
