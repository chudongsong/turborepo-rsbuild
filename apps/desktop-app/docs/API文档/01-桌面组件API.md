# 01-桌面组件API

本文档详细描述了 Linglong Desktop 桌面组件的 API 接口规范，包括组件属性、方法定义、事件处理等。

## 🖥️ Desktop 组件

### 组件概述

Desktop 组件是桌面环境的根组件，负责管理整个桌面环境的状态和交互。

### 属性接口

```typescript
interface DesktopProps {
  // 桌面配置
  config?: DesktopConfig;
  
  // 事件回调
  onIconClick?: (icon: DesktopIcon) => void;
  onIconDoubleClick?: (icon: DesktopIcon) => void;
  onIconRightClick?: (icon: DesktopIcon, event: MouseEvent) => void;
  onBackgroundClick?: (event: MouseEvent) => void;
  
  // 自定义样式类名
  className?: string;
  
  // 自定义样式
  style?: React.CSSProperties;
}
```

### 配置接口

```typescript
interface DesktopConfig {
  // 网格设置
  grid: {
    size: number;        // 网格大小（像素）
    visible: boolean;    // 是否显示网格
    snapToGrid: boolean; // 是否吸附到网格
  };
  
  // 背景设置
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
    stretch: boolean;
    position: 'center' | 'cover' | 'contain';
  };
  
  // 布局设置
  layout: {
    iconsPerRow: number;
    iconSpacing: number;
    margin: { top: number; left: number };
  };
  
  // 性能设置
  performance: {
    virtualized: boolean;      // 是否启用虚拟化
    maxVisibleIcons: number;   // 最大可见图标数
    animationEnabled: boolean; // 是否启用动画
  };
}
```

### 状态接口

```typescript
interface DesktopState {
  // 桌面图标
  icons: DesktopIcon[];
  
  // 桌面小组件
  widgets: DesktopWidget[];
  
  // 选择的图标
  selectedIcons: Set<string>;
  
  // 拖拽状态
  dragState: {
    isDragging: boolean;
    draggedIconId: string | null;
    dragPreview: DragPreview | null;
  };
  
  // 视图状态
  viewState: {
    scrollTop: number;
    scrollLeft: number;
    containerSize: { width: number; height: number };
  };
}
```

### 桌面图标接口

```typescript
interface DesktopIcon {
  // 基本信息
  id: string;
  name: string;
  description?: string;
  
  // 视觉信息
  icon: string;          // 图标文件路径或图标组件
  size: number;          // 图标大小
  labelColor?: string;   // 标签文字颜色
  
  // 位置信息
  position: {
    x: number;           // X坐标
    y: number;           // Y坐标
  };
  
  // 尺寸信息
  size: {
    width: number;
    height: number;
  };
  
  // 属性标志
  isFolder: boolean;     // 是否为文件夹
  isHidden: boolean;     // 是否隐藏
  isDisabled: boolean;   // 是否禁用
  
  // 文件夹内容（如果是文件夹）
  folderItems?: DesktopIcon[];
  
  // 应用信息（如果是应用图标）
  appInfo?: {
    appId: string;
    executablePath?: string;
    parameters?: string[];
    workingDirectory?: string;
  };
  
  // 上下文菜单
  contextMenu?: ContextMenuItem[];
  
  // 事件处理
  onClick?: (icon: DesktopIcon) => void;
  onDoubleClick?: (icon: DesktopIcon) => void;
  onRightClick?: (icon: DesktopIcon, event: MouseEvent) => void;
}
```

## 🪟 窗口管理 API

### WindowManager 组件

```typescript
interface WindowManagerProps {
  // 窗口配置
  windows?: WindowInstance[];
  activeWindowId?: string;
  
  // 事件回调
  onWindowCreate?: (window: WindowInstance) => void;
  onWindowClose?: (windowId: string) => void;
  onWindowFocus?: (windowId: string) => void;
  onWindowBlur?: (windowId: string) => void;
  onWindowMove?: (windowId: string, position: Position) => void;
  onWindowResize?: (windowId: string, size: Size) => void;
  
  // 配置选项
  options?: {
    enableMinimize: boolean;
    enableMaximize: boolean;
    enableClose: boolean;
    enableResize: boolean;
    enableDrag: boolean;
    defaultZIndex: number;
    animations: boolean;
  };
}
```

### 窗口实例接口

```typescript
interface WindowInstance {
  // 基本信息
  id: string;
  title: string;
  appId?: string;
  
  // 位置和尺寸
  position: Position;
  size: Size;
  
  // 状态
  isMinimized: boolean;
  isMaximized: boolean;
  isModal: boolean;
  isResizable: boolean;
  isClosable: boolean;
  
  // 层级管理
  zIndex: number;
  parentWindowId?: string;
  
  // 内容配置
  content: {
    component: React.ComponentType<any>;
    props?: Record<string, any>;
    url?: string;        // 如果是网页窗口
    html?: string;       // 如果是HTML窗口
  };
  
  // 图标和样式
  icon?: string;
  theme?: 'light' | 'dark' | 'system';
  
  // 事件处理
  onClose?: (windowId: string) => void;
  onMinimize?: (windowId: string) => void;
  onMaximize?: (windowId: string) => void;
  onRestore?: (windowId: string) => void;
}
```

### 位置和尺寸接口

```typescript
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## 🎨 拖拽系统 API

### DnD 状态接口

```typescript
interface DragState {
  // 拖拽源信息
  source: {
    type: 'icon' | 'widget' | 'file' | 'text';
    id: string;
    originalPosition: Position;
    data: any;
  };
  
  // 拖拽目标信息
  target: {
    type: 'desktop' | 'folder' | 'widget' | 'trash';
    id: string | null;
    position?: Position;
  };
  
  // 拖拽过程信息
  process: {
    isDragging: boolean;
    dragOffset: Position;
    snapPosition?: Position;
    isValidDrop: boolean;
  };
}
```

### Drop 区域接口

```typescript
interface DropZone {
  id: string;
  type: 'desktop' | 'folder' | 'widget' | 'trash' | 'custom';
  
  // 区域定义
  bounds: Rect;
  acceptTypes: DragItemType[];
  
  // 视觉反馈
  visualFeedback?: {
    highlightColor?: string;
    borderColor?: string;
    animation?: string;
  };
  
  // 放置处理
  onDrop?: (item: DragItem, position: Position) => DropResult;
  onDragOver?: (item: DragItem, position: Position) => boolean;
  onDragLeave?: () => void;
}
```

### 拖拽项目接口

```typescript
interface DragItem {
  type: 'icon' | 'widget' | 'file' | 'text' | 'custom';
  id: string;
  data: any;
  
  // 拖拽预览
  preview?: {
    component: React.ComponentType<any>;
    size: Size;
    offset: Position;
  };
  
  // 拖拽约束
  constraints?: {
    bounds?: Rect;
    snapToGrid?: boolean;
    minDistance?: number;
    maxDistance?: number;
  };
}
```

## 🔧 自定义 Hooks API

### useDesktop Hook

```typescript
interface UseDesktopReturn {
  // 状态
  desktop: DesktopState;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  actions: {
    addIcon: (icon: Omit<DesktopIcon, 'id'>) => void;
    removeIcon: (iconId: string) => void;
    updateIcon: (iconId: string, updates: Partial<DesktopIcon>) => void;
    moveIcon: (iconId: string, position: Position) => void;
    selectIcon: (iconId: string, multiSelect?: boolean) => void;
    clearSelection: () => void;
    openContextMenu: (iconId: string, position: Position) => void;
  };
}
```

### useWindowManager Hook

```typescript
interface UseWindowManagerReturn {
  // 状态
  windows: WindowInstance[];
  activeWindowId: string | null;
  
  // 操作方法
  actions: {
    createWindow: (config: CreateWindowConfig) => string;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    maximizeWindow: (windowId: string) => void;
    restoreWindow: (windowId: string) => void;
    moveWindow: (windowId: string, position: Position) => void;
    resizeWindow: (windowId: string, size: Size) => void;
    bringToFront: (windowId: string) => void;
    sendToBack: (windowId: string) => void;
  };
}
```

### 创建窗口配置

```typescript
interface CreateWindowConfig {
  title: string;
  size: Size;
  position?: Position;
  
  // 内容类型
  contentType: 'component' | 'url' | 'html';
  content: React.ComponentType<any> | string;
  
  // 窗口选项
  options?: {
    resizable?: boolean;
    closable?: boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    modal?: boolean;
    alwaysOnTop?: boolean;
    transparent?: boolean;
    centerOnScreen?: boolean;
  };
  
  // 样式配置
  styles?: {
    theme?: 'light' | 'dark';
    backgroundColor?: string;
    borderRadius?: number;
    boxShadow?: string;
  };
}
```

## 📱 响应式 API

### 屏幕尺寸接口

```typescript
interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
}

interface UseResponsiveReturn {
  screenSize: ScreenSize;
  breakpoints: {
    mobile: number;      // <= 768px
    tablet: number;      // 768px - 1024px
    desktop: number;     // >= 1024px
    large: number;       // >= 1440px
  };
  isBreakpoint: (breakpoint: keyof ScreenSize) => boolean;
}
```

### 布局适配接口

```typescript
interface LayoutConfig {
  mobile: {
    iconSize: number;
    gridSize: number;
    margin: number;
    maxIconsPerRow: number;
  };
  tablet: {
    iconSize: number;
    gridSize: number;
    margin: number;
    maxIconsPerRow: number;
  };
  desktop: {
    iconSize: number;
    gridSize: number;
    margin: number;
    maxIconsPerRow: number;
  };
}
```

## 🎭 主题系统 API

### 主题配置接口

```typescript
interface DesktopTheme {
  // 颜色方案
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    shadow: string;
  };
  
  // 字体配置
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  
  // 间距配置
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // 动画配置
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  
  // 组件样式
  components: {
    desktop: DesktopComponentStyles;
    window: WindowComponentStyles;
    icon: IconComponentStyles;
    menu: MenuComponentStyles;
  };
}
```

### 组件样式接口

```typescript
interface DesktopComponentStyles {
  background: React.CSSProperties;
  grid: React.CSSProperties;
  selection: React.CSSProperties;
}

interface WindowComponentStyles {
  container: React.CSSProperties;
  header: React.CSSProperties;
  content: React.CSSProperties;
  controls: React.CSSProperties;
}

interface IconComponentStyles {
  container: React.CSSProperties;
  icon: React.CSSProperties;
  label: React.CSSProperties;
  selected: React.CSSProperties;
}

interface MenuComponentStyles {
  container: React.CSSProperties;
  item: React.CSSProperties;
  separator: React.CSSProperties;
}
```

## 📋 事件系统 API

### 桌面事件接口

```typescript
interface DesktopEvents {
  // 鼠标事件
  'desktop:click': (event: MouseEvent) => void;
  'desktop:doubleClick': (event: MouseEvent) => void;
  'desktop:rightClick': (event: MouseEvent) => void;
  'desktop:contextMenu': (event: MouseEvent) => void;
  
  // 键盘事件
  'desktop:keyDown': (event: KeyboardEvent) => void;
  'desktop:keyUp': (event: KeyboardEvent) => void;
  
  // 拖拽事件
  'drag:start': (item: DragItem) => void;
  'drag:move': (position: Position) => void;
  'drag:end': (result: DropResult) => void;
  
  // 选择事件
  'selection:change': (selectedIds: string[]) => void;
  'selection:clear': () => void;
  
  // 图标事件
  'icon:click': (icon: DesktopIcon) => void;
  'icon:dblclick': (icon: DesktopIcon) => void;
  'icon:rightClick': (icon: DesktopIcon, event: MouseEvent) => void;
  'icon:move': (iconId: string, position: Position) => void;
}
```

### 窗口事件接口

```typescript
interface WindowEvents {
  'window:create': (window: WindowInstance) => void;
  'window:close': (windowId: string) => void;
  'window:focus': (windowId: string) => void;
  'window:blur': (windowId: string) => void;
  'window:minimize': (windowId: string) => void;
  'window:maximize': (windowId: string) => void;
  'window:restore': (windowId: string) => void;
  'window:move': (windowId: string, position: Position) => void;
  'window:resize': (windowId: string, size: Size) => void;
}
```

## 🔧 工具函数 API

### 网格系统工具

```typescript
class GridSystem {
  // 计算网格位置
  static snapToGrid(position: Position, gridSize: number): Position;
  
  // 计算网格边界
  static getGridBounds(
    itemSize: Size, 
    gridSize: number, 
    containerSize: Size
  ): Rect[];
  
  // 查找最近的可用位置
  static findNearestAvailablePosition(
    desiredPosition: Position,
    occupiedPositions: Position[],
    gridSize: number,
    containerSize: Size
  ): Position;
  
  // 计算图标排列
  static calculateIconLayout(
    icons: DesktopIcon[],
    containerSize: Size,
    gridSize: number
  ): LayoutResult;
}
```

### 窗口管理工具

```typescript
class WindowManager {
  // 计算窗口层级
  static calculateZIndex(currentZ: number, isActive: boolean): number;
  
  // 检查窗口冲突
  static checkWindowOverlap(
    window1: WindowInstance,
    window2: WindowInstance
  ): boolean;
  
  // 计算窗口拖拽约束
  static calculateDragConstraints(
    window: WindowInstance,
    containerSize: Size
  ): DragConstraints;
  
  // 计算窗口缩放约束
  static calculateResizeConstraints(
    window: WindowInstance,
    containerSize: Size,
    resizeDirection: ResizeDirection
  ): ResizeConstraints;
}
```

### 图标工具

```typescript
class IconUtils {
  // 获取图标默认位置
  static getDefaultPosition(
    iconIndex: number,
    gridSize: number,
    containerSize: Size
  ): Position;
  
  // 查找图标冲突
  static findIconCollision(
    icon: DesktopIcon,
    otherIcons: DesktopIcon[]
  ): DesktopIcon | null;
  
  // 计算图标排列
  static arrangeIconsInFolder(
    icons: DesktopIcon[],
    folderSize: Size,
    iconSize: number
  ): IconArrangement;
  
  // 生成图标唯一ID
  static generateIconId(): string;
}
```

## 📖 使用示例

### 基本桌面组件使用

```typescript
import { Desktop, useDesktop } from '@linglongos/desktop-app';

function MyDesktop() {
  const { desktop, actions } = useDesktop();
  
  const handleIconClick = (icon: DesktopIcon) => {
    if (icon.isFolder) {
      // 打开文件夹
      actions.selectIcon(icon.id);
    } else {
      // 启动应用
      windowManager.createWindow({
        title: icon.name,
        contentType: 'component',
        content: AppComponent,
      });
    }
  };
  
  return (
    <Desktop
      onIconClick={handleIconClick}
      onBackgroundClick={(event) => {
        actions.clearSelection();
      }}
      config={{
        grid: {
          size: 64,
          visible: false,
          snapToGrid: true,
        },
        background: {
          type: 'image',
          value: '/images/wallpaper.jpg',
          stretch: true,
        },
        performance: {
          virtualized: true,
          maxVisibleIcons: 100,
          animationEnabled: true,
        },
      }}
    />
  );
}
```

### 拖拽功能实现

```typescript
import { useDrag, useDrop } from 'react-dnd';

function DraggableIcon({ icon }: { icon: DesktopIcon }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'desktop-icon',
    item: { id: icon.id, type: 'icon', data: icon },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  return (
    <div
      ref={drag}
      className={`desktop-icon ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: icon.position.x,
        top: icon.position.y,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <img src={icon.icon} alt={icon.name} />
      <span>{icon.name}</span>
    </div>
  );
}

function DesktopDropZone({ onIconDrop }: { onIconDrop: (iconId: string) => void }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'desktop-icon',
    drop: (item: DragItem) => {
      onIconDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return (
    <div
      ref={drop}
      className={`desktop-drop-zone ${isOver && canDrop ? 'over' : ''}`}
    >
      {isOver && canDrop && '释放图标'}
    </div>
  );
}
```

### 窗口管理实现

```typescript
import { useWindowManager } from '@linglongos/desktop-app';

function WindowManagerExample() {
  const { windows, activeWindowId, actions } = useWindowManager();
  
  const handleCreateWindow = () => {
    const windowId = actions.createWindow({
      title: '新窗口',
      size: { width: 800, height: 600 },
      contentType: 'component',
      content: MyComponent,
      options: {
        resizable: true,
        minimizable: true,
        maximizable: true,
      },
    });
    
    // 设置焦点
    actions.focusWindow(windowId);
  };
  
  return (
    <div className="window-manager">
      {windows.map((window) => (
        <DesktopWindow
          key={window.id}
          window={window}
          isActive={window.id === activeWindowId}
          onClose={() => actions.closeWindow(window.id)}
          onFocus={() => actions.focusWindow(window.id)}
          onMove={(position) => actions.moveWindow(window.id, position)}
          onResize={(size) => actions.resizeWindow(window.id, size)}
        />
      ))}
      
      <button onClick={handleCreateWindow}>创建窗口</button>
    </div>
  );
}
```

---

*更多API详细信息请参考源代码注释和类型定义文件。*