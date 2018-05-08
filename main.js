const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
    var orderedDiscussions = [];
    canvas.get(`/api/v1/courses/${course.info.canvasOU}/discussion_topics`, (err, discussions) => {
        if (err) {
            course.error(new Error(err));
            stepCallback(null, course);
            return;
        }
        var weekNum = '';
        discussions.forEach(discussion => {
            /* Determine whether to run action() or not */
            weekNum = discussion.title.slice(0, 3);

            /* If the prefix is one digit with a '0' prefix, grab the single digit as the position */
            if (/^w0\d$/i.test(weekNum)) {
                weekNum = discussion.title[2];
                /* If the prefix is two digits, grab both as the position */
            } else if (/^w\d\d$/i.test(weekNum)) {
                weekNum = discussion.title[1] + discussion.title[2];
            }
            orderedDiscussions.push({
                'weekNum': weekNum,
                'title': discussion.title,
                'id': discussion.id,
            });
            orderedDiscussions.sort((a, b) => {
                return a.weekNum - b.weekNum;
            });
        });
        // console.log(orderedDiscussions);
        var order = [];
        var reversed = orderedDiscussions.reverse();
        reversed.forEach(discussion => {
            order.push(discussion.id);
        });

        console.log(order);
        canvas.postJSON(`/api/v1/courses/${course.info.canvasOU}/discussion_topics/reorder`, {
            'order[]': order
        }, (err) => {
            if (err) {
                course.error(new Error(err));
            }
            stepCallback(null, course);
        });
    });
};