export function simulation(current_state_buffer: Int32Array, next_state_buffer: Int32Array) {
    // This is the simulation code.
    // It's a simple copy of the current state to the next state.
    next_state_buffer.set(current_state_buffer);
    return next_state_buffer;
}