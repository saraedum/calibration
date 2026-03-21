<script setup>
import { computed, ref } from "vue";
import CalibrationStage from "./CalibrationStage.vue";

const props = defineProps({
  leftBrightness: {
    type: Number,
    default: 1,
  },
  leftBrightnessSteps: {
    type: Number,
    default: 0,
  },
  rightBrightness: {
    type: Number,
    default: 1,
  },
  rightBrightnessSteps: {
    type: Number,
    default: 0,
  },
  stepIndex: {
    type: Number,
    required: true,
  },
  steps: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits([
  "back",
  "click",
  "dimLeft",
  "dimRight",
  "next",
  "previous",
  "openCalibration",
]);

const currentStep = computed(() => props.steps[props.stepIndex]);
const isFirst = computed(() => props.stepIndex === 0);
const isLast = computed(() => props.stepIndex === props.steps.length - 1);
const instructionsCollapsed = ref(false);

const collapseInstructions = (event) => {
  if (event.target instanceof Element && event.target.closest("button, a")) {
    return;
  }

  instructionsCollapsed.value = true;
};
</script>

<template>
  <main class="wizard-shell" @click="emit('click', $event)">
    <div class="wizard-stage-grid">
      <div class="stage-pane" :style="{ filter: `brightness(${leftBrightness})` }">
        <CalibrationStage :screen="currentStep.screen" />
      </div>
      <div class="stage-pane" :style="{ filter: `brightness(${rightBrightness})` }">
        <CalibrationStage :screen="currentStep.screen" />
      </div>
    </div>

    <section
      class="wizard-panel"
      :class="{ 'wizard-panel-collapsed': instructionsCollapsed }"
      data-no-nav
      @click="collapseInstructions"
    >
      <button
        v-if="instructionsCollapsed"
        class="wizard-toggle"
        type="button"
        aria-label="Show instructions"
        @click.stop="instructionsCollapsed = false"
      >
        ?
      </button>

      <template v-if="!instructionsCollapsed">
        <div class="wizard-title-row">
          <h1 class="wizard-title">{{ currentStep.title }}</h1>
          <button
            class="wizard-toggle wizard-toggle-inline"
            type="button"
            aria-label="Hide instructions"
            @click.stop="instructionsCollapsed = true"
          >
            –
          </button>
        </div>
        <p class="wizard-copy">{{ currentStep.instruction }}</p>

        <ul class="wizard-list">
          <li v-for="item in currentStep.checklist" :key="item">{{ item }}</li>
        </ul>

        <div class="wizard-actions">
          <button class="wizard-button wizard-button-secondary" type="button" @click="emit('back')">
            Home
          </button>
          <button
            class="wizard-button wizard-button-secondary"
            type="button"
            @click="emit('openCalibration')"
          >
            Open browser
          </button>
          <button
            class="wizard-button wizard-button-secondary"
            type="button"
            :disabled="isFirst"
            @click="emit('previous')"
          >
            Previous
          </button>
          <button class="wizard-button" type="button" @click="emit('next')">
            {{ isLast ? "Restart review" : "Next" }}
          </button>
        </div>
      </template>
    </section>

    <footer class="brightness-control" data-no-nav>
      <button class="brightness-button" type="button" @click="emit('dimLeft')">
        <span class="brightness-label">Dim left</span>
        <span class="brightness-value">{{ leftBrightnessSteps }}</span>
      </button>
      <button class="brightness-button" type="button" @click="emit('dimRight')">
        <span class="brightness-label">Dim right</span>
        <span class="brightness-value">{{ rightBrightnessSteps }}</span>
      </button>
    </footer>
  </main>
</template>
