require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/identity/IdentityManager",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",
  "dojo/dom",
  "dojo/domReady!"
], function(Map, MapView, FeatureLayer, IdentityManager, Query, QueryTask, dom) {

  // URL do Feature Layer
  const featureLayerURL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/For%C3%A7a_tarefa/FeatureServer"; // Altere para a URL correta

  // Função para garantir que o usuário esteja autenticado
  function ensureAuthenticated() {
    IdentityManager.getCredential(featureLayerURL).then(function(cred) {
      // Se o usuário estiver autenticado, podemos seguir para a atualização
      updateTRP();
    }).catch(function(error) {
      alert("Erro de autenticação: " + error.message);
    });
  }

  // Função para atualizar o campo TRP
  window.updateTRP = function() {
    const trpValue = document.getElementById("trpInput").value;

    if (!trpValue) {
      document.getElementById("message").innerText = "Por favor, insira um valor para o campo TRP!";
      return;
    }

    // Criar a camada de feições
    const featureLayer = new FeatureLayer({
      url: featureLayerURL
    });

    // Query para buscar feições
    const query = new Query();
    query.where = "1=1";  // Filtra todas as feições
    query.outFields = ["OBJECTID", "TRP"];
    query.returnGeometry = false;

    // Executar a consulta na camada
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

        // Realizar a atualização
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

  // Invocar a função para garantir a autenticação
  ensureAuthenticated();
});
