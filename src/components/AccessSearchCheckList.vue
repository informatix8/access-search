<template>
    <div class="access-field-body" :class="{visuallyhidden: visuallyHidden}">
        <div class="access-field-choice-container" v-for="fieldConfig in config" :key="fieldConfig.value"
             :class="{visuallyhidden: fieldConfig.visuallyHidden}">
            <slot :checked="checked"
                  :text="fieldConfig.text"
                  :fieldName="name"
                  :value="fieldConfig.value"
                  :change="onChange">
                <label class="access-field-choice-label">
                    <input :name="name" type="checkbox" class="access-field-choice"
                           @change="onChange" :value="fieldConfig.value" :checked="checked[fieldConfig.value]"/>
                    <span class="access-field-choice-text">{{fieldConfig.text}}</span>
                </label>
            </slot>
        </div>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * A search check list
 * @module AccessCheckList
 * @mixes AccessSearchControlMixin
 */

export default {
    name: 'AccessSearchCheckList',
    mixins: [AccessSearchControlMixin],
    props: {
        name: String,
        request: Array,
        config: Array,
        sid: String,
        visuallyHidden: {
            type: Boolean,
            default: false
        }
    },
    created() {
    },
    data() {
        const checked = {};
        for (const k of this.request) {
            checked[k] = true;
        }

        return {
            checked
        };
    },
    watch: {
        request() {
            const checked = {};
            for (const k of this.request) {
                checked[k] = true;
            }
            this.checked = checked;
        }
    },
    methods: {
        onChange(event) {
            this.checked[event.target.value] = event.target.checked;
            const value = [];
            for (let k in this.checked) {
                if (this.checked[k]) {
                    value.push(k);
                }
            }
            this.$emit('input', value);
        }
    }
};
</script>
