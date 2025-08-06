# Boundary Layer (the B in BCE)

UI components that handle user interactions. Web components extend BElement for automatic Redux store subscription. Dispatches control actions on user events and re-renders on state changes.

## Data Flow
*Boundary* → Control → Entity → Boundary

Captures user events and dispatches control actions. Receives state updates from entity layer via Redux subscription. Re-renders automatically when state changes.