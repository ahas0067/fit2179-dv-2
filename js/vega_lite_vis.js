const charts = [
  { selector: "#sport-ranking-chart",        specPath: "charts/chart_01_sport_ranking.vg.json",             type: "bar"     },
  { selector: "#state-participation-map",    specPath: "charts/chart_02_state_participation_map.vg.json",   type: "map"     },
  { selector: "#state-scatter-chart",        specPath: "charts/chart_03_state_scatter.vg.json",             type: "scatter" },
  { selector: "#adult-child-chart",          specPath: "charts/chart_04_adults_vs_children.vg.json",        type: "bar"     },
  { selector: "#gender-participation-chart", specPath: "charts/chart_05_gender_participation.vg.json",      type: "bar"     },
  { selector: "#age-participation-chart",    specPath: "charts/chart_06_age_participation_lollipop.vg.json",type: "bar"     },
  { selector: "#organised-status-chart",     specPath: "charts/chart_07_organised_status.vg.json",          type: "pie"     },
  { selector: "#organiser-type-chart",       specPath: "charts/chart_08_organiser_type.vg.json",            type: "dotplot" },
  { selector: "#facilities-by-lga-chart",    specPath: "charts/chart_09_facilities_by_lga.vg.json",        type: "bar"     },
  { selector: "#facilities-dot-map",         specPath: "charts/chart_10_facilities_dot_map.vg.json",        type: "vicmap"  }
];

const loadedSpecs = {};

// ── Map metric switcher ───────────────────────────────────────────────────────

let currentMapMetric = "total";

const mapMetricConfig = {
  total: {
    field: "derived_total_participation_rate_pct",
    title: "Victoria records the strongest basketball participation rate",
    subtitle: "Derived total basketball participation rate by state and territory, 2025",
    domain: [0, 7]
  },
  adult: {
    field: "adult_participation_rate_pct",
    title: "Adult participation rate is highest in Victoria and Western Australia",
    subtitle: "Adult basketball participation rate by state and territory, 2025",
    domain: [0, 7]
  },
  child: {
    field: "child_participation_rate_pct",
    title: "Child participation is strongest in Victoria and the ACT",
    subtitle: "Child basketball participation rate by state and territory, 2025",
    domain: [0, 16]
  }
};

function applyMapMetric(spec, metric) {
  const patched = structuredClone(spec);
  const cfg = mapMetricConfig[metric];

  patched.title.text = cfg.title;
  patched.title.subtitle = cfg.subtitle;

  const geoshapeLayer = patched.layer[0];
  geoshapeLayer.encoding.color.field = cfg.field;
  geoshapeLayer.encoding.color.scale.domain = cfg.domain;

  const maxVal = cfg.domain[1];
  const step = maxVal <= 8 ? 1 : 2;
  geoshapeLayer.encoding.color.legend.values = Array.from(
    { length: Math.floor(maxVal / step) + 1 },
    (_, i) => i * step
  );

  geoshapeLayer.encoding.tooltip = [
    { field: "properties.STATE_NAME",        type: "nominal",      title: "State/territory" },
    { field: cfg.field,                       type: "quantitative", title: "Participation rate (%)", format: ".1f" },
    { field: "total_participants_est",        type: "quantitative", title: "Estimated participants", format: "," },
    { field: "adult_participation_rate_pct",  type: "quantitative", title: "Adult rate (%)",  format: ".1f" },
    { field: "child_participation_rate_pct",  type: "quantitative", title: "Child rate (%)",  format: ".1f" }
  ];

  return patched;
}

async function switchMapMetric(metric, buttonEl) {
  currentMapMetric = metric;

  buttonEl.closest(".map-switcher").querySelectorAll(".map-btn").forEach(btn => btn.classList.remove("active"));
  buttonEl.classList.add("active");

  const mapChart = charts.find(c => c.selector === "#state-participation-map");
  const baseSpec = await loadSpec(mapChart);
  const container = document.querySelector(mapChart.selector);
  const size = getResponsiveSize(container, mapChart.type);

  let responsiveSpec = applyResponsiveSettings(baseSpec, mapChart.type, size);
  responsiveSpec = applyMapMetric(responsiveSpec, metric);

  container.innerHTML = "";
  await vegaEmbed(mapChart.selector, responsiveSpec, { actions: false });
}

// ── Scatter state highlighter ─────────────────────────────────────────────────

let currentScatterState = "Victoria";

async function switchScatterState(state) {
  currentScatterState = state;

  const scatterChart = charts.find(c => c.selector === "#state-scatter-chart");
  const baseSpec = await loadSpec(scatterChart);
  const container = document.querySelector(scatterChart.selector);
  const size = getResponsiveSize(container, scatterChart.type);

  let responsiveSpec = applyResponsiveSettings(baseSpec, scatterChart.type, size);
  responsiveSpec.params[0].value = state;

  container.innerHTML = "";
  await vegaEmbed(scatterChart.selector, responsiveSpec, { actions: false });
}

// ── Facilities type filter ───────────────────────────────────────────────────

let currentFacilityFilter = "All";

async function switchFacilityFilter(filter, buttonEl) {
  currentFacilityFilter = filter;

  // Update button active state — scoped to the facilities map's switcher group
  buttonEl.closest(".map-switcher").querySelectorAll(".map-btn").forEach(btn => btn.classList.remove("active"));
  buttonEl.classList.add("active");

  const vicMapChart = charts.find(c => c.selector === "#facilities-dot-map");
  const baseSpec = await loadSpec(vicMapChart);
  const container = document.querySelector(vicMapChart.selector);
  const size = getResponsiveSize(container, vicMapChart.type);

  let responsiveSpec = applyResponsiveSettings(baseSpec, vicMapChart.type, size);
  responsiveSpec.params[0].value = filter;

  container.innerHTML = "";
  await vegaEmbed(vicMapChart.selector, responsiveSpec, { actions: false });
}

// ── Core rendering helpers ────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getResponsiveSize(container, chartType) {
  const containerWidth = container.clientWidth;

  if (chartType === "map")     return { width: containerWidth, height: clamp(containerWidth * 0.65, 430, 620) };
  if (chartType === "scatter") return { width: containerWidth, height: clamp(containerWidth * 0.62, 430, 560) };
  if (chartType === "pie")     return { width: containerWidth, height: clamp(containerWidth * 0.42, 360, 460) };
  if (chartType === "dotplot") return { width: containerWidth, height: clamp(containerWidth * 0.42, 360, 500) };
  if (chartType === "vicmap")  return { width: containerWidth, height: clamp(containerWidth * 0.62, 460, 620) };

  return { width: containerWidth, height: clamp(containerWidth * 0.42, 340, 460) };
}

function applyResponsiveSettings(spec, chartType, size) {
  const responsiveSpec = structuredClone(spec);

  responsiveSpec.width  = size.width;
  responsiveSpec.height = size.height;

  if (chartType === "map") {
    responsiveSpec.projection = {
      type: "mercator",
      center: [134, -30],
      scale: size.width * 0.78,
      translate: [size.width / 2, size.height / 2 - 10]
    };
  }

  if (chartType === "vicmap") {
    responsiveSpec.projection = {
      type: "mercator",
      center: [144.8, -36.9],
      scale: size.width * 4.85,
      translate: [size.width / 2 - 115, size.height / 2 + 10]
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
  if (!container) return;

  const baseSpec = await loadSpec(chart);
  const size = getResponsiveSize(container, chart.type);
  let responsiveSpec = applyResponsiveSettings(baseSpec, chart.type, size);

  if (chart.selector === "#state-participation-map") {
    responsiveSpec = applyMapMetric(responsiveSpec, currentMapMetric);
  }

  if (chart.selector === "#state-scatter-chart" && responsiveSpec.params) {
    responsiveSpec.params[0].value = currentScatterState;
  }

  if (chart.selector === "#facilities-dot-map" && responsiveSpec.params) {
    responsiveSpec.params[0].value = currentFacilityFilter;
  }

  container.innerHTML = "";
  await vegaEmbed(chart.selector, responsiveSpec, { actions: false });
}

async function renderAllCharts() {
  for (const chart of charts) {
    await renderChart(chart);
  }
}

let resizeTimer;

window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderAllCharts, 250);
});

renderAllCharts();