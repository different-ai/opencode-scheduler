import { appendFileSync } from "fs"
import { join } from "path"
import { installSystemdUnits, type SystemdCommandRunner } from "../../src/systemd"

const [root, ledger, id] = process.argv.slice(2)
if (!root || !ledger || !id) throw new Error("usage: systemd-stale-reclaimer <root> <ledger> <id>")
const sleepArray = new Int32Array(new SharedArrayBuffer(4))
const sleep = (milliseconds: number) => Atomics.wait(sleepArray, 0, 0, milliseconds)
const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
  if (command.includes("is-enabled")) return Buffer.from("disabled\n")
  if (command.includes("is-active")) return Buffer.from("inactive\n")
  if (command.endsWith("daemon-reload")) {
    appendFileSync(ledger, `start:${id}\n`)
    sleep(100)
    appendFileSync(ledger, `end:${id}\n`)
  }
  return Buffer.alloc(0)
}
installSystemdUnits({
  unitDir: root,
  lockDir: join(root, "locks"),
  serviceUnit: "job.service",
  timerUnit: "job.timer",
  serviceContent: `service:${id}`,
  timerContent: `timer:${id}`,
  run,
  lock: { staleAfterMs: 1_000, timeoutMs: 2_000, pollMs: 2 },
})
