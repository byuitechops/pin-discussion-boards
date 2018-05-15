/***********************************************************************
 * Pin Discussion Boards
 * Boards organize by most recently viewed, rather than in order. 
 * Pinning them keeps them in order. This child module pins the 
 * discussion boards in order, so they don't move around for the user.
 ***********************************************************************/
const canvas = require('canvas-wrapper');
const asyncLib = require('async');

module.exports = (course, stepCallback) => {
    var validPlatforms = ['online', 'pathway', 'campus'];
    if (!validPlatforms.includes(course.settings.platform)) {
        course.message('Invalid platform. Skipping child module');
        stepCallback(null, course);
        return;
    }

    /****************************************************
     * getDiscussions
     * Get the list of discussions from Canvas
     ****************************************************/
    function getDiscussions(getCallback) {
        canvas.get(`/api/v1/courses/${course.info.canvasOU}/discussion_topics`, (err, discussions) => {
            if (err) {
                getCallback(err);
                return;
            }
            getCallback(null, discussions);
        });
    }

    /***********************************************************************
     * orderDiscussions
     * Put the discussion boards in the order they should appear in Canvas
     ***********************************************************************/
    function orderDiscussions(discussions, orderCallback) {
        var weekNum = '';
        var discussionsInfo = [];

        discussions.forEach(discussion => {
            /* Get the week number from the discussion title */
            weekNum = discussion.title.slice(0, 3); // W04 Discussion: Icebreaker => W04

            if (/^w0\d$/i.test(weekNum)) {
                /* If the prefix is one digit with a '0' prefix, grab the single digit as the position */
                weekNum = discussion.title[2]; // W04 => 4

                /* Push the discussion's info in the form of an object */
                discussionsInfo.push({
                    'weekNum': weekNum,
                    'title': discussion.title,
                    'id': discussion.id,
                });
            } else if (/^w\d\d$/i.test(weekNum)) {
                /* If the prefix is two digits, grab both as the position */
                weekNum = discussion.title[1] + discussion.title[2]; // W12 => 12

                /* Push the discussion's info in the form of an object */
                discussionsInfo.push({
                    'weekNum': weekNum,
                    'title': discussion.title,
                    'id': discussion.id,
                });
            }

            /* Sort the array of discussionsInfo according to week number */
            discussionsInfo.sort((a, b) => {
                return a.weekNum - b.weekNum;
            });
        });

        orderCallback(null, discussionsInfo);
    }

    /****************************************************
     * pinDiscussions
     * Set each discussion board to 'pinned' on Canvas
     ****************************************************/
    function pinDiscussions(discussionsInfo, pinCallback) {
        /* order should only have the IDs of the discussions to be pinned, in their correct order */
        var order = [];
        discussionsInfo.forEach(discussion => {
            order.push(discussion.id);
        });

        asyncLib.eachSeries(discussionsInfo, (discussion, eachCallback) => {
            canvas.put(`/api/v1/courses/${course.info.canvasOU}/discussion_topics/${discussion.id}`, {
                'pinned': true
            }, (err) => {
                if (err) {
                    eachCallback(err);
                    return;
                }
                /* Log which discussions were pinned */
                course.log(`Pinned discussion to Canvas`, {
                    'ID': discussion.id,
                    'Title': discussion.title
                });

                eachCallback(null);
            });
        }, (err) => {
            if (err) {
                pinCallback(err);
                return;
            }

            if (order.length === 0) {
                course.warning(`Order is empty. There may not be discussions that are module items`);
                stepCallback(null, course);
                return;
            }
            /* Might have to call this outside of the eachSeries */
            pinCallback(null, order);
        });
    }


    /*********************************************
     * postDiscussions
     * Post the ordered discussions to Canvas
     *********************************************/
    function postDiscussions(order, postCallback) {
        canvas.postJSON(`/api/v1/courses/${course.info.canvasOU}/discussion_topics/reorder`, {
            'order': order
        }, (err) => {
            if (err) {
                postCallback(err);
                return;
            }
            postCallback(null, order);
        });
    }

    /*********************************************
     *                Start Here                 *
     *********************************************/
    var myFunctions = [
        getDiscussions,
        orderDiscussions,
        pinDiscussions,
        postDiscussions,
    ];

    if (course.settings.pinDiscussionBoards === true) {
        asyncLib.waterfall(myFunctions, (waterfallErr, order) => {
            if (waterfallErr) {
                course.error(waterfallErr);
            } else {
                /* Log the new order of the discussions */
                course.log(`Reordered Pinned Discussions`, {
                    'Order of IDs': order.toString()
                });
            }
            stepCallback(null, course);
        });
    } else {
        stepCallback(null, course);
    }
};