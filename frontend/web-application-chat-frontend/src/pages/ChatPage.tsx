// src/pages/ChatPage.tsx - VERSION AMÉLIORÉE AVEC BOUTON POUR AFFICHER/MASQUER LA LISTE DES PARTICIPANTS
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, type Message, type ChatRoom, type ChatParticipant } from '../services/api/chat'; 
import toast from 'react-hot-toast';

// MUI Components
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Drawer,
  Badge,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  ListItemButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  ContentCopy as ContentCopyIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  People as PeopleIcon,
  PeopleOutlined as PeopleOutlinedIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
// Option 2: Separate imports
import EmailIcon from '@mui/icons-material/Email';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import { chatWebSocket } from '../services/chatWebsocket';
import { type MessageResponse } from '../types';

export type MessageStatusType = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

// ==================== FORMATAGE DES DATES (WhatsApp/Telegram Style) ====================

// Formater l'heure seule (14:30)
const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '--:--';
    }
    
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
};

// Formater la date pour les séparateurs de groupe (comme WhatsApp)
const formatDateForGroup = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isNaN(date.getTime())) {
      return 'Date inconnue';
    }

    // Réinitialiser les heures pour la comparaison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Aujourd'hui
    if (dateStart.getTime() === todayStart.getTime()) {
      return "Aujourd'hui";
    } 
    // Hier
    else if (dateStart.getTime() === yesterdayStart.getTime()) {
      return 'Hier';
    }
    // Cette semaine (les 7 derniers jours)
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
    
    // Cette année
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long'
      });
    }
    
    // Plus ancien
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date for grouping:', error);
    return 'Date';
  }
};

// Formater la date et l'heure complète (pour tooltip ou détails)
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Date invalide';
  }
};

// Fonction pour regrouper les messages par date (chronologie inversée - récents en bas)
const groupMessagesByDate = (messages: Message[]): { date: string; messages: Message[] }[] => {
  // D'abord, trier les messages par date croissante (plus ancien en premier)
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });

  const groups: { [key: string]: Message[] } = {};
  
  sortedMessages.forEach(message => {
    // Utiliser time_stamp de la BDD si disponible, sinon createdAt
    const dateValue = message.createdAt;
    const dateKey = new Date(dateValue).toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  // Trier les groupes par date (plus ancien en premier)
  return Object.entries(groups)
    .map(([dateKey, msgs]) => ({
      date: formatDateForGroup(msgs[0].createdAt),
      messages: msgs.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      })
    }))
    .sort((a, b) => {
      const dateA = new Date(a.messages[0].createdAt);
      const dateB = new Date(b.messages[0].createdAt);
      return dateA.getTime() - dateB.getTime();
    });
};

// Fonction pour obtenir les initiales d'un utilisateur
const getInitials = (email?: string): string => {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
};

// Fonction pour obtenir une couleur d'avatar basée sur l'ID
const getAvatarColor = (userId: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];
  return colors[userId % colors.length];
};

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ==================== STATES ====================
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoomsDrawer, setShowRoomsDrawer] = useState(false);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  
  // WebSocket States
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [messageStatus, setMessageStatus] = useState<Record<number, MessageStatusType>>({});
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);

  // UI States
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    message?: Message;
  } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  
  // Nouvelles fonctionnalités
  const [selectedParticipant, setSelectedParticipant] = useState<ChatParticipant | null>(null);
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [isUserParticipant, setIsUserParticipant] = useState(false);
  const [userRooms, setUserRooms] = useState<ChatParticipant[]>([]);
  const [canCreateRoom, setCanCreateRoom] = useState(false);
  
  // Nouvel état pour afficher/masquer la liste des participants
  const [showParticipantsSidebar, setShowParticipantsSidebar] = useState(true);

  // Corriger le mapping des dates depuis la BDD
  const mapMessageResponseToMessage = (dto: MessageResponse): Message => {
    console.log('🔄 Mapping message DTO:', {
      dtoId: dto.id,
      timestamp: dto.timestamp
    });
    
    // Priorité: time_stamp (BDD) > timestamp > createdAt
    const dateValue = dto.timestamp;
    
    return {
      id: dto.id,
      content: dto.content,
      senderId: dto.sender?.id,
      sender: dto.sender,
      chatRoomId: dto.chatRoomId,
      // Stocker time_stamp pour référence
      createdAt: dateValue,
      updatedAt: dateValue,
      isDeleted: dto.isDeleted,
    };
  };

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // ==================== VÉRIFIER LES PERMISSIONS DE L'UTILISATEUR ====================
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) return;
      
      // Vérifier si l'utilisateur est admin
      setCanCreateRoom(user.role === 'ADMIN');
      
      // Charger les salons de l'utilisateur
      try {
        const response = await chatApi.getRoomsForUser(user.id);
        setUserRooms(response.data || []);
      } catch (error) {
        console.error('Error loading user rooms:', error);
      }
    };
    
    checkUserPermissions();
  }, [user]);

  // ==================== VÉRIFIER SI L'UTILISATEUR EST PARTICIPANT DU SALON ====================
  useEffect(() => {
    const checkIfUserIsParticipant = () => {
      if (!currentRoom || !user) {
        setIsUserParticipant(false);
        return;
      }
      
      const isParticipant = userRooms.some(participant => 
        participant.chatRoomId === currentRoom.id
      );
      
      setIsUserParticipant(isParticipant);
    };
    
    checkIfUserIsParticipant();
  }, [currentRoom, user, userRooms]);

  // ==================== LOAD ROOMS ON MOUNT ====================
  useEffect(() => {
    console.log('📥 Loading rooms...');
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setIsLoadingRooms(true);
      console.log('🔄 Fetching all chat rooms...');
      const response = await chatApi.getAllChatRooms();
      const roomsData = response.data || [];
      console.log('✅ Rooms loaded:', roomsData.length, roomsData);
      setRooms(roomsData);

      const newUnreadCounts: Record<number, number> = {};
      roomsData.forEach(room => {
        newUnreadCounts[room.id] = 0;
      });
      setUnreadCounts(newUnreadCounts);

      if (roomId) {
        const roomIdNum = parseInt(roomId);
        const room = roomsData.find(r => r.id === roomIdNum);
        if (room) {
          console.log('🎯 Selecting room from URL:', roomIdNum);
          await selectRoom(room);
        }
      } else if (roomsData.length > 0) {
        console.log('🎯 Selecting first room');
        await selectRoom(roomsData[0]);
      }
    } catch (error) {
      console.error('❌ Error loading rooms:', error);
      toast.error('Erreur lors du chargement des salons');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // ==================== WEBSOCKET INITIALIZATION ====================
  useEffect(() => {
    if (!token || !user?.id) {
      console.log('❌ Missing token or user ID');
      return;
    }

    console.log('🔌 Initializing WebSocket...');
    let isMounted = true;

    const handleConnect = () => {
      if (!isMounted) return;
      console.log('✅ WebSocket connected');
      setIsWsConnected(true);
      setConnectionError(null);
      setConnectionRetryCount(0);
      toast.success('Connecté au chat en temps réel', { icon: '✅', duration: 2000 });
    };

    const handleDisconnect = () => {
      if (!isMounted) return;
      console.log('❌ WebSocket disconnected');
      setIsWsConnected(false);
      setShowConnectionAlert(true);
      toast.error('Déconnecté du chat en temps réel', { icon: '❌', duration: 3000 });
    };

    const handleError = (error: string) => {
      if (!isMounted) return;
      console.error('❌ WebSocket error:', error);
      setConnectionError(error);
      toast.error(`Erreur: ${error}`);
    };

    // S'abonner aux événements
    const unsubConnect = chatWebSocket.onConnect(handleConnect);
    const unsubDisconnect = chatWebSocket.onDisconnect(handleDisconnect);
    const unsubError = chatWebSocket.onError(handleError);

    // Connecter
    chatWebSocket.connect(token, user.id);

    return () => {
      console.log('🧹 Cleaning up WebSocket');
      isMounted = false;
      unsubConnect();
      unsubDisconnect();
      unsubError();
      chatWebSocket.disconnect();
    };
  }, [token, user?.id]);

  // ==================== SELECT ROOM ====================
  const selectRoom = async (room: ChatRoom) => {
    try {
      console.log('🎯 Selecting room:', room.id, room.name);
      setCurrentRoom(room);
      setMessages([]);
      setIsLoading(true);
      navigate(`/chat/${room.id}`);

      setUnreadCounts(prev => ({
        ...prev,
        [room.id]: 0
      }));

      const [messagesResponse, participantsResponse] = await Promise.all([
        chatApi.getMessagesByRoomOrdered(room.id),
        chatApi.getParticipantsByRoom(room.id)
      ]);

      // CORRECTION ICI: Vérifier le type des données
      const messagesData = messagesResponse.data || [];
      console.log('✅ Messages loaded - Type check:', {
        isArray: Array.isArray(messagesData),
        firstItemType: messagesData[0] ? typeof messagesData[0] : 'empty',
        firstItem: messagesData[0]
      });
      
      // Deux options selon ce que retourne l'API:

      // Option 1: Si messagesData est déjà un tableau de Message
      let mappedMessages: Message[] = [];
      
      if (messagesData.length > 0 && messagesData[0].createdAt !== undefined) {
        // L'API retourne déjà des Message avec createdAt
        console.log('✅ Using messages directly (already Message type)');
        mappedMessages = messagesData.map((msg: any) => ({
          ...msg,
          // Assurer que createdAt est défini
          createdAt: msg.time_stamp || msg.createdAt || msg.timestamp,
        }));
      } else {
        // Option 2: Si messagesData est un tableau de MessageResponse
        console.log('✅ Mapping from MessageResponse');
        mappedMessages = messagesData.map((dto: any) => {
          // Priorité: time_stamp (BDD) > timestamp > createdAt
          const dateValue = dto.time_stamp || dto.timestamp || dto.createdAt;
          
          return {
            id: dto.id,
            content: dto.content,
            senderId: dto.sender?.id || dto.senderId,
            sender: dto.sender,
            chatRoomId: dto.chatRoomId,
            // Stocker time_stamp pour référence
            time_stamp: dto.time_stamp,
            createdAt: dateValue,
            updatedAt: dateValue,
            isDeleted: dto.isDeleted,
          };
        });
      }

      // Trier par date croissante (plus ancien en premier)
      mappedMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });

      console.log('✅ Final mapped messages (sorted):', mappedMessages.length);
      mappedMessages.forEach((msg, i) => {
        console.log(`📄 Message ${i + 1}:`, {
          id: msg.id,
          date: msg.createdAt,
          senderId: msg.senderId
        });
      });
      
      setMessages(mappedMessages);
      
      const participantsData = participantsResponse.data || [];
      console.log('✅ Participants loaded:', participantsData);
      setParticipants(participantsData);

      if (isWsConnected) {
        chatWebSocket.joinRoom(room.id);
      }

      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Error selecting room:', error);
      toast.error('Erreur lors du chargement du salon');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== JOIN ROOM WHEN CONNECTED ====================
  useEffect(() => {
    if (isWsConnected && currentRoom) {
      console.log(`📡 Joining room ${currentRoom.id} via WebSocket...`);
      chatWebSocket.joinRoom(currentRoom.id);

      // S'abonner aux nouveaux messages
      const unsubscribe = chatWebSocket.onRoomMessage(
        currentRoom.id,
        (messageResponse) => {
          console.log('📨 New message received via WebSocket:', messageResponse);
          console.log('📨 Message date info:', {
            timestamp: messageResponse.timestamp,
          });

          const message = mapMessageResponseToMessage(messageResponse);
          console.log('📨 Mapped message with date:', {
            id: message.id,
            createdAt: message.createdAt,
            contentPreview: message.content.substring(0, 20)
          });

          setMessages(prev => {
            const exists = prev.some(m => m.id === message.id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping');
              return prev;
            }
            console.log('✅ Adding new message to state');
            const newMessages = [...prev, message];
            
            // Trier par date après ajout (plus ancien en premier)
            newMessages.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateA.getTime() - dateB.getTime();
            });
            
            console.log('📊 Total messages now:', newMessages.length);
            return newMessages;
          });

          setTimeout(() => scrollToBottom(), 100);
        }
      );
      
      return () => {
        console.log(`👋 Leaving room ${currentRoom.id}`);
        chatWebSocket.leaveRoom(currentRoom.id);
        unsubscribe();
      };
    }
  }, [isWsConnected, currentRoom?.id]);

  // ==================== SEND MESSAGE ====================
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRoom || !user) return;

    if (!isWsConnected) {
      toast.error('Pas connecté au chat');
      return;
    }

    // Vérifier si l'utilisateur est participant
    if (!isUserParticipant) {
      toast.error('Vous devez être participant pour envoyer des messages');
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Create temporary message for optimistic UI
    const tempId = -Date.now(); // Negative ID to distinguish from real messages
    const now = new Date().toISOString();
    
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: user.id,
      sender: { id: user.id, email: user.email },
      chatRoomId: currentRoom.id,
      // Simuler le format de la BDD
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    console.log('📤 Sending temporary message with date:', tempMessage.createdAt);

    // Add optimistic message immediately
    setMessages(prev => {
      const newMessages = [...prev, tempMessage];
      // Trier après ajout
      return newMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });
    });
    
    setMessageStatus(prev => ({ ...prev, [tempId]: 'sending' }));
    scrollToBottom();

    try {
      const success = await chatWebSocket.sendMessage(currentRoom.id, messageContent);
      
      if (success) {
        console.log('✅ Message sent successfully via WebSocket');
        setMessageStatus(prev => ({ ...prev, [tempId]: 'sent' }));
        
        // The real message will arrive via WebSocket onRoomMessage
        // Remove temp message after a delay to avoid duplication
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== tempId));
          setMessageStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[tempId];
            return newStatus;
          });
        }, 2000);
      } else {
        console.error('❌ Failed to send message');
        setMessageStatus(prev => ({ ...prev, [tempId]: 'error' }));
        toast.error('Erreur lors de l\'envoi du message');
      }

      handleStopTyping();
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessageStatus(prev => ({ ...prev, [tempId]: 'error' }));
      toast.error('Erreur lors de l\'envoi');
    }
  };

  // ==================== TYPING NOTIFICATIONS ====================
  const handleStopTyping = useCallback(() => {
    if (currentRoom && isWsConnected) {
      chatWebSocket.sendTypingNotification(currentRoom.id, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [currentRoom, isWsConnected]);

  // ==================== CREATE ROOM ====================
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Le nom du salon est requis');
      return;
    }

    // Vérifier si l'utilisateur est admin
    if (!canCreateRoom) {
      toast.error('Seuls les administrateurs peuvent créer des salons');
      return;
    }

    try {
      const response = await chatApi.createChatRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
        isPrivate: isPrivateRoom,
      });

      console.log('✅ Room created:', response.data);
      toast.success('Salon créé avec succès');

      setShowNewRoomDialog(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setIsPrivateRoom(false);

      await loadRooms();
      
      if (response.data) {
        await selectRoom(response.data);
      }
    } catch (error) {
      console.error('❌ Error creating room:', error);
      toast.error('Erreur lors de la création du salon');
    }
  };

  // ==================== GESTION DES PARTICIPANTS ====================
  const handleViewParticipantDetails = (participant: ChatParticipant) => {
    setSelectedParticipant(participant);
    setShowParticipantDialog(true);
  };

  const handleStartPrivateChat = (participant: ChatParticipant) => {
    if (!participant.user) {
      toast.error('Impossible de démarrer un chat privé');
      return;
    }
    
    // Naviguer vers la page de chat privé
    navigate(`/one-to-one/${participant.user.id}`);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContextMenu = (event: React.MouseEvent, message: Message) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      message,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleMessageAction = (action: string, message?: Message) => {
    if (!message) return;

    switch (action) {
      case 'reply':
        setReplyingTo(message);
        messageInputRef.current?.focus();
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        toast.success('Message copié');
        break;
    }
    handleContextMenuClose();
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== RENDER MESSAGE BUBBLE ====================
  const renderMessageBubble = (message: Message, isOwnMessage: boolean) => {
    const senderInfo = participants.find(p => p.userId === message.senderId);
    const senderEmail = message.sender?.email || senderInfo?.user?.email || 'Inconnu';
    const status = messageStatus[message.id];
    
    // Obtenir la date correcte pour l'affichage
    const messageDate =  message.createdAt;
    const timeDisplay = formatTime(messageDate);
    const fullDateTime = formatDateTime(messageDate);

    // Debug log
    console.log('🎨 Rendering message:', {
      messageId: message.id,
      senderId: message.senderId,
      currentUserId: user?.id,
      isOwnMessage,
      dateUsed: messageDate,
      timeDisplay
    });

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          mb: 2,
          gap: 1,
          px: 2,
        }}
        onContextMenu={(e) => handleContextMenu(e, message)}
      >
        {/* Avatar - Always show */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: isOwnMessage ? getAvatarColor(user?.id || 0) : getAvatarColor(message.senderId),
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {isOwnMessage ? getInitials(user?.email) : getInitials(senderEmail)}
        </Avatar>

        {/* Message Bubble */}
        <Box
          sx={{
            maxWidth: { xs: '70%', sm: '60%', md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
          }}
        >
          {/* Sender Name (only for received messages) */}
          {!isOwnMessage && (
            <Typography
              variant="caption"
              sx={{
                color: getAvatarColor(message.senderId),
                fontWeight: 600,
                mb: 0.5,
                ml: 0.5,
              }}
            >
              {senderEmail.split('@')[0]}
            </Typography>
          )}

          {/* Message Content */}
          <Tooltip title={fullDateTime} placement="top" arrow>
            <Paper
              elevation={isOwnMessage ? 2 : 1}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2.5,
                bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                color: isOwnMessage ? 'white' : 'text.primary',
                borderTopRightRadius: isOwnMessage ? 4 : 20,
                borderTopLeftRadius: isOwnMessage ? 20 : 4,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                wordWrap: 'break-word',
                position: 'relative',
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                }}
              >
                {message.content}
              </Typography>

              {/* Time & Status */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                  justifyContent: 'flex-end',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    opacity: isOwnMessage ? 0.9 : 0.7,
                    color: isOwnMessage ? 'white' : 'text.secondary',
                  }}
                >
                  {timeDisplay}
                </Typography>
                
                {/* Status Icons for own messages */}
                {isOwnMessage && (
                  <>
                    {status === 'sending' && (
                      <CircularProgress size={10} sx={{ color: 'white', opacity: 0.8 }} />
                    )}
                    {status === 'sent' && (
                      <CheckIcon sx={{ fontSize: 14, opacity: 0.8, color: 'white' }} />
                    )}
                    {status === 'delivered' && (
                      <DoneAllIcon sx={{ fontSize: 14, opacity: 0.8, color: 'white' }} />
                    )}
                    {status === 'read' && (
                      <DoneAllIcon sx={{ fontSize: 14, color: '#4fc3f7' }} />
                    )}
                    {status === 'error' && (
                      <Typography variant="caption" sx={{ color: 'error.light' }}>!</Typography>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  // ==================== RENDER ====================
  if (!user) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography>Veuillez vous connecter</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* CONNECTION ALERT */}
      <Snackbar
        open={showConnectionAlert}
        autoHideDuration={6000}
        onClose={() => setShowConnectionAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowConnectionAlert(false)}
          severity={isWsConnected ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {isWsConnected ? 'Connexion rétablie' : connectionError || 'Connexion perdue'}
        </Alert>
      </Snackbar>

      {/* DIALOG DÉTAILS PARTICIPANT */}
      <Dialog
        open={showParticipantDialog}
        onClose={() => setShowParticipantDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedParticipant && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: getAvatarColor(selectedParticipant.userId),
                  }}
                >
                  {getInitials(selectedParticipant.user?.email)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedParticipant.user?.email?.split('@')[0] || `User ${selectedParticipant.userId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedParticipant.user?.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informations du participant
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        ID: {selectedParticipant.userId}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedParticipant.user?.email}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <AdminIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Rôle: {selectedParticipant.role}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Rejoint le: {formatDate(selectedParticipant.joinedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {selectedParticipant.user && selectedParticipant.userId !== user.id && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={() => {
                    handleStartPrivateChat(selectedParticipant);
                    setShowParticipantDialog(false);
                  }}
                >
                  Discuter en privé
                </Button>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setShowParticipantDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* ROOMS SIDEBAR DESKTOP */}
        <Paper
          square
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">Messages</Typography>
              <Box display="flex" gap={1}>
                <Tooltip title={isWsConnected ? 'Connecté' : 'Déconnecté'}>
                  <IconButton size="small" color={isWsConnected ? 'success' : 'error'}>
                    {isWsConnected ? <WifiIcon /> : <WifiOffIcon />}
                  </IconButton>
                </Tooltip>
                {canCreateRoom && (
                  <Tooltip title="Nouveau salon">
                    <IconButton size="small" onClick={() => setShowNewRoomDialog(true)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher un salon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Rooms List */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.1) transparent',
          }}>
            {isLoadingRooms ? (
              <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : filteredRooms.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                <Typography color="text.secondary" variant="body2">
                  {searchQuery ? 'Aucun salon trouvé' : 'Aucun salon disponible'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredRooms.map((room) => {
                  const isUserInRoom = userRooms.some(p => p.chatRoomId === room.id);
                  return (
                    <ListItemButton
                      key={room.id}
                      selected={currentRoom?.id === room.id}
                      onClick={() => selectRoom(room)}
                      sx={{
                        py: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        },
                        opacity: isUserInRoom ? 1 : 0.6,
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={unreadCounts[room.id] || 0}
                          color="error"
                          max={99}
                          invisible={!unreadCounts[room.id]}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <GroupIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={unreadCounts[room.id] ? 700 : 500}>
                              {room.name}
                            </Typography>
                            {!isUserInRoom && (
                              <VisibilityIcon fontSize="small" color="action" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color="text.secondary">
                              {room.participantCount || 0} participants
                            </Typography>
                            {room.isPrivate && (
                              <Chip icon={<LockIcon />} label="Privé" size="small" />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>

        {/* CHAT AREA */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          position: 'relative',
        }}>
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <Paper
                square
                elevation={1}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <IconButton
                    sx={{ display: { xs: 'block', md: 'none' } }}
                    onClick={() => setShowRoomsDrawer(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <GroupIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {currentRoom.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {participants.length} participant{participants.length > 1 ? 's' : ''}
                      {typingUsers.size > 0 && ' • en train d\'écrire...'}
                      {!isUserParticipant && ' • Lecture seule'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  {/* Bouton pour afficher/masquer les participants (mobile) */}
                  <IconButton
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                    onClick={() => setShowParticipantsDrawer(true)}
                  >
                    <PeopleIcon />
                  </IconButton>
                  
                  {/* Bouton pour afficher/masquer les participants (desktop) */}
                  <Tooltip title={showParticipantsSidebar ? "Masquer les participants" : "Afficher les participants"}>
                    <IconButton
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                      onClick={() => setShowParticipantsSidebar(!showParticipantsSidebar)}
                    >
                      {showParticipantsSidebar ? <PeopleIcon /> : <PeopleOutlinedIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={`Connecté en tant que: ${user?.email} (ID: ${user?.id})`}>
                    <Chip 
                      label={`${user?.role === 'ADMIN' ? 'Admin' : 'User'}: ${user?.id}`} 
                      size="small" 
                      color={user?.role === 'ADMIN' ? 'secondary' : 'primary'}
                      variant="outlined"
                      icon={user?.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                    />
                  </Tooltip>
                  <Tooltip title={isWsConnected ? 'Connecté' : 'Déconnecté'}>
                    <IconButton color={isWsConnected ? 'success' : 'error'}>
                      {isWsConnected ? <WifiIcon /> : <WifiOffIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  bgcolor: 'background.default',
                  backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  // Ajouter un défilement personnalisé
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    },
                  },
                  // Pour Firefox
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                }}
              >
                {isLoading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}>
                      <GroupIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      {isUserParticipant ? 'Aucun message pour le moment' : 'Salon en lecture seule'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isUserParticipant 
                        ? 'Soyez le premier à envoyer un message !'
                        : 'Vous devez être participant pour envoyer des messages'
                      }
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 2, minHeight: '100%' }}>
                    {groupMessagesByDate(messages).map((group, groupIndex) => (
                      <Box key={groupIndex}>
                        {/* Date Separator - Sticky comme WhatsApp */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            my: 3,
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                          }}
                        >
                          <Chip
                            label={group.date}
                            size="small"
                            sx={{
                              bgcolor: 'background.paper',
                              fontWeight: 600,
                              px: 2,
                              boxShadow: 1,
                            }}
                          />
                        </Box>

                        {/* Messages for this date */}
                        {group.messages.map((message) => {
                          const isOwnMessage = Number(message.senderId) === Number(user?.id);
                          return renderMessageBubble(message, isOwnMessage);
                        })}
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                )}
              </Box>

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <Box sx={{ px: 3, py: 1, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {Array.from(typingUsers).map(userId => {
                      const participant = participants.find(p => p.userId === userId);
                      return participant?.user?.email?.split('@')[0] || 'Quelqu\'un';
                    }).join(', ')} {typingUsers.size > 1 ? 'sont' : 'est'} en train d'écrire...
                  </Typography>
                </Box>
              )}

              {/* Reply To Banner */}
              {replyingTo && (
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <ReplyIcon fontSize="small" />
                    <Box>
                      <Typography variant="caption" fontWeight="bold">
                        Répondre à {replyingTo.sender?.email?.split('@')[0]}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                        {replyingTo.content}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setReplyingTo(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Message Input */}
              <Paper
                square
                elevation={3}
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Box display="flex" gap={1} alignItems="flex-end">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder={
                      isUserParticipant 
                        ? "Écrivez votre message..." 
                        : "Vous devez être participant pour envoyer des messages"
                    }
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (currentRoom && isWsConnected && isUserParticipant) {
                        chatWebSocket.sendTypingNotification(currentRoom.id, true);
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }
                        typingTimeoutRef.current = setTimeout(() => {
                          chatWebSocket.sendTypingNotification(currentRoom.id, false);
                        }, 1000);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && isUserParticipant) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    inputRef={messageInputRef}
                    disabled={!isUserParticipant || !isWsConnected}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isWsConnected || !isUserParticipant}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                {!isUserParticipant && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    <BlockIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Lecture seule - Vous n'êtes pas participant de ce salon
                  </Typography>
                )}
              </Paper>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={3}
            >
              <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.light' }}>
                <GroupIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h4" align="center">
                Bienvenue dans le chat !
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500 }}>
                {canCreateRoom 
                  ? 'Sélectionnez un salon ou créez-en un nouveau pour commencer à chatter.'
                  : 'Sélectionnez un salon pour voir les messages.'
                }
              </Typography>
              {canCreateRoom && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewRoomDialog(true)}
                >
                  Créer un salon
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* PARTICIPANTS SIDEBAR DESKTOP */}
        {showParticipantsSidebar && (
          <Paper
            square
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              width: 320,
              borderLeft: 1,
              borderColor: 'divider',
              flexShrink: 0,
              transition: 'transform 0.3s ease-in-out',
              position: 'relative',
            }}
          >
            {/* Bouton pour masquer la sidebar (dans la sidebar) */}
            <Box sx={{ 
              position: 'absolute', 
              left: -20, 
              top: 20, 
              zIndex: 10,
              bgcolor: 'background.paper',
              borderRadius: '50%',
              boxShadow: 1,
            }}>
              <Tooltip title="Masquer les participants">
                <IconButton
                  size="small"
                  onClick={() => setShowParticipantsSidebar(false)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Participants ({participants.length})</Typography>
              <Tooltip title="Masquer">
                <IconButton
                  size="small"
                  onClick={() => setShowParticipantsSidebar(false)}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {participants.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                  <Typography color="text.secondary" variant="body2">Aucun participant</Typography>
                </Box>
              ) : (
                <List>
                  {participants.map((participant) => (
                    <ListItem 
                      key={participant.id} 
                      sx={{ 
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      secondaryAction={
                        participant.user && participant.userId !== user.id && (
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleStartPrivateChat(participant)}
                            title="Discuter en privé"
                          >
                            <MessageIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemButton
                        onClick={() => handleViewParticipantDetails(participant)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor: getAvatarColor(participant.userId),
                          }}>
                            {getInitials(participant.user?.email)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="subtitle2">
                                {participant.user?.email?.split('@')[0] || `User ${participant.userId}`}
                              </Typography>
                              {participant.userId === user.id && (
                                <Chip
                                  size="small"
                                  label="Vous"
                                  color="primary"
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Chip
                              size="small"
                              label={participant.role}
                              color={participant.role === 'OWNER' ? 'error' :
                                participant.role === 'ADMIN' ? 'primary' : 'default'}
                              sx={{ mt: 0.5 }}
                            />
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        )}

        {/* Bouton flottant pour afficher la liste des participants (quand cachée) */}
        {!showParticipantsSidebar && (
          <Tooltip title="Afficher les participants">
            <Button
              variant="contained"
              onClick={() => setShowParticipantsSidebar(true)}
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                right: 20,
                top: 20,
                zIndex: 1000,
                minWidth: 'auto',
                width: 40,
                height: 40,
                borderRadius: '50%',
                p: 0,
              }}
            >
              <PeopleOutlinedIcon />
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* DRAWER ROOMS MOBILE */}
      <Drawer
        anchor="left"
        open={showRoomsDrawer}
        onClose={() => setShowRoomsDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: '85vw', maxWidth: 400 } }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Salons</Typography>
            {canCreateRoom && (
              <Tooltip title="Nouveau salon">
                <IconButton onClick={() => setShowNewRoomDialog(true)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => setShowRoomsDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ flex: 1, overflow: 'auto' }}>
            {rooms.map(room => (
              <ListItemButton
                key={room.id}
                selected={currentRoom?.id === room.id}
                onClick={() => {
                  selectRoom(room);
                  setShowRoomsDrawer(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <GroupIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={room.name}
                  secondary={`${room.participantCount || 0} participants`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* DRAWER PARTICIPANTS MOBILE */}
      <Drawer
        anchor="right"
        open={showParticipantsDrawer}
        onClose={() => setShowParticipantsDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: '85vw', maxWidth: 400 } }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Participants ({participants.length})</Typography>
            <IconButton onClick={() => setShowParticipantsDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {participants.map((participant) => (
              <ListItem 
                key={participant.id}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  participant.user && participant.userId !== user.id && (
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleStartPrivateChat(participant)}
                      title="Discuter en privé"
                    >
                      <MessageIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemButton
                  onClick={() => handleViewParticipantDetails(participant)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getAvatarColor(participant.userId) }}>
                      {getInitials(participant.user?.email)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="subtitle2">
                          {participant.user?.email?.split('@')[0] || `User ${participant.userId}`}
                        </Typography>
                        {participant.userId === user.id && (
                          <Chip
                            size="small"
                            label="Vous"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Chip
                        size="small"
                        label={participant.role}
                        color={participant.role === 'OWNER' ? 'error' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* DIALOG CREATE ROOM */}
      <Dialog
        open={showNewRoomDialog}
        onClose={() => setShowNewRoomDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminIcon color="secondary" />
            <Typography variant="h6">
              Créer un nouveau salon (Admin seulement)
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!canCreateRoom ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Seuls les administrateurs peuvent créer des salons.
            </Alert>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Nom du salon"
                fullWidth
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description (optionnel)"
                fullWidth
                multiline
                rows={3}
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body1">Type</Typography>
                <Chip
                  label="Public"
                  color={!isPrivateRoom ? 'primary' : 'default'}
                  onClick={() => setIsPrivateRoom(false)}
                  variant={!isPrivateRoom ? 'filled' : 'outlined'}
                />
                <Chip
                  icon={<LockIcon />}
                  label="Privé"
                  color={isPrivateRoom ? 'secondary' : 'default'}
                  onClick={() => setIsPrivateRoom(true)}
                  variant={isPrivateRoom ? 'filled' : 'outlined'}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewRoomDialog(false)}>Annuler</Button>
          {canCreateRoom && (
            <Button 
              onClick={handleCreateRoom} 
              variant="contained" 
              disabled={!newRoomName.trim()}
              startIcon={<AdminIcon />}
            >
              Créer
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* CONTEXT MENU */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        {contextMenu?.message && (
          <>
            <MenuItem onClick={() => handleMessageAction('reply', contextMenu.message)}>
              <ListItemIcon><ReplyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Répondre</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMessageAction('copy', contextMenu.message)}>
              <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Copier</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default ChatPage;