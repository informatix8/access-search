<template>
    <div class="access-field-body" :class="{visuallyhidden: visuallyHidden}">
        <div
            :class="{visuallyhidden: fieldConfig.visuallyHidden}"
            :key="fieldConfig.value"
            class="access-field-choice-container"
            v-for="fieldConfig in config"
        >
            <slot
                :change="onChange"
                :checked="checked"
                :field="fieldConfig"
                :fieldName="name"
                :text="fieldConfig.text"
                :value="fieldConfig.value"
            >
                <label class="access-field-choice-label">
                    <input
                        :checked="checked[fieldConfig.value]"
                        :name="name"
                        :value="fieldConfig.value"
                        @change="onChange"
                        class="access-field-choice"
                        type="checkbox"
                    />
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
    created () {
    },
    data () {
        const checked = {};
        for (const k of this.request) {
            checked[k] = true;
        }

        return {
            checked
        };
    },
    watch: {
        request () {
            const checked = {};
            for (const k of this.request) {
                checked[k] = true;
            }
            this.checked = checked;
        }
    },
    methods: {
        onChange (event) {
            this.checked[event.target.value] = event.target.checked;
            const value = [];
            for (const k in this.checked) {
                if (this.checked[k]) {
                    value.push(k);
                }
            }
            this.$emit('input', value);
        }
    }
};
</script>
