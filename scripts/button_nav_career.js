/*
    This script handles the content assignment of career data
*/

const CareerNames = 
[
    "education",
    "work"
]

let CareerText = [];

let careerTextArea = document.getElementById("project_data_area");

/* Adds the included text data into the array of text. */
for(let i = 0; i < CareerNames.length; ++i)
{
    CareerText.push("");
    fetch("./Data/pages/careers/" + CareerNames[i] + ".html")
    .then( r => r.text() )
    .then( t => CareerText[i] = t )

}

function LoadCareer(button, btnIndex)
{
    if(button.getAttribute("class") == "btn-career-5-active") /* case where you select the active button */
    {
        var x = document.getElementsByClassName("btn-career-5-active");

        x[0].className = "btn-career-5";
        careerTextArea.innerHTML = "";
        careerTextArea.style.opacity = 0;
    }
    else 
    {
        var x = document.getElementsByClassName("btn-career-5-active");
        if(x.length != 0) /* case where another project is currently active and being displayed. */
        {
            x[0].className = "btn-career-5";
            careerTextArea.innerHTML = "";
            careerTextArea.style.opacity = 0;
        }

        /* Set this button as the active display */
        careerTextArea.innerHTML = CareerText[btnIndex];
        careerTextArea.style.opacity = 1;
        document.getElementById(button.getAttribute("id")).className = "btn-career-5-active";
    }
}