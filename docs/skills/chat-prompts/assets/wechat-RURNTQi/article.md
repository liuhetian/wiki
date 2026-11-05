# 许愿式编程上线前，把这段话复制给你的AI

刘小排r · 刘小排 · 2026-10-23 15:48 · [原文](https://mp.weixin.qq.com/s/RURNTQi-DJ2WNcvyF-ZsDA)

哈喽，大家好，我是刘小排。

今年我有两个非常难回答的问题：

- 你公众号有没有用AI？

- 你的产品是不是Vibe Coding的？

我的公众号有没有用AI？AI这么好的东西，当然要用啊。但是我直接回答说“我用了AI写公众号”，我隔着屏幕都能看到有人说“看吧，AI写的，没营养，取关”。

实际上，“我写公众号时用了AI”和“我的公众号是用AI写的”，是两件截然不同的事。

我的产品是不是Vibe Coding出来的？同理。好在我并不太需要回答，因为问我这个问题的人也不是我的用户，我产品的用户多不多、是否付费给我，跟我产品是不是Vibe Coding出来的，完全无关。

Vibe Coding，我更喜欢叫它“许愿式编程”。如果创始人完全不懂技术，的确很容易出屎山、Bug、安全隐患。

解决方法？解决方法是学习。

可惜现在很多人都没有什么耐心，容易被许愿式编程吸引，不愿意花时间学习。从事这行越久，越能理解：**很多人为了逃避真正的学习，愿意做任何事。**

为了缓解朋友们的焦虑，我一直在思考：**有没有什么方法，让习惯于“许愿式编程”的新手朋友们，在不学习的前提下，也能够尽量减少屎山和代码Bug呢？**

最近，我找到了一个方法。

你就尽管去“许愿式编程”吧！但是在正式发布产品、开始收钱之前，把下面这段话复制给你的AI，让它检查一遍。

先说好，这不是什么万能咒语。AI不一定能查出所有问题，更不代表它查出来就能修好。

但是，你连问题都不知道在哪里，又怎么可能解决呢？

这份清单来自 Limestone Digital 的创始人 Mark Ajzenstadt。

原本，Mark是想提醒那些觉得“有了Vibe Coding，就再也不需要程序员”的朋友：做出一个能跑的产品，和做出一个能长期运行、敢让用户付钱的产品，中间还隔着一大堆事情。

不过，我发现，这份清单反过来用也挺好。

既然AI能帮你写代码，为什么不让它按照这份清单，帮你检查代码呢？

我在清单前面加了一段提示词。你可以把整段一起复制给正在帮你编程的AI：

```
你现在是我的软件工程审查员。
请先阅读这个项目的实际代码和配置，再按照下面的清单逐项检查。

要求：
先判断每一项是否适用于我的产品。不适用的直接跳过，不要为了满足清单而增加无用的功能。
发现问题时，告诉我风险是什么、严重程度如何，并指出对应的代码文件或配置。不要只给通用建议。
没有实际检查到的地方，就说“无法确认”，不要假装检查过。
按严重程度排序，先告诉我最值得修复的10个问题，尤其是可能导致数据泄露、资金损失、服务中断的问题。
暂时不要修改代码。等我确认后，我们再一个一个解决。

以下是检查清单：
> a schema someone designed, instead of one the AI improvised table by table
> login that still works when someone puts a plus sign in their email
> password reset links that expire and work once
> MFA, plus a recovery path for the user who lost their phone
> sessions that time out, and a way to kill every session for one user
> SSO for the enterprise customer who won't sign without it
> SAML, because that customer's IT team doesn't do magic links
> SCIM, so a fired employee loses access the moment IT offboards them
> roles and permissions deeper than "admin" and "everyone else"
> checks that stop user A from reading user B's data by changing one number in the URL
> tenant isolation, so one customer's bug never shows another customer's records
> an admin "log in as this user" button for support, with an audit trail on every use
> rate limits on login, so nobody can guess passwords at scale
> lockouts that stop attackers without locking out your CFO the night before the board meeting
> database migrations that run forward and roll back
> migrations that don't lock the main table at 2pm on a Tuesday
> indexes, because the query that was instant on 50 test rows times out on 5 million real ones
> connection pooling, so a traffic spike doesn't exhaust the database
> backups every night
> a restore from those backups, tested, because a backup you've never restored is a hope
> point-in-time recovery for the day someone runs a delete without a where clause
> soft deletes, so "I deleted it by accident" is a support ticket and not an incident
> validation on the server, not just in the form
> timezones stored right, so the 9am reminder doesn't fire at 4am
> the customer with an apostrophe in their last name
> emoji, accents and right-to-left text in every field
> money stored as integers, because 0.1 + 0.2 doesn't equal 0.3 in floating point
> currency, rounding and tax rules for every country you sell into
> a data model that survives your second customer asking for "one small change"
> idempotency keys, so a retried payment doesn't charge the card twice
> deduplication for the user who clicks submit four times
> pagination that still works on page 400
> exports, because sooner or later every customer wants their data in a spreadsheet
> imports that survive the CSV someone saved in 2009
> retention rules, and code that deletes what your contract says you'll delete
> secrets out of the code, out of the repo and out of the AI chat history
> rotating every key the AI pasted into a config file last month
> confirming every package the AI installed exists and is the one you meant
> dependency scanning, because the AI pulled in libraries nobody reviewed
> input sanitization everywhere a user can type
> protection against SQL injection, XSS, CSRF and the rest of the OWASP list
> file uploads that get scanned, size-limited and stored where they can't execute
> CORS rules that aren't "allow everything"
> security headers on every response
> encryption at rest and in transit
> least-privilege access for everyone, including the AI agent holding production credentials
> logs that record who did what, without recording passwords, tokens or card numbers
> a penetration test before your enterprise customer's security team runs their own
> answers to the security questionnaire every enterprise buyer sends, with evidence behind each one
> a disclosure process for the day a stranger emails you a vulnerability
> a plan for the day a laptop with production access gets stolen
> SOC 2, which means policies, evidence and an auditor, not a checkbox
> HIPAA, the moment a single patient record touches your system
> a BAA with every vendor that touches that data, including your AI model provider
> audit trails that show who viewed a record, not just who changed it
> PCI scope, and card numbers kept out of your database
> GDPR deletion requests that reach every table, backup and log
> data residency for the customer whose contract says EU only
> quarterly access reviews someone signs off on
> dev, staging and production environments that match each other
> infrastructure written as code, so the setup lives somewhere other than one person's memory
> a deploy pipeline that runs the tests before anything reaches customers
> one-click rollbacks, because Friday deploys happen
> zero-downtime deploys, because your customers don't have maintenance windows
> feature flags, so you can ship the code without shipping the feature
> autoscaling for the Monday morning spike
> a CDN, so the app loads fast in Singapore too
> DNS, SSL certificates, and renewals that don't expire on a Sunday
> background job queues, so slow work doesn't freeze the page
> retries with backoff, so one flaky API call doesn't become a lost order
> a dead-letter queue for the jobs that fail every retry
> cron jobs that don't run twice the day you add a second server
> caching, and clearing that cache when the data changes
> SPF, DKIM and DMARC, so your password resets don't land in spam
> bounce and complaint handling on every transactional email
> storage rules, so you stop paying to keep 2021's temp files
> cost alerts, so a runaway agent loop shows up the same day and not on the invoice (we learned this one for $1,382.59)
> a disaster recovery plan, written down and tested once a year
> a second region, if your contract promises uptime one region can't deliver
> structured logs you can search at 3am
> error tracking that groups the same bug instead of sending you 4,000 emails
> uptime checks from outside your own network
> alerts that page a human, tuned until they stop paging for nothing
> dashboards for latency, error rate and throughput
> tracing for one slow request across every service it touches
> an on-call rotation, and a person who picks up
> runbooks, so the engineer on call knows what "queue depth critical" means
> postmortems that change something
> a status page customers check before they email you
> unit tests written by someone who knows what the logic should do
> integration tests for every third-party API you depend on
> end-to-end tests for signup, checkout and the other flows that make you money
> load testing before the launch email goes out
> test data that looks like production without being production data
> regression tests, so fixing bug 41 doesn't bring back bug 12
> testing on the five-year-old laptop your biggest customer's ops team still uses
> accessibility compliance, because the enterprise contract requires it
> subscriptions, upgrades, downgrades and proration
> failed-payment retries and dunning emails
> invoices with the customer's PO number on them, because procurement won't pay without it
> sales tax and VAT
> refunds, credits and partial refunds
> usage metering that matches what you bill, to the cent
> annual contracts with custom terms your billing logic never planned for
> revenue reports your finance team can reconcile
> webhooks that verify signatures
> webhooks that retry, with a log of every failed delivery
> a versioned API, so you can change it without breaking your customers' integrations
> API keys customers can create and revoke
> API rate limits that protect you without blocking real integrations
> a plan for the day a third-party API changes its response format without telling you
> OAuth token refresh, because tokens expire at the worst possible moment
> a sandbox where customers can test their integration
> protection against prompt injection in every field that reaches the model
> customer and patient data kept out of prompts that leave your network
> a model spend cap per customer, so one heavy user can't run up your bill
> evals, so you find out when a model update makes your answers worse
> a fallback for the afternoon your model provider goes down
> a migration plan for the day your model gets deprecated
> prompt and output logs for debugging, minus whatever you're not allowed to keep
> a human approval step for anything the AI does that can't be undone
> pages that load on hotel wifi
> empty states, loading states and error states on every screen
> error messages a customer can act on, instead of "something went wrong"
> forms that keep what people typed when one field fails validation
> emails that render in every mail client your customers use
> notifications people can turn off
> undo
> keyboard navigation and screen reader support
> translations, with dates and numbers formatted for each locale
> a back button that does what people expect
> code a human can read
> code review on every change
> a branching strategy, so two people can work without overwriting each other
> monthly dependency upgrades, so you're never two major versions behind
> framework upgrades before the old version stops getting security patches
> deleting the dead code the AI left behind from its first three attempts
> splitting up the 2,000-line file the AI kept appending to
> architecture decisions written down, with the reasons
> a README that gets a new engineer running locally in under an hour
> documentation for whoever inherits this
> an admin panel for your ops team
> support tooling, so customer success can answer questions without pinging engineering
> a changelog customers can read
> terms and a privacy policy that match what the code does
> every account, domain and repo in the company's name, not the name of whoever built the prototype
> a bus factor higher than one

Oh, and besides keeping all of this working every day, forever… your vibe-coded app will still need people who know what they're doing:

> reading every line the AI wrote before it ships (a senior engineer)
> designing the data model before your second customer breaks it (a backend engineer)
> explaining why the AI's fix for one bug created two new ones (a senior engineer, again)
> deploys, rollbacks, servers and the cloud bill (a DevOps engineer)
> answering the page at 3am when payments stop (whoever's on call)
> patching the framework the week a vulnerability goes public (security)
> walking an auditor through how patient data moves (security and compliance)
> testing what the AI says it tested (QA)
> running a migration on a live database without losing a row (a backend engineer)
> saying no to the feature that breaks three others (a tech lead)
> turning "works on my laptop" into "works for every customer at once" (an architect)
> debugging the code when the AI that wrote it can't (a senior engineer)
> remembering why it's built this way, a year from now (someone who was there)
```

写在最后：

没错，这是一个“方便法门”。虽然能够一定程度上减少屎山、Bug、安全性问题，

但是，我仍然想强调，对做严肃产品感兴趣的朋友，我的建议不变：

**AI懂不等于你懂。**

有时间就多学习内功，至少，你得搞明白上面清单的每个术语是啥意思吧。

延伸阅读：[Claude Code极简入门：3条铁律让你告别代码屎山](https://mp.weixin.qq.com/s?__biz=MzI1MTUxNzgxMA==&mid=2247498637&idx=1&sn=dff471a4f5c9c3ea3cd892e4279cdca5&scene=21#wechat_redirect)

欢迎交流。
