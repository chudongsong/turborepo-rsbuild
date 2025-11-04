import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const customCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-lg border-0",
        outlined: "border-2 border-primary",
        gradient: "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface CustomCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customCardVariants> {
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
}

/**
 * CustomCard - 增强版卡片组件
 * 
 * 基于 shadcn/ui Card 组件构建，提供额外的变体和功能
 * 
 * @param title - 卡片标题
 * @param description - 卡片描述
 * @param children - 卡片内容
 * @param footer - 自定义页脚内容
 * @param actionLabel - 操作按钮文本
 * @param onAction - 操作按钮点击回调
 * @param loading - 加载状态
 * @param variant - 卡片变体样式
 * @param size - 卡片尺寸
 */
const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    title, 
    description, 
    children, 
    footer, 
    actionLabel, 
    onAction, 
    loading = false,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(customCardVariants({ variant, size, className }))}
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
        
        {(footer || actionLabel) && (
          <CardFooter className="flex justify-between items-center">
            <div className="flex-1">
              {footer}
            </div>
            {actionLabel && (
              <Button 
                onClick={onAction}
                disabled={loading}
                variant="default"
                size="sm"
              >
                {loading ? "加载中..." : actionLabel}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }
)

CustomCard.displayName = "CustomCard"

export { CustomCard, customCardVariants }