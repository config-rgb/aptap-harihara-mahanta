#!/usr/bin/env python3
"""
Backend API Test Suite for Restaurant QR Ordering System
Tests all API endpoints comprehensively
"""

import requests
import sys
import json
from datetime import datetime

class RestaurantAPITester:
    def __init__(self, base_url="https://qr-dine-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_password = "admin123"

    def log(self, message):
        """Log test progress"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Timeout after 10 seconds")
            self.failed_tests.append({'name': name, 'endpoint': endpoint, 'error': 'Timeout'})
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'endpoint': endpoint, 'error': str(e)})
            return False, {}

    def test_admin_login(self):
        """Test admin authentication"""
        self.log("\n=== TESTING ADMIN LOGIN ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"password": self.admin_password}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.log(f"✅ Admin token obtained")
            return True
        return False

    def test_menu_endpoints(self):
        """Test menu-related endpoints"""
        self.log("\n=== TESTING MENU ENDPOINTS ===")
        
        # Get all menu items
        success, menu_data = self.run_test("Get All Menu Items", "GET", "menu")
        if success:
            self.log(f"   Found {len(menu_data)} menu items")
            if len(menu_data) >= 16:
                self.log("✅ Menu has expected 16+ items")
            else:
                self.log("⚠️  Menu has fewer than 16 items")
        
        # Test category filter
        self.run_test("Get Starters", "GET", "menu?category=starters")
        self.run_test("Get Main Course", "GET", "menu?category=main_course")
        self.run_test("Get Drinks", "GET", "menu?category=drinks")
        self.run_test("Get Desserts", "GET", "menu?category=desserts")
        
        # Test search functionality
        self.run_test("Search Menu - Truffle", "GET", "menu?search=truffle")
        
        # Get specific item (if menu exists)
        if success and menu_data and len(menu_data) > 0:
            item_id = menu_data[0]['id']
            self.run_test("Get Specific Menu Item", "GET", f"menu/{item_id}")
        
        return success

    def test_menu_management(self):
        """Test admin menu management (CRUD operations)"""
        if not self.token:
            self.log("⚠️  Skipping menu management tests - no admin token")
            return False

        self.log("\n=== TESTING MENU MANAGEMENT ===")
        
        # Create new menu item
        new_item = {
            "name": "Test Burger",
            "description": "A test burger for API testing",
            "price": 19.99,
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            "available": True
        }
        
        success, created_item = self.run_test(
            "Create Menu Item", 
            "POST", 
            "menu", 
            201,
            data=new_item
        )
        
        item_id = None
        if success and 'id' in created_item:
            item_id = created_item['id']
            self.log(f"✅ Created item with ID: {item_id}")
            
            # Update the item
            update_data = {"name": "Updated Test Burger", "price": 22.99}
            self.run_test(
                "Update Menu Item", 
                "PUT", 
                f"menu/{item_id}", 
                200,
                data=update_data
            )
            
            # Delete the item
            self.run_test("Delete Menu Item", "DELETE", f"menu/{item_id}", 200)
        
        return success

    def test_order_endpoints(self):
        """Test order-related endpoints"""
        self.log("\n=== TESTING ORDER ENDPOINTS ===")
        
        # Create test order
        test_order = {
            "table_number": 5,
            "items": [
                {
                    "menu_item_id": "test-item-1",
                    "name": "Test Item",
                    "price": 15.99,
                    "quantity": 2,
                    "image_url": "test.jpg"
                }
            ],
            "total": 31.98
        }
        
        success, order_data = self.run_test(
            "Create Order", 
            "POST", 
            "orders", 
            201,
            data=test_order
        )
        
        order_id = None
        if success and 'id' in order_data:
            order_id = order_data['id']
            self.log(f"✅ Created order with ID: {order_id}")
            
            # Test get orders (admin only)
            if self.token:
                self.run_test("Get All Orders", "GET", "orders")
                self.run_test("Get Pending Orders", "GET", "orders?status=pending")
                
                # Update order status
                for status in ["preparing", "ready", "served"]:
                    self.run_test(
                        f"Update Order to {status}", 
                        "PUT", 
                        f"orders/{order_id}/status",
                        200,
                        data={"status": status}
                    )
            
            # Test get table orders (public endpoint)
            self.run_test("Get Table Orders", "GET", f"orders/table/{test_order['table_number']}")
        
        # Clean up - delete test order
        if self.token and order_id:
            self.run_test("Delete Test Order", "DELETE", f"orders/{order_id}", 200)
        
        return success

    def test_tables_endpoint(self):
        """Test tables endpoint"""
        self.log("\n=== TESTING TABLES ENDPOINT ===")
        success, tables_data = self.run_test("Get Tables", "GET", "tables")
        
        if success and isinstance(tables_data, list):
            self.log(f"   Found {len(tables_data)} tables")
            if len(tables_data) == 10:
                self.log("✅ Correct number of tables (10)")
            else:
                self.log(f"⚠️  Expected 10 tables, got {len(tables_data)}")
        
        return success

    def test_error_handling(self):
        """Test error handling"""
        self.log("\n=== TESTING ERROR HANDLING ===")
        
        # Invalid login
        self.run_test("Invalid Admin Login", "POST", "admin/login", 401, 
                     data={"password": "wrong_password"})
        
        # Non-existent endpoints
        self.run_test("Non-existent Endpoint", "GET", "nonexistent", 404)
        
        # Invalid menu item
        self.run_test("Get Invalid Menu Item", "GET", "menu/invalid-id", 404)
        
        # Invalid order status
        if self.token:
            self.run_test("Invalid Order Status", "PUT", "orders/fake-id/status", 404,
                         data={"status": "invalid"})

    def print_summary(self):
        """Print test execution summary"""
        self.log(f"\n{'='*60}")
        self.log(f"📊 TEST SUMMARY")
        self.log(f"{'='*60}")
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {len(self.failed_tests)}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            self.log(f"\n❌ FAILED TESTS:")
            for fail in self.failed_tests:
                self.log(f"   • {fail['name']} ({fail.get('endpoint', 'unknown')})")
                if 'expected' in fail:
                    self.log(f"     Expected: {fail['expected']}, Got: {fail['actual']}")
                if 'error' in fail:
                    self.log(f"     Error: {fail['error']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    print("🚀 Starting Restaurant API Backend Tests")
    print(f"Backend URL: https://qr-dine-11.preview.emergentagent.com")
    print("="*60)
    
    tester = RestaurantAPITester()
    
    # Run all test suites
    all_passed = True
    
    # Admin login (required for many tests)
    if not tester.test_admin_login():
        print("❌ Admin login failed - some tests will be skipped")
        all_passed = False
    
    # Core functionality tests
    all_passed &= tester.test_menu_endpoints()
    all_passed &= tester.test_menu_management()
    all_passed &= tester.test_order_endpoints()
    all_passed &= tester.test_tables_endpoint()
    
    # Edge case tests
    tester.test_error_handling()
    
    # Final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())