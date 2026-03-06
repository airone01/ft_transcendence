# @transc/ui

This package exposes svelte components to re-use through the app, as well as some conveninent hooks to make web dev easier.

## Description

These components were intially instanciated from [shadcn-svelte](https://www.shadcn-svelte.com/), a port of [shadcn's ui component system](https://ui.shadcn.com/).

These components have been subject to some edits specific to the project, ranging from smaller ones to new properties or overhauls of their functionnalities.

The package also contains some home-made components.

## Usage

Import a component in the web app, and use it as defined.
If the component has special properties or functionnalities, comments in the source file should define them.
It is recommended to import from the defined alias rather than the full file path, for readability.

```ts
import { Card, CardDescription, CardHeader, CardTitle } from "@transc/ui/card";
```

