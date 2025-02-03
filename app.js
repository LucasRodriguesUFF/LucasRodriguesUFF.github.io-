require([
  "esri/identity/IdentityManager",
  "esri/layers/FeatureLayer",
  "esri/request"
], function(IdentityManager, FeatureLayer, esriRequest) {

  const featureLayerURL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";
  let token = null;

  // 🔐 Função de login com usuário e senha
  function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("Por favor, insira seu usuário e senha do ArcGIS Online.");
      return;
    }

    esriRequest("https://www.arcgis.com/sharing/rest/generateToken", {
      method: "post",
      query: {
        username: username,
        password: password,
        referer: window.location.origin,
        f: "json"
      }
    }).then(function(response) {
      token = response.data.token;
      console.log("Token gerado:", token);
      document.getElementById("message").innerText = "Usuário autenticado!";
      document.getElementById("loginButton").disabled = true;
      document.getElementById("trpInput").disabled = false;
      document.getElementById("updateButton").disabled = false;
    }).catch(function(error) {
      console.error("Erro no login:", error);
      alert("Falha no login. Verifique seu usuário e senha.");
    });
  }

  // 📝 Função para atualizar TRP
  function updateTRP() {
    const trpValue = document.getElementById("trpInput").value;
    if (!trpValue) {
      alert("Por favor, digite um valor para TRP!");
      return;
    }

    if (!token) {
      alert("Você precisa estar logado para atualizar os dados.");
      return;
    }

    const featureLayer = new FeatureLayer({
      url: featureLayerURL
    });

    featureLayer.queryFeatures({
      where: "1=1",
      outFields: ["OBJECTID", "TRP"],
      returnGeometry: false
    }).then(function(result) {
      if (result.features.length > 0) {
        console.log(`${result.features.length} feições encontradas.`);

        const updates = result.features.map(feature => {
          feature.attributes.TRP = trpValue;
          return feature;
        });

        featureLayer.applyEdits({
          updateFeatures: updates
        }, { token }).then(function(response) {
          console.log("Resposta do applyEdits:", response);
          document.getElementById("message").innerText = "TRP atualizado com sucesso!";
        }).catch(function(error) {
          document.getElementById("message").innerText = "Erro ao atualizar: " + error.message;
        });

      } else {
        document.getElementById("message").innerText = "Nenhuma feição encontrada.";
      }
    }).catch(function(error) {
      document.getElementById("message").innerText = "Erro na consulta: " + error.message;
    });
  }

  // 🎯 Eventos dos botões
  document.getElementById("loginButton").addEventListener("click", login);
  document.getElementById("updateButton").addEventListener("click", updateTRP);
});
