import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/entities/User";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user for profile:", error);
      }
    };
    loadUser();
  }, []);

  if (!user) return <div className="p-8">Loading profile...</div>;

  const profileImageUrl = user.profilePic;

  const handleEditClick = () => {
    setEditFullName(user.full_name || "");
    setEditProfilePic(null);
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("full_name", editFullName);
      if (editProfilePic) {
        formData.append("profilePic", editProfilePic);
      }
      
      const updatedUser = await User.updateProfile(user.id || user._id, formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          {!isEditing && (
            <button onClick={handleEditClick} className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors">
              Edit Profile
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start md:items-center gap-6 flex-col md:flex-row">
            <div className="relative">
              {isEditing && editProfilePic ? (
                <img src={URL.createObjectURL(editProfilePic)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                  {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-sm transition-colors"
                  title="Change picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditProfilePic(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4 w-full max-w-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={editFullName} 
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name || 'No Name Set'}</h2>
                  <p className="text-gray-500 capitalize">{user.role} Account</p>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account ID</label>
              <p className="text-gray-900 font-medium text-sm">{user.id || user._id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Authentication Method</label>
              <p className="text-gray-900 font-medium">
                {user.googleId ? 'Google OAuth 2.0' : 'Email/Password (JWT)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
