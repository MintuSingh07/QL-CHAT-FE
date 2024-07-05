import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import User from '../components/User';
import { gql, useQuery } from '@apollo/client';
import Chat from '../components/Chat';
import NoChat from '../components/NoChat';
import SideNavComponent from '../components/SideNavComponent';

const FETCH_CHATS = gql`
  query fetchChats {
    fetchChats {
      _id
      chatName
      latestMessage {
        sender {
          userName
          email
          pic
        }
        content
      }
      users {
        _id
        userName
        email
        pic
      }
      groupAdmins {
        _id
        userName
        email
        pic
      }
      updatedAt
      isGroupChat
    }
  }
`;

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChatId, setCurrentChatId] = useState('');
  const [showGroupChats, setShowGroupChats] = useState(false);
  const { data, loading, error } = useQuery(FETCH_CHATS);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('credentials');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredChats = data?.fetchChats.filter(chat =>
    chat.users.some(u => u.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChatClick = (chatId) => {
    console.log(chatId);
    setCurrentChatId(chatId);
  };

  const handleShowGroups = () => {
    setShowGroupChats(true);
  };
  const handleShowSingleChats = () => {
    setShowGroupChats(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <ChatBG>
          <SideNavComponent />
          <UsersListCover>
            <SearchBar placeholder="Search..." value={searchQuery} onChange={handleSearchChange} />
            <ChatTypeContainer>
              <div className="containers" onClick={handleShowSingleChats}>
                <p>Single</p>
              </div>
              <div className="containers" onClick={handleShowGroups}>
                <p>Group</p>
              </div>
            </ChatTypeContainer>
            <UserList>
              {loading && <p>Loading...</p>}
              {error && <p>Error fetching chats</p>}
              {filteredChats &&
                filteredChats
                  .filter(chat => chat.isGroupChat === showGroupChats)
                  .map(chat => {
                    const otherUser = chat.users.find(u => u.userName !== user.userName);
                    return (
                      <User
                        key={chat._id}
                        userName={showGroupChats ? chat.chatName : otherUser.userName}
                        latestMessage={chat.latestMessage?.content}
                        pic={showGroupChats ? null : otherUser.pic}
                        onClick={() => handleChatClick(chat._id)}
                      />
                    );
                  })}
            </UserList>
          </UsersListCover>
          <ChatInterface>
            {currentChatId ? <Chat chatId={currentChatId} /> : <NoChat />}
          </ChatInterface>
        </ChatBG>
      ) : (
        <div>You don't have access to this page...</div>
      )}
    </>
  );
};

const ChatBG = styled.div`
  height: 100vh;
  width: 100%;
  background-color: #fff;
  display: flex;
`;

const UsersListCover = styled.div`
  height: 100%;
  width: 40vw;
  background-color: #3b3e46;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-right: 1px solid #ffffff2b;
`;

const ChatInterface = styled.div`
  height: 100%;
  width: 100%;
  background-color: #23262f;
`;

const UserList = styled.div`
  overflow-y: scroll;
  height: 80%;
  width: 90%;
  background-color: #23262f;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  padding: 1rem 0;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const SearchBar = styled.input`
  height: 3rem;
  width: 90%;
  background-color: #fff;
  margin-bottom: 1vh;
  outline: 0;
  border: 1px solid black;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const ChatTypeContainer = styled.div`
  height: 5vh;
  width: 90%;
  margin: 1vh 0%;
  display: flex;
  gap: 1vh;

  .containers {
    height: 100%;
    min-width: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #00aeff37;
    border-radius: 1.5vh;
    cursor: pointer;

    p {
      color: white;
      font-weight: 500;
      font-size: 1rem;
    }
  }
`;

export default Home;
