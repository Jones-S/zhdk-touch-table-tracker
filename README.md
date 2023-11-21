# Token Tracker App

This app serves as an intermediate proxy layer between a touch table application and the reacTIVision app: https://reactivision.sourceforge.net/

The reacTIVision app sends marker information via OSC signal (TUIO respectively): https://www.tuio.org/?specification

The Token Tracker app sets up server to listen to the UDP protocol receiving the OSC messages.
At the same time it sets up a websocket server on port 6050 and acts as a proxy, sanitizing and forwarding the messages (sending them as JSON in a more readable format).

## Building and Distribution

The app is built with electron-builder. When sending a ZIP or DMG installer to somebody, the app will not work because of OS X quarantine.

To disable the quarantine do this:

```bash
# disable the quarantine set by GateKeeper in macOS
$ xattr -cr /Users/[filePath]/Token\ Tracker.app
```

## Message and Message formats

The incoming messages look like this:

```JSON
{ address: '/tuio/2Dobj', args: [ 'fseq', 44 ] }

```

```JSON
{ address: '/tuio/2Dobj', args: [ 'source', 'reacTIVision' ] }
```

```JSON
{ address: '/tuio/2Dobj', args: [ 'alive', 12, 14 ] }
```

```JSON
{
  address: '/tuio/2Dobj',
  // more about these arguments -> https://www.tuio.org/?specification -> Attributes
  args: [
    'set',
    1,
    2,
    0.9206402897834778,
    0.6420745849609375,
    2.2742528915405273,
    0,
    0,
    0,
    -0,
    -0
  ]
}
```

The forwarded messages look like this:

```JSON
// sent if the session ids within the alive message type change
{ type: '/tracker/add', args: { sessionId: 4 } }

{ type: '/tracker/remove', args: { sessionId: 4 } }
```

```JSON
{
  type: '/tracker/update',
  args: {
    sessionId: 2,
    id: 2,
    x: 0.6030212044715881, // the reacTIVision app does not send absolute x and y positions
    y: 0.41140735149383545,
    relativeX: 0.6030212044715881,
    relativeY: 0.41140735149383545,
    rotation: 156.60326030896937
  }
}
```
