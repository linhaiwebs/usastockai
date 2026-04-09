'use client'

/**
 * 页脚组件
 */
export function Footer() {
  return (
    <footer className="py-8 border-t border-gray-700">
      <div className="text-center">
        <p className="text-text-secondary text-sm mb-2">
          © 2024 Stock AI Diagnostic System
        </p>
        <p className="text-text-secondary text-xs">
          仅供学习和参考，不构成投资建议
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-text-secondary">
          <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">使用条款</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">联系我们</a>
        </div>
      </div>
    </footer>
  )
}
