'use strict';

import { clearString } from '@informatix8/search-bios';

/*eslint-disable no-console */
export default class SearchSuggestDataServiceEpsilon {
    constructor () {
        this.loading = false;
        this.contract = {
            groupName: 'string',
            suggestions: [
                {
                    term: 'string',
                    weight: 'number',
                    payload: 'string'
                }
            ]
        };
    }

    fetchSuggestions (model, val) {
        console.log(val, 'was typed for suggestions');

        this.loading = true;
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams();
            params.set('q', clearString(val));

            fetch('search-suggest.json?' + params.toString(), {
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
                    this.loading = false;
                    resolve(json.data);
                })
                .catch((err) => {
                    this.loading = false;
                    reject(err);
                });
        });
    }
}
