// diagnose.js
const API_URL = "https://scrapter-api.vercel.app";

const CREDENTIALS = {
  email: "admin@scrapter.com",
  password: "admin@password123", // As requested
};

async function testEndpoint(label, url, options = {}) {
  console.log(`\n--- Testing ${label} ---`);
  console.log(`URL: ${url}`);

  const start = Date.now();
  const controller = new AbortController();
  // 15s timeout to catch Vercel hanging before the client gives up
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log(`[${new Date().toISOString()}] Sending request...`);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Scrapter-Diagnostic/1.0",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    let body = await res.text();
    // Try to parse JSON for cleaner output
    try {
      body = JSON.parse(body);
    } catch (e) {}

    console.log(
      `${res.ok ? "✅" : "⚠️"} Status: ${res.status} ${res.statusText}`,
    );
    console.log(`⏱️ Duration: ${duration}ms`);

    if (res.status === 504) {
      console.error(
        "❌ Vercel Gateway Timeout (504): The function took too long to respond.",
      );
    } else if (res.status === 500) {
      console.error("❌ Server Error (500): Check Vercel Function Logs.");
    }

    console.log(
      "Response:",
      JSON.stringify(body, null, 2).slice(0, 300) +
        (JSON.stringify(body).length > 300 ? "..." : ""),
    );
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Date.now() - start;
    console.log(`❌ FAILED after ${duration}ms`);

    if (error.name === "AbortError") {
      console.error(
        "🛑 CLIENT TIMEOUT: The server accepted the request but sent nothing back within 15s.",
      );
      console.error(
        "   -> This confirms the database connection is freezing the API process.",
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

async function run() {
  console.log(`Target: ${API_URL}`);

  // 1. Test Root (Should be instant)
  await testEndpoint("Root (GET)", `${API_URL}/`);

  // 2. Test Health (Checks DB Connection)
  await testEndpoint("Health (GET)", `${API_URL}/health`);

  // 3. Test Login (Checks DB Write/Read + Bcrypt)
  await testEndpoint("Login (POST)", `${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(CREDENTIALS),
  });
}

run();
