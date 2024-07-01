window.onscroll = function() {myFunction()};
window.onload = function() {myFunction()};

var scrollChangePadding = 400;

function myFunction() {

    if (document.getElementById('footer').getBoundingClientRect().top < scrollChangePadding) {
        document.body.classList.remove('gnat_color');
        document.body.classList.remove('midori_color');
        document.body.classList.remove('flip_color');

        document.getElementById('header').style.opacity = "0";
        document.getElementById('project1_section').style.opacity = "0";
        document.getElementById('project2_section').style.opacity = "0";
        document.getElementById('project3_section').style.opacity = "0";
        document.getElementById('footer').style.opacity = "1";

    } else if (document.getElementById('project3_section').getBoundingClientRect().top < scrollChangePadding) {
        document.body.classList.remove('gnat_color');
        document.body.classList.remove('midori_color');
        document.body.classList.add('flip_color');

        document.getElementById('header').style.opacity = "0";
        document.getElementById('project1_section').style.opacity = "0";
        document.getElementById('project2_section').style.opacity = "0";
        document.getElementById('project3_section').style.opacity = "1";
        document.getElementById('footer').style.opacity = "0";

    } else if (document.getElementById('project2_section').getBoundingClientRect().top < scrollChangePadding) {
        document.body.classList.remove('gnat_color');
        document.body.classList.remove('flip_color');
        document.body.classList.add('midori_color');

        document.getElementById('header').style.opacity = "0";
        document.getElementById('project1_section').style.opacity = "0";
        document.getElementById('project2_section').style.opacity = "1";
        document.getElementById('project3_section').style.opacity = "0";
        document.getElementById('footer').style.opacity = "0";

    } else if (document.getElementById('project1_section').getBoundingClientRect().top < scrollChangePadding) {
        document.body.classList.remove('midori_color');
        document.body.classList.remove('flip_color');
        document.body.classList.add('gnat_color');

        document.getElementById('header').style.opacity = "0";
        document.getElementById('project1_section').style.opacity = "1";
        document.getElementById('project2_section').style.opacity = "0";
        document.getElementById('project3_section').style.opacity = "0";
        document.getElementById('footer').style.opacity = "0";

    } else {
        document.body.classList.remove('gnat_color');
        document.body.classList.remove('midori_color');
        document.body.classList.remove('flip_color');

        document.getElementById('header').style.opacity = "1";
        document.getElementById('project1_section').style.opacity = "0";
        document.getElementById('project2_section').style.opacity = "0";
        document.getElementById('project3_section').style.opacity = "0";
        document.getElementById('footer').style.opacity = "0";
    }

}