const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log("=== STARTING SAFEGUARDS VERIFICATION ===");

  // 1. Test GET /api/rsvp with a random non-premium/non-existent user ID
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/rsvp?userId=00000000-0000-0000-0000-000000000000',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("GET /api/rsvp (Non-Premium User ID):");
    console.log(`Status Code: ${res.statusCode} (Expected: 403)`);
    console.log("Response Body:", res.body);
    if (res.statusCode === 403 && res.body.error.includes("Premium")) {
      console.log("✅ PASS: Correctly blocked with 403 Forbidden for non-premium user ID");
    } else {
      console.log("❌ FAIL: Did not return correct rejection");
    }
  } catch (err) {
    console.error("Error during GET /api/rsvp test:", err);
  }

  console.log("\n----------------------------------------\n");

  // 2. Test POST /api/rsvp with a random guest ID
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/rsvp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      guestId: '00000000-0000-0000-0000-000000000000',
      rsvpStatus: 'attending'
    });

    console.log("POST /api/rsvp (Random Guest ID):");
    console.log(`Status Code: ${res.statusCode} (Expected: 404)`);
    console.log("Response Body:", res.body);
    if (res.statusCode === 404 && res.body.error.includes("not found")) {
      console.log("✅ PASS: Securely verified guest existence and returned 404");
    } else {
      console.log("❌ FAIL: Did not return guest not found");
    }
  } catch (err) {
    console.error("Error during POST /api/rsvp test:", err);
  }

  console.log("\n----------------------------------------\n");

  // 3. Test POST /api/moments without authentication header
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/moments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      title: 'Hacked Album',
      moment_type: 'photo'
    });

    console.log("POST /api/moments (Unauthenticated):");
    console.log(`Status Code: ${res.statusCode} (Expected: 401)`);
    console.log("Response Body:", res.body);
    if (res.statusCode === 401 && res.body.error === "Unauthorized") {
      console.log("✅ PASS: Correctly blocked unauthenticated moments creation");
    } else {
      console.log("❌ FAIL: Did not block unauthenticated moments creation");
    }
  } catch (err) {
    console.error("Error during POST /api/moments test:", err);
  }

  console.log("\n=== SAFEGUARDS VERIFICATION COMPLETED ===");
}

run();
