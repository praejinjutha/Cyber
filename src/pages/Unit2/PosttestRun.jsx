import PosttestRunner from "../../components/posttest/PosttestRunner";
import "../Unit1/posttest.css";

export default function PosttestRun() {
  return (
    <PosttestRunner
      unit={2}
      learnPath="/unit2/learn"
      keepFirstAndLatest={true}
      includeAiSummary={true}
    />
  );
}