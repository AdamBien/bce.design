# Entity Layer (the E in BCE)

Manages state and data structures. All component state must be maintained here. Reducers handle state transitions. Components auto-update on state changes.

## Data Flow
Boundary → Control → *Entity* → Boundary

Receives actions from control layer. Updates the state via reducers. Notifies subscribed boundary components of state changes.