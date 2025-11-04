<template>
	<div>
		<div class="module-ui">
			<div class="text-medium flex justify-between items-center cursor-pointer" @click="setOverview(!hideOverview)">
				<div class="font-bold text-large">资源概览</div>
				<div>
					<!-- <el-button @click="rsyncData">刷新容器列表</el-button> -->
					<!-- <el-button @click="setOverview(!hideOverview)">{{ hideOverview ? '展开CPU、内存总览' : '隐藏CPU、内存总览' }}</el-button> -->
					<span v-show="hideOverview" class="svgtofont-el-arrow-down-bold text-medium"></span>
					<span v-show="!hideOverview" class="svgtofont-el-arrow-up-bold text-medium"></span>
				</div>
			</div>
			<transition name="slide-down" mode="out-in" @after-leave="afterLeave" @before-enter="afterEnter">
				<div v-show="!hideOverview" ref="useMenuRef" class="use-menu-box">
					<div class="use-menu-list">
						<div class="use-menu-card" @click="routerGo('/docker/containers')">
							<div class="card-icon containers-icon">
								<svg t="1750640949761" class="icon" viewBox="0 0 1031 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4657" width="200" height="200">
									<path
										d="M248.332363 1023.995632a21.839416 21.839416 0 0 1-11.374696-3.093917L11.374696 890.684195A22.749392 22.749392 0 0 1 0 871.02872V610.593681a22.931387 22.931387 0 0 1 11.374696-19.746472L236.593677 460.629689a23.022385 23.022385 0 0 1 22.749392 0l225.855963 130.21752a22.931387 22.931387 0 0 1 11.374696 19.746472v260.435039a22.749392 22.749392 0 0 1-11.374696 19.655475l-225.491973 130.21752a22.294404 22.294404 0 0 1-11.374696 3.093917zM45.498784 857.925071l202.833579 117.022872 202.742581-117.022872V623.697331L248.332363 506.674458 45.498784 623.697331z m428.325552 13.103649zM782.579084 1023.995632a22.294404 22.294404 0 0 1-11.374696-3.093917L545.985408 890.684195a22.749392 22.749392 0 0 1-11.374696-19.655475V610.593681A22.931387 22.931387 0 0 1 545.985408 590.847209l225.491973-130.21752a23.022385 23.022385 0 0 1 22.749392 0l225.582971 130.21752a22.931387 22.931387 0 0 1 11.374696 19.746472v260.435039a22.749392 22.749392 0 0 1-11.374696 19.655475l-225.582971 130.21752a21.839416 21.839416 0 0 1-11.647689 3.093917zM580.109496 857.925071L782.579084 974.947943l202.833579-117.022872V623.697331L782.579084 506.674458 580.109496 623.697331z m428.325552 13.103649zM512.862293 566.368863a21.839416 21.839416 0 0 1-11.374696-3.093917L275.904626 433.057426a22.749392 22.749392 0 0 1-11.374696-19.655475V152.966912a22.931387 22.931387 0 0 1 11.374696-19.746473L501.487597 3.00292a23.022385 23.022385 0 0 1 22.749392 0l225.491973 130.217519a22.931387 22.931387 0 0 1 11.374696 19.746473v260.435039a22.749392 22.749392 0 0 1-11.374696 19.655475L524.236989 563.274946a22.294404 22.294404 0 0 1-11.374696 3.093917zM310.028714 400.389299l202.833579 116.931875L715.604874 400.389299V166.070562L512.862293 49.047689 310.028714 166.070562z m428.325552 13.10365z"
										p-id="4658"
										fill="#409eff"></path>
									<path
										d="M512.862293 297.380052a23.295377 23.295377 0 0 1-11.465694-3.093917l-142.593189-82.443797a22.749392 22.749392 0 0 1 0-39.401947L501.396599 89.996595a23.20438 23.20438 0 0 1 22.84039 0L666.830178 172.895379a22.749392 22.749392 0 0 1 0 39.401947l-142.593189 81.988809a23.20438 23.20438 0 0 1-11.374696 3.093917zM415.67689 192.186864l97.185403 56.145499L609.683705 192.186864 512.862293 136.496352zM248.332363 763.560593a22.385402 22.385402 0 0 1-11.738686-3.093918l-142.593189-81.897811a22.931387 22.931387 0 0 1-11.374696-19.746472 22.749392 22.749392 0 0 1 11.374696-19.655475L236.593677 556.268133a22.749392 22.749392 0 0 1 22.840389 0l142.593189 82.443796a22.749392 22.749392 0 0 1 11.374696 19.655475 22.931387 22.931387 0 0 1-11.374696 19.746472l-142.593189 81.897812a22.294404 22.294404 0 0 1-11.101703 3.548905zM151.14696 658.367404l97.185403 56.1455L345.790758 658.367404l-97.458395-56.145499zM782.579084 763.560593a22.294404 22.294404 0 0 1-11.374696-3.093918l-142.593189-81.897811a22.931387 22.931387 0 0 1-11.374696-19.746472 22.749392 22.749392 0 0 1 11.374696-19.655475l142.593189-82.443796a22.749392 22.749392 0 0 1 22.84039 0L937.27495 638.711929a22.749392 22.749392 0 0 1 11.374696 19.655475 22.931387 22.931387 0 0 1-11.374696 19.746472l-142.593189 81.897812a22.385402 22.385402 0 0 1-12.102677 3.548905zM685.757672 658.367404L782.579084 714.512904l97.185403-56.1455L782.579084 602.221905z"
										p-id="4659"
										fill="#409eff"></path>
								</svg>
							</div>
							<div class="use-title">容器数量</div>
							<div class="use-content">{{ overflowList.containers.total }}</div>
							<div class="use-subtitle">
								占用空间<span>{{ overflowList.containers.size }}</span>
							</div>
						</div>
						<div class="use-menu-card" @click="routerGo('/docker/orchestration')">
							<div class="card-icon composes-icon">
								<svg t="1750641044372" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5832" width="200" height="200">
									<path
										d="M232.96 15.36H41.984C18.944 15.36 0 34.304 0 57.344v190.976c0 23.04 18.944 41.984 41.984 41.984h190.976c23.04 0 41.984-18.944 41.984-41.984V57.344c0.512-23.04-18.432-41.984-41.984-41.984z m-1.024 219.136c0 7.168-6.144 12.288-12.8 12.288H56.32c-7.168 0-12.8-6.144-12.8-12.288V71.68c0-7.168 6.144-12.288 12.8-12.288h162.816c7.168 0 12.8 6.144 12.8 12.288v162.816zM232.96 370.688H41.984c-23.04 0-41.984 18.944-41.984 41.984v190.976c0 23.04 18.944 41.984 41.984 41.984h190.976c23.04 0 41.984-18.944 41.984-41.984V412.16c0.512-23.552-18.432-41.472-41.984-41.472z m-1.024 218.624c0 7.168-6.144 12.288-12.8 12.288H56.32c-7.168 0-12.8-6.144-12.8-12.288V425.984c0-7.168 6.144-12.288 12.8-12.288h162.816c7.168 0 12.8 6.144 12.8 12.288v163.328zM232.96 724.992H41.984c-23.04 0-41.984 18.944-41.984 41.984v190.976c0 23.04 18.944 41.984 41.984 41.984h190.976c23.04 0 41.984-18.944 41.984-41.984v-190.976c0.512-23.04-18.432-41.984-41.984-41.984z m-1.024 219.136c0 7.168-6.144 12.288-12.8 12.288H56.32c-7.168 0-12.8-6.144-12.8-12.288v-162.816c0-7.168 6.144-12.288 12.8-12.288h162.816c7.168 0 12.8 6.144 12.8 12.288v162.816zM982.016 15.36H397.312c-23.04 0-41.984 18.944-41.984 41.984v190.976c0 23.04 18.944 41.984 41.984 41.984h584.704c23.04 0 41.984-18.944 41.984-41.984V57.344c-0.512-23.04-18.944-41.984-41.984-41.984z m-2.048 219.136c0 7.168-6.144 12.288-12.8 12.288H411.136c-7.168 0-12.8-6.144-12.8-12.288V71.68c0-7.168 6.144-12.288 12.8-12.288H967.68c7.168 0 12.8 6.144 12.8 12.288v162.816h-0.512zM982.016 370.688H397.312c-23.04 0-41.984 18.944-41.984 41.984v190.976c0 23.04 18.944 41.984 41.984 41.984h584.704c23.04 0 41.984-18.944 41.984-41.984V412.16c-0.512-23.552-18.944-41.472-41.984-41.472z m-2.048 218.624c0 7.168-6.144 12.288-12.8 12.288H411.136c-7.168 0-12.8-6.144-12.8-12.288V425.984c0-7.168 6.144-12.288 12.8-12.288H967.68c7.168 0 12.8 6.144 12.8 12.288v163.328h-0.512zM982.016 724.992H397.312c-23.04 0-41.984 18.944-41.984 41.984v190.976c0 23.04 18.944 41.984 41.984 41.984h584.704c23.04 0 41.984-18.944 41.984-41.984v-190.976c-0.512-23.04-18.944-41.984-41.984-41.984z m-2.048 219.136c0 7.168-6.144 12.288-12.8 12.288H411.136c-7.168 0-12.8-6.144-12.8-12.288v-162.816c0-7.168 6.144-12.288 12.8-12.288H967.68c7.168 0 12.8 6.144 12.8 12.288v162.816h-0.512z"
										fill="var(--el-color-primary)"
										p-id="5833"></path>
								</svg>
							</div>
							<div class="use-title">编排数量</div>
							<div class="use-content">{{ overflowList.composes.total }}</div>
							<div class="use-subtitle">Docker Compose 项目</div>
						</div>
						<div class="use-menu-card" @click="routerGo('/docker/images')">
							<div class="card-icon images-icon">
								<svg t="1750641093279" class="icon" viewBox="0 0 1117 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6884" width="200" height="200">
									<path
										d="M442.898361 116.049051l2.23404 0.74468L74.840328 1.368349A61.901515 61.901515 0 0 0 0 61.966675v883.283427a61.9946 61.9946 0 0 0 74.840328 60.598326l379.507486-118.124847a77.074368 77.074368 0 0 0 41.981329-68.510549V189.58619a77.539793 77.539793 0 0 0-53.430782-73.537139zM403.244157 792.218386L93.084986 874.412428V132.618179l310.159171 82.380212v577.12691zM1054.466716 0.065159a77.260538 77.260538 0 0 0-12.845728 1.30319L675.796995 115.490542l1.30319-0.18617a77.446708 77.446708 0 0 0-56.968012 74.467988v629.161417c0 29.88028 17.034552 55.850991 41.981329 68.696719l379.228231 118.217932a61.9946 61.9946 0 0 0 75.026498-60.691411V61.966675a61.529175 61.529175 0 0 0-61.901515-61.808431z"
										fill="var(--el-color-primary)"
										opacity=".801"
										p-id="6885"></path>
								</svg>
							</div>
							<div class="use-title">镜像数量</div>
							<div class="use-content">{{ overflowList.images.total }}</div>
							<div class="use-subtitle">
								占用空间<span>{{ overflowList.images.size }}</span>
							</div>
						</div>
						<div class="use-menu-card" @click="routerGo('/docker/network')">
							<div class="card-icon networks-icon">
								<svg t="1750641121238" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8080" width="200" height="200">
									<path
										d="M372.305 745.773C403.023 787.057 441.673 822.09 486 848.615v-127.74c-39.818 2.647-78.01 11.24-113.695 24.898z m-51.609 24.217a392.912 392.912 0 0 0-60.194 41.64h-1.271c56.974 48.113 127.858 80.27 205.76 89.58-57.186-32.69-106.475-77.62-144.295-131.22zM295.985 540c4.004 56.745 20.087 110.155 45.691 157.675 44.903-18.522 93.476-29.956 144.324-32.91V540H295.985z m-56.124 0H120.985c6.296 89.215 42.447 170.188 98.523 232.989a449.204 449.204 0 0 1 71.8-50.725C262.051 667.323 243.903 605.57 239.86 540z m445.864 158.764c25.95-47.793 42.251-101.585 46.29-158.764H541v124.899c51.032 3.215 99.745 14.975 144.725 33.865z m50.207 24.904a449.248 449.248 0 0 1 68.903 48.937c55.88-62.746 91.897-143.571 98.18-232.605H788.138c-4.08 66.13-22.507 128.377-52.206 183.668zM541 849.194c44.394-26.387 83.134-61.292 113.965-102.46-35.735-13.96-74.02-22.825-113.965-25.706v128.166z m23.097 51.374c75.9-10.079 144.941-41.875 200.672-88.937h-0.484a392.964 392.964 0 0 0-57.91-40.348c-37.456 52.683-86.02 96.917-142.278 129.285z m-222.315-574.44c-25.666 47.57-41.787 101.05-45.797 157.872H486V358.884c-50.804-2.916-99.34-14.297-144.218-32.755z m-50.397-24.538a449.186 449.186 0 0 1-71.828-50.634C163.453 313.765 127.283 394.76 120.985 484H239.86c4.047-65.628 22.223-127.432 51.524-182.41zM486 175.385c-44.257 26.483-82.856 61.448-113.551 102.648 35.648 13.593 73.79 22.132 113.551 24.744V175.385z m-21.01-52.595c-77.702 9.286-148.422 41.303-205.321 89.21h0.518a392.903 392.903 0 0 0 60.606 41.872c37.808-53.54 87.06-98.42 144.198-131.082zM654.7 276.878c-30.788-41.016-69.433-75.796-113.7-102.108v127.81c39.849-2.906 78.045-11.77 113.7-25.702z m51.415-24.562A392.966 392.966 0 0 0 763.97 212h0.361c-55.635-46.843-124.483-78.493-200.153-88.558 56.093 32.29 104.535 76.377 141.937 128.874zM732.017 484c-4.045-57.343-20.423-111.282-46.498-159.179C640.6 343.7 591.959 355.465 541 358.712V484h191.017z m56.123 0h114.875c-6.295-89.205-42.439-170.17-98.504-232.968a449.25 449.25 0 0 1-68.79 48.87c29.828 55.4 48.333 117.798 52.42 184.098zM512 960C264.576 960 64 759.424 64 512S264.576 64 512 64s448 200.576 448 448-200.576 448-448 448z"
										fill="var(--el-color-primary)"
										p-id="8081"></path>
								</svg>
							</div>
							<div class="use-title">网络数量</div>
							<div class="use-content">{{ overflowList.networks.total }}</div>
							<div class="use-subtitle">已创建的网络</div>
						</div>
						<div class="use-menu-card" @click="routerGo('/docker/storage')">
							<div class="card-icon volumes-icon">
								<svg t="1750641138362" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9125" width="200" height="200">
									<path
										d="M925.27 269.25V758c0 112.46-185.35 203.64-414 203.64s-414-91.18-414-203.64V269.25c0-112.46 185.34-203.63 414-203.63s414 91.17 414 203.63zM842.47 758V269.25c0-43.07-125.73-122.18-331.18-122.18s-331.18 79.11-331.18 122.18V758c0 43.07 125.73 122.18 331.18 122.18S842.47 801.05 842.47 758z"
										fill="var(--el-color-primary)"
										p-id="9126"></path>
									<path
										d="M925.27 269.25c0 112.47-185.35 203.64-414 203.64s-414-91.17-414-203.64 185.34-203.63 414-203.63 414 91.17 414 203.63z m-82.8 0c0-43.07-125.73-122.18-331.18-122.18s-331.18 79.11-331.18 122.18 125.73 122.18 331.18 122.18 331.18-79.1 331.18-122.18z"
										fill="var(--el-color-primary)"
										p-id="9127"></path>
									<path d="M511.29 554.34c-205.45 0-331.18-79.1-331.18-122.18H97.32c0 112.47 185.34 203.64 414 203.64s414-91.17 414-203.64h-82.8c-0.05 43.08-125.78 122.18-331.23 122.18z" fill="var(--el-color-primary)" p-id="9128"></path>
									<path d="M511.29 717.25c-205.45 0-331.18-79.11-331.18-122.18H97.32c0 112.47 185.34 203.64 414 203.64s414-91.17 414-203.64h-82.8c-0.05 43.07-125.78 122.18-331.23 122.18z" fill="var(--el-color-primary)" p-id="9129"></path>
								</svg>
							</div>
							<div class="use-title">存储卷数量</div>
							<div class="use-content">{{ overflowList.volumes.total }}</div>
							<div class="use-subtitle">
								占用空间<span>{{ overflowList.volumes.size }}</span>
							</div>
						</div>
						<div class="use-menu-card" @click="routerGo('/docker/warehouse')">
							<div class="card-icon mirrors-icon">
								<svg t="1750641157017" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10179" width="200" height="200">
									<path
										d="M528.832 106.432l352 217.92a32 32 0 0 1 15.168 27.2V896a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V351.552a32 32 0 0 1 15.168-27.2l352-217.92a32 32 0 0 1 33.664 0zM512 171.264l-320 198.08V864h640V369.344l-320-198.08z m-253.44 212.832l3.712 0.512 213.344 42.688a32 32 0 0 1 25.504 27.616l0.224 3.744v298.688a32 32 0 0 1-22.08 30.4l-3.648 0.96-213.344 42.688a32 32 0 0 1-38.08-27.68L224 800V416a32 32 0 0 1 34.56-31.904zM800 416v384a32 32 0 0 1-38.272 31.36l-213.344-42.656a32 32 0 0 1-25.728-31.36v-298.688a32 32 0 0 1 25.728-31.36l213.344-42.688A32 32 0 0 1 800 416zM287.968 455.008v305.952l149.344-29.856v-246.24l-149.344-29.856z m448.032 0l-149.344 29.856v246.24L736 760.96v-305.952z"
										p-id="10180"
										fill="var(--el-color-primary)"></path>
								</svg>
							</div>
							<div class="use-title">镜像仓库数量</div>
							<div class="use-content">{{ overflowList.mirrors }}</div>
							<div class="use-subtitle">已配置的仓库</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
		<div class="mt-[12px] module-ui">
			<div>
				<div class="flex justify-between mb-1rem">
					<div class="font-bold text-large">容器列表</div>
					<div class="flex items-center">
						<div class="mr-[1.2rem] w-[10rem]">
							<el-select v-model="filterParams.rule" @change="val => (filterParams.rule = val)">
								<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</div>
						<div class="w-[26rem] mr-[1.2rem]">
							<el-input v-model="filterParams.search" placeholder="搜索容器名称或镜像名">
								<template #prefix>
									<i class="svgtofont-el-search"></i>
								</template>
							</el-input>
						</div>
						<el-button @click="rsyncData">
							<BtIcon icon="el-refresh" />
						</el-button>
					</div>
				</div>
				<div :class="isLoadErr ? 'flex pt-[1.6rem] justify-center items-center' : 'con-grid'" ref="scrollContainer" v-bt-loading="use.loading" v-bt-loading:title="'正在加载运行中的容器列表，请稍候...'" :style="`height:${boxHeight}px;`">
					<div v-for="con in showList" :key="con.id" class="w-full border border-light hover:shadow-[0_0_6px_rgba(0,0,0,.125)] rounded-medium text-small text-tertiary">
						<div class="p-[1.6rem] relative pl-[6.3rem] border-b border-light flex flex-col justify-between">
							<span class="monitor svgtofont-el-monitor" @click="CreateRealMonitorDialog(con)"></span>
							<div class="text-medium leading-[1.5] mb-[.7rem] w-full truncate cursor-pointer font-bold text-default flex items-center justify-between" @click="openContainerDetailView(con)">
								<div class="w-[90%] truncate">
									<bt-ellipsis-tooltip :text="con.name" />
								</div>
								<span class="w-[.8rem] h-[.8rem] rounded-full inline-block" :class="con.status === 'running' ? 'bg-primary' : 'bg-danger'"></span>
							</div>
							<div class="w-full truncate leading-[1.3] text-secondary">
								<bt-ellipsis-tooltip :text="con.image" />
							</div>
							<div class="whitespace-nowrap">创建时间：{{ formatTime(con.created_time) }}</div>
						</div>

						<div class="w-full p-[2rem]">
							<div class="mb-[1rem]">
								<div class="flex items-center justify-between mb-[.6rem]">
									<div class="text-small text-secondary">CPU使用率</div>
									<div
										class="text-small"
										:class="{
											'text-primary': con.cpu_usage < 70,
											'text-warning': con.cpu_usage >= 70 && con.cpu_usage < 90,
											'text-dangerDark': con.cpu_usage >= 90,
										}">
										{{ `${Number(con.cpu_usage)?.toFixed(1)}%` }}
									</div>
									<!-- <div class="text-base" :class="progressColors[con.cpu_usage]">{{`${con.cpu_usage}%`}}</div> -->
								</div>
								<el-progress :percentage="con.cpu_usage" :color="progressColors" :stroke-width="6" :show-text="false" />
							</div>
							<div>
								<div class="flex items-center justify-between mb-[.6rem]">
									<div class="text-small text-secondary">内存使用情况</div>
									<div class="text-small">{{ `${getByteUnit(con.memory_usage?.mem_usage)}/${getByteUnit(con.memory_usage?.mem_limit)}` }}</div>
									<!-- <div class="text-base" :class="progressColors[con.cpu_usage]">{{`${con.cpu_usage}%`}}</div> -->
								</div>
								<el-progress :percentage="con.mem_percent" :color="progressColors" :stroke-width="6" :show-text="false" />
							</div>
							<!-- <div class="chart bg-light">
							<div class="chart-use bg-warning" :style="{ height: `${con.cpu_usage}%` }"></div>
						</div>
						<div class="chart bg-light ml-[2rem]">
							<div class="chart-use bg-supplement" :style="{ height: `${con.mem_percent}%` }"></div>
						</div>
						<div class="h-full w-[12rem] flex flex-col justify-end ml-[3rem] pb-[.3rem]">
							<div class="flex items-center justify-between cpu-before mb-[1rem]">
								CPU <span>{{ con.cpu_usage }}%</span>
							</div>
							<div class="flex items-center justify-between ram-before">
								RAM <span>{{ getByteUnit(con.mem_usage?.mem_usage) }}</span>
							</div>
						</div> -->
						</div>
					</div>
					<el-empty v-show="isLoadErr" :description="use.errmsg"></el-empty>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="tsx">
import { useGlobalStore } from '@store/global'
import { CreateRealMonitorDialog, openContainerDetailView } from '@docker/useMethods'
import { getByteUnit, formatTime } from '@utils/index'
import { useRouter } from 'vue-router'
import { isLoadErr, overflowList, filterParams, typeOptions, showList, hideOverview, use, rsyncData, hideSystemOverview, init, destroy, checkSystemOverview, progressColors } from './useController'

import BtIcon from '@/components/base/bt-icon'

const { mainHeight } = useGlobalStore()
const router = useRouter()

const useMenuRef = ref<HTMLElement | null>(null)
const boxHeight = ref(0)

const setOverview = (status: boolean) => {
	hideSystemOverview(status, useMenuRef)
}

const afterEnter = () => {
	boxHeight.value = mainHeight.value - 470
}

const afterLeave = () => {
	boxHeight.value = mainHeight.value - 280
}

const routerGo = (path: string) => {
	router.push(path)
}

watch(
	mainHeight,
	val => {
		if (val) {
			boxHeight.value = hideOverview.value ? mainHeight.value - 280 : mainHeight.value - 470
		}
	},
	{ immediate: true }
)

onMounted(() => {
	init()
	nextTick(() => {
		checkSystemOverview(useMenuRef)
	})
})

defineExpose({
	init,
	destroy,
})

onUnmounted(() => {
	destroy()
})
</script>

<style lang="css" scoped>
/* 高度过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
	transition: all 0.3s ease;
	overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
	max-height: 0;
	opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
	max-height: 300px; /* 设置一个足够大的max-height值 */
	opacity: 1;
}

.use-menu-box {
	/* transition: all 0.3s ease; */
	padding-top: 1.6rem;
}
.use-menu-list {
	display: grid;
	grid-template-columns: repeat(6, 1fr); /* 默认大屏 6 列 */
	/* grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); */
	gap: 20px;
}
.use-menu-card {
	border-radius: var(--el-border-radius-extra-large);
	padding: 24px;
	box-shadow: 0 0 6px rgba(var(--el-color-black-rgb), 0.125);
	transition: all 0.3s;
	position: relative;
	overflow: hidden;
	cursor: pointer;
}

.card-icon {
	position: absolute;
	bottom: 20px;
	right: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.05;
}

.card-icon svg {
	width: 64px;
	height: 64px;
}

.containers-icon {
	color: var(--el-base-supplement);
}

.composes-icon {
	color: var(--el-color-danger-light-3);
}

.images-icon {
	color: var(--el-base-supplement-light-3);
}

.networks-icon {
	color: var(--el-color-success-light-3);
}

.volumes-icon {
	color: var(--el-color-warning);
}

.mirrors-icon {
	color: var(--el-base-supplement-light-5);
}
.use-title {
	font-size: var(--el-font-size-medium);
	color: var(--el-color-text-secondary);
	font-weight: 500;
	margin-bottom: 1rem;
}
.use-content {
	@apply text-subtitleLarge mb-[1rem];
}
.use-subtitle {
	@apply whitespace-nowrap;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-tertiary);
}
.use-subtitle span {
	@apply text-primary;
}
:deep(.dk-fast-project-icon .icon) {
	height: 100%;
}

.manger-con {
	@apply flex-1;
}
.use-menu {
	transition: height 0.5s;
	@apply flex justify-between h-[10rem] overflow-hidden;
}
.use-box {
	@apply flex items-center px-[2rem] w-[49%] border-1 border-extraLight rounded-large;
}
.chart {
	@apply w-[3rem] h-full relative;
}
.chart-use {
	@apply w-full absolute bottom-0 max-h-[100%];
}
.cpu-before {
	@apply pl-[2rem] relative;
}
.cpu-before:before {
	@apply w-[1.2rem] h-[1.2rem] bg-warning inline-block absolute left-0;
	content: '';
}
.ram-before {
	@apply pl-[2rem] relative;
}
.ram-before:before {
	@apply w-[1.2rem] h-[1.2rem] bg-supplement inline-block absolute left-0;
	content: '';
}
.monitor {
	@apply absolute left-[2rem] top-[1.2rem] text-subtitleLarge cursor-pointer;
}
:deep(.el-progress) {
	@apply flex items-center;
}
.con-grid {
	@apply grid gap-[1.6rem] overflow-y-auto content-start relative p-[1rem];
	grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
}
.manger-foot {
	position: absolute;
	bottom: 15px;
	left: 50%;
	transform: translate(-50%, 0);
}
.description {
	@apply font-bold text-medium;
}

/* 中屏：每行 3 个 */
@media (max-width: 1300px) {
	.use-menu-list {
		grid-template-columns: repeat(3, 1fr);
	}
}

/* 小屏：每行 2 个 */
@media (max-width: 640px) {
	.use-menu-list {
		grid-template-columns: repeat(2, 1fr);
	}
}

/* 极小屏：每行 1 个 */
@media (max-width: 400px) {
	.use-menu-list {
		grid-template-columns: 1fr;
	}
}
</style>
