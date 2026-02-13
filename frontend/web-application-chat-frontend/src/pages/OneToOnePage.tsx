// src/pages/OneToOnePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
  IconButton,
  Tab,
  Tabs,
  Chip,
  Divider,
  Button,
  Paper,
  Container,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  PersonAdd as PersonAddIcon,
  Menu as MenuIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Info as InfoIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Lock as LockIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import ChatHeader from '../components/common/ChatHeader';
import ContactList from '../components/common/ContactList';
import TypingIndicator from '../components/common/TypingIndicator';
import type { Contact, PrivateChatMessage, MessageRequest, User } from '../types/oneToOne.type';
import { oneToOneApi } from '../services/api/oneToOneApi';
import OneToOneMessage from '../components/common/OneToOneMessage';
import OneToOneMessageInput from '../components/common/OneToOneMessageInput';
import UserList from '../components/common/UserList';
import SearchBar from '../components/common/SearchBar';
import { chatWebSocket } from '../services/chatWebsocket';

// Constantes
const DRAWER_WIDTH = 320;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

// Fonction pour formater les dates comme WhatsApp/Telegram
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

// Fonction pour grouper les messages par date
const groupMessagesByDate = (messages: PrivateChatMessage[]): { date: string; messages: PrivateChatMessage[] }[] => {
  // Trier les messages par date croissante (plus ancien en premier)
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });

  const groups: { [key: string]: PrivateChatMessage[] } = {};
  
  sortedMessages.forEach(message => {
    const dateKey = new Date(message.timestamp).toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  // Trier les groupes par date (plus ancien en premier)
  return Object.entries(groups)
    .map(([dateKey, msgs]) => ({
      date: formatDateForGroup(msgs[0].timestamp),
      messages: msgs
    }))
    .sort((a, b) => {
      const dateA = new Date(a.messages[0].timestamp);
      const dateB = new Date(b.messages[0].timestamp);
      return dateA.getTime() - dateB.getTime();
    });
};

const OneToOnePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ID provenant de l'URL  /one-to-one/:id  (null si absent)
  const contactIdFromUrl = idParam ? Number(idParam) : null;

  // Ref utilisée pour passer l'ID cible à loadContacts sans déclencher un re-render
  const pendingContactIdRef = useRef<number | null>(contactIdFromUrl);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  const [searchMode, setSearchMode] = useState(false);
  
  // États
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Récupérer l'ID de l'utilisateur courant
  const getCurrentUserId = (): number => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || 1;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return 1;
      }
    }
    return 1;
  };
  
  const [currentUserId, setCurrentUserId] = useState<number>(getCurrentUserId());
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Charger les contacts
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
      
      const response = await oneToOneApi.getUserContacts(userId);
      // Ajouter un statut online simulé
      const contactsWithOnline = response.data.map(contact => ({
        ...contact,
        online: Math.random() > 0.5,
      }));
      setContacts(contactsWithOnline);

      // Si un ID cible existe (URL ou navigation en cours), sélectionner ce contact
      if (pendingContactIdRef.current !== null) {
        const target = contactsWithOnline.find(c => c.userId === pendingContactIdRef.current);
        if (target) {
          setSelectedContact(target);
          setHasLoadedMessages(false);
        }
        pendingContactIdRef.current = null; // consommé
      } else if (!isMobile && contactsWithOnline.length > 0 && !selectedContact) {
        // Comportement par défaut sur desktop : premier contact
        setSelectedContact(contactsWithOnline[0]);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedContact, isMobile]);
  
  // Charger les messages avec un contact
  const loadMessages = useCallback(async (contactId: number) => {
    try {
      const userId = getCurrentUserId();
      const response = await oneToOneApi.getChatBetweenUsers(userId, contactId);
      setMessages(response.data);
      setHasLoadedMessages(true);
      
      // Afficher le message de bienvenue seulement lors du premier chargement
      if (response.data.length === 0) {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
      
      // Faire défiler vers le bas après le chargement
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error(err);
    }
  }, []);
  
  // Envoyer un message
  const handleSendMessage = async (request: MessageRequest) => {
    if (!selectedContact) return;
    
    try {
      const userId = getCurrentUserId();
      const response = await oneToOneApi.sendMessage(userId, request);
      
      // Ajouter le message à la liste
      setMessages(prev => [...prev, response.data]);
      
      // Masquer le message de bienvenue après le premier message
      setShowWelcome(false);
      
      // Mettre à jour le dernier message dans la liste des contacts
      setContacts(prev =>
        prev.map(contact =>
          contact.userId === selectedContact.userId
            ? {
                ...contact,
                lastMessage: response.data.content,
                lastMessageTime: response.data.timestamp,
                online: true,
              }
            : contact
        )
      );
      
      // Faire défiler vers le bas
      scrollToBottom();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    }
  };
  
  // Marquer les messages comme lus
  const markMessagesAsRead = useCallback(async () => {
    if (!selectedContact) return;
    
    const unreadMessages = messages.filter(
      msg => msg.senderId1 === selectedContact.userId && !msg.isRead
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      
      try {
        const userId = getCurrentUserId();
        await oneToOneApi.markMessagesAsRead(userId, { messageIds });
        
        // Mettre à jour les messages localement
        setMessages(prev =>
          prev.map(msg =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
        
        // Mettre à jour le compteur dans les contacts
        setContacts(prev =>
          prev.map(contact =>
            contact.userId === selectedContact.userId
              ? { ...contact, unreadCount: 0 }
              : contact
          )
        );
      } catch (err) {
        console.error('Erreur lors du marquage des messages comme lus:', err);
      }
    }
  }, [messages, selectedContact]);
  
  // Faire défiler vers le bas
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };
  
  // Gérer la sélection d'un contact
  const handleSelectContact = (contactId: number) => {
    const contact = contacts.find(c => c.userId === contactId);
    if (contact) {
      setSelectedContact(contact);
      setShowWelcome(true);
      setHasLoadedMessages(false);
      loadMessages(contactId);
      navigate(`/one-to-one/${contactId}`);   // sync URL
      
      if (isMobile) {
        setMobileOpen(false);
      }
    }
  };
  
  // Fermer le chat
  const handleCloseChat = () => {
    setSelectedContact(null);
    setMessages([]);
    setShowWelcome(false);
    navigate('/one-to-one');   // retour à la vue sans chat sélectionné
  };
  
  // Gérer le menu contextuel du chat
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'close':
        handleCloseChat();
        break;
      case 'clear':
        // Option pour effacer l'historique
        setMessages([]);
        break;
      case 'block':
        // Option pour bloquer l'utilisateur
        alert(`Bloquer ${selectedContact?.username}`);
        break;
      case 'delete':
        // Option pour supprimer la conversation
        if (window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
          handleCloseChat();
          setContacts(prev => prev.filter(c => c.userId !== selectedContact?.userId));
        }
        break;
    }
    handleMenuClose();
  };
  
  // Gérer la sélection d'un utilisateur
  const handleSelectUser = (user: User) => {
    const existingContact = contacts.find(c => c.userId === user.id);
    
    if (existingContact) {
      setSelectedContact(existingContact);
      setShowWelcome(true);
      setHasLoadedMessages(false);
      loadMessages(user.id);
    } else {
      const newContact: Contact = {
        userId: user.id,
        username: user.email,
        lastMessage: '',
        lastMessageTime: null,
        unreadCount: 0,
        online: true,
      };
      
      setContacts(prev => [...prev, newContact]);
      setSelectedContact(newContact);
      setMessages([]);
      setShowWelcome(true);
      setHasLoadedMessages(false);
    }
    
    navigate(`/one-to-one/${user.id}`);   // sync URL
    
    if (isMobile) {
      setMobileOpen(false);
    }
    
    setActiveTab('chats');
  };
  
  // Gérer l'indicateur de frappe
  const handleTyping = (typing: boolean) => {
    if (selectedContact) {
      const userId = getCurrentUserId();
      chatWebSocket.sendPrivateTypingNotification(userId, selectedContact.userId, typing);
    }
  };
  
  // Gérer le résultat de recherche
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'contact') {
      handleSelectContact(result.data.userId);
    } else if (result.type === 'message') {
      const message = result.data;
      const userId = getCurrentUserId();
      const contactId = message.senderId1 === userId ? message.senderId2 : message.senderId1;
      handleSelectContact(contactId);
    }
  };
  
  // Configuration WebSocket
  useEffect(() => {
    const userId = getCurrentUserId();
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found in localStorage');
      return;
    }
    
    const connectionUnsubscribe = chatWebSocket.onConnectionChange((connected) => {
      setWebSocketConnected(connected);
      console.log(`WebSocket connection: ${connected ? 'connected' : 'disconnected'}`);
    });
    
    const errorUnsubscribe = chatWebSocket.onError((errorMessage) => {
      setError(`Erreur WebSocket: ${errorMessage}`);
      console.error('WebSocket error:', errorMessage);
    });
    
    let privateMessageUnsubscribe: () => void = () => {};
    
    if (selectedContact) {
      privateMessageUnsubscribe = chatWebSocket.onPrivateMessage(
        selectedContact.userId,
        (message) => {
          console.log('Private message received from service:', message);
          
          setMessages(prev => [...prev, message]);
          setShowWelcome(false);
          
          setContacts(prev =>
            prev.map(contact =>
              contact.userId === selectedContact.userId
                ? {
                    ...contact,
                    lastMessage: message.content,
                    lastMessageTime: message.timestamp,
                    unreadCount: contact.userId === selectedContact.userId ? 0 : contact.unreadCount + 1,
                    online: true,
                  }
                : contact
            )
          );
          
          scrollToBottom();
        }
      );
    }
    
    let privateTypingUnsubscribe: () => void = () => {};
    
    if (selectedContact) {
      privateTypingUnsubscribe = chatWebSocket.onPrivateTyping(
        selectedContact.userId,
        (data) => {
          setIsTyping(data.isTyping);
          setTypingUser(data.username);
        }
      );
    }
    
    chatWebSocket.connect(token, userId);
    
    return () => {
      connectionUnsubscribe();
      errorUnsubscribe();
      privateMessageUnsubscribe();
      privateTypingUnsubscribe();
    };
  }, [selectedContact]);
  
  // Chargement initial
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Réagir aux changements de :id dans l'URL (navigation externe ou back/forward)
  useEffect(() => {
    if (contactIdFromUrl === null) return; // pas de :id dans l'URL

    // Si les contacts sont déjà chargés, sélectionner directement
    if (contacts.length > 0) {
      const target = contacts.find(c => c.userId === contactIdFromUrl);
      if (target && target.userId !== selectedContact?.userId) {
        setSelectedContact(target);
        setShowWelcome(true);
        setHasLoadedMessages(false);
      }
    } else {
      // Contacts pas encore chargés → stocker pour que loadContacts les honore
      pendingContactIdRef.current = contactIdFromUrl;
    }
  }, [contactIdFromUrl, contacts, selectedContact?.userId]);
  
  // Charger les messages quand un contact est sélectionné
  useEffect(() => {
    if (selectedContact && !hasLoadedMessages) {
      loadMessages(selectedContact.userId);
      markMessagesAsRead();
    }
  }, [selectedContact, loadMessages, markMessagesAsRead, hasLoadedMessages]);
  
  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleDrawerClose = () => {
    setMobileOpen(false);
  };
  
  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  // Grouper les messages par date
  const groupedMessages = groupMessagesByDate(messages);
  
  if (loading && !selectedContact) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress 
          size={60}
          sx={{ 
            color: 'white',
          }} 
        />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Drawer pour la liste des contacts */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isMobile ? mobileOpen : drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          },
        }}
      >
        {/* En-tête du drawer */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton 
                onClick={handleDrawerToggle} 
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Messages
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setSearchMode(!searchMode)}
              color={searchMode ? 'primary' : 'default'}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <SearchIcon />
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: webSocketConnected ? '#4caf50' : '#9e9e9e',
              transition: 'color 0.3s',
            }}>
              {webSocketConnected ? (
                <WifiIcon fontSize="small" />
              ) : (
                <WifiOffIcon fontSize="small" />
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Onglets */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          px: 2, 
          pt: 1,
          background: 'rgba(255, 255, 255, 0.8)',
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
                height: 3,
                borderRadius: '3px',
              }
            }}
          >
            <Tab 
              label="Discussions" 
              value="chats" 
              icon={<ChatIcon />}
              iconPosition="start"
              sx={{ 
                minHeight: 48,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'chats' ? '#667eea' : 'text.secondary',
                '&:hover': {
                  color: '#667eea',
                }
              }}
            />
            <Tab 
              label="Nouveau" 
              value="users" 
              icon={<PersonAddIcon />}
              iconPosition="start"
              sx={{ 
                minHeight: 48,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'users' ? '#667eea' : 'text.secondary',
                '&:hover': {
                  color: '#667eea',
                }
              }}
            />
          </Tabs>
        </Box>
        
        {/* Barre de recherche ou statistiques */}
        <Box sx={{ 
          p: 2, 
          pb: 1,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          {activeTab === 'chats' ? (
            searchMode ? (
              <SearchBar
                messages={messages}
                contacts={contacts}
                currentUserId={currentUserId}
                onResultClick={handleSearchResultClick}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                </Typography>
                {contacts.some(c => c.online) && (
                  <Chip
                    label={`${contacts.filter(c => c.online).length} en ligne`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            )
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sélectionnez un utilisateur pour démarrer une conversation
            </Typography>
          )}
        </Box>
        
        {/* Contenu principal du drawer */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'chats' ? (
            <ContactList
              contacts={contacts}
              currentUserId={currentUserId}
              selectedContactId={selectedContact?.userId || null}
              onSelectContact={handleSelectContact}
            />
          ) : (
            <UserList
              currentUserId={currentUserId}
              onSelectUser={handleSelectUser}
              existingContacts={contacts.map(contact => ({
                id: contact.userId,
                email: contact.username,
              }))}
            />
          )}
        </Box>
      </Drawer>
      
      {/* Zone de chat principale */}
      <Main open={drawerOpen}>
        {/* Header */}
        <ChatHeader
          contactName={selectedContact?.username || ''}
          online={selectedContact?.online}
          onBack={isMobile ? handleDrawerToggle : undefined}
          onClose={selectedContact ? handleCloseChat : undefined}
          onMenuAction={handleMenuAction}
          unreadCount={selectedContact?.unreadCount}
          connectionStatus={webSocketConnected}
          showChat={!!selectedContact}
          onNewChat={() => setActiveTab('users')}
        />
        
        {selectedContact ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 72px)' }}>
            {/* Zone des messages */}
            <Box
              ref={messagesContainerRef}
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(102, 126, 234, 0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.5)',
                  }
                }
              }}
            >
              {/* Message de bienvenue */}
              {showWelcome && messages.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    px: 2,
                    animation: 'fadeIn 0.5s ease-out',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    }
                  }}
                >
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    borderRadius: 3,
                    p: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    maxWidth: 400,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <EmojiEmotionsIcon 
                      sx={{ 
                        fontSize: 50, 
                        color: '#667eea',
                        mb: 2,
                      }} 
                    />
                    <Typography variant="h6" fontWeight="700" gutterBottom color="#333">
                      Commencez la conversation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Envoyez votre premier message à {selectedContact.username.split('@')[0]}
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mt: 2,
                    }}>
                      <InfoIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Cette conversation est chiffrée de bout en bout
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Liste des messages avec séparateurs de date */}
              {groupedMessages.map((group, groupIndex) => (
                <Box key={groupIndex}>
                  {/* Séparateur de date - Style WhatsApp/Telegram */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      my: 3,
                    }}
                  >
                    <Chip
                      label={group.date}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                        color: 'rgba(0, 0, 0, 0.7)',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  </Box>
                  
                  {/* Messages pour cette date */}
                  {group.messages.map((message, messageIndex) => (
                    <OneToOneMessage
                      key={message.id || messageIndex}
                      message={message}
                      currentUserId={currentUserId}
                    />
                  ))}
                </Box>
              ))}
              
              <TypingIndicator
                isTyping={isTyping}
                userName={typingUser}
              />
              
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Input pour écrire des messages */}
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}>
              <OneToOneMessageInput
                onSendMessage={handleSendMessage}
                receiverId={selectedContact.userId}
                currentUserId={currentUserId}
                onTyping={handleTyping}
                webSocketConnected={webSocketConnected}
              />
            </Box>
          </Box>
        ) : (
          // Page par défaut comme WhatsApp/Telegram quand aucun chat n'est sélectionné
          <Box
            sx={{
              height: 'calc(100% - 72px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `radial-gradient(#667eea 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
            
            <Container maxWidth="md">
              <Stack spacing={4} alignItems="center">
                {/* Logo/Illustration principale */}
                <Box
                  sx={{
                    width: { xs: 200, sm: 240, md: 280 },
                    height: { xs: 200, sm: 240, md: 280 },
                    position: 'relative',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-20px)' },
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 40px 80px rgba(102, 126, 234, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChatIcon 
                      sx={{ 
                        fontSize: { xs: 80, sm: 100, md: 120 }, 
                        color: 'white',
                      }} 
                    />
                  </Box>
                  
                  {/* Animated rings */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '130%',
                      height: '130%',
                      borderRadius: '50%',
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      animation: 'pulse-ring 3s infinite',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '160%',
                      height: '160%',
                      borderRadius: '50%',
                      border: '2px solid rgba(102, 126, 234, 0.05)',
                      animation: 'pulse-ring 4s infinite 0.5s',
                    }}
                  />
                </Box>

                {/* Titre et description */}
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    }}
                  >
                    Chat Privé
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      maxWidth: 600,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    Discutez en privé avec vos contacts en toute sécurité
                  </Typography>
                </Stack>

                {/* Features grid */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  sx={{ mt: 4, width: '100%', maxWidth: 800 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <LockIcon 
                      sx={{ 
                        fontSize: 40, 
                        color: '#667eea',
                        mb: 2,
                      }} 
                    />
                    <Typography variant="h6" fontWeight="700" gutterBottom>
                      Chiffrement
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages chiffrés de bout en bout pour une confidentialité maximale
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <BoltIcon 
                      sx={{ 
                        fontSize: 40, 
                        color: '#667eea',
                        mb: 2,
                      }} 
                    />
                    <Typography variant="h6" fontWeight="700" gutterBottom>
                      Instantané
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages délivrés en temps réel avec notifications instantanées
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <ShieldIcon 
                      sx={{ 
                        fontSize: 40, 
                        color: '#667eea',
                        mb: 2,
                      }} 
                    />
                    <Typography variant="h6" fontWeight="700" gutterBottom>
                      Sécurisé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vos conversations restent privées et protégées
                    </Typography>
                  </Paper>
                </Stack>

                {/* CTA Button */}
                <Stack spacing={2} sx={{ mt: 4 }} alignItems="center">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setActiveTab('users')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nouvelle Conversation
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Sélectionnez une conversation dans la liste à gauche ou créez-en une nouvelle
                  </Typography>
                </Stack>

                {/* Stats */}
                <Stack
                  direction="row"
                  spacing={4}
                  sx={{ 
                    mt: 6,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    opacity: 0.8,
                  }}
                >
                  <Stack alignItems="center">
                    <Typography variant="h4" fontWeight="800" color="#667eea">
                      {contacts.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Contacts
                    </Typography>
                  </Stack>
                  
                  <Stack alignItems="center">
                    <Typography variant="h4" fontWeight="800" color="#4caf50">
                      {contacts.filter(c => c.online).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En ligne
                    </Typography>
                  </Stack>
                  
                  <Stack alignItems="center">
                    <Typography variant="h4" fontWeight="800" color="#ff9800">
                      {contacts.reduce((sum, c) => sum + c.unreadCount, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Non lus
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Container>
          </Box>
        )}
      </Main>
      
      {/* Snackbar pour les erreurs */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OneToOnePage;