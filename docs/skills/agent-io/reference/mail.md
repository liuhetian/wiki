---
description: "Agent 读取邮箱：读 /var/lib/mail-intake/mailboxes/ 下所有邮箱的未读邮件，用 mailctl list --json 看未读数、mailctl read 读信并自动标已读，按邮箱分组汇总成中文清单"
---

# 读取邮箱

读取 `/var/lib/mail-intake/mailboxes/` 下所有邮箱的未读邮件，用中文把内容汇总给用户，然后把它们标记为已读。

## 执行步骤

1. 运行 `mailctl list --json`，得到每个邮箱的 `mailbox` 与 `unread` 数量
2. 对每个 `unread > 0` 的邮箱依次运行 `mailctl read <mailbox>`。该命令输出每封未读邮件的 JSON（`message_id`、`date`、`from`、`to`、`subject`、`body`、`attachments` 等），并在输出后自动写入已读标记 —— 不需要再单独调用 `mark`
3. 把结果整理成清单：按邮箱分组，每封邮件写明发件人、主题、时间、正文要点（长正文提炼，不整段照抄）、附件名
4. 没有未读邮件，只回复「今天没有未读邮件」
5. 有邮件解析失败或标记已读失败，单独说明是哪封、什么错误，不静默跳过

## 注意

- 用 `read` 而不是 `peek`，因为需要标记已读
- 一次 `read` 的 `--limit` 默认 20；某邮箱未读数超过 20，重复执行，直到 `mailctl list --json` 显示 `unread` 为 0
