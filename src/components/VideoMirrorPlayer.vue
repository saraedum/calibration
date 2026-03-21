<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  format: {
    type: String,
    default: "Browser Player",
  },
  leftBrightness: {
    type: Number,
    default: 1,
  },
  rightBrightness: {
    type: Number,
    default: 1,
  },
  src: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "Calibration sample",
  },
});

const emit = defineEmits(["back"]);

const leftVideo = ref(null);
const rightVideo = ref(null);

const syncRightToLeft = () => {
  if (!leftVideo.value || !rightVideo.value) {
    return;
  }

  if (Math.abs(rightVideo.value.currentTime - leftVideo.value.currentTime) > 0.12) {
    rightVideo.value.currentTime = leftVideo.value.currentTime;
  }
};

const onPlay = async () => {
  syncRightToLeft();

  try {
    await rightVideo.value?.play();
  } catch {}
};

const onPause = () => {
  rightVideo.value?.pause();
};

const onRateChange = () => {
  if (!leftVideo.value || !rightVideo.value) {
    return;
  }

  rightVideo.value.playbackRate = leftVideo.value.playbackRate;
};

const onRightPlay = () => {
  if (leftVideo.value?.paused) {
    rightVideo.value?.pause();
  }
};

const syncSources = () => {
  if (!leftVideo.value || !rightVideo.value) {
    return;
  }

  leftVideo.value.src = props.src;
  rightVideo.value.src = props.src;
  leftVideo.value.load();
  rightVideo.value.load();
};

onMounted(() => {
  leftVideo.value?.addEventListener("play", onPlay);
  leftVideo.value?.addEventListener("pause", onPause);
  leftVideo.value?.addEventListener("seeking", syncRightToLeft);
  leftVideo.value?.addEventListener("seeked", syncRightToLeft);
  leftVideo.value?.addEventListener("ratechange", onRateChange);
  leftVideo.value?.addEventListener("timeupdate", syncRightToLeft);
  rightVideo.value?.addEventListener("play", onRightPlay);
  syncSources();
});

onBeforeUnmount(() => {
  leftVideo.value?.removeEventListener("play", onPlay);
  leftVideo.value?.removeEventListener("pause", onPause);
  leftVideo.value?.removeEventListener("seeking", syncRightToLeft);
  leftVideo.value?.removeEventListener("seeked", syncRightToLeft);
  leftVideo.value?.removeEventListener("ratechange", onRateChange);
  leftVideo.value?.removeEventListener("timeupdate", syncRightToLeft);
  rightVideo.value?.removeEventListener("play", onRightPlay);
});

watch(() => props.src, syncSources);
</script>

<template>
  <main class="player-shell" data-no-nav>
    <button class="player-back" type="button" @click="emit('back')">Back</button>

    <header class="player-header">
      <p class="player-kicker">{{ format }}</p>
      <h1 class="player-title">{{ title }}</h1>
    </header>

    <section class="player-frame">
      <div class="player-grid">
        <div class="player-pane" :style="{ filter: `brightness(${leftBrightness})` }">
          <video ref="leftVideo" controls autoplay playsinline muted loop />
        </div>
        <div class="player-pane" :style="{ filter: `brightness(${rightBrightness})` }">
          <video ref="rightVideo" autoplay playsinline muted loop />
        </div>
      </div>
    </section>

    <div class="player-actions">
      <a class="player-link" :href="src">Open direct URL</a>
    </div>

    <p class="player-note">
      If the browser still downloads the file instead of playing it, that behavior is controlled
      by the remote server headers or by the browser itself.
    </p>
  </main>
</template>
