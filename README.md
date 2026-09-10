# Prompt Coach

Build the "Prompt Coach" one-page educational web app for beginner higher-ed students to improve generative AI prompts (SDG 4: Quality Education).

Core features and requirements:
1. Inputs: Required learning goal ("What are you trying to learn or make?") and draft prompt textarea ("Paste your draft prompt", max 1,200 chars with live counter). Include "Try an example" button prefilling "Understand Python while loops" and "Help me learn Python."
2. Analysis with native Lovable AI via server-side edge function (no mock/fake data):
   - Evaluates 4 dimensions: Goal, Context, Constraints, Output. Each gets status: Clear, Needs work, or Missing (with icon + text), plus a concise explanation.
   - Feedback groups: "What already works" and "What to improve next".
   - "Coach's example" with copy button that models better prompting without answering the student's assignment.
3. Revision & Comparison flow:
   - "Revise it in your own words" textarea (not pre-filled by coach's example).
   - "Compare my revision" action calling Lovable AI to compare original vs revision: shows improved dimensions, 1 remaining gap, and 1 next tip.
   - "Start over" reset action.
4. Editorial visual design:
   - Colors: Pale icy background (#F6F8FC), deep ink (#122033), crisp cobalt (#315CFF), coral annotation (#F25F4B), muted rule (#D9E1EF), white (#FFFFFF), success teal (#147D6F).
   - Typography: Space Grotesk (display), Manrope (body), IBM Plex Mono (utility labels).
   - Desktop 42% / 58% asymmetric split workspace; mobile stacked interaction order. Signature "Prompt Anatomy" margin-rail visual with subtle staggered reveal (respecting prefers-reduced-motion).
   - Accessible states (loading "Reading your prompt...", aria-live announcements, disabled button states during request, clear error messaging).
5. Footer: "About this learning tool" section covering student audience, non-plagiarism/not a homework solver notice, privacy warning, AI fallibility disclaimer, and SDG 4 credit.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ac47d0b6-311b-4dbb-9035-d0b198e4fd9c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
