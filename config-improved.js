// 改善されたAPI設定管理
const CONFIG = {
    // 開発環境での自動検出
    DEV_DOMAINS: [
        'localhost:3000',
        'localhost:8000', 
        '127.0.0.1:3000',
        '127.0.0.1:8000'
    ],
    
    // 本番環境のドメイン（デプロイ時に設定）
    PROD_DOMAIN: '', // 例: 'your-app.netlify.app'
    
    getApiKey: function() {
        // 1. URLパラメータから取得（開発時の便利機能）
        const urlParams = new URLSearchParams(window.location.search);
        const urlApiKey = urlParams.get('api_key');
        if (urlApiKey) {
            this.setApiKey(urlApiKey);
            // URLから削除してリロード（セキュリティ）
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            return urlApiKey;
        }
        
        // 2. ローカルストレージから取得
        const storedKey = localStorage.getItem('google_maps_api_key');
        if (storedKey) {
            return storedKey;
        }
        
        // 3. 環境変数から取得（本番環境）
        if (typeof process !== 'undefined' && process.env && process.env.GOOGLE_MAPS_API_KEY) {
            return process.env.GOOGLE_MAPS_API_KEY;
        }
        
        // 4. 開発環境での簡易設定
        if (this.isDevelopment()) {
            const saved = this.getDevApiKey();
            if (saved) return saved;
        }
        
        return null;
    },
    
    // 開発環境かどうかを判定
    isDevelopment: function() {
        const hostname = window.location.hostname;
        const port = window.location.port;
        const host = port ? `${hostname}:${port}` : hostname;
        
        return this.DEV_DOMAINS.includes(host) || 
               hostname === 'localhost' || 
               hostname === '127.0.0.1';
    },
    
    // 開発環境用の簡易APIキー保存
    getDevApiKey: function() {
        return localStorage.getItem('dev_google_maps_api_key');
    },
    
    setDevApiKey: function(apiKey) {
        if (this.isDevelopment() && apiKey && apiKey.trim()) {
            localStorage.setItem('dev_google_maps_api_key', apiKey.trim());
            return true;
        }
        return false;
    },
    
    // APIキーを設定
    setApiKey: function(apiKey) {
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('google_maps_api_key', apiKey.trim());
            
            // 開発環境では開発用にも保存
            if (this.isDevelopment()) {
                this.setDevApiKey(apiKey.trim());
            }
            
            return true;
        }
        return false;
    },
    
    // APIキーをクリア
    clearApiKey: function() {
        localStorage.removeItem('google_maps_api_key');
        localStorage.removeItem('dev_google_maps_api_key');
    },
    
    // 設定状況を表示
    getConfigInfo: function() {
        return {
            isDevelopment: this.isDevelopment(),
            hasStoredKey: !!localStorage.getItem('google_maps_api_key'),
            hasDevKey: !!this.getDevApiKey(),
            currentDomain: window.location.host
        };
    }
};