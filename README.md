<p align="center">
<img width="453.5" height="106" src="public/av-logo.svg">
</p>

---

# Ground Station GUI — Version 3

This is a basic React application built with Vite. It is a single page app that is served by the ground station computer, which also runs the backend server. It communicates with the backend via the [Yamcs HTTP API](https://docs.yamcs.org/yamcs-http-api/).

## Card Architecture

The UI is made up of cards that can be configured by the user to meet their needs. For this reason, the entire UI is very modular, focusing on the functionality of individual cards. The general structure of a card is the following, with one folder per card:

```
cards/exampleCard/
        ├── ExampleCard.tsx
        └── schema.ts
```

`ExampleCard.tsx` defines the markup that will be used to actually render the card — this is all of the react functionality.

`schema.ts` is what defines the input parameters for the card. Usually cards will need some sort of input, i.e. a parameter to display or command to send. Here, you can define a js object with [Zod](https://zod.dev/) and it will then be used to generate both a form for creating the card and the necessary types for the React component.

## Getting Started

```bash
git clone https://github.com/McGillRocketTeam/groundstation-frontend-v3
cd groundstation-frontend-v3
npm install
npm run dev
```

This will get the frontend React app running but most functionality will not work without running [the backend](https://github.com/McGillRocketTeam/groundstation-backend-2025) as well.
