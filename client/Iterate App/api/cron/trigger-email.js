export default async function handler(req, res) {
  try {
    // This is where you safely call your Render backend URL!
    const response = await fetch("https://iterate-gy7v.onrender.com/api/cron/invoke", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Render failed with status: ${response.status}`);
    }

    return res.status(200).json({ success: true, message: "Triggered Render successfully!" });
  } catch (error) {
    console.error("Failed to trigger backend:", error);
    return res.status(500).json({ error: error.message });
  }
}