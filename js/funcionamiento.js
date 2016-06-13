var selectedLayerTop;
var ws = [];
var ds = [];
var l = [];
var capas_seleccionadas = [];
      //
      // var wmsSource = new ol.source.ImageWMS({
      //   url: 'http://localhost/geoserver/test/wms',
      //   params: {'LAYERS': 'test:LP_INDUSTRIAS_22185_Merge1'}
      // });
      //
      // var wmsLayer = new ol.layer.Image({
      //   source: wmsSource,
      //   name: 'Puntitos',
      // });

      var osmLayer = new ol.layer.Tile({
          preload: Infinity,
          source: new ol.source.OSM(),
          name: 'Tierra',
      });

      var view = new ol.View({
        center: [0, 0],
        zoom: 2,
      });

      getWorkspaces();
      //getDatastores(ws[1]); /*onload*/
      //getLayers(ws[1],ds[1]); /*onload*/

      //$( "#workspaces" ).change( displayDatastores );
      //$( "#datastores" ).change( displayLayers );
      //$( "#layers" ).change( selectLayers );
      $( "#workspaces" ).change( displayAllLayers );
      $( "#datastores" ).change( showDatastoreDescription );
      $( "#layers" ).change( showLayerDescription );

var defa = -1;

function getWorkspaces(){
  $.getJSON( "../geoserver/rest/workspaces.json", function( jsons ) {
    ws = jsons.workspaces.workspace;
      $.each(ws, function(key, value) {
    //  console.log(key);
    if (value.name.toLowerCase() == 'default') {
      defa = key;
    }
     $('#workspaces')
         .append($("<option></option>")
         .attr("value",key)
         .text(value.name));
    });
  });
}

function getDatastores(workspaces_index){
  ds = []
  $.each( workspaces_index, function(key, value){
    $.getJSON( "../geoserver/rest/workspaces/"+ws[value].name+"/datastores.json", function( jsons ) {
      var aux = jsons.dataStores.dataStore;
      $.each(aux, function(key2, value2) {
        aux[key2]['workspace'] = value;
      });
      ds = ds.concat(aux);
      showDatastores();
    });
  });
}



function showDatastores(){
  $( "#datastores" ).empty();
  $( "#layers" ).empty();
  $.each(ds, function(key, value) {
    $('#datastores')
       .append($("<option></option>")
       .attr("value",key)
       .text(value.name));
    });
}

function getLayers(datastores_index){
  l = [];
  $( "#layers" ).empty();
  $.each( datastores_index, function(key, value){
    //console.log( "JSON Data: " + JSON.stringify(datastores_index, null, 2) );
    $.getJSON( "../geoserver/rest/workspaces/"+ws[ds[value].workspace].name+"/datastores/"+ds[value].name+"/featuretypes.json", function( jsons ) {
      var aux = jsons.featureTypes.featureType;
      $.each(aux, function(key2, value2) {
        aux[key2]['datastore'] = value;
      });
      l = l.concat(aux);
      showLayers();
    });
  });
}

function showLayers(){
  $( "#layers" ).empty();
  //console.log( "JSON Data: " + JSON.stringify(jsons, null, 2) );
  $.each(l, function(key, value) {
    $('#layers')
       .append($("<option></option>")
       .attr("value",key)
       .text(value.name));
    });
}


function getAllLayers(workspaces_index){
  ds = [];
  l = [];
  $( "#datastores" ).empty();
  $( "#layers" ).empty();
  capas_seleccionadas = [];
  var datastores_index = [];
  //workspaces_index.push(defa);
  $.each( workspaces_index, function(key, value){
    //console.log(ws[value]);
    $.getJSON( "../geoserver/rest/workspaces/"+ws[value].name+"/datastores.json", function( jsons ) {
      var aux_datastores = jsons.dataStores.dataStore;
      ds = ds.concat(aux_datastores);
      //datastores_index.push(key);
      $.each( aux_datastores, function(key2, value2){
        aux_datastores[key2]['workspace'] = value;
        $('#datastores')
           .append($("<option></option>")
           .text(value2.name));
        //console.log(key2, value2);
        $.getJSON( "../geoserver/rest/workspaces/"+ws[value].name+"/datastores/"+value2.name+"/featuretypes.json", function( jsons ) {
          var aux_layers = jsons.featureTypes.featureType;
          $.each(aux_layers, function(key2, value2) {
            aux_layers[key2]['datastore'] = value;
          });
          l = l.concat(aux_layers);
          $.each(aux_layers, function(key, value) {
            $('#layers')
               .append($("<option></option>")
               .text(value.name));
            });
            createMap();
        });
      });
    });
  });
}

function displayDatastores() {
  var multipleValues = $( "#workspaces" ).val() || [];
  getDatastores(multipleValues);
}

function displayAllLayers() {
  var x = $( "#workspaces" ).filter('[value="0"]');
  var multipleValues = $( "#workspaces" ).val() || [];
  getAllLayers(multipleValues);
  //console.log( l )
}

function showDatastoreDescription() {
  var item = $(this)
  var found = $.grep(ds, function(e){
    if(e.name) {
      return e.name == item.val()[0];
    } else {
      return false;
    }});
  //console.log(found[0].href);
  url = found[0].href.split('/');
  url[2] = "..";
  $.getJSON( url.join('/'), function( jsons ) {
    document.getElementById('descriptionInfo').innerHTML = "Datastore Info: " + jsons.dataStore.description;
  });
}

function showLayerDescription() {
  var item = $(this)
  var found = $.grep(l, function(e){
    if(e.name) {
      return e.name == item.val()[0];
    } else {
      return false;
    }});
  //console.log(found[0].href);
  url = found[0].href.split('/');
  url[2] = "..";
  $.getJSON( url.join('/'), function( jsons ) {
    document.getElementById('descriptionInfo').innerHTML = "Layer Info: " + jsons.featureType.abstract;
  });
}

function displayLayers() {
  var multipleValues = $( "#datastores" ).val() || [];
  getLayers(multipleValues);
}

function selectLayers(){
  capas_seleccionadas = [];
  var multipleValues = $( "#layers" ).val() || [];
  $.each( multipleValues, function(key, value){
    //console.log( "JSON Data: " + JSON.stringify(l[value], null, 2) );
    capas_seleccionadas = capas_seleccionadas.concat(l[value]);
  });
  //console.log( "JSON Data: " + JSON.stringify(capas_seleccionadas, null, 2) );
  /* capas_seleccionadas ahora son las capas que se deben disponer el el tree y en el mapa */
  //createMap();
}


function getLayersWMS(baseMapArray){
  var wmsLayers = baseMapArray;
  //var capas = []
  $.each( l, function(key, value){
    var wmsSource = new ol.source.ImageWMS({
      url: '../geoserver/test/wms',
      params: {'LAYERS': ds[value.datastore]+':'+value.name}
    });
    var wmsLayer = new ol.layer.Image({
      source: wmsSource,
      name: value.name,
    });
    //console.log( wmsLayer );
    wmsLayers.push(wmsLayer);
  });
  //console.log( wmsLayers );
  return wmsLayers;
}

function updateMap(){
  $( '#map' ).empty();
  map = new ol.Map({
    layers: getLayersWMS([osmLayer]),
    target: 'map',
    view: view
  });
}

function createMap(){
  updateMap();

  map.on('singleclick', function(evt) {
    if (selectedLayerTop){
      document.getElementById('info').innerHTML = 'Cargando... ';
      var viewResolution = /** @type {number} */ (view.getResolution());
      var source = selectedLayerTop.getSource();
      var url = source.getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, view.getProjection(),
          {'INFO_FORMAT': 'text/html'});
      if (url) {
        document.getElementById('info').innerHTML =
            '<iframe seamless id="feature" src="' + url + '" onLoad="iframeDidLoad()";></iframe>';
      }
    } else {
      document.getElementById('info').innerHTML = 'Primero debe seleccionar una capa para ver y luego hacer click en un punto del mapa para ver su información. ';
      $('.nav-tabs a[href="#profile"]').tab('show')
    }
  });

  map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.forEachLayerAtPixel(pixel, function() {
      return true;
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });

  // Name the root layer group
  map.getLayerGroup().set('name', ws[$('#workspaces').val()].name);
  //map_base.getLayerGroup().set('name', 'Base');

  updateTree();
  buildTree();
}



      function iframeDidLoad() {
          // ESTO NO ES NESESARIO POR AHORA
          //$("").addClass("intro");
          //$("#feature").contents().find('table').removeClass('featureInfo').addClass('table table-condensed get-info-table');
          //$("#feature").contents().find('head').html('<link rel="stylesheet" href="../../Reunion/ol/bootstrap.min.css">');
          //$("#feature").contents().find('head').html('<link rel="stylesheet" href="../../Reunion/css/jaguar.css">');
      }

      // map.on('singleclick', function(evt) {
      //   document.getElementById('info').innerHTML = 'Cargando... ';
      //   var viewResolution = /** @type {number} */ (view.getResolution());
      //   var source = wmsLayer.getSource();
      //   var url = wmsSource.getGetFeatureInfoUrl(
      //       evt.coordinate, viewResolution, view.getProjection(),
      //       {'INFO_FORMAT': 'text/html'});
      //   if (url) {
      //     document.getElementById('info').innerHTML =
      //         '<iframe seamless id="feature" src="' + url + '" onLoad="iframeDidLoad()";></iframe>';
      //   }
      // });
      //
      // map.on('pointermove', function(evt) {
      //   if (evt.dragging) {
      //     return;
      //   }
      //   var pixel = map.getEventPixel(evt.originalEvent);
      //   var hit = map.forEachLayerAtPixel(pixel, function() {
      //     return true;
      //   });
      //   map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      // });
      //
      //
      //
      // // Name the root layer group
      // map.getLayerGroup().set('name', 'Base');

      /**
       * Build a tree layer from the map layers with visible and opacity
       * options.
       *
       * @param {type} layer
       * @returns {String}
       */
      function buildLayerTree(layer) {
          var elem;
          var div;
          var name = layer.get('name') ? layer.get('name') : "Group";
          if (layer.getLayers) {
            div = "<li data-layerid='" + name + "'>"
          } else {
            div = "<li class='leaf' data-layerid='" + name + "'>"
          }
          div += "<span><i class='glyphicon glyphicon-file'></i> " + layer.get('name') + "</span>" +
                  "<i class='glyphicon glyphicon-check'></i> " +
                  "<input style='width:80px;' class='opacity' type='text' value='' data-slider-min='0' data-slider-max='1' data-slider-step='0.1' data-slider-tooltip='hide'>";
          if (layer.getLayers) {
              var sublayersElem = '';
              var layers = layer.getLayers().getArray(),
                      len = layers.length;
              for (var i = len - 1; i >= 0; i--) {
                  sublayersElem += buildLayerTree(layers[i]);
              }
              elem = div + " <ul>" + sublayersElem + "</ul></li>";
          } else {
              elem = div + " </li>";
          }
          return elem;
      }

      /**
       * Initialize the tree from the map layers
       * @returns {undefined}
       */
      function initializeTree() {

          var elem = buildLayerTree(map.getLayerGroup());
          $('#layertree').empty().append(elem);

          $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
          $('.tree li.parent_li > span').on('click', function(e) {
              var children = $(this).parent('li.parent_li').find(' > ul > li');
              if (children.is(":visible")) {
                  children.hide('fast');
                  $(this).attr('title', 'Expand this branch').find(' > i').addClass('glyphicon-plus').removeClass('glyphicon-minus');
              } else {
                  children.show('fast');
                  $(this).attr('title', 'Collapse this branch').find(' > i').addClass('glyphicon-minus').removeClass('glyphicon-plus');
              }
              e.stopPropagation();
          });
      }

      /**
       * Finds recursively the layer with the specified key and value.
       * @param {ol.layer.Base} layer
       * @param {String} key
       * @param {any} value
       * @returns {ol.layer.Base}
       */
      function findBy(layer, key, value) {

          if (layer.get(key) === value) {
              return layer;
          }

          // Find recursively if it is a group
          if (layer.getLayers) {
              var layers = layer.getLayers().getArray(),
                      len = layers.length, result;
              for (var i = 0; i < len; i++) {
                  result = findBy(layers[i], key, value);
                  if (result) {
                      return result;
                  }
              }
          }

          return null;
      }

      function updateTree(){
            $('#layerTree').empty();

            initializeTree();

      }

      function buildTree(){
        elem = buildLayerTree(map.getLayerGroup());
        $('#layerTree').empty().append(elem);
        // Handle opacity slider control
        $('input.opacity').slider().on('slide', function(ev) {
            var layername = $(this).closest('li').data('layerid');
            var layer = findBy(map.getLayerGroup(), 'name', layername);

            layer.setOpacity(ev.value);
        });

        // Handle visibility control
        $('i').on('click', function() {
            var layername = $(this).closest('li').data('layerid');
            var layer = findBy(map.getLayerGroup(), 'name', layername);

            layer.setVisible(!layer.getVisible());

            if (layer.getVisible()) {
                $(this).removeClass('glyphicon-unchecked').addClass('glyphicon-check');
            } else {
                $(this).removeClass('glyphicon-check').addClass('glyphicon-unchecked');
            }
        });

        // Handle visibility control dblclick
        $('li.leaf').on('click', function() {
            var layername = $(this).data('layerid');

            var layer = findBy(map.getLayerGroup(), 'name', layername);

            selectedLayerTop = layer;
            $( "li.leaf" ).each(function( index ) {
              $( this ).removeAttr('style');
            });
            $(this).css('font-weight', 'bold');
            $(this).css('color', '#f52');
            if (selectedLayerTop) {
              document.getElementById('info').innerHTML = 'Capa seleccionada: '+layername+'. Ahora puede hacer click en un punto del mapa para ver su información. ';
            }
        });

      }

      //$(document).ready(function() {
      //  updateTree();
      //});
      //buildTree();
