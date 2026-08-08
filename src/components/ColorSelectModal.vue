<script setup lang="ts">
import { Palette, Check } from 'lucide-vue-next';

export interface ThemeOption {
  id: string;
  name: string;
  gradient: string;
  border: string;
  rowBadge: string;
  rowBadgeText: string;
  colBadge: string;
  colBadgeText: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'green',
    name: 'Green',
    gradient: 'linear-gradient(155deg, #2E9B5F 0%, #1E6B40 100%)',
    border: '#1E6B40',
    rowBadge: '#E01C8E',
    rowBadgeText: '#FFFFFF',
    colBadge: '#E01C8E',
    colBadgeText: '#FFFFFF',
  },
  {
    id: 'red',
    name: 'Red',
    gradient: 'linear-gradient(155deg, #E53935 0%, #B71C1C 100%)',
    border: '#B71C1C',
    rowBadge: '#3AB4F2',
    rowBadgeText: '#FFFFFF',
    colBadge: '#E01C8E',
    colBadgeText: '#FFFFFF',
  },
  {
    id: 'purple',
    name: 'Purple',
    gradient: 'linear-gradient(155deg, #7B1FA2 0%, #4A148C 100%)',
    border: '#E01C8E',
    rowBadge: '#E01C8E',
    rowBadgeText: '#FFFFFF',
    colBadge: '#E01C8E',
    colBadgeText: '#FFFFFF',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    gradient: 'linear-gradient(155deg, #FBC02D 0%, #F57F17 100%)',
    border: '#F57F17',
    rowBadge: '#E01C8E',
    rowBadgeText: '#FFFFFF',
    colBadge: '#00ACC1',
    colBadgeText: '#FFFFFF',
  },
];

interface Props {
  isOpen: boolean;
  selectedThemeId: string;
}

defineProps<Props>();
const emit = defineEmits(['select', 'confirm', 'close']);
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <Palette :size="24" />
          </div>
          <h3 class="modal-title">Select Player Board</h3>
        </div>

        <p class="modal-message">Choose your board color for this game:</p>

        <div class="color-grid">
          <button
            v-for="t in THEMES"
            :key="t.id"
            class="color-option-btn"
            :class="{ 'color-selected': selectedThemeId === t.id }"
            :style="{ background: t.gradient, borderColor: t.border }"
            @click="emit('select', t)"
          >
            <div class="color-preview-inner">
              <div class="mini-grid">
                <div class="mini-cell" />
                <div class="mini-cell" />
                <div class="mini-cell" />
                <div class="mini-cell" />
              </div>
            </div>
            <span class="color-name">{{ t.name }}</span>
            <div v-if="selectedThemeId === t.id" class="check-badge" :style="{ background: '#E01C8E' }">
              <Check :size="14" color="white" />
            </div>
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-confirm" @click="emit('confirm')">
            Start Game
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
  max-width: 28rem;
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
  margin-bottom: 0.5rem;
}

.modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FCE6F3;
  color: $pink;
  flex-shrink: 0;
}

.modal-title {
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  color: $ink;
  margin: 0;
}

.modal-message {
  font-size: 0.9375rem;
  color: #4A3E56;
  margin: 0 0 1.25rem 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.color-option-btn {
  position: relative;
  border-radius: 1rem;
  padding: 0.875rem;
  border: 4px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &.color-selected {
    transform: scale(1.03);
    box-shadow: 0 0 0 4px rgba(224, 28, 142, 0.5), 0 8px 20px rgba(0, 0, 0, 0.35);
  }
}

.color-preview-inner {
  width: 100%;
  height: 3.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  width: 2.5rem;
  height: 2.5rem;
}

.mini-cell {
  background: $cream;
  border-radius: 0.25rem;
}

.color-name {
  color: white;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.check-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.btn-confirm {
  width: 100%;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  background: linear-gradient(135deg, $pink 0%, #C9167F 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(224, 28, 142, 0.35);
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
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
