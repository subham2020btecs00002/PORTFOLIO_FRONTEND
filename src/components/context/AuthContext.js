import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import {baseUrl} from '../url'

// Context
const AuthContext = createContext();

// Initial State
const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  loading: true,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    default:
      return state;
  }
};

// Provider Component
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = useCallback(
    debounce(async () => {
      if (localStorage.token && !state.user) {
        try {
          const res = await axios.get(`${baseUrl}/api/auth/user`, {
            headers: {
              'x-auth-token': localStorage.token,
            },
          });
          dispatch({
            type: 'USER_LOADED',
            payload: res.data,
          });
        } catch (err) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      }
    }, 300), // Adjust the debounce delay as needed
    [state.user]
  );

  // Register User
  const register = async (formData) => {
    try {
      await axios.post(`${baseUrl}/api/auth/register`, formData);
      toast.success('Registration successful! Please login.');
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      toast.error('Registration failed!');
    }
  };

  // Login User
  const login = async (formData) => {
    try {
      const res = await axios.post(`${baseUrl}/api/auth/login `, formData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data,
      });
      loadUser(); // Load user after login
      toast.success('Login successful!');
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      toast.error('Login failed!');
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    if (localStorage.token && !state.user) {
      loadUser();
    }
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        register,
        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
