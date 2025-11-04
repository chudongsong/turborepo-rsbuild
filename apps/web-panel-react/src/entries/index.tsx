import React from 'react'
import { createRoot } from 'react-dom/client'
import { useTitle, useWindowSize } from 'react-use'
import '@turbo/ui/styles'
import '../index.css'
import { DefaultPage } from '../pages/DefaultPage'
import { Nav } from '../shared/Nav'

function Page() {
	useTitle('首页 - React BTPanel')
	const { width } = useWindowSize()
	return (
		<div className="min-h-screen">
			<Nav />
			<div className="container mx-auto p-4 space-y-2">
				<DefaultPage />
				<div className="text-xs text-gray-500">窗口宽度：{Math.round(width)}px</div>
			</div>
		</div>
	)
}

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	<React.StrictMode>
		<Page />
	</React.StrictMode>
)
