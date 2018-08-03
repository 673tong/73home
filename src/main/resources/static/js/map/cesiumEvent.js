$(function () {
    $('#dialog').draggable({
        containment : 'parent'
    });
    $("#dialog").css({
        "background-color" : "#e3f9ee",
        position : "absolute",
        top : "50%",
        left : "50%",
    });
    $('.cesimu_div').draggable({
        containment : 'parent'
    });
    $("#maptoolsPosition-Btn-jwd").click(function () {
        toPostion("jwd");
    });
    $("#maptoolsPosition-Btn-84").click(function () {
        toPostion("84");
    });
    $(".map_menu").click(function(event){
        event.stopPropagation();
        if($(this).siblings(".zicaidan").is(":animated") == false){
            $(this).siblings(".zicaidan").slideToggle();
        }
        $(this).parents().siblings('.fuli').children('.zicaidan').slideUp();
    });
    $(document).click(function(){
        $(".zicaidan").slideUp();
    });
    $(".move").click(function(event){
        if($(".cesimu_div")[0].style.display == "none"){
            $(".cesimu_div").css({
                display:"block"
            });
        }else{
            $(".cesimu_div").css({
                display:"none"
            });
        }
    });
})

