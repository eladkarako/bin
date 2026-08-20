### BIN

<hr/>

note: under development, nothing is "wired" yet.

<hr/>

text-editor and iframe.  
you write html on the left side,  
it renders as html page on the right iframe,  
fast, reliable, local, no server needed.  
uses browser's own implementation of rendering,  
so it can be used very quickly to visually verify same html rendering result on multiple browsers.  

I set the iframe's src to `data:` base64 content of the text-editor, as is without trimming,  
although blob should be faster - base64 can be shared, or be opened in new tab,  
and preserve the original text in ASCII-safe variation that can be stored in the website-storage.  

minimal javascript.  
mostly HTML based.  

<hr/>

both the html page and iframe, are set with very permissive permissions,  
to be able to allow any type of html to be rendered.  

<hr/>

cool stuff. pure HTML and CSS for click-based state machine without javascript.

### css - alternative checkbox that scales better
actual input type checkboxes are hidden,  
and I use their labels to show a checked/unchecked boxes.  
it relies on CSS rule `input:checked + label::before` so you can't use `<label><input ../></label>`  
as the label must come after, so `<input id=.../><label for=...>...</label>`  
it means you must have an `id` and `for`, which will allow the HTML to bind the label to the input,  
making the label clickable (without javascript), and be able to change the state of the checkbox.
it means the checkbox is functioning normally.  

the unicode characters are added with variation to force (well... suggest) using the text variation and not picture glyphs..

### css - applying styles to various elements, depending on the value of a checkbox, indirectly through variables.

if previous tweak was relying on a very strict structure,  
and would work everywhere,  
you can query a state of a checkbox,  
based on that, store a variable with either of two values of style,  
and uniformly assign the variable as the value of a css rule.
it means, again, pure html maintained states, and CSS, without javascript at all, it means less stuff to maintain.  

I am using this in two places,  
applying system global theme (dark/light),  
and applying (through a different checkbox) a text-wrap for the editor,  

`:root:has([id="btn_dark_mode"]:checked){...`

this apply directly css rule `color-scheme:light;` or `color-scheme:dark;`,  
as well as multiple variables for later usage.  

as I was saying before, the first visual trick for replacing the checkbox element (which itself is hidden) does not matter,  
as the mechanism of the checkbox continues to work in the background due to the label binding with the checkbox through `id` and `for`.  

see HTML and css, they are very simple.


<hr/>

### cool stuff - faster base64.

does not uses this trick to get utf8/unicode into string with every character is 0-255 and back.
`unescape(encodeURIComponent("א"))` - `'×\x90'`
`decodeURIComponent(escape('×\x90'))` - `'א'`

does not uses `atob`/`btoa` but custom encode/decode that supports chunked stream,  
and working in binary, bytes, with buffers and typed arrays and data-views,  
with minimal re-allocation.  

