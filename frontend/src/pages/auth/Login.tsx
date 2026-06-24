import { useState,useRef } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../../api/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from "@mui/material";


export default function Login() {
  const [tab, setTab] = useState(0);

  // LOGIN STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showRegPassword, setShowRegPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // REGISTER STATE
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //EnterKey Nav
  const passwordRef = useRef<HTMLInputElement>(null);
const regEmailRef = useRef<HTMLInputElement>(null);
const regPasswordRef = useRef<HTMLInputElement>(null);
const confirmPasswordRef = useRef<HTMLInputElement>(null);
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
      localStorage.setItem("userId", user.id);

      if (user.role === "user") {
        window.location.href = "/user";
      } else if (user.role === "pharmacy") {
        window.location.href = "/pharmacy";
      } else if (user.role === "rider") {
        window.location.href = "/rider";
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  // REGISTER FUNCTION (USER ONLY)
 const handleRegister = async () => {
  if (regPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  try {
    await api.post("/auth/register", {
      name,
      email: regEmail,
      password: regPassword,
    });
    alert("Registration successful! Please login.");
    setTab(0);
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
       background:
  "linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
      }}
    >
    <Paper
  elevation={0}
  sx={{
    width: 420,
    p: 4,
    borderRadius: 4,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  }}
>
     <Box sx={{ textAlign: "center", mb: 3 }}>
  <Typography
    sx={{
      fontSize: 28,
      fontWeight: 700,
      color: "primary.main",
    }}
  >
    Pharma Locator
  </Typography>

  <Typography
    variant="body2"
    color="text.secondary"
  >
    Find medicines from nearby pharmacies
  </Typography>
</Box>

        {/* TABS */}
       <Tabs
  value={tab}
  onChange={(_, value) => setTab(value)}
  centered
  sx={{
    mb: 2,

    "& .MuiTabs-indicator": {
      height: 3,
      borderRadius: 10,
    },
  }}
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
  sx={{
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
}}
  onChange={(e) => setEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()} // ✅
/>

<TextField
  fullWidth
  label="Password"
  type={showPassword ? "text" : "password"}
  margin="normal"
  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
  inputRef={passwordRef}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

            <Button
  fullWidth
  variant="contained"
  disableElevation
  sx={{
    mt: 2,
    py: 1.2,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
  }}
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
  sx={{
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
}}
  inputRef={regEmailRef} // ✅
  onChange={(e) => setRegEmail(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && regPasswordRef.current?.focus()} // ✅
/>

<TextField
  fullWidth
  label="Password"
  type={showRegPassword ? "text" : "password"}
  margin="normal"
  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
  inputRef={regPasswordRef}
  onChange={(e) => setRegPassword(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && confirmPasswordRef.current?.focus()}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowRegPassword((prev) => !prev)} edge="end">
            {showRegPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>
<TextField
  fullWidth
  label="Confirm Password"
  type={showConfirmPassword ? "text" : "password"}
  margin="normal"
  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
  inputRef={confirmPasswordRef}
  onChange={(e) => setConfirmPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>
            <Button
  fullWidth
  variant="contained"
  disableElevation
  sx={{
    mt: 2,
    py: 1.2,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
  }}
  onClick={handleRegister}
>
  Create Account
</Button>
          </>
        )}
      </Paper>
    </Box>
  );
}