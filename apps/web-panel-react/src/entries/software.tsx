import React from 'react'
import { createRoot } from 'react-dom/client'
import { useTitle } from 'react-use'
import '../index.css'
import { SoftwarePage } from '../pages/SoftwarePage'
import { Nav } from '../shared/Nav'

function Page() {
	useTitle('软件兼容 - React BTPanel')
	return (
		<div className="min-h-screen">
			<Nav />
			<div className="container mx-auto p-4">
				<SoftwarePage />
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
