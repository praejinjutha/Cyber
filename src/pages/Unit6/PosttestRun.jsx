import PosttestRunner from "../../components/posttest/PosttestRunner";
import "../Unit1/posttest.css";

export default function PosttestRun() {
  return (
    <PosttestRunner
      unit={6}
      learnPath="/unit6/learn"
      keepFirstAndLatest={true}
      includeAiSummary={true}
      promptVariant="scenario-card"
    />
  );
}