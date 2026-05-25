import React, { createContext, useState, useContext, useEffect } from 'react';
import { updateUserProfile, uploadProfilePicture, getUserProfile, getCurrentUser } from '../api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        try {
          // Try to get fresh data from server
          const freshUser = await getUserProfile();
          const mergedUser = { ...currentUser, ...freshUser };
          setUser(mergedUser);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch (error) {
          console.error('Failed to fetch fresh user data:', error);
          setUser(currentUser);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await updateUserProfile(updatedData);
      if (response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        return updatedUser;
      }
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const handleUpdateProfilePicture = async (file) => {
    try {
      const response = await uploadProfilePicture(file);
      if (response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        return updatedUser;
      }
      return response;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      updateUserProfile: handleUpdateProfile, 
      updateProfilePicture: handleUpdateProfilePicture, 
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};