<template>
    <div>
        <div class="access-suggest-container" v-if="visible">
            <div v-if="results.length &gt; 0">
                <div class="access-suggest-listbox access-field-listbox-suggestions" role="listbox" v-bind:id="componentId">
                    <dl class="access-suggest-group" v-for="(group) in results" v-bind:key="group.groupId" v-bind:id="group.groupId">
                        <dt class="access-suggest-title" v-bind:id="group.groupId + '-dt'">{{ group.groupFormattedName }}</dt>
                        <dd v-for="(result) in group.suggestions" :key="result.suggestionId" class="access-suggest-item">
                            <slot
                                :sid="sid"
                                :result="result"
                                :focused-item="focusedItem"
                                :group="group">
                                <access-search-suggestions-item :sid="sid"
                                                                :result="result"
                                                                :focused-item="focusedItem"
                                                                :group="group" />
                            </slot>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';
import AccessSearchSuggestionsItem from './AccessSearchSuggestionsItem.vue';

/**
 * The collection of search suggestions
 * @module AccessSearchSuggestions
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchSuggestions',
    mixins: [AccessSearchControlMixin],
    props: {
        results: {
            required: true,
            type: Array
        },
        focusedItem: {
            type: Number,
            required: true
        },
        placeholders: {
            required: false,
            type: Number,
            default: 7
        },
        loading: {
            required: true,
            type: Boolean
        },
        visible: {
            required: true,
            type: Boolean
        }
    },
    data () {
        return {
            fieldType: '-search-suggestions'
        };
    },
    components: {
        AccessSearchSuggestionsItem
    }
};
</script>
<style lang="scss">
</style>
