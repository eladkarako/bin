"use strict";

//https://gist.github.com/eladkarako/b8f34c063157112a646cffb4b3c635ab#file-javascript-base64-pretty-fast-using-pre-calculated-reverse-lookup-for-decoding-js

/* reverse-lookup table to speed up decoding.
 * avoid indexOf/charAt (string search and returning strings), repeated string concatenation, and join.
 * Standard Base64: A–Z → 0–25, a–z → 26–51, 0–9 → 52–61, '+' (43) → 62, '/' (47) → 63.
 * URL-safe variants: '-' (45) → 62, '_' (95) → 63.
 * Padding/invalid positions are zero (note: 'A' maps to 0, so treat zero as a valid value, not an "invalid" sentinel).
 */
const base64_decode_reverse_lookup = new Uint8Array([
   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0  /* 000-015 */ 
,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0  /* 016-031 */
,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 62,  0, 62,  0, 63  /* 032-047 */
, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,  0,  0,  0,  0,  0,  0  /* 048-063 */
,  0,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14  /* 064-079 */
, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,  0,  0,  0,  0, 63  /* 080-095 */
,  0, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40  /* 096-111 */
, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,  0,  0,  0,  0,  0  /* 112-127 */
]);



const base64_decode = (s)=>{
  s = String(s);

  s = s.replace(/\-/gm,"+").replace(/\_/gm,"/") //replace URL-safe variation that used by java and php sometimes, with standard.
       .replace(/[^A-Za-z0-9\+\/\=]+/gm,"")    //remove anything that isn't standard.
       ;

  const modulu = s.length % 4;
  if (modulu === 1){ throw new Error("Invalid base64 string"); }
  if (modulu !== 0){ s = s + '='.repeat(4 - modulu); }

  // compute output length
  const padding = (s.endsWith('==')) ? 2 : (s.endsWith('=')) ? 1 : 0;
  const outputLength = (s.length * 3) / 4 - padding;
  const output = new Uint8Array(outputLength | 0);

  let outIndex = 0;
  for (let i = 0; i < s.length; i += 4) {
    const c0 = s.charCodeAt(i + 0);
    const c1 = s.charCodeAt(i + 1);
    const c2 = s.charCodeAt(i + 2);
    const c3 = s.charCodeAt(i + 3);
    
    const h0 = base64_decode_reverse_lookup[c0];
    const h1 = base64_decode_reverse_lookup[c1];
    const h2 = base64_decode_reverse_lookup[c2];
    const h3 = base64_decode_reverse_lookup[c3];
    
    const combined = (h0 << 18) | (h1 << 12) | (h2 << 6) | h3;
    if(outIndex < outputLength){
      output[outIndex] = (combined >> 16) & 0xFF;
      outIndex++;
    }
    if(outIndex < outputLength){
      output[outIndex] = (combined >> 8) & 0xFF;
      outIndex++;
    }
    if(outIndex < outputLength){
      output[outIndex] = combined & 0xFF;
      outIndex++;
    }
  }  

  return new TextDecoder("utf-8").decode(output);
};



const base64_range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const base64_encode = (s)=>{
  s = String(s);
  const bytes = new TextEncoder().encode(s);
  const len = bytes.length;
  if (len === 0) return '';
  const outLen = Math.ceil(len / 3) * 4;
  const out = new Array(outLen);
  let outIndex = 0;
  const fullTriples = Math.floor(len / 3) * 3;

  let i = 0;
  // main loop: process 3 bytes -> 4 chars
  for (; i < fullTriples; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    const trip = (b0 << 16) | (b1 << 8) | b2;
    out[outIndex++] = base64_range[(trip >> 18) & 0x3F];
    out[outIndex++] = base64_range[(trip >> 12) & 0x3F];
    out[outIndex++] = base64_range[(trip >> 6) & 0x3F];
    out[outIndex++] = base64_range[trip & 0x3F];
  }

  // remainder - what's left out
  const rem = len - fullTriples;
  if (rem === 1) {
    const b0 = bytes[i];
    const trip = b0 << 16;
    out[outIndex++] = base64_range[(trip >> 18) & 0x3F];
    out[outIndex++] = base64_range[(trip >> 12) & 0x3F];
    out[outIndex++] = '=';
    out[outIndex++] = '=';
  } else if (rem === 2) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const trip = (b0 << 16) | (b1 << 8);
    out[outIndex++] = base64_range[(trip >> 18) & 0x3F];
    out[outIndex++] = base64_range[(trip >> 12) & 0x3F];
    out[outIndex++] = base64_range[(trip >> 6) & 0x3F];
    out[outIndex++] = '=';
  }
  return out.join('');
};



const btn_dark_mode      = document.querySelector('[id="btn_dark_mode"]')
     ,btn_text_wrap      = document.querySelector('[id="btn_text_wrap"]')
     ,input_mimetype     = document.querySelector('[id="input_mimetype"]')
     ,btn_text_open      = document.querySelector('[id="btn_text_open"]')
     ,btn_text_save_as   = document.querySelector('[id="btn_text_save_as"]')
     ,btn_base64_open    = document.querySelector('[id="btn_base64_open"]')
     ,btn_base64_save_as = document.querySelector('[id="btn_base64_save_as"]')
     ,editor             = document.querySelector('[id="editor"]')
     ,preview            = document.querySelector('[id="preview"]')
     ,urlbar             = document.querySelector('[id="urlbar"]')
     ,opener             = document.querySelector('[opener]')
     ,downloader         = document.querySelector('[downloader]')
     ;


const set_editor_value = (text)=>{
  try{editor.blur();}catch(err){}
  try{editor.focus();}catch(err){}
  editor.textContent = "";
  try{
    self.document.execCommand("insertText", false, text); //allow native browser's UNDO.
  }catch(err){
    editor.textContent = text;
  }
  editor.scrollTo(0,0);
  try{editor.focus();}catch(err){}
};


let last_encoded = "";

let is_busy_keyup = false;                               //skip event (with return true, ..assuming there would be another.
const MILLISECONDS_TO_WAIT_AFTER_KEYUP_TO_THROTTLE = 20; //throttle keyup event - additional delay until releasing "is_busy_keyup".

const build_data_url = (text)=>{
  return url;
};

const encode_text_from_editor_and_set_iframe_src_to_date_url = (event)=>{
  if(true === is_busy_keyup){ return true; }
  is_busy_keyup = true;

  (async ()=>{
    const text          = editor.textContent || "";

    if("" === text){  //special case, cleanup.
      last_encoded       = "";
      urlbar.textContent = "about:blank";
      preview.src        = "about:blank";
      try{ localStorage.removeItem("last_encoded");              }catch (err){}
      is_busy_keyup = false;
      return true;
    }

    const mimetype      = input_mimetype.value || "text/html"
         ,text_encoded  = base64_encode( text )
         ,url           = "data:" + mimetype + ";base64," + text_encoded
         ;

    last_encoded       = text_encoded;
    urlbar.textContent = url;
    preview.src        = url;

    try{
      localStorage.setItem("last_encoded", last_encoded);
    }catch (err){}

    is_busy_keyup = false;
  })();

  return true;
};
editor.removeEventListener("keyup", encode_text_from_editor_and_set_iframe_src_to_date_url, {capture:false, passive:true, once:false});
editor.addEventListener(   "keyup", encode_text_from_editor_and_set_iframe_src_to_date_url, {capture:false, passive:true, once:false});


//'data:' url, it can really help, instead of brute-forcing <IMG> element into a new DOM..  you can use probably stuff like `data:image/svg+xml,%3csvg%20view ...`
const urlbar_keyup = (ev)=>{
  const text = urlbar.textContent;
  if(text === last_encoded){ return true; }
  preview.src = text;
  return true;
};
urlbar.removeEventListener("keyup", urlbar_keyup, {capture:false, passive:true, once:false});
urlbar.addEventListener(   "keyup", urlbar_keyup, {capture:false, passive:true, once:false});


try{
  last_encoded = localStorage.getItem("last_encoded") || "";
}catch(err){}
set_editor_value( base64_decode( last_encoded ) );
encode_text_from_editor_and_set_iframe_src_to_date_url(); //"fire" the event's callback 



const btn_dark_mode_change = (ev)=>{ //just store the settings every change.
  try{
    localStorage.setItem("btn_dark_mode__is_checked", String(btn_dark_mode.checked));
  }catch(err){}
  return true;
};
btn_dark_mode.removeEventListener("change", btn_dark_mode_change, {capture:false, passive:true, once:false});
btn_dark_mode.addEventListener(   "change", btn_dark_mode_change, {capture:false, passive:true, once:false});

let is_checked_storage_value = null;
try{
  is_checked_storage_value = localStorage.getItem("btn_dark_mode__is_checked");
}catch(err){}

if(null !== is_checked_storage_value){
  btn_dark_mode.checked = ("true" === is_checked_storage_value) || is_user_prefers_dark_mode;
}else{
  const is_user_prefers_dark_mode = ((window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")) || {"matches":false} ).matches; //query OS state of theme, fallback to false if not possible.
  btn_dark_mode.checked = is_user_prefers_dark_mode; //query OS/browse theme, or theme preference, to better initialize the page's theme. not handled via more reasonable CSS, in-order to piggyback the user-interaction mechanism of checkbox for dark-mode. default/fallback to false ("light").
  btn_dark_mode_change(); //manually trigger the function to save the data to storage, since it probably wasn't there..
}



const btn_text_wrap_change = (ev)=>{ //just store the settings every change.
  try{
    localStorage.setItem("btn_text_wrap__is_checked", String(btn_text_wrap.checked));
  }catch(err){}
  return true;
};
btn_text_wrap.removeEventListener("change", btn_text_wrap_change, {capture:false, passive:true, once:false});
btn_text_wrap.addEventListener(   "change", btn_text_wrap_change, {capture:false, passive:true, once:false});

try{ //one time when page loads up, try restore last state.
  btn_text_wrap.checked = ("true" === (localStorage.getItem("btn_text_wrap__is_checked") || "false"));
}catch(err){}







void 0;