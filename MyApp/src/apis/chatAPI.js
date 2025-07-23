import axiosInstance from './axiosInstance';



//1- search users to start chat
export const searchUsers = async (query) => {
  try {
    const trimmedQuery = query?.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return [];
    
    const response = await axiosInstance.get('/chats/search/users', {
      params: { query: trimmedQuery },
      paramsSerializer: params => {
        return Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
      }
    });
    
    return response.data.map(user => ({
      _id: user._id,
      name: user.name,
      profilePicture: user.profilePicture || 'https://placehold.co/400'
    }));
  } catch (error) {
    console.error('[FRONTEND] Search failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.message || 'Search failed');
  }
};



//2-create chat with a particular user 
export const createChat = async (userId) => {
  try {
    const response = await axiosInstance.post('/chats', { userId });
    return response.data;
  } catch (error) {
    console.error(' createChat error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create chat');
  }
};

 
//3- getUserChats to display all the created chats 
export const getUserChats = async () => {
  try {
    const response = await axiosInstance.get('/chats');
    return response.data.map(chat => ({
      ...chat,
      updatedAt: chat.updatedAt || new Date().toISOString()
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load chats');
  }
};


// 4- Get all messages of a chat
export const getChatMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load messages');
  }
};

// 5- Send a message in a chat
export const sendMessage = async (chatId, content) => {
  try {
    const response = await axiosInstance.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

// 6- Mark all messages as read in a chat
export const markMessagesAsRead = async (chatId) => {
  try {
    await axiosInstance.patch(`/chats/${chatId}/mark-read`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
  }
};

// 7- Get chat details (participants etc.)
export const getChatDetails = async (chatId) => {
  try {
    const response = await axiosInstance.get(`/chats/${chatId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load chat details');
  }
};
