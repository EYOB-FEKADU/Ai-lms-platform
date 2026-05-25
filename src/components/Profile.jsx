import React, { useState } from 'react';
import { updateUserProfile, uploadProfilePicture } from '../api';

const Profile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    grade: user?.grade || user?.profile?.grade || '',
    preferredLanguage: user?.preferredLanguage || user?.profile?.preferredLanguage || 'en'
  });
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || null);

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'አማርኛ (Amharic)' },
    { value: 'om', label: 'Afaan Oromoo' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setLoading(true);
      try {
        await uploadProfilePicture(file);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateUserProfile(formData);
      if (onUpdate) onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    const badges = {
      student: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      instructor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      parent: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      super_admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return badges[user?.role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white">{user?.fullName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-700 rounded-full cursor-pointer shadow-md">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{user?.fullName}</h1>
              <p className="text-purple-100 mt-1">{user?.email}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadge()}`}>
                {user?.role === 'super_admin' ? 'Administrator' : user?.role}
              </span>
            </div>
            <button onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition">
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={formData.email} disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Language</label>
                  <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg">
                    {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Email</p><p className="text-gray-800 dark:text-white">{user?.email}</p></div>
                  <div><p className="text-sm text-gray-500">Phone</p><p className="text-gray-800 dark:text-white">{user?.phone || 'Not provided'}</p></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                <p className="text-sm text-gray-500">Preferred Language</p>
                <p className="text-gray-800 dark:text-white">{languages.find(l => l.value === formData.preferredLanguage)?.label || 'English'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Member Since</p><p className="text-gray-800 dark:text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Role</p><p className="text-gray-800 dark:text-white capitalize">{user?.role}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
