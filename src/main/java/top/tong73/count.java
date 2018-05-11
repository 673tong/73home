/*
package top.tong73;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class count {
    public static void main(String[] args) {
        int count =0;
        List<Map<String,Integer>> list =  new ArrayList<HashMap<String,Integer>>();
        Map<String,Integer> hs = new HashMap<>();
        for(int x1=0;x1<=9;x1++){
            for(int x2=0;x2<=9;x2++){
                for(int x3=0;x3<=9;x3++){
                    for(int x4=0;x4<=9;x4++){
                        for(int x5=0;x5<=9;x5++){
                            if(x1+x2+x3+x4+x5==10){
                                count++;
                                list.add((x1+"-"+x2+"-"+x3+"-"+x4+"-"+x5));
                            }
                        }
                    }
                }
            }
        }
        System.out.println("总和为： " + count);
        for(int i=0;i<list.size() ; i++){
            System.out.print(list.toArray());
        }

    }
}*/
