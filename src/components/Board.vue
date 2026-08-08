<script setup lang="ts">
import { ref, computed } from 'vue';
import { Star, RotateCcw, Check, Trophy, Move, Send, Palette } from 'lucide-vue-next';
import ConfirmModal from './ConfirmModal.vue';
import ColorSelectModal, { type ThemeOption } from './ColorSelectModal.vue';

const INITIAL_WORDS = Array(9).fill("");

const PINK = "#E01C8E";
const ORANGE = "#F5A623";
const GREEN = "#2FBF88";
const INK = "#2B1B3D";

// 4 official physical player board color themes matching the reference board images
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

const currentThemeId = ref<string>('purple');
const currentTheme = computed(() => {
  return THEMES.find(t => t.id === currentThemeId.value) || THEMES[2]; // Default to Purple
});

const shapes = [
  { x: 3, y: 4, r: -18, c: PINK, type: "square" },
  { x: 92, y: 6, r: 20, c: ORANGE, type: "tri" },
  { x: 48, y: 2, r: 0, c: GREEN, type: "zig" },
  { x: 2, y: 60, r: 12, c: "#5DD6F0", type: "tri" },
  { x: 95, y: 55, r: -10, c: "#B79CE0", type: "diamond" },
  { x: 6, y: 95, r: 0, c: ORANGE, type: "tri" },
  { x: 90, y: 93, r: 15, c: PINK, type: "zig" },
];

const words = ref<string[]>([...INITIAL_WORDS]);
const marks = ref<('none' | 'correct' | 'wrong')[]>(Array(9).fill('none'));
const stars = ref<boolean[]>(Array(9).fill(false));

// Answer lock state: when false, word inputs are editable but marking (circle, x, star) is disabled
const isSubmitted = ref<boolean>(false);

// Row point values top-to-bottom: Row 1 = 3, Row 2 = 2, Row 3 = 1
const rowPoints = [3, 2, 1];
// Col point values left-to-right: Col 1 = 1, Col 2 = 2, Col 3 = 3
const colPoints = [1, 2, 3];

// Base values: Circle = 1 pt per card, Star = +2 extra pts
const circleBonus = 1;
const starBonus = 2;

const rounds = ref<(number | null)[]>([null, null, null]);
const activeRound = ref<number>(0);

// Modal state
const showResetModal = ref(false);
const showNextRoundModal = ref(false);
const showSubmitModal = ref(false);
const showColorSelectModal = ref(true); // Open color selector on game start

const totals = computed(() => {
  let cTotal = 0;
  let sTotal = 0;
  let bTotal = 0;

  for (let i = 0; i < 9; i++) {
    if (marks.value[i] !== 'correct') continue;

    // Circle adds 1 point per card
    cTotal += circleBonus;

    // Star adds +2 points if active on a Circle
    if (stars.value[i]) {
      sTotal += starBonus;
    }
  }

  // Bingo Bonus Calculation:
  // If a row is full of circles, add the row's point value (Row 1=3, Row 2=2, Row 3=1)
  for (let r = 0; r < 3; r++) {
    const isRowFull = [0, 1, 2].every(c => marks.value[r * 3 + c] === 'correct');
    if (isRowFull) {
      bTotal += rowPoints[r];
    }
  }

  // If a col is full of circles, add the col's point value (Col 1=1, Col 2=2, Col 3=3)
  for (let c = 0; c < 3; c++) {
    const isColFull = [0, 1, 2].every(r => marks.value[r * 3 + c] === 'correct');
    if (isColFull) {
      bTotal += colPoints[c];
    }
  }

  return {
    circleTotal: cTotal,
    starTotal: sTotal,
    bingoTotal: bTotal,
    live: cTotal + sTotal + bTotal,
  };
});

const finalScore = computed(() => {
  return rounds.value.reduce((sum: number, r) => sum + (r || 0), 0);
});

function cycleMark(i: number) {
  // Only allow marking if answers have been submitted
  if (!isSubmitted.value) return;

  const current = marks.value[i];
  // Cycle: None -> Circle -> Cross -> None
  const next = current === 'none' ? 'correct' : current === 'correct' ? 'wrong' : 'none';
  marks.value[i] = next;

  if (next !== 'correct') {
    stars.value[i] = false;
  }
}

function toggleStar(i: number, e: Event) {
  e.stopPropagation();
  // Only allow star toggle if submitted and card is marked as circle ('correct')
  if (isSubmitted.value && marks.value[i] === 'correct') {
    stars.value[i] = !stars.value[i];
  }
}

// Submit Answers logic
function promptSubmit() {
  if (isSubmitted.value) return;
  showSubmitModal.value = true;
}

function confirmSubmit() {
  showSubmitModal.value = false;
  isSubmitted.value = true;
}

// Request next round (triggers pop-up)
function promptRecordRound() {
  if (activeRound.value > 2 || !isSubmitted.value) return;
  showNextRoundModal.value = true;
}

// Confirm next round
function confirmRecordRound() {
  showNextRoundModal.value = false;
  if (activeRound.value > 2) return;
  rounds.value[activeRound.value] = totals.value.live;
  activeRound.value = Math.min(activeRound.value + 1, 3);
  marks.value = Array(9).fill('none');
  stars.value = Array(9).fill(false);
  isSubmitted.value = false; // Reset lock state for the new round
}

// Request reset (triggers pop-up)
function promptReset() {
  showResetModal.value = true;
}

// Confirm reset (triggers color picker for the new game)
function confirmReset() {
  showResetModal.value = false;
  words.value = Array(9).fill('');
  marks.value = Array(9).fill('none');
  stars.value = Array(9).fill(false);
  rounds.value = [null, null, null];
  activeRound.value = 0;
  isSubmitted.value = false;
  showColorSelectModal.value = true;
}

function selectTheme(theme: ThemeOption) {
  currentThemeId.value = theme.id;
}

function confirmTheme() {
  showColorSelectModal.value = false;
}
</script>

<template>
  <div class="app-container">
    <div
      class="card-wrapper"
      :style="{
        background: currentTheme.gradient,
        borderColor: currentTheme.border
      }"
    >
      <!-- Confetti / Background Shapes -->
      <div class="confetti-container">
        <div
          v-for="(s, i) in shapes"
          :key="i"
          class="shape-item"
          :style="{
            left: s.x + '%',
            top: s.y + '%',
            transform: `rotate(${s.r}deg)`
          }"
        >
          <div v-if="s.type === 'square'" class="shape-square" :style="{ background: s.c }" />
          <div
            v-else-if="s.type === 'tri'"
            class="shape-tri"
            :style="{ borderBottomColor: s.c }"
          />
          <div v-else-if="s.type === 'diamond'" class="shape-diamond" :style="{ background: s.c }" />
          <svg v-else-if="s.type === 'zig'" width="26" height="14" viewBox="0 0 26 14">
            <polyline points="0,12 6,2 13,12 19,2 26,12" fill="none" :stroke="s.c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Title & Reset Header -->
      <div class="card-header">
        <h1 class="card-title">JinxO</h1>
        <div class="header-actions">
          <button class="icon-header-btn" @click="showColorSelectModal = true" title="Change Board Color">
            <Palette :size="16" /> Color
          </button>
          <button class="reset-btn" @click="promptReset" title="New Game">
            <RotateCcw :size="15" /> New Game
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="card-body">
        <!-- Grid Area -->
        <div class="board-main-area">
          <div class="grid-layout">
            <!-- 3 Rows -->
            <div v-for="r in [0, 1, 2]" :key="r" class="grid-row">
              <!-- 3 Cells in Row -->
              <div v-for="c in [0, 1, 2]" :key="c" class="cell-container">
                <button
                  class="word-card-btn"
                  :class="[
                    marks[r * 3 + c] === 'correct' ? 'card-correct' : marks[r * 3 + c] === 'wrong' ? 'card-wrong' : 'card-none',
                    { 'card-clickable': isSubmitted }
                  ]"
                  @click="cycleMark(r * 3 + c)"
                >
                  <!-- Hand Circle SVG -->
                  <svg v-if="marks[r * 3 + c] === 'correct'" viewBox="0 0 200 100" class="overlay-svg">
                    <ellipse
                      cx="100" cy="50" rx="90" ry="42"
                      fill="none" :stroke="GREEN" stroke-width="7"
                      stroke-linecap="round"
                    />
                  </svg>
                  <!-- Hand Cross SVG -->
                  <svg v-if="marks[r * 3 + c] === 'wrong'" viewBox="0 0 200 100" class="overlay-svg">
                    <line x1="14" y1="12" x2="186" y2="90" stroke="#E5484D" stroke-width="7" stroke-linecap="round" />
                    <line x1="186" y1="16" x2="16" y2="86" stroke="#E5484D" stroke-width="7" stroke-linecap="round" />
                  </svg>
                  
                  <!-- Editable Textarea (when NOT submitted) -->
                  <textarea
                    v-if="!isSubmitted"
                    v-model="words[r * 3 + c]"
                    placeholder="Type word..."
                    rows="2"
                    class="word-input"
                  />
                  <!-- Full Rendered Display Box (when submitted) -->
                  <div v-else class="submitted-word-display">
                    {{ words[r * 3 + c] }}
                  </div>
                </button>
                
                <!-- Star Button -->
                <button
                  class="star-btn"
                  :class="{ 
                    'star-active': stars[r * 3 + c],
                    'star-disabled': !isSubmitted || marks[r * 3 + c] !== 'correct'
                  }"
                  :disabled="!isSubmitted || marks[r * 3 + c] !== 'correct'"
                  @click="toggleStar(r * 3 + c, $event)"
                  title="Star Bonus (+2 pts - requires Circle)"
                >
                  <Star :size="16" :fill="stars[r * 3 + c] ? INK : 'none'" :color="stars[r * 3 + c] ? INK : '#B7ADC9'" />
                </button>
              </div>

              <!-- Row Badge aligned exactly to the right of each row -->
              <div class="row-pill-wrapper">
                <div
                  class="point-pill row-pill"
                  :style="{
                    background: currentTheme.rowBadge,
                    color: currentTheme.rowBadgeText
                  }"
                >
                  {{ rowPoints[r] }}
                </div>
              </div>
            </div>
          </div>

          <!-- Column Indicators (Static 1, 2, 3 below each column) -->
          <div class="col-points-grid">
            <div v-for="val in colPoints" :key="val" class="col-pill-wrapper">
              <div
                class="point-pill col-pill"
                :style="{
                  background: currentTheme.colBadge,
                  color: currentTheme.colBadgeText
                }"
              >
                {{ val }}
              </div>
            </div>
            <!-- Empty spacer for the right-hand row badge column -->
            <div class="col-pill-spacer" />
          </div>
        </div>

        <!-- Sidebar Scoring -->
        <div class="sidebar-scoring">
          <!-- Circle Row (+1 pt per circled card) -->
          <div class="score-row">
            <div class="score-label-group">
              <div class="icon-circle" :style="{ background: GREEN }">
                <svg viewBox="0 0 380.734 380.734" class="custom-circle-icon">
                  <path fill="#2B1B3D" d="M190.367,0C85.23,0,0,85.23,0,190.367s85.23,190.367,190.367,190.367s190.367-85.23,190.367-190.367 S295.504,0,190.367,0z M299.002,298.36c-28.996,28.996-67.57,44.959-108.634,44.959S110.723,327.35,81.733,298.36 c-28.865-28.876-44.769-67.227-44.769-107.993c0-40.771,15.904-79.128,44.769-107.993c28.99-28.996,67.57-44.959,108.634-44.959 c41.054,0,79.639,15.969,108.629,44.959c28.871,28.865,44.763,67.221,44.763,107.993 C343.765,231.133,327.867,269.489,299.002,298.36z"/>
                </svg>
              </div>
            </div>
            <div class="score-box">{{ totals.circleTotal }}</div>
          </div>

          <!-- Star Row (+2 pt per starred card) -->
          <div class="score-row">
            <div class="score-label-group">
              <div class="icon-circle" :style="{ background: ORANGE }">
                <Star :size="13" :color="INK" :fill="INK" class="icon-star-center" />
              </div>
            </div>
            <div class="score-box">{{ totals.starTotal }}</div>
          </div>

          <!-- Line/Bingo Bonus Row -->
          <div class="score-row">
            <div class="score-label-group">
              <div class="icon-circle" :style="{ background: PINK }">
                <Move :size="14" color="white" />
              </div>
            </div>
            <div class="score-box">{{ totals.bingoTotal }}</div>
          </div>

          <div class="divider" />

          <div class="section-label">Current Round</div>
          <div class="live-score-box">{{ totals.live }}</div>

          <!-- Submit Answers Button -->
          <button
            v-if="!isSubmitted"
            class="action-btn submit-btn"
            @click="promptSubmit"
          >
            <Send :size="16" />
            <span>Submit Answers</span>
          </button>

          <!-- Record & Next Round Button (Enabled after submission) -->
          <button
            v-else
            class="action-btn record-btn"
            :disabled="activeRound > 2"
            @click="promptRecordRound"
          >
            <Check :size="16" />
            <span>{{ activeRound > 2 ? "All Rounds Recorded" : `Record Round ${activeRound + 1}` }}</span>
          </button>

          <!-- Rounds History -->
          <div class="rounds-history">
            <div
              v-for="r in [0, 1, 2]"
              :key="r"
              class="round-history-item"
              :class="{ 'round-active': r < activeRound || rounds[r] !== null }"
            >
              <span class="round-label">ROUND {{ r + 1 }}</span>
              <span class="round-val">{{ rounds[r] !== null ? rounds[r] : "–" }}</span>
            </div>
          </div>

          <div class="divider" />

          <div class="section-label trophy-label">
            <Trophy :size="13" /> Final Score
          </div>
          <div class="final-score-box">{{ finalScore }}</div>
        </div>
      </div>
    </div>

    <!-- Board Color Selection Modal -->
    <ColorSelectModal
      :is-open="showColorSelectModal"
      :selected-theme-id="currentThemeId"
      @select="selectTheme"
      @confirm="confirmTheme"
      @close="showColorSelectModal = false"
    />

    <!-- Confirmation Modals -->
    <ConfirmModal
      :is-open="showSubmitModal"
      title="Submit Answers?"
      message="Submitting will lock your word answers and enable marking (Circle, Cross & Clear)."
      confirm-text="Submit & Lock Words"
      variant="primary"
      @confirm="confirmSubmit"
      @cancel="showSubmitModal = false"
    />

    <ConfirmModal
      :is-open="showResetModal"
      title="Reset Game?"
      message="Are you sure you want to reset all words, marks, and round scores? You will be prompted to pick your board color."
      confirm-text="Reset All"
      variant="danger"
      @confirm="confirmReset"
      @cancel="showResetModal = false"
    />

    <ConfirmModal
      :is-open="showNextRoundModal"
      :title="`Record Round ${activeRound + 1}?`"
      :message="`Save current round score of ${totals.live} points and proceed to the next round?`"
      confirm-text="Record & Next"
      variant="primary"
      @confirm="confirmRecordRound"
      @cancel="showNextRoundModal = false"
    />
  </div>
</template>

<style lang="scss" scoped>
$pink: #E01C8E;
$orange: #F5A623;
$green: #2FBF88;
$cream: #FBF8F1;
$ink: #2B1B3D;

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Nunito', sans-serif;
}

.card-wrapper {
  position: relative;
  width: 100%;
  max-width: 56rem;
  border-radius: 28px;
  padding: 1.25rem;
  border: 10px solid;
  transition: background 0.3s ease, border-color 0.3s ease;

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
}

/* Background Confetti Shapes */
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape-item {
  position: absolute;
  opacity: 0.5;
}

.shape-square {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.shape-tri {
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 16px solid;
}

.shape-diamond {
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  border-radius: 2px;
}

/* Header */
.card-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.card-title {
  color: white;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: clamp(22px, 3.4vw, 34px);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-header-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  padding: 0.375rem 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  font-family: 'Nunito', sans-serif;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  padding: 0.375rem 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  font-family: 'Nunito', sans-serif;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
}

/* Card Body Layout */
.card-body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
}

.board-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }
}

.cell-container {
  position: relative;
}

.word-card-btn {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: transform 0.10s ease;
  cursor: default;

  &.card-clickable {
    cursor: pointer;

    &:active {
      transform: scale(0.95);
    }
  }
}

.card-none {
  background: $cream;
  border: 3px solid #D8D2E6;
}

.card-correct {
  background: #EAFBF3;
  border: 3px solid $green;
}

.card-wrong {
  background: #FDECEC;
  border: 3px solid #E5484D;
}

.overlay-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.word-input {
  position: relative;
  z-index: 10;
  width: 100%;
  max-height: 85%;
  background: transparent;
  text-align: center;
  outline: none;
  border: none;
  resize: none;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.25;
  color: $ink;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Custom subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(43, 27, 61, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(43, 27, 61, 0.2);
    border-radius: 4px;
  }

  &::placeholder {
    color: #B7ADC9;
    font-weight: 500;
  }
}

/* Submitted Full Word View Box */
.submitted-word-display {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: clamp(13px, 1.7vw, 18px);
  line-height: 1.25;
  color: $ink;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow-y: auto;
  padding: 0.25rem;
  user-select: none;

  /* Custom subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(43, 27, 61, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(43, 27, 61, 0.2);
    border-radius: 4px;
  }
}

.star-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #D8D2E6;
  transition: transform 0.15s ease;

  &:hover:not(.star-disabled) {
    transform: scale(1.1);
  }
  &:active:not(.star-disabled) {
    transform: scale(0.9);
  }

  &.star-active {
    background: $orange;
    border-color: #C9791A;
  }

  &.star-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* Pills & Badges */
.row-pill-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0.25rem;
}

.col-points-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 0.75rem;
  margin-top: 0.75rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }
}

.col-pill-wrapper {
  display: flex;
  justify-content: center;
}

.col-pill-spacer {
  width: 2.25rem;

  @media (min-width: 640px) {
    width: 2.75rem;
  }
}

/* Clean flat circular badges matching physical board template */
.point-pill {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-family: 'Baloo 2', sans-serif;
  font-size: 16px;
  box-shadow: none;
  user-select: none;
  transition: background 0.3s ease, color 0.3s ease;
  border: none;

  @media (min-width: 640px) {
    width: 2.75rem;
    height: 2.75rem;
    font-size: 18px;
  }
}

/* Sidebar Scoring */
.sidebar-scoring {
  width: 100%;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.12);

  @media (min-width: 1024px) {
    width: 14rem;
  }
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.score-label-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.icon-circle {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon-star-center {
  display: block;
  margin: auto;
}

.custom-circle-icon {
  width: 16px;
  height: 16px;
}

.score-box {
  flex: 1;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  background: $cream;
  color: $ink;
  font-family: 'Baloo 2', sans-serif;
  font-size: 18px;
}

.divider {
  height: 1px;
  width: 100%;
  margin: 0.25rem 0;
  background: rgba(255, 255, 255, 0.25);
}

.section-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trophy-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.live-score-box {
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  background: $cream;
  color: $ink;
  font-family: 'Baloo 2', sans-serif;
  font-size: 26px;
}

.action-btn {
  height: 2.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0 1rem;
  font-weight: 700;
  color: white;
  font-size: 0.875rem;
  font-family: 'Nunito', sans-serif;
  transition: transform 0.15s ease, background-color 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.submit-btn {
  background: linear-gradient(135deg, $orange 0%, #E69516 100%);
  border: 2px solid #FFAE33;
  color: $ink;
  font-weight: 800;
}

.record-btn {
  background: linear-gradient(135deg, $pink 0%, #C9167F 100%);
}

.rounds-history {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.round-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
}

.round-active {
  background: rgba(255, 255, 255, 0.12);
}

.round-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 700;
}

.round-val {
  color: white;
  font-weight: 900;
  font-family: 'Baloo 2', sans-serif;
}

.final-score-box {
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  background: $orange;
  color: $ink;
  font-family: 'Baloo 2', sans-serif;
  font-size: 28px;
}
</style>
