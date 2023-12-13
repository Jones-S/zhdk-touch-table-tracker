# Token Tracker App

This app serves as an intermediate proxy layer between a touch table application and the reacTIVision app: https://reactivision.sourceforge.net/

The reacTIVision app sends marker information via OSC signal (TUIO respectively): https://www.tuio.org/?specification

The Token Tracker app sets up server to listen to the UDP protocol receiving the OSC messages.
At the same time it sets up a websocket server on port 6050 and acts as a proxy, sanitizing and forwarding the messages (sending them as JSON in a more readable format).

## Calibration

## Axis inversion

Depending on the camera (built in vs. external) you might have to change the settings within the reacTIVision app. A built in laptop camera does not need any axes inversions. On the 4k camera for the table we need to set X-Axis inversion to 1.

Then you open the tracker app and take a photo. Make sure to place the tokens exactly at the edge of the screen. Due to perspective distortion, you might have to place the edges a bit more on the outside, especially if the token is very high and not lying directly on the screen.

```
Touch table without axis inversion:

1/0 ============= 0/0
    |            |
    |            |
    |            |
1/1 ============= 0/1
```

```
Touch table without x-axis inversion:

0/0 ============= 1/0
    |            |
    |            |
    |            |
0/1 ============= 1/1
```

No need to invert axis in tracker app...
as soon as table x-axis is inverted we are OK.

```
Macbook cam without axis inversion:

0/0 ============= 1/0
    |            |
    |            |
    |            |
0/1 ============= 1/1
```

## Building and Distribution

The app is built with electron-builder. When sending a ZIP or DMG installer to somebody, the app will not work because of OS X quarantine.

To disable the quarantine do this:

```bash
# disable the quarantine set by GateKeeper in macOS
$ xattr -cr /Users/[filePath]/Token\ Tracker.app
```

## Message and Message formats

The incoming messages look like this:

```json
{ "address": "/tuio/2Dobj", "args": ["fseq", 44] }
```

```json
{ "address": "/tuio/2Dobj", "args": ["source", "reacTIVision"] }
```

```json
{ "address": "/tuio/2Dobj", "args": ["alive", 12, 14] }
```

```json
{
  "address": "/tuio/2Dobj",
  // more about these arguments -> https://www.tuio.org/?specification -> Attributes
  "args": ["set", 1, 2, 0.9206402897834778, 0.6420745849609375, 2.2742528915405273, 0, 0, 0, -0, -0]
}
```

The forwarded messages look like this:

```json
// sent if the session ids within the alive message type change
{ type: '/tracker/add', args: { sessionId: 4 } }

{ type: '/tracker/remove', args: { sessionId: 4 } }
```

```json
{
  "type": "/tracker/update",
  "args": {
    "sessionId": 2,
    "id": 2,
    "x": 0.6030212044715881, // the reacTIVision app does not send absolute x and y positions
    "y": 0.41140735149383545,
    "relativeX": 0.6030212044715881,
    "relativeY": 0.41140735149383545,
    "rotation": 156.60326030896937
  }
}
```

```

```
