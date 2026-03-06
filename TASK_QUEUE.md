# 📋 TASK QUEUE - Piata AI Marketplace Recovery

**Last Updated**: 2026-02-26 12:05 UTC
**Division**: Drapaku (SuperClaude + Nanobot)
**Mission**: 4/10 → 9/10

---

## 🎯 IMMEDIATE PRIORITIES (Next 24h)

### Nanobot (Infrastructure) - HIGH PRIORITY

- [x] **Fix dating-app PM2 service** (CRITICAL - 15 restarts)
  - Check logs: `pm2 logs dating-app --lines 100`
  - Identify error (missing env, port conflict, syntax error)
  - Fix ecosystem.config.js
  - Restart and verify stability
  - Success: `online` with 0 restarts for 1 hour

- [ ] **Import n8n workflows** (HIGH - automation dead)
  - Access http://localhost:5678
  - Import 4 workflow files from `/root/n8n-workflows/`
  - Configure Telegram credentials (token: YOUR_TELEGRAM_TOKEN_HERE)
  - Set active: true for all workflows
  - Test execution manually
  - Success: All workflows active with successful executions

- [ ] **Monitor PM2 stability** (ONGOING)
  - Hourly checks: `pm2 status`, `pm2 list`
  - Verify no unexpected restarts
  - Check cron job execution
  - Success: All services `online` for 24h

- [ ] **Verify cron jobs** (MEDIUM)
  - Check syslog for CRON entries
  - Confirm backup, monitoring, health checks running
  - Success: All scheduled jobs executing

### SuperClaude (Architecture) - HIGH PRIORITY

- [ ] **Implement ASF flow execution engine** (CRITICAL)
  - Read `/root/ASF/src/asf/orchestrator.py`
  - Design flow execution logic
  - Implement `execute_flow()` method
  - Load skills from `/root/ASF/skill_index.json`
  - Test with simple flow
  - Success: ASF can execute a flow end-to-end

- [ ] **Remove Pieces LTM vaporware** (HIGH)
  - Delete or stub `pieces_ltm.py` in fannymae-api
  - Update health endpoint to report "disabled" not "available"
  - Remove Pieces OS dependencies
  - Success: Health check shows Pieces LTM = false/disabled

- [ ] **Consolidate configuration** (HIGH)
  - Find all `.env` files in project
  - Create single `.env` in `/root/piata-ai-fresh/` or project root
  - Update code to read from central config
  - Success: Only 1 .env file exists, all code uses it

- [ ] **Fix API root endpoint** (MEDIUM)
  - Add route for `/` in fannymae-api (currently 404)
  - Return basic info or redirect to /docs or /api/health
  - Success: `curl http://localhost:8000/` returns 200 OK

- [ ] **Write tests for critical paths** (MEDIUM)
  - Test ASF flow execution
  - Test skill loading
  - Test API endpoints
  - Success: Tests pass with >80% coverage on new code

---

## 📊 SHORT-TERM GOALS (1 Week)

### Nanobot:
- [ ] All PM2 services stable (0 restarts for 7 days)
- [ ] n8n workflows fully operational
- [ ] Grafana dashboards set up (if available)
- [ ] Alerting configured for critical failures
- [ ] All containers healthy with proper resource limits

### SuperClaude:
- [ ] ASF orchestrator functional (can execute flows)
- [ ] Skills system integrated (600+ skills loadable)
- [ ] Configuration centralized (1 .env file)
- [ ] Pieces LTM completely removed
- [ ] API documentation updated to match reality
- [ ] End-to-end test suite passing

---

## 🎯 MEDIUM-TERM GOALS (1 Month)

- [ ] ASF can coordinate multi-agent workflows
- [ ] n8n automation fully integrated with Telegram
- [ ] All 600+ skills testable and documented
- [ ] Configuration management automated
- [ ] Error handling and logging standardized
- [ ] Test coverage >80% on critical paths
- [ ] Documentation matches actual capabilities (no fantasy)
- [ ] Production deployment ready

---

## 🏆 LONG-TERM GOALS (2-3 Months)

- [ ] Overall system rating: 9/10
- [ ] 99.9% service uptime
- [ ] Complete end-to-end user journey working
- [ ] All components properly integrated
- [ ] Monitoring and alerting comprehensive
- [ ] Documentation accurate and complete
- [ ] Code quality: black, ruff, mypy all passing
- [ ] Ready for production deployment

---

## 📝 HOW TO USE THIS QUEUE

1. **Pick a task** from your domain (Nanobot or SuperClaude)
2. **Work on it** independently
3. **Update status**:
   - Change `[ ]` to `[x]` when complete
   - Add notes in parentheses if needed
4. **Report** in OPERATIONS_LOG.md:
   ```markdown
   [2026-02-26 13:00] Nanobot: Completed dating-app fix, service now online
   ```
5. **Move to next task** in priority order

---

**Remember**: Work in parallel. Do not wait for the other. Communicate via files.

**Current Focus**: 24h sprint on immediate priorities above.

---

**Task Queue v1.0**
🟢 SuperClaude & 🛡️ Nanobot - Operating Separately, Together
