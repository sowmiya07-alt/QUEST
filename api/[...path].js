export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const targetHost = "https://roman-jolly-operable.ngrok-free.dev";
  
  let targetPath = req.url.replace(/^\/api/, "");
  if (!targetPath.startsWith("/")) {
    targetPath = `/${targetPath}`;
  }

  const targetUrl = `${targetHost}${targetPath}`;

  const headers = { ...req.headers };
  delete headers.host;
  headers["ngrok-skip-browser-warning"] = "true";

  // Read raw request stream
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && bodyBuffer) {
      fetchOptions.body = bodyBuffer;
    }

    const response = await fetch(targetUrl, fetchOptions);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-encoding") {
        res.setHeader(key, value);
      }
    });

    const data = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error("[Vercel Proxy Error]:", error);
    res.status(502).json({
      success: false,
      message: "Unable to connect to QUEST backend server: " + error.message,
    });
  }
}
