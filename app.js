// ジョギングコースプランナー - メインアプリケーション

let map;
let directionsService;
let directionsRenderer;
let selectedLocation = null;
let endLocation = null;
let currentRoute = null;
let isSelectingEndPoint = false;

function initMap() {
    // 東京駅を初期位置として設定
    const tokyo = { lat: 35.6812, lng: 139.7671 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: tokyo,
        mapTypeId: "roadmap",
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: false,
        polylineOptions: {
            strokeColor: "#FF6B6B",
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    directionsRenderer.setMap(map);

    // 地図クリックイベントリスナー
    map.addListener("click", (event) => {
        handleMapClick(event.latLng);
    });

    // ユーザーの現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
            },
            () => {
                console.log("位置情報の取得に失敗しました");
            }
        );
    }
}

// ルートタイプ変更時の処理
function handleRouteTypeChange() {
    const routeType = document.getElementById("routeType").value;
    const endPointInfo = document.getElementById("endPointInfo");
    
    if (routeType === "pointToPoint") {
        endPointInfo.style.display = "block";
        if (selectedLocation && !endLocation) {
            isSelectingEndPoint = true;
        }
    } else {
        endPointInfo.style.display = "none";
        endLocation = null;
        isSelectingEndPoint = false;
        
        // 終点マーカーを削除
        if (window.endMarker) {
            window.endMarker.setMap(null);
            window.endMarker = null;
        }
    }
    
    updateGenerateButtonState();
}

// 地図クリック処理
function handleMapClick(location) {
    if (!selectedLocation) {
        setStartLocation(location);
    } else if (isSelectingEndPoint && document.getElementById("routeType").value === "pointToPoint") {
        setEndLocation(location);
    } else {
        setStartLocation(location);
    }
}

function setStartLocation(location) {
    selectedLocation = location;
    
    // 既存のマーカーをクリア
    if (window.startMarker) {
        window.startMarker.setMap(null);
    }

    // 新しいスタートマーカーを配置
    window.startMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: "スタート地点",
        icon: {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%234CAF50'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    // UI更新
    document.getElementById("selectedPoint").textContent = 
        `スタート地点: ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`;
    
    // 片道コースの場合は終点選択を促す
    if (document.getElementById("routeType").value === "pointToPoint" && !endLocation) {
        isSelectingEndPoint = true;
    }
    
    updateGenerateButtonState();
}

function setEndLocation(location) {
    endLocation = location;
    isSelectingEndPoint = false;
    
    // 既存の終点マーカーをクリア
    if (window.endMarker) {
        window.endMarker.setMap(null);
    }

    // 新しい終点マーカーを配置
    window.endMarker = new google.maps.Marker({
        position: location,
        map: map,
        title: "終点",
        icon: {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23F44336'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    // UI更新
    document.getElementById("endPointInfo").textContent = 
        `終点: ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`;
    
    updateGenerateButtonState();
}

function updateGenerateButtonState() {
    const routeType = document.getElementById("routeType").value;
    const generateBtn = document.getElementById("generateRoute");
    
    if (routeType === "loop" || routeType === "outAndBack") {
        generateBtn.disabled = !selectedLocation;
    } else if (routeType === "pointToPoint") {
        generateBtn.disabled = !selectedLocation || !endLocation;
    }
}

function generateJoggingRoute() {
    const routeType = document.getElementById("routeType").value;
    
    if (!selectedLocation) {
        alert("スタート地点を選択してください");
        return;
    }

    if (routeType === "pointToPoint" && !endLocation) {
        alert("終点を選択してください");
        return;
    }

    const targetDistance = parseFloat(document.getElementById("distance").value);
    if (!targetDistance || targetDistance < 0.5) {
        alert("距離は0.5km以上で入力してください");
        return;
    }

    // ボタンを無効化してローディング表示
    const generateBtn = document.getElementById("generateRoute");
    generateBtn.textContent = "生成中...";
    updateGenerateButtonState();

    if (routeType === "loop") {
        generateLoopRoute(selectedLocation, targetDistance * 1000, (result) => {
            generateBtn.textContent = "コース生成";
            updateGenerateButtonState();
            
            if (result) {
                directionsRenderer.setDirections(result);
                currentRoute = result;
                displayRouteInfo(result);
            } else {
                alert("ルートの生成に失敗しました。別の地点または距離をお試しください。");
            }
        });
    } else if (routeType === "outAndBack") {
        generateOutAndBackRoute(selectedLocation, targetDistance * 1000, (result) => {
            generateBtn.textContent = "コース生成";
            updateGenerateButtonState();
            
            if (result) {
                directionsRenderer.setDirections(result);
                currentRoute = result;
                displayRouteInfo(result);
            } else {
                alert("ルートの生成に失敗しました。別の地点または距離をお試しください。");
            }
        });
    } else if (routeType === "pointToPoint") {
        generateOneWayRoute(selectedLocation, endLocation, targetDistance * 1000, (result) => {
            generateBtn.textContent = "コース生成";
            updateGenerateButtonState();
            
            if (result) {
                directionsRenderer.setDirections(result);
                currentRoute = result;
                displayRouteInfo(result);
            } else {
                alert("ルートの生成に失敗しました。別の地点または距離をお試しください。");
            }
        });
    }
}

// 一筆書きループ生成関数
function generateLoopRoute(center, targetDistanceMeters, callback) {
    const attempts = [
        { strategy: 'circle', points: 8 },
        { strategy: 'circle', points: 6 },
        { strategy: 'square', points: 4 },
        { strategy: 'triangle', points: 3 }
    ];

    let currentAttempt = 0;

    function tryNextStrategy() {
        if (currentAttempt >= attempts.length) {
            callback(null);
            return;
        }

        const attempt = attempts[currentAttempt];
        generateRouteWithStrategy(center, targetDistanceMeters, attempt, (result, actualDistance) => {
            const tolerance = targetDistanceMeters * 0.15;
            if (result && Math.abs(actualDistance - targetDistanceMeters) <= tolerance) {
                callback(result);
            } else {
                currentAttempt++;
                tryNextStrategy();
            }
        });
    }

    tryNextStrategy();
}

// 往復コース生成関数
function generateOutAndBackRoute(center, targetDistanceMeters, callback) {
    const distance = targetDistanceMeters / 2;
    const directions = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI];
    let currentDirection = 0;

    function tryNextDirection() {
        if (currentDirection >= directions.length) {
            callback(null);
            return;
        }

        const angle = directions[currentDirection];
        const endPoint = calculatePointFromCenter(center, distance, angle);
        
        const waypoints = [{
            location: endPoint,
            stopover: true
        }];

        const request = {
            origin: center,
            destination: center,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true
        };

        directionsService.route(request, (result, status) => {
            if (status === "OK") {
                const actualDistance = calculateRouteDistance(result);
                const tolerance = targetDistanceMeters * 0.2;
                
                if (Math.abs(actualDistance - targetDistanceMeters) <= tolerance) {
                    callback(result);
                } else {
                    currentDirection++;
                    tryNextDirection();
                }
            } else {
                currentDirection++;
                tryNextDirection();
            }
        });
    }

    tryNextDirection();
}

// 戦略別ルート生成
function generateRouteWithStrategy(center, targetDistance, strategy, callback) {
    let waypoints = [];
    let baseRadius = targetDistance / (2 * Math.PI);
    
    if (strategy.strategy === 'circle') {
        const points = strategy.points;
        for (let i = 1; i < points; i++) {
            const angle = (i * Math.PI * 2) / points;
            const point = calculatePointFromCenter(center, baseRadius, angle);
            waypoints.push({
                location: point,
                stopover: false
            });
        }
    } else if (strategy.strategy === 'square') {
        const side = Math.sqrt(targetDistance * targetDistance / 4) / 2;
        waypoints = [
            { location: calculatePointFromCenter(center, side, 0), stopover: false },
            { location: calculatePointFromCenter(center, side, Math.PI/2), stopover: false },
            { location: calculatePointFromCenter(center, side, Math.PI), stopover: false }
        ];
    } else if (strategy.strategy === 'triangle') {
        const radius = targetDistance / (3 * Math.PI / 2);
        waypoints = [
            { location: calculatePointFromCenter(center, radius, 0), stopover: false },
            { location: calculatePointFromCenter(center, radius, 2*Math.PI/3), stopover: false }
        ];
    }

    const request = {
        origin: center,
        destination: center,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            const actualDistance = calculateRouteDistance(result);
            
            const distanceRatio = targetDistance / actualDistance;
            if (Math.abs(distanceRatio - 1) > 0.3 && strategy.adjustments < 3) {
                strategy.adjustments = (strategy.adjustments || 0) + 1;
                baseRadius *= Math.sqrt(distanceRatio);
                generateRouteWithStrategy(center, targetDistance, strategy, callback);
                return;
            }
            
            callback(result, actualDistance);
        } else {
            callback(null, 0);
        }
    });
}

// 中心点から指定距離・角度の地点を計算
function calculatePointFromCenter(center, distance, angle) {
    const earthRadius = 6371000;
    const lat1 = center.lat() * Math.PI / 180;
    const lng1 = center.lng() * Math.PI / 180;
    
    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distance / earthRadius) +
        Math.cos(lat1) * Math.sin(distance / earthRadius) * Math.cos(angle)
    );
    
    const lng2 = lng1 + Math.atan2(
        Math.sin(angle) * Math.sin(distance / earthRadius) * Math.cos(lat1),
        Math.cos(distance / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    return {
        lat: lat2 * 180 / Math.PI,
        lng: lng2 * 180 / Math.PI
    };
}

// ルートの距離を計算
function calculateRouteDistance(result) {
    let totalDistance = 0;
    for (let i = 0; i < result.routes[0].legs.length; i++) {
        totalDistance += result.routes[0].legs[i].distance.value;
    }
    return totalDistance;
}

// 片道ルート生成
function generateOneWayRoute(start, end, targetDistance, callback) {
    const directDistance = calculateDirectDistance(start, end);
    
    if (directDistance >= targetDistance * 0.9) {
        const request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true
        };
        
        directionsService.route(request, (result, status) => {
            if (status === "OK") {
                callback(result);
            } else {
                callback(null);
            }
        });
    } else {
        generateDetourRoute(start, end, targetDistance, callback);
    }
}

// 迂回ルート生成
function generateDetourRoute(start, end, targetDistance, callback) {
    const directDistance = calculateDirectDistance(start, end);
    const extraDistance = targetDistance - directDistance;
    
    const midPoint = calculateMidpoint(start, end);
    const detourRadius = extraDistance / (2 * Math.PI);
    
    const angle = calculateBearing(start, end) + Math.PI / 2;
    const detourPoint = calculatePointFromCenter(midPoint, detourRadius, angle);
    
    const waypoints = [{
        location: detourPoint,
        stopover: false
    }];
    
    const request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true,
        avoidTolls: true
    };
    
    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            callback(result);
        } else {
            generateOneWayRoute(start, end, directDistance, callback);
        }
    });
}

// 2点間の直線距離を計算
function calculateDirectDistance(point1, point2) {
    const R = 6371000;
    const lat1 = point1.lat() * Math.PI / 180;
    const lat2 = point2.lat() * Math.PI / 180;
    const deltaLat = (point2.lat() - point1.lat()) * Math.PI / 180;
    const deltaLng = (point2.lng() - point1.lng()) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

// 2点の中点を計算
function calculateMidpoint(point1, point2) {
    const lat = (point1.lat() + point2.lat()) / 2;
    const lng = (point1.lng() + point2.lng()) / 2;
    return { lat: lat, lng: lng };
}

// 方位角を計算
function calculateBearing(point1, point2) {
    const lat1 = point1.lat() * Math.PI / 180;
    const lat2 = point2.lat() * Math.PI / 180;
    const deltaLng = (point2.lng() - point1.lng()) * Math.PI / 180;
    
    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    return Math.atan2(x, y);
}

function displayRouteInfo(route) {
    const totalDistance = route.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);
    const targetDistance = parseFloat(document.getElementById("distance").value) * 1000;
    
    const accuracy = (1 - Math.abs(totalDistance - targetDistance) / targetDistance) * 100;
    const accuracyColor = accuracy >= 85 ? '#4CAF50' : accuracy >= 70 ? '#FF9800' : '#F44336';
    
    const selectedRouteType = document.getElementById("routeType").value;
    const legs = route.routes[0].legs.length;
    let routeType = '';
    
    if (selectedRouteType === 'loop') {
        if (legs <= 3) routeType = '三角形ループ';
        else if (legs <= 4) routeType = '四角形ループ';
        else if (legs <= 6) routeType = '六角形ループ';
        else routeType = '円形ループ';
    } else if (selectedRouteType === 'outAndBack') {
        routeType = '往復コース';
    } else if (selectedRouteType === 'pointToPoint') {
        if (legs === 1) routeType = '直線コース';
        else routeType = '迂回コース';
    }

    const routeInfo = document.getElementById("routeInfo");
    const routeDetails = document.getElementById("routeDetails");
    
    routeDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <p><strong>📏 総距離:</strong> ${(totalDistance / 1000).toFixed(2)} km</p>
                <p><strong>🎯 目標:</strong> ${(targetDistance / 1000).toFixed(1)} km</p>
                <p><strong>⏱️ 予想時間:</strong> ${Math.round(totalDuration / 60)} 分</p>
            </div>
            <div>
                <p><strong>🏃 平均ペース:</strong> ${((totalDuration / 60) / (totalDistance / 1000)).toFixed(1)} 分/km</p>
                <p><strong>📍 ルート形状:</strong> ${routeType}</p>
                <p><strong>🎯 精度:</strong> <span style="color: ${accuracyColor}; font-weight: bold;">${accuracy.toFixed(1)}%</span></p>
            </div>
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #f0f7ff; border-radius: 5px; font-size: 14px;">
            <strong>💡 ヒント:</strong> 
            ${accuracy >= 85 ? '素晴らしい！目標距離にとても近いルートです。' :
              accuracy >= 70 ? '良好です。もう少し精度の高いルートをお求めの場合は「コース生成」を再実行してください。' :
              '精度が低めです。別の地点や距離を試すか、「コース生成」を再実行してください。'}
        </div>
    `;
    
    routeInfo.style.display = "block";
}

function clearRoute() {
    if (directionsRenderer) {
        directionsRenderer.setDirections({routes: []});
    }
    if (window.startMarker) {
        window.startMarker.setMap(null);
        window.startMarker = null;
    }
    if (window.endMarker) {
        window.endMarker.setMap(null);
        window.endMarker = null;
    }
    
    selectedLocation = null;
    endLocation = null;
    currentRoute = null;
    isSelectingEndPoint = false;
    
    document.getElementById("selectedPoint").textContent = "地図上をクリックしてスタート地点を選択してください";
    document.getElementById("endPointInfo").textContent = "地図上をもう一度クリックして終点を選択してください";
    document.getElementById("endPointInfo").style.display = "none";
    updateGenerateButtonState();
    document.getElementById("routeInfo").style.display = "none";
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("generateRoute").addEventListener("click", generateJoggingRoute);
    document.getElementById("clearRoute").addEventListener("click", clearRoute);

    // Enterキーでルート生成
    document.getElementById("distance").addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !document.getElementById("generateRoute").disabled) {
            generateJoggingRoute();
        }
    });
});

// Google Maps API初期化関数をグローバルに公開
window.initMap = initMap;