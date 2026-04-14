# QuantumViz

QuantumViz is a React-based interactive visualization prototype for exploring how common single-qubit gates move qubit states across a custom 2D diagram.

The project is aimed at intuition and visual learning rather than full quantum-circuit simulation. It combines React for the UI, D3 for SVG drawing and animation, and styled-components for the interface styling.

## High-Level Overview

This repository contains a small frontend app centered around one main idea: represent qubits as colored points, let the user apply gates to them, and animate how those gates change each qubit's position in the visualization.

At the moment, the app is best understood as a prototype or teaching tool. It already has an interactive gate palette, animated state transitions, and support for multiple qubits, but it does not yet implement a full routing structure or a complete quantum simulation engine.

## How to Start It

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

## What It Does

When the app starts, it renders a header and a single main visualization view.

The visualization currently supports:

- A sidebar of draggable gates: `Pauli X`, `Pauli Y`, `Pauli Z`, `S Gate`, `P Gate`, `T Gate`, and `Hadamard`
- A D3-based SVG diagram showing a custom state-space layout
- Multiple qubits represented as colored points
- Per-qubit drop zones where gates can be applied
- Animated point movement when a gate is dropped onto a qubit
- A color picker for each qubit
- A button to add additional qubits
- Tooltips when qubits overlap at the same position

## Current Scope

This app currently focuses on visualizing gate effects through predefined animation rules. It is not yet a full-featured quantum circuit editor or simulator.

Areas that are still prototype-level include:

- Default CRA scaffold pieces that have not been fully customized
- Header navigation without matching route pages
- Minimal automated testing
