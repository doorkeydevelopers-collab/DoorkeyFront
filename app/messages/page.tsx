'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Header } from '@/components/custom/Header';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  Circle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

interface ConversationItem {
  id: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  otherUser: { name: string; email: string };
  unread: number;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readBy: string[];
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userId = (user as any)?.sub || (user as any)?.id || '';

  // Connect socket
  useEffect(() => {
    if (!userId) return;

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('join', userId);
    });

    s.on('newMessage', (message: MessageItem) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    s.on('messageNotification', (data: { conversationId: string; message: MessageItem }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.message.content, unread: c.unread + 1, lastMessageAt: data.message.createdAt }
            : c
        )
      );
    });

    s.on('userTyping', () => setIsTyping(true));
    s.on('userStoppedTyping', () => setIsTyping(false));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('doorkey_auth_token');
        const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error('Fetch conversations error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Auto-select conversation from URL params
  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === convId);
      if (conv) selectConversation(conv);
    }
  }, [searchParams, conversations]);

  const selectConversation = async (conv: ConversationItem) => {
    setSelectedConv(conv);
    setMessages([]);

    // Join socket room
    if (socket && selectedConv) {
      socket.emit('leaveConversation', selectedConv.id);
    }
    socket?.emit('joinConversation', conv.id);
    socket?.emit('markRead', conv.id);

    // Reset unread
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );

    // Fetch messages
    try {
      const token = localStorage.getItem('doorkey_auth_token');
      const res = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conv.id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !selectedConv || !socket) return;

    setIsSending(true);
    socket.emit('sendMessage', {
      conversationId: selectedConv.id,
      content: newMessage.trim(),
      senderName: (user as any)?.name || user?.fullName || user?.email || 'User',
    });

    setNewMessage('');
    setIsSending(false);

    // Stop typing indicator
    socket.emit('stopTyping', { conversationId: selectedConv.id });
  }, [newMessage, selectedConv, socket, user]);

  const handleTyping = () => {
    if (!socket || !selectedConv) return;

    socket.emit('typing', { conversationId: selectedConv.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { conversationId: selectedConv.id });
    }, 2000);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 max-w-6xl py-6">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <Card className="overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${
                selectedConv ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start a conversation by contacting a property owner
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b ${
                        selectedConv?.id === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conv.otherUser.name}</p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        {conv.propertyTitle && (
                          <p className="text-xs text-primary truncate">{conv.propertyTitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                          {conv.unread > 0 && (
                            <Badge variant="default" className="h-5 min-w-[20px] text-[10px] shrink-0">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div
              className={`flex-1 flex flex-col ${
                selectedConv ? 'flex' : 'hidden md:flex'
              }`}
            >
              {selectedConv ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden shrink-0"
                      onClick={() => setSelectedConv(null)}
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(selectedConv.otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{selectedConv.otherUser.name}</p>
                      {selectedConv.propertyTitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          Re: {selectedConv.propertyTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === userId;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-0.5 opacity-70">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                          <div className="flex gap-1 items-center">
                            <Circle className="h-2 w-2 fill-muted-foreground animate-bounce [animation-delay:0ms]" />
                            <Circle className="h-2 w-2 fill-muted-foreground animate-bounce [animation-delay:150ms]" />
                            <Circle className="h-2 w-2 fill-muted-foreground animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t bg-background">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        className="flex-1"
                        disabled={isSending}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || isSending}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/40 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Select a conversation from the sidebar to start messaging, or contact a property owner to begin a new chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
        <MessagesContent />
      </React.Suspense>
    </ProtectedRoute>
  );
}
