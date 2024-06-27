import React, { useEffect, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        _id
        email
        userName
      }
      token
    }
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const [handleLogin, { error, loading, data }] = useMutation(LOGIN_USER);

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin({ variables: { email, password } });
  };

  useEffect(() => {
    if (data) {
      localStorage.setItem('credentials', data.login.token);
      navigate('/');
    }
  }, [data, navigate]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <CardContainer>
      <form onSubmit={onSubmit}>
        <h1>Login</h1>
        <label htmlFor="email">Email:</label>
        <input
          required
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <label htmlFor="password">Password:</label>
        <input
          required
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <div style={{ width: "100%", marginTop: ".5rem" }}>
          <p>Don't have an account? <Link to="/signup">SignUp</Link></p>
        </div>
        {loading && <h1>Loading...</h1>}
        {showError && <ErrorText>{error.message}*</ErrorText>}
        <button type="submit">Submit</button>
      </form>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  height: 100vh;
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 2rem;
    text-align: center;
  }
  
  label {
    margin-top: .5rem;
  }

  form {
    width: 30vw;
    background-color: #ffffff;
    border-radius: .5rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  input {
    padding: 1.5rem 1rem;
    width: 100%;
    border-radius: .3rem;
    border: 1px solid black;
    outline: 0;
  }

  button {
    padding: 1.5rem;
    bottom: 1rem;
    width: 100%;
    margin-top: 2rem;
    border: 0;
    border-radius: .5rem;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    &:hover {
      background-color: #0056b3;
    }
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: .5rem;
  font-size: 1rem;
`;

export default LoginPage;
