import type { Component } from 'vue';
import { Send, RotateCcw, Check, Palette } from 'lucide-vue-next';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  icon?: Component;
  iconBg?: string;
  iconColor?: string;
  confirmBtnBg?: string;
  confirmBtnColor?: string;
  cancelBtnBg?: string;
  cancelBtnColor?: string;
}

export interface AppModalsConfig {
  submit: ModalConfig;
  reset: ModalConfig;
  nextRound: (roundNum: number, currentScore: number) => ModalConfig;
  colorSelect: ModalConfig;
}

export const MODAL_CONFIGS: AppModalsConfig = {
  submit: {
    title: 'Submit Answers?',
    message: 'Submitting will lock your word answers and enable marking (Circle, Cross & Clear).',
    confirmText: 'Submit & Lock Words',
    icon: Send,
    iconBg: '#FCE6F3',
    iconColor: '#E01C8E',
    confirmBtnBg: 'linear-gradient(135deg, #E01C8E 0%, #C9167F 100%)',
    confirmBtnColor: '#FFFFFF',
    cancelBtnBg: '#EFEAE1',
    cancelBtnColor: '#5C4E6B',
  },
  reset: {
    title: 'Reset Game?',
    message: 'Are you sure you want to reset all words, marks, and round scores? You will be prompted to pick your board color.',
    confirmText: 'Reset All',
    icon: RotateCcw,
    iconBg: '#FDECEC',
    iconColor: '#E5484D',
    confirmBtnBg: 'linear-gradient(135deg, #E5484D 0%, #C92A2E 100%)',
    confirmBtnColor: '#FFFFFF',
    cancelBtnBg: '#EFEAE1',
    cancelBtnColor: '#5C4E6B',
  },
  nextRound: (roundNum: number, currentScore: number) => ({
    title: `Record Round ${roundNum}?`,
    message: `Save current round score of ${currentScore} points and proceed to the next round?`,
    confirmText: 'Record & Next',
    icon: Check,
    iconBg: '#FCE6F3',
    iconColor: '#E01C8E',
    confirmBtnBg: 'linear-gradient(135deg, #E01C8E 0%, #C9167F 100%)',
    confirmBtnColor: '#FFFFFF',
    cancelBtnBg: '#EFEAE1',
    cancelBtnColor: '#5C4E6B',
  }),
  colorSelect: {
    title: 'Select Player Board',
    message: 'Choose your board color for this game:',
    confirmText: 'Start Game',
    icon: Palette,
    iconBg: '#FCE6F3',
    iconColor: '#E01C8E',
    confirmBtnBg: 'linear-gradient(135deg, #E01C8E 0%, #C9167F 100%)',
    confirmBtnColor: '#FFFFFF',
  },
};
