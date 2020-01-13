<template>
    <div
        @click="onClick(idx)"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        role="option"
        v-bind:aria-labelledby="dtId"
        v-bind:class="itemClasses"
        v-bind:id="id"
    >
        <slot>
            <div class="access-suggest-item-container">
                <span class="icon-clock-back access-suggest-icon" aria-hidden="true"></span>
                <span class="access-suggest-text">{{ val }}</span>
            </div>
        </slot>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search history item
 * @module AccessSearchHistoryItem
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchHistoryItem',
    mixins: [AccessSearchControlMixin],
    props: {
        focusedItem: {
            type: Number,
            required: true
        },
        idx: {
            required: true,
            type: Number
        },
        val: {
            required: true,
            type: String
        },
        id: {
            required: true,
            type: String
        },
        dtId: {
            required: true,
            type: String
        }
    },
    data() {
        return {
            fieldType: '-search-history-item',
            hovered: false
        };
    },
    computed: {
        itemClasses() {
            return {
                'access-suggest-item-wrapper': true,
                'access-suggest-item-is-hovered': this.hovered === true,
                'access-suggest-item-is-focused': (this.idx === this.focusedItem)
            };
        }
    },
    methods: {
        onMouseEnter() {
            this.hovered = true;
        },
        onMouseLeave() {
            this.hovered = false;
        },
        onClick(idx) {
            this.$parent.$parent.$emit('do-click-history-item', idx);
        }
    }
};
</script>
