export default (initialState, handlers) => (
  state = initialState,
  action = {}
) => {
  if (action.hasOwnProperty('type')) {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
    return state;
  }
  return state;
};
