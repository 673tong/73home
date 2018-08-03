var projection = ol.proj.get('EPSG:4326');
var projectionExtent = projection.getExtent();
var matrixIds = new Array(22);
for (var z = 0; z < 22; ++z) {
    matrixIds[z] = "EPSG:4326:" + z;
}

var resolutions = [
    0.703125, 0.3515625, 0.17578125, 0.087890625,
    0.0439453125, 0.02197265625, 0.010986328125,
    0.0054931640625, 0.00274658203125, 0.001373291015625,
    6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4,
    8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5,
    1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6,
    1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7
];
var tilegrid = new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
});

//浏览器访问：http://192.168.1.146:9099/geoserver/gwc/demo/xian:line_border?gridSet=EPSG:4326&format=image/png
//layerDate.urlOut:http://192.168.1.146:9099/geoserver/gwc/service/wms
var wmsLayer1 = new ol.layer.Tile({
    layerId: layerDate.id,
    title: layerDate.name,
    visible:true,
    source: new ol.source.WMTS({
        url: getProjectUrl()+"/static/proxy.jsp?"+layerDate.urlOut,
        layer: ''+wmsLayerId,
        matrixSet: 'EPSG:4326',
        format: 'image/png8',
        projection: projection,
        tileGrid:tilegrid
    }),
    zIndex: getLayerZindex()
});