// ポートフォリオ用デモ設定
const CONFIG = {
    // デモモード判定
    isDemoMode: function() {
        // GitHub Pagesのみデモモード（他は本番モード）
        const demoHosts = [
            'github.io'
            // 'netlify.app',  // コメントアウト = 本番モード
            // 'vercel.app',   // コメントアウト = 本番モード
            // 'surge.sh',
            // 'pages.dev'
        ];
        
        const hostname = window.location.hostname;
        return demoHosts.some(host => hostname.includes(host)) || 
               hostname === 'localhost' && window.location.search.includes('demo=true');
    },
    
    getApiKey: function() {
        // デモモードの場合は専用処理
        if (this.isDemoMode()) {
            return 'DEMO_MODE';
        }
        
        // 通常のAPIキー取得処理
        const storedKey = localStorage.getItem('google_maps_api_key');
        if (storedKey) {
            return storedKey;
        }
        
        return null;
    },
    
    setApiKey: function(apiKey) {
        if (this.isDemoMode()) {
            alert('デモモードではAPIキーの設定はできません。\n実際の動作は開発版をローカルで実行してください。');
            return false;
        }
        
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('google_maps_api_key', apiKey.trim());
            return true;
        }
        return false;
    },
    
    clearApiKey: function() {
        if (this.isDemoMode()) {
            alert('デモモードです。');
            return;
        }
        localStorage.removeItem('google_maps_api_key');
    }
};