<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CalibrationStage from "./components/CalibrationStage.vue";
import VideoMirrorPlayer from "./components/VideoMirrorPlayer.vue";
import { screens } from "./data/screens";

const currentIndex = ref(0);
const mode = ref("calibration");
const playerSrc = ref("");
const playerTitle = ref("Calibration sample");
const playerFormat = ref("Browser Player");
const returnToIndex = ref(0);
const brightnessOffset = ref(0);

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
  mode.value = params.get("mode") === "player" ? "player" : "calibration";
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

const onShellClick = async (event) => {
  if (mode.value !== "calibration") {
    return;
  }

  if (
    event.target instanceof Element &&
    event.target.closest("a, button, input, select, textarea, [data-no-nav]")
  ) {
    return;
  }

  const direction = event.clientX >= window.innerWidth / 2 ? "next" : "previous";
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

  <main v-else class="app-shell" @click="onShellClick">
    <div class="stage-grid">
      <div class="stage-pane" :style="{ filter: `brightness(${leftBrightness})` }">
        <CalibrationStage :screen="currentScreen" />
      </div>
      <div class="stage-pane" :style="{ filter: `brightness(${rightBrightness})` }">
        <CalibrationStage :screen="currentScreen" />
      </div>
    </div>

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
</template>
