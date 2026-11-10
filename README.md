# fuuhaku.cc 游戏试玩站

浏览器游戏、昵称评论、评分、反馈分类和评论管理。

首页可选择梗斗或森境。梗斗位于 `/?game=meme`，支持 2–4 个角色同场单机或 AI 对战。森境位于 `/forest/campaign.html`，完整网页资源放在 `public/forest/`。梗斗的试玩统计与评论仍在梗斗页面。

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

1. 新项目依次执行 `supabase/schema.sql` 和 `supabase/analytics.sql` 初始化评论与统计数据库；现有项目只需执行新增的 `analytics.sql`。
2. 部署 `supabase/functions/feedback/index.ts` 为 `feedback` Edge Function。
3. 该函数为公开的匿名评论接口，使用自有会话和管理员验证，部署配置为 `verify_jwt = false`。
4. 函数使用平台在服务端注入的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`。
5. 在 `meme_private.settings` 保存 `admin_key_hash`：独立随机 32 字节管理访问码（64 位十六进制）的 SHA-256 值。不要把原码写入仓库或公开页面。
6. 将函数地址写入 `public/config.js` 的 `apiBase`。自定义域名改变时，同步检查函数的 CORS 来源白名单。

数据库表位于私有 schema，开启 RLS，禁止 anon/authenticated 直接读取或写入。只有服务端可调用 RPC。
公开评论只展示昵称、内容、分类、评分和时间。后台保留会话哈希与加盐 IP 哈希用于限频，不保存原始 IP。

管理入口为 `?admin=1`。管理访问码只保留在当前页面内存中，刷新后需重新输入。
管理功能包括访问统计、隐藏/恢复评论与导出 CSV；导出内容做了公式转义。

## 访问统计

升级现有站点时，依次执行 `supabase/analytics.sql`、部署新的 `feedback` Edge Function、推送前端。迁移只新增表与函数，可重复执行，不清空评论和已有统计。新项目也需在 `schema.sql` 后执行此文件。沿用现有管理访问码和服务端环境变量。

管理后台展示今天与累计的访客数、浏览次数、进入游戏人数，以及近 7/30 天的趋势和每日明细。日界线为 Asia/Singapore（UTC+8）；迁移之前没有访问数据，不补造历史零值。

- 访客按随机浏览器标识去重。标识保存在本站 localStorage，后端只存服务端加盐哈希；不使用昵称、指纹或原始 IP。换设备、清理存储、无痕浏览或存储不可用可能重复计数，因此是估算人数。
- 打开或刷新试玩页记录一次浏览。一次页面生命周期共用一个 view ID，重复事件和先到达的游戏事件不会重复计数。
- 点击“进入擂台”或“独立窗口”记录进入游戏，按浏览器去重，不代表完成对局。游戏点击按实际点击日期归属；留在页面跨日后点击，也算点击当天的活跃访客。
- 管理页、localhost 和开启 Do Not Track 的浏览器不上报；直接打开 `game/index.html` 不记录。网络失败或拦截可能造成漏计；统计失败不会阻止游戏或评论。累计访客独立去重，不是每日访客之和，也不是实时在线人数。
- 统计不收集完整 URL、查询参数、来源网址或设备信息。限频独立存储每日变化的加盐 IP 哈希，600 次/小时/IP，过期桶在后续上报时清理；访问历史按一条页面记录保留，后台只返回聚合数值。匿名事件可被伪造，基础限频不等于防作弊，不能用作结算依据。
- 统计表启用 RLS，anon/authenticated 不能直接读取、写入或调用 RPC。`GET /api/admin/analytics?days=7|30` 必须通过管理访问码校验。匿名接口 `POST /api/analytics` 仅接受有效 UUID 和 pageview/game_enter 事件；不把客户端提供的任意字段写入数据库。

不要修改 `public/game/index.html` 来加入统计；该文件保持原始游戏资源。现有服务端密钥参与访客哈希，轮换该密钥会影响跨轮换的累计去重口径。

## 验证

`npm test` 使用独立的内存 PostgreSQL 验证真实 SQL 和 Edge 请求处理逻辑，包括会话、校验、重复提交、限频、权限、隐藏/恢复、分页、CSV、访问统计去重、UTC+8 日界线、浏览器记录行为与数据库访问隔离。
本地测试不写入线上评论。上线后还需验证真实跨域请求与游戏加载。

## 素材说明

本项目为同人试玩页面。角色与梗图等素材的相关权利归原权利方所有；公开仓库不意味着授予这些第三方素材的商业使用权。

素材与声音的原始来源记录见 [credits.txt](public/game/credits.txt)。
