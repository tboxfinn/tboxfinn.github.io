// Breaks HTML into individual characters, and words,
// without messing up the semantic structure.

function letterer(element)
{
	if( !document.createTreeWalker ) return false;
	
	var letter, letterElm, parent, wordElm, letters, walker, node, 
		supportsTrim = String.prototype.trim;
		
	walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

	while( node = walker.nextNode() )
	{
	   if( node.nodeType == 3 )
	   {
			if( supportsTrim ? node.nodeValue.trim() : node.nodeValue )
			{
				letters = node.nodeValue.split('').reverse();
				wordElm = document.createElement('word');
				node.nodeValue = '';
				parent = node.parentNode;		
				// do this for every letter in this text-node
				while( letter = letters.pop() )
				{
					letterElm = document.createElement('letter');
					letterElm.className = 'initial'; // add a class for transition purposes 
					letterElm.innerHTML = letter;
					
					// check for a space
					if( letter == ' ' )
					{
						parent.insertBefore( wordElm, node );
						wordElm = document.createElement('word');
						parent.insertBefore( letterElm, node );
					}
					else
						wordElm.appendChild(letterElm);
				}
				parent.insertBefore( wordElm, node );
			}
		}
	}
}



// The code below initialize Letterer.js and then loops
// on every character and removes it's initial class,
// to trigger a transition effect.

var lettersWrap = document.getElementById('title'),
	letters, 
	delay = 0, // initial delay
	delayJump = 33, // adjust this
	totalLetters;

// Break to letters
letterer( lettersWrap );
lettersWrap.style.display = 'block';

// get all "letter" elements
letters = lettersWrap.getElementsByTagName('letter');
totalLetters = letters.length;

for( var i=0; i < totalLetters; i++ )
{
	doTimer(letters[i], delay);
	delay += delayJump;
	// if the letter is a "space" then pause for a little more, to have some delay between words 
	if( letters[i].innerHTML == ' ' )
		delay += delayJump * 3;
}

function doTimer(letter, delay)
{
	setTimeout(function()
	{ 
		letter.removeAttribute('class');
	}, delay);
}