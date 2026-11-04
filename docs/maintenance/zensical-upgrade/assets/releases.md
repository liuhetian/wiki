<!-- 存档：GitHub Releases 原文，0.0.70、UI 0.0.37 及以前 2026-10-15 抓取，0.0.71–0.0.73、UI 0.0.38–0.0.40 2026-10-28 补抓，0.0.74、UI 0.0.41 2026-11-04 补抓。zensical：https://github.com/zensical/zensical/releases ；ui：https://github.com/zensical/ui/releases 。每个版本的正文原样放在代码块里，不渲染外链图片。 -->

# Zensical 0.0.63–0.0.74 与 UI 0.0.31–0.0.41 发布说明（存档）

## zensical v0.0.63（2026-09-19）

<https://github.com/zensical/zensical/releases/tag/v0.0.63>

````markdown
## Summary

This version ensures pages containing snippets rebuild when source files change during local preview and excludes hidden files and directories from the generated site. It also fixes preview-site root redirects and returns proper 404 responses while preserving custom error pages.

Additionally, the [user interface] is updated to [v0.0.31], fixing empty submenus for sections containing only an index page and improving task list checkbox sizing and alignment in the modern theme. It also updates dependencies and adds 60 new icons across Lucide, Octicons, and Simple Icons.

[user interface]: https://github.com/zensical/ui
[v0.0.31]: https://github.com/zensical/ui/releases/tag/v0.0.31

## Changelog

### Bug fixes

- a771962 __ui__ – update ui to v0.0.31
- dfe8f94 __zensical__ – rebuild pages containing snippets on source changes (#950)
- d6cd5d5 __zensical__, __zensical-serve__ – append trailing slash to preview site root (#944)
- 2070bf1 __zensical__, __compat__ – don't add dotfiles to final site (#945)
````

## zensical v0.0.64（2026-09-22）

<https://github.com/zensical/zensical/releases/tag/v0.0.64>

````markdown
## Summary

Many of you have been waiting for this one: Zensical now includes native blog support. As a direct port of the Material for MkDocs blog plugin, it preserves the familiar configuration, metadata, URLs, archives, categories, authors, pagination, and more. We're happy to finally put it into your hands, with more flexible blogging functionality planned for the future.

## Changelog

### Features

- 5825381 __zensical__, __compat__, __ui__ – add `blog` plugin replacement

### Bug fixes

- a85875e __ui__ – update ui to v0.0.32
````

## zensical v0.0.65（2026-09-24）

<https://github.com/zensical/zensical/releases/tag/v0.0.65>

````markdown
## Summary

This version expands MkDocs compatibility with a native replacement for the `rss` plugin and support for mkdocstrings backlinks. Zensical can now generate RSS 2.0 and JSON Feed 1.1 feeds for created and updated pages. Python API documentation can also show which pages reference a documented object, with backlinks kept current across cached builds.

## Changelog

### Features

- e7876ab __zensical__, __compat__ – support mike's `version_selector` setting
- 25b95e9 __zensical__, __compat__ – support mkdocstrings' `enable_inventory` setting
- 0223fc9 __compat__ – support more macros settings
- acee89a __zensical__, __compat__ – support autorefs settings
- 0291923 __zensical__, __compat__ – support mkdocstrings backlinks
- c214988 __zensical__, __compat__ – add `rss` plugin replacement (#443)

### Bug fixes

- cf68f6d __zensical__, __compat__ – resolve source links to published post URLs (#966)
````

## zensical v0.0.66（2026-09-28）

<https://github.com/zensical/zensical/releases/tag/v0.0.66>

````markdown
## Summary

This version adds compatibility with `mkdocs-autoapi` and `mkdocs-api-autonav`, making it easier to document Python projects. These plugins discover modules and packages, generate API reference pages, and organize them in your site's navigation. They build on `mkdocstrings`, which renders the reference content from your code and docstrings, so you can skip manually creating a page for each module.

It also fixes responsive image URLs in raw HTML, ensures sitemaps include all published pages, and adds support for custom InlineHilite formatters configured through TOML.

Additionally, the [user interface is updated to v0.0.33](https://github.com/zensical/ui/releases/tag/v0.0.33), adding styling for `mkdocstrings` backlinks in both themes, restoring GLightbox styles after instant navigation, respecting custom Mermaid node label colors, and fixing the `/` search shortcut.

## Changelog

### Features

- b2f4de7 __zensical__, __compat__ – support mkdocs-autoapi and mkdocs-api-autonav plugins

### Bug fixes

- 3d8c0e2 __ui__ – update ui to v0.0.33
- 7be3d1d __compat__ – resolve custom inline formatters in TOML configuration (#980)
- e3099ab __zensical__, __compat__ – include all published pages in sitemap (#977)
- e24d0fc __compat__ – resolve raw HTML srcset URLs relative to Markdown source (#975)
````

## zensical v0.0.67（2026-09-30）

<https://github.com/zensical/zensical/releases/tag/v0.0.67>

````markdown
## Summary

Zensical now supports Material for MkDocs’ `social` plugin natively, generating social cards and Open Graph and Twitter metadata with bundled or custom layouts. This release also adds native `llmstxt` and `exclude` plugins for Markdown exports and file exclusions.

Additionally, the user interface is updated to [v0.0.34](https://github.com/zensical/ui/releases/tag/v0.0.34), adding a **Copy as Markdown** button.

## Changelog

### Features

- 9f9b25b __zensical__, __zensical-serve__, __compat__ – add `llmstxt` MkDocs plugin replacement
- f7596cf __zensical__, __compat__, __ui__ – add `social` MkDocs plugin replacement
- 4c2b8e2 __zensical__, __compat__ – add `exclude` MkDocs plugin replacement
- b324149 __compat__ – add `github-admonitions` MkDocs plugin replacement

### Bug fixes

- a55e52c __ui__ – update ui to v0.0.34
- f648bb3 __zensical__, __compat__ – respect custom templates for blog views (#990)
````

## zensical v0.0.68（2026-10-05）

<https://github.com/zensical/zensical/releases/tag/v0.0.68>

````markdown
## Summary

This version adds native replacements for the `audio` and `video` MkDocs plugins and improves compatibility with the `macros` plugin. The user interface is updated to [v0.0.35](https://github.com/zensical/ui/releases/tag/v0.0.35), bringing instant navigation to search results, consistent skip links, and corrected accessibility labels for overlays and progress indicators.

**Python 3.11 or newer is now required.** Support for Python 3.10 has been removed.

## Changelog

### Features

- 00fe88a __compat__ – add `audio` and `video` MkDocs plugin replacement

### Bug fixes

- 7662853 __ui__ – update ui to v0.0.35
- acee50c __zensical__, __compat__ – mirror `macros` plugin behavior more closely (#999)
````

## zensical v0.0.69（2026-10-08）

<https://github.com/zensical/zensical/releases/tag/v0.0.69>

````markdown
## Summary

This version adds MkDocs plugin replacements for `nav-weight` and `markdownextradata`, improves symlink watching, fixes minification crashes with Unicode, and preserves emojis in `llmstxt` exports.

The user interface is updated to [v0.0.36](https://github.com/zensical/ui/releases/tag/v0.0.36), improving navigation spacing and fixing instant navigation.

## Changelog

### Features

- 2225649 __zensical__, __compat__ – support mkdocs-nav-weight plugin
- 8e96dd1 __compat__ – support mkdocs-markdownextradata plugin

### Bug fixes

- 3f5f089 __zensical__ – preserve emojis in llmstxt output (#1019)
- 389ad14 __ui__ – update ui to v0.0.36
- b976a85 __zensical__, __compat__ – don't panic on multi-byte characters in HTML attribute values during minification (#1013)
- 7b22d2a __zensical-watch__, __compat__ – include all files from watched directory symlinks
- 4924fea __zensical__, __compat__ – handle symlinked files in watched dependencies (#1010)
````

## zensical v0.0.70（2026-10-12）

<https://github.com/zensical/zensical/releases/tag/v0.0.70>

````markdown
## Summary

Zensical now supports the `exclude_docs`, `draft_docs`, and `not_in_nav` settings from `mkdocs.yml` for excluding files, previewing drafts, and keeping pages out of automatic navigation.

Additionally, the user interface is updated to [v0.0.37](https://github.com/zensical/ui/releases/tag/v0.0.37), improving search accessibility and reliability, adding draft markers and discovery links for `llms.txt` and Markdown, and introducing **17 new icons**, including `:simple-zensical:`.

## Changelog

### Features

- 75995d9 __zensical__, __zensical-watch__, __compat__ – support `exclude_docs`, `draft_docs`, and `not_in_nav` settings

### Bug fixes

- 3d11502 __ui__ – update ui to v0.0.37
````

## zensical v0.0.71（2026-10-16）

<https://github.com/zensical/zensical/releases/tag/v0.0.71>

````markdown
## Summary

This version adds support for `mkdocs-include-markdown-plugin`. It also fixes social card rendering when palette colors are unset, prevents unnecessary restarts during file discovery, and reports oversized search fields more clearly.

## Changelog

### Features

- db5f22e __zensical__, __compat__ – support include-markdown plugin

### Bug fixes

- 7430b0c __zensical__, __compat__ – preserve social palette defaults for unset colors (#1041)
- 62a6e6b – build manylinux AArch64 wheel on native ARM runner (#1040)
- 812f06b __zensical__, __zensical-watch__, __compat__ – avoid false restarts during file discovery (#1035)
- 391e658 __zensical__ – reject oversized search fields during index construction
````

## zensical v0.0.72（2026-10-23）

<https://github.com/zensical/zensical/releases/tag/v0.0.72>

````markdown
## Summary

This version brings Zensical's behavior closely in line with MkDocs, with support for the privacy plugin and fixes to Markdown rendering, link handling, and project layouts.

Fenced code blocks now work by default, Markdown extension order is preserved with SuperFences, and links to Markdown pages can end with a trailing slash. HTML URL rewriting handles character references correctly while preserving surrounding quotes and whitespace. Overlapping documentation and theme directories and custom polyfill scripts are also handled correctly.

File watching is more reliable, and template edits made within the same second are now picked up.

Additionally, the user interface is updated to v0.0.38, and this release includes a security update to `rustls`.

## Changelog

### Features

- 581fc01 __zensical__, __compat__ – support privacy plugin

### Bug fixes

- 1dd7988 __zensical__, __compat__ – resolve HTML character references before rewriting URLs
- 3f3c8a7 __compat__ – normalize polyfill script entries (#1075)
- b37107b __compat__ – handle same second edits
- 967bfec __zensical__, __compat__ – restrict HTML URL rewriting to attribute values
- 47cf4da __zensical-watch__ – handle reused ext4 inode in watcher
- 878aaad __zensical__, __compat__ – retain overlapping documentation and theme sources
- 36fc72a __compat__ – preserve configured SuperFences extension order
- e0bf56d __zensical-watch__, __compat__ – ignore access events in watcher
- 7cfd5f6 __ui__ – update ui to v0.0.38
- 55186fb – patch `rustls` to mitigate security vulnerability
- dc85f5f __zensical__, __compat__ – support links to Markdown pages with a trailing slash
- 75bbdae __compat__ – support fenced code blocks by default
- d5086f1 __zensical__, __zensical-serve__, __compat__ – print all bound addresses when serving (#1050)
- b4a4804 __zensical__ – count search token positions for field limits (#1046)
````

## zensical v0.0.73（2026-10-26）

<https://github.com/zensical/zensical/releases/tag/v0.0.73>

````markdown
## Summary

This version fixes URL rewriting in the privacy plugin so assets loaded by JavaScript resolve correctly on nested pages and during local preview. It also corrects the nested list example included in newly created projects.

Additionally, the user interface is updated to v0.0.39, adding support for Mermaid 12 and improving scroll restoration when following anchor links, reloading pages, or navigating back and forward.

## Changelog

### Bug fixes

- d68bd2c __compat__ – nested list item has insufficient indent in bootstrapped project
- f039e8b __ui__ – update ui to v0.0.39
- 9d1b114 __zensical__, __compat__ – fix URL rewriting in the privacy plugin (#1080)
````

## zensical v0.0.74（2026-10-30）

<https://github.com/zensical/zensical/releases/tag/v0.0.74>

````markdown
## Summary

This version adds support for the `optimize` plugin and includes fixes for redirects, blog dates, validation settings, privacy downloads, and `llms.txt` output.

## Changelog

### Features

- df2ba1c __zensical__, __compat__ – support optimize plugin
- 91d4e31 __compat__, __docker__, __ui__ – source assets from `zensical-ui`

### Bug fixes

- e5aa684 – update ui to v0.0.41
- b4890c3 __zensical__, __compat__ – preserve query strings in internal redirects
- 7e0784a __zensical__, __compat__ – use configured locale for blog dates (#1097)
- 49132b7 __zensical__ – preserve images with URLs in llmstxt output (#1095)
- 6292939 __zensical__, __compat__ – support legacy validation setting and `relative_to_docs` value (#1060)
- 7bab4ef __zensical__, __compat__ – honor custom CA bundles in privacy downloads (#1089)
````

## ui v0.0.31（2026-09-19）

<https://github.com/zensical/ui/releases/tag/v0.0.31>

````markdown
## Summary

This version fixes empty submenus for sections containing only an index page and improves task list checkbox sizing and alignment in the modern theme. It also updates dependencies and adds 60 new icons across Lucide, Octicons, and Simple Icons.

## Changelog

### Features

- 8b631ab __ui__ – update dependencies

### Bug fixes

- ec2adfb __ui__, __templates__ – omit empty submenus for section index pages (#228)

### Refactorings

- 81a9000 __ui__, __modern__ – improve rendering of task lists
````

## ui v0.0.32（2026-09-22）

<https://github.com/zensical/ui/releases/tag/v0.0.32>

````markdown
## Summary

This version adds native blog templates and redesigns the modern post sidebar with improved author and metadata layouts, configurable icons, and refined link states. The classic theme remains unchanged.

## Changelog

### Features

- 948e990 __ui__, __modern__, __templates__ – make blog icons configurable
- 96e4237 __ui__, __modern__ – redesign modern blog sidebar
- 0b52392 __ui__, __modern__, __templates__ – add native blog templates

### Bug fixes

- 91c4f52 __ui__, __scripts__ – skip search highlighting when no terms remain (#235)
````

## ui v0.0.33（2026-09-28）

<https://github.com/zensical/ui/releases/tag/v0.0.33>

````markdown
## Summary

This version adds styling for `mkdocstrings` backlinks in both the `modern` and `classic` themes. It also restores GLightbox styles after instant navigation, respects custom Mermaid node label colors, and fixes the `/` search shortcut.

## Changelog

### Features

- a406071 __ui__, __classic__, __modern__ – autorefs backlinks

### Bug fixes

- 49cc6da __ui__, __scripts__ – restore GLightbox styles after instant navigation (#243)
- caa15db __ui__, __scripts__ – honor Mermaid node label color overrides (#241)
- 2ba6c99 __ui__, __scripts__ – claim `/` key when opening search
````

## ui v0.0.34（2026-09-30）

<https://github.com/zensical/ui/releases/tag/v0.0.34>

````markdown
## Summary

This version adds `content.action.copy`, allowing users to copy the down-leveled Markdown of the page. Dependencies have been updated, including Preact 11, adding 12 icons.

## Changelog

### Features

- 8fa545c __ui__, __classic__, __modern__, __scripts__, __templates__ – add copy-as-markdown button for llmstxt plugin
````

## ui v0.0.35（2026-10-05）

<https://github.com/zensical/ui/releases/tag/v0.0.35>

````markdown
## Summary

Search results now use instant navigation, avoiding full page reloads and repeated search index loading. Skip links consistently target page content, and ARIA naming for overlays and progress indicators has been corrected.

## Changelog

### Bug fixes

- d5354e6 __ui__, __scripts__ – use instant navigation for search results (#252)
- be6b7c5 __ui__, __templates__ – use a consistent skip link target (#250)
- 5e34ab8 __ui__, __templates__ – correct ARIA naming on overlay and progress indicator
````

## ui v0.0.36（2026-10-08）

<https://github.com/zensical/ui/releases/tag/v0.0.36>

````markdown
## Summary

This version polishes navigation styling and fixes a regression in instant navigation.

## Changelog

### Bug fixes

- 352c211 __ui__, __modern__ – add spacing after code symbols in nav/breadcrumbs (#260)
- 8b183c3 __ui__, __scripts__ – ignore anchors without href in instant navigation (#256)
````

## ui v0.0.37（2026-10-12）

<https://github.com/zensical/ui/releases/tag/v0.0.37>

````markdown
## Summary

This version improves search accessibility with better keyboard navigation, focus handling, labels, and status announcements. Search initialization and error handling are also more robust.

It also brings support for draft documents, with _draft_ markers now having consistent styling in both themes. Pages gain discovery links for `llms.txt` and Markdown alternatives when available. Dependencies are updated, with **17 new icons** added, including `:simple-zensical:`.

## Changelog

### Features

- 6d87cbc __ui__, __classic__, __modern__ – add some light styling to draft markers

### Bug fixes

- 2a04bab __ui__, __scripts__ – improve search accessibility and result rendering
- c912822 __ui__, __scripts__ – update search client rendering and keyboard handling
- d6669ba __ui__, __templates__ – add "describedby" and "alternate" links as per llms.txt spec (#264)
````

## ui v0.0.38（2026-10-20）

<https://github.com/zensical/ui/releases/tag/v0.0.38>

````markdown
## Summary

This version improves header accessibility, restores ellipsis for long words in the table of contents while preserving multiline entries, and fixes text colors in Mermaid state diagram notes.

It also adds **26 new Lucide icons**, updates dependencies, and removes a vulnerable CSS build dependency.

## Changelog

### Bug fixes

- 1bb03fd __ui__, __scripts__ – use theme colors for Mermaid state diagram note text (#273)
- 061104c __ui__, __classic__, __modern__, __templates__ – use hidden text for header toggle labels (#274)
- d61af50 __ui__, __classic__, __modern__ – restore ellipsis for long ToC words while preserving wrapping (#271)
````

## ui v0.0.39（2026-10-26）

<https://github.com/zensical/ui/releases/tag/v0.0.39>

````markdown
## Summary

This version adds support for **Mermaid 12**, with updated diagram styling and consistent colors across light and dark themes. It also improves anchor handling and scroll restoration, bringing reloads and history navigation closer to native browser behavior and fixing unexpected jumps during rapid Back and Forward navigation.

It also adds **16 new icons** and updates dependencies.

## Changelog

### Features

- f2e8d02 __ui__, __scripts__ – add support for Mermaid 12 (#259)

### Bug fixes

- b60e016 __ui__, __scripts__ – align scroll restoration with native navigation (#284)
- 8f4636d __ui__, __scripts__ – detect repeated anchor links before updating history (#279)
- 7ae2ea9 __ui__, __scripts__ – prevent stale scroll writes during rapid history navigation (#279)
- ce8a1f5 __ui__, __scripts__ – restore saved scroll positions when returning to fragments
- 09824ed __ui__, __scripts__ – clear cached anchors when navigating without a fragment
- 67bf3d0 __ui__, __scripts__ – prevent stale tracking updates during instant navigation (#279)
````

## ui v0.0.40（2026-10-27）

<https://github.com/zensical/ui/releases/tag/v0.0.40>

````markdown
## Summary

This version introduces `zensical-ui`, a Python package containing Zensical's templates, browser assets, and icons. It prepares the UI to ship separately from Zensical’s native wheels, allowing future releases to reduce their package sizes.

The package includes prebuilt assets and supports editable installs for local UI development.

## Changelog

### Features

- b9019fb __ui__, __tools__ – package templates as `zensical-ui`
````

## ui v0.0.41（2026-10-30）

<https://github.com/zensical/ui/releases/tag/v0.0.41>

````markdown
## Summary

This version fixes tag filtering in search, correctly escapes page descriptions, and ensures image galleries only show images for the active color scheme.

## Changelog

### Bug fixes

- 2382910 __ui__, __scripts__ – only show images for current theme variant in glightbox slides (#296)
- bcdd0f9 __ui__, __templates__ – escape HTML descriptions (site and front-matter)
- 280ff5a __ui__, __scripts__ – correct off-by-one error in bitmap negation (#293)
````
