import PosttestRunner from "../../components/posttest/PosttestRunner";
import "./posttest.css";

export default function PosttestRun() {
  return (
    <PosttestRunner
      unit={1}
      learnPath="/unit1/learn"
      keepFirstAndLatest={true}
      includeAiSummary={true}
    />
  );
}