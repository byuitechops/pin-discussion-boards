# Pin Discussion Boards
### *Package Name*: pin-discussion-boards
### *Child Type*: postimport
### *Platform*: all
### *Required*: Recommended

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions. You can view extended documentation [Here](https://github.com/byuitechops/d2l-to-canvas-conversion-tool/tree/master/documentation).

## Purpose

Boards organize by most recently viewed, rather than in order. Pinning them keeps them in order. This child module pins the discussion boards in order, so they don't move around for the user.

## How to Install

```
npm install pin-discussion-boards
```

## Run Requirements

None

## Options

None

## Outputs

None

## Process

1. GET all of the discussions
2. Determine which discussions are to be pinned (Those that are accessible to students via the Modules tab)
3. Arrange the discussions in the correct order
4. Make a PUT request to pin all of the specified discussions
5. POST the correct order of the discussions to Canvas

## Log Categories

- Pinned discussion to Canvas
- Reordered Pinned Discussions

## Requirements

The discussions that have module items are to be 'pinned' and put in order by week (i.e. W01 - W14) 