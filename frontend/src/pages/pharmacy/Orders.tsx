import { useEffect, useState } from "react";
import api from "../../api/api";

// ─── Types (mirrored from Order.ts) ──────────────────────────────────────────
interface IOrderItem {
  _id: string;
  medicine: { _id: string; name: string; price: number };
  quantity: number;
  price: number;
}

interface IOrder {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: IOrderItem[];
  totalPrice: number;
  paymentMethod: "gcash";
  paymentStatus: "unpaid" | "paid" | "refunded";
  referenceNumber?: string;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  deliveryStatus: "unassigned" | "assigned" | "picked_up" | "on_the_way" | "delivered";
  deliveryAddress?: string;
  proofOfDelivery?: { imageUrl: string | null; uploadedAt: string | null };
  createdAt: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY    = "#0D3B6E";
const TEAL    = "#5BC4A0";
const SURFACE = "#F4F7FB";
const T_PRI   = "#0D1B2A";
const T_SEC   = "#546E7A";
const T_DIS   = "#90A4AE";

// ─── Status configs ───────────────────────────────────────────────────────────
// Order status — what the pharmacy can set via PUT /:id/status
const ORDER_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "#FFF8E1", color: "#F57F17", label: "Pending"   },
  preparing: { bg: "#E3F2FD", color: "#1565C0", label: "Preparing" },
  delivered: { bg: "#E8F5E9", color: "#2E7D32", label: "Delivered" },
  cancelled: { bg: "#FFEBEE", color: "#C62828", label: "Cancelled" },
};

const PAYMENT_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  unpaid:   { bg: "#FFEBEE", color: "#C62828", label: "Unpaid"   },
  paid:     { bg: "#E8F5E9", color: "#2E7D32", label: "Paid"     },
  refunded: { bg: "#F3E5F5", color: "#6A1B9A", label: "Refunded" },
};

const DELIVERY_STATUS: Record<string, { label: string }> = {
  unassigned: { label: "Unassigned" },
  assigned:   { label: "Assigned"   },
  picked_up:  { label: "Picked up"  },
  on_the_way: { label: "On the way" },
  delivered:  { label: "Delivered"  },
};

// Pharmacy can only move order through: pending → preparing → delivered, or → cancelled
// Cannot change if already delivered or cancelled
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:   ["preparing", "cancelled"],
  preparing: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// ─── Shared primitives ────────────────────────────────────────────────────────
function Chip({ status, map }: { status: string; map: Record<string, { bg: string; color: string; label: string }> }) {
  const s = map[status] ?? { bg: "#F0F4F8", color: T_SEC, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "0 10px", height: 24, borderRadius: 20,
      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", whiteSpace: "nowrap",
      backgroundColor: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 4px", fontSize: "0.65rem", fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", color: T_SEC,
    }}>{children}</p>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDrawer({
  order,
  onClose,
  onStatusChange,
  updating,
}: {
  order: IOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
}) {
  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  const canChange = allowed.length > 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(13,27,42,0.35)",
          zIndex: 300,
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 420, backgroundColor: "#fff",
        boxShadow: "-8px 0 40px rgba(13,59,110,0.12)",
        zIndex: 301, display: "flex", flexDirection: "column",
        fontFamily: "DM Sans, Inter, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T_SEC }}>
              Order Details
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: T_PRI }}>
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: T_DIS }}>
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #E0E7EF", backgroundColor: "transparent",
              cursor: "pointer", color: T_SEC, fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Customer */}
          <Section title="Customer">
            <Row label="Name"  value={order.user?.name  ?? "—"} />
            <Row label="Email" value={order.user?.email ?? "—"} />
          </Section>

          {/* Status badges row */}
          <Section title="Status">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div>
                <Eyebrow>Order</Eyebrow>
                <Chip status={order.status} map={ORDER_STATUS} />
              </div>
              <div>
                <Eyebrow>Payment</Eyebrow>
                <Chip status={order.paymentStatus} map={PAYMENT_STATUS} />
              </div>
              {order.deliveryMethod === "delivery" && (
                <div>
                  <Eyebrow>Delivery</Eyebrow>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "0 10px", height: 24, borderRadius: 20,
                    fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                    backgroundColor: "#F0F4F8", color: T_SEC,
                  }}>
                    {DELIVERY_STATUS[order.deliveryStatus]?.label ?? order.deliveryStatus}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Items */}
          <Section title="Items">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.items.map((item) => (
                <div key={item._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", borderRadius: 8, backgroundColor: SURFACE,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: T_PRI }}>
                      {item.medicine?.name ?? "—"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: T_SEC }}>
                      ₱{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: T_PRI }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 8,
                backgroundColor: "#EEF4FB", marginTop: 4,
              }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: NAVY }}>Total</p>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: NAVY }}>
                  ₱{order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <Row label="Method"           value="GCash" />
            <Row label="Reference number" value={order.referenceNumber ?? "—"} />
          </Section>

          {/* Delivery */}
          <Section title="Delivery">
            <Row label="Method"  value={order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"} />
            {order.deliveryMethod === "delivery" && (
              <Row label="Address" value={order.deliveryAddress ?? "—"} />
            )}
          </Section>

          {/* Proof of Delivery (read-only — riders upload this) */}
          {order.proofOfDelivery?.imageUrl && (
            <Section title="Proof of Delivery">
              <img
                src={order.proofOfDelivery.imageUrl}
                alt="Proof of delivery"
                style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 200 }}
              />
              {order.proofOfDelivery.uploadedAt && (
                <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: T_DIS }}>
                  Uploaded {formatDate(order.proofOfDelivery.uploadedAt)}
                </p>
              )}
            </Section>
          )}
        </div>

        {/* Footer — status update action */}
        <div style={{
          padding: "16px 24px",
          borderTop: "0.5px solid rgba(0,0,0,0.07)",
          backgroundColor: "#fff",
        }}>
          {canChange ? (
            <>
              <Eyebrow>Update order status</Eyebrow>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {allowed.map((next) => {
                  const cfg = ORDER_STATUS[next];
                  const isPrimary = next !== "cancelled";
                  return (
                    <button
                      key={next}
                      onClick={() => onStatusChange(order._id, next)}
                      disabled={updating}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: 8,
                        border: isPrimary ? "none" : "1px solid #FFCDD2",
                        backgroundColor: isPrimary ? NAVY : "transparent",
                        color: isPrimary ? "#fff" : "#C62828",
                        fontSize: "0.82rem", fontWeight: 600,
                        cursor: updating ? "not-allowed" : "pointer",
                        opacity: updating ? 0.6 : 1,
                        fontFamily: "DM Sans, Inter, sans-serif",
                        transition: "opacity 0.15s",
                      }}
                    >
                      {updating ? "Updating…" : `Mark as ${cfg.label}`}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: "0.8rem", color: T_DIS, textAlign: "center" }}>
              This order is <strong style={{ color: T_SEC }}>{ORDER_STATUS[order.status]?.label}</strong> — no further actions available.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// Small helpers inside the drawer
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        margin: "0 0 10px", fontSize: "0.65rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: T_SEC, borderBottom: "0.5px solid rgba(0,0,0,0.07)",
        paddingBottom: 6,
      }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: "0.8rem", color: T_SEC }}>{label}</span>
      <span style={{ fontSize: "0.8rem", fontWeight: 500, color: T_PRI, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
const FILTER_TABS = ["all", "pending", "preparing", "delivered", "cancelled"] as const;
type FilterTab = typeof FILTER_TABS[number];

export default function Orders() {
  const [orders, setOrders]         = useState<IOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<FilterTab>("all");
  const [selectedOrder, setSelected] = useState<IOrder | null>(null);
  const [updating, setUpdating]     = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders/pharmacy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Newest first
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await api.put(
        `/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders();
      // Refresh the drawer with updated data
      setSelected(prev => prev ? { ...prev, status: status as IOrder["status"] } : null);
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  // Derived data
  const counts = Object.fromEntries(
    FILTER_TABS.map(f => [f, f === "all" ? orders.length : orders.filter(o => o.status === f).length])
  );
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  return (
    <div style={{ fontFamily: "DM Sans, Inter, sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>Orders</h2>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: T_SEC, lineHeight: 1.7 }}>
          Review and manage incoming customer orders
        </p>
      </div>

      {/* KPI summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {(["pending", "preparing", "delivered", "cancelled"] as const).map(s => {
          const cfg = ORDER_STATUS[s];
          return (
            <div
              key={s}
              onClick={() => setFilter(s)}
              style={{
                backgroundColor: "#fff", borderRadius: 10,
                padding: "14px 16px", cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                borderLeft: filter === s ? `3px solid ${cfg.color}` : "3px solid transparent",
                transition: "border-color 0.15s",
              }}
            >
              <p style={{ margin: "0 0 4px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T_SEC }}>
                {cfg.label}
              </p>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: cfg.color, lineHeight: 1.2 }}>
                {counts[s]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "none",
              cursor: "pointer", fontFamily: "DM Sans, Inter, sans-serif",
              fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize",
              backgroundColor: filter === f ? NAVY : "#fff",
              color: filter === f ? "#fff" : T_SEC,
              boxShadow: filter === f ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {f === "all" ? "All" : ORDER_STATUS[f]?.label ?? f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* States: loading / error / empty / list */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: T_DIS, fontSize: "0.875rem" }}>
          Loading orders…
        </div>
      )}

      {!loading && error && (
        <div style={{
          padding: "16px 20px", borderRadius: 10, backgroundColor: "#FFEBEE",
          color: "#C62828", fontSize: "0.875rem",
          display: "flex", gap: 12, alignItems: "center",
        }}>
          <span>⚠</span>
          <span>{error}</span>
          <button
            onClick={fetchOrders}
            style={{
              marginLeft: "auto", padding: "6px 14px", borderRadius: 8,
              border: "1px solid #FFCDD2", backgroundColor: "transparent",
              color: "#C62828", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "DM Sans, Inter, sans-serif",
            }}
          >Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: T_DIS, fontSize: "0.875rem" }}>
          {filter === "all" ? "No orders yet." : `No ${ORDER_STATUS[filter]?.label.toLowerCase()} orders.`}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: SURFACE }}>
                {["Order", "Customer", "Items", "Total", "Payment", "Order Status", "Delivery", ""].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: "0.65rem", fontWeight: 700, color: T_SEC,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    borderBottom: "1px solid #E8EEF4", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr
                  key={order._id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F0F4F8" : "none" }}
                >
                  {/* Order ID + date */}
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: T_PRI, fontSize: "0.8rem" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: T_DIS }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </td>

                  {/* Customer */}
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontWeight: 500, color: T_PRI }}>{order.user?.name ?? "—"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: T_DIS }}>{order.user?.email ?? ""}</p>
                  </td>

                  {/* Items summary */}
                  <td style={{ padding: "14px 16px", color: T_SEC, maxWidth: 180 }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: T_SEC }}>
                      {order.items.map(it => `${it.medicine?.name ?? "—"} ×${it.quantity}`).join(", ")}
                    </p>
                  </td>

                  {/* Total */}
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: T_PRI, whiteSpace: "nowrap" }}>
                    ₱{order.totalPrice.toFixed(2)}
                  </td>

                  {/* Payment status */}
                  <td style={{ padding: "14px 16px" }}>
                    <Chip status={order.paymentStatus} map={PAYMENT_STATUS} />
                  </td>

                  {/* Order status */}
                  <td style={{ padding: "14px 16px" }}>
                    <Chip status={order.status} map={ORDER_STATUS} />
                  </td>

                  {/* Delivery method */}
                  <td style={{ padding: "14px 16px", color: T_SEC, fontSize: "0.8rem", textTransform: "capitalize" }}>
                    {order.deliveryMethod}
                  </td>

                  {/* View button */}
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => setSelected(order)}
                      style={{
                        padding: "6px 14px", borderRadius: 6,
                        border: `1px solid ${NAVY}`, backgroundColor: "transparent",
                        color: NAVY, fontSize: "0.8rem", fontWeight: 600,
                        cursor: "pointer", fontFamily: "DM Sans, Inter, sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail drawer */}
      {selectedOrder && (
        <OrderDrawer
          order={orders.find(o => o._id === selectedOrder._id) ?? selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  );
}