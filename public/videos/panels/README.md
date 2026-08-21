# Panel background loops

Two looping clips referenced by the Home panels (spec §13.3, §13.6):

- `labs-loop.mp4`    — behind the assistant widget on the Labs panel
- `closing-loop.mp4` — behind the Closing CTA panel

Both render muted, autoplaying and looping, with `playsInline` so iOS does not
take them fullscreen. Until the files exist the `<video>` elements request a
missing path and stay transparent, so the panel shows its plate colour and
nothing breaks — the layout is already reserved.

Encode as H.264 MP4. Keep them small: they play behind text, so detail is
wasted and weight is not. A few seconds, seamlessly looping.
