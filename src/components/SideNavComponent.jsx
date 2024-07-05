import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components'

const SideNavComponent = () => {
    const [user, setUser] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('credentials');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUser(decodedToken);
        } else {
            setUser(null);
            navigate('/login');
        }
    }, [navigate]);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        const sideNav = document.getElementById('sidenav');
        sideNav.style.width = isCollapsed ? '6vw' : '30vw';
        sideNav.style.alignItems = isCollapsed ? 'center' : 'flex-start';
        sideNav.style.padding = isCollapsed ? '0' : '1rem';
    };

    const handleLogout = () => {
        localStorage.removeItem('credentials');
        navigate('/login');
    };

    return (
        <SideNav id="sidenav">
            <i
                onClick={handleToggleCollapse}
                style={{ color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                className="fa-solid fa-bars"
            ></i>
            <Image style={{ marginTop: '5vh' }} src={user?.pic} />
            <i
                style={{ color: 'white', fontSize: '2rem', cursor: 'pointer', marginTop: '5vh' }}
                className="fa-solid fa-comments"
                onClick={()=> navigate('/')}
            ></i>
            <i
                style={{ color: 'white', fontSize: '2rem', cursor: 'pointer', marginTop: '5vh' }}
                className="fa-brands fa-squarespace"
            ></i>
            <i style={{ color: 'white', fontSize: '2rem', cursor: 'pointer', marginTop: '5vh' }}
                className="fa-solid fa-user-plus" onClick={()=> navigate('/add-friend')}></i>
            <i
                className="fa-solid fa-right-from-bracket"
                style={{
                    color: 'white',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    position: 'absolute',
                    bottom: '1rem',
                }}
                onClick={handleLogout}
            ></i>
        </SideNav>
    )
};

const SideNav = styled.div`
  height: 100%;
  width: 6vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  background-color: #23262f;
  position: relative;
`;

const Image = styled.img`
  height: 6vh;
  width: 6vh;
  background-color: #fff;
  border-radius: 50%;
`;

export default SideNavComponent