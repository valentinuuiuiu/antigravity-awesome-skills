---
name: jules-marketplace
description: "Automates daily marketplace tasks for Jules, including blog posting, video creation, and agent monitoring."
risk: safe
source: "custom"
---

# Jules Marketplace Skill

## Overview

This skill enables Jules to perform automated daily tasks related to marketplace management. It encompasses routines for content creation (blogs, videos) and operational monitoring (checking agents).

## Capabilities

*   **Daily Routine Automation**: Orchestrates the execution of all daily tasks.
*   **Blog Posting**: Automates the process of drafting and publishing blog posts.
*   **Video Creation**: Automates the generation of video content for the marketplace.
*   **Agent Monitoring**: Checks the status and health of other agents or services.

## When to Use This Skill

Use this skill when you need to run Jules' daily operational checklist or perform specific marketplace-related tasks automatically.

## Usage

To run the full daily routine:
```bash
python skills/jules-marketplace/scripts/daily_routine.py
```

To perform individual tasks:
*   **Post Blog**: `python skills/jules-marketplace/scripts/post_blog.py`
*   **Create Video**: `python skills/jules-marketplace/scripts/create_video.py`
*   **Check Agents**: `python skills/jules-marketplace/scripts/check_agents.py`
