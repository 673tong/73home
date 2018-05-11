package top.tong73.Web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 地图通用页面跳转逻辑
 * Created by 73tong on 2018/4/12.
 */
@RequestMapping("map")
@Controller
public class MapController {
    @RequestMapping(value = "{mapName}",method = RequestMethod.GET)
    public String tomap(@PathVariable("mapName") String mapName) {
        return "map/"+mapName;
    }
}
