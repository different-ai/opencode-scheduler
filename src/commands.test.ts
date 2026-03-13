import { describe, test, expect } from "bun:test"
import { schedulerCommands, applySchedulerCommands } from "./commands"

describe("schedulerCommands", () => {
  test("has exactly 4 command keys", () => {
    const keys = Object.keys(schedulerCommands)
    expect(keys).toHaveLength(4)
    expect(keys.sort()).toEqual(
      ["scheduler-delete", "scheduler-get", "scheduler-list", "scheduler-logs"].sort()
    )
  })

  test("every command has a non-empty template string", () => {
    for (const [name, cmd] of Object.entries(schedulerCommands)) {
      expect(typeof cmd.template).toBe("string")
      expect(cmd.template.length).toBeGreaterThan(0)
    }
  })

  test("every command has a non-empty description string", () => {
    for (const [name, cmd] of Object.entries(schedulerCommands)) {
      expect(typeof cmd.description).toBe("string")
      expect(cmd.description!.length).toBeGreaterThan(0)
    }
  })

  test("scheduler-delete template contains 'confirm' for safety", () => {
    expect(schedulerCommands["scheduler-delete"].template).toContain("confirm")
  })

  test("scheduler-get template contains $ARGUMENTS placeholder", () => {
    expect(schedulerCommands["scheduler-get"].template).toContain("$ARGUMENTS")
  })

  test("scheduler-logs template contains $ARGUMENTS placeholder", () => {
    expect(schedulerCommands["scheduler-logs"].template).toContain("$ARGUMENTS")
  })

  test("scheduler-delete template contains $ARGUMENTS placeholder", () => {
    expect(schedulerCommands["scheduler-delete"].template).toContain("$ARGUMENTS")
  })
})

describe("applySchedulerCommands", () => {
  test("mutates config.command to include all 4 commands", () => {
    const config: { command?: Record<string, any> } = {}
    applySchedulerCommands(config)

    expect(config.command).toBeDefined()
    const keys = Object.keys(config.command!)
    expect(keys).toContain("scheduler-list")
    expect(keys).toContain("scheduler-get")
    expect(keys).toContain("scheduler-logs")
    expect(keys).toContain("scheduler-delete")
  })

  test("preserves existing commands in config", () => {
    const config: { command?: Record<string, any> } = {
      command: {
        "my-custom-cmd": { template: "do something", description: "custom" },
      },
    }
    applySchedulerCommands(config)

    expect(config.command!["my-custom-cmd"]).toEqual({
      template: "do something",
      description: "custom",
    })
    expect(config.command!["scheduler-list"]).toBeDefined()
  })
})
