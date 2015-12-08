var point_set = [],
    point_width = 10,
    do_horizontal = true,
    x_start,
    x_end,
    y_start,
    y_end,
    showGraph = false;

function reset(resetValues) {
    do_horizontal = true;
    x_start = 0,
    x_end = width - 1,
    y_start = 0,
    y_end = height - 1;
    setup();
    if (resetValues) {
        document.getElementById('explanation').innerHTML = 'Start adding points again!';
        document.getElementById('count').innerHTML = '0 point(s) added';
        point_set = [];
    }
}

function setup() {
    var canvas = createCanvas(windowWidth / 2, 3 * windowHeight / 4);

    canvas.parent('canvas');
    frameRate(30);
    background(255);

    // draw a border around the canvas
    line(0, 0, 0, height);
    line(width - 1, 0, width - 1, height - 1);
    line(0, 0, width - 1, 0);
    line(0, height - 1, width - 1, height - 1);
    fill(0);

    // set global variables
    x_start = 0,
    x_end = width - 1,
    y_start = 0,
    y_end = height - 1;

    // reset the message underneath the canvas
    document.getElementById('message').innerHTML = "";
}

// x_or_y_val must be either 'x' or 'y'
function median(values, x_or_y_val) {

    if (values.length === 0) {
        return NaN;
    }

    values.sort( function(a,b) {return a[x_or_y_val] - b[x_or_y_val];} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half][x_or_y_val];
    else
        return (values[half-1][x_or_y_val] + values[half][x_or_y_val]) / 2.0;
}

function build_kd_tree(x_start, y_start, x_end, y_end, points, tree) {
    kd_tree_helper(x_start, y_start, x_end, y_end, points, do_horizontal, tree);
}

function kd_tree_helper(cur_x_start, cur_y_start, cur_x_end, cur_y_end, points, horizontal, tree) {
    var points_median,
        points_in_range = [],
        draw_x_start,
        draw_y_start,
        draw_x_end,
        draw_y_end;

    points.map(function (point) {
        if (point.x > cur_x_start && point.x < cur_x_end &&
                point.y > cur_y_start && point.y < cur_y_end) {
            points_in_range.push(point);
        }
    });

    if (points_in_range.length <= 1) {
        return;
    }
    points_median = median(points_in_range, horizontal ? 'y' : 'x');

    // initialize left and right subtrees
    tree.left = {};
    tree.right = {};

    // recurse on the median and the appropriate endpoints,
    // flipping whether or not we are searching horizontally
    if (horizontal) {
        draw_x_start = cur_x_start;
        draw_y_start = points_median;
        draw_x_end = cur_x_end;
        draw_y_end = points_median;
        kd_tree_helper(cur_x_start, cur_y_start, cur_x_end, points_median, points, !horizontal, tree.left);
        kd_tree_helper(cur_x_start, points_median, cur_x_end, cur_y_end, points, !horizontal, tree.right);
    }
    else {
        draw_x_start = points_median;
        draw_y_start = cur_y_start;
        draw_x_end = points_median;
        draw_y_end = cur_y_end;
        kd_tree_helper(cur_x_start, cur_y_start, points_median, cur_y_end, points, !horizontal, tree.left);
        kd_tree_helper(points_median, cur_y_start, cur_x_end, cur_y_end, points, !horizontal, tree.right);
    }
    line(draw_x_start, draw_y_start, draw_x_end, draw_y_end);
    tree.point = {
        x: (draw_x_start + draw_x_end) / 2,
        y: (draw_y_start + draw_y_end) / 2
    }
}

function drawTree(tree) {
    if (tree.point) {
        if (tree.first) {
            fill(255, 0, 0);
            stroke(255, 0, 0);
        }
        else {
            fill(0, 255, 0);
            stroke(0, 255, 0);
        }
        ellipse(tree.point.x, tree.point.y, point_width, point_width);
        if (tree.left) {
            if (tree.left.point && tree.left.point.x && tree.left.point.y) {
                stroke(0, 255, 0);
                fill(0, 255, 0);
                line(tree.point.x, tree.point.y, tree.left.point.x, tree.left.point.y);
            }
            drawTree(tree.left);
        }
        if (tree.right) {
            if (tree.right.point && tree.right.point.x && tree.right.point.y) {
                stroke(0, 255, 0);
                fill(0, 255, 0);
                line(tree.point.x, tree.point.y, tree.right.point.x, tree.right.point.y);
            }
            drawTree(tree.right);
        }
    }
    stroke(0);
    fill(0);
}

function drawEllipses(ellipses) {
    ellipses.map(function (point) {
        ellipse(point.x, point.y, point_width, point_width);
    });
}

function toggleGraph() {
    showGraph = !showGraph;
    reset(false);
    if (showGraph) {
        var tree = {
            first: true
        };
        drawEllipses(point_set);
        build_kd_tree(0, 0, width - 1, height - 1, point_set, tree);
        drawTree(tree);
    }
    else {
        drawEllipses(point_set);
        build_kd_tree(0, 0, width - 1, height - 1, point_set, {});
    }
}

function mouseClicked() {
    var new_point,
        clicked_on_point = null;

    if (mouseX < width && mouseX >= 0 && mouseY < height && mouseY >= 0) {
        setup();

        // determine if we clicked on a point
        point_set.map(function (point) {
            if (Math.abs(point.x - mouseX) <= point_width &&
                    Math.abs(point.y - mouseY) <= point_width) {
                clicked_on_point = point;
            }
        });

        if (clicked_on_point !== null) {
            point_set.splice(point_set.indexOf(clicked_on_point), 1);
        }
        else {
            new_point = {
                x: mouseX,
                y: mouseY
            }
            point_set.push(new_point);
        }
        if (point_set.length === 0) {
            document.getElementById('count').innerHTML = '<br>';
        }
        else {
            document.getElementById('count').innerHTML = point_set.length.toString() + ' point(s) added';
        }
        if (point_set.length === 2) {
            document.getElementById('explanation').innerHTML = 'We begin by drawing a line through the horizontal median of the existing points...';
        }
        if (point_set.length === 3) {
            document.getElementById('explanation').innerHTML = 'Add more points!';
        }
        if (point_set.length === 4) {
            document.getElementById('explanation').innerHTML = 'Now we draw lines through the vertical median of each half of the canvas.';
        }
        if (point_set.length === 8) {
            document.getElementById('explanation').innerHTML = 'We now must horizontally divide the vertical divisions we made last time.';
        }
        if (point_set.length === 16) {
            document.getElementById('explanation').innerHTML = 'We repeat this process of dividing the plane (or sub-plane) at its median each time, leaving at most one point in each rectangle.';
        }

        drawEllipses(point_set);
        tree = {
            first: true
        };
        build_kd_tree(0, 0, width - 1, height - 1, point_set, tree);
        if (showGraph) {
            drawTree(tree);
        }
    }
}

function draw() {
}

function drawQueryRectangle(upper_left_x, upper_left_y, lower_right_x, lower_right_y) {
    noFill();
    stroke(255, 0, 255);
    rect(upper_left_x, upper_left_y, lower_right_x - upper_left_x, lower_right_y - upper_left_y);
    fill(0);
}

function makeQuery(values) {
    var form = document.getElementById('form'),
        upper_left_x = parseInt(form.upper_left_x.value),
        upper_left_y = parseInt(form.upper_left_y.value),
        lower_right_x = parseInt(form.lower_right_x.value),
        lower_right_y = parseInt(form.lower_right_y.value),
        num_matching_query = 0;

    if (isNaN(upper_left_x) || isNaN(upper_left_y) ||
        isNaN(lower_right_x) || isNaN(lower_right_y)) {
        document.getElementById('message').innerHTML = "Invalid input";
        return;
    }

    if (upper_left_x >= lower_right_x || upper_left_y >= lower_right_y) {
        document.getElementById('message').innerHTML = "Invalid query dimensions";
        return;
    }
    setup();
    drawEllipses(point_set);
    build_kd_tree(0, 0, width - 1, height - 1, point_set);
    document.getElementById('message').innerHTML = "";
    drawQueryRectangle(upper_left_x, upper_left_y, lower_right_x, lower_right_y);

    point_set.map(function (point) {
        if (point.x >= upper_left_x && point.x <= lower_right_x &&
                point.y >= upper_left_y && point.y <= lower_right_y) {
            num_matching_query++;
        }
    });
    document.getElementById('message').innerHTML = num_matching_query.toString() + " matching points";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addRandomInput() {
    var input = parseInt(document.getElementById('random_input').value);

    if (isNaN(input)) return;

    reset(true);
    for (var i = 0; i < input; i++) {
        point_set.push({
            x: getRandomInt(0, width - 1),
            y: getRandomInt(0, height - 1)
        });
    }
    drawEllipses(point_set);
    var tree = {
        first: true
    };
    build_kd_tree(0, 0, width - 1, height - 1, point_set, tree);
    if (showGraph) {
        drawTree(tree);
    }
}
