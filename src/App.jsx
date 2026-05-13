import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import ProtectedUnitRoute from "./components/ProtectedUnitRoute.jsx";

// ====================
// Pages
// ====================
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Pretest from "./pages/Pretest";
import Final from "./pages/Final";
import Main from "./pages/Main";
import Lessons from "./pages/Lessons";
import Cybercases from "./pages/Cybercases";
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

// Unit 3
import LearnUnit3 from "./pages/Unit3/Learn";
import Learn1Unit3 from "./pages/Unit3/Learn1";
import Learn2Unit3 from "./pages/Unit3/Learn2";
import Learn3Unit3 from "./pages/Unit3/Learn3";
import Learn4Unit3 from "./pages/Unit3/Learn4";
import Learn5Unit3 from "./pages/Unit3/Learn5";
import Learn6Unit3 from "./pages/Unit3/Learn6";
import Unit3PosttestRun from "./pages/Unit3/PosttestRun";

// Unit 4
import LearnUnit4 from "./pages/Unit4/Learn";
import Learn1Unit4 from "./pages/Unit4/Learn1";
import Learn2Unit4 from "./pages/Unit4/Learn2";
import Learn3Unit4 from "./pages/Unit4/Learn3";
import Learn4Unit4 from "./pages/Unit4/Learn4";
import Learn5Unit4 from "./pages/Unit4/Learn5";
import Unit4PosttestRun from "./pages/Unit4/PosttestRun";

// Unit 5
import LearnUnit5 from "./pages/Unit5/Learn";
import Learn1Unit5 from "./pages/Unit5/Learn1";
import Learn2Unit5 from "./pages/Unit5/Learn2";
import Learn3Unit5 from "./pages/Unit5/Learn3";
import Learn4Unit5 from "./pages/Unit5/Learn4";
import Learn5Unit5 from "./pages/Unit5/Learn5";
import Learn6Unit5 from "./pages/Unit5/Learn6";
import Unit5PosttestRun from "./pages/Unit5/PosttestRun";

// Unit 6
import LearnUnit6 from "./pages/Unit6/Learn";
import Learn1Unit6 from "./pages/Unit6/Learn1";
import Learn2Unit6 from "./pages/Unit6/Learn2";
import Learn3Unit6 from "./pages/Unit6/Learn3";
import Learn4Unit6 from "./pages/Unit6/Learn4";
import Unit6PosttestRun from "./pages/Unit6/PosttestRun";

// Unit 7
import LearnUnit7 from "./pages/Unit7/Learn";
import Learn1Unit7 from "./pages/Unit7/Learn1";
import Learn2Unit7 from "./pages/Unit7/Learn2";
import Learn3Unit7 from "./pages/Unit7/Learn3";
import Learn4Unit7 from "./pages/Unit7/Learn4";
import Learn5Unit7 from "./pages/Unit7/Learn5";
import Unit7PosttestRun from "./pages/Unit7/PosttestRun";

// Unit 8
import LearnUnit8 from "./pages/Unit8/Learn";
import Learn1Unit8 from "./pages/Unit8/Learn1";
import Learn2Unit8 from "./pages/Unit8/Learn2";
import Learn3Unit8 from "./pages/Unit8/Learn3";
import Learn4Unit8 from "./pages/Unit8/Learn4";
import Learn5Unit8 from "./pages/Unit8/Learn5";
import Learn6Unit8 from "./pages/Unit8/Learn6";
import Unit8PosttestRun from "./pages/Unit8/PosttestRun";

import Group1 from "./pages/Case/Group1";
import Group2 from "./pages/Case/Group2";
import Group3 from "./pages/Case/Group3";
import Group4 from "./pages/Case/Group4";
import Group5 from "./pages/Case/Group5";
import Group6 from "./pages/Case/Group6";
import Group7 from "./pages/Case/Group7";

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
        const { data } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("user_id", session.user.id)
          .maybeSingle();

        setIsAdmin(data?.is_admin || false);
      } catch {
        setIsAdmin(false);
      }
    }

    checkAdmin();
  }, [session]);

  if (isAdmin === null) {
    return <div style={{ padding: 24, color: "white" }}>Checking Permission...</div>;
  }

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
          setState({
            loading: false,
            profileComplete: false,
            hasPretest: false,
          });
        }
        return;
      }

      const uid = session.user.id;

      try {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("first_name,last_name")
          .eq("user_id", uid)
          .maybeSingle();

        const profileComplete = !!(
          profile?.first_name?.trim() && profile?.last_name?.trim()
        );

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
        if (alive) {
          setState((prev) => ({ ...prev, loading: false }));
        }
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

  if (loading) {
    return <div style={{ padding: 24, color: "white" }}>Checking Status...</div>;
  }

  if (!profileComplete) return <Navigate to="/profile" replace />;
  if (hasPretest) return <Navigate to="/main" replace />;

  return <Outlet />;
}

// ====================
// Gate: Pretest done
// ====================
function RequirePretestDone({ session }) {
  const { loading, profileComplete, hasPretest } = useGateStatus(session);

  if (loading) {
    return <div style={{ padding: 24, color: "white" }}>Verifying Access...</div>;
  }

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
            <Route path="/cybercases" element={<Cybercases />} />
            <Route path="/final" element={<Final />} />
            <Route path="/LessonLinear" element={<LessonLinear />} />

            {/* Unit 1 */}
            <Route element={<ProtectedUnitRoute unitNo={1} />}>
              <Route path="/unit1/learn" element={<Learn />} />
              <Route path="/unit1/learn1" element={<Learn1 />} />
              <Route path="/unit1/learn/1.3" element={<Unit13Wrapper />} />
              <Route path="/unit1/learn/1.4" element={<Unit14Placeholder />} />
              <Route path="/unit1/learn2" element={<Learn2 />} />
              <Route path="/unit1/learn3" element={<Learn3 />} />
              <Route path="/unit1/learn4" element={<Learn4 />} />
              <Route path="/unit1/learn5" element={<Learn5 />} />
              <Route path="/unit1/posttest" element={<PosttestRun />} />
            </Route>

            {/* Unit 2 */}
            <Route element={<ProtectedUnitRoute unitNo={2} />}>
              <Route path="/unit2/learn" element={<LearnUnit2 />} />
              <Route path="/unit2/learn1" element={<Learn1Unit2 />} />
              <Route path="/unit2/learn2" element={<Learn2Unit2 />} />
              <Route path="/unit2/learn3" element={<Learn3Unit2 />} />
              <Route path="/unit2/Examples" element={<Examples />} />
              <Route path="/unit2/posttest" element={<Unit2PosttestRun />} />
            </Route>

            {/* Unit 3 */}
            <Route element={<ProtectedUnitRoute unitNo={3} />}>
              <Route path="/unit3/learn" element={<LearnUnit3 />} />
              <Route path="/unit3/learn1" element={<Learn1Unit3 />} />
              <Route path="/unit3/learn2" element={<Learn2Unit3 />} />
              <Route path="/unit3/learn3" element={<Learn3Unit3 />} />
              <Route path="/unit3/learn4" element={<Learn4Unit3 />} />
              <Route path="/unit3/learn5" element={<Learn5Unit3 />} />
              <Route path="/unit3/learn6" element={<Learn6Unit3 />} />
              <Route path="/unit3/posttest" element={<Unit3PosttestRun />} />
            </Route>

            {/* Unit 4 */}
            <Route element={<ProtectedUnitRoute unitNo={4} />}>
              <Route path="/unit4/learn" element={<LearnUnit4 />} />
              <Route path="/unit4/learn1" element={<Learn1Unit4 />} />
              <Route path="/unit4/learn2" element={<Learn2Unit4 />} />
              <Route path="/unit4/learn3" element={<Learn3Unit4 />} />
              <Route path="/unit4/learn4" element={<Learn4Unit4 />} />
              <Route path="/unit4/learn5" element={<Learn5Unit4 />} />
              <Route path="/unit4/posttest" element={<Unit4PosttestRun />} />
            </Route>

            {/* Unit 5 */}
            <Route element={<ProtectedUnitRoute unitNo={5} />}>
              <Route path="/unit5/learn" element={<LearnUnit5 />} />
              <Route path="/unit5/learn1" element={<Learn1Unit5 />} />
              <Route path="/unit5/learn2" element={<Learn2Unit5 />} />
              <Route path="/unit5/learn3" element={<Learn3Unit5 />} />
              <Route path="/unit5/learn4" element={<Learn4Unit5 />} />
              <Route path="/unit5/learn5" element={<Learn5Unit5 />} />
              <Route path="/unit5/learn6" element={<Learn6Unit5 />} />
              <Route path="/unit5/posttest" element={<Unit5PosttestRun />} />
            </Route>

            {/* Unit 6 */}
            <Route element={<ProtectedUnitRoute unitNo={6} />}>
              <Route path="/unit6/learn" element={<LearnUnit6 />} />
              <Route path="/unit6/learn1" element={<Learn1Unit6 />} />
              <Route path="/unit6/learn2" element={<Learn2Unit6 />} />
              <Route path="/unit6/learn3" element={<Learn3Unit6 />} />
              <Route path="/unit6/learn4" element={<Learn4Unit6 />} />
              <Route path="/unit6/posttest" element={<Unit6PosttestRun />} />
            </Route>

            {/* Unit 7 */}
            <Route element={<ProtectedUnitRoute unitNo={7} />}>
              <Route path="/unit7/learn" element={<LearnUnit7 />} />
              <Route path="/unit7/learn1" element={<Learn1Unit7 />} />
              <Route path="/unit7/learn2" element={<Learn2Unit7 />} />
              <Route path="/unit7/learn3" element={<Learn3Unit7 />} />
              <Route path="/unit7/learn4" element={<Learn4Unit7 />} />
              <Route path="/unit7/learn5" element={<Learn5Unit7 />} />
              <Route path="/unit7/posttest" element={<Unit7PosttestRun />} />
            </Route>

            {/* Unit 8 */}
            <Route element={<ProtectedUnitRoute unitNo={8} />}>
              <Route path="/unit8/learn" element={<LearnUnit8 />} />
              <Route path="/unit8/learn1" element={<Learn1Unit8 />} />
              <Route path="/unit8/learn2" element={<Learn2Unit8 />} />
              <Route path="/unit8/learn3" element={<Learn3Unit8 />} />
              <Route path="/unit8/learn4" element={<Learn4Unit8 />} />
              <Route path="/unit8/learn5" element={<Learn5Unit8 />} />
              <Route path="/unit8/learn6" element={<Learn6Unit8 />} />
              <Route path="/unit8/posttest" element={<Unit8PosttestRun />} />
            </Route>


            <Route path="/case/group1" element={<Group1 />} />
            <Route path="/case/group2" element={<Group2 />} />
            <Route path="/case/group3" element={<Group3 />} />
            <Route path="/case/group4" element={<Group4 />} />
            <Route path="/case/group5" element={<Group5 />} />
            <Route path="/case/group6" element={<Group6 />} />
            <Route path="/case/group7" element={<Group7 />} />

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