'use strict';

/**
 * Connect Search BIOS models’ API to a Vue app or Vue component
 */
export default function bindHandlersToModel (model) {
    if (!model || !model.esc) {
        return {};
    }
    return {
        /**
         * @summary Execute ESC key procedure on the model
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         */
        'do-esc' () {
            model.esc();
        },
        /**
         * @summary Execute Enter key procedure on the model
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         * @param isMobileZoomed {Boolean} current mobile zoomed state
         */
        'do-enter' (val, isMobileZoomed) {
            model.enter(val);
            model.setMobileZoomed(isMobileZoomed);
        },
        /**
         * @summary Execute the search
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         * @param reason {String} explanation of how the search was executed
         */
        'do-search' (val, reason) {
            model.search(val, reason);
        },
        /**
         * @summary user has typed the Arrow Up key
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         */
        'do-arrow-up' (val) {
            model.arrowUp(val);
        },
        /**
         * @summary user has typed the Arrow Down key
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         */
        'do-arrow-down' (val) {
            model.arrowDown(val);
        },
        /**
         * @summary user has moved outside of the search field
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param reason {String} reason why it was dismissed
         */
        'do-dismiss-intent' (reason) {
            model.dismissIntent(reason);
        },
        /**
         * @summary Execute user’s intent to edit logic
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         */
        'do-edit-intent' (val) {
            model.editIntent(val);
        },
        /**
         * @summary user focused search input on mobile
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param isMobileZoomed {Boolen} current mobile zoomed state
         */
        'do-mobile-zoom' (isMobileZoomed) {
            model.setMobileZoomed(isMobileZoomed);
        },
        /**
         * @summary user has moved outside of the search field
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         * @param isMobileZoomed {Boolen} current mobile zoomed state
         */
        'do-outside-trigger' (isMobileZoomed) {
            model.outsideTrigger(isMobileZoomed);
        },
        /**
         * @summary Execute user’s action of clicking a history item
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         */
        'do-click-history-item' (id) {
            model.clickHistoryItem(id);
        },
        /**
         * @summary user has clicked a suggestion item
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} current search query string
         */
        'do-click-suggestions-item' (suggestionId) {
            model.clickSuggestionsItem(suggestionId);
        },
        /**
         * @summary user changed sort
         * @method do-sort
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} new sort
         */
        'do-sort' (sort) {
            model.request.sort = sort;
            if (model.request.q) {
                model.search(model.request.q, 'change-sort');
            }
        },
        /**
         * @summary user changed offset
         * @method do-offset
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} new offset
         */
        'do-offset' (offset) {
            model.request.offset = offset;
            if (model.request.q) {
                model.search(model.request.q, 'change-offset');
            }
        },
        /**
         * @summary user changed limit
         * @method do-limit
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param val {String} new limit
         */
        'do-limit' (limit) {
            model.request.limit = parseInt(limit);
            model.request.offset = Math.floor(model.request.offset / limit) * limit;
            if (model.request.q) {
                model.search(model.request.q, 'change-limit');
            }
        },
        /**
         * @summary user clicked checkbox
         * @method check
         * @memberOf bindHandlerToModel
         * @param model {SearchBIOS}
         * @param name {String} name of field
         * @param val {String} is checked
         */
        check (name, val) {
            model.request[name] = val;
            if (model.request.q) {
                model.search(model.request.q, 'change-check');
            }
        }
    };
}
