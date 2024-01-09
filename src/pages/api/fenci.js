export default function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    // 分隔文本，每5个字为一段
    const chunkSize = 5;
    const textChunks = [];
    for (let i = 0; i < 20; i += chunkSize) {
      textChunks.push(text.substring(i, i + chunkSize));
    }

    // 返回分隔后的文本数组
    return res.status(200).send(textChunks);
  } else {
    return res.status(405).send([]);
  }
}
