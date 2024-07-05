import React from 'react';
import styled from 'styled-components';

const User = ({ userName, latestMessage, pic, onClick, email, textColor, cardWidth }) => {
    return (
        <UserContainer style={{width: cardWidth}} onClick={onClick}>
            <Image src={pic} />
            <UserDetails>
                <UserName style={{color: textColor}}>{userName}</UserName>
                <RecentMessage>{latestMessage}</RecentMessage>
                <Email>{email}</Email>
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
    padding: 1vh 0.5vh;
    border-radius: 0.5vh;
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
    padding-left: 2vh;
    justify-content: center;
`;

const UserName = styled.h1`
    color: #ffffff;
    font-size: 2vh;
    margin-bottom: 0.5vh;
`;

const RecentMessage = styled.p`
    color: #bdbdbd;
`;

const Email = styled.p`
    color: #000000;
`

export default User;
