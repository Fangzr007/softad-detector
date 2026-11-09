// api/chat.js —— Vercel 无服务器函数（后端代理）
// 作用：接收网页的请求 → 用后端的 API Key 转发给智谱 → 返回结果
//      同时加上 CORS 头，解决浏览器跨域拦截；Key 藏在这里，不暴露在前端

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } }, // 图片 base64 可能较大，放宽到 4MB
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(404).json({ error: "not found" }); return; }

  try {
    const upstream = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (process.env.ZHIPU_API_KEY || ""), // Key 从 Vercel 环境变量读取
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
