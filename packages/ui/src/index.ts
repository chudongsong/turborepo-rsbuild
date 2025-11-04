// 导出样式文件
import "./styles/globals.css"

// 导出 shadcn/ui 组件
export { Button, buttonVariants } from "../components/ui/button"
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
export { Input } from "../components/ui/input"
export { Label } from "../components/ui/label"

// 导出自定义组件
export { CustomCard, customCardVariants } from "../components/custom/custom-card"

// 导出工具函数
export { cn } from "../lib/utils"

// 导出类型定义
export type { ButtonProps } from "../components/ui/button"
export type { CustomCardProps } from "../components/custom/custom-card"