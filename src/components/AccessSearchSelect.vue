<template>
    <div>
        <label v-if="fieldLabel" :for="componentId">{{fieldLabel}}</label>
        <select @change="onChange" v-model="value" :id="componentId">
            <option v-for="entry in config" :value="entry.value" :key="entry.value" >{{entry.text}}</option>
        </select>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search select
 * @module AccessSearchSelect
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchSelect',
    mixins: [AccessSearchControlMixin],
    props: {
        fieldLabel: String,
        request: String,
        config: Array
    },
    data: function () {
        return {
            fieldType: '-access-search-select',
            value: this.request
        };
    },
    watch: {
        request () {
            this.value = this.request;
        }
    },
    methods: {
        onChange () {
            this.$emit('input', this.value);
        }
    }
};
</script>
