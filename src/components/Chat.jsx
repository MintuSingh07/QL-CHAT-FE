import React, { useState, useEffect, useRef } from 'react';
import { gql, useQuery, useMutation, useSubscription, useLazyQuery } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import styled from 'styled-components';
import User from './User';

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

const SEARCH_USER = gql`
    query SearchUserByNameAndEmail($search: String) {
        searchUsers(search: $search) {
            _id
            userName
            email
            pic
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

const ADD_USERS = gql`
    mutation AddMemberToGroup($userId: ID!, $chatId: ID!) {
        addMemberToGroup(userId: $userId, chatId: $chatId) {
            chatName
            users {
                userName
            }
        }
    }
`;

const Chat = ({ chatId }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [showMemberPopup, setShowMemberPopup] = useState(false);
    const [showSearchedResult, setShowSearchedResult] = useState([]);
    const [searchedTerm, setSearchedTerm] = useState('');
    const [mutationError, setMutationError] = useState([]);
    const [refresh, setRefresh] = useState(false); // New state to trigger refresh
    const messageRef = useRef();

    const { data, loading, error, refetch } = useQuery(FETCH_SINGLE_CHAT, {
        variables: { chatId },
        onCompleted: (data) => {
            setMessages(data.fetchSingleChatMessages);
        },
    });

    const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
        onError: (error) => {
            setMutationError(error.message);
        },
    });

    useSubscription(SUBSCRIPTION, {
        variables: { chatId },
        onSubscriptionData: ({ subscriptionData }) => {
            const newMessage = subscriptionData.data.messageAdded;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        },
    });

    const [addUserMutation] = useMutation(ADD_USERS, {
        onCompleted: () => {
            setRefresh(!refresh); // Toggle refresh state
        },
        onError: (error) => {
            setMutationError(error.message);
        }
    });

    const [searchUsers, { data: searchData, loading: searchLoading, error: searchError }] = useLazyQuery(SEARCH_USER, {
        onCompleted: (data) => {
            setShowSearchedResult(data.searchUsers);
        },
    });

    useEffect(() => {
        if (searchedTerm.trim()) {
            searchUsers({ variables: { search: searchedTerm } });
        }
    }, [searchedTerm]);

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

    useEffect(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    // Refetch data when refresh state changes
    useEffect(() => {
        refetch();
    }, [refresh, refetch]);

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
                chatId,
                content: messageInput,
            },
        });
        setMessageInput('');
    };

    const handleAddUser = (userId) => {
        addUserMutation({
            variables: {
                chatId,
                userId,
            }
        });
    };

    const handleAddMemberPopup = () => {
        setShowMemberPopup(!showMemberPopup);
    };

    setTimeout(() => {
        setMutationError('')
    }, 5000);

    return (
        <>
            {isLoggedIn ? (
                <ChatContainer>
                    <UserIndicator>
                        <ChatHeader>
                            {chatData?.isGroupChat ? (
                                <GroupChatHeader>
                                    <div>
                                        <ChatName>{chatData.chatName}</ChatName>
                                        <GroupChatNameContainer>
                                            {(() => {
                                                const allUsers = [currentUser, ...chatData.users.filter(user => user.userName !== currentUser)];
                                                const displayUsers = allUsers.slice(0, 3);
                                                const remainingCount = allUsers.length - displayUsers.length;

                                                return (
                                                    <>
                                                        {displayUsers.map((user, index) => (
                                                            <GroupUsersName key={index}>
                                                                {user === currentUser ? 'You' : user.userName}
                                                            </GroupUsersName>
                                                        ))}
                                                        {remainingCount > 0 && <GroupUsersName>and {remainingCount}+</GroupUsersName>}
                                                    </>
                                                );
                                            })()}
                                        </GroupChatNameContainer>

                                    </div>
                                    <div>
                                        <button onClick={handleAddMemberPopup} style={{ backgroundColor: "#353944", padding: "1vh", border: "0", outline: "0", borderRadius: "1vh", cursor: "pointer" }}>
                                            <i style={{ color: "white", fontSize: "2.5vh" }} className="fa-solid fa-user-plus"></i>
                                        </button>
                                    </div>
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
                        <div ref={messageRef}></div>
                    </MessageContainer>
                    <SendInputDiv>
                        <input
                            type="text"
                            placeholder="Message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </SendInputDiv>
                    {showMemberPopup && (
                        <MemberAddContainer>
                            <i onClick={handleAddMemberPopup} style={{ float: "right", fontWeight: "900", cursor: 'pointer', display: "block" }} className="fa-solid fa-x"></i>
                            <h3>Add User</h3>
                            <div>
                                <input value={searchedTerm} onChange={(e) => setSearchedTerm(e.target.value)} type="text" placeholder='Search user by name or email...' />
                            </div>
                            <div className="user-list-container">
                                {searchLoading && <p>Loading...</p>}
                                {mutationError && <p style={{ color: "red" }}>{mutationError}</p>}
                                {showSearchedResult.map((user) => (
                                    <User
                                        key={user._id}
                                        email={user.email}
                                        pic={user.pic}
                                        userName={user.userName}
                                        textColor={"black"}
                                        cardWidth={"100%"}
                                        onClick={() => handleAddUser(user._id)}
                                    />
                                ))}
                            </div>
                            {searchError && <p>Error: {searchError.message}</p>}
                        </MemberAddContainer>
                    )}
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
    width: 100%;
`;

const GroupChatHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;

`;

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
    font-size: 2vh;
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
    margin: .5vh 0;
`;

const MemberAddContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 40vh;
    width: 65vh;
    background-color: #fff;
    border-radius: 1vh;
    padding: 2vh;

    input {
        margin-top: 4vh;
        width: 100%;
        padding: 1vh 0 1vh 0.5vh;
    }

    button {
        margin-left: 1vh;
        padding: 1vh 1vh;
    }

    .user-list-container {
        max-height: 20vh; /* Adjust based on your design */
        overflow-y: auto;
        margin-top: 2vh;
    }

`;

export default Chat;
