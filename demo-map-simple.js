// デモ用マップ実装
class DemoMap {
    constructor() {
        this.selectedLocation = null;
        this.endLocation = null;
        this.markers = [];
        this.directionsRenderer = null;
    }
    
    // 初期化
    init() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = `
            <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(45deg, #e8f5e8, #f0f8f0);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                border-radius: 10px;
                overflow: hidden;
            ">
                <div style="text-align: center; z-index: 2;">
                    <h2 style="color: #4CAF50; margin-bottom: 20px;">🗺️ デモマップ</h2>
                    <p style="color: #666; margin-bottom: 20px;">実際のGoogle Mapsの代わりにデモ画面を表示しています</p>
                    <div style="
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin: 20px;
                        max-width: 400px;
                    ">
                        <h3 style="color: #333; margin-top: 0;">💡 実際の機能</h3>
                        <ul style="text-align: left; color: #555;">
                            <li>Google Maps API連携</li>
                            <li>クリックで地点選択</li>
                            <li>ルート自動生成</li>
                            <li>距離・時間計算</li>
                            <li>3種類のコースタイプ</li>
                        </ul>
                    </div>
                    <button onclick="demoMap.simulateClick()" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        margin: 5px;
                    ">デモ地点を選択</button>
                </div>
                
                <!-- 背景の装飾 -->
                <div style="
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 60px;
                    height: 60px;
                    background: #4CAF50;
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    width: 80px;
                    height: 80px;
                    background: #FF6B6B;
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 10px;
                    width: 40px;
                    height: 40px;
                    background: #2196F3;
                    border-radius: 50%;
                    opacity: 0.1;
                "></div>
            </div>
        `;
        
        this.addClickListener();
        console.log('デモマップを初期化しました');
    }
    
    addClickListener() {
        const mapContainer = document.getElementById('map');
        mapContainer.addEventListener('click', (e) => {
            // マップコンテナ内のクリックを処理
            if (e.target.tagName !== 'BUTTON') {
                this.simulateClick(e);
            }
        });
    }
    
    // デモ用のクリック処理
    simulateClick(event) {
        // 東京周辺のランダムな地点を生成
        const demoLocations = [
            { lat: 35.6812, lng: 139.7671, name: "東京駅" },
            { lat: 35.6585, lng: 139.7454, name: "新宿" },
            { lat: 35.6938, lng: 139.7034, name: "池袋" },
            { lat: 35.7100, lng: 139.8107, name: "上野" },
            { lat: 35.6284, lng: 139.7361, name: "渋谷" }
        ];
        
        const location = demoLocations[Math.floor(Math.random() * demoLocations.length)];
        
        // 実際のアプリの関数を呼び出し
        if (window.handleMapClick) {
            // Google Maps LatLng オブジェクトをモック
            const mockLatLng = {
                lat: () => location.lat,
                lng: () => location.lng
            };
            window.handleMapClick(mockLatLng);
        }
        
        console.log(`デモ地点選択: ${location.name}`);
    }
    
    // デモ用のルート生成
    generateDemoRoute(callback) {
        setTimeout(() => {
            const mockResult = {
                routes: [{
                    legs: [{
                        distance: { value: Math.random() * 3000 + 2000 }, // 2-5km
                        duration: { value: Math.random() * 1800 + 600 }   // 10-40分
                    }]
                }]
            };
            callback(mockResult);
        }, 1000); // 1秒の擬似遅延
    }
}

// グローバル変数
let demoMap;

// 初期化関数（元のinitMapを置き換え）
function initMap() {
    if (CONFIG.isDemoMode()) {
        demoMap = new DemoMap();
        demoMap.init();
        
        // デモモード用のメッセージを表示
        showDemoMessage();
    } else {
        // 通常のGoogle Maps初期化
        initGoogleMap();
    }
}

function showDemoMessage() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        background: linear-gradient(135deg, #FF6B6B, #FF5252);
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
        <strong>🎭 ポートフォリオ デモモード</strong><br>
        <small>実際の動作は Google Maps API が必要です。開発版をローカルで確認してください。</small>
    `;
    
    const container = document.querySelector('.container');
    const firstChild = container.firstElementChild;
    container.insertBefore(banner, firstChild.nextElementSibling);
}

// 通常のGoogle Maps初期化（元のコード）
function initGoogleMap() {
    // 元のindex.htmlのinitMap関数の内容をここに
    console.log('Google Maps を初期化中...');
    // ... 元のコード
}