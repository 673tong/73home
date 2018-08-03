/**
 * 图层树菜单函数js
 */
$(function () {
    initTreeMenu();
    initTuli();
})

function initTuli(){
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var nodes = treeObj.getCheckedNodes(true);
    for(var i in nodes){
        if(!nodes[i].children){
            layerIds.push(nodes[i].id);
        }
    }
    showTuli(layerIds);
}

function slideClick(obj){
    if($(obj).hasClass('fa-angle-double-up')){
        $(obj).removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        $(obj).parents().siblings('.tree_body').show();

    }else{
        $(obj).addClass('fa-angle-double-up').removeClass('fa-angle-double-down');
        $(obj).parents().siblings('.tree_body').hide();
    }
}

/**zTree树节点的id的集合的选择*/
function getAllChildrenNodes(treeNode,result){
    if (treeNode.isParent) {
        var childrenNodes = treeNode.children;
        if (childrenNodes) {
            for (var i = 0; i < childrenNodes.length; i++) {
                result +=  childrenNodes[i].id+',';
                result = getAllChildrenNodes(childrenNodes[i], result);
            }
        }
    }
    return result;
}

//获取父节点下的第二级子节点的集合
function getSecondeNode(treeNode){
    if(treeNode.isParent){
        var childrenNodes = treeNode.children;
        return childrenNodes;
    }else{
        return null;
    }
}

function addDiyDom(treeId, treeNode) {
    var id = treeNode.id;
    var name = treeNode.name;
    var checked = treeNode.checked;//是否点选
    var type = treeNode.type;//类型
    var tId = treeNode.tId;//树节点 的唯一标识 的id
    var aObj = $("#" + treeNode.tId + "_a");
    if ($("#diyBtn_"+treeNode.id).length>0) return;
    if(type=='LAYER'){
        var btnStr = "<button class=\"img but\" title=\"移动图层至最上面\" layerId=\""+id+"\" layerName=\""+name+"\" tId=\""+tId+"\"></button>";
        aObj.append(btnStr);
    }
}

//查找名称查找父节点的图层组
function findParentNodeByName(name){
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var allNodes = treeObj.getNodes();
    for(var i=0;i<allNodes.length;i++){
        var node = allNodes[i];
        if(node.name==name){
            return node;
        }
    }
    return null;
}

//将如  c04ccce1-fdf7-484d-bddf-a48eb882d5eb,c04ccce1-fdf7-484d-bddf-a48eb882d5eb, 转换成数组的形式
function getSpeids(childIds){
    var ss = childIds.split(",");
    var result = new Array();
    for(var i=0;i<ss.length-1;i++){
        result.push(ss[i]);
    }
    return result;
}

function treeCheckHandler(event,treeId,treeNode){
    $("#trackPopUp").css("display","none");
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var id = treeNode.id;
    var name = treeNode.name;
    var checked = treeNode.checked;//是否点选
    var type = treeNode.type;//类型
    //选择图层的图例展示start
    if(checked){
        if(treeNode.children){
            var children = treeNode.children;
            for(var i = 0; i < children.length; i++){
                layerIds.push(children[i].id);
            }
        }else{
            layerIds.push(treeNode.id);
        }
    }else{
        var ids = [];
        if(treeNode.children){
            var children = treeNode.children;
            for(var i = 0; i < children.length;i++){
                ids.push(children[i].id);
            }
        }else{
            ids.push(treeNode.id);
        }
        if(layerIds){
            for(var i in ids){
                if(layerIds.indexOf(ids[i]) != -1){
                    layerIds.splice(layerIds.indexOf(ids[i]), 1);
                }
            }
        }
    }
    showTuli(layerIds);
    if(type=='GROUP'){
        var secondNodes = getSecondeNode(treeNode);
        for(var i=0;i<secondNodes.length;i++){
            checkLayer(secondNodes[i].id,checked);
        }
    }else if (type == 'LAYER'){
        checkLayer(treeNode.id,checked);
    }
}

function checkLayer(layerId,checked){
    var t = getFeatureTypeByLayerId(layerId);
    if(t == "xian:dem" || t == "xian:slope" || t == "xian:aspect" || t == "xian_ziyuandian:fenlei2016" || t == "xian:s_block" || t == "xian:district" || t == "xian_ziyuandian:geologic_hazard"){
        var l = getImageryLayerByFeatureType(viewer.imageryLayers._layers,t);
        if(checked){
            l.show = true;
        }else{
            l.show = false;
        }
    }else if(t.indexOf("border") == -1){
        var e = getEntitiesByName(viewer.entities._entities._array,t);
        if(e.length > 0){
            if(checked){
                for(var n in e){
                    e[n].show = true;
                }
            }else{
                for(var n in e){
                    e[n].show = false;
                }
            }
        }else{
            if(checked){
                var layerData = getLayerDataByLayerId(layerId);
                var url = getProjectUrl()+"/static/proxy.jsp?"+layerData.urlIn+"?service=WFS&request=GetFeature&version=1.1.1&typename="+layerData.featureType+"&outputFormat=json";
                if(layerData.featureType == "xian:elevation"){
                    return;
                }
                $.ajax({
                    type: 'get',
                    url:url,
                    dataType: 'json',
                    async: false,
                    success:function(data){
                        var features = data.features;
                        if(features.length > 0){
                            var type = features[0].geometry.type;
                            if(type.indexOf("LineString") != -1){
                                allLength += features.length;
                                allType[allLength] = [];
                                allType[allLength].push(layerData.featureType);
                                allCartographics[layerData.featureType] = [];
                                for(var n in features){
                                    var coords = features[n].geometry.coordinates[0];
                                    var cartographics = [];
                                    var code = "";
                                    for(var i in coords){
                                        var cartographic = new Cesium.Cartographic.fromDegrees(coords[i][0],coords[i][1]);
                                        cartographics.push(cartographic);
                                    }
                                    if(features[n].properties["grid_code"]){
                                        code = features[n].properties["grid_code"];
                                    }
                                    allCartographics[layerData.featureType].push([cartographics,code]);
                                    var coordsPromise = Cesium.sampleTerrainMostDetailed(terrainProvider1, cartographics);
                                    Cesium.when(coordsPromise, function(updatedPositions) {
                                        k++;
                                        if(k == allLength){
                                            var featureType = allType[allLength];
                                            for(var j in allCartographics[featureType]){
                                                var code = allCartographics[featureType][j][1];
                                                var style = layerStyle[featureType + code];
                                                if(!style){
                                                    style = {
                                                        width:1,
                                                        color:Cesium.Color.RED
                                                    };
                                                }
                                                var positions = ellipsoid.cartographicArrayToCartesianArray(allCartographics[featureType][j][0]);
                                                viewer.entities.add({
                                                    name:featureType,
                                                    polyline:{
                                                        positions:positions,
                                                        width:style.width,
                                                        material:style.color,
                                                        // depthFailMaterial:style.color
                                                        // distanceDisplayCondition:new Cesium.DistanceDisplayCondition(10.0,100000.0)
                                                    },
                                                    show:true
                                                });
                                            }
                                        }
                                    });
                                }
                            }else if(type.indexOf("Polygon") != -1){
                                allLength += features.length;
                                allType[allLength] = [];
                                allType[allLength].push(layerData.featureType);
                                allCartographics[layerData.featureType] = [];
                                for(var n in features){
                                    var coords = features[n].geometry.coordinates[0][0];
                                    var cartographics = [];
                                    var code = "";
                                    for(var i in coords){
                                        var cartographic = new Cesium.Cartographic.fromDegrees(coords[i][0],coords[i][1]);
                                        cartographics.push(cartographic);
                                    }
                                    if(features[n].properties["grid_code"]){
                                        code = features[n].properties["grid_code"];
                                    }
                                    allCartographics[layerData.featureType].push([cartographics,code]);
                                    var coordsPromise = Cesium.sampleTerrainMostDetailed(terrainProvider1, cartographics);
                                    Cesium.when(coordsPromise, function(updatedPositions) {
                                        k++;
                                        if(k == allLength){
                                            var featureType = allType[allLength];
                                            for(var j in allCartographics[featureType]){
                                                var code = allCartographics[featureType][j][1];
                                                var style = layerStyle[featureType + code];
                                                if(!style){
                                                    style = {
                                                        width:1,
                                                        color:Cesium.Color.RED
                                                    };
                                                }
                                                var positions = ellipsoid.cartographicArrayToCartesianArray(allCartographics[featureType][j][0]);
                                                viewer.entities.add({
                                                    name:featureType,
                                                    polyline:{
                                                        positions:positions,
                                                        width:style.width,
                                                        material:style.color,
                                                        // depthFailMaterial:style.color
                                                        // distanceDisplayCondition:new Cesium.DistanceDisplayCondition(10.0,100000.0)
                                                    },
                                                    show:true
                                                });
                                            }
                                        }
                                    });
                                }
                            }else if(type.indexOf("Point") != -1){
                                var style = layerStyle[layerData.featureType];
                                if(!style){
                                    style = {
                                        width:1,
                                        color:Cesium.Color.RED,
                                        img:""
                                    };
                                }
                                for(var n in features){
                                    if(features[n].geometry){
                                        var lon = features[n].geometry.coordinates[0];
                                        var lat = features[n].geometry.coordinates[1];
                                        if(layerData.featureType.indexOf("meteorological_resources") != -1){
                                            if(features[n].properties["type"].indexOf("光伏") != -1){
                                                style = layerStyle[layerData.featureType + "2"]
                                            }else{
                                                style = layerStyle[layerData.featureType + "1"]
                                            }
                                        }else if(layerData.featureType.indexOf("religion") != -1){
                                            if(features[n].properties["type"].indexOf("清真") != -1){
                                                style = layerStyle[layerData.featureType + "1"]
                                            }else{
                                                style = layerStyle[layerData.featureType + "2"]
                                            }
                                        }
                                        if(features[n].properties["name"] && !style.img){
                                            viewer.entities.add({
                                                name:layerData.featureType,
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
                                                properties:features[n].properties,
                                                show:true
                                            });
                                        }else if(style.img){
                                            viewer.entities.add({
                                                name:layerData.featureType,
                                                position:new Cesium.Cartesian3.fromDegrees(lon,lat),
                                                billboard:{
                                                    verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
                                                    image:style.img,
                                                    width : 20,
                                                    height : 20,
                                                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                                                },
                                                properties:features[n].properties,
                                                show:true
                                            });
                                        }else{
                                            viewer.entities.add({
                                                name:layerData.featureType,
                                                position:new Cesium.Cartesian3.fromDegrees(lon,lat),
                                                point:{
                                                    pixelSize :10,
                                                    color : Cesium.Color.RED,
                                                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                                                },
                                                properties:features[n].properties,
                                                show:true
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };
        findSetPoint(layerId,checked);
    }
}

function getLayerDataByFeatureType(type){
    if(type){
        for (var i = 0; i < listLayers.length; i++) {
            var l = listLayers[i];
            if(l.featureType == type){
                return l;
            }
        }
    }
}

function getFeatureTypeByLayerId(layerId){
    if(layerId){
        for (var i = 0; i < listLayers.length; i++) {
            var l = listLayers[i];
            if(l.id == layerId){
                return l.featureType;
            }
        }
    }
}

function getLayerDataByLayerId(layerId){
    if(layerId){
        for (var i = 0; i < listLayers.length; i++) {
            var l = listLayers[i];
            if(l.id == layerId){
                return l;
            }
        }
    }
}

function getImageryLayerByFeatureType(layers,type){
    if (layers && type) {
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if(l.imageryProvider._layers == type){
                return l;
            }
        }
    }
    return null;
}

function getEntitiesByName(entities,name){
    checkEntities = [];
    if (entities && name) {
        for (var i = 0; i < entities.length; i++) {
            var l = entities[i];
            if(l.name == name){
                checkEntities.push(l);
            }
        }
    }
    return checkEntities;
}

function getLayerIdByFeatureType(type) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].featureType == type){
            return listLayers[i].id;
        }
    }
}

function findSetPoint(layerId,b){
    var t = getFeatureTypeByLayerId(layerId);
    if(t.indexOf("point_") != -1){
        return;
    }
    var a = t.split("_");
    if(a.length > 1){
        var s = a.pop();
        var id = getLayerIdByFeatureType("xian:point_"+s);
        if(id){
            checkLayer(id,b);
        }
    }else if(a.length = 1){
        var c = a[0].split(":");
        if(c.length > 1){
            var s = c.pop();
            var id = getLayerIdByFeatureType("xian:point_"+s);
            if(id){
                checkLayer(id,b);
            }
        }
    }
}

function treeClickHandler(event,treeId,treeNode){
    if(event.target.tagName==="BUTTON")return;
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var check=treeNode.checked;
    treeNode.checked=check?false:true;
    treeObj.updateNode(treeNode,true);
    treeCheckHandler(event,treeId,treeNode);
}

function previousLayer(){
    $("#trackPopUp").css("display","none");
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var treeNodes = treeObj.getCheckedNodes(true);
    layerIds = [];
    if(treeNodes.length == 2){
        var preNode = treeNodes[1].getPreNode();
        if(preNode){
            treeObj.checkNode(treeNodes[1], false, false);
            treeObj.checkNode(preNode, true, true);
            layerIds.push(preNode.id);
            checkLayer(treeNodes[1].id,false);
            findSetPoint(treeNodes[1].id,false);
            checkLayer(preNode.id,true);
            findSetPoint(preNode.id,true);
        }else{
            var preParentNode = treeNodes[0].getPreNode();
            if(preParentNode){
                var isTrue = preSetLayerVisible(preParentNode);
                if(isTrue){
                    treeObj.checkNode(treeNodes[0], false, false);
                    treeObj.checkNode(treeNodes[1], false, false);
                    checkLayer(treeNodes[1].id,false);
                    findSetPoint(treeNodes[1].id,false);
                }
            }
        }
    }else if(treeNodes.length == 0){
        var nodes = treeObj.getNodes();
        if (nodes.length>0 && nodes[0].isParent) {
            if(nodes[0].children){
                var firstNode = nodes[0].children[0];
                treeObj.checkNode(firstNode, true, true);
                layerIds.push(firstNode.id);
                checkLayer(firstNode.id,true);
                findSetPoint(firstNode.id,true);
            }else{
                setNextFirstNodeVisible(nodes[0]);
            }
        }
    }else{
        for(var i=0;i<treeNodes.length;i++){
            treeObj.checkNode(treeNodes[i], false, false);
            if(!treeNodes[i].isParent){
                checkLayer(treeNodes[i].id,false);
                findSetPoint(treeNodes[i].id,false);
            }
        }
        var preNode = treeNodes[treeNodes.length - 1].getPreNode();
        if(preNode){
            treeObj.checkNode(preNode, true, true);
            layerIds.push(preNode.id);
            checkLayer(preNode.id,true);
            findSetPoint(preNode.id,true);
        }else{
            var parentNode = treeNodes[treeNodes.length - 1].getParentNode();
            var preParentNode = parentNode.getPreNode();
            if(preParentNode){
                var isTrue = preSetLayerVisible(preParentNode);
                if(!isTrue){
                    treeObj.checkNode(treeNodes[treeNodes.length - 1], true, true);
                    checkLayer(treeNodes[treeNodes.length - 1].id,true);
                    findSetPoint(treeNodes[treeNodes.length - 1].id,true);
                }
            }
        }
    }
    showTuli(layerIds);
}

function nextLayer(){
    $("#trackPopUp").css("display","none");
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var treeNodes = treeObj.getCheckedNodes(true);
    layerIds = [];
    if(treeNodes.length == 2){
        var nextNode = treeNodes[1].getNextNode();
        if(nextNode){
            treeObj.checkNode(treeNodes[1], false, false);
            treeObj.checkNode(nextNode, true, true);
            layerIds.push(nextNode.id);
            checkLayer(nextNode.id,true);
            findSetPoint(nextNode.id,true);
            checkLayer(treeNodes[1].id,false);
            findSetPoint(treeNodes[1].id,false);
        }else{
            var nextParentNode = treeNodes[0].getNextNode();
            if(nextParentNode){
                var isTrue = nextSetLayerVisible(nextParentNode);
                if(isTrue){
                    treeObj.checkNode(treeNodes[0], false, false);
                    treeObj.checkNode(treeNodes[1], false, false);
                    checkLayer(treeNodes[1].id,false);
                    findSetPoint(treeNodes[1].id,false);
                }
            }
        }
    }else if(treeNodes.length == 0){
        var nodes = treeObj.getNodes();
        if (nodes.length>0 && nodes[0].isParent) {
            if(nodes[0].children){
                var firstNode = nodes[0].children[0];
                treeObj.checkNode(firstNode, true, true);
                layerIds.push(firstNode.id);
                checkLayer(firstNode.id,true);
                findSetPoint(firstNode.id,true);
            }else{
                setNextFirstNodeVisible(nodes[0]);
            }
        }
    }else{
        for(var i=0;i<treeNodes.length;i++){
            treeObj.checkNode(treeNodes[i], false, false);
            if(!treeNodes[i].isParent){
                checkLayer(treeNodes[i].id,false);
                findSetPoint(treeNodes[i].id,false);
            }
        }
        var nextNode = treeNodes[treeNodes.length - 1].getNextNode();
        if(nextNode){
            treeObj.checkNode(nextNode, true, true);
            layerIds.push(nextNode.id);
            checkLayer(nextNode.id,true);
            findSetPoint(nextNode.id,true);
        }else{
            var parentNode = treeNodes[treeNodes.length - 1].getParentNode();
            var nextParentNode = parentNode.getNextNode();
            if(nextParentNode){
                var isTrue = nextSetLayerVisible(nextParentNode);
                if(!isTrue){
                    treeObj.checkNode(treeNodes[treeNodes.length - 1], true, true);
                    checkLayer(treeNodes[treeNodes.length - 1].id,true);
                    findSetPoint(treeNodes[treeNodes.length - 1].id,true);
                }
            }else{
                treeObj.checkNode(treeNodes[treeNodes.length - 1], true, true);
                checkLayer(treeNodes[treeNodes.length - 1].id,true);
                findSetPoint(treeNodes[treeNodes.length - 1].id,true);
            }
        }
    }
    showTuli(layerIds);
}

function setNextFirstNodeVisible(treeNode){
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var nextNode = treeNode.getNextNode();
    if(nextNode.children){
        var firstNode = nextNode.children[0];
        treeObj.checkNode(firstNode, true, true);
        layerIds.push(firstNode.id);
        checkLayer(firstNode.id,true);
        findSetPoint(firstNode.id,true);
    }else{
        if(nextNode.getNextNode()){
            setNextFirstNodeVisible(nextNode.getNextNode());
        }
    }
}

function preSetLayerVisible(treeNode){
    var isTrue = false;
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    if(treeNode.children){
        treeObj.checkNode(treeNode.children[treeNode.children.length - 1], true, true);
        layerIds.push(treeNode.children[treeNode.children.length - 1].id);
        checkLayer(treeNode.children[treeNode.children.length - 1].id,true);
        findSetPoint(treeNode.children[treeNode.children.length - 1].id,true);
        isTrue = true;
    }else{
        if(treeNode.getPreNode()){
            isTrue = preSetLayerVisible(treeNode.getPreNode());
        }
    }
    return isTrue;
}

function nextSetLayerVisible(treeNode){
    var isTrue = false;
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    if(treeNode.children){
        treeObj.checkNode(treeNode.children[0], true, true);
        layerIds.push(treeNode.children[0].id);
        checkLayer(treeNode.children[0].id,true);
        findSetPoint(treeNode.children[0].id,true);
        isTrue = true;
    }else{
        if(treeNode.getNextNode()){
            isTrue = nextSetLayerVisible(treeNode.getNextNode());
        }
    }
    return isTrue;
}

function showTuli(ids){
    $.ajax({
        type: "get",
        url: "../map/layerLegend/findIcon",
        data:"layerIds="+ids,
        success: function(result){
            $(".map_tulinew").empty();
            if(result.success){
                var flag = false;
                var amount=0;
                var columns=1;
                var num=1;
                var k=0;
                var prefPath = getProjectUrl()+"/static/proxy.jsp?"+ftpUrl;//添加porxy,这样截图就不会报跨域的问题
                for(var i=0;i<result.data.length;i++){
                    var mapChil = result.data[i];
                    if(mapChil.children.length){
                        flag = true;
                        amount += mapChil.children.length;
                        columns = parseInt(amount/10);
                        if(amount%10 != 0){
                            columns++;
                        }
                        if(!$("#maptuli_ul"+columns)[0]){
                            var abc = num+1;
                            if(i==0){
                                abc = 1;
                            }
                            var ul='';
                            for(var m=abc;m<=columns;m++){
                                ul += "<ul id='maptuli_ul"+m+"' class='maptuli_ul'></ul>";
                            }
                            $(".map_tulinew").append(ul);
                        }
                        for(var j=0;j<mapChil.children.length;j++){
                            k++;
                            if(k%10 == 1 && k!=1){
                                num++;
                            }
                            var mapHtml='';
                            if(mapChil.children[j].styleJson){
                                if(listParamDetails[mapChil.children[j].type] == "LINE"){
                                    mapHtml += '<li  id="' + mapChil.children[j].id + '"  title="'+mapChil.children[j].name+'"><span class="tuli_svg" style="background:#'+JSON.parse(mapChil.children[j].styleJson).strokeColor+";opacity:"+JSON.parse(mapChil.children[j].styleJson).strokeOpacity+'"></span><span>'+ mapChil.children[j].name+'</span></li>';
                                }else{
                                    mapHtml += '<li  id="' + mapChil.children[j].id + '"  title="'+mapChil.children[j].name+'"><span class="tuli_svg" style="background:#'+JSON.parse(mapChil.children[j].styleJson).fillColor+";opacity:"+JSON.parse(mapChil.children[j].styleJson).fillOpacity+'"></span><span>'+ mapChil.children[j].name+'</span></li>';
                                }
                            }else{
                                mapHtml += '<li  id="' + mapChil.children[j].id + '"  title="'+mapChil.children[j].name+'"><img src="'+prefPath +  mapChil.children[j].icon + '"><span>'+ mapChil.children[j].name+'</span></li>';
                            }
                            $("#maptuli_ul"+num).append(mapHtml);
                        }
                    }
                }
                if(flag){
                    $(".map_tulinew").show();
                }else{
                    $(".map_tulinew").hide();
                }
            }
        }
    });
}

//<！--------------------------echarts统计------------------------------------------------------->
function mapChart(layerIds){
    var treeObj = $.fn.zTree.getZTreeObj("mapTreeMenu");
    var treeNodes = treeObj.getCheckedNodes(true);
    $("#map_tulinew").hide();
    //点击事件展示效果
    if(treeNodes.length==0||treeNodes.length!=2){
        $("#map_tulinew").show();
        $("#echartDisplay").hide();
        return;
    }
    $("#mapChartSelect").find("select").empty();
    if(treeNodes[0] == treeNodes[1].getParentNode()){
        var layerId = treeNodes[1].id;
        // featureType 代表的是数据库表名
        var featureType = getfromTableByLayerId(layerId);
        var obj=mapColumn();
        var dataFromType=obj[featureType]?obj[featureType]:'';
        var sqlDesc = getSQLDescByLayerId(layerId);
        var layer = getLayerById(map.getLayers().getArray(),layerId);
        window.layerTitle = layer.get("title");
        if(layerId){
            $.ajax({
                type: "POST",
                url: "../map/layerField/getMapLayerField/"+layerId,
                async: false,
                success: function (data) {
                    if(data.status==1){
                        var attrList = data.data;
                        var chartItem = '<optgroup label="统计类型"></optgroup>';
                        var yItem = '<select id="yItem" class="select_container marginRigth_12"><optgroup label="统计值"></optgroup><option value="" key="00">记录数</option>';
                        var valItem = '<select id="valItem" class="select_container marginRigth_12"><option value="">统计条件</option>';
                        var numX=[];
                        var numY=[];
                        var numVal=[];
                        var flag=true;
                        for (var i = 0; i < attrList.length; i++) {
                            var stat=attrList[i].statistics;
                            switch (stat){
                                case "field":
                                    chartItem += "<option value="+attrList[i].fieldKey+" key="+attrList[i].statisticsUnit+">"+attrList[i].fieldValue+"</option>";
                                    numX.push(attrList[i]);
                                    break;
                                case "sum":
                                    yItem +=flag?"<option value="+attrList[i].fieldKey+" key="+attrList[i].statisticsUnit+" selected>"+attrList[i].fieldValue+"</option>":"<option value="+attrList[i].fieldKey+" key="+attrList[i].statisticsUnit+">"+attrList[i].fieldValue+"</option>";
                                    flag=false;
                                    numY.push(attrList[i]);
                                    break;
                                case "where":
                                    valItem += "<option value="+attrList[i].fieldKey+">"+attrList[i].fieldValue+"</option>";
                                    numVal.push(attrList[i]);
                                    break;
                            }
                        }
                        yItem += "</select>";
                        valItem += "</select>";
                        var field=numX.length>0?numX[0]["fieldKey"]:'';
                        if(field && featureType){
                            if(data.status == 1){
                                //点击下拉框清空
                                $("#mapChartItem").empty();
                                $("#yItem")?$("#yItem").empty().remove():'';
                                $("#valItem")?$("#valItem").empty().remove():'';
                                $("#valueItem")?$("#valueItem").empty().remove():'';
                                if(numX.length>0)$("#mapChartItem").append(chartItem);
                                $("#mapChartItem").val(field);
                                if(numY.length>0)$("#mapChartSelect").append(yItem);
                                if(numVal.length>0)$("#mapChartSelect").append(valItem);
                                var isShow=($("#echartDisplay").find("span[id='echartTitles']").siblings())[0];
                                if($(isShow).hasClass('fa-angle-double-up'))echartClick(isShow);
                                $("#echartDisplay").show();
                                var mapChartElement = document.getElementById('mapChart');
                                if(mapChartElement){
                                    var mapChartOption = {
                                        title : {
                                            x: 'center',
                                            subtext: '',
                                            y:'3px',
                                            textStyle:{
                                                "fontSize": 18,
                                                "color": "#333333",
                                                "fontFamily": "微软雅黑",
                                                "fontWeight": "normal"
                                            }
                                        },
                                        tooltip : {
                                            trigger: 'axis',
                                            axisPointer: {
                                                type: 'cross'
                                            },
                                            formatter: "{b}: {c}"
                                        },
                                        legend: {
                                            data:['类别'],
                                            x : 'right'
                                        },
                                        toolbox: {
                                            show : true,
                                            x: '20px',
                                            y:'30px',
                                            feature : {
                                                magicType: {
                                                    show: true,
                                                    type: ['line', 'bar']
                                                },

                                                restore : {show: true},
                                                saveAsImage : {show: true}
                                            }
                                        },
                                        grid: {
                                            left: '25px',
                                            top: '95px',
                                            bottom:'15px',
                                            containLabel: true
                                        },
                                        calculable : true,
                                        xAxis : [{
                                            type : 'category',
                                            data : [],
                                            axisTick: {
                                                alignWithLabel: true
                                            }
                                        }],
                                        yAxis : [{
                                            type : 'value',
                                            name: '单位 ：个'
                                        }],
                                        series : [{
                                            name:'数量',
                                            type:'bar',
                                            itemStyle: {normal: {color:'#20d56b'}},
                                            data:[]
                                        }]
                                    };
                                    var mapChart = echarts.init(mapChartElement, 'shine');
                                    $(document).off("change","#mapChartItem").on("change","#mapChartItem",function(){
                                        buildEchart(mapChart,mapChartOption,$(this).val(),$("#yItem")?$("#yItem").val():'',$("#valItem")?$("#valItem").val():'',$("#valueItem")?$("#valueItem").val():'',featureType,sqlDesc,$("#yItem").find("option:selected").attr("key"),$("#mapChartItem").find("option:selected").attr("key"),dataFromType);
                                    });
                                    $(document).off("change","#yItem").on("change","#yItem",function(){
                                        buildEchart(mapChart,mapChartOption,$("#mapChartItem")?$("#mapChartItem").val():'',$(this)?$(this).val():'',$("#valItem")?$("#valItem").val():'',$("#valueItem")?$("#valueItem").val():'',featureType,sqlDesc,$(this).find("option:selected").attr("key"),$("#mapChartItem").find("option:selected").attr("key"),dataFromType);
                                    });
                                    $(document).off("change","#valItem").on("change","#valItem",function(){
                                        var valueItem="";
                                        $("#valueItem")?$("#valueItem").empty().remove():'';
                                        var selectVal=$(this).val();
                                        if(selectVal){
                                            $.ajax({
                                                type: "POST",
                                                url: "../map/layerFeature/findValByKey?key="+selectVal+"&featureType="+featureType+"&dataFromType="+dataFromType,
                                                async: false,
                                                cache:false,
                                                success: function (msg) {
                                                    var info = msg.data;
                                                    valueItem += '<select id="valueItem" class="select_container">';
                                                    info.sort(compare(selectVal));
                                                    window.infos=info;
                                                    for(var k=0;k<info.length;k++){
                                                        if(!info[k][selectVal])continue;
                                                        valueItem += "<option value="+info[k][selectVal]+">"+info[k][selectVal]+"</option>";
                                                    }
                                                    if(window.infos.length>0)$("#mapChartSelect").append(valueItem);
                                                }
                                            });
                                        }
                                        buildEchart(mapChart,mapChartOption,$("#mapChartItem")?$("#mapChartItem").val():'',$("#yItem")?$("#yItem").val():'',$(this)?$(this).val():'',window.infos.length>0?window.infos[0][selectVal]:'',featureType,sqlDesc,$("#yItem").find("option:selected").attr("key"),$("#mapChartItem").find("option:selected").attr("key"),dataFromType);
                                    });
                                    $(document).off("change","#valueItem").on("change","#valueItem",function(){
                                        buildEchart(mapChart,mapChartOption,$("#mapChartItem")?$("#mapChartItem").val():'',$("#yItem")?$("#yItem").val():'',$("#valItem")?$("#valItem").val():'',$(this)?$(this).val():'',featureType,sqlDesc,$("#yItem").find("option:selected").attr("key"),$("#mapChartItem").find("option:selected").attr("key"),dataFromType);
                                    });
                                    buildEchart(mapChart,mapChartOption,field,$("#yItem")?$("#yItem").val():'','','',featureType,sqlDesc,$("#yItem").find("option:selected").attr("key"),$("#mapChartItem").find("option:selected").attr("key"),dataFromType);
                                }
                            }
                        }else{
                            //前后视图事件展示效果
                            layerIds?showTuli(layerIds):$("#map_tulinew").show();
                            $("#mapChartSelect").find("select").empty();
                            $("#echartDisplay").hide();
                        }
                    }
                }
            });
        }
    }
}

/*
*@param echart echarts实例
*@param option echarts配置项
* @param field 横向查询列
* @param yField 竖向查询列
* @param valField 筛选条件
* @param val 筛选值
* @param feature 数据库对应表
* @param sqlDesc 过滤条件（类似deleteFlag、type类型等过滤）
* @param sumValue 竖向查询列的显示单位(统计sum(*)使用)
* @param fieldValue 横向查询列的显示单位(统计count(*)使用)
* @param dataFromType 数据源的类型(postgre和mysql)
 */
function buildEchart(echart,option,field,yField,valField,val,feature,sqlDesc,sumValue,fieldValue,dataFromType){
    echart.clear();
    if(yField&&yField=="记录数")yField='';
    var sql=ctx+'/map/layerFeature/findByMapChart';
    data={"filed":field,"yField":yField,"valField":valField,"val":val,"featureType":feature,"sqlDesc":sqlDesc,"dataFromType":dataFromType};
    var request = $.ajax({
        url: sql,
        type: "post",
        data: data,
        dataType:"json",
        cache: false,
        asyn:false
    }).done(function(response) {
        echart.hideLoading();
        if(response.status==1){
            option=getUnit(option,sumValue,fieldValue);
            option.xAxis[0].data = [];
            option.series[0].data = [];
            var titles=!val?window.layerTitle+"统计":val+window.layerTitle+"统计";
            $("#echartTitles").text(titles);
            var info = response.data;
            var fieldSort=dataFromType?(yField?"sum("+yField+")":"count(*)"):(yField?"sum":"count");
            //排序
            info.sort(compare(fieldSort));
            var xdata = [];
            var ydata = [];
            var filedKey = toLowerCase(field);
            for(var i=0;i<info.length;i++){
                xdata.push(info[i][filedKey]?info[i][filedKey]:"其他");
                ydata.push(!yField?info[i]["count"]||info[i]["count(*)"]:info[i]["sum"]||info[i]["sum("+yField+")"]);
            }
            option.xAxis[0].data = xdata;
            option.series[0].data = ydata;
        }
        echart.setOption(option,true);
    });
}

/**
 *
 *
 * @param option echart配置项
 * @param sumValue 竖向查询列的显示单位
 * @param fieldValue 横向向查询列的显示单位
 * @returns option 返回配置好显示单位的option配置项
 */
function getUnit(option,sumValue,fieldValue){
    var yKeyName="单位 ：条";
    var yValueName="记录数";
    if(sumValue&&sumValue!="00"){
        if(sumValue.indexOf("(")>-1){
            var value_name=sumValue.split("(")[0];
            var va=sumValue.split("(")[1];
            var key_name=va.substring(0,va.length-1);
            yKeyName=key_name?"单位 ："+key_name:"单位 ：m*m";
            yValueName=value_name?value_name:"面积";
        }
    }else{
        if(fieldValue.indexOf("(")>-1){
            var value_name=fieldValue.split("(")[0];
            var va=fieldValue.split("(")[1];
            var key_name=va.substring(0,va.length-1);
            if(key_name)yKeyName="单位 ："+key_name;
            if(value_name)yValueName=value_name;
        }
    }
    option.yAxis[0].name= yKeyName;
    option.tooltip.formatter=yValueName+":"+" {c}";
    return option;
}

function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
    }
}

/**
 * 映射mysql数据库名(按需添加)
 */
function mapColumn(){
    var num=[];
    var obj=new Object();
    //指定相关的表类型为mysql
    var type="mysql";
    obj.resource_forest=type;
    return obj;
}

//下拉菜单点击收缩
function echartClick(obj){
    if($(obj).hasClass('fa-angle-double-up')){
        $(obj).removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        $(obj).parent().siblings().show();

    }else{
        $(obj).addClass('fa-angle-double-up').removeClass('fa-angle-double-down');
        $(obj).parent().siblings().hide();
    }
}

/**
 * 根据图层Id得到数据库表名
 */
function getfromTableByLayerId(layerId) {
    for (var i = 0; i < listLayers.length; i++) {
        if (listLayers[i].id == layerId){
            return listLayers[i].fromTable;
        }
    }
}
