<template>
    <div class="access-search-results" v-bind:class="resultsClasses">
        <slot name="loading" v-if="loading">
            <span class="access-field-icon access-spin icon-spinner" aria-hidden="true"></span>
            Loading...
        </slot>
        <slot name="results-error" v-else-if="resultsError !== ''" :resultsError="resultsError">
            <div class="page-error page-error-small access-search-results-error">
                <div class="page-error-icon icon-caution" icon-type="filled" aria-hidden="true"></div>
                <h1 class="page-error-heading">Sorry!</h1>
                <p class="page-error-message">{{ resultsError }}</p>
                <p class="page-error-text">Try refreshing your browser.</p>
            </div>
        </slot>

        <slot name="before-search" v-else-if="pristine &amp;&amp; resultsData.length &lt; 1" :initSearchMessage="initSearchMessage">
            <div class="page-error page-error-small access-search-results-no-results">
                <div class="page-error-icon icon-search" aria-hidden="true"></div>
                <h1 class="page-error-heading">Ready, set, search!</h1>
                <p class="page-error-message">{{ initSearchMessage }}</p>
            </div>
        </slot>
        <slot name="no-results" v-else-if="!pristine &amp;&amp; resultsData.length &lt; 1" :noResultsMessage="noResultsMessage">
            <div class="page-error page-error-small access-search-results-no-results">
                <div class="page-error-icon icon-search" aria-hidden="true"></div>
                <h1 class="page-error-heading">No results found.</h1>
                <p class="page-error-message">We couldn't find what you are looking for.</p>
                <p class="page-error-text">{{ noResultsMessage }}</p>
            </div>
        </slot>
        <div v-else-if="resultsData.length &gt; 0">
            <div class="access-pagination-bar" v-if="results.meta">
                <slot name="pagination" :meta="results.meta" :sid="sid + 'resuls-page-no'"></slot>
            </div>
            <div class="access-results-group">
                <div v-for="(val, idx) in resultsData" :key="sid + '-result-item-' + idx" class="access-result-item-container">
                    <slot :sid="sid" :val="val" :idx="idx">
                        <article class="access-result-item">
                            <div class="document-match">
                                <h1 class="access-result-title" v-if="val.title">{{ val.title }}</h1>
                                <p class="access-result-snippit" v-if="val.excerpts && Array.isArray(val.excerpts)">{{ val.excerpts[0] }}</p>
                            </div>
                        </article>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

/**
 * The search results collection
 * @module AccessSearchResults
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchResults',
    mixins: [AccessSearchControlMixin],
    props: {
        initSearchMessage: {
            required: false,
            type: String,
            default: 'You can search for topics, explanations, and regulations.'
        },
        noResultsMessage: {
            required: false,
            type: String,
            default: 'Please try to run a different search. You can search for topics, explanations, regulations, and many more.'
        },
        results: {
            required: true,
            type: [Object, Array]
        },
        resultsError: {
            required: true,
            type: String,
            default: ''
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
        pristine: {
            required: true,
            type: Boolean
        },
        sid: {
            required: true,
            type: String
        }
    },
    data () {
        return {
            fieldType: '-search-results'
        };
    },
    computed: {
        resultsData () {
            if (Array.isArray(this.results)) {
                return this.results;
            }
            if (this.results.data) {
                return this.results.data;
            }
            return [];
        },
        resultsClasses () {
            return {
                pristine: this.pristine === true,
                dirty: this.pristine !== true
            };
        }
    }
};
</script>
