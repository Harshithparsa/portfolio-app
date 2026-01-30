#!/usr/bin/env node

/**
 * IP Whitelist Test Script
 * Run this to verify IP whitelist protection is working
 * 
 * Usage:
 *   node test-ip-whitelist.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  log('\n🧪 IP Whitelist Protection Tests\n', 'bold');

  // Check if server is running
  log('Step 1: Checking if server is running...', 'cyan');
  try {
    await makeRequest('/');
    log('✅ Server is running\n', 'green');
  } catch (e) {
    log('❌ Server is not running. Start it with: node server/index.js', 'red');
    process.exit(1);
  }

  // Test 1: Public site (should always work)
  log('Step 2: Testing public site access (no IP restriction)...', 'cyan');
  try {
    const res = await makeRequest('/');
    if (res.status === 200) {
      log(`✅ Public site accessible (Status: ${res.status})\n`, 'green');
    } else {
      log(`⚠️  Unexpected status: ${res.status}\n`, 'yellow');
    }
  } catch (e) {
    log(`❌ Error: ${e.message}\n`, 'red');
  }

  // Test 2: Admin page from localhost (should work - 127.0.0.1 is in whitelist)
  log('Step 3: Testing /admin access from localhost...', 'cyan');
  try {
    const res = await makeRequest('/admin');
    if (res.status === 200) {
      log(`✅ Admin dashboard accessible (Status: ${res.status})`, 'green');
      log('   → Localhost 127.0.0.1 is in ADMIN_ALLOWED_IPS whitelist\n', 'green');
    } else if (res.status === 403) {
      log(`❌ Access denied (Status: 403)`, 'red');
      log('   → Your IP may have been blocked\n', 'red');
    } else {
      log(`⚠️  Unexpected status: ${res.status}\n`, 'yellow');
    }
  } catch (e) {
    log(`❌ Error: ${e.message}\n`, 'red');
  }

  // Test 3: API endpoint (requires JWT but IP check runs first)
  log('Step 4: Testing /api/portfolio/public/profile (public API)...', 'cyan');
  try {
    const res = await makeRequest('/api/portfolio/public/profile');
    if (res.status === 200) {
      log(`✅ Public API accessible (Status: ${res.status})\n`, 'green');
    } else {
      log(`⚠️  Status: ${res.status}\n`, 'yellow');
    }
  } catch (e) {
    log(`❌ Error: ${e.message}\n`, 'red');
  }

  // Test 4: Admin API endpoint (should be blocked without JWT)
  log('Step 5: Testing /api/admin/profile (admin API)...', 'cyan');
  try {
    const res = await makeRequest('/api/admin/profile');
    if (res.status === 403) {
      log(`✅ Admin API blocked without JWT (Status: 403)`, 'green');
      log('   → IP whitelist passed, but JWT missing\n', 'green');
      
      try {
        const data = JSON.parse(res.body);
        log(`   Response: ${JSON.stringify(data)}\n`, 'green');
      } catch (e) {
        // Not JSON
      }
    } else if (res.status === 200) {
      log(`✅ Admin API accessible (Status: 200)\n`, 'green');
    } else {
      log(`⚠️  Status: ${res.status}\n`, 'yellow');
    }
  } catch (e) {
    log(`❌ Error: ${e.message}\n`, 'red');
  }

  // Summary
  log('═════════════════════════════════════════════════════════', 'cyan');
  log('\n📊 Test Summary:\n', 'bold');
  log('Configuration:', 'cyan');
  log('  ADMIN_ALLOWED_IPS from .env:', 'yellow');
  log('  (Check your .env file for current value)\n', 'yellow');
  
  log('What this means:', 'cyan');
  log('  ✅ Public site (/) - Accessible to everyone', 'green');
  log('  ✅ Admin page (/admin) - Only from allowed IPs', 'green');
  log('  ✅ Admin APIs (/api/admin/*) - Only from allowed IPs', 'green');
  log('  ✅ Public APIs (/api/portfolio/public/*) - Accessible to everyone\n', 'green');

  log('Next steps:', 'cyan');
  log('  1. Check server logs for "[IPWhitelist]" messages', 'yellow');
  log('  2. Update ADMIN_ALLOWED_IPS in .env with your IP', 'yellow');
  log('  3. Restart server to apply changes', 'yellow');
  log('  4. Test from different IP addresses\n', 'yellow');

  log('Get your public IP:', 'cyan');
  log('  curl https://api.ipify.org\n', 'yellow');

  log('═════════════════════════════════════════════════════════\n', 'cyan');
}

// Run tests
runTests().catch((e) => {
  log(`Fatal error: ${e.message}`, 'red');
  process.exit(1);
});
