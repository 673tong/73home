var viewer;
var datasource;
var measureSurface;
var drawSurface;
var geometry;
var coordsArray = [];
var ellipsoid;
var terrainProvider1 = Cesium.createWorldTerrain();
var raisedPositions;
var isLoadPositions = false;
var listLayers = [];
var listParamDetails = {};
var allCartographics = {};
var allLength = 0;
var allType = {};
var k = 0;
var layerIds = [];
var checkEntities = [];
var isDepthTest = false;
var routeCoords = [];
var isTracked = false;
var cesiumOverlay;
var offset = 0;
$(function () {
    $.ajax({
        type: "POST",
        url: "../gis/getMapData",
        async: false,
        success: function (msg) {
            if (msg.status == 1 && msg.data != null) {
                listLayers = msg.data.listLayers;
                listParamDetails = msg.data.listParamDetails;
                return;
            } else if (msg.status == 2) {
                alert("没有查询到地图数据");
            } else {
                alert("获取地图数据错误：" + msg.message);
            }
            listLayers = null;
        }
    });
	var terrainProvider = new Cesium.CesiumTerrainProvider({
		url:'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
        requestWaterMask: true,
        requestVertexNormals: true
	});

	// var imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
	// 	url:"http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
     //    layer: 'tdtBasicLayer',
     //    style: 'default',
     //    format: 'image/jpeg',
     //    tileMatrixSetID: "GoogleMapsCompatible",
     //    credit:new Cesium.Credit("影像地图"),
     //    maximumLevel:16
	// });
    var imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url:"http://mt0.google.cn/vt/lyrs=s&hl=zh-CN&g0=CN&x={x}&y={y}&z={z}" //谷歌无偏差卫星图
    });
	viewer = new Cesium.Viewer('cesiumContainer',{
//		scene3DOnly: true, 
		terrainProvider:terrainProvider,
		imageryProvider:imageryProvider,
		baseLayerPicker:false,
		animation: true,
		fullscreenButton: false,
        showRenderLoopErrors:false,
		geocoder: false,
		homeButton: false,
		infoBox: true,
		sceneModePicker: false,
		selectionIndicator: false,
		timeline: false,
		navigationHelpButton: false,
		navigationInstructionsInitiallyVisible: false,
        mapProjection: new Cesium.WebMercatorProjection()
	});
    viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url:"http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
    }));
    viewer.extend(Cesium.viewerCesiumNavigationMixin, {
        defaultResetView:new Cesium.Cartographic.fromDegrees(108.774816,34.182994, 260000),
        enableDistanceLegend:false
    });
    viewer.cesiumNavigation.distanceLegendDiv.className = "legendDiv";
    $(".scale_div").append(viewer.cesiumNavigation.distanceLegendDiv);
    viewer.animation.viewModel.setShuttleRingTicks([0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]);
    ellipsoid = viewer.scene.globe.ellipsoid;
	//开启照明
	viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 80;
    measureSurface = new mars3d.Measure({viewer:viewer,terrain:!1});
    drawSurface = new mars3d.Draw({viewer:viewer,hasEdit:!1,dragIcon:"",onStopDrawing:function(e){drawLineOk(e)}});
	$(".cesium-widget-credits").hide();
    $('.cesium-viewer-animationContainer').hide();
    $(".navigation-control")[0].title = "放大";
    $(".navigation-control")[1].title = "还原";
    $(".navigation-control-last")[0].title = "缩小";
    $(".compass-outer-ring")[0].title = "点击拖拽旋转地图";
    $(".compass")[0].title = "点击拖拽或按住ctrl加鼠标左键移动视角";
	var highlightBarHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    setMouseMove(highlightBarHandler);
    viewer.clock.onTick.addEventListener(setMinCamera);
    maptab_ulClick();
    comandFunction();
    viewer.screenSpaceEventHandler.setInputAction(mapSingleClick,Cesium.ScreenSpaceEventType.LEFT_CLICK);
});

var _position, _pm_position, _cartesian;
var _pm_position_2;

function postRender() {
    if(_pm_position != _pm_position_2){
        _pm_position_2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.cesiumWidget.scene, _cartesian);
        var popw = document.getElementById("trackPopUpContent").offsetWidth;
        var poph = document.getElementById("trackPopUpContent").offsetHeight;
        var trackPopUpContent_ = window.document.getElementById("trackPopUpContent");
        var left = _pm_position_2.x-(popw/2);
        var top = _pm_position_2.y-(poph+10) - offset;
        // trackPopUpContent_.style.transform = "translate3d(" + left + "px," + top + "px,0px)";
        trackPopUpContent_.style.left = left + "px";
        trackPopUpContent_.style.top = top + "px";
    }
}
function mapSingleClick(movement){
    var p = viewer.scene.pick(movement.position);
    if(p){
        var entity = p.id;
        var properties = entity.properties;
        if(!properties){
            return;
        }
        var data = properties.getValue();
        var layerData = getLayerDataByFeatureType(entity.name);
        // var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
        var cartesian = entity.position.getValue();
        // var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        var picks = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);

        // _position = movement.position;
        _position = entity.position.getValue();
        _cartesian = cartesian;
        _pm_position = {x: picks.x, y: picks.y}

        if(data){
            $("#trackPopUp").html("");
            if (entity.name.indexOf("video") != -1){
                openVideo(layerData.id,layerData.name,data);
            } else {
                openWms(layerData.id,layerData.name,data);
            }
            viewer.scene.postRender.addEventListener(postRender);
        }
    }
}

function openVideo(layerId,layerName,video){
    var infoDiv = "";
    if(layerId){
        $.ajax({
            type: "POST",
            url: getProjectUrl() + "/map/layerField/getMapLayerField/"+layerId,
            async: false,
            success: function (data) {
                if(data.status==1){
                    var attrList = data.data;
                    var attr="";
                    var imgattr="";
                    var videoattr="";
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

                    infoDiv = document.getElementById("trackPopUp");
                    infoDiv.innerHTML = '<div id="trackPopUpContent" class="leaflet-popup" style="top:0;left:0;">' +
                        '<a class="ol-popup-closer" onclick="closeDiv(\'trackPopUp\')"></a>' +
                        '<div class="leaflet-popup-content-wrapper">' +
                        '<div class="dialogmap_con" ><h1>' +
                        layerName +
                        '</h1>' +
                        '<div class="tab-content">' +
                        '<div class="map_huxi"></div><table class="map_table"></table>'+
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="leaflet-popup-tip-container">' +
                        '<div class="leaflet-popup-tip"></div>' +
                        '</div>' +
                        '</div>';
                    $(".map_table").append(attr);
                    $(".map_huxi").append(videoattr);
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
                    window.document.getElementById("cesiumContainer").appendChild(infoDiv);
                    window.document.getElementById("trackPopUp").style.display = "block";
                }
            }
        });
    }
}

function openWms(layerId,name,data) {
    var infoDiv = "";
    var layerFields =null;
    $.ajax({
        type: 'post',
        url: '../gis/findLayerFields',
        data:{layerId:layerId},
        async: false,
        success: function(msg) {
            if(msg.status){
                layerFields = msg.layerFields;
            }
        },
        error:function(err){
            alert('获取图层字段信息错误:'+err);
            return ;
        }
    });
    var attr = '';
    var imageKeys = new Array();
    var textFileds = new Array();
    for(var j=0;j<layerFields.length;j++){
        var layField = layerFields[j];
        if(layField.fieldType =='image'){
            imageKeys.push(layField.fieldKey);
        }else{
            textFileds.push(layField);
        }
    }
    if(imageKeys.length>=1){
        var imageKey = imageKeys[0];
        var imageContent = data[imageKey];
        var images = [];
        images.push('nopic.png;');
        var isNull = true;
        if(imageContent && imageContent!='Null'){
            images = imageContent.split(";");//所有的图片的路径
            isNull = false;
        }
        //然后开始构建image的div
        attr+="<div class=\"map_huxi\">";
        attr+="<ul class=\"map_tuul\" id=\"tuul\">";
        for(var k=0;k<images.length;k++){
            var image = images[k];
            if(image){
                var imagePath = isNull?getProjectUrl()+'/static/img/'+images:ftpUrl + "/" + image;
                attr+="<li ";
                if(k==0){
                    attr+="class=\"no1\"";
                }
                attr+=" >";
                attr+="<p class=\"img_title\"></p>";
                attr+="<img src=\""+imagePath+"\" />";
                attr+="</li>";
            }
        }
        attr+="<div class=\"anniu\">";
        attr+="<a class=\"leftbut\" id=\"leftbut\" onclick=\"leftChange();\"></a>";
        attr+="<a class=\"rightbut\" id=\"rightbut\" onclick=\"rightChange()\"></a>";
        attr+="</div>";
        attr+="</div>";
    }
    attr+="<table class=\"map_table\">";
    for(var j=0;j<textFileds.length;j++){
        var key = readFieldKey(textFileds[j].fieldKey);
        var label = textFileds[j].fieldValue;
        var content = '';
        if(data[key] != undefined && data[key] != null){
            content = data[key];
        }
        if(content == undefined || content == null || content =='Null' ){
            content = '';
        }
        if(j%2==0){
            attr+="<tr>";
        }
        attr+="<td>";
        attr+="<label>"+label+"</label>";
        attr+="</td>";
        attr+="<td>";
        attr+="	<input type=\"text\" title=\""+content+"\" value=\""+content+"\" readonly=\"readonly\"/>";
        attr+="</td>";
        if(j%2==1){
            attr+="</tr>";
        }
    }
    attr+="</table>";
    infoDiv = document.getElementById("trackPopUp");
    infoDiv.innerHTML = '<div id="trackPopUpContent" class="leaflet-popup" style="top:0;left:0;">' +
        '<a class="ol-popup-closer" onclick="closeDiv(\'trackPopUp\')"></a>' +
        '<div class="leaflet-popup-content-wrapper">' +
        '<div class="dialogmap_con" ><h1>' +
        name +
        '</h1>' +
        attr +
        '</div>' +
        '</div>' +
        '<div class="leaflet-popup-tip-container">' +
        '<div class="leaflet-popup-tip"></div>' +
        '</div>' +
        '</div>';
    window.document.getElementById("cesiumContainer").appendChild(infoDiv);
    window.document.getElementById("trackPopUp").style.display = "block";
}

function setMouseMove(Handler){
    Handler.setInputAction(function (movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            //将弧度转为度的十进制度表示
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            //获取视角相机高度
            var height1 = Math.ceil(viewer.camera.positionCartographic.height);
            //海拔高度
            var height2 = parseFloat(viewer.scene.globe.getHeight(cartographic)).toFixed(6);
            $("#mouse-position").text('');
            $("#altitude").text('');
            $("#cameraHeight").text('');
            $("#mouse-position").append(longitudeString + "&nbsp;&nbsp;&nbsp;" + latitudeString);
            $("#altitude").append(height2 + "米");
            $("#cameraHeight").append(height1 + "米");
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function setMinCamera(){
    var cameraHeight = viewer.camera.positionCartographic.height;
    if(cameraHeight < 5000 && !isDepthTest){
        viewer.scene.globe.depthTestAgainstTerrain = true;
        isDepthTest = true;
    }else if(cameraHeight > 5000 && isDepthTest){
        viewer.scene.globe.depthTestAgainstTerrain = false;
        isDepthTest = false;
    }
    if(viewer.trackedEntity && isTracked && cameraHeight > 0){
        viewer.camera.moveBackward(200);
        if(cameraHeight > 1000){
            viewer.camera.rotateUp(0.6);
            isTracked = false;
        }
    }
    if(Cesium.Math.toDegrees(viewer.camera.pitch)>-75){
        offset = (75 + Cesium.Math.toDegrees(viewer.camera.pitch))/2;
    }else{
        offset = 0;
    }
}

function getPosition() {
    //得到当前三维场景
    var scene = viewer.scene;
    //得到当前三维场景的椭球体
    var ellipsoid = scene.globe.ellipsoid;
    var entity = viewer.entities.add({
        label : {
            show : false
        }
    });
    var longitudeString = null;
    var latitudeString = null;
    var height = null;
    var cartesian = null;
    // 定义当前场景的画布元素的事件处理
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
    handler.setInputAction(function(movement) {
        //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
        cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            //将弧度转为度的十进制度表示
            longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            //获取相机高度
            height = Math.ceil(viewer.camera.positionCartographic.height);
            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')' ;
        }else {
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //设置鼠标滚动事件的处理函数，这里负责监听高度值变化
    handler.setInputAction(function(wheelment) {
        height = Math.ceil(viewer.camera.positionCartographic.height);
        entity.position = cartesian;
        entity.label.show = true;
        entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')' ;
    }, Cesium.ScreenSpaceEventType.WHEEL);
}

//获取当前的url路径
function getProjectUrl() {
    var protocol = window.location.protocol;
    var host = window.location.host;
    var pathname = window.location.pathname;
    var project = pathname.split("\/")[1];
    var url = protocol+"//"+host+"/"+project;
    return url;
}

//量算
function clearDraw() {
    measureSurface.clearMeasure();
    drawSurface.deleteAll();
}
function measuerLength() {
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    measureSurface.measuerLength({
        terrain: !1
    })
}
function measuerLength2() {
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    measureSurface.measuerLength({
        terrain: !0
    })
}
function measureArea() {
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    measureSurface.measureArea()
}
function measureHeight() {
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    measureSurface.measureHeight({
        isSuper: !1
    })
}
function measureHeight2() {
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    measureSurface.measureHeight({
        isSuper: !0
    })
}

function fullscreen() {
    var $ = function(selector) {
        return jQuery(selector, window.parent.document);
    }

    var windowHeight;
    function whWindow() {
        windowHeight = $(window.parent.document).height() - 50
        $('.wrapper').css({
            'height' : windowHeight + 'px'
        });
    }
    whWindow();

    mainHeight = jQuery(document).height() + 80;
    $("iframe").css({
        'height' : mainHeight + 'px'
    });

    $('#main-content').css({
        'margin-left' : '0px'
    });
    $('.sidebar-toggle-box').css({
        'left' : '0'
    });
    $('#sidebar').css({
        'margin-left' : '-100px'
    });
    $('#sidebar > ul').hide();
    $('.header').hide();
    $("#container").addClass("sidebar-closed");
    $('.sidebar-toggle-box .fa').addClass("fa-angle-right").removeClass("fa-angle-left");
}

function fullMap(){
	viewer.camera.flyTo({
		destination :Cesium.Cartesian3.fromDegrees(108.774816,34.182994, 260000), // 设置位置
        orientation: {
            heading : Cesium.Math.toRadians(0), // 方向
            pitch : Cesium.Math.toRadians(-90.0),// 倾斜角度
            roll : 0
        },
		duration: 2
	})
}

function moveDown(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveDown(moveRate);
}
function moveUp(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveUp(moveRate);
}
function moveLeft(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveLeft(moveRate);
}
function moveRight(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveRight(moveRate);
}
function moveForward(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveForward(moveRate);
}
function moveBackward(){
    var cameraHeight = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    var moveRate = cameraHeight / 10.0;
	viewer.camera.moveBackward(moveRate);
}
function leftRotate(){
	viewer.camera.twistRight(Cesium.Math.toRadians(90.0).toFixed(2));
}
function rightRotate(){
	viewer.camera.twistLeft(Cesium.Math.toRadians(90.0).toFixed(2));
}

function onchange2(){
    if(GetQueryString("type") == "patrol"){
        window.location.href = getProjectUrl()+'/mapView/patrol';
    }else if(GetQueryString("type") == "mapView"){
        window.location.href = getProjectUrl()+'/gis/geography';
    }
}
function closeDiv(id) {
    if($("#trackPopUp")[0].style.display == "block"){
        viewer.scene.postRender.removeEventListener(postRender);
    }
    var objDiv=$("#"+id);
    objDiv.css("display","none");
}

function show(divId) {
    var div = document.getElementById(divId);
    if (div.style.display == 'block') {
        div.style.display = "none";
    } else {
        div.style.display = 'block';
    }
}

function maptab_ulClick(){
    $(".maptab_ul li").click(function(){
        $(this).addClass("maptab_add").siblings().removeClass("maptab_add").parent().siblings(".maptab_seconde").children("div").eq($(this).index()).show().siblings().hide();
    })
}

function toPostion(type){
    var lon, lat;
    if(type == "jwd"){
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
        if (lat == "" || lon == "") {
            alert("请输入正确的经纬度");
            return;
        }
    }else{
        lon = parseFloat($("#txtCoordinateLon").val());
        lat = parseFloat($("#txtCoordinateLat").val());
        if (lat == "" || lon == "") {
            alert("请输入正确的经纬度");
            return;
        }
    }
    flyToPostion(lon, lat);
    $("#dialog").hide();
}

function flyToPostion(lon,lat){
    var cartesian = new Cesium.Cartesian3.fromDegrees(lon,lat);
    var location = viewer.entities.add({
        name:'定位',
        position:cartesian,
        billboard:{
            verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
            image:'../static/img/gis/dingwei.svg',
            width : 30,
            height : 30,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        }
    });
    viewer.camera.flyTo({
        destination :Cesium.Cartesian3.fromDegrees(lon,lat, 120000),
        orientation: {
            heading : Cesium.Math.toRadians(0),
            pitch : Cesium.Math.toRadians(-90.0),
            roll : 0
        },
        duration: 3
    });
}

function hahaha(viewer){
    var scene = viewer.scene;
    var canvas = viewer.canvas;
    canvas.setAttribute('tabindex', '0'); // 需要把焦点放在画布上
    canvas.onclick = function() {
        canvas.focus();
    };
//这个椭球形就是地球了
    var ellipsoid = viewer.scene.globe.ellipsoid;

// 禁止默认的事件
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

//存储鼠标位置的变量
    var startMousePosition;
    var mousePosition;

    var flags = {
        //记录是否在查看地图，也就是记录是否点击了鼠标或键盘
        looking : false,
        //记录键盘的前后上下左右
        moveForward : false,
        moveBackward : false,
        moveUp : false,
        moveDown : false,
        moveLeft : false,
        moveRight : false
    };

//监听用户的输入
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);
//当鼠标左键按下时执行(拿到鼠标按下时的位置)
    handler.setInputAction(function(movement) {
        flags.looking = true;
        mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
//当鼠标移动时执行(拿到鼠标抬起时的位置)
    handler.setInputAction(function(movement) {
        mousePosition = movement.endPosition;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//当鼠标左键抬起时执行
    handler.setInputAction(function(position) {
        flags.looking = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

//判断键盘的输入
    function getFlagForKeyCode(keyCode) {
        switch (keyCode) {
            case 'W'.charCodeAt(0):
                return 'moveUp';
            case 'S'.charCodeAt(0):
                return 'moveDown';
            case 'Q'.charCodeAt(0):
                return 'moveForward';
            case 'E'.charCodeAt(0):
                return 'moveBackward';
            case 'D'.charCodeAt(0):
                return 'moveRight';
            case 'A'.charCodeAt(0):
                return 'moveLeft';
            default:
                return undefined;
        }
    }
//获得键盘keydown事件
    document.addEventListener('keydown', function(e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = true;
        }
    }, false);
//获得键盘keyup事件
    document.addEventListener('keyup', function(e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = false;
        }
    }, false);

//更新相机
    viewer.clock.onTick.addEventListener(function(clock) {
        console.log("dida");
        var camera = viewer.camera;
        //当按下鼠标左键时
        if (flags.looking) {
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            // 鼠标滑动的距离的x或y/网页可见区域的宽或者高
            var x = (mousePosition.x - startMousePosition.x) / width;
            var y = -(mousePosition.y - startMousePosition.y) / height;
            //这就是决定相机移动速度的参数
            var lookFactor = 0.05;
            //相机移动
            camera.lookRight(x * lookFactor);
            camera.lookUp(y * lookFactor);
        }

        // 镜头移动的速度基于镜头离地球的高度
        var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
        var moveRate = cameraHeight / 100.0;

        if (flags.moveForward) {
            camera.moveForward(moveRate);
        }
        if (flags.moveBackward) {
            camera.moveBackward(moveRate);
        }
        if (flags.moveUp) {
            camera.moveUp(moveRate);
        }
        if (flags.moveDown) {
            camera.moveDown(moveRate);
        }
        if (flags.moveLeft) {
            camera.moveLeft(moveRate);
        }
        if (flags.moveRight) {
            camera.moveRight(moveRate);
        }
    });
}

//获取传递的参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}

/* 根据接收到的参数 执行相应的方法 */
function comandFunction() {
    //巡护轨迹播放
    if (GetQueryString("staffId") && GetQueryString("dateStr")) {
        bodyShowloading();
        var staffId = GetQueryString("staffId");
        var dateStr = GetQueryString("dateStr");
        dateStr = dateStr.split(" ")[0];
        $.ajax({
            type: "GET",
            url: "../patrol/record/getStaffPoints?staffId="+staffId+"&dateStr="+dateStr,
            async:false,
            success: function (data) {
                if(data.gpsPoints.length > 0){
                    var gpsPointsToLine = data.gpsPoints;
                    for (var i = gpsPointsToLine.length-1; i >=0; i--) {
                        var cartographic = new Cesium.Cartographic.fromDegrees(Number(gpsPointsToLine[i].lon),Number(gpsPointsToLine[i].lat));
                        routeCoords.push(cartographic);
                    }
                    var promise = Cesium.sampleTerrainMostDetailed(terrainProvider1, routeCoords);
                    Cesium.when(promise, function(updatedPositions) {
                        var coords = ellipsoid.cartographicArrayToCartesianArray(routeCoords);
                        showPatrolLine(coords);
                    });
                }else{
                    alert("没有gps点数据")
                    bodyHideloading();
                }
            }
        });
    }else{
        viewer.camera.flyTo({
            destination :Cesium.Cartesian3.fromDegrees(108.774816,34.182994, 260000), // 设置位置
            orientation: {
                heading : Cesium.Math.toRadians(0), // 方向
                pitch : Cesium.Math.toRadians(-90.0),// 倾斜角度
                roll : 0
            },
            complete:function(){
                if(listLayers){
                    for (var i = 0; i < listLayers.length; i++) {
                        var layerDate = listLayers[i];
                        if ((listParamDetails[layerDate.type] == "POINT" || listParamDetails[layerDate.type] == "LINE" || listParamDetails[layerDate.type] == "PYTHON") && layerDate.urlOut && (layerDate.featureType == "xian:dem" || layerDate.featureType == "xian:slope" || layerDate.featureType == "xian:aspect" || layerDate.featureType == "xian_ziyuandian:fenlei2016" || layerDate.featureType == "xian:s_block" || layerDate.featureType == "xian:district" || layerDate.featureType == "xian_ziyuandian:geologic_hazard")) {
                            var blackMarble = viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                                url:getProjectUrl()+"/static/proxy.jsp?"+layerDate.urlIn+"/",
                                layers: layerDate.featureType,
                                maximumLevel:21
                            }));
                            blackMarble.alpha = 0.01;
                            blackMarble.brightness = 2.0;
                            blackMarble.show = false;
                            blackMarble.contrast = 10.0;
                            blackMarble.hue = 0;
                            blackMarble.minimumTerrainLevel = 21;
                            blackMarble.maximumTerrainLevel = 8;
                        }else if(layerDate.featureType == "xian:line_border" || layerDate.featureType == "xian:point_border" || layerDate.featureType == "xian:xian_city" || layerDate.featureType == "xian:point_city"){
                            $.ajax({
                                type: 'get',
                                url: getProjectUrl()+"/static/proxy.jsp?"+layerDate.urlIn+"?service=WFS&request=GetFeature&version=1.1.1&typename="+layerDate.featureType+"&outputFormat=json",
                                dataType: 'json',
                                async: false,
                                success:function(data){
                                    var features = data.features;
                                    if(features.length > 0){
                                        var type = features[0].geometry.type;
                                        if(type.indexOf("LineString") != -1){
                                            allLength += features.length;
                                            allType[allLength] = [];
                                            allType[allLength].push(layerDate.featureType);
                                            allCartographics[layerDate.featureType] = [];
                                            for(var n in features){
                                                var cartographics = [];
                                                var coords = [];
                                                if(type.indexOf("LineString") != -1){
                                                    coords = data.features[n].geometry.coordinates[0];
                                                }else if(type.indexOf("Polygon") != -1){
                                                    coords = data.features[n].geometry.coordinates[0][0];
                                                }
                                                for(var i in coords){
                                                    var cartographic = new Cesium.Cartographic.fromDegrees(coords[i][0],coords[i][1]);
                                                    cartographics.push(cartographic);
                                                }
                                                allCartographics[layerDate.featureType].push(cartographics);
                                                var promise = Cesium.sampleTerrainMostDetailed(terrainProvider1, cartographics);
                                                Cesium.when(promise, function(updatedPositions) {
                                                    k++;
                                                    // raisedPositions = ellipsoid.cartographicArrayToCartesianArray(cartographics);
                                                    isLoadPositions = true;
                                                    if(k == allLength){
                                                        for(var t=0;t<Object.keys(allType).length;t++){
                                                            var featureType = allType[Object.keys(allType)[t]];
                                                            var style = layerStyle[featureType];
                                                            for(var j in allCartographics[featureType]){
                                                                var positions = ellipsoid.cartographicArrayToCartesianArray(allCartographics[featureType][j]);
                                                                viewer.entities.add({
                                                                    name:featureType,
                                                                    polyline:{
                                                                        positions:positions,
                                                                        width:style.width,
                                                                        material:style.color
                                                                    },
                                                                    show:true
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }else if(type.indexOf("Polygon") != -1){
                                            allLength += features.length;
                                            allType[allLength] = [];
                                            allType[allLength].push(layerDate.featureType);
                                            allCartographics[layerDate.featureType] = [];
                                            for(var n in features){
                                                var cartographics = [];
                                                var coords = [];
                                                if(type.indexOf("LineString") != -1){
                                                    coords = data.features[n].geometry.coordinates[0];
                                                }else if(type.indexOf("Polygon") != -1){
                                                    coords = data.features[n].geometry.coordinates[0][0];
                                                }
                                                for(var i in coords){
                                                    var cartographic = new Cesium.Cartographic.fromDegrees(coords[i][0],coords[i][1]);
                                                    cartographics.push(cartographic);
                                                }
                                                allCartographics[layerDate.featureType].push(cartographics);
                                                var promise = Cesium.sampleTerrainMostDetailed(terrainProvider1, cartographics);
                                                Cesium.when(promise, function(updatedPositions) {
                                                    k++;
                                                    // raisedPositions = ellipsoid.cartographicArrayToCartesianArray(cartographics);
                                                    isLoadPositions = true;
                                                    if(k == allLength){
                                                        for(var t=0;t<Object.keys(allType).length;t++){
                                                            var featureType = allType[Object.keys(allType)[t]];
                                                            var style = layerStyle[featureType];
                                                            for(var j in allCartographics[featureType]){
                                                                var positions = ellipsoid.cartographicArrayToCartesianArray(allCartographics[featureType][j]);
                                                                viewer.entities.add({
                                                                    name:featureType,
                                                                    polyline:{
                                                                        positions:positions,
                                                                        width:style.width,
                                                                        material:style.color
                                                                    },
                                                                    show:true
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }else if(type.indexOf("Point") != -1){
                                            var style = layerStyle[layerDate.featureType];
                                            if(!style){
                                                style = {
                                                    width:1,
                                                    color:Cesium.Color.RED,
                                                    pixelSize:10
                                                };
                                            }
                                            for(var n in features){
                                                var lon = features[n].geometry.coordinates[0];
                                                var lat = features[n].geometry.coordinates[1];
                                                if(features[n].properties["name"]){
                                                    viewer.entities.add({
                                                        name:layerDate.featureType,
                                                        position:new Cesium.Cartesian3.fromDegrees(lon,lat,500),
                                                        label:{
                                                            text:features[n].properties["name"],
                                                            font:style.font,
                                                            fillColor:style.fillColor,
                                                            style : Cesium.LabelStyle.FILL_AND_OUTLINE,
                                                            outlineColor:style.outlineColor,
                                                            outlineWidth:style.outlineWidth,
                                                            verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                                                        },
                                                        show:true
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            },
            duration: 5
        });
    }
}

function showPatrolLine(coords){
    $(".map_tuli").hide();
    $(".mapgraphy").hide();
    $('.cesium-viewer-animationContainer').show();
    $("#stopPatrol").show();
    $(".tools").hide();
    $("#distanceLegendDiv").hide();
    var start = Cesium.JulianDate.fromDate(new Date(2018, 5, 27, 16));
    var stop = Cesium.JulianDate.addSeconds(start, 30000, new Cesium.JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 1;
    viewer.clock.canAnimate = false;

    var __position = computeCirclularFlight(start,coords);

    entityee = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start: start,
            stop: stop
        })]),
        position: __position,
        orientation: new Cesium.VelocityOrientationProperty(__position),
        billboard:{
            verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
            image:'../static/img/patrol/online.png',
            width : 30,
            height : 30,
            eyeOffset:new Cesium.Cartesian3(0,20,0),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        model: {
            uri: '../static/models/GroundVehiclePBR/GroundVehiclePBR.gltf',
            scale:3,
            minimumPixelSize: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        path: {
            resolution: 1,
            // material: new Cesium.PolylineGlowMaterialProperty({
            //     glowPower: 0.1,
            //     color: Cesium.Color.YELLOW
            // }),
            material:Cesium.Color.YELLOW,
            width: 3
        }
    });
    var position = ellipsoid.cartesianToCartographic(coords[0]);
    // viewer.flyTo(entityee,{
    //     duration:8
    // });
    // viewer.trackedEntity = entityee;
    // viewer.animation.viewModel.pauseViewModel.command();
    bodyHideloading();
    viewer.camera.flyTo({
        destination :Cesium.Cartesian3.fromRadians(position.longitude,position.latitude,position.height + 200), // 设置位置
        orientation: {
            heading : Cesium.Math.toRadians(0), // 方向
            pitch : Cesium.Math.toRadians(-45.0),// 倾斜角度
            roll : 0
        },
        complete:function(){
            viewer.trackedEntity = entityee;
            viewer.animation.viewModel.pauseViewModel.command();
            isTracked = true;
        },
        duration: 8
    });
}

function computeCirclularFlight(start,coords){
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < coords.length; i++) {
        if (i == 0) {
            var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
            var _position = coords[i];
            property.addSample(time, _position);
        }else{
            var position_a = getPropertyPosition(property,i);
            var _position = coords[i];
            var positions = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(position_a), Cesium.Ellipsoid.WGS84.cartesianToCartographic(_position)];
            var a = new Cesium.EllipsoidGeodesic(positions[0], positions[1]);
            var long = a.surfaceDistance;
            if(long){
                var _time = long/50;
                var time = getTime(property,i,_time);
                property.addSample(time, _position);
            }
        }
    }
    return property;
}

function getTime(property,i,t){
    if(property._property._times[i - 1]){
        var time = Cesium.JulianDate.addSeconds(property._property._times[i - 1], t, new Cesium.JulianDate());
        return time;
    }else{
        var time = getTime(property,i-1,t);
        return time;
    }
}

function getPropertyPosition(property,i){
    var position = new Cesium.Cartesian3(property._property._values[i * 3 - 3], property._property._values[i * 3 - 2], property._property._values[i * 3 - 1]);
    if(position.x == 0 && position.y == 0 && position.z == 0){
        var pos = getPropertyPosition(property,i-1);
        return pos;
    }else{
        return position;
    }
}

function stopFly() {
    $(".map_tuli").show();
    $(".mapgraphy").show();
    $(".tools").show();
    $("#distanceLegendDiv").show();
    $('.cesium-viewer-animationContainer').hide();
    $("#stopPatrol").hide();
    $("#startFly").show();
    $("#stopFly").hide();
    viewer.animation.viewModel.pauseViewModel .command();
    viewer.trackedEntity = undefined;
    isLoadPositions = false;
    var start = Cesium.JulianDate.fromDate(new Date());
    viewer.clock.startTime = start.clone();
    var stop = Cesium.JulianDate.addSeconds(start, 300000000, new Cesium.JulianDate());
    viewer.clock.stopTime = stop.clone();
    viewer.entities.remove(entityee);
    viewer.camera.flyTo({
        destination :Cesium.Cartesian3.fromDegrees(108.774816,34.182994, 260000),
        orientation: {
            heading : Cesium.Math.toRadians(0), // 方向
            pitch : Cesium.Math.toRadians(-90.0),// 倾斜角度
            roll : 0
        },
        complete:function(){
            isLoadPositions = true;
        },
        duration: 2
    })
}

function getLayerDataByFeatureType(type) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].featureType == type){
            return listLayers[i];
        }
    }
}

function drawLineOk(n){
    var e;
    if(n.polyline){
        e=n.polyline.positions.getValue();
        mars3d.drawing.utils.terrainPolyline({viewer:viewer,positions:e,calback:function(e,i){i,n.polyline.positions.setValue(e)}});
    }else if(n.polygon){
        e=n.polygon.hierarchy.getValue();
        mars3d.drawing.utils.terrainPolyline({viewer:viewer,positions:e,calback:function(e,i){i,n.polygon.hierarchy.setValue(e)}});
    }
}

function drawLineString(){
    drawSurface.startDraw({type:"polyline",style:{color:"#00b6ff",width:3}});
}

function drawPolygn(){
    drawSurface.startDraw({type:"polygon",style:{color:"#00b6ff",outline: !0,outlineColor: "#ffff00",outlineWidth: 4,opacity: .4}});
}

function drawPoint(){
    drawSurface.startDraw({type:"billboard",style:{image:"../static/img/gis/dingwei.svg",heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,width : 30,height : 30}});
}

function readFieldKey(fieldKey){
    var key = "";
    for (var i = 0; i < fieldKey.length; i++) {
        var c = fieldKey.charAt(i);
        if (/^[A-Z]+$/.test(c)) {
            key += "_" + c.toLowerCase();
        } else {
            key += c;
        }
    }
    return key;
}