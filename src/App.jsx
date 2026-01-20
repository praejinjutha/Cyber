import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./lib/supabase";

// ====================
// Pages
// ====================
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Pretest from "./pages/Pretest";
import Main from "./pages/Main";
import Lessons from "./pages/Lessons";
import LessonLinear from "./pages/LessonLinear";

import Dashboard from "./pages/Dashboard";
import DashScore from "./pages/DashScore";
import Survey from "./pages/Survey";
import LoginAdmin from "./pages/LoginAdmin";
import DataAdmin from "./pages/DataAdmin";
import Feedback from "./pages/Feedback";

// Unit 1
import Learn from "./pages/Unit1/Learn.jsx";
import Learn1 from "./pages/Unit1/Learn1";
import HighlightTask from "./pages/Unit1/pages/Unit1_3/HighlightTask.jsx";
import Learn2 from "./pages/Unit1/Learn2";
import Learn3 from "./pages/Unit1/Learn3";
import Learn4 from "./pages/Unit1/Learn4";
import Learn5 from "./pages/Unit1/Learn5";
import PosttestRun from "./pages/Unit1/PosttestRun";

// Unit 2
import LearnUnit2 from "./pages/Unit2/Learn"; 
import Learn1Unit2 from "./pages/Unit2/Learn1"; 
import Learn2Unit2 from "./pages/Unit2/Learn2"; 
import Learn3Unit2 from "./pages/Unit2/Learn3"; 
import Examples from "./pages/Unit2/Examples"; 
import Unit2PosttestRun from "./pages/Unit2/PosttestRun";

// ====================
// Protected wrapper
// ====================
function ProtectedRoute({ session }) {
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ====================
// Admin Guard
// ====================
function AdminRoute({ session }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      try {
        // ✅ ใช้ maybeSingle เพื่อป้องกัน Database Error querying schema
        const { data } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("user_id", session.user.id)
          .maybeSingle(); 

        setIsAdmin(data?.is_admin || false);
      } catch (e) {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [session]);

  if (isAdmin === null) return <div style={{ padding: 24, color: "white" }}>Checking Permission...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

// ====================
// Gate Status Hook
// ====================
function useGateStatus(session) {
  const [state, setState] = useState({
    loading: true,
    profileComplete: false,
    hasPretest: false,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!session?.user?.id) {
        if (alive) {
          setState({ loading: false, profileComplete: false, hasPretest: false });
        }
        return;
      }

      const uid = session.user.id;

      try {
        // 1) Profile
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", uid)
          .maybeSingle(); // ✅ แก้จุดเสี่ยง Error 500

        const profileComplete = !!(
          profile?.first_name?.trim() && profile?.last_name?.trim()
        );

        // 2) Pretest
        const { data: pretest } = await supabase
          .from("pretest_results")
          .select("id")
          .eq("user_id", uid)
          .maybeSingle();

        if (alive) {
          setState({
            loading: false,
            profileComplete,
            hasPretest: !!pretest,
          });
        }
      } catch {
        if (alive) setState((prev) => ({ ...prev, loading: false }));
      }
    })();

    return () => {
      alive = false;
    };
  }, [session?.user?.id]);

  return state;
}

// ====================
// Gate: Pretest allowed
// ====================
function RequireCanDoPretest({ session }) {
  const { loading, profileComplete, hasPretest } = useGateStatus(session);

  if (loading) return <div style={{ padding: 24, color: "white" }}>Checking Status...</div>;
  if (!profileComplete) return <Navigate to="/profile" replace />;
  if (hasPretest) return <Navigate to="/main" replace />;

  return <Outlet />;
}

// ====================
// Gate: Pretest done
// ====================
function RequirePretestDone({ session }) {
  const { loading, profileComplete, hasPretest } = useGateStatus(session);

  if (loading) return <div style={{ padding: 24, color: "white" }}>Verifying Access...</div>;
  if (!profileComplete) return <Navigate to="/profile" replace />;
  if (!hasPretest) return <Navigate to="/pretest" replace />;

  return <Outlet />;
}

// ====================
// Wrapper สำหรับ Unit 1.3
// ====================
function Unit13Wrapper() {
  const navigate = useNavigate();

  return (
    <HighlightTask
      onComplete={(r) => {
        console.log("complete 1.3", r);
      }}
      onNext={() => {
        navigate("/unit1/learn/1.4");
      }}
    />
  );
}

// ====================
// Placeholder Unit 1.4
// ====================
function Unit14Placeholder() {
  return (
    <div style={{ padding: 24, color: "white" }}>
      <h2>Unit 1.4 (กำลังพัฒนา)</h2>
      <p>หน้านี้เป็น placeholder ชั่วคราว</p>
      <a href="/unit1/learn">← กลับไป Unit 1</a>
    </div>
  );
}

// ====================
// App
// ====================
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: "white" }}>Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* Admin */}
        <Route element={<AdminRoute session={session} />}>
          <Route path="/admin/data" element={<DataAdmin />} />
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute session={session} />}>
          <Route path="/profile" element={<Profile />} />

          <Route element={<RequireCanDoPretest session={session} />}>
            <Route path="/pretest" element={<Pretest />} />
          </Route>

          <Route element={<RequirePretestDone session={session} />}>
            <Route path="/main" element={<Main />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/LessonLinear" element={<LessonLinear />} />

            {/* Unit 1 */}
            <Route path="/unit1/learn" element={<Learn />} />
            <Route path="/unit1/learn1" element={<Learn1 />} />
            <Route path="/unit1/learn/1.3" element={<Unit13Wrapper />} />
            <Route path="/unit1/learn/1.4" element={<Unit14Placeholder />} />
            <Route path="/unit1/learn2" element={<Learn2 />} />
            <Route path="/unit1/learn3" element={<Learn3 />} />
            <Route path="/unit1/learn4" element={<Learn4 />} />
            <Route path="/unit1/learn5" element={<Learn5 />} />
            <Route path="/unit1/posttest" element={<PosttestRun />} />

            {/* Unit 2 */}
            <Route path="/unit2/learn" element={<LearnUnit2 />} /> 
            <Route path="/unit2/learn1" element={<Learn1Unit2 />} /> 
            <Route path="/unit2/learn2" element={<Learn2Unit2 />} />
            <Route path="/unit2/learn3" element={<Learn3Unit2 />} />
            <Route path="/unit2/Examples" element={<Examples />} />
            <Route path="/unit2/posttest" element={<Unit2PosttestRun />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashScore" element={<DashScore />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/survey" element={<Survey />} />
          </Route>
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}