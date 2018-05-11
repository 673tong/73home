package top.tong73.Web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by 73tong on 2018/4/10.
 */
@Controller
@RequestMapping("/admin")
public class AdminController {



    @RequestMapping(value = "/index")
    public String index(){
        return "index";
    }

    @RequestMapping(value = "/main")
    public String main(){
        return "main";
    }

    @RequestMapping(value = "/login")
    public String login(){
        return "login";
    }

    @RequestMapping(value = "/personInfo")
    public String personInfo(){
        return "personInfo";
    }
    @RequestMapping(value = "/changepwd")
    public String changepwd(){
        return "changepwd";
    }
    @RequestMapping(value = "/myloginfo")
    public String myloginfo(){
        return "myloginfo";
    }
    @RequestMapping(value = "/table")
    public String table(){
        return "table";
    }
    @RequestMapping(value = "/table_1")
    public String table_1(){
        return "table_1";
    }
    @RequestMapping(value = "/404")
    public String s404(){
        return "404";
    }

    @RequestMapping(value = "/tab")
    public String tab(){
        return "tab";
    }

}
