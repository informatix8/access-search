<template>
    <div class="access-result-item-shell">
        <slot>
            <article class="access-result-item">
                <div class="document-match">
                    <h1 class="access-result-title" v-if="val.title">{{ val.title }}</h1>
                    <p class="access-result-snippit" v-if="val.body">{{ val.body }}</p>
                </div>
            </article>
        </slot>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search result item
 * @module AccessSearchResultItem
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchResultItem',
    mixins: [AccessSearchControlMixin],
    replace: false,
    props: {
        sid: {
            required: true,
            type: String
        },
        val: {
            required: true,
            type: Object
        },
        idx: {
            required: false,
            type: Number
        }
    },
    data () {
        return {
            fieldType: '-search-result-item'
        };
    }
};
</script>
