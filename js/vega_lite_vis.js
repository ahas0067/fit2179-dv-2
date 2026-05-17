var vg_1 = "charts/chart_01_sport_ranking.vg.json";
var vg_2 = "charts/chart_02_state_participation_map.vg.json";
var vg_3 = "charts/chart_03_state_scatter.vg.json";

vegaEmbed("#sport-ranking-chart", vg_1, {
  actions: false
}).then(function(result) {
  // The Vega view is available as result.view
}).catch(console.error);

vegaEmbed("#state-participation-map", vg_2, {
  actions: false
}).then(function(result) {
  // The Vega view is available as result.view
}).catch(console.error);

vegaEmbed("#state-scatter-chart", vg_3, {
  actions: false
}).then(function(result) {
  // The Vega view is available as result.view
}).catch(console.error);