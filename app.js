require([
    "esri/identity/IdentityManager",
    "esri/layers/FeatureLayer"
], function(IdentityManager, FeatureLayer) {

    // Configuração do serviço
    const FEATURE_LAYER_URL = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";
    const AGOL_PORTAL_URL = "https://environpact.maps.arcgis.com";

    // Elementos da interface
    const dom = {
        loginButton: document.getElementById("loginButton"),
        updateButton: document.getElementById("updateButton"),
        message: document.getElementById("message"),
        username: document.getElementById("username"),
        password: document.getElementById("password"),
        trpInput: document.getElementById("trpInput")
    };

    let featureLayer;

    // Eventos
    dom.loginButton.addEventListener("click", handleLogin);
    dom.updateButton.addEventListener("click", handleUpdate);

    async function handleLogin() {
        try {
            showMessage("Autenticando...", "info");
            
            const credential = await IdentityManager.getCredential(
                AGOL_PORTAL_URL,
                {
                    username: dom.username.value.trim(),
                    password: dom.password.value.trim()
                }
            );

            initializeFeatureLayer(credential);
            toggleUI(true);
            showMessage("Autenticação bem-sucedida!", "success");

        } catch (error) {
            console.error("Erro de login:", error);
            showMessage("Falha na autenticação: " + error.message, "error");
        }
    }

    async function handleUpdate() {
        try {
            const newValue = dom.trpInput.value.trim();
            if (!newValue) {
                showMessage("Digite um valor válido!", "error");
                return;
            }

            showMessage("Buscando registros...", "info");
            const features = await queryAllFeatures();
            
            if (!features.length) {
                showMessage("Nenhum registro encontrado", "warning");
                return;
            }

            // Mostra o modal de confirmação
            const confirmed = await showConfirmationModal(
                `Deseja atualizar TODOS os ${features.length} registros?`
            );

            if (!confirmed) {
                showMessage("Atualização cancelada", "info");
                return;
            }

            showMessage("Atualizando...", "info");
            const result = await updateAllFeatures(features, newValue);
            
            if (result.updateFeatureResults.length === features.length) {
                showMessage(`${features.length} registros atualizados!`, "success");
            } else {
                throw new Error("Alguns registros não foram atualizados");
            }

        } catch (error) {
            console.error("Erro na atualização:", error);
            showMessage("Erro: " + error.message, "error");
        }
    }

    async function queryAllFeatures() {
        const query = featureLayer.createQuery();
        query.where = "TRP IS NULL OR TRP = ''";
        query.outFields = ["ObjectID", "TRP"];
        query.returnGeometry = false;
        
        const result = await featureLayer.queryFeatures(query);
        return result.features;
    }

    async function updateAllFeatures(features, newValue) {
        const edits = {
            updateFeatures: features.map(feature => ({
                attributes: {
                    OBJECTID: feature.attributes.OBJECTID,
                    TRP: newValue
                }
            }))
        };

        return featureLayer.applyEdits(edits);
    }

    function initializeFeatureLayer(credential) {
        featureLayer = new FeatureLayer({
            url: FEATURE_LAYER_URL,
            authentication: IdentityManager
        });
    }

    function toggleUI(loggedIn) {
        document.getElementById("loginSection").style.display = loggedIn ? "none" : "block";
        document.getElementById("updateSection").style.display = loggedIn ? "block" : "none";
    }

    function showMessage(text, type = "info") {
        dom.message.textContent = text;
        dom.message.className = `message-${type}`;
    }

    // Função para mostrar o modal de confirmação
    function showConfirmationModal(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById("confirmationModal");
            const modalMessage = document.getElementById("modalMessage");
            
            modalMessage.textContent = message;
            modal.classList.remove("hidden");

            const handleResponse = (confirmed) => {
                modal.classList.add("hidden");
                document.getElementById("confirmYes").removeEventListener("click", yesHandler);
                document.getElementById("confirmNo").removeEventListener("click", noHandler);
                resolve(confirmed);
            };

            const yesHandler = () => handleResponse(true);
            const noHandler = () => handleResponse(false);

            document.getElementById("confirmYes").addEventListener("click", yesHandler);
            document.getElementById("confirmNo").addEventListener("click", noHandler);
        });
    }
});
