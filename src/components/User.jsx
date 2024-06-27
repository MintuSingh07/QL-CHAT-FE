import React from 'react';
import styled from 'styled-components';

const User = ({ userName, latestMessage, pic, onClick }) => {
    return (
        <UserContainer onClick={onClick}>
            <Image src={pic} />
            <UserDetails>
                <UserName>{userName}</UserName>
                <RecentMessage>{latestMessage}</RecentMessage>
            </UserDetails>
        </UserContainer>
    );
};

const UserContainer = styled.div`
    height: 10vh;
    width: 90%;
    border-bottom: 1px solid #ffffff34;
    display: flex;
    align-items: center;
    padding: 1rem .5rem;
    border-radius: .5rem;
    cursor: pointer;
    &:hover {
        background-color: #7a7a7a6c;
    }
`;

const Image = styled.img`
    height: 6vh;
    width: 6vh;
    background-color: #fff;
    border-radius: 50%;
`;

const UserDetails = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 2rem;
    justify-content: center;
`;

const UserName = styled.h1`
    color: #ffffff;
    font-size: 1.5rem;
    margin-bottom: .5rem;
`;

const RecentMessage = styled.p`
    color: #bdbdbd;
`;

export default User;
