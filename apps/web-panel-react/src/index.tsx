import { RouterProvider } from '@tanstack/react-router'
import NProgress from 'nprogress'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'nprogress/nprogress.css'
import './index.css'
import { router } from './router'

NProgress.configure({ showSpinner: false }) // 禁用进度条的旋转器

function App() {
	useEffect(() => {
		const unsubscribe = router.subscribe(
			state => state.location,
			() => {
				NProgress.start()
				setTimeout(() => NProgress.done(), 200)
			}
		)
		return () => unsubscribe()
	}, [])
	return <RouterProvider router={router} />
}

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
