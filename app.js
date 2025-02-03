require([
    "esri/identity/IdentityManager",
    "esri/layers/FeatureLayer"
], function(IdentityManager, FeatureLayer) {

    // 🔗 URL da camada
    var featureLayerUrl = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";

    // 🔑 Define a autenticação no ambiente ENVIRONPACT
    IdentityManager.getCredential("https://environpact.maps.arcgis.com/sharing/rest")
        .then(function(credential) {
            console.log("Usuário autenticado:", credential.userId);
            iniciarEdicao(credential.token);
        })
        .catch(function(error) {
            console.error("Erro ao autenticar:", error);
            alert("Erro ao autenticar no ArcGIS Online.");
        });

    function iniciarEdicao(token) {
        var featureLayer = new FeatureLayer({
            url: featureLayerUrl,
            authentication: IdentityManager
        });

        document.getElementById("botaoAtualizar").addEventListener("click", function() {
            atualizarTRP(featureLayer);
        });
    }

    function atualizarTRP(featureLayer) {
        var edits = {
            updateFeatures: [{
                attributes: {
                    OBJECTID: 1,  // Troque pelo ID correto do objeto
                    TRP: "Novo Valor"
                }
            }]
        };

        featureLayer.applyEdits(edits)
            .then(function(response) {
                console.log("Edição aplicada:", response);
                alert("Campo atualizado com sucesso!");
            })
            .catch(function(error) {
                console.error("Erro ao atualizar:", error);
                alert("Erro ao atualizar a camada.");
            });
    }
});
