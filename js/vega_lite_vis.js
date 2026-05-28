const charts = [
  {
    selector: "#sport-ranking-chart",
    specPath: "charts/chart_01_sport_ranking.vg.json",
    type: "bar"
  },
  {
    selector: "#state-participation-map",
    specPath: "charts/chart_02_state_participation_map.vg.json",
    type: "map"
  },
  {
    selector: "#state-scatter-chart",
    specPath: "charts/chart_03_state_scatter.vg.json",
    type: "scatter"
  },
  {
    selector: "#adult-child-chart",
    specPath: "charts/chart_04_adults_vs_children.vg.json",
    type: "bar"
  },
  {
    selector: "#gender-participation-chart",
    specPath: "charts/chart_05_gender_participation.vg.json",
    type: "bar"
  },
  {
    selector: "#age-participation-chart",
    specPath: "charts/chart_06_age_participation_lollipop.vg.json",
    type: "bar"
  },
  {
    selector: "#organised-status-chart",
    specPath: "charts/chart_07_organised_status.vg.json",
    type: "pie"
  },
  {
    selector: "#organiser-type-chart",
    specPath: "charts/chart_08_organiser_type.vg.json",
    type: "dotplot"
  }
];

const loadedSpecs = {};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getResponsiveSize(container, chartType) {
  const containerWidth = container.clientWidth;

  if (chartType === "map") {
    return {
      width: containerWidth,
      height: clamp(containerWidth * 0.62, 430, 560)
    };
  }

  if (chartType === "scatter") {
    return {
      width: containerWidth,
      height: clamp(containerWidth * 0.62, 430, 560)
    };
  }

  if (chartType === "pie") {
    return {
      width: containerWidth,
      height: clamp(containerWidth * 0.42, 360, 460)
    };
  }

  if (chartType === "dotplot") {
    return {
      width: containerWidth,
      height: clamp(containerWidth * 0.42, 360, 500)
    };
  }

  return {
    width: containerWidth,
    height: clamp(containerWidth * 0.42, 340, 460)
  };
}

function applyResponsiveSettings(spec, chartType, size) {
  const responsiveSpec = structuredClone(spec);

  responsiveSpec.width = size.width;
  responsiveSpec.height = size.height;

  if (chartType === "map") {
    responsiveSpec.projection = {
      type: "mercator",
      center: [134, -28],
      scale: size.width * 0.86,
      translate: [size.width / 2, size.height / 2 + 10]
    };
  }

  return responsiveSpec;
}

async function loadSpec(chart) {
  if (!loadedSpecs[chart.specPath]) {
    const response = await fetch(chart.specPath);
    loadedSpecs[chart.specPath] = await response.json();
  }

  return loadedSpecs[chart.specPath];
}

async function renderChart(chart) {
  const container = document.querySelector(chart.selector);

  if (!container) {
    return;
  }

  const baseSpec = await loadSpec(chart);
  const size = getResponsiveSize(container, chart.type);
  const responsiveSpec = applyResponsiveSettings(baseSpec, chart.type, size);

  container.innerHTML = "";

  await vegaEmbed(chart.selector, responsiveSpec, {
    actions: false
  });
}

async function renderAllCharts() {
  for (const chart of charts) {
    await renderChart(chart);
  }
}

let resizeTimer;

window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(function () {
    renderAllCharts();
  }, 250);
});

renderAllCharts();