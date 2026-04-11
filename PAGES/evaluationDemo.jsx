import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io } from 'socket.io-client';

export default function EvaluationDemo() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [apiResult, setApiResult] = useState('No API called yet');

  useEffect(() => {
    // Initialize Socket connection
    const newSocket = io('/'); // Will proxy to backend via Vite
    setSocket(newSocket);

    newSocket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (socket && currentMessage.trim()) {
      socket.emit('sendMessage', currentMessage);
      setCurrentMessage('');
    }
  };

  const callApi = async (url, method = 'GET', body = null) => {
    setApiResult('Loading...');
    try {
      const options = { method, headers: {} };
      
      const rawUser = localStorage.getItem('sms:currentUser');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user.token) {
          options.headers['Authorization'] = `Bearer ${user.token}`;
        }
      }

      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
      const response = await fetch(url, options);
      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Based Evaluation Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Duplex Communication with Socket.IO */}
        <Card>
          <CardHeader>
            <CardTitle>Socket.IO Chat (Full Duplex Communication)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 h-48 overflow-y-auto rounded mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <span className="font-bold text-blue-600">[{msg.id.substring(0, 5)}]: </span>
                  {msg.message}
                </div>
              ))}
              {messages.length === 0 && <p className="text-gray-500">No messages yet...</p>}
            </div>
            <div className="flex gap-2">
              <Input 
                value={currentMessage} 
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>

        {/* API Testing Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>API & Backend Testing Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" onClick={() => callApi('/api/demo/set-session')}>Set Session/Cookie</Button>
              <Button variant="outline" onClick={() => callApi('/api/demo/get-session')}>Get Session/Cookie</Button>
              <Button variant="outline" onClick={() => callApi('/api/demo/blocking')}>Test Blocking Code</Button>
              <Button variant="outline" onClick={() => callApi('/api/demo/non-blocking')}>Test Non-Blocking Code</Button>
              <Button variant="outline" onClick={() => window.open('/ssr-demo', '_blank')}>Open SSR View (EJS)</Button>
              <Button variant="outline" onClick={() => window.open('/api/demo/stream-static', '_blank')}>Test File Stream</Button>
              <Button variant="outline" onClick={() => callApi('/api/demo/error-test')}>Trigger Error Middleware</Button>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Authentication (Bcrypt + JWT + Mongoose)</h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => callApi('/api/demo/register', 'POST', { email: `test${Date.now()}@example.com`, password: 'password123' })}>Register Dummy User</Button>
                <Button variant="secondary" onClick={() => callApi('/api/demo/login', 'POST', { email: 'admin@academiahub.com', password: 'wrongpassword' })}>Login (Test Bcrypt Fail)</Button>
                <Button variant="secondary" onClick={() => callApi('/api/demo/protected')}>Test Protected Route (JWT)</Button>
              </div>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap overflow-auto h-40">
              {apiResult}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
