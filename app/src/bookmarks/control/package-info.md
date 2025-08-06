# Control Layer (the C in BCE)

Forwards user interactions to state management. Defines actions that trigger state transitions.

## Data Flow
Boundary → *Control* → Entity → Boundary

Defines actions that encapsulate user intentions and presentation logic. Actions are dispatched to entity layer for state updates.