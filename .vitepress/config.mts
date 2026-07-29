import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

type SidebarItem = DefaultTheme.SidebarItem

const root = path.resolve(import.meta.dirname, '..')

function markdownLinkToRoute(markdownPath: string): string {
  const cleanPath = markdownPath
    .split('#', 1)[0]
    .replace(/^\.\//, '')
    .replace(/\\/g, '/')

  if (cleanPath === 'README.md') return '/'
  if (cleanPath.endsWith('/README.md')) {
    return `/${cleanPath.slice(0, -'README.md'.length)}`
  }

  return `/${cleanPath.replace(/\.md$/i, '')}`
}

function sidebarFromSummary(): SidebarItem[] {
  const lines = fs.readFileSync(path.join(root, 'SUMMARY.md'), 'utf8').split(/\r?\n/)
  const sidebar: SidebarItem[] = []
  let currentGroup: SidebarItem | undefined
  let stack: Array<{ indent: number; item: SidebarItem }> = []

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      currentGroup = { text: heading[1], collapsed: false, items: [] }
      sidebar.push(currentGroup)
      stack = []
      continue
    }

    const entry = line.match(/^(\s*)\*\s+\[([^\]]+)]\(([^)]+)\)\s*$/)
    if (!entry) continue

    const item: SidebarItem = {
      text: entry[2],
      link: markdownLinkToRoute(entry[3])
    }
    const indent = entry[1].replace(/\t/g, '  ').length

    if (!currentGroup) {
      sidebar.push(item)
      continue
    }

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop()

    if (stack.length) {
      const parent = stack[stack.length - 1].item
      parent.items ??= []
      parent.items.push(item)
    } else {
      currentGroup.items!.push(item)
    }

    stack.push({ indent, item })
  }

  return sidebar
}

export default defineConfig({
  lang: 'zh-CN',
  title: '上海交通大学生存手册',
  description: '由上海交通大学学生共同编写并长期维护的生存手册',
  base: '/SurviveSJTUManual/',
  cleanUrls: true,
  srcDir: '.',
  outDir: './_site',
  cacheDir: './node_modules/.vitepress-cache',
  srcExclude: [
    '.github/**',
    '.vitepress/**',
    'node_modules/**',
    'SUMMARY.md'
  ],
  rewrites: (id) => id.endsWith('README.md')
    ? id.replace(/README\.md$/, 'index.md')
    : id,
  appearance: false,
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-light'
    },
    image: {
      lazyLoading: true
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }]
  ],
  themeConfig: {
    siteTitle: 'SurviveSJTUManual',
    sidebar: sidebarFromSummary(),
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    nav: [
      { text: '阅读手册', link: '/' },
      { text: 'GitHub', link: 'https://github.com/SurviveSJTU/SurviveSJTUManual' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SurviveSJTU/SurviveSJTUManual' }
    ],
    editLink: {
      pattern: 'https://github.com/SurviveSJTU/SurviveSJTUManual/edit/master/:path',
      text: '在 GitHub 上编辑此页'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    footer: {
      message: '内容由 SurviveSJTU 社区共同维护',
      copyright: '基于 GitHub Pages 发布'
    }
  },
  sitemap: {
    hostname: 'https://zengyincen.github.io/SurviveSJTUManual/'
  }
})
