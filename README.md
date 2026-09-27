# dsh-wsl-power

DeepSeek Harness plugin: Windows power state from WSL: active power plan, battery status and sleep settings.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-power
```

## Usage

```
win_power             # active plan, battery, sleep setting
```

## Notes

Reads the active scheme with `powercfg`. `battery` is absent on desktops.
`sleepAcSeconds` is the AC standby timeout; `0` means never.

## Requirements

- Windows with WSL, and DeepSeek Harness running inside it.

## Tests

```sh
npm test
```

The unit tests run anywhere. The live tests are skipped outside WSL.

## License

MIT
