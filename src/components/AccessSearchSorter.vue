<template>
    <access-search-select
        :field-label="labelText"
        :request="request.sort"
        :config="config.sortOptions"
        :sid="sid + 'sort'"
        @input="onChange"
    />
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';
import AccessSearchSelect from '@/components/AccessSearchSelect.vue';

/**
 * A search sort
 * @module AccessSearchSorter
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchSorter',
    mixins: [AccessSearchControlMixin],
    props: {
        request: {
            type: Object,
            required: true
        },
        config: {
            type: Object,
            required: true
        },
        labelText: {
            type: String,
            default: 'Sort Results'
        }
    },
    components: {
        AccessSearchSelect
    },
    methods: {
        onChange(value) {
            this.$emit('do-sort', value);
        }
    }
};
</script>
