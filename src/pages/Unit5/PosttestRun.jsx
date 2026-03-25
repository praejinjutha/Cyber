import PosttestRunner from "../../components/posttest/PosttestRunner";
import "../Unit1/posttest.css";

const questionImageMap = {
  2: new URL("./exam/exam2.jpg", import.meta.url).href,
  4: new URL("./exam/exam4.png", import.meta.url).href,
  6: new URL("./exam/exam6.jpg", import.meta.url).href,
  13: new URL("./exam/exam13.jpg", import.meta.url).href,
};

const questionTextMap = {
  8: `“อึ้งทั้งโซเชียล! ดื่มน้ำสูตรนี้แล้วน้ำหนักลดทันทีภายใน 3 วัน ผู้ใช้หลายคนยืนยันว่าได้ผลจริง”`,
  12: `ข่าวหนึ่งถูกนำเสนอด้วยพาดหัวชวนอารมณ์ และมีการแชร์ต่อจำนวนมาก แต่ไม่ระบุแหล่งที่มาชัดเจน`,
};

export default function PosttestRun() {
  return (
    <PosttestRunner
      unit={5}
      learnPath="/unit5/learn"
      keepFirstAndLatest={true}
      includeAiSummary={true}
      promptVariant="default"
      questionImageMap={questionImageMap}
      questionTextMap={questionTextMap}
      enableImagePreview={true}
    />
  );
}