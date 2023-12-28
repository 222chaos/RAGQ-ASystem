import { useState } from "react";

const IndexPage = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/fenci", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (res.status === 200) {
        const data = await res.json(); // 获取分词后的数据
        console.log(data);
        const aiRes = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });

        if (aiRes.status === 200) {
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
            }
          } catch (queryError) {
            console.error("Error querying /api/query:", queryError);
          }
        }

        const processData = async ({ done, value }) => {
          if (done) {
            console.log("Stream finished");
            return;
          }

          tempText += new TextDecoder("utf-8").decode(value);
          setResponse(tempText);

          return reader.read().then(processData);
        };

        await processData(await reader.read());
      }
    } catch (error) {
      console.error("请求出错:", error);
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
      <button onClick={handleSubmit}>提交</button>
      <div>
        <h2>##########：</h2>
        <div>{response}</div>
      </div>
    </div>
  );
};

export default IndexPage;
