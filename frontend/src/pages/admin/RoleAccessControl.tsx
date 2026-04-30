import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useState } from "react";

type Role = "admin" | "pharmacy" | "user" | "rider"; // ✅ add rider

interface Permission {
  name: string;
  description: string;
}

interface RoleData {
  role: Role;
  permissions: Permission[];
}

export default function RoleAccessControl() {
  const [roles] = useState<RoleData[]>([
    {
      role: "admin",
      permissions: [
        { name: "Manage Users", description: "Create, update, delete users" },
        { name: "Manage Pharmacies", description: "Approve and manage pharmacies" },
        { name: "View Analytics", description: "Access system reports" },
        { name: "Manage Orders", description: "Control all orders" },
      ],
    },
    {
      role: "pharmacy",
      permissions: [
        { name: "Manage Medicines", description: "Add and update stock" },
        { name: "View Orders", description: "View incoming orders" },
      ],
    },
    {
      role: "user",
      permissions: [
        { name: "Browse Medicines", description: "View available medicines" },
        { name: "Place Orders", description: "Create purchase orders" },
      ],
    },
    {
  role: "rider",
  permissions: [
    { name: "View Deliveries", description: "See assigned delivery orders" },
    { name: "Update Delivery Status", description: "Update pickup, on the way, delivered" },
    { name: "View Delivery History", description: "Access past completed deliveries" },
    { name: "View Delivery Map", description: "Navigate to customer location" },
  ],
},
  ]);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Role & Access Control
        </Typography>
        <Typography variant="caption" color="gray">
          Manage system roles and permissions
        </Typography>
      </Box>

      {/* ROLE CARDS */}
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
        {roles.map((roleItem) => (
          <Card key={roleItem.role} sx={{ borderRadius: 3 }}>

            <CardContent>

              {/* ROLE TITLE */}
              <Typography
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                {roleItem.role}
              </Typography>

              {/* PERMISSIONS */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {roleItem.permissions.map((perm, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#f0f0f0",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                      {perm.name}
                    </Typography>

                    <Typography variant="caption" color="gray">
                      {perm.description}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* ACTION BUTTON */}
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                fullWidth
              >
                Edit Permissions
              </Button>

            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}