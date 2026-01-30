#!/usr/bin/env python3
"""
Quick Test Script for File Upload System
Tests all upload endpoints with proper error handling
"""

import requests  # type: ignore
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"

print("=" * 60)
print("📤 FILE UPLOAD SYSTEM - QUICK TEST")
print("=" * 60)

# Step 1: Login
print("\n1️⃣ Testing Login...")
try:
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": ADMIN_USER, "password": ADMIN_PASS}
    )
    
    if login_response.status_code == 200:
        token = login_response.json().get("token")
        print(f"✅ Login successful")
        print(f"   Token: {token[:50]}...")
    elif login_response.status_code == 403:
        print("❌ IP not authorized (add your IP to ADMIN_ALLOWED_IPS)")
        sys.exit(1)
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.json())
        sys.exit(1)
except Exception as e:
    print(f"❌ Connection error: {e}")
    sys.exit(1)

# Step 2: Test missing file
print("\n2️⃣ Testing error handling (missing file)...")
try:
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={}
    )
    if response.status_code == 400:
        print("✅ Correctly rejected empty upload")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 3: Test missing token
print("\n3️⃣ Testing JWT validation (missing token)...")
try:
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        files={"profilePhoto": ("test.jpg", b"fake image data")}
    )
    if response.status_code == 401:
        print("✅ Correctly rejected upload without token")
        print(f"   Error: {response.json().get('message')}")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 4: Test invalid token
print("\n4️⃣ Testing JWT validation (invalid token)...")
try:
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        headers={"Authorization": "Bearer invalid_token_here"},
        files={"profilePhoto": ("test.jpg", b"fake data")}
    )
    if response.status_code == 401:
        print("✅ Correctly rejected invalid token")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 5: Test file type validation
print("\n5️⃣ Testing file type validation (wrong type)...")
try:
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profilePhoto": ("test.txt", b"not an image")}
    )
    if response.status_code == 400:
        print("✅ Correctly rejected wrong file type")
        print(f"   Error: {response.json().get('message')}")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 6: Test file size validation
print("\n6️⃣ Testing file size validation (oversized file)...")
try:
    # Create 6MB file (exceeds 5MB limit)
    large_data = b"x" * (6 * 1024 * 1024)
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profilePhoto": ("large.jpg", large_data)}
    )
    if response.status_code == 400 or response.status_code == 413:
        print("✅ Correctly rejected oversized file")
        print(f"   Error: {response.json().get('message')}")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 7: Test successful upload (simulate small image)
print("\n7️⃣ Testing successful upload...")
try:
    # Create small fake JPEG (100 bytes, will be accepted by file size check)
    fake_jpg = b'\xFF\xD8\xFF\xE0' + b'\x00' * 96 + b'\xFF\xD9'  # JPEG header+footer
    
    response = requests.post(
        f"{BASE_URL}/api/uploads/profile-photo",
        headers={"Authorization": f"Bearer {token}"},
        files={"profilePhoto": ("test.jpg", fake_jpg)}
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ File uploaded successfully!")
        print(f"   URL: {data.get('url')}")
        print(f"   Message: {data.get('message')}")
    elif response.status_code == 400:
        print("⚠️  File type validation failed (might need real JPEG)")
        print(f"   Error: {response.json().get('message')}")
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(response.json())
except Exception as e:
    print(f"❌ Error: {e}")

# Step 8: Check upload directories exist
print("\n8️⃣ Checking upload directories...")
import os
dirs = [
    "server/uploads/profile",
    "server/uploads/docs"
]
for dir_path in dirs:
    if os.path.exists(dir_path):
        print(f"✅ {dir_path} exists")
    else:
        print(f"❌ {dir_path} missing")

print("\n" + "=" * 60)
print("✅ TEST SUITE COMPLETE")
print("=" * 60)
print("\n📖 Next Steps:")
print("1. Visit: http://localhost:5000/admin-parsa-7734")
print("2. Login with: admin / admin123")
print("3. Go to: http://localhost:5000/admin-uploads.html")
print("4. Click upload buttons to test file picker")
print("\n" + "=" * 60)
