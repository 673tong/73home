var layerStyle = {
    "xian:xian_city" : {
        width:3,
        color:new Cesium.PolylineDashMaterialProperty({
                color:Cesium.Color.WHITE,
                gapColor:Cesium.Color.WHITE.withAlpha(0)
            })
            // new Cesium.PolylineGlowMaterialProperty({
            //     color:Cesium.Color.BLUE,
            //     glowPower:0.2
            // })
            // new Cesium.PolylineOutlineMaterialProperty({
            //     color: Cesium.Color.BLACK,
            //     outlineColor: Cesium.Color.RED,
            //     outlineWidth:3
            // })
            // new Cesium.StripeMaterialProperty({
            //     evenColor:Cesium.Color.BLACK,
            //     oddColor:Cesium.Color.RED,
            //     repeat:5
            // })
    },
    "xian:point_city" : {
        font:"15pt monospace",
        fillColor:Cesium.Color.RED,
        outlineColor:Cesium.Color.RED,
        outlineWidth:1
    },
    "xian:xian_county" : {
        width:1,
        color:new Cesium.PolylineDashMaterialProperty({
            color:Cesium.Color.WHITE,
            gapColor:Cesium.Color.WHITE.withAlpha(0)
        })
    },
    "xian:point_county" : {
        font:"15pt monospace",
        fillColor:Cesium.Color.BLUE,
        outlineColor:Cesium.Color.BLUE,
        outlineWidth:1
    },
    "xian:xian_town" : {
        width:1,
        color:new Cesium.PolylineDashMaterialProperty({
            color:Cesium.Color.WHITE,
            gapColor:Cesium.Color.WHITE.withAlpha(0)
        })
    },
    "xian:point_town" : {
        font:"15pt monospace",
        fillColor:Cesium.Color.MEDIUMVIOLETRED,
        outlineColor:Cesium.Color.MEDIUMVIOLETRED,
        outlineWidth:1
    },
    "xian:xian_village" : {
        width:1,
        color:new Cesium.PolylineDashMaterialProperty({
            color:Cesium.Color.WHITE,
            gapColor:Cesium.Color.WHITE.withAlpha(0)
        })
    },
    "xian:point_village" : {
        font:"15pt monospace",
        fillColor:Cesium.Color.BLACK,
        outlineColor:Cesium.Color.BLACK,
        outlineWidth:1
    },
    "xian:point_border" : {
        font:"15pt monospace",
        fillColor:Cesium.Color.RED,
        outlineColor:Cesium.Color.RED,
        outlineWidth:0.5
    },
    "xian:line_border" : {
        width:3,
        color:Cesium.Color.RED
    },
    "xian:labelriver1" : {
        width:1,
        color:Cesium.Color.SPRINGGREEN.withAlpha(0.5)
    },
    "xian:labelriver2" : {
        width:1,
        color:Cesium.Color.GREEN
    },
    "xian:labelriver3" : {
        width:1,
        color:Cesium.Color.CORNFLOWERBLUE
    },
    "xian:labelriver4" : {
        width:1,
        color:Cesium.Color.BLUE
    },
    "xian_ziyuandian:poi_signboard" : {
        img:"../static/img/cesium/paizi.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_mineral_resources" : {
        img:"../static/img/cesium/kuangshan.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_meteorological_resources1" : {
        img:"../static/img/cesium/fengli3.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_meteorological_resources2" : {
        img:"../static/img/cesium/gaungfu.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_forest_reserve" : {
        img:"../static/img/cesium/ziran2.png",
        color:Cesium.Color.RED
    },
    "xian:video" : {
        img:"../static/img/cesium/摄像头.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_historical_site" : {
        img:"../static/img/cesium/guji.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_botanical_garden" : {
        img:"../static/img/cesium/zhiwuyuan.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_sewage_disposal" : {
        img:"../static/img/cesium/wushui.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_garbage_collection" : {
        img:"../static/img/cesium/laji.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_wildlife_park" : {
        img:"../static/img/cesium/zoo.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_geological_relics" : {
        img:"../static/img/cesium/dizhi.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_religion1" : {
        img:"../static/img/cesium/qingzhen.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_religion2" : {
        img:"../static/img/cesium/fojiao.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_ecological_agriculture" : {
        img:"../static/img/cesium/nongye.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_hydropower_station" : {
        img:"../static/img/cesium/shuidianz.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:poi_water_pollution_source" : {
        img:"../static/img/cesium/shuiwuran.png",
        color:Cesium.Color.RED
    },
    "xian_ziyuandian:community_hamlet_survey" : {
        img:"../static/img/cesium/environmental_house.png",
        color:Cesium.Color.RED
    },
};