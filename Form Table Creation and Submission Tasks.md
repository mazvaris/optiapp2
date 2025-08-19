  
Form table and submission tasks:

For each form specified do the following tasks top-down because they are dependency-ordered.

1) Create table schema.  
2) Include table reference(s) to related table(s) if required (FKs, indexes).  
3) Add audit fields (created\_by, created\_at, updated\_at).  
4) Create a revision history system to preserve all updates (versioning table \+ triggers or CDC).  
5) Create a role-lookup function that returns the current user’s role from profiles.role.  
6) Define least-privilege defaults for each role (Optometrist, Dispensing Optician, Technician, Receptionist, Practice Manager, System Administrator, Student, Inspector) where not explicitly specified. Document the matrix.  
7) Create/Update RLS policies for the table, implemented via the role-lookup function and your role matrix.  
8) Create API client function for form submission targeting the secured endpoint (uses the table \+ RLS).  
9) Implement form validation (sync \+ async as needed, matching server constraints).  
10) Implement form submission handling (calls the API client; handles server-side validation errors).  
11) Implement loading and success/error states  
12) Show a loading indicator during submission.  
13) Display success and error messages based on API responses.

