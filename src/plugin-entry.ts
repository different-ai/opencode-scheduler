/**
 * Bundle entry for the published OpenCode plugin.
 *
 * IMPORTANT: keep this file's named exports limited to `SchedulerPlugin`
 * and the default export. OpenCode's plugin loader iterates every named
 * export of a plugin module and invokes each as `await fn(input)`. If
 * we re-export internal helpers like `parseSessionPolicy` here, they
 * will be called with a `PluginInput` object at bootstrap time and
 * either throw (rejecting Plugin.state and breaking TUI startup) or
 * trigger real side effects such as `client.session.create`.
 *
 * Internal test helpers stay in `src/index.ts`; tests import the TS
 * source directly, so they don't need to come through the bundle.
 *
 * Reference: opencode-fork/packages/opencode/src/plugin/index.ts:87-92
 */
export { SchedulerPlugin } from "./index"
export { SchedulerPlugin as default } from "./index"
