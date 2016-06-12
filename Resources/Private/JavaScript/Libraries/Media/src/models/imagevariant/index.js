import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';
import {Maybe} from 'monet';

import Image from 'Libraries/Media/src/models/image/index';
import CropAdjustment from 'Libraries/Media/src/models/adjustments/crop/index';
import ResizeAdjustment from 'Libraries/Media/src/models/adjustments/resize/index';

//
// Helper function to apply adjustments to dimensions
//
const maybeApplyAdjustment = maybeAdjustment => dimensions =>
    maybeAdjustment.map(adjustment => adjustment.adjust(dimensions));

@component({
    uuid: PropTypes.string.isRequired,
    image: PropTypes.shape(Image.shape).isRequired,
    cropAdjustment: PropTypes.shape(CropAdjustment.shape),
    resizeAdjustment: PropTypes.shape(ResizeAdjustment.shape)
})
export default class ImageVariant {
    get uuid () {
        return this.props.uuid;
    }

    get original () {
        return this.props.image.original;
    }

    get preview () {
        return this.props.image.preview;
    }

    get previewScalingFactor () {
        return this.props.image.previewScalingFactor;
    }

    get maybeCropAdjustment () {
        return Maybe.fromNull(this.props.cropAdjustment);
    }

    get maybeResizeAdjustment () {
        return Maybe.fromNull(this.props.resizeAdjustment);
    }

    get processed () {
        const processDimensions = dimensions => Maybe.Some(dimensions)
            .bind(maybeApplyAdjustment(this.maybeResizeAdjustment))
            .bind(maybeApplyAdjustment(this.maybeCropAdjustment))
            .orSome(dimensions);

        return this.props.image.next({
            original: this.props.image.original.next({
                dimensions: processDimensions(this.props.image.original.dimensions)
            }),
            preview: this.props.image.preview.next({
                dimensions: processDimensions(this.props.image.preview.dimensions)
            })
        })
    }

    get hasOriginalAspectRatio () {
        const originalAspectRatio = this.original.dimensions.aspectRatio;
        const processedAspectRatio = this.processed.original.dimensions.aspectRatio;

        return originalAspectRatio.toFixed(2) === processedAspectRatio.toFixed(2);
    }

    crop(cropConfiguration) {
        const {width, height} = this.original.dimensions;
        const processedCropConfiguration = {
            x: Math.round(cropConfiguration.x / 100 * width),
            y: Math.round(cropConfiguration.y / 100 * height),
            width: Math.round(cropConfiguration.width / 100 * width),
            height: Math.round(cropConfiguration.height / 100 * height)
        };

        return this.next({
            cropAdjustment: this.maybeCropAdjustment.map(c => c.next(cropConfiguration))
                .orSome(CropAdjustment.fromJSON(cropConfiguration))
        });
    }

    resize(resizeConfiguration) {
        return this.next({
            resizeAdjustment: this.maybeResizeAdjustment.map(r => r.next(resizeConfiguration))
                .orSome(ResizeAdjustment.fromJSON(resizeConfiguration))
        });
    }
}

ImageVariant.shape = Object.assign({
    uuid: PropTypes.string.isRequired,
    processed: PropTypes.shape(Image.shape).isRequired,
    maybeCropAdjustment: PropTypes.object.isRequired,
    maybeResizeAdjustment: PropTypes.object.isRequired,
    crop: PropTypes.func.isRequired,
    resize: PropTypes.func.isRequired
}, Image.shape);

ImageVariant.fromJSON = ({uuid, image, cropAdjustment, resizeAdjustment}) => new ImageVariant({
    uuid,
    image: Image.fromJSON(image),
    cropAdjustment: cropAdjustment ? CropAdjustment.fromJSON(cropAdjustment) : null,
    resizeAdjustment: resizeAdjustment ? ResizeAdjustment.fromJSON(resizeAdjustment) : null
});

ImageVariant.fromMetaData = metaData => {
    const {
        object,
        mediaType,
        originalDimensions,
        originalImageResourceUri,
        previewDimensions,
        previewImageResourceUri
    } = metaData;

    return ImageVariant.fromJSON({
        uuid: object.originalAsset ? object.originalAsset.__identity : object.__identity,
        image: {
            original: {
                resource: {
                    mediaType,
                    uri: originalImageResourceUri
                },
                dimensions: originalDimensions
            },
            preview: {
                resource: {
                    mediaType,
                    uri: previewImageResourceUri
                },
                dimensions: previewDimensions
            }
        }
    });
};
