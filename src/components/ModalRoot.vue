<template>
    <div>
        <teleport to="body">
            <BaseModal @close="handleCloseModal">
                <template v-if="modalTitle" #header>
                    <h3>{{ modalTitle }}</h3>
                </template>
                <component :is="compRef" :data="modalOptions"></component>
            </BaseModal>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import BaseModal from './base/BaseModal.vue'
import {closeModal, compRef, modalTitle, modalOptions} from '../composables/useModal';

const handleCloseModal = (evt: any) => {
    closeModal(evt);
}
</script>

<style scoped></style>