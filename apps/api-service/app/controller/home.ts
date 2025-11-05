import { Controller } from 'egg';
import type { Context } from 'egg';

/**
 * HomeController
 *
 * 提供根路径 `/` 的访问控制逻辑。
 * - 未初始化：重定向到 setup.html
 * - 已初始化：重定向到 index.html
 * 使用 Classic Controller 模式，继承自 Controller 基类。
 */
export default class HomeController extends Controller {
  /**
   * 根路径首页，根据初始化状态重定向到不同页面。
   *
   * @param {Context} ctx - Egg 上下文
   * @returns {Promise<void>} - 无返回值（重定向）
   */
  async index(ctx: Context) {
    this.logger.info('访问根路径 /，检查初始化状态');

    try {
      // 检查系统是否已初始化
      const storage = ctx.service.storage;
      const authMethod = storage.getAuthMethod();
      const panelConfig = storage.getPanel('bt');
      const hasPanel = !!(panelConfig?.url && panelConfig?.key);
      const isInitialized = authMethod && hasPanel;

      this.logger.info(`初始化状态: authMethod=${authMethod}, hasPanel=${hasPanel}, isInitialized=${isInitialized}`);

      if (isInitialized) {
        // 已初始化，重定向到 index.html
        ctx.redirect('/public/index.html');
      } else {
        // 未初始化，重定向到 setup.html
        ctx.redirect('/public/setup.html');
      }
    } catch (error) {
      this.logger.error('检查初始化状态失败:', error);
      // 出错时重定向到 setup.html（安全默认）
      ctx.redirect('/public/setup.html');
    }
  }
}
