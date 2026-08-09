<script setup lang="ts">
import type { Component } from 'vue';
import { HelpCircle } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  icon?: Component;
  iconBg?: string;
  iconColor?: string;
  confirmBtnBg?: string;
  confirmBtnColor?: string;
  cancelBtnBg?: string;
  cancelBtnColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('cancel')">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <div
            class="modal-icon"
            :class="variant === 'danger' ? 'icon-danger' : 'icon-primary'"
            :style="{
              background: iconBg,
              color: iconColor
            }"
          >
            <component :is="icon || HelpCircle" :size="24" />
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <p class="modal-message">{{ message }}</p>

        <div class="modal-actions">
          <button
            class="btn btn-cancel"
            :style="{
              background: cancelBtnBg,
              color: cancelBtnColor
            }"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </button>
          <button
            class="btn"
            :class="variant === 'danger' ? 'btn-danger' : 'btn-primary'"
            :style="{
              background: confirmBtnBg,
              color: confirmBtnColor
            }"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
$pink: #E01C8E;
$cream: #FBF8F1;
$ink: #2B1B3D;

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 8, 28, 0.75);
  backdrop-filter: blur(5px);
}

.modal-card {
  width: 100%;
  max-width: 24rem;
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: #FBF8F1;
  border: 4px solid $pink;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  color: $ink;
  font-family: 'Nunito', sans-serif;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-primary {
  background: #FCE6F3;
  color: $pink;
}

.icon-danger {
  background: #FDECEC;
  color: #E5484D;
}

.modal-title {
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: $ink;
  margin: 0;
}

.modal-message {
  font-size: 0.9375rem;
  color: #4A3E56;
  line-height: 1.4;
  margin: 0 0 1.5rem 0;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  border: none;
  border-radius: 9999px;
  padding: 0.625rem 1.25rem;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }

  &:active {
    transform: scale(0.97);
  }
}

.btn-cancel {
  background: #EFEAE1;
  color: #5C4E6B;

  &:hover {
    background: #E5DFD3;
  }
}

.btn-primary {
  background: linear-gradient(135deg, $pink 0%, #C9167F 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(224, 28, 142, 0.35);
}

.btn-danger {
  background: linear-gradient(135deg, #E5484D 0%, #C92A2E 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(229, 72, 77, 0.35);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;

  .modal-card {
    transition: transform 0.2s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-card {
    transform: scale(0.9);
  }
}
</style>
