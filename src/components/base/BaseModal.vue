<template>
    <div class="episode-dialog" v-if="modalOpen">
        <div class="episode-dialog-overlay" @click="closeDialog"></div>
        <div class="episode-dialog-content">
            <div class="episode-dialog-inner">
                <div class="episode-dialog-header">
                    <slot name="header" />
                </div>
                <div class="episode-dialog-body">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
    
<script lang="ts" setup>
import { defineEmits } from 'vue';
import {modalOpen} from '../../composables/useModal';
let emit = defineEmits(['close']);
const closeDialog = () => {
    emit('close',{data: 'test'});
};
</script>
    
<style scoped lang="scss">
.episode-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9;

    .episode-dialog-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(14, 14, 14, 0.5);
        backdrop-filter: blur(3rem);
        inset: 0;
        cursor: pointer;
    }

    .episode-dialog-content {
        background-color: #040d13;
        border: .125rem solid #081c28;
        color: #fff;
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 99;
        min-width: 30rem;
        max-width: 50rem;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        min-height: 20rem;
        max-height: 35rem;

        @media screen and (max-width: 840px) {
            min-width: 20rem;
            max-width: 40rem;
        }

        @media screen and (max-width: 640px) {
            min-width: calc(100% - 2rem);
            max-width: calc(100% - 2rem);
        }

        .episode-dialog-inner {
            padding: 1rem 2rem;

            @media screen and (max-width: 840px) {
                padding: 1rem;
            }

            @media screen and (max-width: 640px) {
                padding: 0.5rem;
            }

            .episode-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;

                h2 {
                    font-size: 1.5rem;
                    font-weight: 500;
                }

                .episode-dialog-close {
                    border: none;
                    background-color: transparent;
                    font-size: 2rem;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;

                    &:hover {
                        color: #b30000;
                    }
                }
            }

            .episode-dialog-body {
                display: grid;
                grid-template-columns: 30% 70%;
                grid-gap: 1rem;

                @media screen and (max-width: 840px) {
                    grid-template-columns: 1fr;
                }


                .episode-poster {
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 0.5rem;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    }

                    @media screen and (max-width: 840px) {
                        display: none;
                    }
                }

                .episode-grid {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: flex-start;

                    h3 {
                        font-size: 1.5rem;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        line-height: 0;
                    }

                    ul {
                        width: 100%;
                        height: 100%;
                        overflow-y: auto;
                        padding: 0 1rem 0 0;
                        margin: .25rem 0;
                        list-style-type: none;
                        overflow-x: hidden;
                        overflow-y: auto;
                        max-height: 20rem;
                        padding-right: 1rem;

                        &::-webkit-scrollbar {
                            width: 0.5rem;
                        }

                        &::-webkit-scrollbar-track {
                            background-color: #081c28;
                        }

                        &::-webkit-scrollbar-thumb {
                            background-color: #f1b722;
                            border-radius: 0.5rem;
                        }




                        li {
                            padding: 0.5rem 1rem;
                            border-radius: 0.5rem;
                            background-color: #f1b722;
                            color: #000;
                            margin: 0.5rem 0;
                            cursor: pointer;
                            transition: all 0.2s ease-in-out;

                            &:hover {
                                background-color: #9a6e00;
                                color: #fff;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
    