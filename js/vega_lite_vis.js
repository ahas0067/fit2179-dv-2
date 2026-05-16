var vg_1 = "charts/chart_01_sport_ranking.vg.json";

vegaEmbed("#sport-ranking-chart", vg_1, {
  actions: false
}).then(function(result) {
  // The Vega view is available as result.view
}).catch(console.error);