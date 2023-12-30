import { useState } from "react";

const IndexPage = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleAIAPI = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/fenci", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        const data = await res.json(); // 获取分词后的数据

        const aiRes = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });

        // 处理 AI API 的响应
        // 可以根据需要更新状态或执行其他逻辑
      }
    } catch (error) {
      console.error("请求出错:", error);
    }
  };

  const handleQueryAPI = async () => {
    try {
      const queryRes = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (queryRes.status === 200) {
        const queryData = await queryRes.json();
        console.log("queryData=====>", queryData);
        // 处理 Query API 的响应
        // 可以根据需要更新状态或执行其他逻辑
      }
    } catch (queryError) {
      console.error("Error querying /api/query:", queryError);
    }
  };

  return (
    <div>
      <h1>################</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="请输入问题"
      />
      <button onClick={handleAIAPI}>上传数据</button>

      <button onClick={handleQueryAPI}>查询</button>
      <div>
        <h2>##########：</h2>
        <div>{response}</div>
      </div>
    </div>
  );
};

export default IndexPage;
