# Development Backlog

## Security & Infrastructure

### 🔒 Database-Level Security Fix for RLS Vulnerability
**Priority**: Medium (Application-level fix already implemented)  
**Story ID**: TBD  
**Estimated Effort**: 2-4 hours  

**Description:**
Complete the RLS security vulnerability fix by implementing database-level triggers and constraints to replace the vulnerable `check_parent_same_user` constraint.

**Background:**
✅ **SECURED**: Application-level fix implemented via secure validation functions in `packages/shared/src/security/task-validation.ts`. All attack vectors are currently blocked and validated with comprehensive test coverage.

🔄 **REMAINING**: Database still contains the vulnerable constraint that has race condition issues and can be bypassed by direct database access (defense-in-depth improvement).

**Acceptance Criteria:**
- [ ] Remove vulnerable `check_parent_same_user` constraint
- [ ] Implement secure `validate_parent_task_ownership()` function with SECURITY DEFINER
- [ ] Add BEFORE INSERT trigger for task creation validation  
- [ ] Add BEFORE UPDATE trigger for parent_task_id changes
- [ ] Add `check_no_self_parent` constraint to prevent circular references
- [ ] Verify all security tests pass with database-level enforcement
- [ ] Update security documentation with database-level implementation

**Technical Requirements:**
- Access to Supabase dashboard SQL editor OR Supabase CLI setup
- Run migration: `supabase/migrations/20250903000001_fix_rls_security.sql`
- Test with security vulnerability test suite
- Verify RLS policies work correctly with new triggers

**Files Involved:**
- `supabase/migrations/20250903000001_fix_rls_security.sql` (ready to apply)
- `docs/security/RLS-VULNERABILITY-FIX.md` (update with database implementation)
- `tests/security-vulnerability.test.js` (should pass after fix)

**Dependencies:**
- Supabase project access (dashboard or CLI)
- Database admin privileges for DDL operations

**Risk Level:** Medium (could affect existing task operations if not tested properly)

**Notes:**
- App-level fix is already implemented and working
- Database fix will provide defense-in-depth security
- Consider testing in staging environment first
- Monitor for any performance impact of triggers

---

## Future Enhancements

_(Add other backlog items here as they arise)_