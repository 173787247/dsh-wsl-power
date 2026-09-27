# dsh-wsl-power

> 从 WSL 读取 Windows 电源状态：当前电源方案、电池状态与睡眠设置。

DeepSeek Harness 插件：Windows power state from WSL: active power plan, battery status and sleep settings.

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)** 的一部分。

[English → README.md](./README.md)

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-power
```

## 用法

```
win_power             # active plan, battery, sleep setting
```

## 说明

Reads the active scheme with `powercfg`. `battery` is absent on desktops.
`sleepAcSeconds` is the AC standby timeout; `0` means never.

## 依赖

- Windows + WSL，DeepSeek Harness 跑在 WSL 里。

## 测试

```sh
npm test
```

单元测试在任何平台都能跑；实时测试在 WSL 之外自动跳过。

## 许可

MIT
