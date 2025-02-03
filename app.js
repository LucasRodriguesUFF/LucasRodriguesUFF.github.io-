require([
    "esri/identity/IdentityManager",
    "esri/layers/FeatureLayer"
], function(IdentityManager, FeatureLayer) {

    // Configurações
    const FEATURE_LAYER_URL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";
    const AGOL_PORTAL_URL = "https://environpact.maps.arcgis.com";

    // Elementos DOM
    const loginButton = document.getElementById("loginButton");
    const updateButton = document.getElementById("updateButton");
    const message = document.getElementById("message");
    
    // Variáveis globais
    let featureLayer, activeToken;

    // Event Listeners
    loginButton.addEventListener("click", handleLogin);
    updateButton.addEventListener("click", handleUpdate);

    async function handleLogin() {
        try {
            const credential = await IdentityManager.getCredential(
                AGOL_PORTAL_URL,
                {
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value
                }
            );

            activeToken = credential.token;
            toggleUI(true);
            showMessage("Autenticação bem-sucedida!", "success");
            
            // Inicializar Feature Layer
            featureLayer = new FeatureLayer({
                url: FEATURE_LAYER_URL,
                authentication: IdentityManager
            });

        } catch (error) {
            console.error("Erro de autenticação:", error);
            showMessage("Falha na autenticação. Verifique suas credenciais.", "error");
        }
    }

    async function handleUpdate() {
        const newTRP = document.getElementById("trpInput").value;
        
        if (!newTRP || isNaN(newTRP)) {
            showMessage("Valor do TRP inválido!", "error");
            return;
        }

        try {
            const edits = {
                updateFeatures: [{
                    attributes: {
                        OBJECTID: 30, // Substituir pelo ID correto
                        TRP: parseFloat(newTRP)
                    }
                }]
            };

            const response = await featureLayer.applyEdits(edits);
            
            if(response.updateFeatureResults.length > 0) {
                showMessage("TRP atualizado com sucesso!", "success");
            } else {
                throw new Error("Nenhum registro atualizado");
            }
            
        } catch (error) {
            console.error("Erro na atualização:", error);
            showMessage("Falha na atualização. Tente novamente.", "error");
        }
    }

    // Funções auxiliares
    function toggleUI(loggedIn) {
        document.getElementById("loginSection").style.display = loggedIn ? "none" : "block";
        document.getElementById("updateSection").style.display = loggedIn ? "block" : "none";
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message-${type}`;
    }
});
