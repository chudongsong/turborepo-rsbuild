import { Controller } from 'egg';

/**
 * 面板类型
 */
type PanelType = 'bt' | '1panel';

/**
 * 初始化状态控制器
 *
 * 负责检查系统初始化状态，包括：
 * - 2FA 绑定状态
 * - 面板绑定状态
 * - 会话状态
 * @controller Init
 */
export default class InitController extends Controller {
  /**
   * 检查系统初始化状态
   * @summary 检查API服务状态
   * @description 检查验证方式、2FA绑定和面板绑定状态，用于前端判断需要进行哪些初始化步骤
   * @router all /api/v1/init/status
   */
  public async checkStatus() {
    const { ctx, service } = this;

    try {
      // 使用存储服务检查状态
      const storage = service.storage;

      // 检查验证方式
      const authMethod = storage.getAuthMethod();

      // 检查用户名
      const username = storage.getUsername();

      // 检查面板绑定状态
      const panelType = 'bt' as PanelType; // 默认检查 bt 面板
      const panelConfig = storage.getPanel(panelType);
      const hasPanel = !!(panelConfig?.url && panelConfig?.key);

      // 检查会话状态（如果有 session cookie）
      const sessionId = ctx.cookies.get('ll_session');
      let hasValidSession = false;

      if (sessionId) {
        hasValidSession = storage.isValidSession(sessionId);
      }

      ctx.success({
        authMethod, // 新增：验证方式
        username,   // 新增：用户名
        hasPanel,
        hasValidSession,
        needsInitialization: !authMethod || !hasPanel,
        // 保持向后兼容
        hasTwoFA: authMethod === 'totp',
        // 添加调试信息
        debug: {
          sessionCookie: sessionId ? 'present' : 'missing',
          authMethod: authMethod || 'not_set',
          username: username || 'admin',
          panelConfig: panelConfig ? 'present' : 'missing',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      ctx.logger.error('检查初始化状态失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.internalError('检查初始化状态失败', errorMessage);
    }
  }
}