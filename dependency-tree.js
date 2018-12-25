(function() {
    window.drawTree = function(svgElement, data) {
        var i, j, treeWidth, treeHeight, svg, leftOffset, wordHeight, preEndX = 0;
        var edges = [];
        wordHeight = 20;
        leftOffset = 7;
        svg = d3.select(svgElement);

        treeWidth = 1100;
        treeHeight = 250;

        svg.selectAll('text, path').remove();
        svg.attr('width', treeWidth).attr('height', treeHeight);

        for (i = 0; i < data.length; i++) {
            let item = data[i];
            if (item.dependency.length > 0) {
                for (j = 0; j < item.dependency.length; j++) {
                    let _den = item.dependency[j];
                    let edge = {
                        from: item.id,
                        to: _den.next,
                        name: _den.name
                    }
                    edges.push(edge);
                }
            }
        }

        words = svg.selectAll('.word').data(data).enter().append('text').text(function(d) {
            return d.word;
        }).attr('class', function(d) {
            return "word";
        }).attr('id', function(d) {
            return "w" + d.id;
        }).attr('x', function(d) {
            if (d.id > 0) {
                let preId = "w" + (d.id - 1);
                let element = document.getElementById(preId);
                let eleWidth = measureText(element);
                let leftMargin = getOffsetOfItem(d);
                preEndX += eleWidth + leftMargin;
                return preEndX;
            }
            return 0;
        }).attr('y', treeHeight - wordHeight).on('mouseover', function(d) {
            svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
            return svg.selectAll(".w" + d.id).classed('active', true);
        }).on('mouseout', function(d) {
            return svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
        });

        tags = svg.selectAll('.tag').data(data).enter().append('text').text(function(d) {
            return d.tag;
        }).attr('class', function(d) {
            return "tag";
        }).attr('id', function(d) {
            return "t" + d.id;
        }).attr('x', function(d) {
            let id = "w" + d.id;
            let element = document.getElementById(id);
            let eleWidth = measureText(element) / 2;
            let x = element.getAttribute('x');
            return Number(x) + eleWidth - 2;
        }).attr('y', treeHeight - wordHeight - 20);

        dependencies = svg.selectAll('.dependency').data(edges).enter().append('text').text(function(e) {
            return e.name;
        }).attr('class', function(e) {
            return "dependency w" + e.from + " w" + e.to;
        }).attr('x', function(e) {
            let fromElement = document.getElementById("t" + e.from);
            let toElement = document.getElementById("t" + e.to);
            let fromX = Number(fromElement.getAttribute('x'));
            let toX = Number(toElement.getAttribute('x'));
            let midX = (fromX + toX) / 2;
            return midX;
        }).attr('y', function(e) {
            let fromElement = document.getElementById("t" + e.from);
            let toElement = document.getElementById("t" + e.to);
            let fromX = Number(fromElement.getAttribute('x'));
            let basicY = Number(fromElement.getAttribute('y')) - 10;
            let toX = Number(toElement.getAttribute('x'));
            let dis = toX - fromX;

            let topOffset = basicY - round10(Math.abs(dis / 2)) / 2 - 4;
            return topOffset;
        });

        edgeList = svg.selectAll('.edge').data(edges).enter().append('path').filter(function(e) {
            return e.from;
        }).attr('class', function(e) {
            return "edge w" + e.from + " w" + e.to;
        }).attr('d', function(e) {
            let fromElement = document.getElementById("t" + e.from);
            let toElement = document.getElementById("t" + e.to);
            let fromX = Number(fromElement.getAttribute('x'));
            let basicY = Number(fromElement.getAttribute('y')) - 10;
            let toX = Number(toElement.getAttribute('x'));
            let dis = toX - fromX;
            let midX = (fromX + toX) / 2;

            // let firstX = fromX + dis / 3;
            // let secondX = toX - dis / 3;

            let conY = basicY - round10(Math.abs(dis / 2));
            // let s = "M" + fromX + " " + basicY + " C " + firstX + " " + conY + ", " + secondX + " " + conY + ", " + toX + " " + basicY;
            let s = "M" + fromX + " " + basicY + " Q " + midX + " " + conY + ", " + toX + " " + basicY;
            log(s);
            return s;

        });

        triangle = d3.svg.symbol().type('triangle-up').size(5);
        arrows = svg.selectAll('.arrow').data(edges).enter().append('path').filter(function(e) {
            return e.from;
        }).attr('class', function(e) {
            return "arrow w" + e.from + " w" + e.to;
        }).attr('d', triangle).attr('transform', function(e) {
            let fromElement = document.getElementById("t" + e.from);
            let toElement = document.getElementById("t" + e.to);
            let fromX = Number(fromElement.getAttribute('x'));
            let basicY = Number(fromElement.getAttribute('y')) - 10;
            let toX = Number(toElement.getAttribute('x'));
            let dis = toX - fromX;
            let midX = (fromX + toX) / 2;

            let maxTop = basicY - round10(Math.abs(dis / 2)) / 2;
            return "translate(" + midX + ", " + maxTop + ") rotate(" + (e.from < e.to ? '' : '-') + "90)";
        });



        function getOffsetOfItem(item) {
            let i, result = leftOffset;
            const curId = item.id;
            if (item.dependency.length > 0) {
                for (i = 0; i < item.dependency.length; i++) {
                    if (item.dependency[i].next == curId - 1) {
                        result += 38
                    }
                }
            } else {
                let preItem = data[item.id - 1];
                if (preItem.dependency.length > 0) {
                    for (i = 0; i < preItem.dependency.length; i++) {
                        if (preItem.dependency[i].next == curId) {
                            result += 38;
                        }
                    }
                }
            }
            return result;
        }



    };


    round10 = function(number) {
        if (number % 10 > 5) {
            return number + 10 - number % 10;
        } else {
            return number - number % 10;
        }
    }

    measureText = function(el) {
        let canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        let context = canvas.getContext('2d');
        let fontSize = window.getComputedStyle(el, null).fontSize;
        let fontFamily = window.getComputedStyle(el, null).fontFamily;

        document.body.appendChild(canvas);

        context.font = fontSize + " " + fontFamily;
        document.body.removeChild(canvas);
        let text = context.measureText(el.textContent);
        context.fillText(el.textContent, 50, 50);
        let width = text.width;
        return width;

    }

    log = function(s) {
        console.log(s);
    }
}).call(this);