<template>
    <div>
        <div class="access-suggest-container" v-if="visible &amp;&amp; (loading || results.length &gt; 0)">
            <div v-if="results.length &gt; 0">
                <div class="access-suggest-listbox access-field-listbox-history" role="listbox" v-bind:id="componentId">
                    <dl class="access-field-listbox-group">
                        <dt class="access-suggest-title" v-bind:id="componentId + '-dt'">Search History</dt>
                        <dd v-for="(val, idx) in results" :key="componentId + '-result-item-' + idx" class="access-suggest-item">
                            <slot
                                :dt-id="componentId + '-dt'"
                                :focused-item="focusedItem"
                                :id="componentId + '-result-item-' + idx"
                                :idx="idx"
                                :sid="sid"
                                :val="val">
                                <access-search-history-item :sid="sid"
                                                            :dt-id="componentId + '-dt'"
                                                            :idx="idx"
                                                            :result="result"
                                                            :focused-item="focusedItem"
                                                            :val="val" />
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

import AccessSearchControlMixin from './AccessSearchControlMixin.js';
import AccessSearchHistoryItem from './AccessSearchHistoryItem.vue';

/**
 * The combined search history collection
 * @module AccessSearchHistory
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchHistory',
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
            fieldType: '-search-history'
        };
    },
    computed: {
        reverseResults () {
            return this.results.slice().reverse();
        }
    },
    components: {
        AccessSearchHistoryItem
    }
};
</script>
