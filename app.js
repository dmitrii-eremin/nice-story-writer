function updateInnerHtmlForClass(classname, text) {
    var elements = document.getElementsByClassName(classname);
    for (const iterator of elements) {
        iterator.innerHTML = text;
    }
}

function filter(arr, fn) {
    var result = [];
    for (const i of arr) {
        if (fn(i)) {
            result.push(i);
        }
    }
    return result;
}

function reduce(arr, initial, fn) {
    var result = initial;
    for (const i of arr) {
        result = fn(result, i);
    }
    return result;
}

function getText() {
    return document.getElementsByClassName("editor")[0].value;
}

function setText(text) {
    document.getElementsByClassName("editor")[0].value = text;
}

function countWords(str) {
    return filter(str.trim().split(/\s+/), function(item) {
        return item.length > 0;
    }).length;
}

function updateCounters() {
    const text = getText();

    const characters = text.length;
    const lines = reduce(text, 1, function(acc, item) {
        return item === "\n" ? acc + 1 : acc;
    });
    const pages = Math.ceil(lines / 24);
    const words = countWords(text);
    const paragraphs = text.split(/\n\n/).length;

    updateInnerHtmlForClass("amount-of-paragraphs", paragraphs);
    updateInnerHtmlForClass("amount-of-words", words);
    updateInnerHtmlForClass("amount-of-pages", pages);
    updateInnerHtmlForClass("amount-of-lines", lines);
    updateInnerHtmlForClass("amount-of-characters", characters);
}

function makeFocus() {
    var editor = document.getElementsByClassName("editor")[0];
    editor.focus();
}

(function() {
    function updateTime() {
        var date = new Date();
        updateInnerHtmlForClass("current-time", date.toLocaleTimeString());
    };

    updateTime();
    updateCounters();
    makeFocus();
    setInterval(function() {
        updateTime();
    }, 1000);

    setInterval(function() {
        updateCounters();
    }, 250);
})();

function onTextAreaKeyDown(element, event) {
    if (event.keyCode === 9) {
        const tab = "    ";

        const v = element.value,
              s = element.selectionStart,
              e = element.selectionEnd;
        element.value = v.substring(0, s) + tab  + v.substring(e);
        element.selectionStart = element.selectionEnd = s + tab.length;
        event.preventDefault();
    }
}

function save() {
    const filename = "Untitled.txt";
    const data = getText();

    var blob = new Blob([data], {type: 'text/plain'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}

function fullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function onloadfile(elem) {
    var fr=new FileReader();
    fr.onload=function(){
        setText(fr.result);
    }
    var text = fr.readAsText(elem.files[0]);
}

function load() {
    var element = document.getElementById('inputfile').click();
}