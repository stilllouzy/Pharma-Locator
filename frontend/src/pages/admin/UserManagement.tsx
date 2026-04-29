import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "pharmacy" | "admin";
  isVerified: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔷 FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search },
      });

      setUsers(res.data);
    } catch (error) {
      console.log("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // 🔷 ACTIONS
  const toggleVerify = async (id: string) => {
    try {
      await api.put(
        `/admin/users/${id}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          User Management
        </Typography>
        <Typography variant="caption" color="gray">
          Manage system users
        </Typography>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search users..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ backgroundColor: "white", borderRadius: 2, mb: 2 }}
      />

      {/* LOADING STATE */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading users...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && users.length === 0 && (
        <Typography color="gray">
          No users found.
        </Typography>
      )}

      {/* USERS GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        {users.map((user) => (
          <Card key={user._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              <Typography sx={{ fontWeight: "bold" }}>
                {user.name}
              </Typography>

              <Typography variant="body2">{user.email}</Typography>

              <Typography
                variant="caption"
                sx={{
                  color:
                    user.role === "admin"
                      ? "red"
                      : user.role === "pharmacy"
                      ? "green"
                      : "gray",
                }}
              >
                {user.role.toUpperCase()}
              </Typography>

              <Typography variant="caption" sx={{ display: "block" }}>
                Status: {user.isVerified ? "Verified" : "Not Verified"}
              </Typography>

              {/* ACTIONS */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => toggleVerify(user._id)}
                >
                  {user.isVerified ? "Unverify" : "Verify"}
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => deleteUser(user._id)}
                >
                  Delete
                </Button>
              </Box>

            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}