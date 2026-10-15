<!-- 存档：GitHub Releases 原文，2026-10-15 抓取。zensical：https://github.com/zensical/zensical/releases ；ui：https://github.com/zensical/ui/releases 。每个版本的正文原样放在代码块里，不渲染外链图片。 -->

# Zensical 0.0.63–0.0.70 与 UI 0.0.31–0.0.37 发布说明（存档）

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
