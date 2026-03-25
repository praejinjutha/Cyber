import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { canAccessUnit } from "../lib/unitAccess.js";

export default function ProtectedUnitRoute({ unitNo, children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let alive = true;

    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          if (alive) setStatus("noauth");
          return;
        }

        const user = data?.session?.user;
        if (!user) {
          if (alive) setStatus("noauth");
          return;
        }

        const result = await canAccessUnit(user.id, unitNo);

        if (!alive) return;
        setStatus(result.allowed ? "allowed" : "denied");
      } catch (err) {
        console.error("ProtectedUnitRoute error:", err);
        if (alive) setStatus("denied");
      }
    };

    check();

    return () => {
      alive = false;
    };
  }, [unitNo]);

  if (status === "checking") {
    return <div style={{ padding: 24 }}>กำลังตรวจสอบสิทธิ์การเข้าเรียน...</div>;
  }

  if (status === "noauth") {
    return <Navigate to="/login" replace />;
  }

  if (status === "denied") {
    return <Navigate to="/lessons" replace />;
  }

  return children || <Outlet />;
}