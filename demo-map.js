// 改良版デモマップ - リアルな動作シミュレーション
class InteractiveDemoMap {
    constructor() {
        this.selectedLocation = null;
        this.endLocation = null;
        this.markers = [];
        this.isGenerating = false;
        this.demoRoutes = this.createDemoRoutes();
    }
    
    // デモ用のルートデータ
    createDemoRoutes() {
        return {
            loop: {
                distance: 4.8,
                duration: 24,
                path: [
                    {lat: 35.6812, lng: 139.7671},
                    {lat: 35.6820, lng: 139.7680},
                    {lat: 35.6830, lng: 139.7690},
                    {lat: 35.6825, lng: 139.7700},
                    {lat: 35.6815, lng: 139.7685},
                    {lat: 35.6812, lng: 139.7671}
                ]
            },
            outAndBack: {
                distance: 6.2,
                duration: 31,
                path: [
                    {lat: 35.6812, lng: 139.7671},
                    {lat: 35.6850, lng: 139.7720},
                    {lat: 35.6880, lng: 139.7750},
                    {lat: 35.6850, lng: 139.7720},
                    {lat: 35.6812, lng: 139.7671}
                ]
            },
            pointToPoint: {
                distance: 3.5,
                duration: 18,
                path: [
                    {lat: 35.6812, lng: 139.7671},
                    {lat: 35.6835, lng: 139.7695},
                    {lat: 35.6860, lng: 139.7720}
                ]
            }
        };
    }
    
    init() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = this.createMapHTML();
        this.setupEventListeners();
        this.animateInitialView();
    }
    
    createMapHTML() {
        return `
            <div class="demo-map-container">
                <!-- 地図風の背景 -->
                <div class="map-background">
                    <div class="map-grid"></div>
                    
                    <!-- 地名表示 -->
                    <div class="location-label" style="top: 20%; left: 30%;">東京駅</div>
                    <div class="location-label" style="top: 40%; left: 60%;">銀座</div>
                    <div class="location-label" style="top: 60%; left: 25%;">有楽町</div>
                    
                    <!-- 道路風のライン -->
                    <svg class="road-lines" width="100%" height="100%">
                        <path d="M50,100 Q200,150 350,200 Q450,250 550,200" stroke="#ddd" stroke-width="3" fill="none"/>
                        <path d="M100,50 L400,400" stroke="#ddd" stroke-width="2" fill="none"/>
                        <path d="M0,300 Q200,280 400,300 Q550,320 600,300" stroke="#ddd" stroke-width="2" fill="none"/>
                    </svg>
                    
                    <!-- マーカー表示エリア -->
                    <div id="demo-markers"></div>
                    
                    <!-- ルート表示エリア -->
                    <svg id="demo-route" class="route-display" width="100%" height="100%"></svg>
                </div>
                
                <!-- インタラクション用オーバーレイ -->
                <div class="map-overlay" onclick="demoMap.handleMapClick(event)">
                    <div class="click-hint ${this.selectedLocation ? 'hidden' : ''}">
                        <div class="pulse-dot"></div>
                        <span>地図をクリックしてスタート地点を選択</span>
                    </div>
                </div>
                
                <!-- 右下の操作説明 -->
                <div class="demo-controls">
                    <div class="demo-status" id="demo-status">地図をクリックしてください</div>
                </div>
            </div>
            
            <style>
                .demo-map-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #f0f8f0, #e8f5e8);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .map-background {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 30% 40%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, rgba(33, 150, 243, 0.1) 0%, transparent 50%);
                }
                
                .map-grid {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    opacity: 0.3;
                }
                
                .location-label {
                    position: absolute;
                    background: rgba(255,255,255,0.9);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #333;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .road-lines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0.6;
                }
                
                .map-overlay {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    cursor: crosshair;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .click-hint {
                    text-align: center;
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                }
                
                .click-hint.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                
                .pulse-dot {
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .demo-marker {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    background: #4CAF50;
                    border: 3px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg) translate(-50%, -50%);
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                    animation: dropIn 0.6s ease-out;
                }
                
                .demo-marker.end {
                    background: #F44336;
                }
                
                .demo-marker::after {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                }
                
                @keyframes dropIn {
                    0% { transform: rotate(-45deg) translate(-50%, -50%) scale(0) translateY(-100px); }
                    80% { transform: rotate(-45deg) translate(-50%, -50%) scale(1.1) translateY(0); }
                    100% { transform: rotate(-45deg) translate(-50%, -50%) scale(1) translateY(0); }
                }
                
                .route-display {
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                }
                
                .demo-controls {
                    position: absolute;
                    bottom: 15px;
                    right: 15px;
                    background: rgba(255,255,255,0.95);
                    padding: 10px 15px;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                
                .demo-status {
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                }
                
                .route-line {
                    stroke: #FF6B6B;
                    stroke-width: 4;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: drawRoute 2s ease-in-out forwards;
                }
                
                @keyframes drawRoute {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            </style>
        `;
    }
    
    setupEventListeners() {
        // 既存のボタンイベントをオーバーライド
        const generateBtn = document.getElementById('generateRoute');
        const clearBtn = document.getElementById('clearRoute');
        
        if (generateBtn) {
            generateBtn.onclick = () => this.generateDemoRoute();
        }
        if (clearBtn) {
            clearBtn.onclick = () => this.clearDemo();
        }
    }
    
    animateInitialView() {
        // 初期アニメーション
        setTimeout(() => {
            document.querySelector('.click-hint')?.classList.add('animate');
        }, 500);
    }
    
    handleMapClick(event) {
        if (this.isGenerating) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // クリック位置を百分率で計算
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        
        const routeType = document.getElementById('routeType').value;
        
        if (!this.selectedLocation) {
            this.addMarker(percentX, percentY, 'start');
            this.selectedLocation = {x: percentX, y: percentY};
            
            // UIを更新
            document.getElementById('selectedPoint').textContent = 
                `スタート地点: 東京駅周辺 (${percentX.toFixed(1)}%, ${percentY.toFixed(1)}%)`;
            
            // ヒントを隠す
            document.querySelector('.click-hint')?.classList.add('hidden');
            document.getElementById('demo-status').textContent = 'スタート地点を設定しました';
            
            if (routeType === 'pointToPoint') {
                document.getElementById('demo-status').textContent = '終点をクリックしてください';
            }
            
            this.updateGenerateButtonState();
        } else if (routeType === 'pointToPoint' && !this.endLocation) {
            this.addMarker(percentX, percentY, 'end');
            this.endLocation = {x: percentX, y: percentY};
            
            document.getElementById('endPointInfo').textContent = 
                `終点: 銀座周辺 (${percentX.toFixed(1)}%, ${percentY.toFixed(1)}%)`;
            document.getElementById('demo-status').textContent = '終点を設定しました';
            
            this.updateGenerateButtonState();
        } else {
            // 新しいスタート地点
            this.clearDemo();
            this.handleMapClick(event);
        }
    }
    
    addMarker(x, y, type = 'start') {
        const markersContainer = document.getElementById('demo-markers');
        const marker = document.createElement('div');
        marker.className = `demo-marker ${type}`;
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
        
        markersContainer.appendChild(marker);
        this.markers.push(marker);
    }
    
    updateGenerateButtonState() {
        const routeType = document.getElementById('routeType').value;
        const generateBtn = document.getElementById('generateRoute');
        
        if (routeType === 'loop' || routeType === 'outAndBack') {
            generateBtn.disabled = !this.selectedLocation;
        } else if (routeType === 'pointToPoint') {
            generateBtn.disabled = !this.selectedLocation || !this.endLocation;
        }
    }
    
    generateDemoRoute() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        const generateBtn = document.getElementById('generateRoute');
        generateBtn.textContent = '生成中...';
        generateBtn.disabled = true;
        
        document.getElementById('demo-status').textContent = 'ルートを生成しています...';
        
        // 生成遅延をシミュレート
        setTimeout(() => {
            this.drawDemoRoute();
            this.showRouteInfo();
            
            generateBtn.textContent = 'コース生成';
            this.isGenerating = false;
            this.updateGenerateButtonState();
            
            document.getElementById('demo-status').textContent = 'ルート生成完了！';
        }, 1500);
    }
    
    drawDemoRoute() {
        const routeType = document.getElementById('routeType').value;
        const routeSvg = document.getElementById('demo-route');
        const route = this.demoRoutes[routeType];
        
        // SVGパスを生成
        let pathData = '';
        if (this.selectedLocation) {
            const startX = (this.selectedLocation.x / 100) * routeSvg.clientWidth;
            const startY = (this.selectedLocation.y / 100) * routeSvg.clientHeight;
            
            if (routeType === 'loop') {
                pathData = this.generateLoopPath(startX, startY, routeSvg.clientWidth, routeSvg.clientHeight);
            } else if (routeType === 'outAndBack') {
                pathData = this.generateOutBackPath(startX, startY, routeSvg.clientWidth, routeSvg.clientHeight);
            } else if (routeType === 'pointToPoint' && this.endLocation) {
                const endX = (this.endLocation.x / 100) * routeSvg.clientWidth;
                const endY = (this.endLocation.y / 100) * routeSvg.clientHeight;
                pathData = this.generatePointToPointPath(startX, startY, endX, endY);
            }
        }
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.className = 'route-line';
        
        routeSvg.innerHTML = '';
        routeSvg.appendChild(path);
    }
    
    generateLoopPath(startX, startY, width, height) {
        const radius = Math.min(width, height) * 0.15;
        return `M ${startX} ${startY} 
                Q ${startX + radius} ${startY - radius} ${startX + radius*2} ${startY}
                Q ${startX + radius*2} ${startY + radius} ${startX + radius} ${startY + radius*2}
                Q ${startX} ${startY + radius*2} ${startX - radius} ${startY + radius}
                Q ${startX - radius} ${startY} ${startX} ${startY}`;
    }
    
    generateOutBackPath(startX, startY, width, height) {
        const endX = startX + width * 0.3;
        const endY = startY - height * 0.2;
        return `M ${startX} ${startY} 
                Q ${startX + 50} ${startY - 30} ${endX} ${endY}
                Q ${startX + 50} ${startY - 30} ${startX} ${startY}`;
    }
    
    generatePointToPointPath(startX, startY, endX, endY) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 50;
        return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    }
    
    showRouteInfo() {
        const routeType = document.getElementById('routeType').value;
        const route = this.demoRoutes[routeType];
        const distance = parseFloat(document.getElementById('distance').value) || route.distance;
        
        // 実際のルート情報表示機能を呼び出し
        const mockResult = {
            routes: [{
                legs: [{
                    distance: { value: distance * 1000 },
                    duration: { value: route.duration * 60 }
                }]
            }]
        };
        
        if (window.displayRouteInfo) {
            window.displayRouteInfo(mockResult);
        }
    }
    
    clearDemo() {
        // マーカーをクリア
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        
        // ルートをクリア
        document.getElementById('demo-route').innerHTML = '';
        
        // 状態をリセット
        this.selectedLocation = null;
        this.endLocation = null;
        this.isGenerating = false;
        
        // UIをリセット
        document.getElementById('selectedPoint').textContent = '地図上をクリックしてスタート地点を選択してください';
        document.getElementById('endPointInfo').textContent = '地図上をもう一度クリックして終点を選択してください';
        document.getElementById('demo-status').textContent = '地図をクリックしてください';
        document.querySelector('.click-hint')?.classList.remove('hidden');
        
        // ボタン状態を更新
        this.updateGenerateButtonState();
        
        // ルート情報を隠す
        document.getElementById('routeInfo').style.display = 'none';
    }
}

// 既存のinitMap関数を置き換え
function initMap() {
    if (CONFIG.isDemoMode()) {
        window.demoMap = new InteractiveDemoMap();
        window.demoMap.init();
        showDemoMessage();
    } else {
        initGoogleMap();
    }
}

function showDemoMessage() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
        <strong>🎭 インタラクティブ デモ</strong><br>
        <small>実際の操作を体験できます。本番版では Google Maps API を使用します。</small>
    `;
    
    const container = document.querySelector('.container');
    const firstChild = container.firstElementChild;
    container.insertBefore(banner, firstChild.nextElementSibling);
}