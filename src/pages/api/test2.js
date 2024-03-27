export default async function handler(req, res) {
  if (req.method === "POST") {
    const content = [123, 345, 456, 5678];

    console.log("content======>", content);
    let index = 0;
    for await (const item of content) {
      console.log("###############");

      console.log(index, " /////", item);

      index++;
    }
  }
}
