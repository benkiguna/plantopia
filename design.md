"We are building a premium, organic botanical app. The vibe is 'High-End Dark Mode Glassmorphism.'

Key constraints for all code:

Materials: No solid backgrounds. Use backdrop-filter: blur(24px) saturate(180%) and background: rgba(255, 255, 255, 0.05).

Edges: Every container must have a 1px solid rgba(255, 255, 255, 0.1) border to catch the light.

Shapes: Use 'Continuous Corner' (squircle) rounding. border-radius: 24px or higher.

Typography: Headers must be Serif (Playfair Display), UI labels must be Sans-serif (Inter) with letter-spacing: 0.05em.

Lighting: Use background radial gradients (Sage Green and Amber) that sit behind the glass to create depth."

Component 1: The "Garden Pulse" Header
Create a React/Tailwind component for the 'Garden Pulse' header.

Specifics:

Use the SVG Clip-Path for an organic wave on the top-right of the card.

Inside the wave, place a thin-line 1px stroke Water Droplet icon.

Stats Layout: Three columns. Left: Large Number + 'PLANTS'. Center: A circular SVG progress ring (78%) with a glowing green stroke. Right: Large Number + 'ALERTS' + a 1px heart icon.

Interaction: The card should have a very subtle hover:translate-y-[-2px] transition to feel light and floating.

Background Glow: Add a div behind the card with bg-emerald-500/20 and blur-3xl to make the glass glow."

"Generate React Lucide-style icons but customized for 1px stroke weight. I need:

A Leaf with a single central vein.

A Water Droplet that is 30% filled with a solid color.

A Heart with sharp, elegant points.

A Plus icon that is just two thin intersecting lines, no box."
