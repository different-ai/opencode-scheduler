import { appendFileSync, rmSync } from "fs"
import { join } from "path"
import { installSystemdUnits, type SystemdCommandRunner, type SystemdFileSystem } from "../../src/systemd"
import * as fs from "fs"

const [root, ledger, id, delayArg] = process.argv.slice(2)
if (!root || !ledger || !id || !delayArg) throw new Error("usage: systemd-release-race <root> <ledger> <id> <delay-ms>")
const sleepArray = new Int32Array(new SharedArrayBuffer(4))
const sleep = (milliseconds: number) => Atomics.wait(sleepArray, 0, 0, milliseconds)
sleep(Number(delayArg))
const fileSystem: SystemdFileSystem = {
  chmod: fs.chmodSync, exists: fs.existsSync, lstat: fs.lstatSync, mkdir: fs.mkdirSync,
  readFile: fs.readFileSync, readlink: fs.readlinkSync, rename: fs.renameSync,
  rm: (path, options) => {
    if (String(path).includes(".release-") && id === "a") sleep(100)
    return rmSync(path, options)
  },
  stat: fs.statSync, symlink: fs.symlinkSync, unlink: fs.unlinkSync, writeFile: fs.writeFileSync,
}
const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
  if (command.includes("is-enabled")) return Buffer.from("disabled\n")
  if (command.includes("is-active")) return Buffer.from("inactive\n")
  if (command.endsWith("daemon-reload")) appendFileSync(ledger, `transaction:${id}\n`)
  return Buffer.alloc(0)
}
installSystemdUnits({
  unitDir: root, lockDir: join(root, "locks"), lockKey: "shared",
  serviceUnit: `${id}.service`, timerUnit: `${id}.timer`, serviceContent: id, timerContent: id,
  run, fileSystem, lock: { timeoutMs: 2_000, pollMs: 2 },
})
