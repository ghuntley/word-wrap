$(function() {

    // start - https://github.com/substack/node-wordwrap/blob/24e58243d6026f6340bb6e5c24f191b48c20c974/index.js
    var wordwrap = function(start, stop, params) {
        if (typeof start === 'object') {
            params = start;
            start = params.start;
            stop = params.stop;
        }

        if (typeof stop === 'object') {
            params = stop;
            start = start || params.start;
            stop = undefined;
        }

        if (!stop) {
            stop = start;
            start = 0;
        }

        if (!params) params = {};
        var mode = params.mode || 'soft';
        var re = mode === 'hard' ? /\b/ : /(\S+\s+)/;

        return function(text) {
            var chunks = text.toString().split(re).reduce(function(acc, x) {
                if (mode === 'hard') {
                    for (var i = 0; i < x.length; i += stop - start) {
                        acc.push(x.slice(i, i + stop - start));
                    }
                } else acc.push(x)
                return acc;
            }, []);

            return chunks.reduce(function(lines, rawChunk) {
                if (rawChunk === '') return lines;

                var chunk = rawChunk.replace(/\t/g, '    ');

                var i = lines.length - 1;
                if (lines[i].length + chunk.length > stop) {
                    lines[i] = lines[i].replace(/\s+$/, '');

                    chunk.split(/\n/).forEach(function(c) {
                        lines.push(
                            new Array(start + 1).join(' ') + c.replace(/^\s+/, ''));
                    });
                } else if (chunk.match(/\n/)) {
                    var xs = chunk.split(/\n/);
                    lines[i] += xs.shift();
                    xs.forEach(function(c) {
                        lines.push(
                            new Array(start + 1).join(' ') + c.replace(/^\s+/, ''));
                    });
                } else {
                    lines[i] += chunk;
                }

                return lines;
            }, [new Array(start + 1).join(' ')]).join('\n');
        };
    };

    wordwrap.soft = wordwrap;

    wordwrap.hard = function(start, stop) {
        return wordwrap(start, stop, {
            mode: 'hard'
        });
    };
    // end - https://github.com/substack/node-wordwrap/blob/24e58243d6026f6340bb6e5c24f191b48c20c974/index.js

    var editable = null;
    $(document).on('mousedown', 'textarea', function() {
        // Capture the editable element
        editable = $(this);
    });

    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.wrapText === true) {
                var original = editable.val();
                var softWrapped = wordwrap.soft(80)(original);

                editable.val(softWrapped);

                sendResponse({
                    "textareaWrapped": true
                });
            } else {
                sendResponse({
                    "textareaWrapped": false
                });
            }
        }
    );

});