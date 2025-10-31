const path = require('path')

module.exports = {
	root: true,
	/* 指定如何解析语法。 */
	parser: 'vue-eslint-parser',
	/* 优先级低于parse的语法解析配置 */
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['vue', '@typescript-eslint'],
	extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'airbnb-base', 'plugin:prettier/recommended', './types/.eslintrc-auto-import.json'],
	env: {
		browser: true,
		es2021: true,
		node: true,
		'vue/setup-compiler-macros': true,
	},
	globals: {
		AnyObject: 'readonly',
		AnyFunction: 'readonly',
		vite_public_title: 'readonly',
		vite_public_encryption: 'readonly',
		vite_public_login_token: 'readonly',
		vite_public_login_check: 'readonly',
		vite_public_hosts_list: 'readonly',
		vite_public_menu: 'readonly',
	},
	settings: {
		'import/resolver': {
			typescript: {
				project: path.resolve(__dirname, './tsconfig.json'),
			},
		},
	},
	rules: {
		'prettier/prettier': 0,
		'no-empty': 0, // 允许空语句块
		'no-shadow': 0, // 允许外部作用域重复声明变量
		'no-console': 0, // 允许console
		'no-new': 0, // 允许new Object
		'func-names': 0, // 允许匿名函数
		'no-continue': 0, // 允许continue
		'default-case': 0, // 允许switch不存在default
		'no-unused-vars': 0, // 允许未使用的变量
		'no-fallthrough': 0, // 允许case落空
		'no-extra-semi': 0, // 分号
		'no-useless-escape': 0, // 正则表达式
		'no-param-reassign': 0, // 允许修改参数
		'prefer-regex-literals': 0, // 正则表达式
		'no-plusplus': [0, { allowForLoopAfterthoughts: true }], // 允许++ --运算符
		'no-use-before-define': [0, { functions: false }], // 允许函数定义前调用
		'no-restricted-syntax': ['error'], // 禁止使用特定的语法
		'no-nested-ternary': 0, // 允许三元表达式嵌套
		'init-declarations': ['error', 'always'], // 声明变量时必须赋值
		'class-methods-use-this': 0, // 允许类方法不使用this
		// vue
		'vue/comment-directive': 0, // 允许注释
		'vue/require-default-prop': 0, // 允许props不设置默认值
		'vue/singleline-html-element-content-newline': 0, // 允许单行元素内容在新的一行
		'vue/max-attributes-per-line': 0, // 允许多个属性在一行
		'vue/custom-event-name-casing': [2, 'camelCase'], // 事件名驼峰
		'vue/no-v-text': 1, // 允许v-text
		'vue/padding-line-between-blocks': 1, // 允许在块之间填充空行
		'vue/require-direct-export': 1, // 允许export default
		'vue/multi-word-component-names': 0, // 允许多个单词的组件名
		'vue/no-v-html': 0, // 允许v-html
		'vue/no-deprecated-dollar-listeners-api': 0, // 允许$on
		'vue/no-deprecated-v-bind-sync': 0, // 允许.sync
		'vue/no-deprecated-v-on-native-modifier': 0, // 允许.native
		'vue/no-v-for-template-key-on-child': 0, // 允许v-for中使用key
		'vue/first-attribute-linebreak': [0, { singleline: 'ignore', multiline: 'ignore' }], // 允许属性换行
		// ts
		'@typescript-eslint/ban-ts-comment': 0, // 允许ts注释
		'@typescript-eslint/no-unused-vars': ['error'], // 禁止未使用的变量
		'@typescript-eslint/no-empty-function': 1, // 允许空函数
		'@typescript-eslint/no-explicit-any': 1, // 允许any
		'@typescript-eslint/no-extra-semi': 0, // 分号
		'@typescript-eslint/no-non-null-assertion': 'off', // 允许使用非空断言
		'@typescript-eslint/no-inferrable-types': 0, // 允许对初始化为数字、字符串或布尔值的变量或参数进行显式类型声明
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'default',
				format: ['camelCase', 'PascalCase'],
			},

			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
			},
			{
				selector: 'parameter',
				format: ['camelCase'],
				leadingUnderscore: 'allow',
			},

			{
				selector: 'memberLike',
				modifiers: ['private'],
				format: ['camelCase'],
				leadingUnderscore: 'require',
			},

			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
		],

		// import
		'import/export': 0, // 允许export
		'import/no-cycle': 0, // 允许循环引用
		'import/no-unresolved': 0, // 允许未解析的路径
		'import/no-absolute-path': 0, // 允许绝对路径
		'import/no-extraneous-dependencies': 0, // 允许devDependencies
		'import/prefer-default-export': 0, // 允许export default
		'import/newline-after-import': [0, { count: 2 }], // 允许import后空行
		'import/extensions': [
			2,
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
	},
}
