/*
 * DeepTutor 仿真 demo · 共用运行时（window.DT）
 *
 * 每个 demo 只写三样：文案 T、初始状态 initial、时间线 steps，外加一个
 * render(s) 把状态画成界面；循环播放、暂停、重播都在这里。
 *
 * 界面零件照 HKUDS/DeepTutor a31d826 的前端手抄：
 *   Sidebar      web/components/sidebar/SidebarShell.tsx、SidebarNav.tsx、nav-entries.ts
 *   StatusDot    web/components/activity/StatusDot.tsx
 *   ActivityRow  web/components/activity/ActivityRow.tsx
 *   ActivityHeader web/components/activity/ActivityHeader.tsx
 *   Fold         web/components/activity/ActivityFold.tsx
 *   ThinkingCard web/components/common/ModelThinkingCard.tsx
 *   Button       web/shared/ui/Button.tsx
 *   StatusChip   web/shared/ui/StatusChip.tsx
 * 换掉的：思考球（上游是 vendor 的 thinking-orbs 画布）换成 7 个点的 CSS；
 * 品牌图换成衬线字标；lucide-react 换成下面 ICONS 里的 SVG 内层，
 * 图标逐字取自 lucide（ISC），经本站 zensical 自带的 templates/.icons/lucide。
 *
 * 时间线一步是一个对象，按顺序执行；at 是这一步之前要等的毫秒：
 *   { at: 400 }                                    只等
 *   { set: { phase: "typing" } }                   浅合并进状态
 *   { set: s => ({ n: s.n + 1 }) }                 用函数算
 *   { type:   { key, text, cps } }                 打字机，一字一字进 state[key]
 *   { stream: { key, text, chunk: [1, 4], ms: [16, 48] } }  模型吐字，几字一块
 *   { scroll: { sel, to, block, behavior } }       把 sel 这个滚动容器滚到 to
 *   { advance: { key, by, max } }                  数字往前走
 *   { call: ctx => promise }                       其余的事
 *   { label: "名字" }                              检查点，什么也不做
 * options：loop（默认 true）、loopDelay（默认 2500ms）、replayAt（"top-right" 把重播键挪到右上角）。
 * 缺图标时在 demo 脚本开头补：DT.ICONS["名字"] = '<path d="…"/>'，内层照抄 lucide 的 svg。
 * 一圈跑完停 loopDelay，状态重置成 initial 再来；iframe 滚出视口、标签页
 * 切走时暂停；系统开了「减少动效」时文字一次到位、等待压到 150ms。
 */
(function () {
  "use strict";

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const html = window.htm.bind(React.createElement);
  const { useState, useEffect, useRef, useCallback, useMemo } = React;

  const ICONS = {
  "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>",
  "heart-handshake": "<path d=\"M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762\"/>",
  "graduation-cap": "<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6\"/><path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\"/>",
  "layout-grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>",
  "list-todo": "<path d=\"M13 5h8M13 12h8M13 19h8M3 17l2 2 4-4\"/><rect width=\"6\" height=\"6\" x=\"3\" y=\"4\" rx=\"1\"/>",
  "pen-line": "<path d=\"M13 21h8M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/>",
  "bot": "<path d=\"M12 8V4H8\"/><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"/><path d=\"M2 14h2M20 14h2M15 13v2M9 13v2\"/>",
  "settings": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "menu": "<path d=\"M4 5h16M4 12h16M4 19h16\"/>",
  "panel-left": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/>",
  "brain-circuit": "<path d=\"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z\"/><path d=\"M9 13a4.5 4.5 0 0 0 3-4M6.003 5.125A3 3 0 0 0 6.401 6.5M3.477 10.896a4 4 0 0 1 .585-.396M6 18a4 4 0 0 1-1.967-.516M12 13h4M12 18h6a2 2 0 0 1 2 2v1M12 8h8M16 8V5a2 2 0 0 1 2-2\"/><circle cx=\"16\" cy=\"13\" r=\".5\"/><circle cx=\"18\" cy=\"3\" r=\".5\"/><circle cx=\"20\" cy=\"21\" r=\".5\"/><circle cx=\"20\" cy=\"8\" r=\".5\"/>",
  "brain": "<path d=\"M12 18V5M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5\"/><path d=\"M17.997 5.125a4 4 0 0 1 2.526 5.77\"/><path d=\"M18 18a4 4 0 0 0 2-7.464\"/><path d=\"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517\"/><path d=\"M6 18a4 4 0 0 1-2-7.464\"/><path d=\"M6.003 5.125a4 4 0 0 0-2.526 5.77\"/>",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\"/>",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>",
  "chevron-left": "<path d=\"m15 18-6-6 6-6\"/>",
  "chevron-up": "<path d=\"m18 15-6-6-6 6\"/>",
  "loader-2": "<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/>",
  "database": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M3 5v14a9 3 0 0 0 18 0V5\"/><path d=\"M3 12a9 3 0 0 0 18 0\"/>",
  "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>",
  "sparkle": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/>",
  "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z\"/>",
  "check": "<path d=\"M20 6 9 17l-5-5\"/>",
  "check-circle-2": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>",
  "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>",
  "alert-triangle": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01\"/>",
  "circle-dashed": "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0M13.9 21.818a10 10 0 0 1-3.8 0M17.609 3.721a10 10 0 0 1 2.69 2.7M2.182 13.9a10 10 0 0 1 0-3.8M20.279 17.609a10 10 0 0 1-2.7 2.69M21.818 10.1a10 10 0 0 1 0 3.8M3.721 6.391a10 10 0 0 1 2.7-2.69M6.391 20.279a10 10 0 0 1-2.69-2.7\"/>",
  "circle-dot": "<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/>",
  "circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"/>",
  "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01\"/>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/>",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
  "paperclip": "<path d=\"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551\"/>",
  "arrow-left": "<path d=\"m12 19-7-7 7-7M19 12H5\"/>",
  "arrow-right": "<path d=\"M5 12h14M12 5l7 7-7 7\"/>",
  "arrow-up": "<path d=\"m5 12 7-7 7 7M12 19V5\"/>",
  "arrow-up-right": "<path d=\"M7 7h10v10M7 17 17 7\"/>",
  "arrow-down": "<path d=\"M12 5v14M19 12l-7 7-7-7\"/>",
  "book-open": "<path d=\"M12 5v16M20.001 19A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2z\"/>",
  "book": "<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\"/>",
  "file-text": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8\"/>",
  "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>",
  "refresh-ccw": "<path d=\"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16\"/><path d=\"M16 16h5v5\"/>",
  "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/>",
  "wifi": "<path d=\"M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0\"/>",
  "wifi-off": "<path d=\"M12 20h.01M8.5 16.429a5 5 0 0 1 7 0M5 12.859a10 10 0 0 1 5.17-2.69M19 12.859a10 10 0 0 0-2.007-1.523M2 8.82a15 15 0 0 1 4.177-2.643M22 8.82a15 15 0 0 0-11.288-3.764M2 2l20 20\"/>",
  "qr-code": "<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/><path d=\"M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1\"/>",
  "bookmark": "<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\"/>",
  "message-square": "<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/>",
  "message-square-plus": "<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2zM12 8v6M9 11h6\"/>",
  "message-circle": "<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>",
  "image-plus": "<path d=\"M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/>",
  "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "eye-off": "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.8 10.8 0 0 1-1.444 2.49M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143M2 2l20 20\"/>",
  "x": "<path d=\"M18 6 6 18M6 6l12 12\"/>",
  "square": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>",
  "mic": "<path d=\"M12 19v3M19 10v2a7 7 0 0 1-14 0v-2\"/><rect width=\"6\" height=\"13\" x=\"9\" y=\"2\" rx=\"3\"/>",
  "send": "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zM21.854 2.147l-10.94 10.939\"/>",
  "plus": "<path d=\"M5 12h14M12 5v14\"/>",
  "search": "<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>",
  "trash-2": "<path d=\"M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>",
  "download": "<path d=\"M12 15V3M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/>",
  "upload": "<path d=\"M12 3v12M17 8l-5-5-5 5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/>",
  "layers": "<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\"/><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\"/><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\"/>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20\"/>",
  "folder": "<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>",
  "folder-open": "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"/>",
  "folder-sync": "<path d=\"M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5\"/><path d=\"M12 10v4h4\"/><path d=\"m12 14 1.535-1.605a5 5 0 0 1 8 1.5M22 22v-4h-4\"/><path d=\"m22 18-1.535 1.605a5 5 0 0 1-8-1.5\"/>",
  "play": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>",
  "pause": "<rect width=\"5\" height=\"18\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"5\" height=\"18\" x=\"5\" y=\"3\" rx=\"1\"/>",
  "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4\"/>",
  "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
  "zap": "<path d=\"M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z\"/>",
  "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4\"/>",
  "maximize-2": "<path d=\"M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6\"/>",
  "minimize-2": "<path d=\"m14 10 7-7M20 10h-6V4M3 21l7-7M4 14h6v6\"/>",
  "code": "<path d=\"m16 18 6-6-6-6M8 6l-6 6 6 6\"/>",
  "copy": "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>",
  "external-link": "<path d=\"M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>",
  "history": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5M12 7v5l4 2\"/>",
  "notebook-pen": "<path d=\"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4M2 6h4M2 10h4M2 14h4M2 18h4\"/><path d=\"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\"/>",
  "library": "<path d=\"m16 6 4 14M12 6v14M8 8v12M4 4v16\"/>",
  "list-checks": "<path d=\"M13 5h8M13 12h8M13 19h8M3 17l2 2 4-4M3 7l2 2 4-4\"/>",
  "shield-check": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>",
  "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>",
  "git-branch": "<path d=\"M15 6a9 9 0 0 0-9 9V3\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/>",
  "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>",
  "activity": "<path d=\"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2\"/>",
  "calendar": "<path d=\"M8 2v3M16 2v3\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M3 9h18\"/>",
  "flame": "<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>",
  "trophy": "<path d=\"M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3M4 22h16\"/><path d=\"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z\"/><path d=\"M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3\"/>",
  "zoom-in": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.35-4.35M11 8v6M8 11h6\"/>",
  "zoom-out": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.35-4.35M8 11h6\"/>",
  "scan": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2\"/>",
  "undo-2": "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11\"/>",
  "redo-2": "<path d=\"m15 14 5-5-5-5\"/><path d=\"M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13\"/>",
  "bold": "<path d=\"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8\"/>",
  "heading-2": "<path d=\"M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1\"/>",
  "table": "<path d=\"M12 3v18\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M3 9h18M3 15h18\"/>",
  "wand-sparkles": "<path d=\"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72M14 7l3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9\"/>",
  "file-down": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5M12 18v-6M9 15l3 3 3-3\"/>",
  "audio-lines": "<path d=\"M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3\"/>",
  "headphones": "<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\"/>",
  "video": "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"/><rect width=\"14\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"/>",
  "captions": "<rect width=\"18\" height=\"14\" x=\"3\" y=\"5\" rx=\"2\" ry=\"2\"/><path d=\"M7 15h4m4 0h2M7 11h2m4 0h4\"/>",
  "hash": "<path d=\"M4 9h16M4 15h16M10 3 8 21M16 3l-2 18\"/>",
  "cpu": "<path d=\"M12 20v2M12 2v2M17 20v2M17 2v2M2 12h2M2 17h2M2 7h2M20 12h2M20 17h2M20 7h2M7 20v2M7 2v2\"/><rect width=\"16\" height=\"16\" x=\"4\" y=\"4\" rx=\"2\"/><rect width=\"8\" height=\"8\" x=\"8\" y=\"8\" rx=\"1\"/>",
  "server": "<rect width=\"20\" height=\"8\" x=\"2\" y=\"2\" rx=\"2\" ry=\"2\"/><rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" ry=\"2\"/><path d=\"M6 6h.01M6 18h.01\"/>",
  "key": "<path d=\"m2 21 9.6-9.6M7.5 15.5l2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19\"/><circle cx=\"15.5\" cy=\"7.5\" r=\"5.5\"/>",
  "plug": "<path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\"/>",
  "ellipsis": "<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/>",
  "grip-vertical": "<circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>",
  "archive": "<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\"/><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4\"/>",
  "inbox": "<path d=\"M22 12h-6l-2 3h-4l-2-3H2\"/><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11\"/>",
  "mail": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/><rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/>",
  "sliders-horizontal": "<path d=\"M10 5H3M12 19H3M14 3v4M16 17v4M21 12h-9M21 19h-5M21 5h-7M8 10v4M8 12H3\"/>",
  "palette": "<path d=\"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z\"/><circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>",
  "monitor": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><path d=\"M8 21h8M12 17v4\"/>",
  "languages": "<path d=\"m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6\"/>",
  "chart-line": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"m19 9-5 5-4-4-3 3\"/>",
  "chart-column": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3\"/>",
  "network": "<rect width=\"6\" height=\"6\" x=\"16\" y=\"16\" rx=\"1\"/><rect width=\"6\" height=\"6\" x=\"2\" y=\"16\" rx=\"1\"/><rect width=\"6\" height=\"6\" x=\"9\" y=\"2\" rx=\"1\"/><path d=\"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8\"/>",
  "highlighter": "<path d=\"m9 11-6 6v3h9l3-3\"/><path d=\"m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4\"/>",
  "underline": "<path d=\"M6 4v6a6 6 0 0 0 12 0V4M4 20h16\"/>",
  "sticky-note": "<path d=\"M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z\"/><path d=\"M15 3v5a1 1 0 0 0 1 1h5\"/>",
  "list": "<path d=\"M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13\"/>",
  "scroll-text": "<path d=\"M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4\"/><path d=\"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3\"/>",
  "gauge": "<path d=\"m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0\"/>",
  "timer": "<path d=\"M10 2h4M12 14l3-3\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/>",
  "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"/><path d=\"M12 18h.01\"/>",
  "send-horizontal": "<path d=\"M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904zM6 12h16\"/>",
  "at-sign": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"/>",
  "square-pen": "<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/><path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\"/>",
  "file-up": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5M12 12v6M15 15l-3-3-3 3\"/>",
  "rows-3": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M21 9H3M21 15H3\"/>",
  "columns-2": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M12 3v18\"/>",
  "circle-play": "<path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/>",
  "skip-forward": "<path d=\"M21 4v16M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z\"/>",
  "volume-2": "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6M19.364 18.364a9 9 0 0 0 0-12.728\"/>",
  "list-ordered": "<path d=\"M11 5h10M11 12h10M11 19h10M4 4h1v5M4 9h2M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02\"/>",
  "quote": "<path d=\"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2zM5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"/>",
  "file-question": "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM12 17h.01\"/><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\"/>",
  "atom": "<circle cx=\"12\" cy=\"12\" r=\"1\"/><path d=\"M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5\"/><path d=\"M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5\"/>",
  };

  /* lucide 的 SVG 外壳：viewBox 0 0 24 24，描边 currentColor */
  function Icon({ name, size = 16, strokeWidth = 2, class: klass, style }) {
    const inner = ICONS[name];
    if (inner === undefined) throw new Error("DT.Icon: 没有这个图标 " + name);
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width=${size}
      height=${size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width=${strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class=${klass}
      style=${style}
      dangerouslySetInnerHTML=${{ __html: inner }}
    />`;
  }

  /* ─── 小工具 ─── */
  const segmenter =
    typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh", { granularity: "grapheme" }) : null;
  function graphemes(text) {
    if (segmenter) return Array.from(segmenter.segment(text), (x) => x.segment);
    return Array.from(text);
  }
  function rand(range, seed) {
    if (!Array.isArray(range)) return range;
    const [a, b] = range;
    // 确定性抖动：同一圈每次都一样，重播看到的节奏不变
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    const f = x - Math.floor(x);
    return Math.round(a + f * (b - a));
  }
  function cx() {
    const out = [];
    for (const a of arguments) {
      if (!a) continue;
      if (typeof a === "string") out.push(a);
      else if (typeof a === "object") for (const k in a) if (a[k]) out.push(k);
    }
    return out.join(" ");
  }
  const fmt = {
    num: (n) => Number(n).toLocaleString("en-US"),
    pct: (x, d = 1) => (x * 100).toFixed(d) + "%",
    secs: (s) => (s < 60 ? s.toFixed(1) + "s" : Math.floor(s / 60) + "m " + Math.round(s % 60) + "s"),
    compact: (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n)),
    clock: (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    },
  };

  const reduceMotion = () =>
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── 时间线 ─── */
  const CANCEL = { cancelled: true };
  const STEP_KEYS = ["at", "set", "type", "stream", "scroll", "advance", "call", "label"];

  function applyInstant(state, step) {
    // 检查脚本和「减少动效」都用它：把一步直接算到终点
    let next = state;
    if (step.set) next = Object.assign({}, next, typeof step.set === "function" ? step.set(next) : step.set);
    if (step.type) next = Object.assign({}, next, { [step.type.key]: (step.type.append ? next[step.type.key] || "" : "") + step.type.text });
    if (step.stream) next = Object.assign({}, next, { [step.stream.key]: (step.stream.append ? next[step.stream.key] || "" : "") + step.stream.text });
    if (step.advance) {
      const { key, by = 1, max = Infinity } = step.advance;
      next = Object.assign({}, next, { [key]: Math.min(max, (next[key] || 0) + by) });
    }
    return next;
  }

  function useTimeline(steps, options) {
    const opts = Object.assign(
      { loop: true, loopDelay: 2500, pauseWhenHidden: true, pauseWhenOffscreen: true },
      options || {}
    );
    const initial = opts.initial || {};
    const [state, setState] = useState(() => Object.assign({}, initial));
    const stateRef = useRef(state);
    const genRef = useRef(0);
    const playingRef = useRef(false);
    const visibleRef = useRef(true);
    const onscreenRef = useRef(!opts.pauseWhenOffscreen || typeof IntersectionObserver === "undefined");
    const userPausedRef = useRef(false);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [round, setRound] = useState(0);

    const commit = useCallback((patch) => {
      const prev = stateRef.current;
      const next = Object.assign({}, prev, typeof patch === "function" ? patch(prev) : patch);
      stateRef.current = next;
      setState(next);
    }, []);

    const syncPlaying = useCallback(() => {
      const p = visibleRef.current && onscreenRef.current && !userPausedRef.current;
      playingRef.current = p;
      setPlaying(p);
    }, []);

    // 只在播放时走表：滚出视口、切走标签页，时间就停
    const sleep = useCallback((ms, g) => {
      return new Promise((resolve, reject) => {
        let left = ms;
        const tickMs = 40;
        function tick() {
          if (g !== genRef.current) return reject(CANCEL);
          if (left <= 0) return resolve();
          setTimeout(() => {
            if (playingRef.current) left -= tickMs;
            tick();
          }, Math.min(tickMs, Math.max(left, 1)));
        }
        tick();
      });
    }, []);

    const scrollTo = useCallback((spec, g) => {
      const box = document.querySelector(spec.sel);
      if (!box) return Promise.resolve();
      const target = spec.to ? box.querySelector(spec.to) || document.querySelector(spec.to) : null;
      let top;
      if (typeof spec.top === "number") top = spec.top;
      else if (spec.bottom) top = box.scrollHeight - box.clientHeight;
      else if (target) {
        const b = box.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        const rel = t.top - b.top + box.scrollTop;
        top =
          spec.block === "center"
            ? rel - (box.clientHeight - t.height) / 2
            : spec.block === "end"
              ? rel - box.clientHeight + t.height
              : rel - (spec.offset || 0);
      } else return Promise.resolve();
      top = Math.max(0, Math.min(top, box.scrollHeight - box.clientHeight));
      if (spec.behavior === "instant" || reduceMotion()) {
        box.scrollTop = top;
        return Promise.resolve();
      }
      const from = box.scrollTop;
      const dur = spec.ms || 420;
      const t0 = performance.now();
      return new Promise((resolve) => {
        function frame(now) {
          if (g !== genRef.current) return resolve();
          const k = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          box.scrollTop = from + (top - from) * e;
          if (k < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
    }, []);

    const exec = useCallback(
      async (step, g, i) => {
        const reduced = reduceMotion();
        if (step.set) commit(step.set);
        if (step.advance) {
          const { key, by = 1, max = Infinity } = step.advance;
          commit((s) => ({ [key]: Math.min(max, (s[key] || 0) + by) }));
        }
        if (step.type || step.stream) {
          const spec = step.type || step.stream;
          const base = spec.append ? stateRef.current[spec.key] || "" : "";
          if (reduced) {
            commit({ [spec.key]: base + spec.text });
          } else {
            const gs = graphemes(spec.text);
            let acc = base;
            let n = 0;
            commit({ [spec.key]: acc });
            while (n < gs.length) {
              const take = step.type ? 1 : rand(spec.chunk || [1, 4], i * 97 + n);
              acc += gs.slice(n, n + take).join("");
              n += take;
              commit({ [spec.key]: acc });
              const wait = step.type
                ? Math.round(1000 / (spec.cps || 18)) + rand([-12, 18], i * 31 + n)
                : rand(spec.ms || [16, 48], i * 53 + n);
              await sleep(Math.max(8, wait), g);
            }
          }
        }
        if (step.scroll) await scrollTo(step.scroll, g);
        if (step.call) {
          const ctx = {
            get state() {
              return stateRef.current;
            },
            set: commit,
            sleep: (ms) => sleep(ms, g),
            el: (sel) => document.querySelector(sel),
            reduced,
          };
          await step.call(ctx);
        }
      },
      [commit, sleep, scrollTo]
    );

    const runRef = useRef(null);
    runRef.current = async function run(g) {
      try {
        for (let i = 0; i < steps.length; i++) {
          if (g !== genRef.current) return;
          const step = steps[i];
          if (step.at) await sleep(reduceMotion() ? Math.min(step.at, 150) : step.at, g);
          await exec(step, g, i);
          setIndex(i + 1);
        }
        if (!opts.loop) return;
        await sleep(reduceMotion() ? opts.loopDelay * 2 : opts.loopDelay, g);
        restart();
      } catch (e) {
        if (e !== CANCEL) throw e;
      }
    };

    function restart() {
      genRef.current += 1;
      const g = genRef.current;
      const fresh = Object.assign({}, initial);
      stateRef.current = fresh;
      setState(fresh);
      setIndex(0);
      setRound((r) => r + 1);
      // 等一帧让初始界面先画出来，滚动容器回到顶部
      setTimeout(() => {
        document.querySelectorAll("[data-dt-scroll]").forEach((el) => (el.scrollTop = 0));
        runRef.current(g);
      }, 30);
    }

    useEffect(() => {
      const onVis = () => {
        visibleRef.current = !opts.pauseWhenHidden || document.visibilityState !== "hidden";
        syncPlaying();
      };
      document.addEventListener("visibilitychange", onVis);
      let io = null;
      if (opts.pauseWhenOffscreen && typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            onscreenRef.current = entries.some((e) => e.isIntersecting);
            syncPlaying();
          },
          { threshold: 0.15 }
        );
        io.observe(document.getElementById("root") || document.body);
      }
      onVis();
      restart();
      return () => {
        genRef.current += 1;
        document.removeEventListener("visibilitychange", onVis);
        if (io) io.disconnect();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const labels = useMemo(() => steps.map((s, i) => (s.label ? [s.label, i] : null)).filter(Boolean), [steps]);
    const tl = {
      playing,
      index,
      round,
      total: steps.length,
      labels,
      replay: restart,
      pause() {
        userPausedRef.current = true;
        syncPlaying();
      },
      play() {
        userPausedRef.current = false;
        syncPlaying();
      },
    };
    return [state, tl];
  }

  /* ─── 重播键 ─── */
  function Replay({ tl, at }) {
    if (/[?&]noreplay\b/.test(location.search)) return null;
    const done = tl.index >= tl.total;
    return html`<button type="button" class=${cx("dt-replay", { "is-top": at === "top-right" })} aria-label="重播演示" onClick=${() => tl.replay()}>
      <span class=${cx("dt-replay__dot", { "is-live": tl.playing && !done, "is-paused": !tl.playing })}></span>
      <${Icon} name="rotate-ccw" size=${12} strokeWidth=${1.8} />
      <span>重播</span>
    </button>`;
  }

  /* ─── 侧栏（SidebarShell.tsx + SidebarNav.tsx） ─── */
  const NAV = [
    { href: "/partners", label: "伙伴", icon: "heart-handshake" },
    { href: "/learning", label: "个性化学习", icon: "graduation-cap" },
    { href: "/space", label: "学习空间", icon: "layout-grid" },
    { href: "/kanban", label: "任务看板", icon: "list-todo" },
    { href: "/co-writer", label: "智能写作", icon: "pen-line", collapsed: true },
    { href: "/agents", label: "子智能体", icon: "bot", collapsed: true },
  ];

  function NavRow({ entry, active }) {
    return html`<div class=${cx("dt-nav-item", { "is-active": active })}>
      <${Icon} name=${entry.icon} size=${15} strokeWidth=${active ? 1.9 : 1.6} />
      <span>${entry.label}</span>
    </div>`;
  }

  function Sidebar({ active = "/chat", recents = [], activeRecent = -1 }) {
    const shown = NAV.filter((e) => !e.collapsed);
    const hidden = NAV.filter((e) => e.collapsed);
    const moreOpen = hidden.some((e) => e.href === active);
    return html`<aside class="dt-sidebar">
      <div class="dt-sidebar__brand">
        <span class="dt-wordmark"><span class="dt-wordmark__logo">D</span>DeepTutor</span>
        <span class="muted"><${Icon} name="panel-left" size=${16} strokeWidth=${1.7} /></span>
      </div>
      <div class="dt-nav" style=${{ paddingBottom: 4 }}>
        <${NavRow} entry=${{ label: "主页", icon: "house" }} active=${active === "/chat"} />
      </div>
      <div class="grow min0" style=${{ overflowY: "auto", paddingBottom: 8 }}>
        <nav class="dt-nav">
          ${shown.map((e) => html`<${NavRow} key=${e.href} entry=${e} active=${active === e.href} />`)}
          <div class="dt-nav-more">
            <span class="dt-nav-more__chev"><${Icon} name="chevron-down" size=${12} strokeWidth=${1.8} style=${{ transform: moreOpen ? "none" : "rotate(-90deg)" }} /></span>
            <span class="grow">更多</span>
            <span class="tabular dt-nav-more__count">${hidden.length}</span>
          </div>
          ${moreOpen ? hidden.map((e) => html`<${NavRow} key=${e.href} entry=${e} active=${active === e.href} />`) : null}
        </nav>
        ${recents.length
          ? html`<section class="dt-sidebar__section">
              <div class="dt-sidebar__label">近期</div>
              ${recents.map((r, i) => html`<div key=${i} class=${cx("dt-recent", { "is-active": i === activeRecent })}>${r}</div>`)}
            </section>`
          : null}
      </div>
      <div class="dt-sidebar__foot">
        <div class=${cx("dt-nav-item", { "is-active": active === "/settings" })} style=${{ flex: 1, paddingRight: 10 }}>
          <${Icon} name="settings" size=${15} strokeWidth=${active === "/settings" ? 1.9 : 1.6} />
          <span>设置</span>
        </div>
        <span class="dt-version" title="v1.6.15"><i></i></span>
      </div>
    </aside>`;
  }

  /* 窄的时候换成折叠态的 60px 图标轨（SidebarShell.tsx 187-250：w-[60px] items-center py-3，
     图标按钮 h-9 w-9 rounded-xl，当前项 bg-accent shadow-sm，图标 18px）。iframe 窄于 860px 时由 CSS 切换 */
  function Rail({ active = "/chat" }) {
    const items = [{ href: "/chat", label: "主页", icon: "house" }].concat(NAV.filter((e) => !e.collapsed || e.href === active));
    return html`<aside class="dt-rail">
      <div class="dt-rail__brand"><span class="dt-wordmark__logo">D</span></div>
      <nav class="dt-rail__nav">
        ${items.map(
          (e) => html`<div key=${e.href} class=${cx("dt-rail__item", { "is-active": active === e.href })} title=${e.label}>
            <${Icon} name=${e.icon} size=${18} strokeWidth=${active === e.href ? 2 : 1.6} />
          </div>`
        )}
        <div class="dt-rail__item" title="更多"><${Icon} name="ellipsis" size=${18} strokeWidth=${1.6} /></div>
      </nav>
      <div class="dt-rail__foot">
        <div class="dt-rail__sep"></div>
        <div class=${cx("dt-rail__item", { "is-active": active === "/settings" })} title="设置">
          <${Icon} name="settings" size=${18} strokeWidth=${active === "/settings" ? 2 : 1.6} />
        </div>
      </div>
    </aside>`;
  }

  function Shell({ active, recents, activeRecent, children }) {
    return html`<div class="dt-shell">
      <${Sidebar} active=${active} recents=${recents} activeRecent=${activeRecent} />
      <${Rail} active=${active} />
      <main class="dt-main">${children}</main>
    </div>`;
  }

  /* ─── 活动行（components/activity/*） ─── */
  function StatusDot({ state }) {
    return html`<span class="dt-status-dot" data-state=${state}><i></i></span>`;
  }

  function Orb({ mode = "working", tone }) {
    const n = 7;
    const dots = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      dots.push(
        html`<i key=${k} style=${{
          transform: "translate(" + (Math.cos(a) * 6).toFixed(2) + "px," + (Math.sin(a) * 6).toFixed(2) + "px)",
          animationDelay: (k * 0.2).toFixed(1) + "s",
        }}></i>`
      );
    }
    return html`<span
      class=${cx("dt-orb", { "is-slow": mode === "breathing", "is-still": mode === "still" })}
      style=${tone === "live" ? { color: "var(--tw-blue-600)" } : null}
      aria-hidden="true"
      ><i></i><span>${dots}</span></span
    >`;
  }

  function ActivityHeader({ label, duration, summary, settled = false, orb = "working", expandable = false, expanded = false }) {
    return html`<div class=${cx("dt-act-header", { "is-settled": settled })} role="status">
      <${Orb} mode=${settled ? "still" : orb} />
      <span class=${settled ? "" : "dt-breathing-text"}>${label}</span>
      ${duration ? html`<span class="dt-act-header__meta">· ${duration}</span>` : null}
      ${summary ? html`<span class="dt-act-header__meta">· ${summary}</span>` : null}
      ${expandable
        ? html`<${Icon}
            name="chevron-right"
            size=${12}
            class="dt-act-header__caret"
            style=${{ transform: expanded ? "rotate(90deg)" : "none", opacity: 0.45, transition: "transform 220ms var(--fold-ease)" }}
          />`
        : null}
    </div>`;
  }

  function ActivityRow({ state, title, detail, mono = false, breathing = false, open = false, children }) {
    return html`<div class="dt-act-row-wrap">
      <div class="dt-act-row">
        <${StatusDot} state=${state} />
        <div class="min0 grow">
          ${detail
            ? html`<div class="row" style=${{ alignItems: "baseline", gap: 8 }}>
                <span class=${cx("dt-act-row__title", { "dt-breathing-text": breathing })}>${title}</span>
                <span class=${cx("dt-act-row__detail", { "is-mono": mono })}>${detail}</span>
              </div>`
            : html`<span class=${cx("dt-act-row__title", { "dt-breathing-text": breathing })} style=${{ display: "block" }}>${title}</span>`}
        </div>
      </div>
      ${open && children ? html`<div class="dt-act-detail">${children}</div>` : null}
    </div>`;
  }

  function Fold({ open, children, class: klass }) {
    return html`<div class=${cx("dt-fold", { "is-open": open }, klass)}><div>${children}</div></div>`;
  }

  function ThinkingCard({ content, open, closed }) {
    return html`<div class=${cx("dt-think", { "is-open": open })}>
      <div class="dt-think__summary">
        <${Icon} name="chevron-down" size=${12} strokeWidth=${1.8} class="dt-think__chev" />
        <${Icon} name="brain-circuit" size=${12} strokeWidth=${1.6} style=${{ opacity: 0.8 }} />
        <span>模型思考</span>
        ${closed ? null : html`<${Icon} name="loader-2" size=${11} strokeWidth=${1.8} class="animate-spin" style=${{ marginLeft: 4, opacity: 0.7 }} />`}
      </div>
      <${Fold} open=${open}>
        <div class="dt-think__body">${content ? content : html`<span style=${{ fontStyle: "italic", fontSize: 11, opacity: 0.7 }}>思考中…</span>`}</div>
      <//>
    </div>`;
  }

  function Button({ variant = "primary", size = "md", icon, loading, pressed, disabled, children, class: klass, style }) {
    return html`<button
      type="button"
      class=${cx("dt-btn", "dt-btn--" + variant, "dt-btn--" + size, { "is-pressed": pressed }, klass)}
      disabled=${disabled}
      style=${style}
    >
      ${loading ? html`<${Icon} name="loader-2" size=${16} class="animate-spin" />` : icon ? html`<${Icon} name=${icon} size=${size === "sm" ? 14 : 16} />` : null}
      ${children}
    </button>`;
  }

  function StatusChip({ tone = "neutral", icon, children, class: klass, style }) {
    return html`<span class=${cx("dt-chip", "dt-chip--" + tone, klass)} style=${style}>
      ${icon ? html`<${Icon} name=${icon} size=${12} />` : null}${children}
    </span>`;
  }

  function Skeleton({ w = "100%", h = 12, style }) {
    return html`<div class="dt-skel" style=${Object.assign({ width: w, height: h }, style)}></div>`;
  }

  function EmptyState({ icon = "inbox", title, children }) {
    return html`<div class="dt-empty">
      <div class="dt-empty__icon"><${Icon} name=${icon} size=${20} /></div>
      <h3 style=${{ fontSize: 14, fontWeight: 600 }}>${title}</h3>
      ${children ? html`<p class="muted" style=${{ fontSize: 14, lineHeight: "20px", maxWidth: 384 }}>${children}</p>` : null}
    </div>`;
  }

  /* ProgressRing.tsx：弧线用前景色、70% 不透明，只有满了才换 --primary；轨道是 45% 的边框色；
     中间是百分数，% 号小一号 */
  function ProgressRing({ value = 0, size = 32, stroke = 1.75, showLabel = true }) {
    const safe = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
    const radius = (size - stroke) / 2;
    const c = 2 * Math.PI * radius;
    const complete = safe >= 1;
    return html`<span class="dt-ring" style=${{ width: size, height: size }}>
      <svg width=${size} height=${size} aria-hidden="true" style=${{ transform: "rotate(-90deg)" }}>
        <circle cx=${size / 2} cy=${size / 2} r=${radius} fill="none" stroke="var(--border)" stroke-width=${stroke} opacity="0.45" />
        ${safe > 0
          ? html`<circle
              cx=${size / 2}
              cy=${size / 2}
              r=${radius}
              fill="none"
              stroke=${complete ? "var(--primary)" : "var(--foreground)"}
              stroke-width=${stroke}
              stroke-linecap="round"
              stroke-dasharray=${c.toFixed(3)}
              stroke-dashoffset=${(c * (1 - safe)).toFixed(3)}
              opacity=${complete ? 1 : 0.7}
              style=${{ transition: "stroke-dashoffset 500ms" }}
            />`
          : null}
      </svg>
      ${showLabel
        ? html`<span class="dt-ring__label"><span class="dt-ring__num">${Math.round(safe * 100)}</span><span class="dt-ring__pct">%</span></span>`
        : null}
    </span>`;
  }

  /* ─── Prose：给流式吐字用的极小 markdown ───
     认：空行分段、## 标题、- 列表、**粗**、*斜*、`码`、$式$（只排下标）、[文字](#锚点)。
     吐到一半的标记原样显示，等下一块补齐再变样式，和上游 react-markdown 流式时的观感一致 */
  const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$|\[[^\]]+\]\([^)]+\)|\*[^*\s][^*]*\*)/g;
  /* 公式只认下标：H_0、x_{n+1} 排成下标，其余原样 */
  function math(src) {
    return src.split(/(_\{[^}]+\}|_\w)/).map((t, i) =>
      t.startsWith("_") ? html`<sub key=${i}>${t.replace(/^_\{?|\}$/g, "")}</sub>` : t
    );
  }
  function inline(text, keyBase) {
    const parts = String(text).split(INLINE);
    return parts.map((p, i) => {
      const k = keyBase + "-" + i;
      if (!p) return null;
      if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return html`<strong key=${k}>${p.slice(2, -2)}</strong>`;
      if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return html`<code key=${k}>${p.slice(1, -1)}</code>`;
      if (p.startsWith("$") && p.endsWith("$") && p.length > 2) return html`<span key=${k} class="dt-math">${math(p.slice(1, -1))}</span>`;
      if (p.startsWith("[") && p.endsWith(")")) {
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return html`<a key=${k} href=${m[2]} onClick=${(e) => e.preventDefault()}>${m[1]}</a>`;
      }
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return html`<em key=${k}>${p.slice(1, -1)}</em>`;
      return p;
    });
  }
  function Prose({ text = "", class: klass, caret = false }) {
    const blocks = String(text).split(/\n{2,}/);
    const out = blocks.map((b, bi) => {
      const lines = b.split("\n");
      if (lines.every((l) => /^\s*[-*] /.test(l) || !l.trim())) {
        return html`<ul key=${bi}>${lines.filter((l) => l.trim()).map((l, li) => html`<li key=${li}>${inline(l.replace(/^\s*[-*] /, ""), bi + "-" + li)}</li>`)}</ul>`;
      }
      if (/^### /.test(b)) return html`<h3 key=${bi}>${inline(b.slice(4), bi)}</h3>`;
      if (/^## /.test(b)) return html`<h2 key=${bi}>${inline(b.slice(3), bi)}</h2>`;
      return html`<p key=${bi}>${lines.map((l, li) => (li ? [html`<br key=${"br" + li} />`, inline(l, bi + "-" + li)] : inline(l, bi + "-" + li)))}</p>`;
    });
    return html`<div class=${cx("prose", klass, { "dt-caret-last": caret })}>${out}</div>`;
  }

  /* ─── 计时：「推理 · 2.4s」这类读数 ─── */
  function useElapsed(running, startKey) {
    const [ms, setMs] = useState(0);
    useEffect(() => {
      setMs(0);
    }, [startKey]);
    useEffect(() => {
      if (!running) return;
      const t0 = performance.now() - ms;
      const id = setInterval(() => setMs(performance.now() - t0), 100);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, startKey]);
    return ms / 1000;
  }

  /* ─── 挂载 ─── */
  function run(spec) {
    const { T = {}, initial = {}, steps = [], options = {}, render } = spec;
    window.__DT_T = T;
    window.__DT_DEMO = { initial, steps, options, render };
    if (window.__DT_CHECK) return; // 检查脚本自己按步骤渲染，不挂到 DOM
    function App() {
      const [s, tl] = useTimeline(steps, Object.assign({ initial }, options));
      return html`<${React.Fragment}>${render(s, tl)}<${Replay} tl=${tl} at=${options.replayAt} /><//>`;
    }
    ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
  }

  window.DT = {
    React,
    ReactDOM,
    html,
    hooks: { useState, useEffect, useRef, useCallback, useMemo },
    ICONS,
    Icon,
    cx,
    fmt,
    graphemes,
    applyInstant,
    STEP_KEYS,
    useTimeline,
    useElapsed,
    run,
    Replay,
    Shell,
    Sidebar,
    Rail,
    Orb,
    StatusDot,
    ActivityHeader,
    ActivityRow,
    Fold,
    ThinkingCard,
    Button,
    StatusChip,
    Skeleton,
    EmptyState,
    ProgressRing,
    Prose,
    DATA: window.DT && window.DT.DATA,
  };
})();
