var container = document.querySelector('textarea');
var anchor = document.querySelector('a');

anchor.onclick = function() {
    anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(container.value);
    anchor.download = 'export.txt';
};

