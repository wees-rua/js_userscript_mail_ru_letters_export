// ==UserScript==
// @name     Download_Mail.ru
// @author   wees-rua
// @version  1
// @match    *://e.mail.ru/*
// @grant    none
// ==/UserScript==
let letters = new Set();
let arrLet = new Array();
let boxList = 0;
let letPref = "";
let getPart = false;
let firstStartTimeout = 5000;
let downloadTimeout = 500;
let collectTimeout = 500;
let collectScroll = 600

function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  if (fileName) {
    link.download = fileName;
  }
  link.click();
  console.log(url);
}

function downloadI(u) {
	if (u < letters.size) {
    let uidLet = arrLet[u];
    downloadFile("https://e.mail.ru/message/" + uidLet + "/download/?folder_id=0", letPref + "_message" + uidLet + ".eml");
    const timerDownload = setTimeout(() => {
      downloadI(u+1);
    }, downloadTimeout);
  }
}

function collectLetters(o) { 
  if (letters.size < boxList) {
    if( o > 0 ) { // сдвигаемся только со второго повтора
    	window.document.getElementsByClassName("ReactVirtualized__Grid")[0].scrollBy(0, collectScroll); 
    }
    const timerId = setTimeout(() => {
      letterlist = window.document.getElementsByClassName("llc");
      for (let i = 0; i < letterlist.length; i++) {
        letters.add(letterlist[i].getAttribute("data-uidl-id"));
      }
      console.log(letters.size);
      collectLetters(o+1);	
    }, collectTimeout);
  } else {
    arrLet = Array.from(letters);
    downloadI(0);
  }
}

function payload() {
  console.log("!=====================!");
  let boxs = window.document.getElementsByClassName("nav__item");
  let boxCount, boxTitle, boxHref;
  var BreakException = {};
  try {
    Array.from(boxs).forEach(function(box) {
      boxCount = box.title.split(",")[1].split(" ")[1];
      boxTitle = box.title.split(",")[0];
      console.log(boxTitle + "_" + boxCount);
      boxHref = box.href.replace(/\?+$/g, '');
      console.log(boxHref);
      if(boxHref == window.location.href) {
        console.log(boxTitle + "_" + boxCount + "_" + boxHref);
        throw BreakException;
      }
    });
  } catch (e) {
    if (e !== BreakException) throw e;
  }

  if(boxCount !== "нет") {
    if (getPart !== true) { 
      boxList = boxCount; 
    }
    letPref = boxTitle.replace(" ", "_");
    console.log("В папке " + boxTitle + " " + boxList + " писем.");
    collectLetters(0);
  } else {
    console.log("Папка " + boxTitle + " пуста");
  }
 }

(function (window, undefined) { 
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }

    if (w.self != w.top) {
        return;
    }
    // дополнительная проверка наряду с @include
    if (/.*:\/\/e.mail.ru\//.test(w.location.href)) {
      const timerId0 = setTimeout(() => { 
          payload() ;
        }, firstStartTimeout);
    }
})(window);
