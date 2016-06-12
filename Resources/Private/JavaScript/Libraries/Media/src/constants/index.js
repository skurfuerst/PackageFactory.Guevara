import PropTypes from 'proptypes';

export const TYPE_IMAGE = 'TYPO3\\Media\\Domain\\Model\\Image';
export const TYPE_IMAGE_VARIANT = 'TYPO3\\Media\\Domain\\Model\\ImageVariant';
export const TYPE_CROP_ADJUSTMENT = 'TYPO3\\Media\\Domain\\Model\\Adjustment\\CropImageAdjustment';
export const TYPE_RESIZE_ADJUSTMENT = 'TYPO3\\Media\\Domain\\Model\\Adjustment\\ResizeImageAdjustment';

export const PROPERTY_PATH_CROP_IMAGE_ADJUSTMENT = ['object', 'adjustments', TYPE_CROP_ADJUSTMENT];
export const PROPERTY_PATH_RESIZE_IMAGE_ADJUSTMENT = ['object', 'adjustments', TYPE_RESIZE_ADJUSTMENT];

export const ORIENTATION_LANDSCAPE = 'ORIENTATION_LANDSCAPE';
export const ORIENTATION_PORTRAIT = 'ORIENTATION_PORTRAIT';
export const ORIENTATION_SQUARE = 'ORIENTATION_SQUARE';

export const RESPONSE_TYPE_METADATA = 'image meta data response';
export const RESPONSE_SHAPE_METADATA = PropTypes.shape({
    mediaType: PropTypes.string.isRequired,
    object: PropTypes.shape({
        __identity: PropTypes.string.isRequired,
        __type: PropTypes.oneOf([TYPE_IMAGE, TYPE_IMAGE_VARIANT]).isRequired
    }),
    originalDimensions: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }),
    originalImageResourceUri: PropTypes.string.isRequired,
    previewDimensions: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }),
    previewImageResourceUri: PropTypes.string.isRequired
});
