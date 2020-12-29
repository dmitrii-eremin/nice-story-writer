var data = {
    server_ip: "",
    filename: ""
};

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

function foreach(arr, fn) {
    for (const i of arr) {
        fn(i);
    }
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
    updateInnerHtmlForClass("current-server-ip-status", data.server_ip);
    updateInnerHtmlForClass("current-filename-status", data.filename);
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

    document.getElementById("input-ip-address").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            save_ip_address("dialog-ip-address");
          }
    });

    document.getElementById("input-filename").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            save_file_from_dialog('dialog-save-as');
          }
    });
})();

function insertToText(element, value) {
    const v = element.value,
            s = element.selectionStart,
            e = element.selectionEnd;
    element.value = v.substring(0, s) + value  + v.substring(e);
    element.selectionStart = element.selectionEnd = s + value.length;
}

function onTextAreaKeyDown(element, event) {
    if (event.keyCode === 9) {
        insertToText(element, "    ");
        event.preventDefault();
    }
    else if (event.keyCode === 120) {
        var d = new Date();
        insertToText(element, d.toLocaleString());
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

function open_dialog(dlg) {
    foreach(document.getElementsByClassName(dlg), function(item) {
        item.showModal();
    });
}

function close_dialog(dlg) {
    foreach(document.getElementsByClassName(dlg), function(item) {
        item.close();
    });
}

function set_server_ip(ip) {
    if (!ip.toLowerCase().startsWith("http://") && !ip.toLowerCase().startsWith("https://")) {
        ip = "http://" + ip;
    }
    document.getElementById("input-ip-address").value = ip;
    data.server_ip = ip;
    var show = data.server_ip.length > 0;
    foreach(document.getElementsByClassName("only-when-server-ip-is-defined"), function(item) {
        item.style.display = show ? "inline" : "none";
    });
}

function save_ip_address(dlg) {
    set_server_ip(document.getElementById("input-ip-address").value);
    close_dialog(dlg);
}

function setCurrentFilename(filename) {
    data.filename = filename;
    var show = filename.length > 0;
    foreach(document.getElementsByClassName("only-when-filename-is-defined"), function(item) {
        item.style.display = show ? "inline" : "none";
    });
}

async function load_from_server() {
    const response = await fetch(data.server_ip + '/notes');
    const res = await response.json();

    var list = document.getElementById("server-files-list");
    list.options.length = 0;
    foreach(res.files, function(filename) {
        list.add(new Option(filename, filename));
    });

    open_dialog('dialog-load-file');
}

async function load_file_from_server() {
    var list = document.getElementById("server-files-list");

    if (list.value.length > 0) {
        const response = await fetch(data.server_ip + '/note?' + new URLSearchParams({
            filename: list.value
        }));
        const res = await response.json();

        setText(res.text);
        setCurrentFilename(list.value);
    }

    close_dialog('dialog-load-file');
    makeFocus();
}

async function save_file(filename, text) {
    body = {
        filename: filename,
        text: text
    }

    const response = await fetch(data.server_ip + '/note', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
      });

    return await response.json();
}

async function save_file_from_dialog(dlg) {
    setCurrentFilename(document.getElementById("input-filename").value);
    if (data.filename.length > 0) {
        await save_file(data.filename, getText());
    }
    close_dialog(dlg);
}

async function save_to_server() {
    if (data.filename.length === 0) {
        return await save_as_to_server();
    }
    else {
        save_file(data.filename, getText())
    }
}

async function save_as_to_server() {
    open_dialog("dialog-save-as");
}

async function delete_file_from_server() {
    var list = document.getElementById("server-files-list");
    var filename = list.value;
    body = {
        filename: filename
    }

    if (filename.length > 0) {
        const response = await fetch(data.server_ip + '/note', {
            method: 'DELETE',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await response.json();

        var new_options = []
        foreach(list.options, function(option) {
            if (option.value !== filename) {
                new_options.push(option.value);
            }
        });
        list.options.length = 0;
        foreach(new_options, function(option) {
            list.add(new Option(option, option));
        });
    }
    else {
        close_dialog('dialog-load-file');
    }
}

function newFile() {
    setCurrentFilename("");
    setText("");
    makeFocus();
}