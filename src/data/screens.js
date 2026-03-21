const gray = (...colors) => ({
  type: "bars",
  category: "Grayscale",
  bars: [...colors.map((color) => ({ color })), { color: "#000000", label: "Black bar" }],
});

const color = (name, colors) => ({
  type: "bars",
  category: "Color",
  name,
  bars: [
    ...colors.map((bar) =>
      typeof bar === "string" ? { color: bar } : { color: bar.color, label: bar.label },
    ),
    { color: "#000000", label: "Black bar" },
  ],
});

const photo = (name, src, note, credit) => ({
  type: "photo",
  category: "Reference Photo",
  name,
  src,
  note,
  credit,
});

const peopleGrid = (names, photos) => ({
  type: "people-grid",
  category: "Reference Photo Grid",
  name: names.join(" + "),
  note: "Compare four faces at once and balance the full set against the reference side.",
  photos,
});

const splitPortrait = (name, top, bottom) => ({
  type: "split-portrait",
  category: "Reference Photo",
  name,
  note: "Use this split portrait to compare two skin tones in one frame.",
  top,
  bottom,
});

const playerIntent = (url, packageName) => {
  const parsed = new URL(url);
  return `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=${parsed.protocol.replace(":", "")};package=${packageName};action=android.intent.action.VIEW;type=video/*;end`;
};

const externalLinks = (name, note, links) => ({
  type: "links",
  category: "External Video Tests",
  name,
  note,
    links: links.map((link) => ({
      ...link,
      players: [
        {
          label: "Browser",
          href: link.url,
        },
        {
          label: "VLC",
          href: playerIntent(link.url, "org.videolan.vlc"),
        },
        {
        label: "Kodi",
        href: playerIntent(link.url, "org.xbmc.kodi"),
      },
      {
        label: "MX",
        href: playerIntent(link.url, "com.mxtech.videoplayer.ad"),
      },
      {
        label: "Android",
        href: `intent:${link.url}#Intent;action=android.intent.action.VIEW;type=video/*;end`,
      },
    ],
  })),
});

const combinations = (items, size) => {
  if (size === 0) {
    return [[]];
  }

  if (items.length < size) {
    return [];
  }

  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), size - 1).map((rest) => [item, ...rest]),
  );
};

const portraitReferences = [
  photo(
    "Deep skin reference",
    "reference-dark-skin.jpg",
    "Use this to compare deep skin rendering, shadow detail, and highlight rolloff on the forehead and cheeks.",
    "Maxette Pirbakas, Wikimedia Commons, CC BY-SA 4.0",
  ),
  photo(
    "East Asian skin reference",
    "reference-asian-headshot.jpg",
    "Use this to compare lighter midtones, natural facial contrast, and neutral balance around the eyes and lips.",
    "Naoko Yamazaki, NASA / Robert Markowitz, public domain",
  ),
  photo(
    "East Asian skin reference II",
    "reference-east-asian-2.jpg",
    "Use this to compare East Asian skin tones in a second neutral official portrait with different facial structure and lighting.",
    "Soichi Noguchi official portrait 2020, NASA, public domain",
  ),
  photo(
    "Golden-hour skin reference",
    "reference-golden-hour.jpg",
    "Use this to compare warm ambient light, mixed highlights, and how each display handles skin under sunset tones.",
    "Young girl laughing in sunshine (2), Basile Morin, CC BY-SA 4.0",
  ),
  photo(
    "Light skin reference",
    "reference-light-skin-1.jpg",
    "Use this to compare pale skin rendering, facial detail, and neutral highlight handling in a cleaner high-quality portrait.",
    "Jessica U. Meir portrait, NASA, public domain",
  ),
];

const peopleGridScreens = combinations(portraitReferences, 4).map((group) =>
  peopleGrid(
    group.map((entry) => entry.name.replace(" reference", "").replace(" II", " II")),
    group.map((entry) => ({
      src: entry.src,
      alt: entry.name,
    })),
  ),
);

export const screens = [
  gray("#050505", "#1a1a1a", "#2f2f2f", "#444444"),
  gray("#595959", "#6e6e6e", "#838383", "#989898"),
  gray("#adadad", "#c2c2c2", "#d7d7d7", "#f0f0f0"),
  color("Neutral ramps", [
    { color: "#101010", label: "Near black" },
    { color: "#808080", label: "Middle gray" },
    { color: "#c8c8c8", label: "Highlight gray" },
    { color: "#ffffff", label: "Reference white" },
  ]),
  color("Primary balance", [
    { color: "#b00020", label: "Red" },
    { color: "#1e7f32", label: "Green" },
    { color: "#0047ab", label: "Blue" },
    { color: "#f5f5f5", label: "White" },
  ]),
  color("Secondary balance", [
    { color: "#00a0b0", label: "Cyan" },
    { color: "#c0308c", label: "Magenta" },
    { color: "#d7a400", label: "Yellow" },
    { color: "#202020", label: "Anchor black" },
  ]),
  color("Flesh tone sweep", [
    { color: "#f2c7a5", label: "Light flesh" },
    { color: "#d9a07b", label: "Warm flesh" },
    { color: "#b97857", label: "Medium flesh" },
    { color: "#7b4d39", label: "Deep flesh" },
  ]),
  color("Cyan and magenta focus", [
    { color: "#00b7c7", label: "Bright cyan" },
    { color: "#0097a7", label: "Deep cyan" },
    { color: "#d946a1", label: "Bright magenta" },
    { color: "#a12c73", label: "Deep magenta" },
  ]),
  color("Skin and foliage", [
    { color: "#d8a07b", label: "Light skin" },
    { color: "#b66a4d", label: "Warm skin" },
    { color: "#567c3d", label: "Foliage" },
    { color: "#8caed6", label: "Sky" },
  ]),
  color("Saturation sweep", [
    { color: "#f06c00", label: "Orange" },
    { color: "#ef476f", label: "Pink" },
    { color: "#ffd166", label: "Pastel yellow" },
    { color: "#06d6a0", label: "Mint" },
  ]),
  color("Obvious channel mixes", [
    { color: "#7f7f00", label: "Red + green" },
    { color: "#7f007f", label: "Red + blue" },
    { color: "#007f7f", label: "Green + blue" },
    { color: "#7f7f7f", label: "RGB equal mix" },
  ]),
  color("Bright mixed references", [
    { color: "#ff7f7f", label: "Red + white" },
    { color: "#7fffff", label: "Cyan tint" },
    { color: "#ff7fff", label: "Magenta tint" },
    { color: "#ffff7f", label: "Yellow tint" },
  ]),
  ...portraitReferences,
  splitPortrait(
    "Black woman top / Asian child bottom",
    {
      src: "reference-dark-skin.jpg",
      alt: "Black woman top half",
      position: "top",
    },
    {
      src: "reference-golden-hour.jpg",
      alt: "Asian child bottom half",
      position: "bottom",
    },
  ),
  splitPortrait(
    "Asian child top / Black woman bottom",
    {
      src: "reference-golden-hour.jpg",
      alt: "Asian child top half",
      position: "top",
    },
    {
      src: "reference-dark-skin.jpg",
      alt: "Black woman bottom half",
      position: "bottom",
    },
  ),
  ...peopleGridScreens,
  externalLinks(
    "4K video launchers",
    "These links target common Android TV players. If an intent is ignored or the app is missing, use the direct URL instead. HDR10+ playback depends on the player and display chain.",
    [
      {
        label: "SDR 4K HEVC 40 Mbps",
        format: "SDR",
        url: "https://fra1.mirror.jellyfin.org/test-videos/SDR/HEVC%208bit/Test%20Jellyfin%204K%20HEVC%208bit%2040M.mp4",
        source: "Jellyfin test videos",
      },
      {
        label: "HDR10 4K HEVC 40 Mbps",
        format: "HDR10",
        url: "https://fra1.mirror.jellyfin.org/test-videos/HDR/HDR10/HEVC/Test%20Jellyfin%204K%20HEVC%20HDR10%2040M.mp4",
        source: "Jellyfin test videos",
      },
      {
        label: "HDR10+ 4K VP9 sample",
        format: "HDR10+",
        url: "https://storage.googleapis.com/downloads.webmproject.org/vp9/decoder-test-streams/HDR10%2B_Sample_Video.webm",
        source: "Kodi Samples / WebM Project",
      },
    ],
  ),
];
