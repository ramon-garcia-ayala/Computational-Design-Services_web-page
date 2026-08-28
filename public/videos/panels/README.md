# Panel background loops

Two looping clips referenced by the Home panels (spec §13.3, §13.6):

- `labs-loop.mp4`    — behind the assistant widget on the Playground panel
  (the filename predates the panel's rename away from `labs` — the panel
  hosts the chat widget and has nothing to do with the separate `/labs`
  route, a placeholder for future experiments)
- `closing-loop.mp4` — behind the Closing CTA panel

Both render muted, autoplaying and looping, with `playsInline` so iOS does not
take them fullscreen. If a file is ever missing, the `<video>` element requests
a 404 and stays transparent, so the panel falls back to its plate colour and
nothing breaks — the layout is already reserved.

Encode as H.264 MP4. Keep them small: they play behind text, so detail is
wasted and weight is not. A few seconds, seamlessly looping.
