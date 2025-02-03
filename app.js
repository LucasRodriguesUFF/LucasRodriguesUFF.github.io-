require([
    "esri/identity/IdentityManager",
    "esri/layers/FeatureLayer"
], function(IdentityManager, FeatureLayer) {

    const FEATURE_LAYERS = [
        "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0",
        "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Linhas_TRP/FeatureServer/1",
        "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Pontos_TRP/FeatureServer/5"
    ];

    const AGOL_PORTAL_URL = "https://environpact.maps.arcgis.com";
    
    // Seleção segura de elementos após o carregamento
    let dom;
    document.addEventListener('DOMContentLoaded', () => {
        dom = {
            updateButton: document.getElementById("updateButton"),
            message: document.getElementById("message"),
            trpInput: document.getElementById("trpInput")
        };
        
        dom.updateButton.addEventListener("click", handleUpdate);
    });

    async function handleUpdate() {
        try {
            const newValue = dom.trpInput.value.trim();
            if (!newValue) {
                showMessage("Digite um valor válido!", "error");
                return;
            }

            // Autenticação automática
            const credential = await IdentityManager.getCredential(AGOL_PORTAL_URL);

            // Coletar dados de todas as camadas
            let totalFeatures = 0;
            const layersData = [];
            
            for (const url of FEATURE_LAYERS) {
                const layer = new FeatureLayer({ 
                    url, 
                    authentication: IdentityManager 
                });
                const features = await queryFeatures(layer);
                if (features.length > 0) {
                    layersData.push({ layer, features });
                    totalFeatures += features.length;
                }
            }

            if (totalFeatures === 0) {
                showMessage("Nenhum registro encontrado nas camadas", "warning");
                return;
            }

            // Confirmação
            const confirmed = await showConfirmationModal(
                `Atualizar ${totalFeatures} registros em ${layersData.length} camadas?`
            );

            if (!confirmed) {
                showMessage("Atualização cancelada", "info");
                return;
            }

            // Atualização em massa
            let successCount = 0;
            for (const { layer, features } of layersData) {
                const result = await applyUpdates(layer, features, newValue);
                successCount += result.updateFeatureResults.length;
            }

            showMessage(
                `${successCount}/${totalFeatures} registros atualizados com sucesso!`,
                successCount === totalFeatures ? "success" : "warning"
            );

        } catch (error) {
            console.error("Erro geral:", error);
            showMessage("Erro na operação: " + error.message, "error");
        }
    }

    // Restante do código permanece igual...
});
