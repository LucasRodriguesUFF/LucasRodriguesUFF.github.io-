require([
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/rest/support/Query",
  "esri/rest/QueryTask",
  "dojo/dom",
  "dojo/domReady!"
], function(OAuthInfo, IdentityManager, Map, MapView, FeatureLayer, Query, QueryTask, dom) {

  let featureLayer;
  let userCredential;
  
  const featureLayerURL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";

  // Configuração de autenticação via OAuth
  const info = new OAuthInfo({
    appId: "YOUR_APP_ID", // Substitua pelo seu App ID do ArcGIS Online
    popup: true // Abre um pop-up para login
  });

  IdentityManager.registerOAuthInfos([info]);

  function login() {
    IdentityManager.getCredential(featureLayerURL)
      .then(function(cred) {
        userCredential = cred;
        console.log("Usuário autenticado:", cred);
        document.getElementById("message").innerText = "Usuário autenticado!";
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("updateButton").disabled = false;
      })
      .catch(function(error) {
        console.error("Erro de autenticação:", error);
        alert("Erro no login: " + error.message);
        document.getElementById("message").innerText = "Falha ao autenticar.";
      });
  }

  window.updateTRP = function() {
    const trpValue = document.getElementById("trpInput").value;
    if (!trpValue) {
      document.getElementById("message").innerText = "Insira um valor para o TRP!";
      return;
    }

    if (!userCredential) {
      alert("Você precisa estar logado!");
      return;
    }

    featureLayer = new FeatureLayer({
      url: featureLayerURL,
      authentication: userCredential
    });

    const query = new Query();
    query.where = "1=1";
    query.outFields = ["OBJECTID", "TRP"];
    query.returnGeometry = false;

    const queryTask = new QueryTask({
      url: featureLayerURL
    });

    queryTask.execute(query).then(function(result) {
      const features = result.features;
      if (features.length > 0) {
        console.log(`${features.length} feições encontradas.`);
        const updates = features.map(function(feature) {
          feature.attributes.TRP = trpValue;
          return feature;
        });

        featureLayer.applyEdits({
          updateFeatures: updates
        }).then(function(response) {
          console.log("Resposta do applyEdits:", response);
          if (response.updateFeatureResults && response.updateFeatureResults.length > 0) {
            document.getElementById("message").innerText = "TRP atualizado com sucesso!";
          } else {
            document.getElementById("message").innerText = "Nenhuma feição foi atualizada.";
          }
        }).catch(function(error) {
          document.getElementById("message").innerText = "Erro ao atualizar TRP: " + error.message;
        });
      } else {
        document.getElementById("message").innerText = "Nenhuma feição encontrada.";
      }
    }).catch(function(error) {
      document.getElementById("message").innerText = "Erro na consulta: " + error.message;
    });
  };

  document.getElementById("loginButton").addEventListener("click", function() {
    login();
  });

  document.getElementById("updateButton").addEventListener("click", function() {
    updateTRP();
  });

});
