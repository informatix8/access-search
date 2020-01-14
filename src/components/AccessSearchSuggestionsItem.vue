<template>
    <div
        @click="onClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        role="option"
        v-bind:aria-labelledby="group.groupId + '-dt'"
        v-bind:class="itemClasses"
        v-bind:id="suggestionId"
    >
        <slot>
            <div class="access-suggest-item-container">
                <span class="icon-search access-suggest-icon" aria-hidden="true"></span>
                <span class="access-suggest-text" v-html="result.term"></span>
            </div>
        </slot>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search suggestion item
 * @module AccessSearchSuggestionsItem
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchSuggestionsItem',
    mixins: [AccessSearchControlMixin],
    props: {
        focusedItem: {
            type: Number,
            required: true
        },
        result: {
            required: true,
            type: Object
        },
        group: {
            required: true,
            type: Object
        }
    },
    data () {
        return {
            fieldType: '-search-suggestion-result-item',
            hovered: false
        };
    },
    computed: {
        itemClasses () {
            return {
                'access-suggest-item-wrapper': true,
                'access-suggest-item-is-hovered': this.hovered === true,
                'access-suggest-item-is-focused': (this.result.suggestionIndex - 1 === this.focusedItem)
            };
        },
        suggestionId () {
            return this.sid + this.fieldType + '-' + (this.result.suggestionIndex - 1);
        }
    },
    methods: {
        onMouseEnter () {
            this.hovered = true;
        },
        onMouseLeave () {
            this.hovered = false;
        },
        onClick () {
            this.$parent.$parent.$emit('do-click-suggestions-item', this.result.suggestionId);
        }
    }
};
</script>
