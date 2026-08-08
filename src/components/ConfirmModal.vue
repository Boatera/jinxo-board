<script setup lang="ts">
import { AlertCircle, HelpCircle } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

withDefaults(defineProps<Props>(), {
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
          <div class="modal-icon" :class="`icon-${variant}`">
            <AlertCircle v-if="variant === 'danger'" :size="24" />
            <HelpCircle v-else :size="24" />
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <p class="modal-message">{{ message }}</p>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="emit('cancel')">
            {{ cancelText }}
          </button>
          <button
            class="btn btn-confirm"
            :class="`btn-${variant}`"
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
$purple-dark: #3A1F5E;
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
  background: rgba(15, 8, 28, 0.7);
  backdrop-filter: blur(4px);
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

  &.icon-primary {
    background: #EAFBF3;
    color: #2FBF88;
  }

  &.icon-danger {
    background: #FDECEC;
    color: #E5484D;
  }
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
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
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
  padding: 0.5rem 1.25rem;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.875rem;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover {
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.96);
  }
}

.btn-cancel {
  background: #E6E0F0;
  color: #5C4D73;
}

.btn-confirm {
  color: white;

  &.btn-primary {
    background: $pink;
  }

  &.btn-danger {
    background: #E5484D;
  }
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
