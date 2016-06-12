import React, {Component, PropTypes} from 'react';
import {Components, I18n} from '@host';
import Dropzone from 'react-dropzone';
import {Maybe} from 'monet';
import ImageVariant from '@neos/libs-media/models/imagevariant/index';
import Thumbnail from '@neos/libs-media/models/thumbnail/index';

import style from './style.css';

const {Icon} = Components;

const createStylesFromThumbnail = thumbnail => ({
    thumbnail: {
        width: `${thumbnail.outerDimensions.width}px`,
        height: `${thumbnail.outerDimensions.height}px`,
        left: `${thumbnail.offset.x}px`,
        top: `${thumbnail.offset.y}px`
    },
    cropArea: {
        width: `${thumbnail.innerDimensions.width}px`,
        height: `${thumbnail.innerDimensions.height}px`
    }
});

export default class PreviewScreen extends Component {
    static propTypes = {
        image: PropTypes.shape(ImageVariant.shape),
        onDrop: PropTypes.func.isRequired,
        onClick: PropTypes.func.isRequired
    };

    chooseFromLocalFileSystem() {
        const {dropzone} = this.refs;
        dropzone.open();
    }

    render() {
        const {image, onDrop, onClick} = this.props;
        const maybeThumbnail = Maybe.fromNull(image).map(image => Thumbnail.fromParams(image, 273, 216));
        const maybeThumbnailStyles = maybeThumbnail.map(createStylesFromThumbnail);
        const loader = () => <Icon icon="spinner" spin={true} size="big" className={style.thumbnail__loader} />;
        const preview = image => (
            <div className={style.cropArea} style={maybeThumbnailStyles.map(styles => styles.cropArea).orSome({})}>
                <img
                    className={style.thumbnail__image}
                    src={maybeThumbnail.map(t => t.uri).orSome('/_Resources/Static/Packages/TYPO3.Neos/Images/dummy-image.svg')}
                    style={maybeThumbnailStyles.map(styles => styles.thumbnail).orSome({})}
                    role="presentation"
                    />
            </div>
        );

        return (
            <Dropzone
                ref="dropzone"
                onDropAccepted={files => onDrop(files)}
                className={style.dropzone}
                activeClassName={style['dropzone--isActive']}
                rejectClassName={style['dropzone--isRejecting']}
                disableClick={true}
                multiple={false}
                >
                <div
                    className={style.thumbnail}
                    onClick={() => onClick()}
                    >
                    {Maybe.fromNull(image).map(preview).orSome(loader())}
                </div>
            </Dropzone>
        )
    }
}
