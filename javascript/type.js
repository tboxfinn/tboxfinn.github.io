var i = 0;
var txt = 'Ori';
var speed = 50;

window.onload = function() 
{
	var titleDiv = document.getElementById("title_foreground");
	titleDiv.innerHTML = '|' + '&nbsp;'.repeat(txt.length - 1);
	
	const DELAY = 1500;
	
	setTimeout(typeTitle, DELAY);
}


function typeTitle() 
{
	var foregroundElement = document.getElementById("title_foreground");
	
	if (i < txt.length) 
	{
		var current = foregroundElement.innerHTML;
		
		foregroundElement.innerHTML = current.substr(0, i) + txt.charAt(i) 
		if (i < txt.length - 1) {
			foregroundElement.innerHTML += '|' + '&nbsp;'.repeat(txt.length - i - 2);
		}
		
		i++;
		setTimeout(typeTitle, speed);
	}
}