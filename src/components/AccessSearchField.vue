<template>
    <div class="access-field access-search-field" v-bind:id="universeId" v-bind:class="searchFieldClass" @keydown.enter="onEnterKeyDown" v-on:focusin="onFocusIn">
        <div class="access-search-field-placeholder" ref="searchFieldPlaceholder" v-bind:id="sid + '-search-field-placeholder'"></div>
        <div class="access-search-field-expanse" v-if="false &amp;&amp; expandable">
            <button
                @click="onExpandClick"
                class="access-field-button access-search-field-expand-button"
                ref="expandButton"
                type="button"
                v-bind:aria-controls="expandPanelId"
                v-bind:aria-label="expandButtonAriaLabel"
            >
                <span class="icon-search" aria-hidden="true"></span>
            </button>
        </div>
        <div class="access-field-container" v-show="true || (expandable && localExpanded) || !expandable" v-bind:aria-expanded="aria.expanded" v-bind:id="expandPanelId" ref="expandPanel">
            <div class="access-field-main" v-on-clickaway="onClickAway">
                <div class="access-field-header">
                    <label class="access-field-label" v-bind:for="componentId">{{ fieldLabel }}</label>
                </div>
                <div class="access-field-body">
                    <div class="access-field-content">
                        <input
                            @blur="onBlur"
                            @click="onClickField"
                            @keydown.down.prevent="curtail"
                            @keydown.esc.prevent="curtail"
                            @keydown.tab="onTabOutKey"
                            @keydown.up.prevent="curtail"
                            @keyup.down="onArrowDownKey"
                            @keyup.enter="onEnterKeyUp"
                            @keyup.esc="onEscKey"
                            @keyup.tab="onTabInKey"
                            @keyup.up="onArrowUpKey"
                            @keyup="onSignificantKey"
                            aria-autocomplete="both"
                            autocomplete="off"
                            class="access-field-input"
                            ref="searchField"
                            role="combobox"
                            type="search"
                            v-bind:aria-activedescendant="activeDescendant"
                            v-bind:aria-owns="ariaOwns"
                            v-bind:id="componentId"
                            v-bind:placeholder="fieldPlaceholder"
                            v-model.trim="localQuery"
                        >
                        <div class="access-field-inlay">
                            <slot v-if="loading" name="loading"/>
                            <button
                                @click.prevent="onClearClick"
                                class="access-field-button"
                                ref="clearButton"
                                type="button"
                                v-bind:aria-label="clearFieldAriaLabel"
                                v-show="fieldHasText"
                            >
                                <span ref="clearBtnIcon" class="icon-close-circle" aria-hidden="true"></span>
                            </button>
                            <button
                                @click.prevent="onSubmit"
                                @submit.prevent="onSubmit"
                                aria-label="search"
                                class="access-field-button"
                                type="button"
                            >
                                <span class="icon-search" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                    <div class="access-field-suffix">
                        <div class="access-search-field-close">
                            <button class="access-field-button access-search-field-close-button" type="button" v-bind:aria-label="backButtonAriaLabel" v-bind:aria-controls="expandPanelId" @click="onCloseClick"><span class="icon-close" aria-hidden="true"></span></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="access-suggest" ref="comboGroup" v-show="stateService.suggestionsVisible || stateService.historyVisible">
                <access-search-history v-if="config.historyEnabled"
                                   v-bind:sid="sid"
                                   v-bind:loading="stateService.historyPending"
                                   v-bind:visible="stateService.historyVisible && !stateService.historyPending"
                                   v-bind:placeholders="config.historyLoadingPlaceholderCount"
                                   v-bind:results="response.history"
                                   v-bind:focused-item="request.focusedHistoryItem">
                    <template v-slot:default="slotProps">
                        <slot name="history-item"
                            :sid="slotProps.sid"
                            :result="slotProps.result"
                            :id="slotProps.id"
                            :dt-id="slotProps.dtId"
                            :val="slotProps.val"
                            :idx="slotProps.idx"
                            :focused-item="slotProps.focusedItem"
                            :group="slotProps.group"
                        ></slot>
                    </template>
                </access-search-history>
                <access-search-suggestions v-if="config.suggestionsEnabled"
                                       v-bind:sid="sid"
                                       v-bind:loading="stateService.suggestionsPending"
                                       v-bind:visible="stateService.suggestionsVisible && !stateService.suggestionsPending"
                                       v-bind:placeholders="config.suggestionsLoadingPlaceholderCount"
                                       v-bind:results="response.suggestions"
                                       v-bind:focused-item="request.focusedSuggestionItem">
                    <template v-slot:default="slotProps">
                        <slot name="suggestions-item" :sid="slotProps.sid" :result="slotProps.result"
                              :focused-item="slotProps.focusedItem" :group="slotProps.group" ></slot>
                    </template>
                </access-search-suggestions>
            </div>
        </div>
        <div class="access-field-meta">
            <span aria-live="polite" v-if="config.historyEnabled &amp;&amp; historyVisible &amp;&amp; !historyPending &amp;&amp; historyLength &gt; 0">{{ historyLength }} {{ historyCountMessage }}</span>
            <span aria-live="polite" v-else-if="config.suggestionsEnabled &amp;&amp; suggestionsVisible &amp;&amp; !suggestionsPending &amp;&amp; suggestionsLength &gt; 0">{{ suggestionsLength }} {{ suggestionsCountMessage }}</span>
        </div>
    </div>
</template>

<script>
'use strict';

import zenscroll from 'zenscroll';
import VueClickaway from 'vue-clickaway';
import debounce from 'lodash.debounce';

import AccessSearchControlMixin from './AccessSearchControlMixin.js';
import AccessSearchHistory from './AccessSearchHistory.vue';
import AccessSearchSuggestions from './AccessSearchSuggestions.vue';

const META_KEYS = ['meta', 'tab', 'capslock', 'control', 'alt', 'shift', 'home', 'end', 'pageup', 'pagedown', 'insert', 'up', 'down', 'left', 'right', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'escape', 'enter'];
for (let i = 1; i < 13; i++) {
    META_KEYS.push('f' + i);
}

const LEADING = {
    leading: true,
    trailing: false
};

const TRAILING = {
    leading: false,
    trailing: true
};

/**
 * The main search field UI
 * @module AccessSearchField
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchField',
    mixins: [AccessSearchControlMixin],
    directives: {
        onClickaway: VueClickaway.directive
    },
    replace: false,
    props: {
        fieldLabel: {
            type: String,
            required: false
        },
        config: {
            type: Object,
            required: true
        },
        stateService: {
            type: Object,
            required: true
        },
        request: {
            type: Object,
            required: true
        },
        response: {
            type: Object,
            required: true
        },
        historyCountMessage: {
            type: String,
            required: false,
            default: 'history items found. Use the up and down arrow keys to navigate.'
        },
        suggestionsCountMessage: {
            type: String,
            required: false,
            default: 'suggestions found. Use the up and down arrow keys to navigate.'
        },
        clearFieldAriaLabel: {
            type: String,
            required: false,
            default: 'Clear search field'
        },
        expandButtonAriaLabel: {
            type: String,
            required: false,
            default: 'Show search field'
        },
        backButtonAriaLabel: {
            type: String,
            required: false,
            default: 'Collapse search field'
        },
        fieldPlaceholder: {
            type: String,
            required: false,
            default: 'Search'
        },
        submitLabel: {
            type: String,
            required: false,
            default: 'Search'
        },
        zoomable: {
            type: Boolean,
            default: false,
            required: false
        },
        expandable: {
            type: Boolean,
            default: false,
            required: false
        },
        expanded: {
            type: Boolean,
            default: false,
            required: false
        },
        autoCollapse: {
            type: Boolean,
            default: false,
            required: false
        },
        plusTop: {
            type: Number,
            default: 0,
            required: false
        },
        plusBottom: {
            type: Number,
            default: 12,
            required: false
        },
        plusRight: {
            type: Number,
            default: 4,
            required: false
        },
        plusLeft: {
            type: Number,
            default: 0,
            required: false
        }
    },
    data () {
        return {
            pristine: true,
            focused: false,
            enterKeyTarget: null,
            delayedAutoCollapseResize: null,
            delayedKeepOnScreenResize: null,
            delayedKeepOnScreenScroll: null,
            fieldType: '-search-field',
            localQuery: this.request.q, //return a copy of the prop
            localExpanded: this.expanded, //return a copy of the prop
            localMobileZoomed: this.stateService.mobileZoomed, //return a copy of the prop
            comboGroupScrollPane: null,
            scrollSize: null,
            isScrollOuter: null
        };
    },
    watch: {
        query () {
            this.localQuery = this.query; //changes from the top-down? Update my local copy
        },
        expanded () {
            this.localExpanded = this.expanded; //changes from the top-down? Update my local copy
        },
        mobileZoomed () {
            this.localMobileZoomed = this.stateService.mobileZoomed; //changes from the top-down? Update my local copy
        },
        activeDescendant () {
            const focusedItem = document.getElementById(this.activeDescendant);

            if (focusedItem !== null && this.comboGroupScrollPane !== null) {
                this.comboGroupScrollPane.intoView(focusedItem);
            }
        },
        historyVisible () {
            this.doPositionComboGroup();
        },
        suggestionsVisible () {
            this.doPositionComboGroup();
        },
        historyPending () {
            this.doPositionComboGroup();
        },
        suggestionsPending () {
            this.doPositionComboGroup();
        }
    },
    computed: {
        query () {
            return this.request.q;
        },
        activeDescendant () {
            return this.request.activeDescendant;
        },
        focusedHistoryItem () {
            return this.request.focusedHistoryItem;
        },
        focusedSuggestionItem () {
            return this.request.focusedSuggestionItem;
        },
        historyLength () {
            return this.response.history.length;
        },
        suggestionsLength () {
            return this.response.suggestions.length;
        },
        loading () {
            return this.stateService.searchPending;
        },
        historyVisible () {
            return this.stateService.historyVisible;
        },
        historyPending () {
            return this.stateService.historyPending;
        },
        suggestionsVisible () {
            return this.stateService.suggestionsVisible;
        },
        suggestionsPending () {
            return this.stateService.suggestionsPending;
        },
        mobileZoomed () {
            return this.stateService.mobileZoomed;
        },
        aria () {
            return {
                expanded: this._ariaExpandedLogic()
            };
        },
        searchFieldClass () {
            return {
                expandable: this.expandable === true,
                expanded: this.expandable === true && this.localExpanded === true,
                collapsed: this.expandable === true && this.localExpanded !== true,
                loading: this.loading === true,
                loaded: this.loading === false,
                pristine: this.pristine === true,
                dirty: this.pristine === false,
                focused: this.focused === true,
                'with-overlay': this.localMobileZoomed === true && typeof window !== 'undefined' && window.matchMedia('(max-width: ' + this.config.autoCollapseThreshold + 'px)').matches,
                'field-has-text': this.fieldHasText === true,
                'suggestions-visible': this.config.suggestionsEnabled && this.suggestionsVisible,
                //'no-suggestions': this.config.suggestionsEnabled && this.suggestionsVisible && this.response.suggestionsCount === 0, // no-suggestions is deprecated
                'history-visible': this.config.historyEnabled && this.historyVisible,
                'suggestions-pending': this.config.suggestionsEnabled && this.suggestionsPending,
                'history-pending': this.config.historyEnabled && this.historyPending
            };
        },
        fieldHasText () {
            return this.localQuery.length > 0;
        },
        ariaOwns () {
            if (this.config.historyEnabled && this.historyVisible && !this.historyPending) {
                return this.sid + '-search-history';
            } else if (this.config.suggestionsEnabled && this.suggestionsVisible && !this.suggestionsPending) {
                return this.sid + '-search-suggestions';
            } else {
                return '';
            }
        },
        universeId () {
            return this.sid + '-search-field-universe';
        },
        expandPanelId () {
            return this.sid + '-search-field-container';
        }
    },
    methods: {
        /**
         * @method measureScroll
         * @memberOf AccessSearchField
         * @instance
         * @summary Internal measure the width of the browser’s scrollbar
         * @private
         */
        measureScroll () {
            const outer = document.createElement('div');
            outer.style.visibility = 'hidden';
            outer.style.position = 'fixed';
            outer.style.left = '0';
            outer.style.top = '0';
            outer.style.overflow = 'auto';

            document.body.appendChild(outer);
            const inner = document.createElement('div');
            inner.style.width = '50px';
            inner.style.height = '200px';
            outer.appendChild(inner);
            outer.style.height = '50px';

            this.isScrollOuter = Math.round(outer.offsetWidth - 50);

            inner.style.width = '100%';
            outer.style.width = '100px';

            this.scrollSize = 100 - inner.clientWidth;

            outer.parentNode.removeChild(outer);
        },
        /**
         * @method isPointWithinViewport
         * @memberOf AccessSearchField
         * @instance
         * @summary Internal measurement function
         * @private
         */
        isPointWithinViewport (x, y, viewport) {
            return x >= 0 && x <= 0 + viewport.width && y >= 0 && y <= 0 + viewport.height;
        },
        /**
         * Should the `aria-expanded` attribute be included?
         * @method _ariaExpandedLogic
         * @instance
         * @returns {(Boolean|String)} Returns a boolean `false` or string value `true` or `false`
         */
        _ariaExpandedLogic () {
            if (this.expandable) {
                if (this.localExpanded) {
                    return 'true';
                }

                return 'false';
            }

            return false;
        },
        onClickAway (e) {
            const comboGroup = this.$refs.comboGroup;
            const clearBtn = this.$refs.clearButton;
            const clearBtnIcon = this.$refs.clearBtnIcon;
            const searchField = this.$refs.searchField;

            let exit = false;

            if (searchField !== null && searchField === e.target) {
                exit = true;
            } else if (comboGroup !== null && comboGroup.contains(e.target)) {
                exit = true;
            } else if ((clearBtn === e.target || clearBtnIcon === e.target) && this.focused && this.localMobileZoomed) {
                exit = true;
            }

            if (exit) {

            } else {
                this.focused = false;
                this.localMobileZoomed = false;
                this.doRemoveZoomedInlineStyle();
                this.$emit('do-outside-trigger', this.localMobileZoomed);
            }
        },
        onCloseClick () {
            this.focused = false;
            this.localExpanded = false;
            this.localMobileZoomed = false;
            this.$emit('do-outside-trigger', this.localMobileZoomed);
            this.delayedFocusExpandButton();
            this.doRemoveZoomedInlineStyle();
        },
        doFocusSearchField () {
            const searchField = this.$refs.searchField;
            if (searchField !== null) {
                searchField.focus();
            }
        },
        doBlurSearchField () {
            const searchField = this.$refs.searchField;
            if (searchField !== null) {
                searchField.blur();
            }
        },
        doFocusExpandButton () {
            const el = this.$refs.expandButton;
            if (el !== null) {
                el.focus();
            }
        },
        onExpandClick () {
            this.localExpanded = !this.localExpanded;

            if (this.localExpanded) {
                this.delayedFocusSearchField();
            }
        },
        onClearClick () {
            this.delayedSignificantKeyUp.cancel();
            this.delayedEnterKey.cancel();
            this.doDismissIntent('cleared search field');
            this.localQuery = '';
            this.doFocusSearchField();
        },
        onArrowUpKey (e) {
            this.delayedArrowUpKey(e);
        },
        onArrowDownKey (e) {
            this.delayedArrowDownKey(e);
        },
        onEnterKeyDown (e) {
            this.enterKeyTarget = e.target;
        },
        onEnterKeyUp (e) {
            if (this.enterKeyTarget !== e.target) {
                //short circuit, the enter key down event does not match the enter key up event target: that means the search field was not focused for the entire key stroke, in other words, focus was programatically moved to the search field after enter key down - two cases would produce this. 1. pressing enter on the expand button, 2. pressing enter on the clear button
                return;
            }
            //console.log('did not short circuit');

            //cancel other search submissions
            this.delayedSignificantKeyUp.cancel();
            this.delayedDismissIntent.cancel();
            this.delayedAutoSubmit.cancel();

            this.delayedEnterKey(); //debounce my search submit/dropdown select
        },
        curtail () {
            return false;
        },
        onFocusIn () {
            this.focused = true;
            this.pristine = false;

            if (!this.localMobileZoomed && typeof window !== 'undefined' && window.matchMedia('(max-width: ' + this.config.autoCollapseThreshold + 'px)').matches) {
                this.doCalculateZoomedPosition();
                this.localMobileZoomed = true;
                this.$emit('do-mobile-zoom', this.localMobileZoomed);
            }
        },
        onTabInKey () {
            this.doEditIntent();
        },
        onTabOutKey () {
            //this.focused = false;// HMM?
            this.delayedDismissIntent('tab out');
        },
        onEscKey () {
            this.delayedSignificantKeyUp.cancel();

            this.delayedDismissIntent.cancel();

            this.delayedEnterKey.cancel();

            if (this.localMobileZoomed && !this.suggestionsVisible && !this.historyVisible) {
                this.focused = false;
                this.localMobileZoomed = false;
                this.doRemoveZoomedInlineStyle();
                this.doBlurSearchField();
            }

            this.$emit('do-esc');
        },
        onSignificantKey (e) {
            const currentKey = e.key.toLowerCase();

            if (META_KEYS.indexOf(currentKey) === -1) { //not a meta key = something of significance
                if (this.config.autoSubmitAfterTyping) { //also must be in the mode to submit automatically
                    this.delayedAutoSubmit();
                }

                //console.log('not a meta key pressed', currentKey);
                this.delayedSignificantKeyUp(e);
            }
        },
        onClickField () {
            this.doEditIntent();
        },
        onBlur () {
            //FIXME refactor to tab down?
            if (this.config.autoSubmitAfterTyping) {
                this.delayedAutoSubmit();
            }
        },
        onSubmit () {
            this.doSearch('clickSubmit');
        },
        doAutoSubmit () {
            this.doSearch('autoSubmit');
        },
        doUnzoom () {
            if (this.localMobileZoomed) {
                this.focused = false;
                this.localMobileZoomed = false;
                this.doRemoveZoomedInlineStyle();
                this.doBlurSearchField();
            }
        },
        doEnterKey () {
            this.doUnzoom();
            this.$emit('do-enter', this.localQuery, this.localMobileZoomed);
        },
        doEditIntent () {
            this.$emit('do-edit-intent', this.localQuery);
        },
        doDismissIntent (reason) {
            this.$emit('do-dismiss-intent', reason);
        },
        doArrowUpKey () {
            this.$emit('do-arrow-up', this.localQuery);
        },
        doArrowDownKey () {
            this.$emit('do-arrow-down', this.localQuery);
        },
        doSearch (reason) {
            this.doUnzoom();
            this.$emit('do-search', this.localQuery, reason);
        },
        doAutoCollapseResize () {
            if (this.localExpanded && typeof window !== 'undefined' && window.matchMedia('(max-width: ' + this.config.autoCollapseThreshold + 'px)').matches) {
                this.localExpanded = false;
            } else if (!this.localExpanded && typeof window !== 'undefined' && window.matchMedia('(min-width: ' + this.config.autoCollapseThreshold + 'px)').matches) {
                this.localExpanded = true;
            }
        },
        doKeepOnScreen () {
            if (this.historyVisible || this.suggestionsVisible) {
                this.doPositionComboGroup();
            }
        },
        doPositionComboGroup () {
            if (typeof window !== 'undefined') {
                const searchField = this.$refs.searchField;
                const comboGroup = this.$refs.comboGroup;

                //sanity check
                if (searchField === null || comboGroup === null) {
                    return;
                }

                if (typeof window !== 'undefined' && window.matchMedia('(max-width: ' + this.config.autoCollapseThreshold + 'px)').matches) {
                    //reset on small screens - we don’t do the logic there

                    comboGroup.style.position = null;
                    comboGroup.style.overflowX = null;
                    comboGroup.style.overflowY = null;
                    comboGroup.style.top = null;
                    comboGroup.style.right = null;
                    comboGroup.style.bottom = null;
                    comboGroup.style.left = null;
                    comboGroup.style.height = null;
                    comboGroup.style.width = null;
                    comboGroup.style.webkitOverflowScrolling = null;

                    if (this.zoomable && (this.suggestionsPending || this.historyPending)) {
                        document.querySelector('body').classList.add('access-lock-position');
                    }

                    return;
                }

                //trigger
                const tempTrigger = searchField.getBoundingClientRect();
                const trigger = {
                    left: tempTrigger.left,
                    top: tempTrigger.top,
                    right: tempTrigger.left + tempTrigger.width,
                    bottom: tempTrigger.top + tempTrigger.height,
                    width: tempTrigger.width,
                    height: tempTrigger.height
                };

                if (tempTrigger.width === 0) {
                    return;
                }

                //reset
                comboGroup.style.position = 'fixed';
                comboGroup.style.overflowX = 'hidden';
                comboGroup.style.overflowY = 'hidden';
                comboGroup.style.top = 'auto';
                comboGroup.style.right = 'auto';
                comboGroup.style.bottom = 'auto';
                comboGroup.style.left = 'auto';
                comboGroup.style.height = 'auto';
                comboGroup.style.width = tempTrigger.width + 'px';
                comboGroup.style.webkitOverflowScrolling = 'touch';

                let scale;

                //viewport
                const viewport = {
                    width: (window.clientWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth),
                    height: (window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight)
                };

                if (window.innerWidth > document.documentElement.clientWidth) {
                    scale = 1 / (document.body.clientWidth / (window.innerWidth - this.scrollSize));
                } else {
                    scale = 1 / (document.body.clientWidth / window.innerWidth);
                }

                scale = parseFloat(scale.toFixed(2));
                viewport.width = viewport.width * scale;
                viewport.height = viewport.height * scale;

                if (!this.isPointWithinViewport(trigger.left, trigger.top, viewport) &&
                    !this.isPointWithinViewport(trigger.left + trigger.width, trigger.top, viewport) &&
                    !this.isPointWithinViewport(trigger.left, trigger.top + trigger.height, viewport) &&
                    !this.isPointWithinViewport(trigger.left + trigger.width, trigger.top + trigger.height, viewport)
                ) {
                    this.doDismissIntent('search field out of view');

                    return;
                }

                const body = {
                    width: comboGroup.clientWidth,
                    widthO: comboGroup.clientWidth + this.plusLeft + this.plusRight,
                    widthOS: comboGroup.clientWidth + this.plusLeft + this.plusRight + (this.isScrollOuter ? this.scrollSize : 0),
                    height: comboGroup.clientHeight,
                    heightO: comboGroup.clientHeight + this.plusTop + this.plusBottom,
                    heightOS: comboGroup.clientHeight + this.plusTop + this.plusBottom + (this.isScrollOuter ? this.scrollSize : 0)
                };

                if (body.widthOS >= viewport.width && body.heightOS >= viewport.height) {
                    comboGroup.style.left = this.plusLeft + 'px';
                    comboGroup.style.right = this.plusRight + 'px';
                    comboGroup.style.top = this.plusTop + 'px';
                    comboGroup.style.bottom = this.plusBottom + 'px';
                    comboGroup.style.overflowX = 'auto';
                    comboGroup.style.overflowY = 'auto';

                    return;
                }

                if (body.widthOS >= viewport.width) {
                    comboGroup.style.left = this.plusLeft + 'px';
                    comboGroup.style.right = this.plusRight + 'px';
                    comboGroup.style.top = this.plusTop + ((viewport.height - body.heightOS) / 2) + 'px';
                    comboGroup.style.overflowX = 'auto';
                    comboGroup.style.overflowY = 'hidden';

                    return;
                }

                if (body.heightOS >= viewport.height) {
                    comboGroup.style.top = this.plusTop + 'px';
                    comboGroup.style.bottom = this.plusBottom + 'px';
                    comboGroup.style.left = this.plusLeft + ((viewport.width - body.widthOS) / 2) + 'px';
                    comboGroup.style.overflowX = 'hidden';
                    comboGroup.style.overflowY = 'auto';

                    return;
                }

                let left, top;

                //Left Bottom
                if (trigger.bottom + body.heightOS < viewport.height) {
                    top = this.plusTop + trigger.bottom;
                    top = top < this.plusTop ? this.plusTop : top;

                    left = this.plusLeft + trigger.left;
                    left = left < this.plusLeft ? this.plusLeft : left;

                    comboGroup.style.top = top + 'px';
                    comboGroup.style.left = left + 'px';

                    return;
                }

                //Left Bottom Scroll
                if (this.config.comboGroupMinHeight !== false &&
                    viewport.height - trigger.bottom - this.plusTop > this.config.comboGroupMinHeight
                ) {
                    top = this.plusTop + trigger.bottom;
                    top = top < this.plusTop ? this.plusTop : top;

                    left = this.plusLeft + trigger.left;
                    left = left < this.plusLeft ? this.plusLeft : left;

                    comboGroup.style.height = (viewport.height - top - this.plusBottom) + 'px';
                    comboGroup.style.overflowX = 'hidden';
                    comboGroup.style.overflowY = 'auto';

                    comboGroup.style.top = top + 'px';
                    comboGroup.style.left = left + 'px';

                    return;
                }

                //Left Top (+scroll in extra cases)
                if (trigger.top - body.heightOS >= -this.config.comboGroupMinHeight) {
                    top = trigger.top - body.height - this.plusBottom;
                    top = top < this.plusTop ? this.plusTop : top;

                    left = trigger.left + this.plusLeft;
                    left = left < this.plusLeft ? this.plusLeft : left;

                    if (trigger.top - body.heightOS < 0) {
                        comboGroup.style.height = trigger.top - this.plusTop - this.plusBottom + 'px';
                        comboGroup.style.overflowX = 'hidden';
                        comboGroup.style.overflowY = 'auto';
                    }

                    comboGroup.style.top = top + 'px';
                    comboGroup.style.left = left + 'px';
                }
            }
        },
        doRemoveZoomedInlineStyle () {
            if (this.zoomable) {
                const searchContainer = this.$refs.expandPanel;
                const fieldPlaceholder = this.$refs.searchFieldPlaceholder;
                searchContainer.removeAttribute('style');
                fieldPlaceholder.removeAttribute('style');
                document.querySelector('body').classList.remove('access-lock-position');
            }
        },
        doCalculateZoomedPosition () {
            if (this.zoomable) {
                const searchContainer = this.$refs.expandPanel;
                const fieldPlaceholder = this.$refs.searchFieldPlaceholder;

                const h = searchContainer.getBoundingClientRect().height;
                fieldPlaceholder.style.height = h + 'px';

                const t = searchContainer.getBoundingClientRect().top;
                searchContainer.style.top = -h + 'px';
                searchContainer.style.transform = 'translateY(' + (-(t - h)) + 'px)';

                document.querySelector('body').classList.add('access-lock-position');
            }
        }
    },
    created () {
        this.delayedSignificantKeyUp = debounce(this.doEditIntent, this.config.delaySignificantKeyUp, TRAILING);

        this.delayedArrowUpKey = debounce(this.doArrowUpKey, this.config.delayArrowUpKey, LEADING);
        this.delayedArrowDownKey = debounce(this.doArrowDownKey, this.config.delayArrowDownKey, LEADING);
        this.delayedEnterKey = debounce(this.doEnterKey, this.config.delayEnterKey, LEADING);

        this.delayedDismissIntent = debounce(this.doDismissIntent, this.config.delayDismissIntent, LEADING);
        this.delayedAutoSubmit = debounce(this.doAutoSubmit, this.config.delayAutoSubmit, TRAILING);

        this.delayedFocusExpandButton = debounce(this.doFocusExpandButton, this.config.delayFocusExpandButton, TRAILING);
        this.delayedFocusSearchField = debounce(this.doFocusSearchField, this.config.delayFocusSearchField, TRAILING);

        if (typeof window !== 'undefined' && this.expandable && this.autoCollapse) {
            this.boundAutoCollapseResize = this.doAutoCollapseResize.bind(this);
            this.delayedAutoCollapseResize = debounce(this.boundAutoCollapseResize, this.config.delayResize, TRAILING);
            window.addEventListener('resize', this.delayedAutoCollapseResize);
        }

        if (typeof window !== 'undefined' && (this.config.historyEnabled || this.config.suggestionsEnabled)) {
            this.boundKeepOnScreenResize = this.doKeepOnScreen.bind(this);
            this.delayedKeepOnScreenResize = debounce(this.boundKeepOnScreenResize, this.config.delayKeepOnScreen, TRAILING);
            window.addEventListener('resize', this.delayedKeepOnScreenResize);

            this.boundKeepOnScreenScroll = this.doKeepOnScreen.bind(this);
            this.delayedKeepOnScreenScroll = debounce(this.boundKeepOnScreenScroll, this.config.delayKeepOnScreen, TRAILING);
            window.addEventListener('scroll', this.delayedKeepOnScreenScroll);
        }

        this.$on('do-click-history-item', () => {
            //this.$emit('do-click-history-item', idx);

            if (!this.localMobileZoomed) {
                this.doFocusSearchField(); //hyper focus
            }
            this.doUnzoom();
        });

        this.$on('do-click-suggestions-item', () => {
            //this.$emit('do-click-suggestions-item', idx);

            if (!this.localMobileZoomed) {
                this.doFocusSearchField(); //hyper focus
            }
            this.doUnzoom();
        });
    },
    mounted () {
        if (this.scrollSize === null) {
            this.measureScroll();
        }

        //initial rendering
        if (this.expandable && this.autoCollapse) {
            this.doResize();
        }

        //initial rendering
        if (this.config.historyEnabled || this.config.suggestionsEnabled) {
            this.doPositionComboGroup();
        }

        this.comboGroupScrollPane = zenscroll.createScroller(this.$refs.comboGroup);
    },
    beforeDestroy () {
        if (typeof window !== 'undefined' && this.delayedAutoCollapseResize !== null) {
            window.removeEventListener('resize', this.delayedAutoCollapseResize);
            this.delayedAutoCollapseResize = null;
        }
        if (typeof window !== 'undefined' && this.delayedKeepOnScreenResize !== null) {
            window.removeEventListener('resize', this.delayedKeepOnScreenResize);
            this.delayedKeepOnScreenResize = null;
        }
        if (typeof window !== 'undefined' && this.delayedKeepOnScreenScroll !== null) {
            window.removeEventListener('scroll', this.delayedKeepOnScreenScroll);
            this.delayedKeepOnScreenScroll = null;
        }
    },
    components: {
        AccessSearchHistory, AccessSearchSuggestions
    }
};
</script>
<style lang="scss">
@keyframes spin {
    0% {
        transform: rotate(0deg)
    }

    to {
        transform: rotate(359deg)
    }
}
.access-spin {
    animation: spin 2s infinite linear
}

.access-field,
.access-field *,
.access-field *::before,
.access-field *::after {
    box-sizing: border-box
}

.access-field {
    margin-bottom: 1rem
}

.access-field-input[type='search'] {
    box-sizing: border-box;
    -webkit-appearance: textfield
}

.access-field-input[type='search']::-webkit-search-cancel-button,
.access-field-input[type='search']::-webkit-search-decoration {
    -webkit-appearance: none
}

[data-field-inlay-items='1'] .access-field-input {
    padding-right: 2.75rem
}

[data-field-inlay-items='2'] .access-field-input {
    padding-right: 5.25rem
}

[data-field-inlay-items='3'] .access-field-input {
    padding-right: 7.75rem
}

[data-field-inlay-items='4'] .access-field-input {
    padding-right: 10.25rem
}

[data-field-inlay-items='5'] .access-field-input {
    padding-right: 12.75rem
}

.access-fieldset-legend,
.access-field-input {
    line-height: 1.25rem;
}

.access-field-header {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
}

.access-field-input {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-color: #fff;
    border-radius: 0;
    border: .0625rem solid #757575;
    color: #232323;
    font-size: 1rem;
    font-weight: 300;
    overflow: hidden;
    padding: .5625rem 1rem;
    text-overflow: ellipsis;
    width: 100%
}

.access-field-input::-ms-clear {
    height: 0;
    width: 0;
}

.access-field-label {
    color: #353535;
    display: inline-block;
    font-size: .875rem;
    font-size: .875rem;
    font-weight: 500;
    line-height: 1.125rem;
    margin-bottom: .25rem;
}

.access-field-label.access-field-label-hidden {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    -webkit-clip-path: inset(50%);
    clip-path: inset(50%);
    height: .0625rem;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.access-field-errored .access-field-input {
    border-color: #e5202e;
    outline-color: #e5202e;
    outline-width: .0625rem;
    outline-style: solid
}

.access-field-input[readonly] {
    background-color: #ededed;
    border-color: #bfbfbf
}

.access-field-input[readonly]::-webkit-input-placeholder {
    color: #232323
}

.access-field-input[readonly]::-moz-placeholder {
    color: #232323
}

.access-field-input[readonly]:-ms-input-placeholder {
    color: #232323
}

.access-field-input[readonly]::-ms-input-placeholder {
    color: #232323
}

.access-field-input[readonly]::placeholder {
    color: #232323
}

.access-field-input[readonly]:-ms-input-placeholder {
    color: #232323
}

.access-field-error {
    color: #e5202e;
    font-size: .875rem;
    line-height: 1.125rem;
    margin-top: .25rem
}

.access-field-container {
    position: relative
}

.access-field-container .access-suggest {
    background-color: #fff;
    border-top: 0;
    box-shadow: 0 .25rem .75rem 0 rgba(0, 0, 0, 0.25);
    left: 0;
    overflow-y: auto;
    position: absolute;
    right: 0;
    width: 100%;
    z-index: 1040
}

@media (max-width: 75rem) {
    .access-field-container .access-suggest {
        max-height: 18.75rem
    }
}

.access-field-container .access-suggest-container {
    border-top: 0
}

.access-field-body {
    display: flex;
    flex-direction: row;
    position: relative
}

.access-field-prefix,
.access-field-suffix {
    display: flex;
    flex-basis: auto;
    flex-grow: 0;
    flex-shrink: 1
}

.access-field-content {
    flex-basis: auto;
    flex-grow: 1;
    flex-shrink: 1;
    position: relative
}

.access-field-inlay {
    align-items: center;
    bottom: 0;
    display: flex;
    margin-right: .25rem;
    position: absolute;
    right: 0;
    top: 0
}

.access-field-inlay .access-field-icon {
    line-height: unset;
    margin-left: 0;
    margin-right: 0;
    width: 2rem
}

.access-field-button,
.access-field-icon {
    color: #474747;
    font-size: 1rem;
    margin-left: .5rem;
    padding: 0;
    width: 2rem;
}

.access-field-button {
    background: none;
    border: 0;
    height: 100%;
    z-index: 1044
}

.access-field-button:hover {
    cursor: pointer
}

.access-field-button:focus {
    outline-color: #000;
    outline-offset: 0;
    outline-style: solid;
    outline-width: .125rem
}

.access-field-button[disabled],
.access-field-button[disabled]:focus,
.access-field-button[disabled]:hover {
    color: #bfbfbf;
    cursor: not-allowed
}

.access-field-meta {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    -webkit-clip-path: inset(50%);
    clip-path: inset(50%);
    height: .0625rem;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px
}

.access-field-input:hover,
.access-field-input-is-hovered .access-field-input {
    border-color: #005b92;
    outline-color: #005b92;
    outline-offset: 0;
    outline-style: solid;
    outline-width: .0625rem
}

.access-field-input:focus,
.access-field-input:focus:hover,
.access-field-input-is-focused .access-field-input {
    border-color: #000;
    outline-color: #000;
    outline-offset: 0;
    outline-style: solid;
    outline-width: .0625rem;
}

fieldset[disabled] .access-field-label,
fieldset[disabled] .access-field-icon,
.access-field-is-disabled .access-field-label,
.access-field-is-disabled .access-field-icon {
    color: #a3a3a3;
    cursor: not-allowed
}

fieldset[disabled] .access-field-input,
fieldset[disabled] .access-field-input:focus,
fieldset[disabled] .access-field-input:hover,
fieldset[disabled] .access-field-input-is-focused .access-field-input,
fieldset[disabled] .access-field-input-is-hovered .access-field-input,
.access-field-input[disabled],
.access-field-input[disabled]:focus,
.access-field-input[disabled]:hover,
.access-field-is-disabled.access-field-input-is-focused .access-field-input,
.access-field-is-disabled.access-field-input-is-hovered .access-field-input,
.access-field-is-disabled .access-field-input:focus,
.access-field-is-disabled .access-field-input:hover,
.access-field-is-disabled .access-field-input {
    border-color: #dadada;
    box-shadow: none;
    color: #bfbfbf;
    cursor: not-allowed;
    outline-width: 0
}

fieldset[disabled] .access-field-input::placeholder,
fieldset[disabled] .access-field-input:focus::placeholder,
fieldset[disabled] .access-field-input:hover::placeholder,
fieldset[disabled] .access-field-input-is-focused .access-field-input::placeholder,
fieldset[disabled] .access-field-input-is-hovered .access-field-input::placeholder,
.access-field-input[disabled]::placeholder,
.access-field-input[disabled]:focus::placeholder,
.access-field-input[disabled]:hover::placeholder,
.access-field-is-disabled.access-field-input-is-focused .access-field-input::placeholder,
.access-field-is-disabled.access-field-input-is-hovered .access-field-input::placeholder,
.access-field-is-disabled .access-field-input:focus::placeholder,
.access-field-is-disabled .access-field-input:hover::placeholder,
.access-field-is-disabled .access-field-input::placeholder {
    color: #bfbfbf
}

input::-ms-clear,
input::-ms-reveal {
    display: none
}

.access-search-field {
    &.field-has-text,
    &.loading {
        .access-field-input {
            //submit button + clear button OR loading icon + space on right
            padding-right: 2 * (2rem + 0.5rem) + 1rem;
        }
    }

    &.field-has-text.loading {
        .access-field-input {
            //submit button + clear button + loading icon + space on right
            padding-right: 3 * (2rem + 0.5rem) + 1rem;
        }
    }
}

.access-suggest,
.access-suggest *,
.access-suggest *::before,
.access-suggest *::after {
  box-sizing: border-box;
}

.access-suggest-container {
  background-color: #fff;
  border: 0.0625rem solid #bfbfbf;
}

.access-suggest-item-container {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-suggest-group {
  margin: 0;
  margin-block: 0;
}

.access-suggest-item {
    margin: 0;
    &:hover {
        cursor: pointer;
    }
}

.access-suggest-item-wrapper,
.access-suggest-title {
  margin: 0;
  padding: 0.5rem 1rem;
}

.access-suggest-item-wrapper {
  color: #232323;
  font-weight: 300;
}

.access-suggest-item-is-hovered {
  background-color: #ededed;
}

.access-suggest-item-is-focused {
  outline-color: #000;
  outline-offset: 0;
  outline-style: solid;
  outline-width: 0.125rem;
}

.access-suggest-icon {
  color: #757575;
  margin-right: 0.5rem;
}

.access-suggest-text {
  color: #474747;
}

.access-suggest-title {
  color: #648d18;
  font-size: 13px;
}

.access-suggest-title.access-suggest-title-hidden {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  -webkit-clip-path: inset(50%);
  clip-path: inset(50%);
  height: 0.0625rem;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
