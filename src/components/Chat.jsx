import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import styled from 'styled-components';

const FETCH_SINGLE_CHAT = gql`
    query FetchSingleChatMessages($chatId: ID!) {
        fetchSingleChatMessages(chatId: $chatId) {
            _id
            sender {
                userName
                pic
                email
            }
            content
            chat {
                _id
                chatName
                isGroupChat
                users {
                    userName
                    pic
                }
            }
        }
    }
`;

const SEND_MESSAGE = gql`
    mutation SendMessage($chatId: ID!, $content: String!) {
        sendMessage(chatId: $chatId, content: $content) {
            _id
            sender {
                userName
                pic
            }
            content
            chat {
                _id
                chatName
            }
        }
    }
`;

const SUBSCRIPTION = gql`
    subscription onMessageAdded($chatId: ID!) {
        messageAdded(chatId: $chatId) {
            _id
            sender {
                userName
                pic
            }
            content
            chat {
                _id
                chatName
            }
        }
    }
`;

const Chat = ({ chatId }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);

    const { data, loading, error } = useQuery(FETCH_SINGLE_CHAT, {
        variables: { chatId },
        onCompleted: (data) => {
            setMessages(data.fetchSingleChatMessages);
        },
    });

    const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
        onError: (error) => {
            console.error('Error sending message:', error);
        },
    });

    const { data: subscriptionData } = useSubscription(SUBSCRIPTION, {
        variables: { chatId },
        onSubscriptionData: ({ subscriptionData }) => {
            const newMessage = subscriptionData.data.messageAdded;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        },
    });

    useEffect(() => {
        const token = localStorage.getItem('credentials');
        if (token) {
            const decoded = jwtDecode(token);
            setCurrentUser(decoded.userName);
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const chatData = data?.fetchSingleChatMessages[0]?.chat;
    const otherUser = chatData?.isGroupChat
        ? null
        : chatData?.users.find((user) => user.userName !== currentUser);

    const handleSendMessage = () => {
        if (!messageInput.trim()) {
            return;
        }

        sendMessageMutation({
            variables: {
                chatId: chatId,
                content: messageInput,
            },
        });

        // Clear input after sending message
        setMessageInput('');
    };

    return (
        <>
            {isLoggedIn ? (
                <ChatContainer>
                    <UserIndicator>
                        <ChatHeader>
                            {chatData?.isGroupChat ? (
                                <GroupChatHeader>
                                    <ChatName>{chatData.chatName}</ChatName>
                                    <GroupChatNameContainer>
                                        {chatData.users.map((user) => (
                                            <GroupUsersName key={user.userName}>{user.userName}</GroupUsersName>
                                        ))}
                                    </GroupChatNameContainer>
                                </GroupChatHeader>
                            ) : (
                                <>
                                    <UserProfilePic src={otherUser?.pic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} />
                                    <UserProfileName>{otherUser?.userName || 'Anonymous'}</UserProfileName>
                                </>
                            )}
                        </ChatHeader>
                    </UserIndicator>
                    <MessageContainer>
                        {messages.map((message) =>
                            message.sender.userName === currentUser ? (
                                <MyMessage key={message._id}>
                                    <p>{message.content}</p>
                                </MyMessage>
                            ) : (
                                <OtherMessage key={message._id}>
                                    {chatData.isGroupChat && <SenderName>{message.sender.userName}</SenderName>}
                                    <p>{message.content}</p>
                                </OtherMessage>
                            )
                        )}
                    </MessageContainer>
                    <SendInputDiv>
                        <input
                            type="text"
                            placeholder='Message...'
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </SendInputDiv>
                </ChatContainer>
            ) : (
                <h1>You are not authorized to access this page</h1>
            )}
        </>
    );
};

const ChatContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 2vh;
    box-sizing: border-box;
    background-color: #23262F;
    position: relative;
`;

const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1vh;
    overflow-y: auto;
    padding-bottom: 1vh;
    padding-top: 10vh;

    &::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const SendInputDiv = styled.div`
    display: flex;
    align-items: center;
    height: 7vh;
    margin-top: 3vh;

    input {
        flex: 1;
        padding: 1vh;
        border: 1px solid #ccc;
        border-radius: 1vh;
        outline: none;
        height: 100%;
        width: 100%;
    }

    button {
        margin-left: 1vh;
        padding: 2.6vh 5vh;
        border: none;
        border-radius: 1vh;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        outline: none;

        &:hover {
            background-color: #0056b3;
        }
    }
`;

const MyMessage = styled.div`
    align-self: flex-end;
    max-width: 60%;
    padding: 2vh;
    background-color: #007bff;
    color: white;
    border-radius: 2vh;
    border-bottom-right-radius: 0;
    word-wrap: break-word;
`;

const OtherMessage = styled.div`
    align-self: flex-start;
    max-width: 60%;
    padding: 2vh;
    background-color: #e5e5ea;
    color: black;
    border-radius: 2vh;
    border-bottom-left-radius: 0;
    word-wrap: break-word;
`;

const SenderName = styled.div`
    font-weight: 500;
    margin-bottom: 1vh;
`;

const UserIndicator = styled.div`
    height: 10vh;
    width: 100%;
    background-color: #3B3E46;
    position: absolute;
    top: 0;
    left: 0;
    padding: 1vh;
    display: flex;
    align-items: center;
    overflow-x: auto;
    gap: 1vh;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ChatHeader = styled.div`
    display: flex;
    align-items: center;
`;

const GroupChatHeader = styled.div`
    display: flex;
    flex-direction: column;
`

const ChatName = styled.h1`
    color: white;
    font-size: 3.5vh;
    font-weight: 700;
    margin-left: 1.5vh;
`;

const UserProfilePic = styled.img`
    height: 6vh;
    width: 6vh;
    border-radius: 50%;
`;

const UserProfileName = styled.h1`
    color: white;
    margin-left: 1.5vh;
    font-weight: 500;
    font-size: 1.3rem;
`;

const GroupUsersName = styled.h1`
    color: #c3c3c3;
    margin-left: 1.5vh;
    font-weight: 400;
    font-size: 2vh;
`;

const GroupChatNameContainer = styled.div`
    display: flex;
    height: 100%;
    margin: .5rem 0;
`;

export default Chat;
