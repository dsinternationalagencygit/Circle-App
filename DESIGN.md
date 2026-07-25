# DESIGN.md — Circle (Crisis Reach-Out Engine)

- THE FEEL: 11pm, alone, phone in hand. A dark, low-glare, quiet interface with one warm light in it. The warmth is another person. This is not a wellness app and not a dashboard. It is a room with one lamp on. Dark mode is the only mode, and it is justified by the hour this app is used, not by fashion.

- PALETTE, nothing outside it:
  background #0E1116, surface #161A21, hairline #232935,
  ink #EAEDF2, muted #7C8698,
  amber #F2B25C used ONLY on the chosen contact node, its glow, its connecting line, and the primary button fill,
  red #E5484D used ONLY on the helpline strip and the S4 escalation screen. Red appears nowhere else, so that when it appears it means emergency.

- FONT: "Sora" from Google Fonts, weights 400 and 700 only. 700 for the big moments (the primary button label, question text, contact name on the chosen node). 400 for everything else. Question text at 28px, card body at 16px with line-height 1.6, labels at 11px uppercase with 0.08em tracking in muted.

- LAYOUT: a single centred stage, max-width 720px, generous vertical centring, 24px horizontal padding. The helpline strip is fixed to the bottom of the viewport on every screen, 44px tall, surface background, hairline top border, three tel: rows in red text at 13px. Content never sits under it.

- THE CIRCLE: ring diameter 300px at 375px viewport, up to 380px on desktop. Centre "you" dot 12px filled muted. Contact nodes 64px circles, surface fill, 1px hairline border, name in 13px 700 ink inside, tag summary in 10px muted below the node. Connecting lines 1px hairline, the chosen line 2px amber.

- TAP TILES: full width, 68px tall, surface fill, 1px hairline border, 10px radius, label 16px 700 centred. On press, border goes amber and the tile scales to 0.98. No icons, no emoji anywhere in the app.

- CARDS: surface fill, 1px hairline, 10px radius, 20px padding. Card 1 "SEND THIS" and Card 2 "FOR THEM" both carry an 11px uppercase tracked label in muted. Actions are text buttons in amber, 44px tap height, no filled backgrounds except the one primary button on S2.

- MOTION VOCABULARY (Framer Motion, all of it):
  screen transitions: opacity plus 8px upward slide, 260ms easeOut.
  tap tile press: scale 0.98, spring stiffness 300 damping 20.
  deciding sequence: per node consider pulse scale 1.0 to 1.08 to 1.0 over 220ms, ruled-out nodes animate opacity to 0.25 over 200ms, lines draw via pathLength 0 to 1 over 180ms.
  chosen node: scale to 1.12 with spring stiffness 140 damping 12, then a continuous glow via box-shadow and opacity oscillation, animate opacity [0.75, 1, 0.75] with duration 2, repeat Infinity, easeInOut. This never stops while the screen is open.
  cards: enter staggered 120ms apart, 12px upward slide, 300ms easeOut, starting 400ms after the chosen node settles.
  escalation screen: no motion at all. It arrives instantly and sits still. Stillness here is deliberate.
  Everything respects prefers-reduced-motion: with it enabled, the deciding sequence resolves immediately to the final state and the glow becomes a static amber fill.

- FORBIDDEN: gradients, glassmorphism, blur effects, icons, emoji, illustrations, purple, green, blue accents, more than one accent colour, shadows other than the single amber glow, corner radius above 12px, light mode, any default Bootstrap or Material look, progress bars, streaks, confetti, and em dashes anywhere in any copy or generated text.

- COPY RULES: sentence case, plain short sentences, second person. Never the words "addict", "addiction", "relapse", "sober", "journey", or "wellness". Never clinical language. The primary button reads exactly "I need someone". Empty states are invitations, never apologies. Errors state what happened and what to do next in one line.

- QUALITY FLOOR: visible keyboard focus rings in amber on every interactive element, semantic buttons not divs, aria-labels on all actions, contrast checked for ink and muted on the dark surfaces, full keyboard navigation, works at 375px and at 1280px.
