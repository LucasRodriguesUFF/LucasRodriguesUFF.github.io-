require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/tasks/support/Query",
    "esri/Graphic",
    "dojo/dom",
    "dojo/on"
], function (Map, MapView, FeatureLayer, Query, Graphic, dom, on) {

    // URL da sua feature layer pública
    const featureLayerUrl = "https://services7.arcgis.com/7GykRXe6kzSnGDiL/arcgis/rest/services/Força_tarefa/FeatureServer/0";

    // Criar o mapa
    const map = new Map({
        basemap: "streets-navigation-vector"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-48.0, -16.0], // Coordenadas de exemplo
        zoom: 10
    });

    // Criar a camada de feição (FeatureLayer)
    const featureLayer = new FeatureLayer({
        url: featureLayerUrl
    });

    // Função que registra o nome na feature layer
    window.registrarNome = function() {
        const nome = document.getElementById('nomeInput').value;
        const resultado = document.getElementById('resultado');

        if (nome.trim() === "") {
            resultado.textContent = "Por favor, digite seu nome.";
            return;
        }

        // Criação de um novo gráfico (registro na camada)
        const graphic = new Graphic({
            geometry: {
                type: "point",  // Ponto como exemplo, use o tipo apropriado para sua camada
                longitude: -48.0,
                latitude: -16.0
            },
            attributes: {
                "TRP": nome  // Alterado para o campo TRP
            }
        });

        // Adicionar o gráfico à camada de feição
        featureLayer.applyEdits({
            addFeatures: [graphic]
        }).then(function() {
            resultado.textContent = `Nome "${nome}" registrado com sucesso!`;
        }).catch(function(error) {
            resultado.textContent = `Erro ao registrar o nome: ${error.message}`;
        });
    };

});
