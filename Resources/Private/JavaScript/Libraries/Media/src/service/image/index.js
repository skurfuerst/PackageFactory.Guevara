import {component} from '@neos/libs-utils/decorators';
import {validateAs} from '@neos/libs-utils';
import PropTypes from 'proptypes';

import {
    TYPE_IMAGE,
    TYPE_IMAGE_VARIANT,
    RESPONSE_TYPE_METADATA,
    RESPONSE_SHAPE_METADATA
} from 'Libraries/Media/src/constants/index';

import Client from 'Libraries/Utils/src/remote/client/index';
import ImageVariant from 'Libraries/Media/src/models/imagevariant/index';

const validateAsMetadataResponse = validateAs(RESPONSE_SHAPE_METADATA, RESPONSE_TYPE_METADATA);

@component({
    client: PropTypes.shape(Client.shape),
    endpoints: PropTypes.shape({
        metaData: PropTypes.string.isRequired
    }).isRequired,
    dummyImageUri: PropTypes.string.isRequired
})
class ImageService {
    get dummyImageUri () {
        return this.props.dummyImageUri;
    }

    loadFromMetaData(uuid) {
        const {imageWithMetaData} = this.props.endpoints;

        return this.props.client.get(`${imageWithMetaData}?image=${uuid}`)
            .then(response => response.json())
            .then(validateAsMetadataResponse)
            .then(ImageVariant.fromMetaData);
    }

    createVariant(imageVariant) {
        const {createImageVariant} = this.props.endpoints;
        const body = {
            asset: {
                originalAssetUuid: imageVariant.uuid,
                adjustments: {}
            }
        };

        if (imageVariant.maybeCropAdjustment.isSome()) {
            const cropAdjustment = imageVariant.maybeCropAdjustment.some();
            body.asset.adjustments[TYPE_CROP_ADJUSTMENT] = cropAdjustment.json;
        }

        if (imageVariant.maybeResizeAdjustment.isSome()) {
            const resizeAdjustment = imageVariant.maybeResizeAdjustment.some();
            body.asset.adjustments[TYPE_RESIZE_ADJUSTMENT] = resizeAdjustment.json;
        }

        return this.props.client.post(createImageVariant, body)
            .then(response => response.json())
            .then(validateAsMetadataResponse)
            .then(ImageVariant.fromMetaData);
    }
}

export default new ImageService({
    client: Client.fromJSON({
        csrfToken: ''
    }),
    endpoints: {
        imageWithMetaData: '/neos/content/image-with-metadata',
        createImageVariant: 'neos/content/create-image-variant'
    },
    dummyImageUri: '/_Resources/Static/Packages/TYPO3.Neos/Images/dummy-image.svg'
});
