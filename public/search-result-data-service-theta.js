'use strict';

import { clearString } from '@informatix8/search-bios';

/*eslint-disable no-console */
export default class SearchResultDataServiceTheta {
    constructor () {
        this.loading = false;
        this.pristine = true;
        this.contract = {
            category: 'string',
            meta: 'string',
            tags: 'array',
            snippit: 'string'
        };
    }

    fetchResults (model) {
        const query = clearString(model.request.q);

        this.loading = true;
        this.pristine = false;
        return new Promise((resolve, reject) => {
            //Testing proof f concept for errors
            if (query === 'fake') {
                this.loading = false;
                resolve([]);
            } else if (query === 'error') {
                console.log('pre programmed reject');
                this.loading = false;
                reject(new Error('Pre-programmed demo error.'));
            } else {
                const params = new URLSearchParams();
                params.set('q', query);
                params.set('limit', model.request.limit);
                params.set('offset', model.request.offset);
                params.set('sort', model.request.sort);
                params.set('includeDefinitions', model.request.includeDefinitions);
                params.set('checkBox', model.request.checkBox);

                fetch('search-results.json?' + params.toString(), {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response;
                        } else {
                            const error = new Error(response.statusText);
                            error.response = response;
                            throw error;
                        }
                    })
                    .then(response => response.clone().json())
                    .then(json => {
                        window.setTimeout(() => {
                            this.loading = false;
                            json.meta.limit = model.request.limit;
                            json.meta.length = json.meta.count - model.request.offset < model.request.limit
                                ? json.meta.count - model.request.offset : model.request.limit;
                            json.meta.offset = model.request.offset;
                            resolve(json);
                        }, 1000);
                    })
                    .catch((err) => {
                        this.loading = false;
                        reject(err);
                    });
            }
        });
    }
}
