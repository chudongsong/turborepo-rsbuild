import axios from 'axios'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/app'
import { Button } from '@turbo/ui'

export function DefaultPage() {
	const [qr, setQr] = useState<string>('')
	const user = useAppStore(s => s.user)

	useEffect(() => {
		QRCode.toDataURL('Hello Rsbuild + React 19').then(setQr).catch(console.error)
	}, [])

	async function ping() {
		try {
			const res = await axios.get('https://api.github.com/rate_limit')
			alert(`GitHub limit: ${res.data.resources.core.limit}`)
		} catch (e) {
			console.error(e)
			alert('请求失败')
		}
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">首页</h1>
			<p>欢迎使用 Rsbuild + React 19 + TanStack Router。</p>
			<div className="flex items-center gap-4">
				<Button onClick={ping}>测试请求</Button>
				{user ? <span>已登录用户：{user}</span> : <span>未登录</span>}
			</div>
			{qr && (
				<div>
					<img src={qr} alt="QR" width={120} height={120} />
				</div>
			)}
		</div>
	)
}
