const wizardBars = (section, title, instruction, checklist, bars) => ({
  section,
  title,
  instruction,
  checklist,
  screen: {
    type: "bars",
    name: title,
    bars: [
      ...bars.map((bar) =>
        typeof bar === "string" ? { color: bar } : { color: bar.color, label: bar.label },
      ),
      { color: "#000000", label: "Black bar" },
    ],
  },
});

const wizardGrayBars = (section, title, instruction, checklist, colors) => ({
  section,
  title,
  instruction,
  checklist,
  screen: {
    type: "bars",
    name: title,
    bars: [...colors.map((color) => ({ color })), { color: "#000000", label: "Black bar" }],
  },
});

const wizardValidationBars = (title, instruction, checklist, bars) =>
  wizardBars("Color Management", title, instruction, checklist, bars);

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
};

const rgbToHex = ([r, g, b]) =>
  `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHex = (a, b, t) => {
  const start = hexToRgb(a);
  const end = hexToRgb(b);
  return rgbToHex(start.map((value, index) => value * (1 - t) + end[index] * t));
};

const grayAtPercent = (percent) => {
  const value = Math.round((percent / 100) * 255);
  return rgbToHex([value, value, value]);
};

const cmsStep = (name, base, tint, shade, mix) =>
  wizardBars(
    "Color Management",
    `${name} hue, saturation, brightness`,
    `Adjust ${name.toLowerCase()} hue first, then saturation, then brightness. Use the tint and shade bars to keep the channel balanced rather than just making the main bar “pop”.`,
    [
      `Hue: make the ${name.toLowerCase()} bar sit correctly between its neighboring mix colors.`,
      "Saturation: increase until the color is strong but not neon or bleeding.",
      "Brightness: match depth without crushing detail in the darker shade.",
    ],
    [
      { color: base, label: `${name} target` },
      { color: tint, label: `${name} tint` },
      { color: shade, label: `${name} shade` },
      { color: mix, label: `${name} mix` },
    ],
  );

export const wizardSteps = [
  wizardBars(
    "Start",
    "Wizard overview",
    "Work through the controls in order while comparing your adjustable display against the reference display on the other half. The wizard is arranged so broad controls settle first, then black level, then white balance, then per-color tuning. Use Previous whenever a later change makes an earlier match drift.",
    [
      "1. Match overall color intensity to the reference side.",
      "2. Match shadow balance with RGB offset.",
      "3. Match highlight balance with RGB gain.",
      "4. Match each color control against the reference image.",
    ],
    [
      { color: "#2b2b2b", label: "Neutral anchor" },
      { color: "#d7a07b", label: "Skin reference" },
      { color: "#00a8b5", label: "Cyan reference" },
      { color: "#c03b8a", label: "Magenta reference" },
    ],
  ),
  wizardBars(
    "Overall Color",
    "Global color saturation",
    "Set the display’s overall Color control by matching the adjustable side to the reference side. Do not aim for “vivid”; aim for the same color intensity as the reference projector.",
    [
      "If skin looks stronger than the reference, lower Color.",
      "If cyan and magenta look weaker than the reference, raise Color.",
      "Do not compensate for a red/green/blue cast here.",
    ],
    [
      { color: "#d8a07b", label: "Flesh tone" },
      { color: "#00afbf", label: "Cyan" },
      { color: "#c53a92", label: "Magenta" },
      { color: "#6d6d6d", label: "Gray anchor" },
    ],
  ),
  wizardBars(
    "Overall Color",
    "Validate overall color",
    "Recheck overall color with mixed hues. The adjustable side should track the reference side across all four bars before you move into black level.",
    [
      "Flesh tones should match the reference in strength, not just look plausible.",
      "Yellow should match without drifting green or orange relative to the reference.",
      "Gray should remain neutral on both halves.",
    ],
    [
      { color: "#f0c59d", label: "Light flesh" },
      { color: "#d9b13b", label: "Yellow" },
      { color: "#7ec8d8", label: "Cyan tint" },
      { color: "#8a8a8a", label: "Neutral gray" },
    ],
  ),
  wizardBars(
    "RGB Offset",
    "R, G, B offset near black",
    "Use RGB offset to remove shadow color casts, not to make the image brighter. Compare the adjustable side to the reference side and match the tint of these near-black bars. When offset is correct, the colored shadow bars should lose their red, green, or blue push and sit closer to the reference.",
    [
      "Ignore overall brightness here and watch only the hue of the dark bars.",
      "If the shadow bars look redder than the reference, reduce red offset.",
      "If the shadow bars look greener or bluer than the reference, trim that channel only.",
    ],
    [
      { color: "#1c1c1c", label: "Neutral shadow" },
      { color: "#2a1c1c", label: "Red shadow cast" },
      { color: "#1c281c", label: "Green shadow cast" },
      { color: "#1c1c2a", label: "Blue shadow cast" },
    ],
  ),
  wizardGrayBars(
    "RGB Offset",
    "Validate offset on dark ramps",
    "Use this to confirm the dark grayscale now tracks the reference side. These should still be visibly dark, but the adjustable side should no longer lean warm, cool, green, or magenta in the shadows.",
    [
      "Look for hue errors first, not brightness errors.",
      "If only the darkest bars are wrong, go back to offset.",
      "Do not try to fix highlight mismatches here.",
    ],
    ["#0c0c0c", "#141414", "#202020", "#2e2e2e"],
  ),
  wizardBars(
    "RGB Gain",
    "R, G, B gain near white",
    "Now tune gain with bright material only. Match the highlight balance of the adjustable side to the reference side. This is the white-balance control for highlights; it should not be used to fix dark grays.",
    [
      "If bright whites look warmer than the reference, reduce red gain or blue/green imbalance.",
      "If bright whites look yellow-green against the reference, reduce green gain.",
      "If bright whites look cooler than the reference, reduce blue gain.",
    ],
    [
      { color: "#cccccc", label: "Neutral highlight" },
      { color: "#d6c4c4", label: "Red high" },
      { color: "#c6d3c4", label: "Green high" },
      { color: "#c4cad6", label: "Blue high" },
    ],
  ),
  wizardGrayBars(
    "RGB Gain",
    "Validate gain on highlights",
    "Confirm the full grayscale against the reference side after gain. All visible gray shades should track smoothly from dark to bright without a red, green, or blue lean.",
    [
      "Dark, mid, and bright grays should all match the reference side.",
      "If only highlights drift, revisit gain.",
      "If only the darkest grays drift, revisit offset instead.",
    ],
    ["#121212", "#242424", "#383838", "#4f4f4f", "#686868", "#838383", "#a0a0a0", "#c0c0c0"],
  ),
  wizardGrayBars(
    "20-Point White Balance",
    "20-point white balance: lower grays",
    "Use these lower grayscale patches after the 2-point white balance is roughly correct. Match each patch to the reference side without reintroducing a cast in nearby levels.",
    [
      "Adjust only the matching low-end 20-point controls here.",
      "If all low patches drift the same way, revisit offset instead.",
      "Move in small steps and recheck neighboring patches.",
    ],
    [5, 10, 15, 20, 25, 30].map(grayAtPercent),
  ),
  wizardGrayBars(
    "20-Point White Balance",
    "20-point white balance: lower mid grays",
    "Continue with the lower-mid grayscale range. These should track the reference side smoothly without a tint shift between adjacent patches.",
    [
      "Watch transitions between neighboring gray levels.",
      "Do not chase one patch so hard that the next one breaks.",
      "If several adjacent patches drift together, revisit 2-point gain/offset first.",
    ],
    [35, 40, 45, 50, 55, 60].map(grayAtPercent),
  ),
  wizardGrayBars(
    "20-Point White Balance",
    "20-point white balance: upper mid grays",
    "Now tune the upper-mid region. This is often where slight color temperature shifts become more visible before the highlight end.",
    [
      "Keep the progression visually even against the reference side.",
      "Use neighboring patches to confirm a correction rather than a single patch in isolation.",
      "If highlights now drift globally, revisit gain.",
    ],
    [65, 70, 75, 80, 85, 90].map(grayAtPercent),
  ),
  wizardGrayBars(
    "20-Point White Balance",
    "20-point white balance: highlights",
    "Finish with the brightest grayscale points. These should agree with the reference side without adding color into white.",
    [
      "Use small corrections only at the top end.",
      "If the entire bright range shifts together, revisit gain instead of 20-point controls.",
      "Recheck the previous mid-gray screen after finishing here.",
    ],
    [80, 84, 88, 92, 96, 100].map(grayAtPercent),
  ),
  cmsStep("Red", "#bc2525", "#f08a8a", "#6e1717", "#b4546e"),
  cmsStep("Orange + Red", "#bc2525", "#b4546e", "#ff8c00", "#c45100"),
  cmsStep("Green", "#2f8f46", "#8fd39e", "#1f5f2f", "#7a9d4c"),
  wizardValidationBars(
    "Validate red + green together",
    "Now validate red, green, and several red+green mixtures only. Do not add unrelated colors here.",
    [
      "Check pure red against the reference.",
      "Check pure green against the reference.",
      "Check several different red+green mixture levels.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#2f8f46", label: "Green" },
      { color: mixHex("#bc2525", "#2f8f46", 0.2), label: "RG mix 20/80" },
      { color: mixHex("#bc2525", "#2f8f46", 0.4), label: "RG mix 40/60" },
      { color: mixHex("#bc2525", "#2f8f46", 0.6), label: "RG mix 60/40" },
      { color: mixHex("#bc2525", "#2f8f46", 0.8), label: "RG mix 80/20" },
    ],
  ),
  cmsStep("Blue", "#245ac2", "#7fa6ef", "#193c7d", "#5d65c6"),
  wizardValidationBars(
    "Validate red + blue together",
    "Now validate red, blue, and their mixtures only.",
    [
      "Check pure red against the reference.",
      "Check pure blue against the reference.",
      "Check several red+blue mixture levels.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#245ac2", label: "Blue" },
      { color: mixHex("#bc2525", "#245ac2", 0.2), label: "RB mix 20/80" },
      { color: mixHex("#bc2525", "#245ac2", 0.4), label: "RB mix 40/60" },
      { color: mixHex("#bc2525", "#245ac2", 0.6), label: "RB mix 60/40" },
      { color: mixHex("#bc2525", "#245ac2", 0.8), label: "RB mix 80/20" },
    ],
  ),
  wizardValidationBars(
    "Validate green + blue together",
    "Now validate green, blue, and their mixtures only.",
    [
      "Check pure green against the reference.",
      "Check pure blue against the reference.",
      "Check several green+blue mixture levels.",
    ],
    [
      { color: "#2f8f46", label: "Green" },
      { color: "#245ac2", label: "Blue" },
      { color: mixHex("#2f8f46", "#245ac2", 0.2), label: "GB mix 20/80" },
      { color: mixHex("#2f8f46", "#245ac2", 0.4), label: "GB mix 40/60" },
      { color: mixHex("#2f8f46", "#245ac2", 0.6), label: "GB mix 60/40" },
      { color: mixHex("#2f8f46", "#245ac2", 0.8), label: "GB mix 80/20" },
    ],
  ),
  wizardValidationBars(
    "Validate red + green + blue",
    "Now validate the three configured primaries together, along with one representative mix for each pair.",
    [
      "All three primaries should still match the reference.",
      "Each pairwise mix should still agree with the reference.",
      "If one primary drifted, go back to that primary before continuing.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#2f8f46", label: "Green" },
      { color: "#245ac2", label: "Blue" },
      { color: mixHex("#bc2525", "#2f8f46", 0.5), label: "RG mix" },
      { color: mixHex("#2f8f46", "#245ac2", 0.5), label: "GB mix" },
      { color: mixHex("#bc2525", "#245ac2", 0.5), label: "RB mix" },
    ],
  ),
  cmsStep("Yellow", "#d0b126", "#efe194", "#7f6b16", "#b3a764"),
  wizardValidationBars(
    "Validate yellow with red + green",
    "Yellow should now sit correctly relative to both red and green. If yellow matches but red or green no longer do, go back and iterate.",
    [
      "Yellow should look like the same red+green mix as on the reference side.",
      "Red should not be pulled orange by the yellow adjustment.",
      "Green should not be pulled olive by the yellow adjustment.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#2f8f46", label: "Green" },
      { color: "#d0b126", label: "Yellow" },
      { color: "#c98b2d", label: "Warm yellow" },
    ],
  ),
  cmsStep("Cyan", "#0aa8b8", "#8dd9df", "#08656f", "#6db7c0"),
  wizardValidationBars(
    "Validate cyan with green + blue",
    "Cyan should agree with green, blue, and their cyan-region mixtures only.",
    [
      "Cyan should match the reference in both hue and brightness.",
      "Green should still match after cyan tuning.",
      "Blue should still match after cyan tuning.",
    ],
    [
      { color: "#2f8f46", label: "Green" },
      { color: "#245ac2", label: "Blue" },
      { color: "#0aa8b8", label: "Cyan" },
      { color: mixHex("#2f8f46", "#245ac2", 0.5), label: "GB mix" },
      { color: mixHex("#0aa8b8", "#8dd9df", 0.5), label: "Cyan mix" },
      { color: "#87d6de", label: "Light cyan" },
    ],
  ),
  cmsStep("Magenta", "#b5318d", "#e4a0d0", "#6f1f57", "#b867b3"),
  wizardValidationBars(
    "Validate magenta with red + blue",
    "Magenta should agree with red, blue, and their magenta-region mixtures only.",
    [
      "Magenta should match the reference without going purple or pink.",
      "Red should still match after magenta tuning.",
      "Blue should still match after magenta tuning.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#245ac2", label: "Blue" },
      { color: "#b5318d", label: "Magenta" },
      { color: mixHex("#bc2525", "#245ac2", 0.5), label: "RB mix" },
      { color: "#db7aaa", label: "Pink-magenta" },
      { color: "#8c2768", label: "Deep magenta" },
    ],
  ),
  wizardBars(
    "Color Management",
    "Flesh tone hue, saturation, brightness",
    "Treat flesh tone as the orange control region used by many display CMS menus. Match the adjustable side to the reference side using pure orange-centered bars here, then rely on the later portrait validation step to confirm real faces.",
    [
      "Think of this step as orange, not a literal skin sampler.",
      "Use the bars to match the reference side in hue first, then saturation, then brightness.",
      "Do not compensate here for a white-balance mismatch that is visible everywhere.",
      "If skin only matches at one brightness level, revisit gain.",
    ],
    [
      { color: "#ff8c00", label: "Orange target" },
      { color: "#ffb04d", label: "Light orange" },
      { color: "#d96f00", label: "Deep orange" },
      { color: "#c45100", label: "Orange-red mix" },
    ],
  ),
  wizardValidationBars(
    "Validate red + orange focus",
    "Use this simpler four-bar screen to check the red-orange region directly before the broader flesh validation step.",
    [
      "Red should stay red and not get pulled orange.",
      "Orange should stay orange and not get pushed yellow.",
      "The existing mix colors should still sit naturally against red and orange.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#ff8c00", label: "Orange" },
      { color: "#c45100", label: "Orange-red mix" },
      { color: "#b4546e", label: "Red mix" },
    ],
  ),
  wizardValidationBars(
    "Validate flesh with red + orange",
    "This is the key interaction check for portrait work. Flesh should sit correctly between orange and red, without unrelated bars on screen.",
    [
      "Watch whether flesh looks too red against the reference.",
      "Watch whether orange looks too yellow or too dull against the reference.",
      "If flesh breaks while red and yellow each look fine alone, iterate here and then revisit red or yellow if needed.",
    ],
    [
      { color: "#bc2525", label: "Red" },
      { color: "#ff8c00", label: "Orange" },
      { color: mixHex("#bc2525", "#ff8c00", 0.25), label: "Orange-red 25/75" },
      { color: mixHex("#bc2525", "#ff8c00", 0.5), label: "Orange-red 50/50" },
      { color: mixHex("#bc2525", "#ff8c00", 0.75), label: "Orange-red 75/25" },
    ],
  ),
  wizardBars(
    "Review",
    "Review previous settings",
    "Run this final review and iterate if needed. Use Previous to jump back through gain, offset, or color controls until the adjustable side tracks the reference side for skin, cyan, magenta, and neutrals.",
    [
      "Skin should match the reference side, not merely look acceptable in isolation.",
      "Cyan and magenta should match the reference in both intensity and hue.",
      "Gray should remain neutral and equally bright across both halves.",
    ],
    [
      { color: "#d8a07b", label: "Skin" },
      { color: "#00afbf", label: "Cyan" },
      { color: "#c53a92", label: "Magenta" },
      { color: "#8a8a8a", label: "Gray" },
    ],
  ),
];
