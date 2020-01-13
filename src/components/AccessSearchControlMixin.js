'use strict';

/**
 * Expose unique id for controls
 * @mixin AccessSearchControlMixin
 */
const AccessSearchControlMixin = {
    props: {
        sid: {
            type: String,
            required: true
        }
    },
    computed: {
        componentId() {
            return this.sid + this.fieldType;
        }
    }
};

export default AccessSearchControlMixin;
