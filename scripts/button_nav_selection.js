/*
    This script handles the navigation selection between the main content buttons.
*/

const ContentNames = 
[
    "projects",
    "career",
    "skills",
    "research"
];

const TextAreaMinHeightExtended = "200px";
const TextAreaMinHeightClosed = "0px";
const TransitionDuration = 0;

let IncludeText = [];
let lastButtonIndex = -1;
let buttonLock = false;

/* Adds the included text data into the array of text. */
for(let i = 0; i < ContentNames.length; ++i)
{
    IncludeText.push("");
    fetch("./Data/pages/" + ContentNames[i] + ".html")
    .then( r => r.text() )
    .then( t => IncludeText[i] = t )
}

/* Display the included text for the correct content. */

function revealIncludeText(textArea, i) 
{
    if (textArea.style.opacity == 0) /* Case: Not currently displaying anything in this text area */
    {
        document.body.style.height = "200vh";
        textArea.innerHTML = IncludeText[i];
        textArea.style.opacity = 1;
	}
    else  /* Case where area is already displayed some data */
    {
        textArea.style.opacity = 0; 
        setTimeout(function()
        {
			textArea.innerHTML = IncludeText[i];
			textArea.style.opacity = 1;
		}, TransitionDuration / 2);
    }
    
}

/* Called when the DOM content is loaded. */
document.addEventListener('DOMContentLoaded', function()
{
    let textArea = document.getElementById("data_selection_area");
    let buttons = [];
    
    for (let i = 0; i < ContentNames.length; ++i) 
    {
		buttons.push(document.getElementById(ContentNames[i] + "-Button")); /* Add all relevant buttons to array. */
    }
    
    /* Add event listener to buttons for click events */
    for (let i = 0; i < buttons.length; ++i) 
    {
        buttons[i].addEventListener("click", function() 
        {
            if (!buttonLock) 
            {
                if (lastButtonIndex >= 0) 
                {
					buttons[lastButtonIndex].class = "kd-button";
				}
                if (i != lastButtonIndex) 
                {
					buttons[i].class = "kd-button";
                    for (let j = 0; j < buttons.length; ++j) 
                    {
						buttons[j].class = j != i ? "kd-button-idle" : buttons[j].class;
					}
					revealIncludeText(textArea, i);
					lastButtonIndex = i;
                    if (textArea.style.minHeight == TextAreaMinHeightClosed || textArea.style.minHeight == "") 
                    {
						textArea.style.minHeight = TextAreaMinHeightExtended;
					}
				}
                else 
                {
                    for (let j = 0; j < buttons.length; ++j) 
                    {
						buttons[j].class = "kd-button";
					}
					textArea.innerHTML = "";
					lastButtonIndex = -1;
                    setTimeout(function() 
                    {
                        textArea.style.minHeight = TextAreaMinHeightClosed;
                        textArea.style.opacity = 0;
					}, TransitionDuration / 2);
				}
				buttonLock = true;
                setTimeout(function() 
                {
					buttonLock = false;
				}, TransitionDuration);
			}
		});
	}
});