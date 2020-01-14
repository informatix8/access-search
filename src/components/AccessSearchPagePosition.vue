<template>
    <div class="access-pagination-results" v-if="meta">
        <slot :firstPage="firstPage" :lastPage="lastPage" :count="meta.count">
            <strong>{{ firstPage }} - {{ lastPage }}</strong><span>&nbsp;</span><span>of </span><span>&nbsp;</span><strong>{{ meta.count }}</strong><span>&nbsp;</span><span>results</span>
        </slot>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search page position
 * @module AccessSearchPosition
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchPosition',
    mixins: [AccessSearchControlMixin],
    props: {
        meta: Object
    },
    data: function () {
        return {
            fieldType: '-search-page-position'
        };
    },
    computed: {
        firstPage () {
            return this.meta.offset + 1;
        },
        lastPage () {
            return this.meta.offset + this.meta.length;
        }
    }
};
</script>
