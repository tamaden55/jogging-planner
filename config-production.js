// Google Maps API設定
// セキュリティ: APIキーはここに直接書かず、以下の方法で設定してください

const CONFIG = {
    // 開発用: ローカルストレージから取得
    getApiKey: function() {
        // 1. ローカルストレージから取得を試行
        const storedKey = localStorage.getItem('google_maps_api_key');
        if (storedKey) {
            return storedKey;
        }
        
        // 2. 環境変数から取得（サーバーサイドの場合）
        if (typeof process !== 'undefined' && process.env && process.env.GOOGLE_MAPS_API_KEY) {
            return process.env.GOOGLE_MAPS_API_KEY;
        }
        
        // 3. プロンプトで入力を求める
        const apiKey = prompt('Google Maps APIキーを入力してください:');
        if (apiKey) {
            localStorage.setItem('google_maps_api_key', apiKey);
            return apiKey;
        }
        
        return null;
    },
    
    // APIキーを設定する関数
    setApiKey: function(apiKey) {
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('google_maps_api_key', apiKey.trim());
            return true;
        }
        return false;
    },
    
    // APIキーをクリアする関数
    clearApiKey: function() {
        localStorage.removeItem('google_maps_api_key');
    }
};