/**
 * 公用地图工具栏js
 * 包含：量距、量面、拾取、定位、坐标转换,编辑&保存、还原
 */
var layerGroups = [];
var listLayers = [];
var listParamDetails = {};
var googleSatelliteLayer,googleTerrainLayer,tiandituSatelliteLayer,tian_di_tu_road_layer,tianditu_biaozhu,taipingzhuque,wmsLayer2;
//这几个参数是处理wms的
var orign1 = 666644.058700;
var orign2 = 4167004.093400;
var projection = "EPSG:4326"; // 投影西安80 6度带
var isDrawend = true;
var sketch;
var mapMeasureSource,checkSource,eventSource,warningSource;//测量、查询,事件，报警
var statisticSource;
var markers;//定位图标
var importKML;//导入
var importKMLLayer;//导入的kml的layer
var helpTooltipElement;//工具提示帮助元素
var helpTooltip;//叠加显示帮助消息
var measureTooltipElement;//测量工具提示的元素
var measureTooltip;//叠加显示的测量。
var continuePolygonMsg = '单击继续画面';//画面提示信息
var continueLineMsg = '单击继续画线';//画线提示信息
var helpMsg = '点击开始绘制';
var mapDraw; // global so we can remove it later
var mapDrawOverlay;//标绘覆盖层
var wmsMapDrawOverlay;//wms的标绘覆盖层
var mapVideoOverlay;
var wgs84Sphere = new ol.Sphere(6378137);
var select;//选中控件
var modify;//编辑控件
var fts = [];
var input = document.createElement('div');
var rotate;    //最开始的地图角度
var classification;
var timers = [];//漫游定时器组
var extents = [];//范围边界
var map;
var mapView;
var mapGroups = {};
var mapLayers = [];
var vienna = new ol.Overlay({
    element: input
});
var mapLayerZindex=4;
var timerCoords;
var mapSelectSource;
var outExtent = true;
var baseMap,domMap;
var tileType;
var patrolPolygonLayerId;//巡护区域图层id
var patrolLineLayerId;//巡护路线图层id
var patrolLineLayerFeatures;//巡护路线图层Features
var patrolPointLayerId;//巡护桩点图层id
var peropleLayerId;//网格员图层id
var wmsLayerIds=[];//wms图层id集合
var selectFeature;
var errorint = 0;

/*var projection = ol.proj.get('EPSG:4326');
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
var wmsLayer1 = new ol.layer.Tile({
    layerId: layerDate.id,
    title: layerDate.name,
    visible:false,//默认隐藏
    source:new ol.source.WMTS({
        url: getProjectUrl()+"/static/proxy.jsp?"+layerDate.urlOut,
        layer: ''+wmsLayerId,
        matrixSet: 'EPSG:4326',
        format: 'image/png8',
        projection: projection,
        tileGrid:tilegrid
    }),
    zIndex: getLayerZindex()
});*/

/**
 * 公用地图js
 */
$(function () {
    $("#progress").css("display","none");
    $("body").on("mouseover",".img.but",function(event){//解决动态添加元素的事件绑定的问题
        var imageUrl = getProjectUrl()+"/static/img/gis/topHover.png";
        event.currentTarget.style.backgroundImage="url("+imageUrl+")";
    });

    $("body").on("mouseout",".img.but",function(event){//解决动态添加元素的事件绑定的问题
        var imageUrl = getProjectUrl()+"/static/img/gis/top.png";
        event.currentTarget.style.backgroundImage="url("+imageUrl+")";
    });

    // 定位按钮事件绑定
    $("#maptoolsPosition-Btn-jwd").click(function () {
        toPostion("jwd");
    });
    $("#maptoolsPosition-Btn-pmzb").click(function () {
        toPostion("pmzb");
    });
    $("#maptoolsPosition-Btn-84").click(function () {
        toPostion("84");
    });
    $("#maptoolsPosition-Btn-2000").click(function () {
        toPostion("2000");
    });

    $('#dialog').draggable({
        containment : 'parent'
    });
    $('#layerGroupDialog').draggable({
        containment : 'parent'
    });
    $( ".mapgraphy" ).draggable({ containment: ".fullheightDiv" });
    //可拖动查询的窗体
    $('#geomCheck').draggable({
        containment : '.widthright'
    });
    $("#geomCheck").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        top: "45%",
        left: "45%"
    });
    $('#thematicMapPopup').draggable({
        containment : '.widthright'
    });
    $("#echartDisplay").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
    });
    $('#echartDisplay').draggable({
        containment : '.fullheight_map'
    });
    $("#thematicMapPopup").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        top: "45%",
        left: "45%"
    });
    // 设置位置
    $("#dialog").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        top : "50%",
        left : "50%",
    });

    $('#coordinateChange').draggable({
        containment : 'parent'
    });
    $("#coordinateChange").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        top : "50%",
        left : "50%"

    });
    $('#exportMapDiaglog').draggable({
        containment : 'parent'
    });
    $('#divImportKML').draggable({
        containment : 'parent'
    });
    $("#divImportKML").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        left:"40%",
        top:"35%"
    });
    $("#layerGroupDialog").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        left:"40%",
        top:"35%"
    });
    $("#exportMapDiaglog").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        left:"40%",
        top:"35%"
    });
    $('#spatialQuery').draggable({
        containment : 'parent'
    });
    // 设置div隐藏
    $("#spatialQuery").hide();
    $("#spatialQuery").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        left:"40%",
        top:"35%"
    });

    //创建逻辑查询div
    $('#logicalQuery').draggable({
        containment: 'parent'
    });
    // 设置div隐藏
    $("#logicalQuery").hide();
    $("#logicalQuery").css({
        "background-color": "#e3f9ee",
        position: "absolute",
        left:"40%",
        top:"35%"
    });
    //空间查询和逻辑查询表格关闭事件
    $(document).on('click','.mmDataClose', function () {
        $("#boxlg").remove();
    });
    $(".btnScaleata").on('click',function(){
        map.getView().setZoom(this.value);
    });
    $("#enlarge").on('click',function(){
        map.getView().setZoom(map.getView().getZoom() + 1);
    });
    $("#narrow").on('click',function(){
        map.getView().setZoom(map.getView().getZoom() - 1);
    });

    $('#saveLayerDialog').draggable({
        containment : 'parent'
    });
    $("#saveLayerDialog").css({
        "background-color": "#e3f9ee",
        position: "absolute",
        left:"40%",
        top:"35%"
    });
    $("#roam").click(function () {
        $("#roam").hide();
        $("#stop").show();
    });
    $("#stop").click(function () {
        $("#stop").hide();
        $("#roam").show();
    });
    $("#btnEditFeature").click(function () {
        $("#btnEditFeature").hide();
        $("#btnSaveFeature").show();
        map.un('singleclick', mapSingleclick);
        isDrawend = false;
        editFeature();
    });
    $("#btnSaveFeature").click(function () {
        $("#btnSaveFeature").hide();
        $("#btnEditFeature").show();
        map.on('singleclick', mapSingleclick);
        isDrawend = true;
        editSaveFeature();
    });
    $(".map_menu").click(function(event){
        event.stopPropagation();
        if($(this).siblings(".zicaidan").is(":animated") == false){
            $(this).siblings(".zicaidan").slideToggle();
        }
        $(this).parents().siblings('.fuli').children('.zicaidan').slideUp();
    })
    $(document).click(function(){
        $(".zicaidan").slideUp();
    });

    $("#fileIconList").filer({
        changeInput: '<div class="jFiler-input-dragDrop"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-folder"></i></div><div class="jFiler-input-text"><h3>点击选择图片</h3> </div></div></div>',
        showThumbs: true,
        theme: "dragdropbox",
        templates: {
            box: '<ul class="jFiler-items-list jFiler-items-grid"></ul>',
            item: '<li class="jFiler-item">\
				<div class="jFiler-item-container">\
				<div class="jFiler-item-inner">\
				<div class="jFiler-item-thumb">\
				<div class="jFiler-item-status"></div>\
				<div class="jFiler-item-info">\
				<span class="jFiler-item-title"><b title="{{fi-name}}">{{fi-name | limitTo: 25}}</b></span>\
				<span class="jFiler-item-others">{{fi-size2}}</span>\
				</div>\
				{{fi-image}}\
				</div>\
				<div class="jFiler-item-assets jFiler-row">\
				<ul class="list-inline pull-left">\
				<li>{{fi-progressBar}}</li>\
				</ul>\
				<ul class="list-inline pull-right">\
				<li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li>\
				</ul>\
				</div>\
				</div>\
				</div>\
				</li>',
            itemAppend: '<li class="jFiler-item">\
					<div class="jFiler-item-container">\
					<div class="jFiler-item-inner">\
					<div class="jFiler-item-thumb">\
					<div class="jFiler-item-status"></div>\
					<div class="jFiler-item-info">\
					<span class="jFiler-item-title"><b title="{{fi-name}}">{{fi-name | limitTo: 25}}</b></span>\
					<span class="jFiler-item-others">{{fi-size2}}</span>\
					</div>\
					{{fi-image}}\
					</div>\
					<div class="jFiler-item-assets jFiler-row">\
					<ul class="list-inline pull-left">\
					<li><span class="jFiler-item-others">{{fi-icon}}</span></li>\
					</ul>\
					<ul class="list-inline pull-right">\
					<li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li>\
					</ul>\
					</div>\
					</div>\
					</div>\
					</li>',
            itemAppendToEnd: false,
            removeConfirmation: true,
            _selectors: {
                list: '.jFiler-items-list',
                item: '.jFiler-item',
                remove: '.jFiler-item-trash-action'
            }
        }
    });

    //创建地图
    map = new ol.Map({
        target: 'mapView',
        controls: ol.control.defaults({ attribution: false, rotate: false, zoom: true }).extend([
            new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(4),
                projection: 'EPSG:4326',
                className: 'custom-mouse-position',
                target: document.getElementById('mouse-position')
            }),//鼠标位置控件
            new ol.control.ZoomSlider({}),//图层缩放条控件
            new ol.control.ScaleLine({
                target: document.getElementById('scaleLine')
            })
        ]),
        interactions: ol.interaction.defaults({ altShiftDragRotate: true, PinchRotate:true ,doubleClickZoom:false}),//取消旋转
        loadTilesWhileAnimating:true,
        loadTilesWhileInteracting:true
        // renderer: "dom"
    });
    /**
     * 在线地图
     */
    //谷歌卫星地图 混合（影像）
    googleSatelliteLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url:'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
        }),
        zIndex:1,
        visible:false
    });
    //谷歌地形地图（电子）
    googleTerrainLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url:'http://mt0.google.cn/vt/lyrs=t@131,r@216000000&h1=zh-CN&g1=CN&src=app&x={x}&y={y}&z={z}'
        }),
        zIndex:1,
        visible:false
    });

    //天地图影像 改为谷歌无偏差卫星图
    tiandituSatelliteLayer = new ol.layer.Tile({
        layerId:"tiandituSatelliteLayer",
        source: new ol.source.XYZ({
            url:'http://mt0.google.cn/vt/lyrs=s&hl=en-US&g0=US&x={x}&y={y}&z={z}'
        }),
        zIndex:1,
        visible:true
    });
    //天地图路网（电子）
    tian_di_tu_road_layer = new ol.layer.Tile({
        layerId:"tian_di_tu_road_layer",
        title: "天地图路网",
        source: new ol.source.XYZ({
            // crossOrigin:'*',
            url: getProjectUrl()+"/static/proxy.jsp?"+"http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
        }),
        zIndex:1,
        visible:false
    });

    //天地图标注
    tianditu_biaozhu = new ol.layer.Tile({
        layerId:"tianditu_biaozhu",
        source: new ol.source.XYZ({
            url:getProjectUrl()+"/static/proxy.jsp?"+'http://t3.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}'
        }),
        zIndex:2,
        visible:true
    })

    //发布的wms
    taipingzhuque = new ol.layer.Tile({
        title: "taipingzhuque",
        visible:false,
        source:new ol.source.TileWMS({
            params:{
                'FORMAT':'image/png',
                'SRS':'EPSG:4326',
                'LAYERS': 'xian:taipingzhuque'
            },
            serverType:'geoserver',
            url: getProjectUrl()+"/static/proxy.jsp?"+"http://192.168.1.128:6088/geoserver/xian/wms"
        }),
        zIndex: 2
    });

    map.addLayer(tiandituSatelliteLayer);
    map.addLayer(tian_di_tu_road_layer);
    map.addLayer(tianditu_biaozhu);
    map.addLayer(taipingzhuque);

    map.on('pointermove',function(e){
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        if(hit){
            map.getTargetElement().style.cursor = 'pointer';
        }
        else{
            map.getTargetElement().style.cursor = '';
        }
    });

    $.ajax({
        type: "POST",
        url: getProjectUrl() + "/gis/getMapData",
        async: false,
        success: function (msg) {
            if (msg.status == 1 && msg.data != null) {
                classification = msg.data.classification;
                tileType = classification.tileType;
                layerGroups = msg.data.listLayerGroups;
                listLayers = msg.data.listLayers;
                listParamDetails = msg.data.listParamDetails;
                timerCoords = [[108.942677,33.961293],[108.438646,33.848419],[108.143073,33.796457],[107.826768,33.837835],[108.134633,34.020486],[108.437306,34.020311],[108.706471,33.926789],[109.009719,33.968989],[109.281631,33.918520],[109.528137,33.927447],[109.433723,34.123827],[109.682632,34.174983],[109.386635,34.374698],[109.265802,34.355155],[109.138429,34.324256],[108.942677,33.961293]];
                return;
            } else if (msg.status == 2) {
                alert("没有查询到地图数据");
            } else {
                alert("获取地图数据错误：" + msg.message);
            }
            classification = null;
            layerGroups = null;
            listLayers = null;
        }
    });
    var mapType = localStorage.getItem("mapType");
    if(mapType){
        tileType = mapType;
    }

    if(tileType == "offline"){
        tiandituSatelliteLayer.setVisible(false);
        tianditu_biaozhu.setVisible(false);
        $("#online_span").html("在线");
        $("#offline_span").html("离线<i class=\"fa fa-check\" style=\"color:#22c377\"></i>");
    }else{
        $("#online_span").html("在线<i class=\"fa fa-check\" style=\"color:#22c377\"></i>");
        $("#offline_span").html("离线");
    }

    if (classification != null && layerGroups != null && listLayers != null) {
        initResolution = classification.initresolution;//记得大小写的区别
        projection = classification.projection;
        //加载图层组数据
        for (var i = layerGroups.length - 1; i >= 0; i--) {
            var layerGroup = new ol.layer.Group({
                type: "group",
                title: layerGroups[i].name,
                layers: []
            });
            mapLayers.push(layerGroup);
            mapGroups[layerGroups[i].id] = layerGroup;
        }
        //创建工具Group
        var layerGroup = new ol.layer.Group({
            type: "group",
            title: "工具",
            layers: []
        });
        //创建测量图层
        mapMeasureSource = new ol.source.Vector();
        var drawStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        });

        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'mapMeasureSource',
            title: '测量图层',
            zIndex: 96,
            source: mapMeasureSource,
            style: drawStyle
        }));

        //查询图层
        checkSource = new ol.source.Vector();
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'checkSource',
            title: '测量图层',
            zIndex: getLayerZindex(),
            source: checkSource
        }));

        //事件图层
        eventSource = new ol.source.Vector();
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'eventLayerId',
            title: '事件图层',
            zIndex: getLayerZindex()+100,
            source: eventSource,
            style:new ol.style.Style({
                image: new ol.style.Icon({
                    src: img + '/patrol/event.png',
                    imgSize: [30, 30],
                    anchor: [0.5, 1]
                })
            })
        }));

        //报警图层
        warningSource = new ol.source.Vector();
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'warningLayerId',
            title: '报警图层',
            zIndex: getLayerZindex()+100,
            source: warningSource,
            style:new ol.style.Style({
                image: new ol.style.Icon({
                    src: img + '/patrol/warning.png',
                    imgSize: [30, 30],
                    anchor: [0.5, 1]
                })
            })
        }));

        //创建定位图标图层
        markers = new ol.source.Vector();
        var markersStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: img + '/gis/dingwei.svg',
                imgSize: [30, 30],
                anchor: [0.5, 1]
            })
        });
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'markers',
            title: '定位图层',
            zIndex: 97,
            source: markers,
            style: markersStyle
        }));

        statisticSource = new ol.source.Vector();
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'statisticSource',
            title: '统计图层',
            zIndex: 98,
            source: statisticSource
        }));

        //创建导入图层
        importKML = new ol.source.Vector();
        importKMLLayer = new ol.layer.Vector({
            layerId: 'importKML',
            title: '导入图层',
            zIndex: 99,
            source: importKML
        });
        layerGroup.getLayers().push(importKMLLayer);

        //创建选中闪烁图层
        mapSelectSource = new ol.source.Vector();
        var selectStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        });
        layerGroup.getLayers().push(new ol.layer.Vector({
            layerId: 'mapSelectSource',
            title: '选中图层',
            zIndex: 100,
            source: mapSelectSource,
            style: selectStyle
        }));
        mapLayers.push(layerGroup);
        mapGroups['toolGroups'] = layerGroup;

        //范围边界
        // extents = [Number(classification.boundsMinLon), Number(classification.boundsMinLat), Number(classification.boundsMaxLon), Number(classification.boundsMaxLat)];
        // 地图视图
        if(tileType == "offline"){
            classification.minZoom = 9;
        }
        mapView = new ol.View({
            center: [Number(classification.centerLon), Number(classification.centerLat)],
            maxZoom:classification.maxZoom,
            minZoom:classification.minZoom,
            projection: classification.projection,
            zoom:classification.centerZoom
        });
        map.on('singleclick', mapSingleclick);
    } else {
        alert("没有地图图层数据");
    }
    map.setView(mapView);
    rotate= map.getView().getRotation();
    abc();
    mapLeft();
    maptab_ulClick();

    //实时获取层级变化，到达指定层级后显示或隐藏图层
    map.getView().on('change:resolution',checkZoom);
    map.getView().on('change:center',checkCenter);
    function checkZoom() {
        if(map.getView().getZoom() > 14){
            taipingzhuque.setVisible(true);
        }else{
            taipingzhuque.setVisible(false);
        }
    }
})

function checkCenter(){
    var mapCenter = map.getView().getCenter();
    if(isInExtent(mapCenter) && outExtent){
        map.getView().setMaxZoom(18);
        outExtent = false;
    }else if(!isInExtent(mapCenter) && !outExtent){
        if(tian_di_tu_road_layer.getVisible()){
            map.getView().setMaxZoom(16);
        }else if(tiandituSatelliteLayer.getVisible()){
            map.getView().setMaxZoom(21);
        }
        outExtent = true;
    }
}

function isInExtent(center){
    var x = center[0];
    var y = center[1];
    if(x > 108.45196440430922 && x < 108.68249238670428 && y > 33.82131020598272 && y < 33.963301988077596){
        return true;
    }
    return false;
}

function getLayerZindex() {
    return mapLayerZindex++;
}

function changeToNumArray(tempStr){
    var temps = tempStr.split(",");//转换成字符数组
    var nums = new Array();
    for(var i=0;i<temps.length;i++){
        nums.push(Number(temps[i]));
    }
    return nums;
}
/**
 * 测量点线面
 */
function addInteraction(t) {
    $("#mapView")[0].style.cursor = "default";
    var type;
    if (t == "Point") {
        type = 'Point';
    } else if (t == 'Polygon') {
        type = 'Polygon';
    } else {
        type = 'LineString';
    }
    map.removeInteraction(mapDraw);
    mapDraw = new ol.interaction.Draw({
        source: mapMeasureSource,
        type: (type),
        snapTolerance:0.1,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff0307',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
    map.addInteraction(mapDraw);
    isDrawend = false;
    helpMsg = '点击开始绘制';
    createHelpTooltip();
    var listener;
    //测量标绘开始事件
    map.un('singleclick', mapSingleclick);
    mapDraw.on('drawstart',function (evt) {
        sketch = evt.feature;
        var fid = uuid();
        sketch.setId(fid);
        createMeasureTooltip(fid);
        var tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;

            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    }, this);
    //测量标绘结束事件
    mapDraw.on('drawend',function () {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        //移除事件监听
        ol.Observable.unByKey(listener);
        map.removeInteraction(mapDraw);
        mapDraw = null;
        map.removeOverlay(helpTooltip);
        isDrawend = true;
        map.un('pointermove', pointerMoveHandler);
        map.on('singleclick', mapSingleclick);
    }, this);
    map.on('pointermove', pointerMoveHandler);
    map.un('singleclick', getLonLat);
}

/**
 * 测量标绘时的提示信息
 */
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}

/**
 * 测量标绘完的展示信息
 */
function createMeasureTooltip(fid) {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    var toolDiv = document.createElement('div');
    var input = document.createElement('a');
    input.onclick = function () {
        var feature = mapMeasureSource.getFeatureById(fid);
        var toolOverlay = map.getOverlayById(fid);
        if (feature) {
            mapMeasureSource.removeFeature(feature);
        }
        if (toolOverlay) {
            map.removeOverlay(toolOverlay);
        }
    }
    input.className = 'ol-measure-closer';
    toolDiv.appendChild(measureTooltipElement);
    toolDiv.appendChild(input);
    measureTooltip = new ol.Overlay({
        id: fid,
        element: toolDiv,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */
var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
        return;
    }
    if (sketch) {
        var geom = (sketch.getGeometry());
        if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
        } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
        }
    }
    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove('hidden');
};

/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function (line) {
	var length;
    var coordinates = line.getCoordinates();
    length = 0;
    var sourceProj = map.getView().getProjection();
    if(line.getType().indexOf("MultiLineString")!=-1){//多线
        for (var i = 0, ii = coordinates[0].length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[0][i], sourceProj, projection);
            var c2 = ol.proj.transform(coordinates[0][i+1], sourceProj, projection);
            length += wgs84Sphere.haversineDistance(c1, c2);
        }
    }else{
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, projection);
            var c2 = ol.proj.transform(coordinates[i+1], sourceProj, projection);
            length += wgs84Sphere.haversineDistance(c1, c2);
        }
    }
    var output;
    if (length > 1000) {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
    }
    return output;
};


/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function (polygon,check) {
    var sourceProj = map.getView().getProjection();
    var geom = (polygon.clone().transform(sourceProj, projection));
    var area,coordinates;
    if(check=="check"){
        coordinates = geom.getCoordinates();
        area = Math.abs(wgs84Sphere.geodesicArea(coordinates[0][0]));
    }else{
        coordinates = geom.getLinearRing(0).getCoordinates();
        area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    }
    var output;
    if (area > 1000000) {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
    }
    return output;
};

/**
 *拾取坐标
 */
function getLonLatClick() {
    $("#mapView")[0].style.cursor = "crosshair";
    map.removeInteraction(mapDraw);
    helpMsg = "点击拾取坐标";
    createHelpTooltip();
    map.un('singleclick', mapSingleclick);
    map.un('dblclick', deleteIconFeature);
    map.un('pointermove', showoverlay);
    map.on('pointermove', pointerMoveHandler);
    map.on('singleclick', getLonLat);
}

var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
        return;
    }

    if (sketch) {
        var geom = (sketch.getGeometry());
        if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
        } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
        }
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);

    helpTooltipElement.classList.remove('hidden');
};

function DegreeConvertBack(value) {
    var du = value.split("°")[0];
    var fen = value.split("°")[1].split("'")[0].split(" ")[1];
    var miao = value.split("°")[1].split("'")[1].split('"')[0];
    return Math.abs(du) + "." + (Math.abs(fen)/60 + Math.abs(miao)/3600);
}

/**
 *拾取坐标事件
 */
function getLonLat(evt) {
    var coordinate = evt.coordinate;
    var point = proj4Transform("4326", "2414", coordinate[0], coordinate[1]);
    var cgcs = proj4Transform("4326", "4524", coordinate[0], coordinate[1]);
//    var hdms = getFriePosLonLatFromPoint(coordinate[0],coordinate[1]);
    var hdms = ol.coordinate.toStringHDMS(coordinate);
    var container = document.createElement('div');
    container.className = 'ol-popup';
    var content = document.createElement('div');
    var closer = document.createElement('a');
    content.className = 'ol-popup-code';
    closer.className = 'ol-popup-closer';
    content.innerHTML = '<p>当前获取的坐标:</p><code>经纬:' + hdms.substring(hdms.indexOf("N")+1,hdms.length) +" "+ hdms.substring(0,hdms.indexOf("N")+1) + '</code><br /><code>54坐标:' + parseFloat(point.x).toFixed(4) + ',' + parseFloat(point.y).toFixed(4) + '</code><br /><code>'+ol.coordinate.format(coordinate, '84坐标:{x},{y}', 6) + '</code><br /><code>CGCS2000:' +parseFloat(cgcs.x).toFixed(6) + ',' + parseFloat(cgcs.y).toFixed(6)+ '</code>';
    container.appendChild(closer);
    container.appendChild(content);
    var overlay = new ol.Overlay(({
        position: coordinate,
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));
    closer.onclick = function () {
        map.removeOverlay(overlay);
        closer.blur();
        return false;
    };
    map.addOverlay(overlay);
    map.removeOverlay(helpTooltip);
    map.getView().animate({
        center:coordinate
    });
    $("#mapView")[0].style.cursor = "default";
    map.un('pointermove', pointerMoveHandler);
    map.un('singleclick', getLonLat);
    if(markers.getFeatures().length > 0){
        map.on('pointermove', showoverlay);
        map.on('dblclick', deleteIconFeature);
    }
    map.on('singleclick', mapSingleclick);
}

function closeDiv(id) {
    $("#"+id).css("display","none");
}

function show(divId) {
    $("#mapView")[0].style.cursor = "default";
    map.removeOverlay(helpTooltip);
    map.removeInteraction(mapDraw);
    map.un('singleclick', getLonLat);
    if(divId == 'dialog'){
        closeDiv('coordinateChange');
    }else if(divId == 'coordinateChange'){
        closeDiv('dialog');
    }
    var div = document.getElementById(divId);
    if (div.style.display == 'block') {
        div.style.display = "none";
    } else {
        div.style.display = 'block';
    }
}

/**
 *定位
 */
function toPostion(type) {
    var lon, lat;
    //如果type为true则是经纬度坐标查询否则是54平面坐标查询
    if (type == "jwd") {
        var lonD = $("#txtLonD").val();
        var lonM = $("#txtLonM").val();
        var lonS = $("#txtLonS").val();
        var latD = $("#txtLatD").val();
        var latM = $("#txtLatM").val();
        var latS = $("#txtLatS").val();
        if (parseInt(lonD) > 180 || parseInt(lonD) < 0) {
            alert("【经度】:'度'范围 必须介于0~180之间,请重新输入");
            return;
        }
        if (parseInt(latD) > 90 || parseInt(latD) < 0) {
            alert("【纬度】:'度'范围必须介于0~90之间,请重新输入");
            return;
        }
        if (parseInt(lonM) > 60 || parseInt(latM) > 60 || parseInt(lonM) < 0
            || parseInt(latM) < 0) {
            alert("'分' 范围必须介于0~60之间,请重新输入");
            return;
        }
        if (parseInt(lonS) > 60 || parseInt(latS) > 60 || parseInt(lonS) < 0
            || parseInt(latS) < 0) {
            alert("'秒' 范围必须介于0~60之间,请重新输入");
            return;
        }

        lon = DMSConvertToDegree(lonD, lonM, lonS);
        lat = DMSConvertToDegree(latD, latM, latS);
    } else if (type == "pmzb") {
        var lonX = parseFloat($("#txtCoordinateX").val());
        var latY = parseFloat($("#txtCoordinateY").val());
        var result = proj4Transform("2414", "4326", lonX, latY);
        if (typeof (result.x) == 'undefined' || result.x == 'NaN' || typeof (result.y) == 'undefined' || result.y == 'NaN') {
            return;
        }
        lon = parseFloat(result.x);
        lat = parseFloat(result.y);
    } else if (type == "84"){
        lon = parseFloat($("#txtCoordinateLon").val());
        lat = parseFloat($("#txtCoordinateLat").val());
    } else if (type == "2000"){
        var lonX = parseFloat($("#CGCS2000CoordinateLon").val());
        var latY = parseFloat($("#CGCS2000CoordinateLat").val());
        var result = proj4Transform("4524", "4326", lonX, latY);
        lon = parseFloat(result.x);
        lat = parseFloat(result.y);
    }
    if (!lat || !lon) {
        alert("请输入正确的经纬度");
        return;
    }
    flyToPostion(lon, lat);
    $("#dialog").hide();
}

function flyToPostion(lon, lat) {
    var coord = [lon,lat];
    var iconfeature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
    });
    markers.addFeature(iconfeature);

    map.getView().animate({
        center:coord
    });
    map.on('dblclick', deleteIconFeature);
    map.on('pointermove', showoverlay);
}

var deleteIconFeature = function(event){
    var pixel = map.getEventPixel(event.originalEvent);
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) { return feature; });
    vienna.setPosition(undefined);
    markers.removeFeature(feature);
    if(markers.getFeatures() == undefined || markers.getFeatures().length == 0){
        map.un('dblclick', deleteIconFeature);
    }
};

var showoverlay = function(event){
    var pixel = map.getEventPixel(event.originalEvent);
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) { return feature; });
    if(feature){
        var check = getLayerByFeature(feature,map.getLayers().getArray());
        var source = check.getSource();
        if(source == markers){
            var vcoord = feature.getGeometry().getCoordinates();
            input.innerHTML = '<p style="color:#fffff0">双击删除</p>';
            vienna.setPosition(vcoord);
            map.addOverlay(vienna);
        }
    }else{
        input.innerHTML = '&nbsp;';
        vienna.setPosition(undefined);
    }
};

/**
 *坐标转换拾取功能
 */
function coordinateChangeClick() {
    helpMsg = "点击获取坐标";
    createHelpTooltip();
    map.on('pointermove', pointerMoveHandler);
    map.on('singleclick', getCoordinateChangeLonLat);
    map.un('singleclick', mapSingleclick);
    map.un('dblclick', deleteIconFeature);
}

/**
 *拾取坐标事件
 */
function getCoordinateChangeLonLat(evt) {
    var coordinate = evt.coordinate;
    var point = proj4Transform("4326", "2414", coordinate[0], coordinate[1]);
    var cgcs = proj4Transform("4326", "4524", coordinate[0], coordinate[1]);
    var hdms = getFriePosLonLatFromPoint(coordinate[0], coordinate[1]);
    var iconfeature = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
    });
    markers.addFeature(iconfeature);
    map.getView().animate({
        center:coordinate
    });
    $("#txtChangeLon").val(coordinate[0].toFixed(6));
    $("#txtChangeLat").val(coordinate[1].toFixed(6));
    $("#txtChangeHDMSLon").val(hdms.xD + '°' + hdms.xM + '′' + hdms.xS + '″');
    $("#txtChangeHDMSLat").val(hdms.yD + '°' + hdms.yM + '′' + hdms.yS + '″');
    $("#txtChangeBJLon").val(point.x.toFixed(6));
    $("#txtChangeBJLat").val(point.y.toFixed(6));
    $("#CGCS2000ChangeLon").val(cgcs.x.toFixed(6));
    $("#CGCS2000ChangeLat").val(cgcs.y.toFixed(6));
    map.removeOverlay(helpTooltip);
    map.un('pointermove', pointerMoveHandler);
    map.un('singleclick', getCoordinateChangeLonLat);
    map.on('singleclick', mapSingleclick);
    map.on('dblclick', deleteIconFeature);
    map.on('pointermove', showoverlay);
}

/**
 *坐标转换清除文本
 */
function clearCoordinateChange() {
    $("#txtChangeLon").val("");
    $("#txtChangeLat").val("");
    $("#txtChangeHDMSLon").val("");
    $("#txtChangeHDMSLat").val("");
    $("#txtChangeBJLon").val("");
    $("#txtChangeBJLat").val("");
    $("#CGCS2000ChangeLon").val("");
    $("#CGCS2000ChangeLat").val("");
}

/**
 * 标转换转换设置
 */
function setCoordinateChange() {
    var txtChangeLon = parseFloat($("#txtChangeLon").val());
    var txtChangeLat = parseFloat($("#txtChangeLat").val());
    var txtChangeHDMSLon = $("#txtChangeHDMSLon").val();
    var txtChangeHDMSLat = $("#txtChangeHDMSLat").val();
    var txtChangeBJLon = parseFloat($("#txtChangeBJLon").val());
    var txtChangeBJLat = parseFloat($("#txtChangeBJLat").val());
    var CGCS2000ChangeLon = parseFloat($("#CGCS2000ChangeLon").val());
    var CGCS2000ChangeLat = parseFloat($("#CGCS2000ChangeLat").val());
    var coordinate = {};
    var hdms = {};
    var point = {};
    var cgcs = {};
    if (txtChangeLon && txtChangeLat) {
        coordinate.x = txtChangeLon;
        coordinate.y = txtChangeLat;
        point = proj4Transform("4326", "2414", coordinate.x, coordinate.y);
        hdms = getFriePosLonLatFromPoint(txtChangeLon,txtChangeLat);
        cgcs = proj4Transform("4326", "4524", coordinate.x, coordinate.y);
    }else if(CGCS2000ChangeLon && CGCS2000ChangeLat){
        cgcs.x = CGCS2000ChangeLon;
        cgcs.y = CGCS2000ChangeLat;
        coordinate = proj4Transform("4524", "4326", cgcs.x, cgcs.y);
        point = proj4Transform("4524", "2414", cgcs.x, cgcs.y);
        hdms = getFriePosLonLatFromPoint(coordinate.x,coordinate.y);
    }else if (txtChangeHDMSLon && txtChangeHDMSLon.indexOf(' ') == -1 && txtChangeHDMSLat && txtChangeHDMSLat.indexOf(' ') == -1) {
        var splits = txtChangeHDMSLon.split('°');
        hdms.xD = splits[0];
        splits = splits[1].split('′');
        hdms.xM = splits[0];
        splits = splits[1].split('″');
        hdms.xS = splits[0];
        splits = txtChangeHDMSLat.split('°');
        hdms.yD = splits[0];
        splits = splits[1].split('′');
        hdms.yM = splits[0];
        splits = splits[1].split('″');
        hdms.yS = splits[0];
        var lon = DMSConvertToDegree(hdms.xD, hdms.xM, hdms.xS);
        var lat = DMSConvertToDegree(hdms.yD, hdms.yM, hdms.yS);
        if (lon == "" || lat == "") {
            alert("请填写正确的度分秒格式数据");
            return false;
        }
        point = proj4Transform("4326", "2414", lon, lat);
        cgcs = proj4Transform("4326", "4524", lon, lat);
        coordinate.x = lon;
        coordinate.y = lat;
    } else if (txtChangeBJLon && txtChangeBJLat) {
        point.x = txtChangeBJLon;
        point.y = txtChangeBJLat;
        coordinate = proj4Transform("2414", "4326", txtChangeBJLon, txtChangeBJLat);
        cgcs = proj4Transform("2414", "4524", txtChangeBJLon, txtChangeBJLat);
        hdms = getFriePosLonLatFromPoint(coordinate.x, coordinate.y);
    } else {
        alert("请填写正确的数据");
        return false;
    }

    $("#txtChangeLon").val(coordinate.x.toFixed(6));
    $("#txtChangeLat").val(coordinate.y.toFixed(6));
    $("#txtChangeHDMSLon").val(hdms.xD + '°' + hdms.xM + '′' + hdms.xS + '″');
    $("#txtChangeHDMSLat").val(hdms.yD + '°' + hdms.yM + '′' + hdms.yS + '″');
    $("#txtChangeBJLon").val(point.x.toFixed(6));
    $("#txtChangeBJLat").val(point.y.toFixed(6));
    $("#CGCS2000ChangeLon").val(cgcs.x.toFixed(6));
    $("#CGCS2000ChangeLat").val(cgcs.y.toFixed(6));
}

/** 全图|还原控件 (tkhang)*/
function fullMap() {
    map.getView().animate({
        center:[classification.centerLon, classification.centerLat],
        zoom:classification.centerZoom,
        rotation:  rotate
    });
    mapMeasureSource.clear();
    statisticSource.clear();
    map.render();
}

/** 默认图层切换 */
function changeMap(mapName) {
    if (mapName == "baseMap" && tileType == "online") {
        tian_di_tu_road_layer.setVisible(true);
        tiandituSatelliteLayer.setVisible(false);
        if(!outExtent){
            mapView.setMaxZoom(18);
        }else{
            mapView.setMaxZoom(16);
        }
        $(".scale_div span").css("color","black");
        $(".footer_scale span").css("color","black");
        $(".custom-mouse-position").css("color","black");
        $(".ol-scale-line-inner").css({
            "border":"1px solid #000",
            "border-top":"none",
            "color":"black"
        });
    } else if (mapName == "dom" && tileType == "online") {
        tian_di_tu_road_layer.setVisible(false);
        tiandituSatelliteLayer.setVisible(true);
        if(!outExtent){
            mapView.setMaxZoom(18);
        }else{
            mapView.setMaxZoom(21);
        }
        $(".scale_div span").css("color","white");
        $(".footer_scale span").css("color","white");
        $(".custom-mouse-position").css("color","white");
        $(".ol-scale-line-inner").css({
            "border":"1px solid #fff",
            "border-top":"none",
            "color":"white"
        });
    } else if (mapName == "baseMap" && tileType == "offline") {
        baseMap.setVisible(true);
        domMap.setVisible(false);
        $(".scale_div span").css("color","black");
        $(".footer_scale span").css("color","black");
        $(".custom-mouse-position").css("color","black");
        $(".ol-scale-line-inner").css({
            "border":"1px solid #000",
            "border-top":"none",
            "color":"black"
        });
    } else if (mapName == "dom" && tileType == "offline") {
        baseMap.setVisible(false);
        domMap.setVisible(true);
        $(".scale_div span").css("color","white");
        $(".footer_scale span").css("color","white");
        $(".custom-mouse-position").css("color","white");
        $(".ol-scale-line-inner").css({
            "border":"1px solid #fff",
            "border-top":"none",
            "color":"white"
        });
    }
}

//根据图层名称获取图层source
function getMapLayerByName(layers, layerName) {
    if (layers && layerName != "") {
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if (l instanceof ol.layer.Group) {
                var source = getMapLayerByName(l.getLayersArray(), layerName);
                if (source) {
                    return source;
                }
            } else {
                if (l.get('title') == layerName) {
                    return l.getSource();
                }
            }
        }
    }
    return null;
}

//根据图层名称获取图层
function getLayerByName(layers, layerName) {
    if (layers && layerName != "") {
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if (l instanceof ol.layer.Group) {
                var layer = getLayerByName(l.getLayers().getArray(), layerName);
                if (layer) {
                    return layer;
                }
            } else {
                if (l.get('title') == layerName) {
                    return l;
                }
            }
        }
    }
    return null;
}

//根据图层ID获取图层
function getLayerById(layers, layerId) {
    if (layers && layerId != "") {
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if (l instanceof ol.layer.Group) {
                var layer = getLayerById(l.getLayersArray(), layerId);
                if (layer) {
                    return layer;
                }
            } else {
                if (l.get('layerId') == layerId) {
                    return l;
                }
            }
        }
    }
    return null;
}

//根据元素获取图层
function getLayerByFeature(feature, layers) {
    if (layers && feature) {
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if (l instanceof ol.layer.Group) {
                var source = getLayerByFeature(feature, l.getLayersArray());
                if (source) {
                    return source;
                }
            } else {
                var source = l.getSource();
                if (source instanceof ol.source.Vector) {
                    var features = source.getFeatures();
                    if (features.length > 0) {
                        for (var j = 0; j < features.length; j++) {
                            if (features[j] === feature) {
                                return l;
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}

//通过featureType获取layerId
function getLayerIdByFeatureType(type) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].featureType == type){
            return listLayers[i].id;
        }
    }
}

function getLayerDataByFeatureType(type) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].featureType == type){
            return listLayers[i];
        }
    }
}

function getFeatureTypeByLayerId(layerId) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].id == layerId){
            return listLayers[i].featureType;
        }
    }
}

function getSQLDescByLayerId(layerId) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].id == layerId){
            return listLayers[i].sqlDesc;
        }
    }
}

function getFormTableByLayerId(layerId) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].id == layerId){
            return listLayers[i].fromTable;
        }
    }
}

function getLayerTypeByLayerId(layerId) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].id == layerId){
            return listParamDetails[listLayers[i].type];
        }
    }
}

function abc(){
    $(".message-img").mouseover(function(){
        $("#map-img").show();
    })
    $(".message-img p").mouseout(function(){
        $("#map-img").hide();
    })
}

function mapLeft(){
    var mapLeftwidth=$(".map_left").width();
    $(".map_first").css("marginLeft",mapLeftwidth);
}

function maptab_ulClick(){
    $(".maptab_ul li").click(function(){
        $(this).addClass("maptab_add").siblings().removeClass("maptab_add").parent().siblings(".maptab_seconde").children("div").eq($(this).index()).show().siblings().hide();
    })
}
//判断图层是否有img字段
function isImgInLayer(feature){
    var isTrue = false;
    var layer = getLayerByFeature(feature, map.getLayers().getArray());
    var layerId = layer.get("layerId");
    if(layerId){
        $.ajax({
            type: "POST",
            url: "../map/layerField/getMapLayerField/"+layerId,
            async: false,
            success: function (data) {
                if(data.status==1){
                    var attrList = data.data;
                    for (var n = 0; n < attrList.length; n++){
                        if(attrList[n].fieldType=="image"){
                            isTrue = true;
                        }
                    }
                }
            }
        });
    }
    return isTrue;
}
//通过extent获取center
function getCenterOfExtent(Extent){
    var X = Extent[0] + (Extent[2]-Extent[0])/2;
    var Y = Extent[1] + (Extent[3]-Extent[1])/2;
    return [X, Y];
}

//修改已存在的drawfeature
function editFeature() {
    if(select != null){
        select = null;
    }
    if(fts != []){
        fts = [];
    }
    var layer;
    select = new ol.interaction.Select({
        condition: ol.events.condition.click,
    });
    select.on('select',function(evt){
        layer = getLayerByFeature(evt.selected[0], map.getLayers().getArray());
        if(layer != null){
            modify = new ol.interaction.Modify({
                features: select.getFeatures()
            });
            modify.on("modifyend",function(evt){
                var fs = evt.features.getArray();
                for(var n=0;n<fs.length;n++){
                    var ft = fs[n];
                    var flag = true;
                    for(var i=0;i<fts.length;i++){
                        if(fts[i].get('id') == ft.get('id')){
                            flag=false;
                            break;
                        }
                    }
                    if(flag){
                        fts.push(ft);
                    }
                }
            });
            map.addInteraction(modify);
        }else{
            return;
        }
    });
    map.addInteraction(select);
}

//保存编辑的feature
function editSaveFeature(){
    map.removeInteraction(select);
    map.removeInteraction(modify);
    var checkNum = 0;
    for(var i=0;i<fts.length;i++){
        var ft = fts[i];
        var data = {};
        data.name = ft.get('name');
        data.description = ft.get('desc');

        if (ft.get('id')) {
            data.id = ft.get('id');
        } else {
            data.id = "";
        }
        if (ft.get('dataGson')) {
            data.dataJson = JSON.stringify(ft.get('dataGson'));
        } else {
            data.dataJson = "";
        }
        if (ft.get('styleJson')) {
            data.styleJson = JSON.stringify(ft.get('styleJson'));
        } else {
            data.styleJson = "";
        }
        if (ft.get('fileGson')) {
            data.fileJson = JSON.stringify(ft.get('fileGson'));
        } else {
            data.fileJson = "";
        }
        data.type = '';
        var format = new ol.format.WKT();
        data.geomJson = format.writeGeometry(ft.getGeometry());
        var layer = getLayerByFeature(ft, map.getLayers().getArray());
        data.layer = layer.get('layerId');
        var listlayer;
        var param;
        var groupid;
        var featureType;
        for(var j=0;j<listLayers.length;j++){
            listlayer=listLayers[j];
            if(layer.values_.layerId==listLayers[j].id){
                param = listlayer.type;
                groupid = listlayer.groupId;
                featureType = listlayer.featureType;
            }
        }
        var url = "../map/layerFeature/saveFeature.json?featureType=" + featureType;
        if(featureType == 'patrol_polygon'||featureType == 'patrol_line'){
            url = "../patrol/patrolPolygon/saveFeature.json?featureType=" + featureType;
            data.userId = ft.get('userId');
            data.polygonNumber = ft.get('polygonNumber');
            data.length = ft.get('length');
            data.area = ft.get('area');
            data.polygonName = ft.get('polygonName');
            data.layerId = layer.get('layerId');
        }
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            async: false,
            success: function (msg) {
                checkNum++;
                if (msg.status == 1 && msg.data) {
                    ft.set('id', msg.data);
                }
            },
            error:function(msg){
                return;
            }
        });
    };
    if(checkNum>0){
        alert("修改总数："+fts.length+"，成功："+checkNum+"！")
    };
}
//featureStyle的调用函数
function getFeatureStyle(feature, resolution) {

    var	dom = feature.get("styleJson");
    if (!dom) {
        var layer = getLayerByFeature(feature,map.getLayers().getArray());
        dom = getStyleFromLayerId(layer?layer.get("layerId"):"");
    }
    var image;
    if (dom.image && dom.image != "" && dom.image != "Nothing") {
        image = new ol.style.Icon({
            anchor: [0.5, 1],
            src: "../static/img/gis/" + dom.image + ".png"
        })
    } else {
        image = new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: '#' + dom.fillColor//点的填充颜色
            }),
            stroke: new ol.style.Stroke({
                color: '#fff3af',
                width: 1.5
            })
        });
    }

    var strokeColor;
    if (dom.strokeColor) {
        strokeColor = ('#' + dom.strokeColor).colorRgba(dom.strokeOpacity);
    } else {
        strokeColor = { text: 'RGBA(51,153,204,1)' };
    }
    var fillColor;
    if (dom.fillColor) {
        fillColor = ('#' + dom.fillColor).colorRgba(dom.fillOpacity);
    } else {
        fillColor = { text: 'rgba(255,255,255,0.4)' };
    }
    return new ol.style.Style({
        image: image,
        text: createTextStyle(feature, dom),
        stroke: new ol.style.Stroke({
            color: strokeColor.text,
            width: dom.strokeWidth,
            lineDash: getStyleStrokeArray(dom.strokeWidth, dom.strokeLineDash)
        }),
        fill: new ol.style.Fill({
            color: fillColor.text
        })
    });
}

function createTextStyle(feature, dom) {
    var align = dom.textAlign;
    var baseline = dom.textBaseline;
    var size = dom.textSize;
    var offsetX = parseInt(dom.textOffsetX, 10);
    var offsetY = parseInt(dom.textOffsetY, 10);
    var weight = dom.textWeight;
    var rotation = parseFloat(dom.textRotation);
    var font = weight + ' ' + size + 'px ' + dom.textFont;
    var fillColor = '#' + dom.textColor;
    var outlineColor = '#' + dom.textOutline;
    var outlineWidth = parseInt(dom.textOutlineWidth, 10);
    return new ol.style.Text({
        textAlign: align,
        textBaseline: baseline,
        font: font,
        text: getText(feature, dom),
        fill: new ol.style.Fill({ color: fillColor }),
        stroke: new ol.style.Stroke({ color: outlineColor, width: outlineWidth }),
        offsetX: offsetX,
        offsetY: offsetY,
        rotation: rotation
    });
};

function getText(feature, dom) {
    var type = dom.textType;
    var maxResolution = dom.textMaxReso;
    if(feature.get('showName') == undefined){
        var text = '';
    } else{
        var text = feature.get('showName');
    }
    if (type == 'hide') {
        text = '';
    } else if (type == 'shorten') {
        text = text.trunc(12);
    } else if (type == 'wrap') {
        text = stringDivider(text, 16, '\n');
    }
    return '';
};

String.prototype.trunc = String.prototype.trunc ||
    function (n) {
        return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
    };

function stringDivider(str, width, spaceReplacer) {
    if (str.length > width) {
        var p = width;
        while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
            p--;
        }
        if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
                left = str.substring(0, p + 1);
            } else {
                left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
}

function getStyleStroke(width, str) {
    switch (str) {
        case 'solid':
            return '';
        case 'dot':
            return [1, 4 * width].join();
        case 'dash':
            return [4 * width, 4 * width].join();
        case 'dashdot':
            return [4 * width, 4 * width, 1, 4 * width].join();
        case 'longdash':
            return [8 * width, 4 * width].join();
        case 'longdashdot':
            return [8 * width, 4 * width, 1, 4 * width].join();
        default:
            return '';
    }
}

function getStyleStrokeArray(width, str) {
    switch (str) {
        case 'solid':
            return [];
        case 'dot':
            return [1, 4 * width];
        case 'dash':
            return [4 * width, 4 * width];
        case 'dashdot':
            return [4 * width, 4 * width, 1, 4 * width];
        case 'longdash':
            return [8 * width, 4 * width];
        case 'longdashdot':
            return [8 * width, 4 * width, 1, 4 * width];
        default:
            return [];
    }
}

/**
 * 默认样式
 */
var featureDefaultStyle = {
    textType: 'normal',// 文本显示类型(hide,normal,shorten,wrap)
    textMaxReso: 1200,//最大显示比例范围
    textAlign: 'center',//文本对齐方式（center，end，left，right，start）
    textBaseline: 'middle',//(alphabetic,bottom,hanging,ideographic,middle,top)
    textRotation: 0,//文本旋转
    textFont: '黑体',//字体
    textWeight: 'normal',//粗体(normal bold)
    textSize: 12,//字体大小
    textOffsetX: 0,
    textOffsetY: 15,
    textColor: '3399CC',//字体颜色
    textOutline: 'ffffff',
    textOutlineOpacity: 1,
    textOutlineWidth: 0,
    textOpacity: 1,
    image: '',
    //strokeColor: '3399CC',
    strokeColor: '29ab02',//边框颜色0b7a3f
    strokeOpacity: 1,
    strokeWidth: 3,
    strokeLineDash: null,
    //fillColor: 'ffffff',
    //fillOpacity: 0.4
    fillColor: 'ff7c30',
    fillOpacity: 0.01
}

function getDrawTextValue() {
    var dom = {
        textType: 'normal',// 文本显示类型(hide,normal,shorten,wrap)
        textMaxReso: 1200,//最大显示比例范围
        textAlign: 'center',//文本对齐方式（center，end，left，right，start）
        textBaseline: 'middle',//(alphabetic,bottom,hanging,ideographic,middle,top)
        textRotation: 0,//文本旋转
        textFont: '黑体',//字体
        textWeight: 'normal',//粗体(normal bold)
        textSize: 12,//字体大小
        textOffsetX: 0,
        textOffsetY: 0,
        textColor: '3399CC',//字体颜色
        textOutline: 'ffffff',
        textOutlineOpacity: 1,
        textOutlineWidth: 0,
        textOpacity: 1,
        image:'',
        strokeColor: '3399CC',
        strokeOpacity: 1,
        strokeWidth: 1.25,
        strokeLineDash: null,
        fillColor: 'ffffff',
        fillOpacity: 0.4
    }

    //设置字体样式内容
    dom.textType = $('#drowInputTextType').val();
    dom.textFont = $('#drowInputTextFont').val();
    dom.textSize = $('#drowInputTextSize').val();
    dom.textColor = $('#drowInputTextColor').val();
    dom.textOpacity = parseInt($('#drowInputTextOpacity').val()) / 100;
    dom.textOffsetX = $('#drowInputTextOffsetX').val();
    dom.textOffsetY = $('#drowInputTextOffsetY').val();
    dom.textOutline = $('#drowInputTextOutline').val();
    dom.textOutlineOpacity = parseInt($('#drowInputTextOutlineOpacity').val()) / 100;
    dom.textOutlineWidth = $('#drowInputTextOutlineWidth').val();
    dom.image = $('#drowInputTextImgSelect').val();
    //textWeight: 'normal',//粗体(normal bold)
    if ($('#drowInputTextWeight').is(':checked')) {
        dom.textWeight = 'bold';
    } else {
        dom.textWeight = 'normal';
    }

    //设置边框样式内容
    dom.strokeWidth = $('#drowInputStrokeWidth').val();
    dom.strokeColor = $('#drowInputStrokeColor').val();
    dom.strokeOpacity = parseInt($('#drowInputStrokeOpacity').val()) / 100;
    dom.strokeLineDash = $('#drowInputStrokeLineDash').val();
    //设置填充样式内容
    dom.fillColor = $('#drowInputFillColor').val();
    dom.fillOpacity = parseInt($('#drowInputFillOpacity').val()) / 100;
    return dom;
}

/*RGB颜色转换为16进制*/
String.prototype.colorHex = function () {
    var that = this;
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;
        }
        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return that;
        } else if (aNum.length === 3) {
            var numHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    } else {
        return that;
    }
};
/*16进制颜色转为RGB格式*/
String.prototype.colorRgb = function () {
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = this.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return { R: sColorChange[0], G: sColorChange[1], B: sColorChange[2], text: "RGB(" + sColorChange.join(",") + ")" };
    } else {
        return sColor;
    }
};

String.prototype.colorRgba = function (opacity) {
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = this.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        if (!opacity) {
            opacity = 1;
        }
        return { R: sColorChange[0], G: sColorChange[1], B: sColorChange[2], A: opacity, text: "RGBA(" + sColorChange.join(",") + ',' + opacity + ")" };
    } else {
        return sColor;
    }
};

/**
 * 显示一个进度条
 * @param {Element} el The target element.
 * @constructor
 */
function Progress(el) {
    this.el = el;
    this.loading = 0;
    this.loaded = 0;
}

/**
 * 增量加载瓷砖的计数。
 */
Progress.prototype.addLoading = function () {
    if (this.loading === 0) {
        this.show();
    }
    ++this.loading;
    this.update();
};


/**
 * Increment the count of loaded tiles.
 */
Progress.prototype.addLoaded = function () {
    var this_ = this;
    setTimeout(function () {
        ++this_.loaded;
        this_.update();
    }, 100);
};


/**
 * 更新进度条。
 */
Progress.prototype.update = function () {
    var width = (this.loaded / this.loading * 100).toFixed(1) + '%';
    this.el.style.width = width;
    if (this.loading === this.loaded) {
        this.loading = 0;
        this.loaded = 0;
        var this_ = this;
        setTimeout(function () {
            this_.hide();
        }, 500);
    }
};


/**
 * Show the progress bar.
 */
Progress.prototype.show = function () {
    this.el.style.visibility = 'visible';
};


/**
 * Hide the progress bar.
 */
Progress.prototype.hide = function () {
    if (this.loading === this.loaded) {
        this.el.style.visibility = 'hidden';
        this.el.style.width = 0;
    }
};

function setDrawOverlayEvent(type) {

    //名称改变事件
    $('#drowInputName').keyup(function (e) {
        var text = $('#drowInputTextType').val();
        if (text == 'hide') {
            $('#drowInputFontdemo').text("");
        } else if (text == 'shorten') {
            $('#drowInputFontdemo').text(e.target.value.trunc(12));
        } else if (text == 'wrap') {
            $('#drowInputFontdemo').text(stringDivider(e.target.value, 16, '\n'));
        } else {
            $('#drowInputFontdemo').text(e.target.value);
        }
    });

    $('#drowInputTextType').change(function (e) {
        var text = showNameText;
        if (e.target.value == 'hide') {
            $('#drowInputFontdemo').text("");
        } else if (e.target.value == 'shorten') {
            $('#drowInputFontdemo').text(text.trunc(12));
        } else if (e.target.value == 'wrap') {
            $('#drowInputFontdemo').text(stringDivider(text, 16, '\n'));
        } else {
            $('#drowInputFontdemo').text(text);
        }
    });
    $('#drowInputTextFont').change(function (e) {
        $('#drowInputFontdemo').css('font-family', e.target.value);
    });

    //字体颜色选择器
    $('#drowInputTextColor').colpick({
        submitText: '确定',
        layout: 'hex',
        submit: 0,
        color: '',
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            $(el).css('border-color', '#' + hex);
            if (!bySetColor) {
                $(el).val(hex);
                $('#drowInputFontdemo').css('fill', '#' + hex);
            }
        }
    }).keyup(function () {
        $(this).colpickSetColor(this.value);
    });
    $('#drowInputTextColor').blur(function () {
        $('#drowInputTextColor').colpickHide();
    });
    $('#drowInputTextOutline').colpick({
        submitText: '确定',
        layout: 'hex',
        submit: 0,
        color: '',
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            $(el).css('border-color', '#' + hex);
            if (!bySetColor) {
                $(el).val(hex);
                $('#drowInputFontdemo').css('stroke', '#' + hex);
            }
        }
    }).keyup(function () {
        $(this).colpickSetColor(this.value);
    });
    $('#drowInputTextOutline').blur(function () {
        $('#drowInputTextOutline').colpickHide();
    });

    $('#drowInputTextSize').keyup(function (e) {
        $('#drowInputFontdemo').css('font-size', e.target.value + 'px');
    });
    $('#drowInputTextOpacity').keyup(function (e) {
        var opacity = parseInt(e.target.value) / 100;
        $('#drowInputFontdemo').css('fill-opacity', opacity);
    });
    $('#drowInputTextOutlineOpacity').keyup(function (e) {
        var opacity = parseInt(e.target.value) / 100;
        $('#drowInputFontdemo').css('stroke-opacity', opacity);
    });
    $('#drowInputTextOutlineWidth').keyup(function (e) {
        $('#drowInputFontdemo').css('stroke-width', e.target.value);
    });
    $('#drowInputTextWeight').click(function (e) {
        var weight = "normal";
        if (e.target.checked) weight = "bolder";
        $('#drowInputFontdemo').css('font-weight', weight);
    });

    //边框
    if (type == "LINE" || type == "PYTHON") {
        //边框颜色选择器
        $('#drowInputStrokeColor').colpick({
            submitText: '确定',
            layout: 'hex',
            submit: 0,
            color: '',
            onChange: function (hsb, hex, rgb, el, bySetColor) {
                $(el).css('border-color', '#' + hex);
                if (!bySetColor) {
                    $(el).val(hex);
                    $('#drowInputStrokeDemo').css('stroke', '#' + hex);
                }
            }
        }).keyup(function () {
            $(this).colpickSetColor(this.value);
        });
        $('#drowInputStrokeColor').blur(function () {
            $('#drowInputStrokeColor').colpickHide();
        });
        $('#drowInputStrokeWidth').keyup(function (e) {
            $('#drowInputStrokeDemo').css('stroke-width', e.target.value + 'px');
        });
        $('#drowInputStrokeOpacity').keyup(function (e) {
            var opacity = parseInt(e.target.value) / 100;
            $('#drowInputStrokeDemo').css('opacity', opacity);
        });
        $('#drowInputStrokeLineDash').change(function (e) {
            var width = parseInt($('#drowInputStrokeWidth').val());
            $('#drowInputStrokeDemo').css('stroke-dasharray', getStyleStroke(width, e.target.value));
        });
    }

    if (type == "POINT" || type == "PYTHON") {
        //填充注册事件
        $('#drowInputFillColor').colpick({
            submitText: '确定',
            layout: 'hex',
            submit: 0,
            onChange: function (hsb, hex, rgb, el, bySetColor) {
                $(el).css('border-color', '#' + hex);
                if (!bySetColor) {
                    $(el).val(hex);
                    $('#drowInputFillDemo').css('fill', '#' + hex);
                }
            }
        }).keyup(function () {
            $(this).colpickSetColor(this.value);
        });
        $('#drowInputFillColor').blur(function () {
            $('#drowInputFillColor').colpickHide();
        });
        $('#drowInputFillOpacity').keyup(function (e) {
            var opacity = parseInt(e.target.value) / 100;
            $('#drowInputFillDemo').css('opacity', opacity);
        });
    }
}

//通过id获取type和layer
function drawFeatureByLayerId(id){
    map.un('singleclick', mapSingleclick);
    for(var i=0;i<listLayers.length;i++){
        if(id == listLayers[i].id){
            var type = listParamDetails[listLayers[i].type];
            var l = getLayerById(map.getLayers().getArray(),id);
            l.setVisible(true);
            addDrawFeature(type,l,id);
        }
    }
}

function selectFunction(){
    selectFeature = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove,
        style:getFeatureStyle
    });
    selectFeature.on("select",selectFeatureEvent);
    map.addInteraction(selectFeature);
}
function selectFeatureEvent(evt){
    mapSelectSource.clear();
    if(evt.selected[0] && isDrawend){
        var format = new ol.format.WKT();
        var f;
        if(evt.selected[0].getGeometry() instanceof ol.geom.Circle){
            f = new ol.Feature({
                geometry: new ol.geom.Polygon.fromCircle(evt.selected[0].getGeometry()),
            });
        }else if(evt.selected[0].getGeometry() instanceof ol.geom.MultiPolygon){
            f = new ol.Feature({
                geometry: new ol.geom.MultiPolygon(evt.selected[0].getGeometry().getCoordinates()),
            });
        }else if(evt.selected[0].getGeometry() instanceof ol.geom.Polygon){
            f = new ol.Feature({
                geometry: new ol.geom.Polygon(evt.selected[0].getGeometry().getCoordinates()),
            });
        }else if(evt.selected[0].getGeometry() instanceof ol.geom.LineString){
            f = new ol.Feature({
                geometry: new ol.geom.LineString(evt.selected[0].getGeometry().getCoordinates()),
            });
        }else if(evt.selected[0].getGeometry() instanceof ol.geom.MultiLineString){
            f = new ol.Feature({
                geometry: new ol.geom.MultiLineString(evt.selected[0].getGeometry().getCoordinates()),
            });
        }else{
            return;
        }
        f.setId(evt.selected[0].id_);
        var isNullFea = mapSelectSource.getFeatureById(evt.selected[0].id_);
        if(!isNullFea){
            mapSelectSource.addFeature(f);
            var setNum = 0;
            var intervalid = self.setInterval(function () {
                if (setNum > 31) {
                    window.clearInterval(intervalid);
                    mapSelectSource.clear();
                    return true;
                }
                if (setNum % 2 == 0) {
                    f.setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#FF8C00',
                            width: 3
                        })
                    }));
                } else {
                    f.setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#FF0000',
                            width: 3
                        })
                    }));
                }
                setNum++;
            }, 200);
        }
    }
}

function getIncByZoom(zoom){
    var inc;
    zoom = parseInt(zoom);
    if(zoom == 9){
        inc = 0.036;
    }else if(zoom == 10){
        inc = 0.008;
    }else if(zoom == 11){
        inc = 0.0025;
    }else if(zoom == 12){
        inc = 0.0015;
    }else if(zoom == 13 || zoom == 14){
        inc = 0.0010;
    }else if(zoom == 15 || zoom == 16){
        inc = 0.0005;
    }else if(zoom == 17 || zoom == 18){
        inc = 0.00025;
    }else if(zoom == 19 || zoom == 20 || zoom == 21){
        inc = 0.000125;
    }else{
        inc = 0.5;
    }
    return inc;
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function changeOnOffLine(type){
    if(type == "online" && tileType == "offline"){
        tiandituSatelliteLayer.setVisible(true);
        tianditu_biaozhu.setVisible(true);
        domMap.setVisible(false);
        baseMap.setVisible(false);
        tileType = "online";
        mapView.setMaxZoom(21);
        mapView.setMinZoom(3);
        localStorage.setItem("mapType","online");
        $("#online_span").html("在线<i class=\"fa fa-check\" style=\"color:#22c377\"></i>");
        $("#offline_span").html("离线");
    }else if(type == "offline" && tileType == "online"){
        domMap.setVisible(true);
        tian_di_tu_road_layer.setVisible(false);
        tiandituSatelliteLayer.setVisible(false);
        tianditu_biaozhu.setVisible(false);
        tileType = "offline";
        mapView.setMaxZoom(21);
        mapView.setMinZoom(9);
        localStorage.setItem("mapType","offline");
        $("#online_span").html("在线");
        $("#offline_span").html("离线<i class=\"fa fa-check\" style=\"color:#22c377\"></i>");
    }
    $(".scale_div span").css("color","white");
    $(".custom-mouse-position").css("color","white");
    $(".ol-scale-line-inner").css({
        "border":"1px solid #fff",
        "border-top":"none",
        "color":"white"
    });
}

function setPatrolPolygonFeature(msg){
    var geomJsons = [];
    if (msg.status == 1 && msg.data != null) {
        for (var i = 0; i < msg.data.length; i++) {
            if(msg.data[i].geomJson){
                var format = new ol.format.WKT();
                var featureWKT = format.readFeature(msg.data[i].geomJson, {
                    dataProjection: classification.projection,
                    featureProjection: classification.projection
                });
                var styleJson = JSON.parse(msg.data[i].styleJson);
                var dataJson = "";
                if(msg.data[i].dataJson!=''&&msg.data[i].dataJson!=undefined){
                    dataJson = JSON.parse(msg.data[i].dataJson);
                }
                featureWKT.setId(msg.data[i].id);
                featureWKT.set("id", msg.data[i].id);
                featureWKT.set("name", msg.data[i].name);
                featureWKT.set("userId", msg.data[i].userId);
                featureWKT.set("polygonNumber", msg.data[i].polygonNumber);
                featureWKT.set("area", msg.data[i].area);
                featureWKT.set("length", msg.data[i].length);
                featureWKT.set("polygonName", msg.data[i].polygonName);
                featureWKT.set("layerId", msg.data[i].layerId);
                featureWKT.set("dataGson",dataJson);
                featureWKT.set("styleJson", styleJson);
                featureWKT.set("showName", msg.data[i].polygonNumber);//地图上显示的名称
                geomJsons.push(featureWKT);
            }

        }
    }
    return geomJsons;
}

function setPatrolPointFeature(msg){
    var geomJsons = [];
    if (msg.status == 1 && msg.data != null) {
        for (var i = 0; i < msg.data.length; i++) {
            if(msg.data[i].geomJson){
                var format = new ol.format.WKT();
                var featureWKT = format.readFeature(msg.data[i].geomJson, {
                    dataProjection: classification.projection,
                    featureProjection: classification.projection
                });

                var styleJson = {};
                if(msg.data[i].styleJson != '' && msg.data[i].styleJson != undefined){
                    styleJson = JSON.parse(msg.data[i].styleJson);
                }
                var dataJson = "";
                if(msg.data[i].dataJson!=''&&msg.data[i].dataJson!=undefined){
                    dataJson = JSON.parse(msg.data[i].dataJson);
                }

                featureWKT.setId(msg.data[i].id);
                featureWKT.set("id", msg.data[i].id);
                featureWKT.set("polygonNumber",msg.data[i].polygon.deleteFlag=="NO"?msg.data[i].polygon.polygonNumber:"" );
                featureWKT.set("x", msg.data[i].x);
                featureWKT.set("y", msg.data[i].y);
                featureWKT.set("pointName", msg.data[i].pointName);
                featureWKT.set("layerId", msg.data[i].layerId);
                featureWKT.set("dataGson",dataJson);
                featureWKT.set("styleJson", styleJson);
                featureWKT.set("showName", msg.data[i].pointName);//地图上显示的名称
                geomJsons.push(featureWKT);
            }
        }
    }
    return geomJsons;
}

//地图页面视频弹出框
function showVideo(info,layerId){
    var layer = getLayerById(map.getLayers().getArray(),layerId);
    var tab = "<ul id='a' class='nav nav-tabs'>";
    if(info.length > 1){
        for(var i=0;i<info.length;i++){
            if(i == 0){
                tab += "<li class='active' onClick='tab_Click(this)' ><a href='#tab"+(i+1)+"'>视频" + (i+1) + "</a></li>";
            }else{
                tab += "<li  onClick='tab_Click(this)'><a href='#tab"+(i+1)+"' >视频" + (i+1) + "</a></li>";
            }
        }
    }
    tab += "</ul><div class='tab-content'></div>";
    $("#video_dialogmap_con").append(tab);
    $("#video_drowTitle").html(layer.values_.title);
    if(layerId){
        $.ajax({
            type: "POST",
            url: getProjectUrl() + "/map/layerField/getMapLayerField/"+layerId,
            async: false,
            success: function (data) {
                if(data.status==1){
                    var attrList = data.data;
                    for(var k=0;k<info.length;k++){
                        var video = info[k];
                        var maytab = "";
                        var attr="";
                        var imgattr="";
                        var videoattr="";
                        if(k == 0){
                            maytab += "<div class='tab-pane fade in active' id='tab"+(k+1)+"'>"
                                + "<div class='map_huxi'></div><table class='map_table'></table></div>";
                        }else{
                            maytab += "<div class='tab-pane fade' id='tab"+(k+1)+"'>"
                                + "<div class='map_huxi'></div><table class='map_table'></table></div>";
                        }
                        $("#video_dialogmap_con .tab-content").append(maytab);
                        for (var i = 0; i < attrList.length; i++) {
                            var key = attrList[i].fieldKey;
                            var trs="<tr>",tre="</tr>";
                            if(attrList[i].fieldType=="text"){
                                if(video[key] != undefined){
                                    if ((i + 1) % 2 == 1) {
                                        attr += trs;
                                    }
                                    var value = video[key];
                                    if(key == "ptz_type"){
                                        if(value == "DH"){
                                            value = "大华";
                                        }else if(value == "HK"){
                                            value = "海康"
                                        }else if(value == "DL"){
                                            value = "大立";
                                        }
                                    }
                                    attr += "<td><label>"+attrList[i].fieldValue+"</label></td>"
                                        +"<td><input type='text' title='"+video[key]+"' id='"+key+"' name='"+key+"' value='"+value+"' readonly='readonly'/></td>";
                                    if ((i + 1) % 2 == 0) {
                                        attr += tre;
                                    }
                                }else{
                                    if ((i + 1) % 2 == 1) {
                                        attr += trs;
                                    }
                                    attr += "<td><label>"+attrList[i].fieldValue+"</label></td>"
                                        +"<td><input type='text' id='"+key+"' name='"+key+"' readonly='readonly'/></td>";
                                    if ((i + 1) % 2 == 0) {
                                        attr += tre;
                                    }
                                }
                            }else if(attrList[i].fieldType=="image"){
                                if(info[key]){
                                    var imgStr = info[key];
                                    var imglist = imgStr.split(";");
                                    var lis = "<li>";
                                    var lie = "</li>";
                                    var lino1 = "<li class='no1'>";
                                    for(var j=0;j<imglist.length;j++){
                                        var url=ftpUrl+imglist[j];
                                        var str = imglist[j].split("/");
                                        var title = str[2].split(".");
                                        if(j == 0){
                                            imgattr += lino1;
                                        }else{
                                            imgattr += lis;
                                        }
                                        imgattr += "<p class='img_title'>"+title[0]+"</p><a href='#'><img src='"+url+"'/></a>";
                                        imgattr += lie;
                                    }
                                }
                            }else if(attrList[i].fieldType=="video"){
                                if(video[key] != undefined){
                                    if ((i + 1) % 2 == 1) {
                                        attr += trs;
                                    }
                                    attr += "<td><label>"+attrList[i].fieldValue+"</label></td>"
                                        +"<td><input type='text' id='"+key+"' name='"+key+"' value='"+video[key]+"' readonly='readonly'/></td>";
                                    if ((i + 1) % 2 == 0) {
                                        attr += tre;
                                    }
                                }else{
                                    if ((i + 1) % 2 == 1) {
                                        attr += trs;
                                    }
                                    attr += "<td><label>"+attrList[i].fieldValue+"</label></td>"
                                        +"<td><input type='text' id='"+key+"' name='"+key+"' readonly='readonly'/></td>";
                                    if ((i + 1) % 2 == 0) {
                                        attr += tre;
                                    }
                                }
                                videoattr += "<div id='ckplay_"+ video.channel +"' class='video-td-container selectkibonone'></div>"
                                    + "<div class='video-mask-title'>"
                                    + "<b>['"+video.video_name+"']&nbsp;</b></div>";
                            }
                        }
                        $("#tab"+(k+1)+" .map_table").append(attr);
                        $("#tab"+(k+1)+" .map_huxi").append(videoattr);
                        var parent = $("#tab"+(k+1)+" .map_huxi #ckplay_"+video.channel);
                        var _width = "566px";
                        var _height = "280";

                        var flashvars = {
                            p : 1,
                            f : rtmp+'/live/'+video.source,
                            c : 0,
                            wh : _width + ':' + _height,
                        };
                        var params = {
                            bgcolor : '#FFF',
                            allowFullScreen : true,
                            allowScriptAccess : 'always',
                            wmode : 'transparent'
                        };
                        CKobject.embedSWF(getProjectUrl() + '/static/ckplayer/ckplayer.swf', "ckplay_"+video.channel, 'ckplayer_'+video.channel,
                            _width, _height, flashvars, params);
                    }
                }else if(data.status==2){
                    console.log(data.message);
                }
            }
        });
    }
}


var areaData = {};
var showNameText="";
function setDrawTextValuePatrol(type, feature,layer) {
    $("#txtLon").val(null);
    $("#txtLat").val(null);
    $("#txtHDMSLon").val(null);
    $("#txtHDMSLat").val(null);
    $("#txtBJLon").val(null);
    $("#txtBJLat").val(null);
    var coordinate = feature.getGeometry().getLastCoordinate();
    var dom = feature.get("styleJson");
    if (!dom) {
        dom = getStyleFromLayerId(layer.get("layerId"));
    }
    showNameText = feature.get('name');

    //---------非动态加载属性字段-----------------------------------------
    $("#drowTitle").html(layer.values_.title);
    $("#tab3").html("");
    var attr="";
    attr +='<div class="tab_width"><FORM METHOD=POST ACTION="" name="form1">';

    $("#popupDrawId").removeAttr("style");

    //-----------巡护区域的桩点获取区域编号
    areaData = {};
    if (type == "POINT" && layer.values_.title != "网格员") {
        var format = new ol.format.WKT();
        var pointGeom = feature.getGeometry();
        var gj = format.writeGeometry(pointGeom);
        var table = null;
        table = "patrol_polygon";
        var checkType='DWITHIN';//点查线

        $.ajax({
            url:'../patrol/patrolPolygon/findBySpatialQuery.json?table='+table+'&type='+checkType+'&geom='+gj,
            type:'POST',
            async: false,
            dataType:'json',
            contentType: "application/json",
            success: function(msg) {
                areaData = msg.data;
            },
            error:function(msg){
                areaData = msg.data;
            }
        });

    }

    /**
     * 巡护桩点
     */

    if(type == "POINT" && layer.values_.title != "网格员"){
        showNameText = feature.get('pointName');//编辑时样式预览中的字为管护点的名字
        var xx = Number(coordinate[0]).toFixed(6);
        var yy = Number(coordinate[1]).toFixed(6);
        //x坐标
        attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
            "<span class='input-group-addon'> x 坐标 :</span>" +
            "<input type='number' class='form-control' id='pointX' name='pointX' title='"+xx+"' value='"+xx+"' disabled='true' step='0.000001' style='width: 100%;'/>"+
            "</div></div>";

        //y坐标
        attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
            "<span class='input-group-addon'> y 坐标 :</span>" +
            "<input type='number' class='form-control' id='pointY' name='pointY' title='"+yy+"' value='"+yy+"' disabled='true' step='0.000001' style='width: 100%;'/>"+
            "</div></div>";

        //桩点名称
        var pointName = "";
        if(feature.get("pointName") == undefined){
            pointName = "<input type='text' class='form-control' id='pointName' name='pointName' value='' disabled='true' style='width: 100%;'/>";
        }else{
            pointName = "<input type='text' class='form-control' id='pointName' name='pointName' value='"+feature.get("pointName")+"' disabled='true'  style='width: 100%;'/>";
        }
        attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
            "<span class='input-group-addon'> 桩点名称 :</span>" +
            pointName +
            "</div></div>";

        //区域编号
        var selectregoinNumberAttr = '';
        if(feature.get("polygonNumber")!=undefined){
            selectregoinNumberAttr += "<option  name='polygonNumber' selected='selected' >"+feature.get("polygonNumber")+"</option>";
        }
        for(var j=0;j<areaData.length;j++) {
            if(areaData[j].polygonNumber != feature.get("polygonNumber")){
                selectregoinNumberAttr += "<option  name='polygonNumber' >"+areaData[j].polygonNumber+"</option>";
            }
        }

        attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
            "<span class='input-group-addon'> 区域编号 :</span>" +
            "<select id='polygonNumber' name='type' class='form-control' >"+
            selectregoinNumberAttr+
            "</select>" +
            "</div></div>";
    }

    /**
     * 巡护区域
     */
    if(type == "PYTHON" || type == 'LINE'){
        showNameText = feature.get('polygonNumber');//编辑时样式预览中的字为管护点的名字

        //区域编号
        if(feature.get("polygonNumber" )== undefined){
            attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                "<span class='input-group-addon'> 区域编号 :</span>" +
                "<input type='text' class='form-control' id='polygonNumber' name='polygonNumber' value='' disabled='true' />" +
                "</div></div>";
        }else{
            attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                "<span class='input-group-addon'> 区域编号 :</span>" +
                "<input type='text' class='form-control' id='polygonNumber' name='polygonNumber' value='"+feature.get("polygonNumber")+"' disabled='true' />" +
                "</div></div>";
        }
        if(type == "PYTHON"||type == "MultiPolygon"){
            var area = "";
            if(feature.get("area") == undefined){
                area = formatArea(feature.getGeometry());
                if(area.indexOf("km<sup>2</sup>")!=-1){
                    area = area.split("km")[0];
                }else{
                    area = area.split("m")[0] / 1000000;//平方米转为平方千米
                }
                attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                    "<span class='input-group-addon'> 面积(km<sup>2</sup>) :</span>" +
                    "<input type='text' class='form-control' id='area' name='area' title='"+area+"' value='"+area+"' readonly='readonly' />" +
                    "</div></div>";
            }else{
                area = feature.get("area");
                attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                    "<span class='input-group-addon'> 面积(km<sup>2</sup>) :</span>" +
                    "<input type='text' class='form-control' id='area' name='area' value='"+area+"' readonly='readonly' />" +
                    "</div></div>";
            }
        }else{
            var length = "";
            if(feature.get("length") == undefined){
                length = formatLength(feature.getGeometry());
                if(length.indexOf("km")!=-1){
                    length = length.split("km")[0];
                }else{
                    length = length.split("m")[0] / 1000;//米转为千米
                }
                attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                    "<span class='input-group-addon'> 长度(km) :</span>" +
                    "<input type='text' class='form-control' id='length' name='length' title='"+length+"' value='"+length+"' readonly='readonly' />" +
                    "</div></div>";
            }else{
                length = feature.get("length");
                attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class='input-group'>" +
                    "<span class='input-group-addon'> 长度(km) :</span>" +
                    "<input type='text' class='form-control' id='length' name='length' title='"+length+"' value='"+length+"' readonly='readonly' />" +
                    "</div></div>";
            }
        }


        //网格员
        attr += "<div class='col-md-6' style='margin-bottom: 12px;'><div class=' input-group'>" +
            "<span class='input-group-addon'> 网格员 :</span>" +
            "<select  id=\"userId\" title=\"请选择网格员\" class='dowebok'>\n" +
            "</select>\n" +
            "<input type=\"hidden\" name=\"userId\"/>\n" +
            "</div></div>";


    }

    attr += '</div></FORM></div>';
    $("#tab3").append(attr);
    //网格员下拉框
    var userItems = $("#userId");
    userItems.append("<option>未绑定人员</option>");
    for(var j = 0; j < userLists.length; j++) {
        if(userLists[j].user.id == feature.get("userId")){
            userItems.append("<option selected='selected' value='" + userLists[j].user.id + "'>" +  userLists[j].name + "</option>");
        }else{
            userItems.append("<option value='" + userLists[j].user.id + "'>" +  userLists[j].name + "</option>");
        }
    }
    $('#userId').comboSelect();

    //---------非动态加载属性字段end----------------------
    if (type == "POINT") {
        var groupid;
        for(var i=0;i<listLayers.length;i++){
            var listlayer=listLayers[i];
            if(layer.values_.layerId==listLayers[i].id){
                groupid = listlayer.groupId;
            }
        }
        showNameText = $('#pointName').val();
        if (!showNameText) {
            showNameText = '标绘点';
        }
        feature.set('name', showNameText);
        $("#drowFontDiv").show()
        $("#drowStrokeDiv").hide();
        $("#drowFileDiv").show();
        $("#drowlonlatDiv").hide();
        $("#drowInputTextImg").hide();//桩点不显示图片
        //dom.fillOpacity=100;
        $("#drowInputFillOpenness").hide();//桩点填充不显示透明度
        $("#drowInputFillOpacity").hide();//桩点填充不显示透明度
    }else if (type == 'PYTHON' || type == 'LINE') {
        showNameText = $('#polygonNumber').val();
        if (!showNameText) {
            showNameText = '标绘线';
        }
        feature.set('name', showNameText);
        //隐藏样式中图片属性
        $("#drowInputTextImg").hide();
        //移除样式中预览中的图片
        $("#imgView img").remove();
        $("#drowFontDiv").show()
        $("#drowStrokeDiv").show();
        $("#drowFileDiv").show();
        $("#drowlonlatDiv").hide();
        $("#drowInputFillOpenness").show();//区域填充显示透明度
        $("#drowInputFillOpacity").show();//区域填充显示透明度
    }

    //设置字体样式内容
    $('#drowInputTextType').val(dom.textType);
    $('#drowInputTextFont').val(dom.textFont);
    $('#drowInputTextSize').val(dom.textSize);
    $('#drowInputTextColor').val(dom.textColor);
    $('#drowInputTextColor').colpickSetColor('#' + dom.textColor);
    $('#drowInputTextOpacity').val(parseFloat(dom.textOpacity) * 100);
    $('#drowInputTextOffsetX').val(dom.textOffsetX);
    $('#drowInputTextOffsetY').val(dom.textOffsetY);
    $('#drowInputTextOutline').val(dom.textOutline);
    $('#drowInputTextOutline').colpickSetColor('#' + dom.textOutline);
    $('#drowInputTextOutlineOpacity').val(parseFloat(dom.textOutlineOpacity) * 100);
    $('#drowInputTextOutlineWidth').val(dom.textOutlineWidth);

    if (dom.textWeight == "normal") {
        $('#drowInputTextWeight').attr("checked", false);
    } else {
        $('#drowInputTextWeight').attr("checked", true);
    }

    //设置字体显示样式
    if (dom.textType == 'shorten') {
        $('#drowInputFontdemo').text(showNameText.trunc(12));
    } else if (dom.textType == 'wrap') {
        $('#drowInputFontdemo').text(stringDivider(showNameText, 16, '\n'));
    }else if (dom.textType == 'hide') {
        $('#drowInputFontdemo').text("");
    }

    $('#drowInputFontdemo').css('fill', '#' + dom.textColor).css('stroke', '#' + dom.textOutline).css('font-size', dom.textSize + 'px')
        .css('fill-opacity', dom.textOpacity).css('stroke-opacity', dom.textOutlineOpacity).css('stroke-width', dom.textOutlineWidth)
        .css('font-weight', dom.textWeight).css('font-family', dom.textFont);

    //设置边框样式内容
    $('#drowInputStrokeWidth').val(dom.strokeWidth);
    $('#drowInputStrokeColor').val(dom.strokeColor);
    $('#drowInputStrokeColor').colpickSetColor('#' + dom.strokeColor);
    $('#drowInputStrokeOpacity').val(parseFloat(dom.strokeOpacity) * 100);
    $('#drowInputStrokeLineDash').val(dom.strokeLineDash);
    $('#drowInputStrokeDemo').css('stroke', '#' + dom.strokeColor).css('stroke-width', dom.strokeWidth + 'px').css('opacity', dom.strokeOpacity)
        .css('stroke-dasharray', getStyleStroke(dom.strokeWidth, dom.strokeLineDash));

    //设置填充样式内容
    $('#drowInputFillColor').val(dom.fillColor);
    $('#drowInputFillColor').colpickSetColor('#' + dom.fillColor);
    $('#drowInputFillOpacity').val(parseFloat(dom.fillOpacity) * 100);
    $('#drowInputFillDemo').css('fill', '#' + dom.fillColor).css('opacity', dom.fillOpacity);

}

function getMaxZIndexLayer(layers){
    var maxLayer;
    for(var i=0;i<layers.length;i++){
        if(layers[i] instanceof ol.layer.Vector){
            maxLayer = layers[i];
            return maxLayer;
        }
        if(i==0){
            maxLayer = layers[i];
        }else{
            if(maxLayer.getZIndex() < layers[i].getZIndex()){
                maxLayer = layers[i];
            }
        }
    }
    return maxLayer;
}

/**
 * 通过属性名获取feature
 * @param layer 所在图层
 * @param property 属性名
 * @param value 值
 * @returns feature
 */
function getFeatureByAttribute(layer,property,value){
    var features = layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; i++) {
        if (features[i].get(property) === value) {
            return features[i];
        }
    }
    return null;
}

/**
 * 获取地理信息下图层配置的自定义样式
 */
function getStyleFromLayerId(layerId) {
    var feaStyleJson =  featureDefaultStyle;
    if(layerId!=""&&layerId!=undefined){
        $.ajax({
            type: "get",
            async:false,
            url: ctx+'/map/layerLegend/findLegendByLayer?layerId='+layerId,
            success: function(result) {
                if (result.success) {
                    var data = result.data[0];
                    feaStyleJson = JSON.parse(data.styleJson);
                }
            }
        });
    }
    return feaStyleJson;
}

function getTypesSqlByGroupName(gname){
    var gid;
    var sql = "";
    for(var i=0;i<layerGroups.length;i++){
        if(layerGroups[i].name == gname){
            gid = layerGroups[i].id
        }
    }
    if(!gid){
       return ;
    }
    for(var j=0;j<listLayers.length;j++){
        if(listLayers[j].groupId == gid && listLayers[j].editorField){
            layerFeatureTypes.push(listLayers[j].featureType);
            if(sql){
                sql += ",";
            }else{
                sql += "(";
            }
            sql += "'" + listLayers[j].featureType +"'"
        }
    }
    if(sql){
        sql += ")";
    }
    return sql;
}

//获取传递的参数   var url = '"/mapView/patrol?name=event&lon=' + points[0] + '&lat=' + points[0] + '&zoom=3&id=' + value +'"';
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var param = decodeURIComponent(window.location.search.substr(1));
    var r = param.match(reg);
    if (r != null)
        return r[2];
    //return unescape(r[2]);//会中文乱码
    //     return decodeURI((r[2]));//解决了中文乱码
    return null;
}

function showLayerById(id){
    var layer = getLayerById(map.getLayers().getArray(),id);
    layer.setVisible(true);
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var treeNodes = treeObj.getNodesByParam("id", id, null);
    if(treeNodes){
        treeObj.checkNode(treeNodes[0], true, true);
    };
}

function cleanDraw(){
    mapMeasureSource.clear();
}