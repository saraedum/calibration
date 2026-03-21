<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CalibrationStage from "./components/CalibrationStage.vue";
import CalibrationWizard from "./components/CalibrationWizard.vue";
import VideoMirrorPlayer from "./components/VideoMirrorPlayer.vue";
import { screens } from "./data/screens";
import { wizardSteps } from "./data/wizard";

const currentIndex = ref(0);
const mode = ref("home");
const playerSrc = ref("");
const playerTitle = ref("Calibration sample");
const playerFormat = ref("Browser Player");
const returnToIndex = ref(0);
const brightnessOffset = ref(0);
const wizardIndex = ref(0);

const BRIGHTNESS_STEP = 0.02;
const MAX_BRIGHTNESS_OFFSET = 20;

const currentScreen = computed(() => screens[currentIndex.value]);
const leftBrightnessSteps = computed(() => Math.max(0, -brightnessOffset.value));
const rightBrightnessSteps = computed(() => Math.max(0, brightnessOffset.value));
const leftBrightness = computed(
  () => 1 - leftBrightnessSteps.value * BRIGHTNESS_STEP,
);
const rightBrightness = computed(
  () => 1 - rightBrightnessSteps.value * BRIGHTNESS_STEP,
);

const syncFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  mode.value = params.get("mode") === "player" ? "player" : "home";
  playerSrc.value = params.get("src") ?? "";
  playerTitle.value = params.get("title") ?? "Calibration sample";
  playerFormat.value = params.get("format") ?? "Browser Player";

  const index = Number.parseInt(params.get("returnToIndex") ?? "0", 10);
  returnToIndex.value =
    Number.isFinite(index) && index >= 0 && index < screens.length ? index : 0;
};

const setCalibrationUrl = () => {
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState({}, "", url);
};

const enterFullscreen = async () => {
  if (document.fullscreenElement) {
    return;
  }

  try {
    await document.documentElement.requestFullscreen();
  } catch {}
};

const goNext = async () => {
  await enterFullscreen();
  currentIndex.value = (currentIndex.value + 1) % screens.length;
};

const goPrevious = async () => {
  await enterFullscreen();
  currentIndex.value =
    (currentIndex.value - 1 + screens.length) % screens.length;
};

const onZoneClick = async (direction) => {
  if (direction === "next") {
    await goNext();
    return;
  }

  await goPrevious();
};

const onWizardZoneClick = (direction) => {
  if (direction === "next") {
    goWizardNext();
    return;
  }

  goWizardPrevious();
};

const onShellClick = async (event) => {
  if (!["calibration", "wizard"].includes(mode.value)) {
    return;
  }

  if (
    event.target instanceof Element &&
    event.target.closest("a, button, input, select, textarea, [data-no-nav]")
  ) {
    return;
  }

  const direction = event.clientX >= window.innerWidth / 2 ? "next" : "previous";

  if (mode.value === "wizard") {
    onWizardZoneClick(direction);
    return;
  }

  await onZoneClick(direction);
};

const onKeydown = async (event) => {
  if (mode.value === "player") {
    if (event.key === "Escape" || event.key === "Backspace") {
      event.preventDefault();
      currentIndex.value = returnToIndex.value;
      mode.value = "calibration";
      setCalibrationUrl();
    }

    return;
  }

  if (mode.value === "wizard") {
    if (event.key === "Escape" || event.key === "Backspace") {
      event.preventDefault();
      mode.value = "home";
      setCalibrationUrl();
      return;
    }

    if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
      goWizardNext();
    }

    if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goWizardPrevious();
    }

    return;
  }

  if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
    event.preventDefault();
    await goNext();
  }

  if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
    event.preventDefault();
    await goPrevious();
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    await enterFullscreen();
  }
};

onMounted(() => {
  syncFromUrl();
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("popstate", syncFromUrl);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("popstate", syncFromUrl);
});

watch(
  currentIndex,
  (value) => {
    window.__CALIBRATION_INDEX__ = value;
  },
  { immediate: true },
);

const leavePlayer = () => {
  currentIndex.value = returnToIndex.value;
  mode.value = "calibration";
  setCalibrationUrl();
};

const openCalibration = async () => {
  await enterFullscreen();
  mode.value = "calibration";
};

const openWizard = async () => {
  await enterFullscreen();
  wizardIndex.value = 0;
  mode.value = "wizard";
};

const goWizardNext = () => {
  wizardIndex.value = (wizardIndex.value + 1) % wizardSteps.length;
};

const goWizardPrevious = () => {
  wizardIndex.value = Math.max(0, wizardIndex.value - 1);
};

const dimLeft = () => {
  brightnessOffset.value = Math.max(
    brightnessOffset.value - 1,
    -MAX_BRIGHTNESS_OFFSET,
  );
};

const dimRight = () => {
  brightnessOffset.value = Math.min(
    brightnessOffset.value + 1,
    MAX_BRIGHTNESS_OFFSET,
  );
};
</script>

<template>
  <VideoMirrorPlayer
    v-if="mode === 'player'"
    :format="playerFormat"
    :left-brightness="leftBrightness"
    :right-brightness="rightBrightness"
    :src="playerSrc"
    :title="playerTitle"
    @back="leavePlayer"
  />

  <CalibrationWizard
    v-else-if="mode === 'wizard'"
    :left-brightness="leftBrightness"
    :left-brightness-steps="leftBrightnessSteps"
    :right-brightness="rightBrightness"
    :right-brightness-steps="rightBrightnessSteps"
    :step-index="wizardIndex"
    :steps="wizardSteps"
    @back="mode = 'home'"
    @click="onShellClick"
    @dim-left="dimLeft"
    @dim-right="dimRight"
    @next="goWizardNext"
    @open-calibration="openCalibration"
    @previous="goWizardPrevious"
  />

  <main v-else-if="mode === 'calibration'" class="app-shell" @click="onShellClick">
    <div class="stage-grid">
      <div class="stage-pane" :style="{ filter: `brightness(${leftBrightness})` }">
        <CalibrationStage :screen="currentScreen" />
      </div>
      <div class="stage-pane" :style="{ filter: `brightness(${rightBrightness})` }">
        <CalibrationStage :screen="currentScreen" />
      </div>
    </div>

    <button
      v-if="currentIndex === 0"
      class="mode-jump-button"
      type="button"
      data-no-nav
      @click="openWizard"
    >
      Open wizard
    </button>

    <footer class="brightness-control" data-no-nav>
      <button class="brightness-button" type="button" @click="dimLeft">
        <span class="brightness-label">Dim left</span>
        <span class="brightness-value">{{ leftBrightnessSteps }}</span>
      </button>
      <button class="brightness-button" type="button" @click="dimRight">
        <span class="brightness-label">Dim right</span>
        <span class="brightness-value">{{ rightBrightnessSteps }}</span>
      </button>
    </footer>
  </main>

  <main v-else class="home-shell" data-no-nav>
    <section class="home-panel">
      <span class="home-kicker">Screen Calibration</span>
      <h1 class="home-title">Choose a calibration mode</h1>
      <p class="home-copy">
        Use the browser to flip through reference screens freely, or enter the guided wizard to
        tune the adjustable display against the reference display shown on the other half of the
        screen.
      </p>

      <div class="home-actions">
        <button class="home-button" type="button" @click="openWizard">Open wizard</button>
        <button class="home-button home-button-secondary" type="button" @click="openCalibration">
          Open calibration browser
        </button>
      </div>
    </section>
  </main>
</template>
