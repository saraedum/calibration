<script setup>
const props = defineProps({
  screen: {
    type: Object,
    required: true,
  },
});

const browserPlayerHref = (link) => {
  const query = new URLSearchParams({
    mode: "player",
    src: link.url,
    title: link.label,
    format: link.format,
    returnToIndex: String(window.__CALIBRATION_INDEX__ ?? 0),
  });

  return `${import.meta.env.BASE_URL}?${query.toString()}`;
};
</script>

<template>
  <section class="stage" :data-type="screen.type">
    <div v-if="screen.type === 'bars'" class="bars">
      <div
        v-for="(bar, index) in screen.bars"
        :key="`${bar.color}-${index}`"
        class="bar"
        :style="{ backgroundColor: bar.color }"
      >
        <span v-if="bar.label" class="bar-label">{{ bar.label }}</span>
      </div>
    </div>

    <div v-else-if="screen.type === 'photo'" class="photo-stage">
      <img class="reference-photo" :src="screen.src" :alt="screen.name" draggable="false" />
    </div>

    <div v-else-if="screen.type === 'people-grid'" class="people-grid-stage">
      <div class="people-grid">
        <img
          v-for="(photo, index) in screen.photos"
          :key="`${photo.src}-${index}`"
          class="people-grid-photo"
          :src="photo.src"
          :alt="photo.alt"
          draggable="false"
        />
      </div>
    </div>

    <div v-else-if="screen.type === 'split-portrait'" class="split-portrait-stage">
      <img
        class="split-portrait-half"
        :class="`split-portrait-half-${screen.top.position}`"
        :src="screen.top.src"
        :alt="screen.top.alt"
        draggable="false"
      />
      <div class="split-portrait-separators">
        <div class="split-portrait-separator split-portrait-separator-red" />
        <div class="split-portrait-separator split-portrait-separator-orange" />
      </div>
      <img
        class="split-portrait-half"
        :class="`split-portrait-half-${screen.bottom.position}`"
        :src="screen.bottom.src"
        :alt="screen.bottom.alt"
        draggable="false"
      />
    </div>

    <div v-else-if="screen.type === 'links'" class="links-stage">
      <div class="links-panel">
        <p class="links-title">{{ screen.name }}</p>
        <div class="launch-list">
          <article
            v-for="(link, index) in screen.links"
            :key="`${link.label}-${index}`"
            class="launch-card"
          >
            <div class="launch-copy">
              <span class="launch-format">{{ link.format }}</span>
              <h2 class="launch-label">{{ link.label }}</h2>
              <p class="launch-source">{{ link.source }}</p>
            </div>
            <div class="launch-actions">
              <div class="player-buttons">
                <a
                  v-for="player in link.players"
                  :key="player.label"
                  class="launch-button"
                  :href="player.label === 'Browser' ? browserPlayerHref(link) : player.href"
                >
                  {{ player.label }}
                </a>
              </div>
              <a class="launch-link" :href="link.url" target="_blank" rel="noreferrer">
                Direct URL
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
