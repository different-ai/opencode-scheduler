import { writeFileSync } from "fs"
import { join } from "path"
import { installSystemdUnits, type SystemdCommandRunner } from "../../src/systemd"

const [root, marker, behavior] = process.argv.slice(2)
if (!root || !marker || !behavior) throw new Error("usage: systemd-lock-child <root> <marker> <success|fail>")

const sleepArray = new Int32Array(new SharedArrayBuffer(4))
const sleep = (milliseconds: number) => Atomics.wait(sleepArray, 0, 0, milliseconds)
const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
  if (command.includes("is-enabled")) return Buffer.from("disabled\n")
  if (command.includes("is-active")) return Buffer.from("inactive\n")
  if (command.endsWith("daemon-reload")) {
    writeFileSync(marker, "locked")
    sleep(150)
    if (behavior === "fail") throw new Error("child failure")
  }
  return Buffer.alloc(0)
}

installSystemdUnits({
  unitDir: root,
  lockDir: join(root, "locks"),
  serviceUnit: "job.service",
  timerUnit: "job.timer",
  serviceContent: "child service",
  timerContent: "child timer",
  run,
})
