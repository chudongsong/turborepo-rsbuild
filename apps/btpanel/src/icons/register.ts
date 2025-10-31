// 自动引入 src/icons 下的所有 svg 文件，交给 svg-sprite-loader 生成 symbol sprite
// Rspack/webpack 提供 require.context，用于在构建时批量引入资源
// 生成的符号 id 由 loader 的 symbolId 规则决定：icon-[name]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requireAll = (r: any) => r.keys().forEach(r)
// 引入所有子目录的 .svg 文件
// 这里使用别名 @ 指向 src 目录
// 注意：如果你的别名发生变化，请同步更新此路径
// eslint-disable-next-line @typescript-eslint/no-var-requires
const context = (require as any).context('@/icons', true, /\.svg$/)
requireAll(context)