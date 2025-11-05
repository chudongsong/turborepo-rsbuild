import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * DocsController
 *
 * 动态导出 OpenAPI 3.0 文档，便于导入到 Apipost / Postman 等工具。
 * 路由来源：运行时从 `app.router.stack` 读取所有已注册路由，生成基本的 `paths` 结构。
 */
export default class DocsController extends Controller {
	/**
	 * 文档页面 - 返回基于 Swagger UI 的 API 文档页面
	 *
	 * @param {Context} ctx - Egg 请求上下文
	 * @returns {Promise<void>} - 返回使用 Swagger UI 渲染的 HTML 文档页面
	 */
	async redirect(ctx: Context) {
		ctx.type = 'html'
		const baseUrl = `${ctx.protocol}://${ctx.host}`
		ctx.body = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>LinglongOS API 文档</title>
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			background: #f5f5f5;
		}
		header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 20px;
			text-align: center;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		}
		h1 {
			font-size: 2em;
			margin-bottom: 5px;
		}
		.swagger-ui .topbar { display: none; }
		.swagger-ui .info { margin: 20px 0; }
	</style>
</head>
<body>
	<header>
		<h1>LinglongOS API 文档</h1>
		<p>统一面板代理与认证服务 API</p>
	</header>
	<div id="swagger-ui"></div>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
	<script>
		window.onload = () => {
			window.ui = SwaggerUIBundle({
				url: '${baseUrl}/api/v1/docs/openapi.json',
				dom_id: '#swagger-ui',
				presets: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIStandalonePreset
				],
				layout: "StandaloneLayout",
				docExpansion: "none",
				deepLinking: true,
				showExtensions: true,
				showCommonExtensions: true,
				defaultModelsExpandDepth: 2,
				defaultModelExpandDepth: 2,
				displayRequestDuration: true,
				tryItOutEnabled: true,
				supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
				onComplete: () => {
					console.log('Swagger UI loaded successfully');
				}
			});
		};
	</script>
</body>
</html>`
	}

	/**
	 * 导出 OpenAPI JSON。
	 *
	 * @param {Context} ctx - Egg 请求上下文
	 * @returns {Promise<void>} - 返回 `application/json` 的 OpenAPI 文档
	 */
	async openapi(ctx: Context) {
		const stack: any[] = (this.app as any)?.router?.stack || []

		const paths: Record<string, any> = {}
		const ignoreMethods = new Set(['HEAD', 'OPTIONS'])

		for (const layer of stack) {
			const path: string = (layer as any).path || (layer as any).route?.path
			const methods: string[] = ((layer as any).methods || (layer as any).route?.methods || []).map((m: string) =>
				m.toUpperCase(),
			)
			if (!path || !methods || methods.length === 0) continue

			// 规范化：仅保留以 '/' 开头的路径
			const normPath = path.startsWith('/') ? path : `/${path}`
			if (!paths[normPath]) paths[normPath] = {}

			for (const method of methods) {
				if (ignoreMethods.has(method)) continue
				const op = method.toLowerCase()
				// 避免重复写入
				if (paths[normPath][op]) continue

				// 基础的 operation 信息，方便导入到 API 管理工具后再补充细节
				paths[normPath][op] = {
					summary: `Auto generated for ${method} ${normPath}`,
					requestBody: {
						required: false,
						content: {
							'application/json': {
								schema: { type: 'object', additionalProperties: true },
							},
							'application/x-www-form-urlencoded': {
								schema: { type: 'object', additionalProperties: true },
							},
						},
					},
					responses: {
						200: {
							description: 'Successful response',
							content: {
								'application/json': {
									schema: { type: 'object', additionalProperties: true },
								},
							},
						},
					},
				}
			}
		}

		const doc = {
			openapi: '3.0.3',
			info: {
				title: 'LinglongOS API',
				version: '1.0.0',
				description: 'Auto-generated OpenAPI spec from runtime routes.',
			},
			servers: [{ url: '/' }],
			paths,
		}

		ctx.set('Content-Type', 'application/json; charset=utf-8')
		ctx.success(doc)
	}
}
