import { useState,useRef } from "react";

import api from "../../api/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";


export default function Login() {
  const [tab, setTab] = useState(0);

  // LOGIN STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // REGISTER STATE
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  //EnterKey Nav
  const passwordRef = useRef<HTMLInputElement>(null);
const regEmailRef = useRef<HTMLInputElement>(null);
const regPasswordRef = useRef<HTMLInputElement>(null);
  // LOGIN FUNCTION
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      if (user.role === "user") {
        window.location.href = "/user";
      } else if (user.role === "pharmacy") {
        window.location.href = "/pharmacy";
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  // REGISTER FUNCTION (USER ONLY)
  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email: regEmail,
        password: regPassword,
      });

      alert("Registration successful! Please login.");
      setTab(0); // switch back to login
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 400,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
          Pharma Locator System
        </Typography>

        {/* TABS */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* LOGIN FORM */}
        {tab === 0 && (
          <>
          <TextField
  fullWidth
  label="Email"
  margin="normal"
  onChange={(e) => setEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()} // ✅
/>

<TextField
  fullWidth
  label="Password"
  type="password"
  margin="normal"
  inputRef={passwordRef} // ✅
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
/>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </>
        )}

        {/* REGISTER FORM */}
        {tab === 1 && (
          <>
         <TextField
  fullWidth
  label="Full Name"
  margin="normal"
  onChange={(e) => setName(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && regEmailRef.current?.focus()} // ✅
/>

<TextField
  fullWidth
  label="Email"
  margin="normal"
  inputRef={regEmailRef} // ✅
  onChange={(e) => setRegEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && regPasswordRef.current?.focus()} // ✅
/>

<TextField
  fullWidth
  label="Password"
  type="password"
  margin="normal"
  inputRef={regPasswordRef} // ✅
  onChange={(e) => setRegPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
/>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
