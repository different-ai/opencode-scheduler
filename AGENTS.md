# Agent-Native Architecture: Implementation Guide

A practical reference for building applications where agents are first-class citizens.

---

## Core Principles

### 1. Parity

**Whatever the user can do through the UI, the agent must be able to achieve through tools.**

Create a capability map:

| User Action | Agent Method                        |
| ----------- | ----------------------------------- |
| Create item | `write_file` or `create_item` tool  |
| Update item | `update_file` or `update_item` tool |
| Delete item | `delete_file` or `delete_item` tool |
| Search      | `search_files` or `search` tool     |

**Test:** Pick any UI action. Can the agent accomplish it?

### 2. Granularity

**Prefer atomic primitives. Features are outcomes achieved by an agent in a loop.**

```
# Wrong - logic in code
Tool: classify_and_organize_files(files)

# Right - agent decides
Tools: read_file, write_file, move_file, list_directory, bash
Prompt: "Organize downloads by content and recency"
```

**Test:** To change behavior, do you edit prose or refactor code?

### 3. Composability

**New features = new prompts (when tools are atomic and parity exists).**

```
Prompt: "Review files modified this week. Summarize changes. Suggest three priorities."
```

No code written. Agent uses `list_files`, `read_file`, and judgment.

### 4. Emergent Capability

**Agent can accomplish things you didn't explicitly design for.**

Build atomic tools → Users ask unexpected things → Agent composes solutions → You observe patterns → Optimize common patterns → Repeat.

---

## Tool Design

### Domain Tools

Add when needed for:

1. **Vocabulary anchoring** - `create_note` teaches "note" concept better than "write file with format"
2. **Guardrails** - Validation that shouldn't be left to agent judgment
3. **Efficiency** - Common multi-step operations

**Rule:** One conceptual action per tool. Judgment stays in prompts.

```
# Wrong
analyze_and_publish(input)  # bundles judgment

# Right
publish(content)  # one action, agent decided what to publish
```

**Keep primitives available.** Domain tools are shortcuts, not gates.

### CRUD Completeness

For every entity, verify agent has:

- **Create** - Can make new instances
- **Read** - Can see what exists
- **Update** - Can modify existing
- **Delete** - Can remove

### Dynamic Capability Discovery

Instead of static tool-per-endpoint:

```python
# Two tools handle any API
list_available_types() → ["steps", "heart_rate", "sleep", ...]
read_data(type) → reads any discovered type
```

Agent discovers capabilities at runtime. New API features work automatically.

---

## Completion Signals

**Provide explicit completion tool. Don't use heuristics.**

```swift
struct ToolResult {
    let success: Bool
    let output: String
    let shouldContinue: Bool
}

// Usage patterns:
.success("Result")    // success=true, continue=true
.error("Message")     // success=false, continue=true (recoverable)
.complete("Done")     // success=true, continue=false (stop loop)
```

### Partial Completion

Track progress at task level:

```swift
struct AgentTask {
    var status: TaskStatus  // pending, in_progress, completed, failed, skipped
    var notes: String?
}
```

Checkpoint preserves which tasks completed. Resume continues from there.

---

## Files as Universal Interface

### Why Files

- Agents already know `cat`, `grep`, `mv`, `mkdir`
- Files are inspectable, portable, sync across devices
- Directory structure = information architecture

### File Organization

```
{entity_type}/{entity_id}/
├── primary content
├── metadata
└── related materials
```

**Naming conventions:**

| Type        | Pattern                  | Example            |
| ----------- | ------------------------ | ------------------ |
| Entity data | `{entity}.json`          | `library.json`     |
| Content     | `{type}.md`              | `introduction.md`  |
| Agent logs  | `agent_log.md`           | Per-entity history |
| Checkpoints | `{sessionId}.checkpoint` | UUID-based         |

**Ephemeral vs. durable:**

```
Documents/
├── AgentCheckpoints/     # Ephemeral
├── AgentLogs/            # Ephemeral
└── Research/             # Durable (user's work)
```

### The context.md Pattern

Agent reads at session start:

```markdown
# Context

## Who I Am

Reading assistant for the app.

## What I Know About This User

- Interested in military history
- Prefers concise analysis

## What Exists

- 12 notes in /notes
- 3 active projects

## Recent Activity

- Created "Project kickoff" (2 hours ago)

## My Guidelines

- Don't spoil books they're reading

## Current State

- No pending tasks
- Last sync: 10 minutes ago
```

### Files vs. Database

| Use files for                  | Use database for            |
| ------------------------------ | --------------------------- |
| User-readable/editable content | High-volume structured data |
| Configuration                  | Complex queries             |
| Agent-generated content        | Ephemeral state             |
| Transparency matters           | Relationships/indexing      |

---

## Context Injection

System prompts include:

**Available resources:**

```
## Available Data
- 12 notes in /notes, most recent: "Project kickoff" (today)
- 3 projects in /projects
```

**Capabilities:**

```
## What You Can Do
- Create, edit, tag, delete notes
- Organize files into projects
- Search across all content
```

**Recent activity:**

```
## Recent Context
- User created "Project kickoff" (2 hours ago)
```

---

## Agent-to-UI Communication

**Event types:**

```swift
enum AgentEvent {
    case thinking(String)
    case toolCall(String, String)
    case toolResult(String)
    case textResponse(String)
    case statusChange(Status)
}
```

**Principles:**

- No silent actions - changes visible immediately
- Show progress during execution, not just results
- Consider `ephemeralToolCalls` flag for noisy internal operations

---

## Mobile Specifics

### Checkpoint and Resume

```swift
struct AgentCheckpoint: Codable {
    let agentType: String
    let messages: [[String: Any]]
    let iterationCount: Int
    let taskListJSON: String?
    let customState: [String: String]
    let timestamp: Date
}
```

**When to checkpoint:**

- On app backgrounding
- After each tool result
- Periodically during long operations

**Resume flow:**

1. Load interrupted sessions on launch
2. Filter by validity (default 1 hour max age)
3. Show resume prompt if valid
4. Restore messages and continue loop

### Background Execution

~30 seconds available. Use to:

- Complete current tool call if possible
- Checkpoint session state
- Transition to backgrounded state

### Storage (iCloud-first)

```swift
var containerURL: URL {
    if let iCloudURL = fileManager.url(forUbiquityContainerIdentifier: nil) {
        return iCloudURL.appendingPathComponent("Documents")
    }
    return fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
}
```

---

## Anti-Patterns

| Anti-Pattern                                   | Fix                                        |
| ---------------------------------------------- | ------------------------------------------ |
| Agent as router only                           | Let agent act, not just route              |
| Workflow-shaped tools (`analyze_and_organize`) | Break into primitives                      |
| Orphan UI actions                              | Maintain parity                            |
| Context starvation                             | Inject resources into system prompt        |
| Gates without reason                           | Default to open, keep primitives available |
| Heuristic completion detection                 | Explicit completion tool                   |
| Static API mapping                             | Dynamic capability discovery               |

---

## Success Checklist

**Architecture:**

- [ ] Agent can achieve anything users can (parity)
- [ ] Tools are atomic primitives (granularity)
- [ ] New features = new prompts (composability)
- [ ] Agent handles unexpected requests (emergent capability)

**Implementation:**

- [ ] System prompt includes resources and capabilities
- [ ] Agent and user share same data space
- [ ] Agent actions reflect immediately in UI
- [ ] Every entity has full CRUD
- [ ] Agents explicitly signal completion

**Ultimate test:** Describe an outcome in your domain that you didn't build a feature for. Can the agent figure it out in a loop until success?
