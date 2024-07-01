window.onscroll = function() {myFunction()};
window.onload = function() {myFunction()};

var scrollChangePadding = 400;

function myFunction() {

    if (document.getElementById('footer').getBoundingClientRect().top < scrollChangePadding) 
    {
        document.getElementById('header').style.opacity = "0";
        document.getElementById('footer').style.opacity = "1";

    } 
    else 
    {
        document.getElementById('header').style.opacity = "1";
        document.getElementById('footer').style.opacity = "0";
    }

}