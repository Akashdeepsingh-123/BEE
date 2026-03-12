import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Notification } from '@/entities/Notification';
import { Faculty } from '@/entities/Faculty';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('published');
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        // Determine app role
        if (currentUser.role === 'admin') {
          currentUser.app_role = 'admin';
        } else {
          const facultyProfile = await Faculty.filter({ email: currentUser.email });
          if (facultyProfile.length > 0) currentUser.app_role = 'faculty';
          else currentUser.app_role = 'student';
        }
        
        setUser(currentUser);
        loadNotifications();
      } catch (error) {
        console.error("Error loading user:", error);
      }
      setLoading(false);
    };
    loadData();
    const onChanged = (e) => {
      if (!e.detail || e.detail.name === 'Notification') {
        loadNotifications();
      }
    };
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await Notification.list('-created_date');
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!user || !newNotification.title || !newNotification.message) return;

    try {
      const notificationData = {
        ...newNotification,
        sender_name: user.full_name || user.email,
        sender_role: user.app_role,
        status: user.app_role === 'admin' ? 'published' : 'pending_approval'
      };

      await Notification.create(notificationData);
      
      if (user.app_role === 'faculty') {
        alert('Notification submitted for admin approval');
      } else {
        alert('Notification published successfully');
      }
      
      setShowForm(false);
      setNewNotification({ title: '', message: '' });
      loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleApproveNotification = async (notificationId) => {
    try {
      await Notification.update(notificationId, {
        status: 'published',
        approved_by: user.email,
        approved_date: new Date().toISOString()
      });
      alert('Notification approved and published');
      loadNotifications();
    } catch (error) {
      console.error('Error approving notification:', error);
    }
  };

  const handleRejectNotification = async (notificationId) => {
    if (confirm('Are you sure you want to reject this notification?')) {
      try {
        await Notification.update(notificationId, {
          status: 'rejected'
        });
        alert('Notification rejected');
        loadNotifications();
      } catch (error) {
        console.error('Error rejecting notification:', error);
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await Notification.delete(id);
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canPost = user && (user.app_role === 'admin' || user.app_role === 'faculty');
  const isAdmin = user && user.app_role === 'admin';

  // Filter notifications based on user role and selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (user?.app_role === 'student') {
      return notification.status === 'published';
    }
    
    if (user?.app_role === 'faculty') {
      if (filterStatus === 'my_notifications') {
        return notification.sender_name === (user.full_name || user.email);
      }
      return notification.status === filterStatus;
    }
    
    // Admin can see all notifications
    return filterStatus === 'all' || notification.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {user?.app_role === 'student' ? 'Updates and announcements from the university' : 
               user?.app_role === 'faculty' ? 'Manage your notifications and view published announcements' :
               'Manage all university notifications and approvals'}
            </p>
          </div>
          {canPost && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancel' : 'Create Notification'}
            </Button>
          )}
        </div>

        {/* Filter Options */}
        {(isAdmin || user?.app_role === 'faculty') && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin && <SelectItem value="all">All Notifications</SelectItem>}
                    <SelectItem value="published">Published</SelectItem>
                    {isAdmin && <SelectItem value="pending_approval">Pending Approval</SelectItem>}
                    {isAdmin && <SelectItem value="rejected">Rejected</SelectItem>}
                    {user?.app_role === 'faculty' && <SelectItem value="my_notifications">My Notifications</SelectItem>}
                  </SelectContent>
                </Select>
                {isAdmin && filterStatus === 'pending_approval' && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {notifications.filter(n => n.status === 'pending_approval').length} Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && canPost && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>
                {user?.app_role === 'faculty' ? 'Create Notification (Requires Admin Approval)' : 'Send a New Notification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="e.g., Exam Schedule Update"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter the full notification text here..."
                    required
                    rows={4}
                  />
                </div>
                {user?.app_role === 'faculty' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-700">
                        Your notification will be sent to admin for approval before being published to students.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="submit">
                    {user?.app_role === 'faculty' ? 'Submit for Approval' : 'Send Notification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <Card key={notification.id} className="shadow-md border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{notification.title}</CardTitle>
                      <Badge className={getStatusColor(notification.status)}>
                        {(notification.status || 'draft').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      <span>By: {notification.sender_name || 'Unknown'}</span>
                      <Badge variant="secondary" className="capitalize">{notification.sender_role || 'unknown'}</Badge>
                      <span>{format(new Date(notification.created_date), 'MMM dd, yyyy, p')}</span>
                      {notification.approved_date && (
                        <span>Approved: {format(new Date(notification.approved_date), 'MMM dd')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Admin approval actions */}
                    {isAdmin && notification.status === 'pending_approval' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveNotification(notification.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectNotification(notification.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {/* Delete button for admins or notification owners */}
                    {(isAdmin || (user?.app_role === 'faculty' && notification.sender_name === (user.full_name || user.email))) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                  {notification.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">This notification was rejected and is not visible to students.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Notifications Found</h3>
              <p>
                {user?.app_role === 'student' ? 'Check back later for updates and announcements.' : 
                 filterStatus === 'pending_approval' ? 'No notifications pending approval.' :
                 'No notifications found for the selected filter.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}