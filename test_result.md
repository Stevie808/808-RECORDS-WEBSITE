#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Implement full admin dashboard content management system for 808Records website.
  The admin system should allow administrators to:
  - Manage artist roster (create, edit, delete artists with images and social links)
  - Manage releases (create, edit, delete albums, singles, EPs)
  - Edit site content (hero section, contact information)
  - All changes should be immediately visible on the public website

backend:
  - task: "Admin Authentication API"
    implemented: true
    working: true
    file: "/app/backend/admin_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Admin login endpoint working, JWT token generation implemented"
      - working: true
        agent: "testing"
        comment: "✅ TESTED: Login with valid credentials (stevie@808records.com/stevie808) returns JWT token. Invalid credentials properly rejected with 401. Token verification working correctly. Authentication protection on all protected endpoints verified."

  - task: "Admin Password Management by Head Admin"
    implemented: true
    working: true
    file: "/app/backend/admin_routes.py, /app/backend/models.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added PUT /api/admin/{admin_id}/password endpoint for head admin to change other admins' passwords. Created AdminPasswordChange model. Only head_admin can access this endpoint."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All password management scenarios working correctly. (1) Head admin (stevie@808records.com) successfully changed redhill admin's password. (2) Old password correctly rejected with 401 after change. (3) New password works for login and returns valid JWT token. (4) Regular admin (redhill) correctly blocked from changing other admins' passwords with 403. (5) Invalid admin_id correctly rejected with 404. Password restored to original after testing."

  - task: "Admin Credentials Management (Email and Password) by Head Admin"
    implemented: true
    working: true
    file: "/app/backend/admin_routes.py, /app/backend/models.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added PUT /api/admin/{admin_id}/credentials endpoint for head admin to change admin email and/or password. Created AdminCredentialUpdate model. Supports changing email only, password only, or both. Validates duplicate email (400 error). Only head_admin can access this endpoint (403 for others)."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All 11 admin credentials management scenarios working correctly. (1) Head admin successfully changed redhill's email only - verified login with new email and old password works. (2) Head admin successfully changed redhill's password only - old password rejected (401), new password works. (3) Head admin successfully changed both email and password at once - login with new credentials works. (4) Duplicate email correctly rejected with 400 error when trying to use existing admin email. (5) Regular admin (redhill) correctly blocked from changing credentials with 403 error. (6) Head admin successfully changed own email - verified re-login required with new email. All credentials restored to original after testing. Total: 66/66 tests passed (100% success rate)."

  - task: "Artists CRUD API"
    implemented: true
    working: true
    file: "/app/backend/content_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented GET, POST, PUT, DELETE endpoints for artists management. Database seeded with initial artist data."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All CRUD operations working correctly. GET /api/content/artists returns artist list (public). POST creates new artist with generated UUID (auth required). GET /api/content/artists/{id} retrieves specific artist. PUT updates artist fields (auth required). DELETE removes artist (auth required). Data persistence verified."

  - task: "Releases CRUD API"
    implemented: true
    working: true
    file: "/app/backend/content_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented GET, POST, PUT, DELETE endpoints for releases management. Database seeded with initial release data."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All CRUD operations working correctly. GET /api/content/releases returns release list (public). POST creates new release with generated UUID (auth required). GET /api/content/releases/{id} retrieves specific release. PUT updates release fields (auth required). DELETE removes release (auth required). Data persistence verified."

  - task: "Site Content API"
    implemented: true
    working: true
    file: "/app/backend/content_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented GET and PUT endpoints for site content sections (hero, about, contact)"
      - working: true
        agent: "testing"
        comment: "✅ TESTED: Site content API working correctly. GET /api/content/site/{section} returns content for hero, contact, and about sections (public). PUT /api/content/site/{section} updates content with authentication required. Content updates persist correctly and are immediately retrievable."

  - task: "Database Initialization"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added startup event to seed database with 6 artists and 7 releases from mock data"
      - working: true
        agent: "testing"
        comment: "✅ TESTED: Database initialization working correctly. Found 6+ seeded artists including HOMI, TENNAXIS, PREACHA, FAILURE, MTL, LULUSREVENGE. Found 7+ seeded releases including Soundscraper, #B4FAIL2PREVAIL, A Born Killer, ProofOfConcept. All expected data present and accessible via API."

frontend:
  - task: "Admin Dashboard - Artists Management"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created comprehensive artists management UI with create, edit, delete forms. Form includes all artist fields."

  - task: "Admin Dashboard - Releases Management"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created releases management UI with create, edit, delete functionality. Grid layout for release cards."

  - task: "Admin Dashboard - Site Content Editor"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created site content editing forms for hero section and contact information"

  - task: "Public Site - Fetch Artists from API"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/LeaderboardModern.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated component to fetch artists from backend API instead of mock data. Artists sorted by popularity score."

  - task: "Public Site - Fetch Releases from API"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/Releases.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated component to fetch releases from backend API instead of mock data. Releases sorted by date."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Implementation complete for full admin dashboard content management system.
      
      Backend APIs:
      - Created content_routes.py with full CRUD for artists and releases
      - Added site content GET/PUT endpoints for hero, about, contact sections
      - Database auto-seeded with 6 artists and 7 releases on startup


  - task: "Role-Based Admin System"
    implemented: true
    working: true
    file: "/app/backend/admin_routes.py, /app/backend/models.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented head_admin role with manage_admins permission. Added endpoints for listing admins, creating admins with custom permissions, updating permissions, updating roles, and deleting admins. Stevie@808records.com set as head_admin with all permissions."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All role-based admin endpoints working correctly. Fixed admin permissions in database (stevie@808records.com now has head_admin role with manage_admins permission). GET /api/admin/me returns role and permissions. GET /api/admin/list works for head_admin. POST /api/admin/create creates new admin with custom permissions. PUT /api/admin/{id}/permissions updates permissions. PUT /api/admin/{id}/role updates role (head_admin only). DELETE /api/admin/{email} deletes admin. Permission enforcement verified - redhill cannot access admin management endpoints."

  - task: "Submissions System API"
    implemented: true
    working: true
    file: "/app/backend/submission_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented submission endpoints: POST (public, sends email), GET all submissions (admin), GET specific submission (admin), PUT update status (admin), DELETE (admin), stats summary endpoint. Email notifications configured (currently prints to console, ready for SMTP integration)."
      - working: true
        agent: "testing"
        comment: "✅ TESTED: All submissions system endpoints working correctly. POST /api/submissions/ creates submission (public, no auth) and triggers email notification (verified in backend logs). GET /api/submissions/ lists all submissions (admin auth required). GET /api/submissions/stats/summary returns stats (total, new, reviewed, archived). PUT /api/submissions/{id} updates status and notes. DELETE /api/submissions/{id} removes submission. Data persistence verified. Email notification system working (console logging confirmed)."

frontend:
  - task: "Submissions Tab UI"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Complete submissions management UI with stats cards (total, new, reviewed, archived), email settings, submissions list with status updates, notes, and delete functionality."

  - task: "Admins Tab UI"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Admin management UI visible only to head_admin. Features: create new admin form with role and permission selection, admin list with role badges, permission display, delete functionality (protects head_admin from deletion)."
      - working: "NA"
        agent: "main"
        comment: "Enhanced edit admin modal with password change functionality. Head admin can now change other admin passwords. Warning shown when password is changed."

  - task: "Contact Form Submission"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/Contact.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated contact form to submit to /api/submissions/. Form fields: name, email, artistName (optional), demoLink (optional), message (required). Sends data to backend which triggers email notification."

  - task: "Comprehensive Content Editor"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminDashboard.jsx, /app/frontend/src/components/Hero.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Expanded Site Content tab to edit ALL landing page text: Hero section (6 fields), About section (6 fields), Artist Roster section (3 fields), Releases section (3 fields), Contact section (2 fields). Hero component updated to fetch and display content from API."

agent_communication:
  - agent: "main"
    message: |
      PHASE 4 IMPLEMENTATION COMPLETE - Frontend Permission Enforcement & Admin Credential Management
      
      NEW FEATURES IMPLEMENTED:
      
      1. Frontend Permission-Based UI:
         ✅ Tabs dynamically shown/hidden based on user permissions
         ✅ Default tab automatically selected based on first available permission
         ✅ Only users with permissions can see and interact with specific tabs
      
      2. Admin Credential Management (Head Admin Only):
         Backend:
         - Added PUT /api/admin/{admin_id}/password endpoint
         - Created AdminPasswordChange model
         - Only head_admin can change other admins' passwords
         
         Frontend:
         - Enhanced Edit Admin modal with password change field
         - Warning message shown when password will be changed
         - Confirmation dialog with different messages for password vs permission changes
         - Auto-clears password field when modal closes
         - Shows warning that admin needs to use new password on next login
      
      3. Permission Checks:
         - Artists tab: Only visible with manage_artists permission
         - Releases tab: Only visible with manage_releases permission
         - Site Content tab: Only visible with manage_content permission
         - Submissions tab: Only visible with manage_submissions permission
         - Admins tab: Only visible with manage_admins permission (head_admin only)
      
      TESTING NEEDED:
      1. Test permission-based tab visibility with different admin roles
      2. Test head admin changing another admin's password
      3. Verify warning messages appear correctly
      4. Test that admin with changed password cannot log in with old password
      5. Verify only head_admin can edit admin credentials
      
      Admin credentials for testing:
      - Head Admin: stevie@808records.com / stevie808
      - Regular Admin: redh1ll@developer.com / redhill
      
      Base URL: https://sonic-dash-20.preview.emergentagent.com
  
  - agent: "testing"
    message: |
      ✅ PHASE 4 BACKEND TESTING COMPLETE - ADMIN PASSWORD MANAGEMENT WORKING
      
      Comprehensive testing completed on the new admin password management feature:
      
      🔑 Admin Password Management by Head Admin (6/6 tests passed):
      - Head admin successfully changed redhill admin's password
      - Old password correctly rejected after change (401)
      - New password works for login and returns valid JWT token
      - Regular admin (redhill) correctly blocked from changing passwords (403)
      - Invalid admin_id correctly rejected (404)
      - Password restoration working correctly
      
      TOTAL: 54/54 tests passed (100% success rate)
      
      All backend systems including the new password management feature are fully functional.
      The endpoint PUT /api/admin/{admin_id}/password is working as expected with proper
      role-based access control (head_admin only).
  
  - agent: "main"
    message: |
      PHASE 2 & 3 COMPLETE - Ready for Testing
      
      NEW FEATURES IMPLEMENTED:
      
      1. Role-Based Admin System:
         - Head Admin role (stevie@808records.com) with full permissions
         - Custom permission system (manage_artists, manage_releases, manage_content, manage_submissions, manage_admins)
         - Admin CRUD with role assignment
         - UI visibility based on permissions
         - Protection: head_admin cannot be deleted, users cannot delete themselves
      
      2. Submissions System:
         - Public submission endpoint with email notifications
         - Admin submission management (view, update status, add notes, delete)
         - Stats dashboard (total, new, reviewed, archived)
         - Email notification system (console logging, SMTP-ready)
         - Contact form integrated with submission API
      
      3. Comprehensive Content Editor:
         - ALL landing page text now editable
         - Hero, About, Artist Roster, Releases, Contact sections
         - 20+ editable text fields total
         - Changes save to database and update immediately
      
      TESTING NEEDED:
      1. Test admin role system (create admin, test permissions)
      2. Test submission flow (public form -> admin dashboard -> email)
      3. Test content editing across all sections
      4. Verify permission-based UI visibility
      
      Admin credentials:
      - Head Admin: stevie@808records.com / stevie808
      - Regular Admin: redh1ll@developer.com / redhill
      
      Base URL: https://sonic-dash-20.preview.emergentagent.com

      - All endpoints require admin JWT authentication except GET requests
      
      Frontend:
      - Complete admin dashboard with 3 tabs: Artists, Releases, Site Content
      - Each tab has create forms and list views with edit/delete capabilities
      - Public site components now fetch data from API instead of mock.js
      
      Testing needed:
      1. Test all backend API endpoints (CRUD operations)
      2. Verify authentication works correctly
      3. Test database operations (create, update, delete)
      4. Verify data persistence across restarts
      
      Admin credentials:
      - Email: stevie@808records.com
      - Password: stevie808
      
      Base URL: https://sonic-dash-20.preview.emergentagent.com
  
  - agent: "testing"
    message: |
      ✅ BACKEND TESTING COMPLETE - ALL SYSTEMS WORKING
      
      Comprehensive testing completed on all backend APIs:
      
      🔐 Admin Authentication (10/10 tests passed):
      - Login with valid credentials returns JWT token
      - Invalid credentials properly rejected (401)
      - Token verification working correctly
      - All protected endpoints require authentication
      
      🎤 Artists CRUD API (6/6 tests passed):
      - GET /api/content/artists (public) - returns all artists
      - POST /api/content/artists (auth) - creates artist with auto-generated UUID
      - GET /api/content/artists/{id} - retrieves specific artist
      - PUT /api/content/artists/{id} (auth) - updates artist fields
      - DELETE /api/content/artists/{id} (auth) - removes artist
      - Data persistence verified
      
      🎵 Releases CRUD API (6/6 tests passed):
      - GET /api/content/releases (public) - returns all releases
      - POST /api/content/releases (auth) - creates release with auto-generated UUID
      - GET /api/content/releases/{id} - retrieves specific release
      - PUT /api/content/releases/{id} (auth) - updates release fields
      - DELETE /api/content/releases/{id} (auth) - removes release
      - Data persistence verified
      
      🌐 Site Content API (9/9 tests passed):
      - GET /api/content/site/{section} (public) - hero, contact, about sections
      - PUT /api/content/site/{section} (auth) - updates content
      - Content updates persist and are immediately retrievable
      
      🗄️ Database Initialization (4/4 tests passed):
      - 6+ artists seeded including expected artists (HOMI, TENNAXIS, etc.)
      - 7+ releases seeded including expected releases (Soundscraper, etc.)
      - All seeded data accessible via API
      
      TOTAL: 35/35 tests passed (100% success rate)
      
      The admin dashboard backend is fully functional and ready for production use.

  - agent: "testing"
    message: |
      ✅ PHASE 2 & 3 BACKEND TESTING COMPLETE - ALL SYSTEMS WORKING
      
      Comprehensive testing completed on all Phase 2 & 3 backend features:
      
      🔐 Admin Authentication (10/10 tests passed):
      - Login with valid credentials returns JWT token
      - Invalid credentials properly rejected (401)
      - Token verification working correctly
      - All protected endpoints require authentication
      
      👥 Role-Based Admin System (7/7 tests passed):
      - Fixed admin permissions in database (stevie@808records.com now head_admin)
      - GET /api/admin/me returns role and permissions
      - GET /api/admin/list returns admin list (head_admin only)
      - POST /api/admin/create creates admin with custom permissions
      - PUT /api/admin/{id}/permissions updates admin permissions
      - PUT /api/admin/{id}/role updates admin role (head_admin only)
      - DELETE /api/admin/{email} deletes admin
      - Permission enforcement verified (redhill blocked from admin endpoints)
      
      📝 Submissions System (6/6 tests passed):
      - POST /api/submissions/ creates submission (public, triggers email)
      - GET /api/submissions/ lists submissions (admin auth required)
      - GET /api/submissions/stats/summary returns stats
      - PUT /api/submissions/{id} updates status and notes
      - DELETE /api/submissions/{id} removes submission
      - Email notification system working (console logging verified)
      - Data persistence verified
      
      🎤 Artists CRUD API (6/6 tests passed):
      - All CRUD operations working correctly
      - Authentication protection verified
      - Data persistence confirmed
      
      🎵 Releases CRUD API (6/6 tests passed):
      - All CRUD operations working correctly
      - Authentication protection verified
      - Data persistence confirmed
      
      🌐 Site Content API (9/9 tests passed):
      - GET/PUT operations for hero, contact, about sections
      - Content updates persist correctly
      - Authentication protection verified
      
      🗄️ Database Initialization (4/4 tests passed):
      - 6+ artists seeded correctly
      - 7+ releases seeded correctly
      - All seeded data accessible via API
      
      🔒 Authentication Protection (7/7 tests passed):
      - All protected endpoints properly reject unauthorized requests
      
      TOTAL: 48/48 tests passed (100% success rate)
      
      ISSUES RESOLVED:
      - Fixed admin permissions in database (missing role and permissions fields)
      - Fixed role update endpoint (was incorrectly failing on unchanged values)
      
      The Phase 2 & 3 backend systems are fully functional and ready for production use.

  - agent: "testing"
    message: |
      ✅ ADMIN CREDENTIALS MANAGEMENT TESTING COMPLETE - ALL TESTS PASSED
      
      Comprehensive testing completed on the new admin credentials management feature:
      
      🔑 Admin Credentials Management (11/11 tests passed):
      1. ✅ Head admin successfully changed another admin's email only
         - Verified login works with new email and old password
      
      2. ✅ Head admin successfully changed another admin's password only
         - Old password correctly rejected with 401 after change
         - New password works for login and returns valid JWT token
      
      3. ✅ Head admin successfully changed both email and password at once
         - Login with new credentials works correctly
      
      4. ✅ Duplicate email validation working correctly
         - Attempting to use existing admin email returns 400 error
      
      5. ✅ Permission enforcement working correctly
         - Regular admin (redhill) correctly blocked from changing credentials with 403 error
      
      6. ✅ Head admin can change own email
         - Verified re-login required with new email
         - Token properly invalidated after email change
      
      ENDPOINT TESTED: PUT /api/admin/{admin_id}/credentials
      - Accepts: {"new_email": "...", "new_password": "..."} (either or both)
      - Returns: {"success": true, "message": "...", "new_email": "..."}
      - Access: Head admin only (403 for regular admins)
      - Validation: Duplicate email check (400 error)
      - Security: Password hashing, token invalidation on credential change
      
      TOTAL: 66/66 tests passed (100% success rate)
      
      All admin credentials management scenarios are working correctly. The feature is
      production-ready with proper security controls, validation, and error handling.

