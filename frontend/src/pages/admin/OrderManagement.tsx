import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  Divider,
  Chip,
  Skeleton,
  InputAdornment,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import StoreIcon from "@mui/icons-material/Store";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IOrder {
  _id: string;
  user: { name: string; email: string };
  pharmacy: { name: string };
  rider?: { _id: string; name: string };
  totalPrice: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: string;
  deliveryStatus: string;
  deliveryMethod: string;
  createdAt: string;
}

interface IRider {
  _id: string;
  name: string;
  email: string;
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function OrderStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: "warning" | "info" | "success" | "error" | "default" }> = {
    pending:   { label: "Pending",   color: "warning" },
    preparing: { label: "Preparing", color: "info"    },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "error"   },
  };
  const config = map[status] ?? { label: status, color: "default" };
  return <Chip label={config.label} color={config.color} size="small" />;
}

// ─── Payment chip ─────────────────────────────────────────────────────────────
function PaymentChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
    paid:     { label: "Paid",     color: "success" },
    unpaid:   { label: "Unpaid",   color: "warning" },
    refunded: { label: "Refunded", color: "default" },
  };
  const config = map[status] ?? { label: status, color: "default" };
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
}

// ─── Info row inside card ─────────────────────────────────────────────────────
function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ color: "text.disabled", display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [riders, setRiders] = useState<IRider[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter },
      });
      setOrders(res.data);
    } catch (error) {
      console.log("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await api.get("/admin/riders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRiders(res.data);
    } catch (error) {
      console.log("Error fetching riders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(
        `/admin/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    try {
      await api.put(
        `/admin/orders/${orderId}/assign-rider`,
        { riderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
            Order & Reservation Management
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
            Track and manage all system orders
          </Typography>
        </Box>

        {/* Live count badge */}
        {!loading && (
          <Chip
            icon={<ShoppingCartIcon sx={{ fontSize: "14px !important" }} />}
            label={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ mt: 0.5, backgroundColor: "#EEF4FB", color: "#0D3B6E", fontWeight: 500 }}
          />
        )}
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <FilterListIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 180, backgroundColor: "white" }}
        >
          <MenuItem value="">All orders</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="preparing">Preparing</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </Box>

      {/* Loading skeletons */}
      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={200} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && (
        <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <ShoppingCartIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No orders found.
          </Typography>
          {statusFilter && (
            <Typography variant="caption" color="text.disabled">
              Try a different filter.
            </Typography>
          )}
        </Box>
      )}

      {/* Orders grid */}
      {!loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent sx={{ px: "20px !important", py: "16px !important" }}>

                {/* Top row: customer name + status chips */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1.25,
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                      {order.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.user?.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <OrderStatusChip status={order.status} />
                    <PaymentChip status={order.paymentStatus} />
                  </Box>
                </Box>

                {/* Order details */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
                  <InfoRow
                    icon={<LocalPharmacyIcon sx={{ fontSize: 13 }} />}
                    text={order.pharmacy?.name ?? "—"}
                  />
                  <InfoRow
                    icon={order.deliveryMethod === "delivery"
                      ? <TwoWheelerIcon sx={{ fontSize: 13 }} />
                      : <StoreIcon sx={{ fontSize: 13 }} />
                    }
                    text={order.deliveryMethod === "delivery" ? "Delivery" : "Pick-up"}
                  />
                  {order.deliveryMethod === "delivery" && order.deliveryStatus && (
                    <InfoRow
                      icon={<TwoWheelerIcon sx={{ fontSize: 13 }} />}
                      text={`Delivery: ${order.deliveryStatus}`}
                    />
                  )}
                  {order.rider && (
                    <InfoRow
                      icon={<PersonIcon sx={{ fontSize: 13 }} />}
                      text={`Rider: ${order.rider.name}`}
                    />
                  )}
                </Box>

                {/* Price */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: "8px",
                    backgroundColor: "#F4F7FB",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Total amount
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary" }}>
                    ₱{order.totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Status actions */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: order.deliveryMethod === "delivery" ? 1.5 : 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => updateStatus(order._id, "preparing")}
                    sx={{ borderRadius: "8px", fontSize: "0.72rem", borderWidth: "0.5px", px: 1.25 }}
                  >
                    Preparing
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={() => updateStatus(order._id, "delivered")}
                    sx={{ borderRadius: "8px", fontSize: "0.72rem", borderWidth: "0.5px", px: 1.25 }}
                  >
                    Delivered
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => updateStatus(order._id, "cancelled")}
                    sx={{ borderRadius: "8px", fontSize: "0.72rem", borderWidth: "0.5px", px: 1.25 }}
                  >
                    Cancel
                  </Button>
                </Box>

                {/* Rider assignment — delivery orders only */}
                {order.deliveryMethod === "delivery" && (
                  <Box>
                    <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
                      Assign rider
                    </Typography>
                    <Select
                      displayEmpty
                      size="small"
                      fullWidth
                      value={order.rider?._id ?? ""}
                      onChange={(e) => assignRider(order._id, e.target.value)}
                      sx={{ backgroundColor: "white" }}
                      startAdornment={
                        <InputAdornment position="start">
                          <TwoWheelerIcon sx={{ fontSize: 16, color: "text.secondary", ml: 0.5 }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">Select a rider</MenuItem>
                      {riders.map((rider) => (
                        <MenuItem key={rider._id} value={rider._id}>
                          {rider.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                )}

              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}