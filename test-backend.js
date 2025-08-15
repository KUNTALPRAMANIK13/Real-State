// Quick Backend Test
async function testBackend() {
  const baseUrl = "https://real-state-omega-three.vercel.app";

  try {
    console.log("Testing health endpoint...");
    const healthResponse = await fetch(`${baseUrl}/api/auth/health`);
    const healthData = await healthResponse.json();
    console.log("Health Check:", healthData);

    console.log("Testing signout endpoint...");
    const signoutResponse = await fetch(`${baseUrl}/api/auth/signout`);
    const signoutData = await signoutResponse.json();
    console.log("Signout Test:", signoutData);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testBackend();
