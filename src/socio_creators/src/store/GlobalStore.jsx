import React, { createContext, useEffect, useReducer } from 'react';

const initialState = {
  theme: 'dark',
  screenType: 'desktop',
  actor: null,
  loggedIn: false,
  creator: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SCREEN_TYPE':
      return { ...state, screenType: action.payload };
    case 'SET_ACTOR':
      return { ...state, actor: action.payload };
    case 'SET_LOGGED_IN':
      return { ...state, loggedIn: action.payload };
    case 'SET_CREATOR':
      return { ...state, creator: action.payload };
    default:
      return state;
  }
};

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );

};