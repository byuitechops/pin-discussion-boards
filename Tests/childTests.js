/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');

module.exports = (course, callback) => {
    tap.test('pin-discussion-boards', (test) => {

        /* Get all of the discussions */
        canvas.get(`/api/v1/courses/${course.info.canvasOU}/discussion_topics`, (err, discussions) => {
            if (err) {
                getCallback(err);
                return;
            }
            /* Two test cases. If the discussion being tested matches one of 
            the test cases, and is in the correct position, then the test passes */
            discussions.forEach(discussion => {
                if (discussion.title === 'W03 Discussion: Another test for Pin Discussion Boards') {
                    test.equal(1, discussion.position);
                }
                if (discussion.title === 'W06 Discussion: Pin Discussion Boards') {
                    test.equal(2, discussion.position);
                }
            });

            test.end();
        });
    });

    // Always call the callback in your childTests with just null
    callback(null);
};