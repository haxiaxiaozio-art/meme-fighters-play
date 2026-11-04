# MEME 大乱斗试玩站

浏览器游戏、昵称评论、评分、反馈分类和评论管理。

游戏本体为 v0.8 单机/AI 对战，支持 2–4 个角色同场；不包含网络联机。

## 本地开发

需要 Node.js 22.12 或更新版本。

```sh
npm ci
npm test
npm run build
npm run dev -- --port 5174
```

`public/game/index.html` 是完整游戏资源。修改外围页面不需要修改游戏本体。
`public/config.js` 只保存公开的评论 API 地址，不得放入数据库密码、service-role key 或管理访问码。

## 部署

前端通过 GitHub Actions 构建并部署到 GitHub Pages，推送 main 后自动发布。
仓库 Settings → Pages 的构建方式需要选择 GitHub Actions。

评论服务使用 Supabase，独立于页面托管：

1. 新项目执行 `supabase/schema.sql` 初始化数据库。
2. 部署 `supabase/functions/feedback/index.ts` 为 `feedback` Edge Function。
3. 该函数为公开的匿名评论接口，使用自有会话和管理员验证，部署配置为 `verify_jwt = false`。
4. 函数使用平台在服务端注入的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`。
5. 在 `meme_private.settings` 保存 `admin_key_hash`：独立随机 32 字节管理访问码（64 位十六进制）的 SHA-256 值。不要把原码写入仓库或公开页面。
6. 将函数地址写入 `public/config.js` 的 `apiBase`。自定义域名改变时，同步检查函数的 CORS 来源白名单。

数据库表位于私有 schema，开启 RLS，禁止 anon/authenticated 直接读取或写入。只有服务端可调用 RPC。
公开评论只展示昵称、内容、分类、评分和时间。后台保留会话哈希与加盐 IP 哈希用于限频，不保存原始 IP。

管理入口为 `?admin=1`。管理访问码只保留在当前页面内存中，刷新后需重新输入。
管理功能包括隐藏/恢复评论与导出 CSV；导出内容做了公式转义。

## 验证

`npm test` 使用独立的内存 PostgreSQL 验证真实 SQL 和 Edge 请求处理逻辑，包括会话、校验、重复提交、限频、权限、隐藏/恢复、分页、CSV 与数据库访问隔离。
本地测试不写入线上评论。上线后还需验证真实跨域请求与游戏加载。

## 素材说明

本项目为同人试玩页面。角色与梗图等素材的相关权利归原权利方所有；公开仓库不意味着授予这些第三方素材的商业使用权。

素材与声音的原始来源记录见 [credits.txt](public/game/credits.txt)。
