<template>
    <access-search-select
        :field-label="labelText"
        :request="String(request.limit)"
        :config="limitOptions"
        :sid="sid + 'limit'"
        @input="onChange"
    />
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';
import AccessSearchSelect from '@/components/AccessSearchSelect.vue';

/**
 * A search limit
 * @module AccessSearchLimit
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchLimit',
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
            default: 'Limit'
        }
    },
    components: {
        AccessSearchSelect
    },
    data: function () {
        return {
            fieldType: '-search-limit',
        };
    },
    computed: {
        limitOptions () {
            return this.config.limitOptions.map(value => ({
                value: value,
                text: String(value)
            }));
        }
    },
    methods: {
        onChange (value) {
            this.$emit('do-limit', value);
        }
    }
};
</script>
