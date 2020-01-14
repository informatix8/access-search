<template>
    <div id="app">
        <header class="header">
            <div class="header-container">
                <access-search-field
                    field-placeholder="Search Documents"
                    clear-field-aria-label="Clear search field"
                    field-label="Legal Documents"
                    submit-label="Submit"

                    :config="smEpsilon.config"
                    :stateService="smEpsilon.stateService"
                    :request="smEpsilon.request"
                    :response="smEpsilon.response"
                    :sid="smEpsilon.sid"
                    :expandable="false"
                    :expanded="false"
                    v-on="handlers">
                    <template v-slot:history-item="slotProps">
                        <access-search-history-item :sid="slotProps.sid"
                                                :dt-id="slotProps.dtId"
                                                :id="slotProps.id"
                                                :idx="slotProps.idx"
                                                :result="slotProps.result"
                                                :focused-item="slotProps.focusedItem"
                                                :val="slotProps.val" />
                    </template>
                    <template v-slot:suggestions-item="slotProps">
                        <access-search-suggestions-item :sid="slotProps.sid"
                                                    :result="slotProps.result"
                                                    :focused-item="slotProps.focusedItem"
                                                    :group="slotProps.group" />
                    </template>
                    <span slot="loading" class="access-field-icon access-spin icon-spinner" aria-hidden="true"></span>
                </access-search-field>

                <div role="group" class="access-field access-field-horizontal-choices" aria-labelledby="id-yEQ3dk">
                    <div class="access-field-header">
                        <label class="access-field-label" id="id-yEQ3dk">Future Accountability Agent</label>
                    </div>
                    <access-search-check-list :config="smEpsilon.config.checkBoxOptions"
                                         :request="smEpsilon.request.checkBox"
                                         :visuallyHidden="false"
                                         name="checkBox"
                                         :sid="smEpsilon.sid + 'checkBox'"
                                         @input="handlers.check('checkBox', $event)" >
                        <template slot="default" slot-scope="slotProps">
                            <label class="access-field-choice-label">
                                <input type="checkbox" class="access-field-choice"
                                       @change="slotProps.change"
                                       :name="slotProps.fieldName"
                                       :value="slotProps.value"
                                       :checked="slotProps.checked[slotProps.value]" />
                                <span class="access-field-choice-text">Overridden by slot {{slotProps.text}}</span>
                            </label>
                        </template>
                    </access-search-check-list>
                </div>

                <div role="group" class="access-field" aria-labelledby="id-yEQ3dk2">
                    <div class="access-field-header">
                        <label class="access-field-label" id="id-yEQ3dk2">Future Accountability Agent</label>
                    </div>
                    <access-search-radio-list :config="smEpsilon.config.includeDefinitionsOptions"
                                         :request="smEpsilon.request.includeDefinitions"
                                         name="includeDefinitions"
                                         :sid="smEpsilon.sid + 'includeDefinitionsOptions'"
                                         @input="handlers.check('includeDefinitions', $event)">
                        <template slot="default" slot-scope="slotProps">
                            <label class="access-field-choice-label">
                                <input type="radio" class="access-field-choice"
                                       @change="slotProps.change"
                                       :name="slotProps.fieldName"
                                       :value="slotProps.value"
                                       :checked="slotProps.checked[slotProps.value]" />
                                <span class="access-field-choice-text">Overridden by slot {{slotProps.text}}</span>
                            </label>

                        </template>
                    </access-search-radio-list>
                </div>
            </div>
        </header>
        <main class="main">
            <div class="main-container">

                <access-search-results
                    v-bind:results="smEpsilon.response.results"
                    v-bind:results-error="smEpsilon.response.resultsError"
                    v-bind:loading="smEpsilon.resultDataService.loading"
                    v-bind:pristine="smEpsilon.resultDataService.pristine"
                    v-bind:sid="smEpsilon.sid">
                    <template v-slot:default="slotProps">
                        <access-search-result-item
                                               :sid="slotProps.sid"
                                               :val="slotProps.val"
                        >
                            <article class="fancy-result">
                                <h1 class="fancy-result-title" v-if="slotProps.val.title" v-html="slotProps.val.title"></h1>
                                <p class="fancy-result-excerpt" v-if="slotProps.val.excerpts && Array.isArray(slotProps.val.excerpts)" v-html="slotProps.val.excerpts[0]"></p>
                            </article>
                        </access-search-result-item>
                    </template>
                    <div slot="loading">
                        <span class="access-field-icon access-spin icon-spinner" aria-hidden="true"></span>
                        Loading...
                    </div>
                    <template v-slot:pagination="slotProps">
                        <nav class="results-nav" v-if="smEpsilon.response.results && smEpsilon.response.results.meta && !smEpsilon.resultDataService.loading">
                            <access-search-page-position
                                class="search-walk"
                                :sid="slotProps.sid + 'page-position'"
                                :meta="slotProps.meta" />
                            <access-search-sorter
                                class="search-walk"
                                v-if="smEpsilon.response.results && smEpsilon.response.results.meta && !smEpsilon.resultDataService.loading"
                                :config="smEpsilon.config"
                                :request="smEpsilon.request"
                                :sid="smEpsilon.sid" />
                            <access-search-limit
                                class="results-nav-sort search-walk"
                                :sid="smEpsilon.sid + 'page-position'"
                                :config="smEpsilon.config"
                                :request="smEpsilon.request"
                                v-on="handlers" />
                            <access-search-pagination
                                class="search-walk"
                                :sid="smEpsilon.sid + 'pagination'"
                                :meta="smEpsilon.response.results.meta"
                                v-on="handlers" >
                                <template v-slot:default="slotParams">
                                    <a class="access-search-pagination-link" href="#"
                                       @click.prevent="slotParams.goTo(slotParams.pageNo)"
                                       :class="{'access-search-pagination-link--is-disabled': slotParams.disabled}"
                                       :aria-current="slotParams.isActive ? 'page' : null">
                                        <span class="visuallyhidden">{{slotParams.hiddenText}}</span> {{ slotParams.text }}
                                    </a>
                                </template>
                            </access-search-pagination>
                        </nav>

                    </template>
                    <template v-slot:results-error="slotProps">
                        <div class="page-error page-error-small access-search-results-error">
                            <div class="page-error-icon icon-caution" icon-type="filled" aria-hidden="true"></div>
                            <h1 class="page-error-heading">Sorry!</h1>
                            <p class="page-error-message">{{ slotProps.resultsError }}</p>
                            <p class="page-error-text">Try refreshing your browser.</p>
                        </div>
                    </template>
                    <template v-slot:before-search="slotProps">
                        <div class="page-error page-error-small access-search-results-no-results">
                            <div class="page-error-icon icon-search" aria-hidden="true"></div>
                            <h1 class="page-error-heading">Ready, set, search!</h1>
                            <p class="page-error-message">{{ slotProps.initSearchMessage }}</p>
                        </div>
                    </template>
                    <template v-slot:no-results="slotProps">
                        <div class="page-error page-error-small access-search-results-no-results">
                            <div class="page-error-icon icon-search" aria-hidden="true"></div>
                            <h1 class="page-error-heading">No results found.</h1>
                            <p class="page-error-message">We couldn't find what you are looking for.</p>
                            <p class="page-error-text">{{ slotProps.noResultsMessage }}</p>
                        </div>
                    </template>
                </access-search-results>

                <nav class="results-nav" v-if="smEpsilon.response.results && smEpsilon.response.results.meta && !smEpsilon.resultDataService.loading">
                    <access-search-page-position
                                class="search-walk"
                        :sid="smEpsilon.sid + 'page-position'"
                        :meta="smEpsilon.response.results.meta" />
                    <access-search-sorter
                        class="search-walk"
                        v-if="smEpsilon.response.results && smEpsilon.response.results.meta && !smEpsilon.resultDataService.loading"
                        :config="smEpsilon.config"
                        :request="smEpsilon.request"
                        :sid="smEpsilon.sid" />
                    <access-search-limit
                        class="results-nav-sort search-walk"
                        :sid="smEpsilon.sid + 'page-position'"
                        :config="smEpsilon.config"
                        :request="smEpsilon.request"
                        v-on="handlers" />
                    <access-search-pagination
                        class="search-walk"
                        :sid="smEpsilon.sid + 'pagination'"
                        :meta="smEpsilon.response.results.meta"
                        v-on="handlers" >
                        <template v-slot:default="slotProps">
                            <a class="access-search-pagination-link" href="#"
                               @click.prevent="slotProps.goTo(slotProps.pageNo)"
                               :class="{'access-search-pagination-link--is-disabled': slotProps.disabled}"
                               :aria-current="slotProps.isActive ? 'page' : null">
                                <span class="visuallyhidden">{{slotProps.hiddenText}}</span> {{ slotProps.text }}
                            </a>
                        </template>
                    </access-search-pagination>
                </nav>

            </div>
        </main>
    </div>
</template>

<script>
'use strict';

import AccessSearchField from '@/components/AccessSearchField.vue';
import AccessSearchResults from '@/components/AccessSearchResults.vue';
import AccessSearchResultItem from '@/components/AccessSearchResultItem.vue';
import AccessSearchHistoryItem from '@/components/AccessSearchHistoryItem.vue';
import AccessSearchSuggestionsItem from '@/components/AccessSearchSuggestionsItem.vue';
import AccessSearchPagePosition from '@/components/AccessSearchPagePosition.vue';
import AccessSearchPagination from '@/components/AccessSearchPagination.vue';
import AccessSearchLimit from '@/components/AccessSearchLimit.vue';
import AccessSearchCheckList from '@/components/AccessSearchCheckList.vue';
import AccessSearchRadioList from '@/components/AccessSearchRadioList.vue';
import AccessSearchSorter from '@/components/AccessSearchSorter.vue';

import {SearchBIOS, SearchHistoryDataServiceLocalStorage} from '@informatix8/search-bios';

import SearchResultDataServiceTheta from './search-result-data-service-theta';
import SearchSuggestDataServiceEpsilon from './search-suggest-data-service-epsilon';
import {bindHandlersThroughConsole, bindHandlersToModel} from "./bindHandlersToModel";

export default {
    name: 'app',
    data() {
        const model = new SearchBIOS({
            id: 'epsilon-search-demo',
            request: {
                q: '',
                limit: 25,
                offset: 0,
                sort: 'chronological',
                includeDefinitions: false,
                checkBox: [ 'check2' ]
            },
            config: {
                historyEnabled: true,
                suggestionsEnabled: true,
                limitOptions: [10, 25, 100],
                sortOptions: [
                    { text: 'Most Relevant', value: 'relevancy' },
                    { text: 'Most Recent', value: 'chronological' },
                    { text: 'Most Popular', value: 'popularity' }
                ],
                includeDefinitionsOptions: [
                    { text: 'Include ', value: true },
                    { text: 'Exclude', value: false },
                ],
                checkBoxOptions: [
                    { text: 'Check 1', value: 'check1' },
                    { text: 'Check 2', value: 'check2' },
                    { text: 'Check 3', value: 'check3', visuallyHidden: true },
                ]
            },
            resultDataService: new SearchResultDataServiceTheta(),
            historyDataService: new SearchHistoryDataServiceLocalStorage({ maxHistory: 10 }),
            suggestionsDataService: new SearchSuggestDataServiceEpsilon(),
            stateService: {
                searchPending: false,
                historyPending: false,
                historyVisible: false,
                suggestionsPending: false,
                suggestionsVisible: false,
                mobileZoomed: false
            },
            callbacks: { }
        });

        const handlers = bindHandlersToModel(model);

        return {
            handlers: bindHandlersThroughConsole(handlers),
            smEpsilon: model
        };
    },
    components: {
        AccessSearchSorter, AccessSearchPagePosition, AccessSearchPagination, AccessSearchLimit,
        AccessSearchCheckList, AccessSearchRadioList,
        AccessSearchField, AccessSearchResults, AccessSearchResultItem, AccessSearchHistoryItem, AccessSearchSuggestionsItem
    },
    mounted: function () {
        document.querySelectorAll('.access-field-input')[0].focus();
    }
}
</script>

<style>
    .results-nav {
        display: flex;
        align-items: center;
    }

    .results-nav-sort label {
        display: none;
    }
    .results-nav-sort select {
        display: block;
        height: 2rem;
        min-width: 4rem;
        border: 1px solid #CCC;
        background: #FFF;
        margin-right: 1rem;
    }

    .search-walk {
        flex: 0 1 auto;
        margin-right: 10px;

        &:last-child {
            margin-right: 0;
        }
    }
</style>
