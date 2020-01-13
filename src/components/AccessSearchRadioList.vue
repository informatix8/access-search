<template>
    <div class="access-field-body" :class="{visuallyhidden: visuallyHidden}">
        <div class="access-field-choice" v-for="fieldConfig in config" :key="fieldConfig.value"
             :class="{visuallyhidden: fieldConfig.visuallyHidden}">
            <slot :checked="checked"
                  :text="fieldConfig.text"
                  :fieldName="name"
                  :value="fieldConfig.value"
                  :change="onChange">
                <label class="access-field-choice-label">
                    <input :name="name" type="radio" class="access-field-choice"
                           @change="onChange" :value="fieldConfig.value" :checked="checked[fieldConfig.value]" />
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
 * @module AccessSearchRadioList
 * @mixes AccessSearchControlMixin
 */

export default {
    name: 'AccessSearchRadioList',
    mixins: [AccessSearchControlMixin],
    props: {
        name: String,
        request: [ String, Boolean, Number ],
        config: Array,
        sid: String,
        visuallyHidden: {
            type: Boolean,
            default: false
        }
    },
    created() {
    },
    data: function () {
        const checked = {};
        checked[this.request] = true;

        return {
            checked
        };
    },
    watch: {
        request() {
            const checked = {};
            checked[this.request] = true;
            this.checked = checked;
        }
    },
    methods: {
        onChange(event) {
            if (event.target.checked) {
                const value = event.target.value;
                this.$emit('input', value);
            }
        }
    }
};
</script>
