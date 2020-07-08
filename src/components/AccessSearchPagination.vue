<template>
    <ul class="access-search-pagination" v-if="meta">
        <li class="access-search-pagination-item access-search-pagination-item-previous-page">
            <slot :pageNo="currentPageNo - 1"
                  name="prev"
                  :hiddenText="textPrev + ' ' + textPage"
                  :disabled="isPrevDisabled"
                  :goTo="goTo">
                <a href="#" class="access-search-pagination-link" @click.prevent="goTo(currentPageNo - 1)"
                   :class="{'access-search-pagination-link-is-disabled': isPrevDisabled}">
                  <span class="sr-only">{{textPrev}} <span>{{textPage}}</span></span>
                </a>
            </slot>
        </li>

        <li class="access-search-pagination-item access-search-pagination-item-range" v-if="separateFirstPage"
            :class="{'access-search-pagination-item-is-active': currentPageNo === 0}"
            :aria-current="currentPageNo === 0 ? 'page' : ''">
            <slot :pageNo="0"
                  name="first"
                  :isActive="currentPageNo === 0"
                  :hiddenText="textPage"
                  text="1"
                  :goTo="goTo">
                <a class="access-search-pagination-link" href="#" @click.prevent="goTo(0)"
                   :aria-current="currentPageNo === 0 ? 'page' : null">
                    <span class="sr-only">{{textPage}} </span>1
                </a>
            </slot>
        </li>
        <li class="access-search-pagination-item access-search-pagination-item-range access-search-pagination-ellipsis" v-if="leftGap" >...</li>

        <li class="access-search-pagination-item access-search-pagination-item-range" v-for="page in pagesRange" :key="page.pageNo"
            :class="{'access-search-pagination-item-is-active': page.isActive}"
            :aria-current="page.isActive ? 'page' : ''">
            <slot :pageNo="page.pageNo"
                  name="default"
                  :isActive="page.isActive"
                  :text="page.text"
                  :goTo="goTo">
                <a class="access-search-pagination-link" href="#" @click.prevent="goTo(page.pageNo)"
                   :aria-current="page.isActive ? 'page' : null">
                    <span class="sr-only">{{textPage}} </span>{{ page.text }}
                </a>
            </slot>
        </li>

        <li class="access-search-pagination-item access-search-pagination-item-range access-search-pagination-ellipsis" v-if="rightGap" >...</li>
        <li class="access-search-pagination-item access-search-pagination-item-range" v-if="separateLastPage"
            :class="{'access-search-pagination-item-is-active': currentPageNo === lastPageNo}"
            :aria-current="currentPageNo === lastPageNo ? 'page' : null">
            <slot :pageNo="lastPageNo"
                  name="last"
                  :isActive="currentPageNo === lastPageNo"
                  :hiddenText="textPage"
                  :text="lastPageNo + 1"
                  :goTo="goTo">
                <a class="access-search-pagination-link" href="#" @click.prevent="goTo(lastPageNo)"
                   :aria-current="currentPageNo === lastPageNo ? 'page' : null">
                    <span class="sr-only">{{textPage}} </span>{{lastPageNo + 1}}
                </a>
            </slot>
        </li>

        <li class="access-search-pagination-item access-search-pagination-item-next-page">
            <slot :pageNo="currentPageNo + 1"
                  name="next"
                  :hiddenText="textNext + ' ' + textPage"
                  :disabled="isNextDisabled"
                  :goTo="goTo">
                <a href="#" class="access-search-pagination-link" @click.prevent="goTo(currentPageNo + 1)"
                   :class="{'access-search-pagination-link-is-disabled': isNextDisabled}">
                    <span class="sr-only">{{textNext}} <span>{{textPage}}</span>
                  </span>
                </a>
            </slot>
        </li>
    </ul>
</template>
<script>
'use strict';

import AccessSearchControlMixin from './AccessSearchControlMixin';

const LEFT_MARGIN = 1;
const RIGHT_MARGIN = 1;
const MIN_FIRST_RANGE = 3;

/**
 * A search pagination
 * @module AccessSearchPagination
 * @mixes AccessSearchControlMixin
 */
export default {
    name: 'AccessSearchPagination',
    mixins: [AccessSearchControlMixin],
    props: {
        meta: {
            type: Object,
            required: true
        },
        textPage: {
            type: String,
            default: 'page'
        },
        textPrev: {
            type: String,
            default: 'Previous'
        },
        textNext: {
            type: String,
            default: 'Next'
        }
    },
    computed: {
        isPrevDisabled () {
            return this.meta.offset === 0;
        },
        isNextDisabled () {
            return this.currentPageNo >= this.lastPageNo;
        },
        separateFirstPage () {
            const currentPageNo = this.currentPageNo;
            return currentPageNo > LEFT_MARGIN;
        },
        leftGap () {
            const currentPageNo = this.currentPageNo;
            if (currentPageNo <= MIN_FIRST_RANGE) return false;
            return currentPageNo > LEFT_MARGIN + 1;
        },
        separateLastPage () {
            const currentPageNo = this.currentPageNo;
            const lastPageNo = this.lastPageNo;
            return lastPageNo - currentPageNo > RIGHT_MARGIN;
        },
        rightGap () {
            const currentPageNo = this.currentPageNo;
            const lastPageNo = this.lastPageNo;
            return currentPageNo < lastPageNo - RIGHT_MARGIN - 2;
        },
        currentPageNo () {
            return Math.floor(this.meta.offset / this.meta.limit);
        },
        lastPageNo () {
            //https://stackoverflow.com/questions/39670902/pagination-calculation-algorithm
            const last = Math.ceil(this.meta.count / this.meta.limit) - 1;
            return last < 0 ? 0 : last;
        },
        firstRangePage () {
            if (this.currentPageNo <= MIN_FIRST_RANGE) {
                return this.currentPageNo <= 1 ? 0 : 1;
            }
            return this.currentPageNo - LEFT_MARGIN;
        },
        lastRangePage () {
            const value = this.currentPageNo + RIGHT_MARGIN;
            if (value < MIN_FIRST_RANGE) {
                return MIN_FIRST_RANGE;
            }
            if (value === this.lastPageNo - RIGHT_MARGIN - 1) {
                return value + 1;
            }
            return value;
        },
        pagesRange () {
            const retVal = [];

            const currentPageNo = this.currentPageNo;
            const lastPageNo = this.lastPageNo;
            for (let pageNo = this.firstRangePage; pageNo <= this.lastRangePage; pageNo++) {
                if (pageNo < 0) continue;
                if (pageNo > lastPageNo) break;

                retVal.push({
                    pageNo: pageNo,
                    text: pageNo + 1,
                    isActive: pageNo === currentPageNo
                });
            }

            return retVal;
        }
    },
    data: function () {
        return {
            value: this.request
        };
    },
    watch: {
        request () {
            this.value = this.request;
        }
    },
    methods: {
        goTo (pageNo) {
            this.$emit('do-offset', pageNo * this.meta.limit);
        }
    }
};
</script>

<style lang='scss'>
.access-search-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    //overflow: hidden; //prevents outline
    padding-left: 0;
    position: relative;
    height: 2rem;
}

.access-search-pagination-item {
    //background-color: #f7f7f7;
    //border: 1px solid #bbbbbb;
    //border-right-width: 0;
    list-style: none;
    //overflow: hidden; //prevents outline

    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 3rem;
}
.access-search-pagination-item:last-child {
    //border-right-width: 1px;
}

.access-search-pagination-link {
    //color: #464646;

    width: 100%;
    min-width: 3rem;

    text-align: center;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    vertical-align: middle;

    text-decoration: none;
}
.access-search-pagination-link:hover {
    //background-color: #dddddd;
}

.access-search-pagination-link-is-disabled {
    //background-color: #ffffff;
}

@media (max-width: 55em) {
    .access-search-pagination-item-previous-page {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }
}

.access-search-pagination-item-previous-page:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.access-search-pagination-item-previous-page .access-search-pagination-link {
    position: relative;
}
.access-search-pagination-item-previous-page .access-search-pagination-link::before {
    //border-bottom: 8px solid transparent;
    //border-top: 8px solid transparent;
    //border-right: 12px solid #464646;
    content: '';
    display: block;
}

.access-search-pagination-item-previous-page .access-search-pagination-link-is-disabled {
    pointer-events: none;
}
.access-search-pagination-item-previous-page .access-search-pagination-link-is-disabled::before {
    //border-right-color: #bbbbbb;
}

@media (max-width: 55em) {
    .access-search-pagination-item-next-page {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        border-right-width: 1px;
    }
}

@media (max-width: 55em) {
    .access-search-pagination-item-range {
        display: none;
    }
}

.access-search-pagination-item-next-page:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

.access-search-pagination-item-next-page .access-search-pagination-link {
    position: relative;
}
.access-search-pagination-item-next-page .access-search-pagination-link::before {
    //border-bottom: 8px solid transparent;
    //border-top: 8px solid transparent;
    //border-right: 12px solid #464646;
    content: '';
    display: block;
    transform: rotate(180deg);
}

.access-search-pagination-item-next-page .access-search-pagination-link-is-disabled {
    pointer-events: none;
}
.access-search-pagination-item-next-page .access-search-pagination-link-is-disabled::before {
    //border-right-color: #bbbbbb;
}

.access-search-pagination-item-is-active {
    //background-color: #e00000;
    //color: #ffffff;
}
.access-search-pagination-item-is-active .access-search-pagination-link {
    //color: #ffffff;
}
.access-search-pagination-item-is-active .access-search-pagination-link:hover {
    //background-color: #a51323;
}
.access-search-pagination-item-is-active .access-search-pagination-link::before, .access-search-pagination-item-is-active .access-search-pagination-link::after {
    //border-right-color: #ffffff;
}
.sr-only {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}
</style>
