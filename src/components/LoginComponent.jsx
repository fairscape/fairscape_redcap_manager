import React, { useState, useEffect } from "react";
import styled from "styled-components";

const accentColor = "#007bff";
const accentColorHover = "#0056b3";

const LoginContainer = styled.div`
  border-top: 1px solid #282828;
  padding-top: 10px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  background-color: #282828;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  &::placeholder {
    color: #888;
  }
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: ${accentColor};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${accentColorHover};
  }
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled(Button)`
  margin-bottom: 10px;
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: #ff4d4d;
  margin-top: 10px;
  font-size: 0.9em;
`;

function LoginComponent({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // Set the API URL from environment variable
    setApiUrl(process.env.REACT_APP_API_URL || "http://localhost:8080/api");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          // Store the token in localStorage
          localStorage.setItem("authToken", data.access_token);
          // Call onLogin with the user data and token
          onLogin({ ...data, token: data.access_token });
          setIsOpen(false);
        } else {
          setError("Login successful, but no token received.");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <LoginContainer>
      <ToggleButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close Login" : "Login"}
      </ToggleButton>
      {isOpen && (
        <>
          <LoginForm onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={!username || !password}>
              Submit
            </Button>
          </LoginForm>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
    </LoginContainer>
  );
}

export default LoginComponent;
