import { Controller } from 'egg';
import type { Context } from 'egg';

/**
 * UiController
 *
 * 提供简单的 UI 入口重定向到静态页面。
 * @controller UI
 */
export default class UiController extends Controller {
  /**
   * 重定向到内置静态页面 `/public/index.html`。
   * @summary 获取首页
   * @description 返回 API 服务的首页静态页面
   * @router get /ui
   */
  async index(ctx: Context) {
    ctx.redirect('/public/index.html');
  }
}