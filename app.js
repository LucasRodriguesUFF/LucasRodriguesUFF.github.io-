require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",
  "dojo/dom",
  "dojo/domReady!"
], function(Map, MapView, FeatureLayer, Query, QueryTask, dom) {
  
  let featureLayer;

  // Defina a URL do Feature Layer
  const featureLayerURL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Seu_Feature_Layer/FeatureServer/0"; // Altere para a URL correta

  // Crie a camada de feições
  featureLayer = new FeatureLayer({
    url: featureLayerURL
  });

  // Função para atualizar o campo "TRP"
  window.updateTRP = function() {
    const trpValue = document.getElementById("trpInput").value;

    if (!trpValue) {
      document.getElementById("message").innerText = "Por favor, insira um valor para o campo TRP!";
      return;
    }

    // Query para buscar feições
    const query = new Query();
    query.where = "1=1";  // Esse critério pode ser ajustado conforme necessário
    query.outFields = ["OBJECTID", "TRP"];
    query.returnGeometry = false;

    // Executar a query e atualizar o campo "TRP"
    const queryTask = new QueryTask({
      url: featureLayerURL
    });

    queryTask.execute(query).then(function(result) {
      const features = result.features;
      
      if (features.length > 0) {
        const updates = features.map(function(feature) {
          feature.attributes.TR = trpValue; // Atualiza o campo "TRP"
          return feature;
        });

        // Realiza a atualização
        featureLayer.applyEdits({
          updateFeatures: updates
        }).then(function(response) {
          document.getElementById("message").innerText = "Campo TRP atualizado com sucesso!";
        }).catch(function(error) {
          document.getElementById("message").innerText = "Erro ao atualizar o campo TRP: " + error.message;
        });
      } else {
        document.getElementById("message").innerText = "Nenhuma feição encontrada para atualizar.";
      }
    }).catch(function(error) {
      document.getElementById("message").innerText = "Erro na execução da consulta: " + error.message;
    });
  };
});
