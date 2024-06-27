import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const SIGNUP_USER = gql`
  mutation signupUser($userName: String!, $email: String!, $password: String!) {
    signup(userName: $userName, email: $email, password: $password) {
      user {
        userName
        email
      }
      token
    }
  }
`;

const SignupPage = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const [handleSignup, { error, loading, data }] = useMutation(SIGNUP_USER);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSignup({ variables: { userName, email, password } });
  };

  useEffect(() => {
    if (data) {
      navigate('/login');
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
      <FormContainer>
        <Form onSubmit={onSubmit}>
          <h1 style={{textAlign: "center", marginBottom: "1rem"}}>Sign Up</h1>
          <Label htmlFor="username">Username:</Label>
          <InputField
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your username"
          />
          <Label htmlFor="email">Email:</Label>
          <InputField
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <Label htmlFor="password">Password:</Label>
          <InputField
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {loading && <LoadingText>Loading...</LoadingText>}
          {showError && <ErrorText>{error.message}</ErrorText>}
          <p style={{marginBottom: "1rem"}}>Already have an account? <StyledLink to="/login">Login</StyledLink></p>
          <SubmitButton type="submit">Submit</SubmitButton>
        </Form>
      </FormContainer>
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
`;

const FormContainer = styled.div`
  width: 30vw;
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
`;

const InputField = styled.input`
  padding: 1.5rem;
  width: 100%;
  border-radius: 0.3rem;
  border: 1px solid black;
  outline: 0;
  margin-bottom: 1rem;
`;

const SubmitButton = styled.button`
  padding: 1.5rem;
  margin-top: 1rem;
  width: 100%;
  border: 0;
  border-radius: 0.5rem;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingText = styled.h1`
  font-size: 1.5rem;
  text-align: center;
`;

const ErrorText = styled.h1`
  color: red;
  font-size: 1.5rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000000;
  font-size: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

export default SignupPage;
