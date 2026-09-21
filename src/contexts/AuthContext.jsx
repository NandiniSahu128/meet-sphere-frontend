import React, { createContext, useState } from 'react';
import server from '../utils/server';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const handleRegister = async (name, username, password) => {
    try {
      const response = await fetch(`${server}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${server}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        setUserData({ username, token: data.token });
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await fetch(`${server}/api/v1/users/get_all_activity?token=${token}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch history');
      }
      return data;
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${server}/api/v1/users/add_to_activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, meeting_code: meetingCode }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error adding meeting to history:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

