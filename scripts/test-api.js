#!/usr/bin/env node

const http = require('http');
const querystring = require('querystring');

const API_BASE = 'http://localhost:5000/api';

let testToken = '';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Portfolio API\n');

  try {
    // 1. Login
    console.log('1️⃣  Testing Login...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      username: 'Harshith-1030',
      password: '6303964389'
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
      testToken = loginRes.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${testToken.substring(0, 30)}...`);
    } else {
      console.log('❌ Login failed:', loginRes);
      return;
    }

    // 2. Public API - Profile
    console.log('\n2️⃣  Testing Public API - Profile...');
    const profileRes = await makeRequest('GET', '/portfolio/public/profile');
    if (profileRes.status === 200) {
      console.log('✅ Public Profile API working');
      console.log(`   Name: ${profileRes.data.profile?.name || 'N/A'}`);
      console.log(`   Projects: ${profileRes.data.projects?.length || 0}`);
      console.log(`   Skills: ${profileRes.data.skills?.length || 0}`);
      console.log(`   Certificates: ${profileRes.data.certificates?.length || 0}`);
    } else {
      console.log('❌ Failed:', profileRes.status);
    }

    // 3. Admin API - Get Portfolio
    console.log('\n3️⃣  Testing Admin API - Get Portfolio...');
    const adminPortfolioRes = await makeRequest('GET', '/portfolio/admin/portfolio', null, testToken);
    if (adminPortfolioRes.status === 200) {
      console.log('✅ Admin Portfolio API working');
      console.log(`   Profile: ${adminPortfolioRes.data.profile?.name}`);
    } else {
      console.log('❌ Failed:', adminPortfolioRes.status, adminPortfolioRes.data?.message);
    }

    // 4. Admin API - Update Profile
    console.log('\n4️⃣  Testing Admin API - Update Profile...');
    const updateRes = await makeRequest('PUT', '/portfolio/admin/portfolio', {
      profile: {
        name: 'Harshith Updated',
        tagline: 'Full-Stack Developer'
      }
    }, testToken);
    
    if (updateRes.status === 200) {
      console.log('✅ Profile Update successful');
      console.log(`   Updated name: ${updateRes.data.profile?.name}`);
    } else {
      console.log('❌ Failed:', updateRes.status, updateRes.data?.message);
    }

    // 5. Admin API - Get Skills
    console.log('\n5️⃣  Testing Admin API - Skills Field...');
    const skillRes = await makeRequest('GET', '/portfolio/public/skills');
    if (skillRes.status === 200) {
      console.log('✅ Skills API working');
      console.log(`   Categories: ${skillRes.data.skills?.length || 0}`);
      if (skillRes.data.skills && skillRes.data.skills.length > 0) {
        console.log(`   First Category: ${skillRes.data.skills[0].category}`);
        console.log(`   Items: ${skillRes.data.skills[0].items?.length || 0}`);
      }
    } else {
      console.log('❌ Failed:', skillRes.status);
    }

    // 6. Admin API - Add Project
    console.log('\n6️⃣  Testing Admin API - Add Project...');
    const addProjectRes = await makeRequest('POST', '/portfolio/admin/portfolio/projects', {
      title: 'Test Project',
      description: 'A test project from API',
      tags: ['test'],
      imageUrl: 'https://via.placeholder.com/300',
      githubLink: 'https://github.com/test',
      liveLink: 'https://test.com'
    }, testToken);

    if (addProjectRes.status === 201) {
      console.log('✅ Add Project successful');
      console.log(`   Total Projects: ${addProjectRes.data.projects?.length || 0}`);
    } else {
      console.log('❌ Failed:', addProjectRes.status, addProjectRes.data?.message);
    }

    // 7. Get Projects
    console.log('\n7️⃣  Testing Public API - Projects...');
    const projectsRes = await makeRequest('GET', '/portfolio/public/projects');
    if (projectsRes.status === 200) {
      console.log('✅ Projects API working');
      console.log(`   Total Projects: ${projectsRes.data.projects?.length || 0}`);
    } else {
      console.log('❌ Failed:', projectsRes.status);
    }

    console.log('\n✨ Tests completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Wait for server to be ready
setTimeout(runTests, 2000);
