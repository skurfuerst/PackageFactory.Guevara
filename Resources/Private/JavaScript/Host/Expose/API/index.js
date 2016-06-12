import {$get} from 'plow-js';
import imageServicePrototype from 'Libraries/Media/src/service/image/index';

import {actions} from 'Host/Redux/index';
import {loadImageMetadata, createImageVariant, uploadAsset} from 'API/Endpoints/index';

export default ({dispatch, getState}, csrfToken) => {
    const imageService = imageServicePrototype.next({
        client: imageServicePrototype.props.client.next({csrfToken})
    });

    return {
        media: {
            asset: {
                upload(file) {
                    if (!file) {
                        return Promise.reject('Received malformed file.');
                    }

                    const siteNodePath = $get('cr.nodes.siteNode', getState());
                    const siteNodeName = siteNodePath.match(/\/sites\/([^/@]*)/)[1];

                    return uploadAsset(file, siteNodeName);
                }
            },
            image: imageService
        }
    };
};
