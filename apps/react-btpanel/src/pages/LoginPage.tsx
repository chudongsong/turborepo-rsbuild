import { useState } from 'react'
import { useAppStore } from '../store/app'
import { Button } from '@turbo/ui'

export function LoginPage() {
	const [name, setName] = useState('')
	const setUser = useAppStore(s => s.setUser)

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">登录</h1>
			<div className="flex items-center gap-2">
				<input className="border rounded-md px-3 py-2" placeholder="用户名" value={name} onChange={e => setName(e.target.value)} />
				<Button onClick={() => setUser(name || 'Guest')}>登录</Button>
			</div>
		</div>
	)
}
